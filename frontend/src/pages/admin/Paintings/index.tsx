import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { buildRoute } from '@app/router/routes';
import { Button } from '@shared/ui/Button';
import { ApiError } from '@shared/api/client';
import { useToast } from '@shared/ui/feedback/ToastProvider';
import { useConfirm } from '@shared/ui/feedback/ConfirmProvider';
import { useAllPaintings } from '@domains/paintings/hooks/usePaintings';
import {
  useDeletePainting,
  useSetPaintingAvailable,
} from '@domains/paintings/hooks/useAdminPaintings';
import type { Painting } from '@domains/paintings/types';

const PAGE_SIZE = 10;

function dimensions(p: Painting): string {
  if (p.radius != null) return `⌀ ${p.radius} cm`;
  if (p.width != null && p.height != null) return `${p.width} × ${p.height} cm`;
  return '—';
}

function AvailabilityToggle({ painting }: { painting: Painting }) {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();
  const setAvailable = useSetPaintingAvailable();
  const isAvailable = painting.availability === 'for_sale';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isAvailable}
      aria-label={t('paintings.available')}
      disabled={setAvailable.isPending}
      onClick={() =>
        setAvailable
          .mutateAsync({ id: painting.id, isAvailable: !isAvailable })
          .catch((err) =>
            showToast(
              err instanceof ApiError ? err.message : t('paintings.availabilityFailed'),
              'error',
            ),
          )
      }
      className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
        isAvailable ? 'bg-primary-700' : 'bg-border'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          isAvailable ? 'left-4' : 'left-0.5'
        }`}
      />
    </button>
  );
}

const columnHelper = createColumnHelper<Painting>();

export default function AdminPaintingsPage() {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { data: paintings, isLoading } = useAllPaintings();
  const del = useDeletePainting();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  async function handleDelete(p: Painting) {
    const label = p.paintingName ?? `No. ${p.paintingNo}`;
    const ok = await confirm({
      title: t('common.confirmTitle'),
      message: t('paintings.deleteConfirm', { name: label }),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    });
    if (!ok) return;
    try {
      await del.mutateAsync(p.id);
      showToast(t('common.deletedToast'));
    } catch (err) {
      // Backend returns 400 if the painting still has images or prices.
      showToast(err instanceof ApiError ? err.message : t('common.deleteFailed'), 'error');
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'thumb',
        header: '',
        cell: ({ row }) => {
          const src = row.original.images?.[0]?.src;
          return src ? (
            <img src={src} alt="" className="h-12 w-9 border border-border object-cover" />
          ) : (
            <div className="h-12 w-9 border border-border bg-muted" />
          );
        },
      }),
      columnHelper.accessor('paintingNo', {
        header: t('paintings.no'),
        cell: (info) => (
          <span className="font-medium text-text-primary">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor((p) => p.paintingName ?? '', {
        id: 'name',
        header: t('paintings.name'),
        cell: ({ row }) =>
          row.original.paintingName ?? <span className="text-text-tertiary">{t('common.untitled')}</span>,
      }),
      columnHelper.accessor('year', {
        header: t('paintings.year'),
        sortUndefined: 'last',
        cell: (info) => info.getValue() ?? '—',
      }),
      columnHelper.display({
        id: 'dimensions',
        header: t('paintings.dimensions'),
        cell: ({ row }) => dimensions(row.original),
      }),
      columnHelper.display({
        id: 'available',
        header: t('paintings.available'),
        cell: ({ row }) => <AvailabilityToggle painting={row.original} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="block text-right">{t('common.actions')}</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-3">
            <Link
              to={buildRoute.paintingDetail(row.original.id)}
              className="text-text-tertiary hover:underline"
            >
              {t('common.view')}
            </Link>
            <Link
              to={`/admin/paintings/${row.original.id}/edit`}
              className="text-primary-700 hover:underline"
            >
              {t('common.edit')}
            </Link>
            <button
              onClick={() => void handleDelete(row.original)}
              disabled={del.isPending}
              className="text-red-600 hover:underline disabled:opacity-50"
            >
              {t('common.delete')}
            </button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [del.isPending, t],
  );

  // react-table v8's table instance is intentionally mutable, which the React
  // compiler lint can't verify — a known, documented incompatibility.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: paintings ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    // Search matches painting number and name.
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const q = filterValue.trim().toLowerCase();
      if (!q) return true;
      const p = row.original;
      return (
        p.paintingNo.toLowerCase().includes(q) ||
        (p.paintingName ?? '').toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  });

  const total = paintings?.length ?? 0;
  const filtered = table.getFilteredRowModel().rows.length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-text-primary">{t('paintings.title')}</h1>
          <p className="text-body-sm text-text-tertiary">
            {paintings
              ? filtered === total
                ? t('paintings.total', { count: total })
                : t('paintings.filteredOf', { filtered, total })
              : ' '}
          </p>
        </div>
        <Button as={Link} to="/admin/paintings/new" variant="primary" size="sm">
          {t('paintings.new')}
        </Button>
      </div>

      <div className="mb-4">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={t('paintings.searchPlaceholder')}
          className="w-full max-w-xs border border-border bg-white px-3 py-2 font-sans text-body-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-400 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <p className="text-body-sm text-text-tertiary">{t('common.loading')}</p>
      ) : (
        <>
          <div className="overflow-x-auto border border-border bg-white">
            <table className="w-full text-left text-body-sm">
              <thead className="border-b border-border bg-muted/40 text-label uppercase tracking-wide text-text-tertiary">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const dir = header.column.getIsSorted();
                      return (
                        <th key={header.id} className="px-4 py-3">
                          {canSort ? (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className="flex items-center gap-1 uppercase tracking-wide hover:text-text-primary"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <span aria-hidden>{dir === 'asc' ? '▲' : dir === 'desc' ? '▼' : ''}</span>
                            </button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 text-text-secondary">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {filtered === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-6 text-center text-text-tertiary">
                      {total === 0 ? t('paintings.empty') : t('paintings.noMatch')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {table.getPageCount() > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                {t('common.previous')}
              </Button>
              <span className="text-body-sm text-text-tertiary">
                {t('common.pageOf', {
                  page: table.getState().pagination.pageIndex + 1,
                  total: table.getPageCount(),
                })}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
