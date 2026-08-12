import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@shared/api/client';

/** A backend lookup/record row — has an id plus arbitrary fields. */
export interface ResourceItem {
  id: number;
  [key: string]: unknown;
}

interface Envelope {
  data: ResourceItem[];
}

/** List a resource (e.g. 'techniques', 'artists'). One page is plenty here. */
export function useResourceList(resource: string) {
  return useQuery({
    queryKey: ['resource', resource],
    queryFn: () => apiGet<Envelope>(`/${resource}?limit=100`).then((r) => r.data),
  });
}

// After a create/delete, refresh both this resource's list AND the painting
// form's lookup selects (keyed under 'lookups'), so new entries show up there too.
function useInvalidate(resource: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['resource', resource] });
    qc.invalidateQueries({ queryKey: ['lookups'] });
  };
}

export function useCreateResource(resource: string) {
  const invalidate = useInvalidate(resource);
  return useMutation({
    mutationFn: (body: unknown) => apiPost(`/${resource}`, body),
    onSuccess: invalidate,
  });
}

export function useUpdateResource(resource: string) {
  const invalidate = useInvalidate(resource);
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: unknown }) =>
      apiPut(`/${resource}/${id}`, body),
    onSuccess: invalidate,
  });
}

export function useDeleteResource(resource: string) {
  const invalidate = useInvalidate(resource);
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/${resource}/${id}`),
    onSuccess: invalidate,
  });
}
