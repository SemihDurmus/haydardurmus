import { useState } from 'react';
import { Button } from '@shared/ui/Button';
import { useTranslation } from 'react-i18next';
import { useToast } from '@shared/ui/feedback/ToastProvider';
import { useConfirm } from '@shared/ui/feedback/ConfirmProvider';
import { ApiError } from '@shared/api/client';
import {
  useResourceList,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  type ResourceItem,
} from '../hooks/useResource';

export interface SelectOption {
  id: number;
  label: string;
}

export interface ResourceField {
  name: string;
  label: string;
  type?: 'text' | 'select' | 'date';
  options?: SelectOption[];
  required?: boolean;
}

interface ResourceManagerProps {
  title: string;
  /** API path segment, e.g. 'techniques'. */
  resource: string;
  fields: ResourceField[];
  /** How to label a row in the list. */
  toLabel: (item: ResourceItem) => string;
}

const inputClass =
  'border border-border bg-background px-3 py-2 font-sans text-body-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-400 focus:outline-none';

type FormState = Record<string, string>;

const emptyFormFor = (fields: ResourceField[]): FormState =>
  Object.fromEntries(fields.map((f) => [f.name, '']));

// Prefill a form from an existing row. Dates come back as ISO datetimes; the
// date input needs YYYY-MM-DD, so slice. Selects/text become strings.
function itemToForm(fields: ResourceField[], item: ResourceItem): FormState {
  const form: FormState = {};
  for (const f of fields) {
    const raw = item[f.name];
    if (raw === null || raw === undefined) form[f.name] = '';
    else if (f.type === 'date') form[f.name] = String(raw).slice(0, 10);
    else form[f.name] = String(raw);
  }
  return form;
}

// Build a request body from the form, coercing FK selects to numbers and
// omitting empty optional fields. Returns an error message if a required field
// is blank.
function buildBody(
  fields: ResourceField[],
  form: FormState,
): { body?: Record<string, unknown>; error?: string } {
  const body: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = (form[f.name] ?? '').trim();
    if (!raw) {
      if (f.required) return { error: `${f.label} is required` };
      continue;
    }
    body[f.name] = f.type === 'select' ? Number(raw) : raw;
  }
  return { body };
}

/** The labeled inputs for one row — shared by the add bar and the edit row. */
function FieldControls({
  fields,
  values,
  onChange,
}: {
  fields: ResourceField[];
  values: FormState;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <>
      {fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-1">
          <span className="text-caption uppercase tracking-wide text-text-tertiary">
            {f.label}
            {f.required ? ' *' : ''}
          </span>
          {f.type === 'select' ? (
            <select
              className={inputClass}
              value={values[f.name]}
              onChange={(e) => onChange(f.name, e.target.value)}
            >
              <option value="">{f.required ? 'Select…' : 'None'}</option>
              {f.options?.map((o) => (
                <option key={o.id} value={String(o.id)}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={inputClass}
              type={f.type === 'date' ? 'date' : 'text'}
              value={values[f.name]}
              onChange={(e) => onChange(f.name, e.target.value)}
            />
          )}
        </label>
      ))}
    </>
  );
}

/**
 * One self-contained admin panel for a resource: an inline "add" form plus the
 * current list, where each row can be edited in place or deleted.
 */
export function ResourceManager({ title, resource, fields, toLabel }: ResourceManagerProps) {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const list = useResourceList(resource);
  const create = useCreateResource(resource);
  const update = useUpdateResource(resource);
  const remove = useDeleteResource(resource);

  const [form, setForm] = useState<FormState>(emptyFormFor(fields));
  const [error, setError] = useState<string | null>(null);

  // Row currently being edited (id) and its working copy.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>({});

  async function handleAdd() {
    setError(null);
    const { body, error: err } = buildBody(fields, form);
    if (err) return setError(err);
    try {
      await create.mutateAsync(body);
      setForm(emptyFormFor(fields));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not add.');
    }
  }

  async function handleSaveEdit() {
    if (editingId === null) return;
    setError(null);
    const { body, error: err } = buildBody(fields, editForm);
    if (err) return setError(err);
    try {
      await update.mutateAsync({ id: editingId, body });
      setEditingId(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save.');
    }
  }

  async function handleDelete(item: ResourceItem) {
    const ok = await confirm({
      title: t('common.confirmTitle'),
      message: t('common.deleteConfirmShort', { name: toLabel(item) }),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    });
    if (!ok) return;
    try {
      await remove.mutateAsync(item.id);
    } catch (e) {
      // Backend returns 400 when the row is still referenced (FK restrict).
      showToast(e instanceof ApiError ? e.message : t('common.deleteFailed'), 'error');
    }
  }

  return (
    <section className="border border-border bg-white p-5">
      <h2 className="mb-3 font-heading text-lg text-text-primary">{title}</h2>

      {error && (
        <div className="mb-3 border border-red-200 bg-red-50 px-3 py-2 text-body-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add bar */}
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <FieldControls
          fields={fields}
          values={form}
          onChange={(name, value) => setForm((s) => ({ ...s, [name]: value }))}
        />
        <Button variant="primary" size="sm" onClick={handleAdd} isLoading={create.isPending}>
          {t('common.add')}
        </Button>
      </div>

      {list.isLoading ? (
        <p className="text-body-sm text-text-tertiary">{t('common.loading')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.data?.map((item) =>
            editingId === item.id ? (
              <li key={item.id} className="flex flex-wrap items-end gap-2 bg-muted/40 p-2">
                <FieldControls
                  fields={fields}
                  values={editForm}
                  onChange={(name, value) => setEditForm((s) => ({ ...s, [name]: value }))}
                />
                <Button variant="primary" size="sm" onClick={handleSaveEdit} isLoading={update.isPending}>
                  {t('common.save')}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                  {t('common.cancel')}
                </Button>
              </li>
            ) : (
              <li
                key={item.id}
                className="flex items-center gap-3 border border-border px-2.5 py-1.5 text-body-sm text-text-secondary"
              >
                <span className="mr-auto">{toLabel(item)}</span>
                <button
                  onClick={() => {
                    setError(null);
                    setEditingId(item.id);
                    setEditForm(itemToForm(fields, item));
                  }}
                  className="text-primary-700 hover:underline"
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={t('common.delete')}
                  title={t('common.delete')}
                >
                  ✕
                </button>
              </li>
            ),
          )}
          {list.data?.length === 0 && (
            <li className="text-body-sm text-text-tertiary">{t('common.noneYet')}</li>
          )}
        </ul>
      )}
    </section>
  );
}
