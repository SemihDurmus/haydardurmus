import { useTranslation } from 'react-i18next';
import {
  ResourceManager,
  type SelectOption,
} from '@domains/admin/components/ResourceManager';
import { useResourceList, type ResourceItem } from '@domains/admin/hooks/useResource';

const opts = (
  items: ResourceItem[] | undefined,
  toLabel: (i: ResourceItem) => string,
): SelectOption[] => (items ?? []).map((i) => ({ id: i.id, label: toLabel(i) }));

const name = (i: ResourceItem) => String(i.name ?? '');
const person = (i: ResourceItem) => `${String(i.firstName ?? '')} ${String(i.lastName ?? '')}`.trim();

export default function AdminLibraryPage() {
  const { t } = useTranslation('admin');
  // Lists needed to populate the foreign-key selects below.
  const countries = useResourceList('countries');
  const nationalities = useResourceList('nationalities');
  const cities = useResourceList('cities');

  const countryOpts = opts(countries.data, name);
  const nationalityOpts = opts(nationalities.data, name);
  const cityOpts = opts(cities.data, name);

  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl text-text-primary">{t('library.title')}</h1>
      <p className="mb-6 text-body-sm text-text-tertiary">
        {t('library.subtitle')}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ResourceManager
          title={t('library.artists')}
          resource="artists"
          toLabel={person}
          fields={[
            { name: 'firstName', label: t('library.fields.firstName'), required: true },
            { name: 'lastName', label: t('library.fields.lastName'), required: true },
            { name: 'nationalityId', label: t('library.fields.nationality'), type: 'select', options: nationalityOpts, required: true },
            { name: 'birthdate', label: t('library.fields.birthdate'), type: 'date' },
          ]}
        />

        <ResourceManager
          title={t('library.owners')}
          resource="owners"
          toLabel={person}
          fields={[
            { name: 'firstName', label: t('library.fields.firstName'), required: true },
            { name: 'lastName', label: t('library.fields.lastName'), required: true },
            { name: 'cityId', label: t('library.fields.city'), type: 'select', options: cityOpts },
            { name: 'nationalityId', label: t('library.fields.nationality'), type: 'select', options: nationalityOpts },
          ]}
        />

        <ResourceManager
          title={t('library.techniques')}
          resource="techniques"
          toLabel={name}
          fields={[{ name: 'name', label: t('library.fields.name'), required: true }]}
        />

        <ResourceManager
          title={t('library.materials')}
          resource="materials"
          toLabel={name}
          fields={[{ name: 'name', label: t('library.fields.name'), required: true }]}
        />

        <ResourceManager
          title={t('library.countries')}
          resource="countries"
          toLabel={name}
          fields={[{ name: 'name', label: t('library.fields.name'), required: true }]}
        />

        <ResourceManager
          title={t('library.cities')}
          resource="cities"
          toLabel={(c) => `${name(c)}`}
          fields={[
            { name: 'name', label: t('library.fields.name'), required: true },
            { name: 'countryId', label: t('library.fields.country'), type: 'select', options: countryOpts, required: true },
          ]}
        />

        <ResourceManager
          title={t('library.nationalities')}
          resource="nationalities"
          toLabel={name}
          fields={[{ name: 'name', label: t('library.fields.name'), required: true }]}
        />

        <ResourceManager
          title={t('library.currencies')}
          resource="currencies"
          toLabel={(c) => `${name(c)} (${String(c.symbol ?? '')})`}
          fields={[
            { name: 'name', label: t('library.fields.code'), required: true },
            { name: 'symbol', label: t('library.fields.symbol'), required: true },
          ]}
        />
      </div>
    </div>
  );
}
