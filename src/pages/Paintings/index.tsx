import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { Button } from '@shared/ui/Button';
import { PaintingGrid } from '@domains/paintings/components/PaintingGrid';
import { PaintingFilterPanel } from '@domains/paintings/components/PaintingFilterPanel';
import { usePaintings } from '@domains/paintings/hooks/usePaintings';
import { usePaintingFilters } from '@domains/paintings/hooks/usePaintingFilters';
import { mockPaintings } from '@domains/paintings/data/mockPaintings';

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
  const { data: paintings, isLoading } = usePaintings(filterHook.filters, filterHook.sort);

  return (
    <>
      {/* Page header */}
      <Section spacing="sm" background="default" className="border-b border-border">
        <Container width="wide">
          <div className="py-8">
            <Typography level="overline" tone="tertiary" className="mb-2 block">
              {t('page.subtitle')}
            </Typography>
            <div className="flex items-end justify-between gap-4">
              <Typography level="h1">{t('page.title')}</Typography>
              {paintings && (
                <Typography level="body-sm" tone="tertiary">
                  {paintings.length} {t('page.count', { count: paintings.length })}
                </Typography>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Content */}
      <Section spacing="md" background="default">
        <Container width="wide">
          <div className="flex items-center justify-between border-b border-border pb-6">
            {/* Mobile filter toggle */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilterPanelOpen((v) => !v)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t('filters.title')}
              {filterHook.activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-900 text-caption text-text-inverted">
                  {filterHook.activeFilterCount}
                </span>
              )}
            </Button>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-2">
              <Typography level="label" tone="tertiary">
                {t('sort.label')}
              </Typography>
              <select
                value={filterHook.sort}
                onChange={(e) => filterHook.setSort(e.target.value as Parameters<typeof filterHook.setSort>[0])}
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

          <div className="mt-8 flex gap-10">
            {/* Filter panel — desktop always visible, mobile drawer */}
            <aside className={`w-56 shrink-0 ${filterPanelOpen ? 'block' : 'hidden lg:block'}`}>
              <PaintingFilterPanel
                filterHook={filterHook}
                allPaintings={mockPaintings}
              />
            </aside>

            {/* Grid */}
            <div className="min-w-0 flex-1">
              <PaintingGrid
                paintings={paintings ?? []}
                isLoading={isLoading}
                columns={3}
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
