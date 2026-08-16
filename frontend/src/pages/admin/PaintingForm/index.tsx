import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { buildRoute } from '@app/router/routes';
import { Button } from '@shared/ui/Button';
import { ApiError } from '@shared/api/client';
import { useToast } from '@shared/ui/feedback/ToastProvider';
import {
  usePaintingLookups,
  useAdminPainting,
  useCreatePainting,
  useUpdatePainting,
} from '@domains/paintings/hooks/useAdminPaintings';
import type { LookupOption } from '@domains/paintings/api/lookupsService';
import {
  adminPaintingsService,
  type PaintingInput,
  type RawPainting,
} from '@domains/paintings/api/adminPaintingsService';
import { ImagesPanel } from './ImagesPanel';
import { PricesPanel } from './PricesPanel';
import { ImageDropInput } from './ImageDropInput';

const inputClass =
  'w-full border border-border bg-background px-3 py-2 font-sans text-body-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:border-primary-400 focus:outline-none';

const numOrNull = (s: string): number | null => {
  const t = s.trim();
  if (t === '') return null;
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/**
 * Form values are the raw input strings; the zod schema owns all validation,
 * including the dimensions XOR rule (rectangular = width AND height, circular
 * = radius) — mirroring the backend's refinement so errors appear on the
 * fields instead of as a server 400.
 */
const makeFormSchema = (t: TFunction<'admin'>) => z
  .object({
    paintingNo: z.string().trim().min(1, t('form.validation.paintingNoRequired')),
    paintingName: z.string(),
    artistId: z.string().min(1, t('form.validation.artistRequired')),
    year: z.string(),
    techniqueId: z.string(),
    materialId: z.string(),
    locationCityId: z.string(),
    ownerId: z.string(),
    shape: z.enum(['rectangular', 'circular']),
    width: z.string(),
    height: z.string(),
    radius: z.string(),
    isAvailable: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.year.trim() !== '' && numOrNull(v.year) == null) {
      ctx.addIssue({ code: 'custom', path: ['year'], message: t('form.validation.yearInvalid') });
    }
    if (v.shape === 'rectangular') {
      if (numOrNull(v.width) == null) {
        ctx.addIssue({ code: 'custom', path: ['width'], message: t('form.validation.widthRequired') });
      }
      if (numOrNull(v.height) == null) {
        ctx.addIssue({ code: 'custom', path: ['height'], message: t('form.validation.heightRequired') });
      }
    } else if (numOrNull(v.radius) == null) {
      ctx.addIssue({ code: 'custom', path: ['radius'], message: t('form.validation.radiusRequired') });
    }
  });

type FormValues = z.infer<ReturnType<typeof makeFormSchema>>;

const EMPTY: FormValues = {
  paintingNo: '',
  paintingName: '',
  artistId: '',
  year: '',
  techniqueId: '',
  materialId: '',
  locationCityId: '',
  ownerId: '',
  shape: 'rectangular',
  width: '',
  height: '',
  radius: '',
  isAvailable: true,
};

/** Build the initial form values for an existing painting record. */
function toFormValues(existing: RawPainting): FormValues {
  return {
    paintingNo: existing.paintingNo,
    paintingName: existing.paintingName === 'Untitled' ? '' : existing.paintingName,
    artistId: String(existing.artistId),
    year: existing.year != null ? String(existing.year) : '',
    techniqueId: existing.techniqueId != null ? String(existing.techniqueId) : '',
    materialId: existing.materialId != null ? String(existing.materialId) : '',
    locationCityId: existing.locationCityId != null ? String(existing.locationCityId) : '',
    ownerId: existing.ownerId != null ? String(existing.ownerId) : '',
    shape: existing.radiusCm != null ? 'circular' : 'rectangular',
    width: existing.widthCm ?? '',
    height: existing.heightCm ?? '',
    radius: existing.radiusCm ?? '',
    isAvailable: existing.isAvailable,
  };
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-label uppercase tracking-wide text-text-tertiary">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-caption text-red-600">{error}</span>}
    </label>
  );
}

function LookupOptions({ options, placeholder }: { options: LookupOption[]; placeholder: string }) {
  return (
    <>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={String(o.id)}>
          {o.label}
        </option>
      ))}
    </>
  );
}

