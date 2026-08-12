import { apiGet, apiPost } from '@shared/api/client';
import type { AdminUser, LoginResponse } from '../types';

/** Auth calls against the backend. The token is attached by the API client. */
export const authService = {
  login(username: string, password: string): Promise<LoginResponse> {
    return apiPost<LoginResponse>('/auth/login', { username, password });
  },

  /** Validate the currently-set token; resolves with the admin it identifies. */
  me(): Promise<{ user: AdminUser }> {
    return apiGet<{ user: AdminUser }>('/auth/me');
  },
};
