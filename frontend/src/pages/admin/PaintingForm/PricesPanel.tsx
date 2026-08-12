import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@shared/api/client';
import { useToast } from '@shared/ui/feedback/ToastProvider';
import { useConfirm } from '@shared/ui/feedback/ConfirmProvider';
import { Button } from '@shared/ui/Button';
import {
  usePaintingPrices,
  useCreatePrice,
  useDeletePrice,
  useCurrencyLookups,
} from '@domains/paintings/hooks/useAdminPaintings';

const inputClass =
  'w-full border border-border bg-background px-3 py-2 font-sans text-body-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:border-primary-400 focus:outline-none';

const formatAmount = (amount: string) =>
  Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (iso: string) => iso.slice(0, 10);

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Price management for an existing painting: the full history with the
 * current price highlighted, plus an add form. Adding a price makes it the
 * current one (the backend demotes the previous current atomically) — that is
 * the only way "current" changes.
 */
export function PricesPanel({ paintingId }: { paintingId: string }) {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { data: prices, isLoading } = usePaintingPrices(paintingId);
  const { data: currencies } = useCurrencyLookups();
  const createMut = useCreatePrice(paintingId);
  const deleteMut = useDeletePrice(paintingId);

  const [amount, setAmount] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(todayISO);
  const [error, setError] = useState<string | null>(null);

  // Default the select to the first currency once options arrive.
  const effectiveCurrencyId = currencyId || (currencies?.[0] ? String(currencies[0].id) : '');

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = Number(amount.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed < 0) {
      return setError(t('prices.amountInvalid'));
    }
    if (!effectiveCurrencyId) return setError(t('prices.currencyRequired'));

    try {
      await createMut.mutateAsync({
        paintingId: Number(paintingId),
        currencyId: Number(effectiveCurrencyId),
        amount: parsed,
        effectiveDate: effectiveDate || undefined,
      });
      setAmount('');
      showToast(t('prices.addedToast'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('prices.addFailed'));
    }
  }

  async function handleDelete(priceId: number) {
    const ok = await confirm({
      title: t('common.confirmTitle'),
      message: t('prices.deleteConfirm'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    });
    if (!ok) return;
    setError(null);
    try {
      await deleteMut.mutateAsync(priceId);
      showToast(t('common.deletedToast'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.deleteFailed'));
    }
  }

  return (
    <section className="mt-8 border border-border bg-white p-6">
      <h2 className="mb-1 font-heading text-lg text-text-primary">{t('prices.title')}</h2>
      <p className="mb-4 text-caption text-text-tertiary">
        {t('prices.hint')}
      </p>

      {error && (
        <div className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-body-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input
          className={inputClass}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder={t('prices.amount')}
          aria-label={t('prices.amount')}
        />
        <select
          className={inputClass}
          value={effectiveCurrencyId}
          onChange={(e) => setCurrencyId(e.target.value)}
          aria-label={t('prices.currency')}
        >
          {!currencies?.length && <option value="">{t('common.loading')}</option>}
          {currencies?.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          className={inputClass}
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
          aria-label={t('prices.effectiveDate')}
        />
        <Button type="submit" variant="secondary" size="sm" isLoading={createMut.isPending}>
          {t('prices.add')}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-body-sm text-text-tertiary">{t('common.loading')}</p>
      ) : !prices?.length ? (
        <p className="text-body-sm text-text-tertiary">{t('prices.empty')}</p>
      ) : (
        <table className="w-full text-left text-body-sm">
          <thead className="border-b border-border text-label uppercase tracking-wide text-text-tertiary">
            <tr>
              <th className="py-2 pr-4">{t('prices.amount')}</th>
              <th className="py-2 pr-4">{t('prices.effective')}</th>
              <th className="py-2 pr-4">{t('prices.status')}</th>
              <th className="py-2 text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="py-2 pr-4 font-medium text-text-primary">
                  {p.currency?.symbol ?? ''}
                  {formatAmount(p.amount)}
                </td>
                <td className="py-2 pr-4 text-text-secondary">{formatDate(p.effectiveDate)}</td>
                <td className="py-2 pr-4">
                  {p.isCurrent ? (
                    <span className="bg-primary-700 px-2 py-0.5 text-caption uppercase tracking-wide text-white">
                      {t('prices.current')}
                    </span>
                  ) : (
                    <span className="text-text-tertiary">{t('prices.history')}</span>
                  )}
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => void handleDelete(p.id)}
                    disabled={deleteMut.isPending}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    {t('common.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
