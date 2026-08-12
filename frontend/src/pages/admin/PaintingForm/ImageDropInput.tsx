import { useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';

/** Mirror of the backend's Multer limits (see backend middleware/upload.ts). */
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

interface ImageDropInputProps {
  /** Called with the files that passed validation. */
  onFiles: (files: File[]) => void;
  /** Called with a human-readable message when files are rejected. */
  onError: (message: string) => void;
  multiple?: boolean;
  disabled?: boolean;
  label: string;
}

/**
 * Click-to-browse + drag-and-drop image input. Validates type and size on the
 * client (mirroring the backend limits) so oversized or non-image files fail
 * instantly instead of after a wasted request.
 */
export function ImageDropInput({
  onFiles,
  onError,
  multiple = false,
  disabled = false,
  label,
}: ImageDropInputProps) {
  const { t } = useTranslation('admin');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function validateAndEmit(list: FileList | null) {
    if (!list?.length) return;
    const files = multiple ? Array.from(list) : [list[0]];

    const notImage = files.find((f) => !f.type.startsWith('image/'));
    if (notImage) return onError(t('images.notImage', { name: notImage.name }));

    const tooBig = files.find((f) => f.size > MAX_BYTES);
    if (tooBig) return onError(t('images.tooLarge', { name: tooBig.name }));

    onFiles(files);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    validateAndEmit(e.dataTransfer.files);
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center border border-dashed px-4 py-6 text-center transition-colors ${
        isDragOver ? 'border-primary-400 bg-primary-50/40' : 'border-border bg-muted/20'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-primary-400'}`}
    >
      <p className="text-body-sm text-text-secondary">{label}</p>
      <p className="mt-1 text-caption text-text-tertiary">
        {t('images.dropHint')}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          validateAndEmit(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
