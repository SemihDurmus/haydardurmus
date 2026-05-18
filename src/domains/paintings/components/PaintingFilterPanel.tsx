import { useTranslation } from 'react-i18next';
import { X, SlidersHorizontal } from 'lucide-react';
import { Typography } from '@shared/ui/Typography';
import { cn } from '@shared/utils/cn';
import type { usePaintingFilters } from '../hooks/usePaintingFilters';
import { techniques, materials, cities } from '../data/lookups';
import { extractYears } from '../utils/filters';
import type { Painting } from '../types';

type FilterHook = ReturnType<typeof usePaintingFilters>;

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1',
        'font-sans text-label uppercase tracking-wider transition-all duration-150',
        active
          ? 'border-primary-900 bg-primary-900 text-text-inverted'
          : 'border-border bg-transparent text-text-secondary hover:border-primary-400 hover:text-text-primary'
      )}
    >
      {label}
      {active && <X className="h-2.5 w-2.5" />}
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
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

interface PaintingFilterPanelProps {
  filterHook: FilterHook;
  allPaintings: Painting[];
  className?: string;
}

export function PaintingFilterPanel({
  filterHook,
  allPaintings,
  className,
}: PaintingFilterPanelProps) {
  const { t, i18n } = useTranslation('paintings');
  const locale = (i18n.language?.split('-')[0] ?? 'en') as 'en' | 'tr';
  const { filters, toggleMultiFilter, clearFilters, activeFilterCount } = filterHook;

  const availableYears = extractYears(allPaintings);

  return (
    <aside className={cn('', className)}>
      {/* Panel header */}
      <div className="flex items-center justify-between pb-4">
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

      {/* Year */}
      {availableYears.length > 0 && (
        <FilterSection title={t('filters.year')}>
          {availableYears.map((year) => (
            <FilterChip
              key={year}
              label={String(year)}
              active={filters.years.includes(year)}
              onClick={() => toggleMultiFilter('years', year)}
            />
          ))}
        </FilterSection>
      )}

      {/* Technique */}
      <FilterSection title={t('filters.technique')}>
        {techniques.map((tech) => (
          <FilterChip
            key={tech.id}
            label={locale === 'tr' && tech.labelTr ? tech.labelTr : tech.label}
            active={filters.techniqueIds.includes(tech.id)}
            onClick={() => toggleMultiFilter('techniqueIds', tech.id)}
          />
        ))}
      </FilterSection>

      {/* Material */}
      <FilterSection title={t('filters.material')}>
        {materials.map((mat) => (
          <FilterChip
            key={mat.id}
            label={locale === 'tr' && mat.labelTr ? mat.labelTr : mat.label}
            active={filters.materialIds.includes(mat.id)}
            onClick={() => toggleMultiFilter('materialIds', mat.id)}
          />
        ))}
      </FilterSection>

      {/* Location */}
      <FilterSection title={t('filters.location')}>
        {cities.map((city) => (
          <FilterChip
            key={city.id}
            label={locale === 'tr' && city.labelTr ? city.labelTr : city.label}
            active={filters.locationCityIds.includes(city.id)}
            onClick={() => toggleMultiFilter('locationCityIds', city.id)}
          />
        ))}
      </FilterSection>
    </aside>
  );
}
