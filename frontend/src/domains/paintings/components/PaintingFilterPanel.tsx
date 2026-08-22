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
        'inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5',
        'font-sans text-[0.75rem] uppercase tracking-wide transition-all duration-150',
        active
          ? 'border-primary-900 bg-primary-900 text-text-inverted'
          : 'border-border bg-transparent text-text-secondary hover:border-primary-400 hover:text-text-primary'
      )}
    >
      {label}
      {active && showRemoveIcon && <X className="h-2 w-2 shrink-0" />}
    </button>
  );
}

interface FilterSectionProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function FilterSection({ title, action, children }: FilterSectionProps) {
  return (
    <div className="border-b border-border py-5">
      <div className="mb-3 flex items-center justify-between">
        <Typography level="overline" tone="tertiary" className="block">
          {title}
        </Typography>
        {action}
      </div>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

// A single thin border in the page title's color on focus — the app-wide
// `:focus-visible` ring (globals.css) would otherwise stack a second,
// offset ring on top of this border and read as a double outline.
const FOCUS_INPUT_CLASSES =
  'transition-colors focus:border-text-title focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0';

interface PaintingFilterPanelProps {
  filterHook: FilterHook;
  filterOptions: PaintingFilterOptions | undefined;
  resultCount?: number;
  className?: string;
}

export function PaintingFilterPanel({
  filterHook,
  filterOptions,
  resultCount,
  className,
}: PaintingFilterPanelProps) {
  const { t, i18n } = useTranslation('paintings');
  const locale = (i18n.language?.split('-')[0] ?? 'en') as 'en' | 'tr';
  const { filters, toggleMultiFilter, clearFilters, clearYearRange, activeFilterCount, setFilter } =
    filterHook;
  const hasYearRange = filters.yearMin !== null || filters.yearMax !== null;

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
      <div className="hidden pb-4 lg:block">
        <div className="flex items-center justify-between">
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
        {/* Reserved height regardless of content, so the panel below doesn't
            shift up/down as this line appears and disappears with filters. */}
        <div className="mt-1 h-4">
          {activeFilterCount > 0 && resultCount !== undefined && (
            <Typography level="body-sm" className="leading-none text-text-title">
              {t('filters.resultCount', { count: resultCount })}
            </Typography>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder={t('filters.search')}
          value={filters.search}
          onChange={(e) => filterHook.setFilter('search', e.target.value)}
          className={cn(
            'w-full rounded border border-border bg-background px-4 py-2.5',
            'font-sans text-body-sm text-text-primary placeholder:text-text-tertiary',
            FOCUS_INPUT_CLASSES
          )}
        />
      </div>

      {/* Year — a from/to range instead of one chip per year, since the
          catalogue spans decades and a chip-per-year list would be unusable. */}
      {yearFloor !== null && yearCeil !== null && (
        <FilterSection
          title={t('filters.year')}
          action={
            hasYearRange && (
              <button
                onClick={clearYearRange}
                className="font-sans text-body-sm text-text-tertiary transition-colors hover:text-text-primary"
              >
                {t('filters.clearFilter')}
              </button>
            )
          }
        >
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
                'w-0 min-w-0 flex-1 rounded border border-border bg-background px-2.5 py-2',
                'font-sans text-body-sm text-text-primary placeholder:text-text-tertiary',
                FOCUS_INPUT_CLASSES
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
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  setFilter('yearMax', null);
                  return;
                }
                // The browser's spin buttons/arrow keys fill an EMPTY number
                // input to its `min` attribute regardless of direction — so
                // this field (min={yearFloor}) would jump straight to the
                // gallery's earliest year on the very first click. Typing
                // always goes through intermediate digits first, so seeing
                // the full min value appear in one shot from a null filter
                // is the spin gesture, not a keystroke — start it from the
                // top of the range instead.
                if (filters.yearMax === null && Number(raw) === yearFloor) {
                  setFilter('yearMax', yearCeil);
                  return;
                }
                setFilter('yearMax', Number(raw));
              }}
              className={cn(
                'w-0 min-w-0 flex-1 rounded border border-border bg-background px-2.5 py-2',
                'font-sans text-body-sm text-text-primary placeholder:text-text-tertiary',
                FOCUS_INPUT_CLASSES
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
