import { apiGet } from '@shared/api/client';

/**
 * Lookup options for the admin form selects. The public gallery derives its
 * filter options from the paintings it already loaded; the admin form writes
 * real records, so it needs the backend's **numeric ids** instead.
 */
export interface LookupOption {
  id: number;
  label: string;
}

interface Envelope<T> {
  data: T[];
}

const fetchNamed = (path: string): Promise<LookupOption[]> =>
  apiGet<Envelope<{ id: number; name: string }>>(`${path}?limit=100`).then((r) =>
    r.data.map((x) => ({ id: x.id, label: x.name })),
  );

const fetchPeople = (path: string): Promise<LookupOption[]> =>
  apiGet<Envelope<{ id: number; firstName: string; lastName: string }>>(
    `${path}?limit=100`,
  ).then((r) => r.data.map((x) => ({ id: x.id, label: `${x.firstName} ${x.lastName}` })));

export const lookupsService = {
  techniques: () => fetchNamed('/techniques'),
  materials: () => fetchNamed('/materials'),
  cities: () => fetchNamed('/cities'),
  owners: () => fetchPeople('/owners'),
  artists: () => fetchPeople('/artists'),
  /** Currencies carry a symbol — label as "TRY (₺)". */
  currencies: () =>
    apiGet<Envelope<{ id: number; name: string; symbol: string }>>('/currencies?limit=100').then(
      (r) => r.data.map((x) => ({ id: x.id, label: `${x.name} (${x.symbol})` })),
    ),
};
