import type { ReactNode } from 'react';
import { cn } from '@/utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  rowKey: (row: T) => string;
}

export const DataTable = <T,>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No records found',
}: DataTableProps<T>) => (
  <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card dark:border-ink-700 dark:bg-ink-900">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-ink-100 text-sm dark:divide-ink-700">
        <thead className="bg-surface-muted dark:bg-ink-900/60">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  !col.align && 'text-left',
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-ink-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="transition hover:bg-surface-muted/60 dark:hover:bg-ink-900/40">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'whitespace-nowrap px-4 py-3 text-ink-700 dark:text-ink-100',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
