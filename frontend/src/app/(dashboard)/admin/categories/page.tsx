import { Tags } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { requireSessionRole } from '@/services/session';
import { fetchCategories } from '@/services/categories';
import { CategoryManager } from './CategoryManager';

export const dynamic = 'force-dynamic';

const CategoriesPage = async () => {
  await requireSessionRole('admin');

  const { categories } = await fetchCategories({ limit: 200 });

  return (
    <DashboardLayout
      title="Categories"
      overview="Course taxonomy"
      subtitle="Add, rename, and toggle categories. Deactivating a category unpublishes every course under it."
    >
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-100 bg-white p-10 text-center dark:border-ink-700 dark:bg-ink-900">
          <Tags className="mx-auto h-9 w-9 text-ink-300" />
          <h3 className="mt-3 text-base font-semibold text-ink-900 dark:text-ink-100">
            No categories yet
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            Add your first taxonomy entry from the form below.
          </p>
          <div className="mt-6">
            <CategoryManager categories={[]} />
          </div>
        </div>
      ) : (
        <CategoryManager categories={categories} />
      )}
    </DashboardLayout>
  );
};

export default CategoriesPage;
