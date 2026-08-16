import { apiPost } from '@shared/api/client';
import type { ContactFormData } from '../types';

/**
 * Send a contact form submission to the backend.
 *
 * POST /api/contact-messages is the one write the public site is allowed to
 * make — the API's write guard lets it through without a token, but rate
 * limits it (see backend middleware/rateLimit.ts). A 429 surfaces here as an
 * ApiError with the server's message.
 *
 * The form's fields map one-to-one onto the stored record, except for the
 * Subject: the table has no column for it, so rather than drop what the
 * visitor chose it's written as the first line of the message body.
 */
export interface ContactMessageResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  createdAt: string;
}

/** English subject labels, so the inbox reads the same whatever the visitor's locale. */
const SUBJECT_LABELS: Record<ContactFormData['subject'], string> = {
  exhibition: 'Exhibition Inquiry',
  acquisition: 'Acquisition / Purchase',
  commission: 'Commission',
  press: 'Press & Media',
  collaboration: 'Collaboration',
  other: 'Other',
};

export const contactService = {
  send(data: ContactFormData): Promise<ContactMessageResponse> {
    return apiPost<ContactMessageResponse>('/contact-messages', {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      message: `Subject: ${SUBJECT_LABELS[data.subject]}\n\n${data.message.trim()}`,
    });
  },
};
