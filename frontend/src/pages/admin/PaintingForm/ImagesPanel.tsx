import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_ORIGIN, ApiError } from '@shared/api/client';
import { useToast } from '@shared/ui/feedback/ToastProvider';
import { useConfirm } from '@shared/ui/feedback/ConfirmProvider';
import {
  usePaintingImages,
  useUploadPaintingImage,
  useSetPrimaryImage,
  useDeletePaintingImage,
} from '@domains/paintings/hooks/useAdminPaintings';
import { ImageDropInput } from './ImageDropInput';

/**
 * Image management for an existing painting: thumbnails of every stored image,
 * upload more, promote one to primary (the card image), delete. Only rendered
 * on the edit page — a new painting needs an id before images can be attached.
 */
export function ImagesPanel({ paintingId }: { paintingId: string }) {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { data: images, isLoading } = usePaintingImages(paintingId);
  const upload = useUploadPaintingImage(paintingId);
  const setPrimary = useSetPrimaryImage(paintingId);
  const del = useDeletePaintingImage(paintingId);

  const [error, setError] = useState<string | null>(null);

  const busy = upload.isPending || setPrimary.isPending || del.isPending;

  async function handleFiles(files: File[]) {
    setError(null);
    try {
      // Sequential on purpose: the backend takes one multipart file per request.
      for (const file of files) {
        await upload.mutateAsync(file);
      }
      showToast(t('images.uploadedToast'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('images.uploadFailed'));
    }
  }

  async function handleSetPrimary(imageId: number) {
    setError(null);
    try {
      await setPrimary.mutateAsync(imageId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('images.setPrimaryFailed'));
    }
  }

  async function handleDelete(imageId: number) {
    const ok = await confirm({
      title: t('common.confirmTitle'),
      message: t('images.deleteConfirm'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    });
    if (!ok) return;
    setError(null);
    try {
      await del.mutateAsync(imageId);
      showToast(t('common.deletedToast'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.deleteFailed'));
    }
  }

  return (
    <section className="mt-8 border border-border bg-white p-6">
      <h2 className="mb-4 font-heading text-lg text-text-primary">{t('images.title')}</h2>

      <div className="mb-4">
        <ImageDropInput
          label={upload.isPending ? t('images.uploading') : t('images.add')}
          multiple
          disabled={upload.isPending}
          onFiles={(files) => void handleFiles(files)}
          onError={setError}
        />
      </div>

      {error && (
        <div className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-body-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-body-sm text-text-tertiary">{t('common.loading')}</p>
      ) : !images?.length ? (
        <p className="text-body-sm text-text-tertiary">
          {t('images.empty')}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img) => (
            <li key={img.id} className="border border-border">
              <div className="relative aspect-[3/4] bg-muted">
                <img
                  src={`${API_ORIGIN}${img.filePath}`}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {img.isPrimary && (
                  <span className="absolute left-2 top-2 bg-primary-700 px-2 py-0.5 text-caption uppercase tracking-wide text-white">
                    {t('images.primary')}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 text-body-sm">
                {img.isPrimary ? (
                  <span className="text-text-tertiary">{t('images.cardImage')}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleSetPrimary(img.id)}
                    disabled={busy}
                    className="text-primary-700 hover:underline disabled:opacity-50"
                  >
                    {t('images.setPrimary')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleDelete(img.id)}
                  disabled={busy}
                  className="text-red-600 hover:underline disabled:opacity-50"
                >
                  {t('common.delete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
