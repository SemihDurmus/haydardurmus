import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@domains/auth/useAuth';
import { contactMessagesService } from '../api/contactMessagesService';

const messageKeys = {
  all: ['contact-messages'] as const,
  page: (page: number) => ['contact-messages', 'page', page] as const,
  unreadCount: ['contact-messages', 'unread-count'] as const,
};

export function useContactMessages(page: number) {
  return useQuery({
    queryKey: messageKeys.page(page),
    queryFn: () => contactMessagesService.list(page),
  });
}

/**
 * Unread total for the admin-bar badge. Only fetched when authenticated
 * (the endpoint is admin-only) and kept reasonably fresh while the panel
 * is open.
 */
export function useUnreadMessageCount() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: messageKeys.unreadCount,
    queryFn: contactMessagesService.unreadCount,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
}

function useInvalidateMessages() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: messageKeys.all });
}

export function useSetMessageRead() {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) =>
      contactMessagesService.setRead(id, isRead),
    onSuccess: invalidate,
  });
}

export function useDeleteMessage() {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: (id: number) => contactMessagesService.remove(id),
    onSuccess: invalidate,
  });
}
