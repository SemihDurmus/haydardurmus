import { apiDelete, apiGet, apiPost } from '@shared/api/client';

/**
 * Admin operations on the prices resource (backend shape: numeric ids,
 * Decimal amounts serialized as strings). POSTing a price makes it the
 * painting's CURRENT price — the backend demotes the previous one atomically.
 */
export interface RawPrice {
  id: number;
  paintingId: number;
  currencyId: number;
  amount: string;
  effectiveDate: string;
  isCurrent: boolean;
  createdAt: string;
  currency?: { id: number; name: string; symbol: string };
}

export interface PriceInput {
  paintingId: number;
  currencyId: number;
  amount: number;
  /** YYYY-MM-DD; backend defaults to today when omitted. */
  effectiveDate?: string;
}

interface Envelope<T> {
  data: T[];
}

export const adminPricesService = {
  /** Full price history for one painting, newest effective date first. */
  listForPainting: (paintingId: number | string) =>
    apiGet<Envelope<RawPrice>>(`/prices?paintingId=${paintingId}&limit=100`).then((r) => r.data),

  /** Add a new price — it becomes the current price. */
  create: (input: PriceInput) => apiPost<RawPrice>('/prices', input),

  /** Delete a price row from the history. */
  remove: (id: number) => apiDelete(`/prices/${id}`),
};
