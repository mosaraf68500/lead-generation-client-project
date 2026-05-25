import type { FilterQuery } from 'mongoose';
import { UserModel } from './user.model';
import type { IUser, IUserDocument } from './user.interface';
import { AppError } from '../../utils/AppError';
import { QueryBuilder } from '../../utils/queryBuilder';
import type { UserRole } from '../../types/common.types';

type UpdatableProfileFields = Pick<IUser, 'name' | 'phone' | 'avatar' | 'bio' | 'country'>;

const list = async (query: Record<string, unknown>) => {
  const builder = new QueryBuilder<IUserDocument>(
    UserModel.find({} as FilterQuery<IUserDocument>),
    query,
  )
    .search(['name', 'email'])
    .filter(['role'])
    .sort('-createdAt')
    .selectFields()
    .paginate();
  return builder.exec();
};

const getById = async (id: string) => {
  const user = await UserModel.findById(id).lean();
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const updateProfile = async (
  userId: string,
  updates: Partial<UpdatableProfileFields>,
): Promise<IUserDocument> => {
  const user = await UserModel.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const setRole = async (userId: string, role: UserRole): Promise<IUserDocument> => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true },
  );
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const remove = async (userId: string): Promise<void> => {
  const result = await UserModel.findByIdAndDelete(userId);
  if (!result) throw new AppError('User not found', 404);
  // NOTE: deleting auth-side records (sessions, accounts) is left to the
  // Better Auth admin endpoints; we only drop the profile here.
};

export const UserService = {
  list,
  getById,
  updateProfile,
  setRole,
  remove,
};
