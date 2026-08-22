import { useTranslation } from 'react-i18next';
import { X, SlidersHorizontal } from 'lucide-react';
import { Typography } from '@shared/ui/Typography';
import { cn } from '@shared/utils/cn';
import type { usePaintingFilters } from '../hooks/usePaintingFilters';
import { resolveLookupOptions } from '../utils/filters';
import type { PaintingFilterOptions } from '../types';

type FilterHook = ReturnType<typeof usePaintingFilters>;

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  showRemoveIcon?: boolean;
}

function FilterChip({ label, active, onClick, showRemoveIcon = true }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1',
        'font-sans text-label uppercase tracking-wide transition-all duration-150',
        active
          ? 'border-primary-900 bg-primary-900 text-text-inverted'
          : 'border-border bg-transparent text-text-secondary hover:border-primary-400 hover:text-text-primary'
      )}
    >
      {label}
      {active && showRemoveIcon && <X className="h-2.5 w-2.5 shrink-0" />}
    </button>
  );
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div className="border-b border-border py-5">
      <Typography level="overline" tone="tertiary" className="mb-3 block">
        {title}
      </Typography>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

interface PaintingFilterPanelProps {
  filterHook: FilterHook;
  filterOptions: PaintingFilterOptions | undefined;
  className?: string;
}

export function PaintingFilterPanel({
  filterHook,
  filterOptions,
  className,
}: PaintingFilterPanelProps) {
  const { t, i18n } = useTranslation('paintings');
  const locale = (i18n.language?.split('-')[0] ?? 'en') as 'en' | 'tr';
  const { filters, toggleMultiFilter, clearFilters, activeFilterCount, setFilter } = filterHook;

  // Options come from the backend's filter facets endpoint, labelled in the
  // active locale — no technique or material list is hardcoded in this
  // codebase, and the facets cover every painting, not just a loaded page.
  const techniqueOptions = resolveLookupOptions(filterOptions?.techniques ?? [], locale);
  const materialOptions = resolveLookupOptions(filterOptions?.materials ?? [], locale);
  const { yearMin: yearFloor, yearMax: yearCeil } = filterOptions ?? { yearMin: null, yearMax: null };

  return (
    <aside className={cn('', className)}>
      {/* Panel header — mobile: clear; desktop: filter title + clear */}
      <div className="flex items-center justify-end pb-4 lg:hidden">
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="shrink-0 font-sans text-body-sm text-text-tertiary transition-colors hover:text-text-primary"
          >
            {t('filters.clear')}
          </button>
        )}
      </div>
      <div className="hidden items-center justify-between pb-4 lg:flex">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-text-tertiary" />
          <Typography level="label">{t('filters.title')}</Typography>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-900 font-sans text-caption text-text-inverted">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="font-sans text-body-sm text-text-tertiary transition-colors hover:text-text-primary"
          >
            {t('filters.clear')}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder={t('filters.search')}
          value={filters.search}
          onChange={(e) => filterHook.setFilter('search', e.target.value)}
          className={cn(
            'w-full border border-border bg-background px-4 py-2.5',
            'font-sans text-body-sm text-text-primary placeholder:text-text-tertiary',
            'transition-colors focus:border-primary-400 focus:outline-none'
          )}
        />
      </div>

      {/* Year — a from/to range instead of one chip per year, since the
          catalogue spans decades and a chip-per-year list would be unusable. */}
      {yearFloor !== null && yearCeil !== null && (
        <FilterSection title={t('filters.year')}>
          <div className="flex w-full items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={yearFloor}
              max={yearCeil}
              placeholder={String(yearFloor)}
              value={filters.yearMin ?? ''}
              onChange={(e) =>
                setFilter('yearMin', e.target.value === '' ? null : Number(e.target.value))
              }
              className={cn(
                'w-0 min-w-0 flex-1 border border-border bg-background px-2.5 py-2',
                'font-sans text-body-sm text-text-primary placeholder:text-text-tertiary',
                'transition-colors focus:border-primary-400 focus:outline-none'
              )}
            />
            <span className="shrink-0 text-text-tertiary">–</span>
            <input
              type="number"
              inputMode="numeric"
              min={yearFloor}
              max={yearCeil}
              placeholder={String(yearCeil)}
              value={filters.yearMax ?? ''}
              onChange={(e) =>
                setFilter('yearMax', e.target.value === '' ? null : Number(e.target.value))
              }
              className={cn(
                'w-0 min-w-0 flex-1 border border-border bg-background px-2.5 py-2',
                'font-sans text-body-sm text-text-primary placeholder:text-text-tertiary',
                'transition-colors focus:border-primary-400 focus:outline-none'
              )}
            />
          </div>
        </FilterSection>
      )}

      {/* Technique */}
      <FilterSection title={t('filters.technique')}>
        <FilterChip
          label={t('filters.all')}
          active={filters.techniqueIds.length === 0}
          showRemoveIcon={false}
          onClick={() => setFilter('techniqueIds', [])}
        />
        {techniqueOptions.map((tech) => (
          <FilterChip
            key={tech.id}
            label={tech.label}
            active={filters.techniqueIds.includes(tech.id)}
            onClick={() => toggleMultiFilter('techniqueIds', tech.id)}
          />
        ))}
      </FilterSection>

      {/* Material */}
      <FilterSection title={t('filters.material')}>
        <FilterChip
          label={t('filters.all')}
          active={filters.materialIds.length === 0}
          showRemoveIcon={false}
          onClick={() => setFilter('materialIds', [])}
        />
        {materialOptions.map((mat) => (
          <FilterChip
            key={mat.id}
            label={mat.label}
            active={filters.materialIds.includes(mat.id)}
            onClick={() => toggleMultiFilter('materialIds', mat.id)}
          />
        ))}
      </FilterSection>
    </aside>
  );
}
