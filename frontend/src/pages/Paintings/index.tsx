import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { Button } from '@shared/ui/Button';
import { PaintingGrid } from '@domains/paintings/components/PaintingGrid';
import { PaintingFilterPanel } from '@domains/paintings/components/PaintingFilterPanel';
import { usePaintings, usePaintingFilterOptions } from '@domains/paintings/hooks/usePaintings';
import { usePaintingFilters } from '@domains/paintings/hooks/usePaintingFilters';
import { PageTitle, SectionTitle, Pagination } from '@/shared/ui';

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: 'year_desc', labelKey: 'sort.newest' },
  { value: 'year_asc', labelKey: 'sort.oldest' },
  { value: 'no_asc', labelKey: 'sort.numberAsc' },
  { value: 'no_desc', labelKey: 'sort.numberDesc' },
  { value: 'name_asc', labelKey: 'sort.nameAsc' },
  { value: 'name_desc', labelKey: 'sort.nameDesc' },
  { value: 'size_desc', labelKey: 'sort.sizeDesc' },
  { value: 'size_asc', labelKey: 'sort.sizeAsc' },
] as const;

export default function PaintingsPage() {
  const { t } = useTranslation('paintings');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterHook = usePaintingFilters();
  const { data, isLoading } = usePaintings(
    filterHook.filters,
    filterHook.sort,
    filterHook.page,
    PAGE_SIZE,
  );
  const paintings = data?.items ?? [];
  const { data: filterOptions } = usePaintingFilterOptions();

  const totalPages = data?.pagination.totalPages ?? 1;
  const currentPage = Math.min(data?.pagination.page ?? filterHook.page, totalPages);

  const handlePageChange = (page: number) => {
    filterHook.setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Page header */}
      <Section spacing="none" background="default" className="pb-4 pt-6 md:pt-section-sm">
        <Container width="wide">
          <div>
            <PageTitle className="mb-4">{t('page.title')}</PageTitle>
            <SectionTitle style={{ marginBottom: 0 }}>{t('page.subtitle')}</SectionTitle>
          </div>
        </Container>
      </Section>
      {/* Content */}
      <Section spacing="md" background="default" className="pt-8">
        <Container width="wide">
          {/* Mobile: filter + sort */}
          <div className="flex items-center justify-between border-b border-border pb-4 lg:hidden">
            <Button variant="secondary" size="sm" onClick={() => setFilterPanelOpen((v) => !v)}>
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t('filters.title')}
              {filterHook.activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-900 text-caption text-text-inverted">
                  {filterHook.activeFilterCount}
                </span>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Typography level="label" tone="tertiary">
                {t('sort.label')}
              </Typography>
              <select
                value={filterHook.sort}
                onChange={(e) =>
                  filterHook.setSort(e.target.value as Parameters<typeof filterHook.setSort>[0])
                }
                className="border-0 bg-transparent font-sans text-body-sm text-text-primary focus:outline-none"
              >
                {SORT_OPTIONS.map(({ value, labelKey }) => (
                  <option key={value} value={value}>
                    {t(labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop: sort, right-aligned */}
          <div className="hidden items-center justify-end border-b border-border pb-6 lg:flex">
            <div className="flex items-center gap-2">
              <Typography level="label" tone="tertiary" className="leading-none">
                {t('sort.label')}
              </Typography>
              <select
                value={filterHook.sort}
                onChange={(e) =>
                  filterHook.setSort(e.target.value as Parameters<typeof filterHook.setSort>[0])
                }
                className="border-0 bg-transparent font-sans text-body-sm leading-none text-text-primary focus:outline-none"
              >
                {SORT_OPTIONS.map(({ value, labelKey }) => (
                  <option key={value} value={value}>
                    {t(labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-6 lg:mt-8 lg:flex-row lg:gap-10">
            {/* Filter panel — stacked above grid on mobile, sidebar on lg+ */}
            <aside
              className={`w-full shrink-0 lg:w-56 ${filterPanelOpen ? 'block' : 'hidden lg:block'}`}
            >
              <PaintingFilterPanel filterHook={filterHook} filterOptions={filterOptions} />
            </aside>

            {/* Grid */}
            <div className="min-w-0 flex-1">
              <PaintingGrid paintings={paintings} isLoading={isLoading} columns={3} />
              {!isLoading && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-10"
                />
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
