import { CategoryModel } from './category.model';
import { CourseModel } from '../course/course.model';
import type { ICategory, ICategoryDocument } from './category.interface';
import { AppError } from '../../utils/AppError';
import { QueryBuilder } from '../../utils/queryBuilder';

interface CategoryWithCount extends ICategory {
  /** Number of courses currently using this category name. */
  courseCount: number;
  publishedCount: number;
}

const create = async (
  payload: Pick<ICategory, 'name' | 'description' | 'iconKey' | 'sortOrder' | 'isActive'>,
): Promise<ICategoryDocument> => {
  // Mongoose's unique index would also catch this but a friendly 409 is nicer.
  const existing = await CategoryModel.findOne({ name: payload.name });
  if (existing) throw new AppError('A category with this name already exists', 409);
  return CategoryModel.create(payload);
};

const list = async (query: Record<string, unknown>) => {
  const builder = new QueryBuilder<ICategoryDocument>(
    CategoryModel.find({}),
    query,
  )
    .search(['name', 'description'])
    .filter(['isActive'])
    .sort('sortOrder name')
    .paginate();
  const result = await builder.exec();

  // Augment each row with the matching course counts. One aggregation
  // keeps it cheap — far better than N count queries.
  const names = result.data.map((c) => c.name);
  const counts = await CourseModel.aggregate<{
    _id: string;
    courseCount: number;
    publishedCount: number;
  }>([
    { $match: { category: { $in: names } } },
    {
      $group: {
        _id: '$category',
        courseCount: { $sum: 1 },
        publishedCount: { $sum: { $cond: ['$isPublished', 1, 0] } },
      },
    },
  ]);
  const countByName = new Map(counts.map((c) => [c._id, c]));

  const data: CategoryWithCount[] = result.data.map((c) => {
    const obj = c.toJSON() as unknown as ICategory;
    const match = countByName.get(c.name);
    return {
      ...obj,
      courseCount: match?.courseCount ?? 0,
      publishedCount: match?.publishedCount ?? 0,
    };
  });

  return { data, meta: result.meta };
};

const getById = async (id: string): Promise<ICategoryDocument> => {
  const cat = await CategoryModel.findById(id);
  if (!cat) throw new AppError('Category not found', 404);
  return cat;
};

const update = async (
  id: string,
  payload: Partial<Pick<ICategory, 'name' | 'description' | 'iconKey' | 'sortOrder' | 'isActive'>>,
): Promise<ICategoryDocument> => {
  const cat = await getById(id);
  const previousName = cat.name;
  const previousActive = cat.isActive;

  if (payload.name !== undefined && payload.name !== cat.name) {
    const dup = await CategoryModel.findOne({ name: payload.name, _id: { $ne: id } });
    if (dup) throw new AppError('A category with this name already exists', 409);
    cat.name = payload.name;
    // Triggers the pre-save slug regen.
    cat.markModified('name');
  }
  if (payload.description !== undefined) cat.description = payload.description;
  if (payload.iconKey !== undefined) cat.iconKey = payload.iconKey;
  if (payload.sortOrder !== undefined) cat.sortOrder = payload.sortOrder;
  if (payload.isActive !== undefined) cat.isActive = payload.isActive;

  await cat.save();

  // Side-effects after save (so we know the new state is persisted):
  // 1. Name change → keep linked courses consistent.
  // 2. isActive flip to FALSE → cascade-unpublish linked courses (business
  //    rule requested by the product owner).
  if (payload.name !== undefined && payload.name !== previousName) {
    await CourseModel.updateMany(
      { category: previousName },
      { $set: { category: cat.name } },
    );
  }
  if (
    payload.isActive !== undefined &&
    previousActive === true &&
    payload.isActive === false
  ) {
    await CourseModel.updateMany(
      { category: cat.name },
      { $set: { isPublished: false } },
    );
  }

  return cat;
};

const setActive = async (
  id: string,
  isActive: boolean,
): Promise<{ category: ICategoryDocument; cascadedCourses: number }> => {
  const cat = await getById(id);
  const wasActive = cat.isActive;
  cat.isActive = isActive;
  await cat.save();

  let cascadedCourses = 0;
  if (wasActive === true && isActive === false) {
    const result = await CourseModel.updateMany(
      { category: cat.name },
      { $set: { isPublished: false } },
    );
    cascadedCourses = result.modifiedCount ?? 0;
  }

  return { category: cat, cascadedCourses };
};

const remove = async (id: string): Promise<void> => {
  const cat = await getById(id);
  // Block deletion when the category is still in use. Soft path: ask the
  // admin to deactivate (which cascades) rather than orphaning courses.
  const inUse = await CourseModel.countDocuments({ category: cat.name });
  if (inUse > 0) {
    throw new AppError(
      `Category is in use by ${inUse} course(s). Deactivate it instead, or reassign those courses first.`,
      409,
    );
  }
  await cat.deleteOne();
};

/**
 * Lightweight version used by the public catalog page — no pagination, no
 * counts. Only returns *active* rows so the storefront doesn't accidentally
 * surface a deactivated taxonomy.
 */
const listPublic = async (): Promise<ICategory[]> => {
  const rows = await CategoryModel.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  return rows as unknown as ICategory[];
};

export const CategoryService = {
  create,
  list,
  listPublic,
  getById,
  update,
  setActive,
  remove,
};