export default function AdminPaintingFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { data: existing, isLoading: existingLoading } = useAdminPainting(id);
  const { t } = useTranslation('admin');

  if (isEdit && existingLoading) {
    return <p className="text-body-sm text-text-tertiary">{t('common.loading')}</p>;
  }

  return (
    <div className="max-w-2xl">
      {/* Keyed so the form state re-initializes when switching between records. */}
      <PaintingForm key={id ?? 'new'} id={id} existing={existing ?? null} />
      {isEdit && id && (
        <>
          <ImagesPanel paintingId={id} />
          <PricesPanel paintingId={id} />
        </>
      )}
    </div>
  );
}

function PaintingForm({ id, existing }: { id?: string; existing: RawPainting | null }) {
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const { showToast } = useToast();

  const { lookups, isLoading: lookupsLoading } = usePaintingLookups();
  const createMut = useCreatePainting();
  const updateMut = useUpdatePainting(id ?? '');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(useMemo(() => makeFormSchema(t), [t])),
    // Prefilled from the loaded record when editing; empty when creating.
    defaultValues: existing ? toFormValues(existing) : EMPTY,
  });

  // useWatch (not watch()) — subscription-based, safe under the React compiler.
  const shape = useWatch({ control, name: 'shape' });

  // Images staged for a NEW painting, each with an object-URL preview. They
  // can't be uploaded yet: the backend files them under the painting's id, so
  // the record has to exist first. onSubmit saves, then uploads these in order.
  // (Editing an existing painting uses ImagesPanel, which uploads immediately.)
  const [selectedImages, setSelectedImages] = useState<{ file: File; url: string }[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Object URLs are revoked by hand: on removal below, and for whatever is
  // still staged when the form unmounts. The ref keeps the unmount cleanup off
  // the state dependency, so adding a file doesn't revoke the previews of the
  // files already staged.
  const stagedRef = useRef<{ file: File; url: string }[]>([]);
  useEffect(() => {
    stagedRef.current = selectedImages;
  }, [selectedImages]);
  useEffect(
    () => () => {
      for (const img of stagedRef.current) URL.revokeObjectURL(img.url);
    },
    [],
  );

  function addImages(files: File[]) {
    setImageError(null);
    // createObjectURL outside the updater: React may invoke an updater twice,
    // which would leak a URL every time.
    const staged = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setSelectedImages((prev) => [...prev, ...staged]);
  }

  function removeImage(index: number) {
    const target = selectedImages[index];
    if (target) URL.revokeObjectURL(target.url);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);

    const rect = values.shape === 'rectangular';
    const input: PaintingInput = {
      paintingNo: values.paintingNo.trim(),
      paintingName: values.paintingName.trim() || 'Untitled',
      artistId: Number(values.artistId),
      year: numOrNull(values.year),
      techniqueId: numOrNull(values.techniqueId),
      materialId: numOrNull(values.materialId),
      locationCityId: numOrNull(values.locationCityId),
      ownerId: numOrNull(values.ownerId),
      widthCm: rect ? numOrNull(values.width) : null,
      heightCm: rect ? numOrNull(values.height) : null,
      radiusCm: rect ? null : numOrNull(values.radius),
      isAvailable: values.isAvailable,
    };

    try {
      // Save the painting first so we have an id for the image's subfolder.
      const saved = isEdit
        ? await updateMut.mutateAsync(input)
        : await createMut.mutateAsync(input);
      // Sequential, not Promise.all: the backend marks an image primary when
      // it's the first one on the painting (isPrimary: total === 0), so racing
      // the uploads would make the primary whichever request happened to land
      // first. In order, the admin's first file is the card image.
      for (const img of selectedImages) {
        await adminPaintingsService.uploadImage(saved.id, img.file);
      }
      showToast(t('common.savedToast'));
      navigate('/admin');
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : t('form.saveFailed'));
    }
  }

  const saving = isSubmitting || createMut.isPending || updateMut.isPending;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-text-primary">
          {isEdit ? t('form.editTitle') : t('form.newTitle')}
        </h1>
        <div className="flex items-center gap-4 text-body-sm">
          {isEdit && id && (
            <Link
              to={buildRoute.paintingDetail(id)}
              className="text-primary-700 hover:underline"
            >
              {t('form.viewOnSite')}
            </Link>
          )}
          <Link to="/admin" className="text-text-tertiary hover:text-text-primary">
            {t('common.back')}
          </Link>
        </div>
      </div>

      {serverError && (
        <div className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-body-sm text-red-700">
          {serverError}
        </div>
      )}

      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        noValidate
        className="space-y-5 border border-border bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('form.paintingNo')} error={errors.paintingNo?.message}>
            <input className={inputClass} {...register('paintingNo')} />
          </Field>
          <Field label={t('form.name')} error={errors.paintingName?.message}>
            <input className={inputClass} {...register('paintingName')} />
          </Field>
          <Field label={t('form.artist')} error={errors.artistId?.message}>
            <select className={inputClass} {...register('artistId')}>
              <LookupOptions
                options={lookups.artists}
                placeholder={lookupsLoading ? t('common.loading') : t('form.selectArtist')}
              />
            </select>
          </Field>
          <Field label={t('form.year')} error={errors.year?.message}>
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder={t('form.yearPlaceholder')}
              {...register('year')}
            />
          </Field>
          <Field label={t('form.technique')} error={errors.techniqueId?.message}>
            <select className={inputClass} {...register('techniqueId')}>
              <LookupOptions options={lookups.techniques} placeholder={t('form.none')} />
            </select>
          </Field>
          <Field label={t('form.material')} error={errors.materialId?.message}>
            <select className={inputClass} {...register('materialId')}>
              <LookupOptions options={lookups.materials} placeholder={t('form.none')} />
            </select>
          </Field>
          <Field label={t('form.locationCity')} error={errors.locationCityId?.message}>
            <select className={inputClass} {...register('locationCityId')}>
              <LookupOptions options={lookups.cities} placeholder={t('form.none')} />
            </select>
          </Field>
          <Field label={t('form.owner')} error={errors.ownerId?.message}>
            <select className={inputClass} {...register('ownerId')}>
              <LookupOptions options={lookups.owners} placeholder={t('form.none')} />
            </select>
          </Field>
        </div>

        {/* Image upload on CREATE only — the edit page has the Images panel. */}
        {!isEdit && (
          <div className="border-t border-border pt-4">
            <span className="mb-1 block text-label uppercase tracking-wide text-text-tertiary">
              {t('form.image')}
            </span>
            {selectedImages.length > 0 && (
              <ul className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {selectedImages.map((img, index) => (
                  <li key={img.url} className="border border-border">
                    <div className="relative aspect-[3/4] bg-muted">
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                      {index === 0 && (
                        <span className="absolute left-2 top-2 bg-primary-700 px-2 py-0.5 text-caption uppercase tracking-wide text-white">
                          {t('images.primary')}
                        </span>
                      )}
                    </div>
                    <div className="px-2 py-1.5 text-body-sm">
                      <p className="truncate text-text-secondary" title={img.file.name}>
                        {img.file.name}
                      </p>
                      <p className="text-caption text-text-tertiary">
                        {(img.file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="mt-1 text-red-600 hover:underline"
                      >
                        {t('form.remove')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {/* Always rendered, so more files can be added to the selection. */}
            <ImageDropInput
              label={t('form.addImagesOptional')}
              multiple
              onFiles={addImages}
              onError={setImageError}
            />
            {imageError && (
              <p className="mt-1 text-caption text-red-600">{imageError}</p>
            )}
            <p className="mt-1 text-caption text-text-tertiary">
              {t('form.imageHint')}
            </p>
          </div>
        )}

        {/* Dimensions — rectangular (w×h) XOR circular (radius) */}
        <fieldset className="border-t border-border pt-4">
          <div className="mb-3 flex gap-4 text-body-sm">
            <label className="flex items-center gap-2">
              <input type="radio" value="rectangular" {...register('shape')} />
              {t('form.rectangular')}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="circular" {...register('shape')} />
              {t('form.circular')}
            </label>
          </div>
          {shape === 'rectangular' ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('form.width')} error={errors.width?.message}>
                <input className={inputClass} inputMode="decimal" {...register('width')} />
              </Field>
              <Field label={t('form.height')} error={errors.height?.message}>
                <input className={inputClass} inputMode="decimal" {...register('height')} />
              </Field>
            </div>
          ) : (
            <Field label={t('form.radius')} error={errors.radius?.message}>
              <input className={inputClass} inputMode="decimal" {...register('radius')} />
            </Field>
          )}
        </fieldset>

        <label className="flex items-center gap-2 text-body-sm text-text-secondary">
          <input type="checkbox" {...register('isAvailable')} />
          {t('form.availableLabel')}
        </label>

        <div className="flex gap-3 border-t border-border pt-4">
          <Button type="submit" variant="primary" isLoading={saving}>
            {isEdit ? t('form.saveChanges') : t('form.create')}
          </Button>
          <Button as={Link} to="/admin" variant="secondary" type="button">
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}
