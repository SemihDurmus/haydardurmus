import { apiDelete, apiGet, apiPut } from '@shared/api/client';

/**
 * Admin access to visitor contact messages. Reads are admin-only on the
 * backend (they carry visitors' emails); the shapes here are the raw backend
 * ones (numeric ids, ISO dates).
 */
export interface RawContactMessage {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  paintingId: number | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  painting: { id: number; paintingNo: string; paintingName: string } | null;
}

export interface MessagesPage {
  data: RawContactMessage[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const contactMessagesService = {
  /** One page of messages, newest first. */
  list: (page: number, limit = 20) =>
    apiGet<MessagesPage>(`/contact-messages?page=${page}&limit=${limit}`),

  /** Number of unread messages (cheap: 1-row page, read the total). */
  unreadCount: () =>
    apiGet<MessagesPage>('/contact-messages?isRead=false&limit=1').then(
      (r) => r.pagination.total,
    ),

  /** Toggle the read flag. */
  setRead: (id: number, isRead: boolean) =>
    apiPut<RawContactMessage>(`/contact-messages/${id}`, { isRead }),

  remove: (id: number) => apiDelete(`/contact-messages/${id}`),
};
