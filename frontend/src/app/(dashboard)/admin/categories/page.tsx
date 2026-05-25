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
      {/* `CategoryManager` already handles both the populated table and
          the empty state (with an inline "Add your first category" CTA
          that opens the same modal). */}
      <CategoryManager categories={categories} />
    </DashboardLayout>
  );
};

export default CategoriesPage;
