import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { buildRoute } from '@app/router/routes';
import { ApiError } from '@shared/api/client';
import { useToast } from '@shared/ui/feedback/ToastProvider';
import { useConfirm } from '@shared/ui/feedback/ConfirmProvider';
import { Button } from '@shared/ui/Button';
import {
  useContactMessages,
  useSetMessageRead,
  useDeleteMessage,
} from '@domains/admin/hooks/useContactMessages';
import type { RawContactMessage } from '@domains/admin/api/contactMessagesService';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });

function MessageCard({ message }: { message: RawContactMessage }) {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const setRead = useSetMessageRead();
  const del = useDeleteMessage();
  const [error, setError] = useState<string | null>(null);

  async function handleToggleRead() {
    setError(null);
    try {
      await setRead.mutateAsync({ id: message.id, isRead: !message.isRead });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('messages.updateFailed'));
    }
  }

  async function handleDelete() {
    const ok = await confirm({
      title: t('common.confirmTitle'),
      message: t('messages.deleteConfirm'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    });
    if (!ok) return;
    setError(null);
    try {
      await del.mutateAsync(message.id);
      showToast(t('common.deletedToast'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.deleteFailed'));
    }
  }

  return (
    <li
      className={`border border-border bg-white p-4 ${message.isRead ? 'opacity-70' : 'border-l-4 border-l-primary-700'}`}
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <span className="font-medium text-text-primary">
            {message.firstName} {message.lastName}
          </span>
          <a
            href={`mailto:${message.email}`}
            className="text-body-sm text-primary-700 hover:underline"
          >
            {message.email}
          </a>
        </div>
        <span className="text-caption text-text-tertiary">{formatDate(message.createdAt)}</span>
      </div>

      {message.painting && (
        <p className="mb-2 text-body-sm text-text-secondary">
          {t('messages.re')}{' '}
          <Link
            to={buildRoute.paintingDetail(String(message.painting.id))}
            className="text-primary-700 hover:underline"
          >
            No. {message.painting.paintingNo}
            {message.painting.paintingName !== 'Untitled' && ` — ${message.painting.paintingName}`}
          </Link>
        </p>
      )}

      <p className="whitespace-pre-wrap text-body-sm text-text-secondary">{message.message}</p>

      {error && (
        <div className="mt-2 border border-red-200 bg-red-50 px-3 py-1.5 text-body-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-3 flex gap-3 text-body-sm">
        <button
          type="button"
          onClick={() => void handleToggleRead()}
          disabled={setRead.isPending}
          className="text-primary-700 hover:underline disabled:opacity-50"
        >
          {message.isRead ? t('messages.markUnread') : t('messages.markRead')}
        </button>
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={del.isPending}
          className="text-red-600 hover:underline disabled:opacity-50"
        >
          {t('common.delete')}
        </button>
      </div>
    </li>
  );
}

export default function AdminMessagesPage() {
  const { t } = useTranslation('admin');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useContactMessages(page);

  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl text-text-primary">{t('messages.title')}</h1>
        <p className="text-body-sm text-text-tertiary">
          {data ? t('messages.total', { count: data.pagination.total }) : ' '}
        </p>
      </div>

      {isLoading ? (
        <p className="text-body-sm text-text-tertiary">{t('common.loading')}</p>
      ) : !data?.data.length ? (
        <p className="text-body-sm text-text-tertiary">{t('messages.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {data.data.map((m) => (
            <MessageCard key={m.id} message={m} />
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('common.previous')}
          </Button>
          <span className="text-body-sm text-text-tertiary">
            {t('common.pageOf', { page, total: totalPages })}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </div>
  );
}
