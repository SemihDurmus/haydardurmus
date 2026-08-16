import { z } from 'zod';

export const contactSubjects = [
  'exhibition',
  'acquisition',
  'commission',
  'press',
  'collaboration',
  'other',
] as const;

export type ContactSubject = (typeof contactSubjects)[number];

export const contactFormSchema = z.object({
  // Two fields rather than one "full name": contact_message stores first_name
  // and last_name as separate NOT NULL columns and the admin inbox lists them
  // that way, so asking for them separately avoids guessing where to split.
  firstName: z.string().trim().min(1, 'firstNameRequired').max(100),
  lastName: z.string().trim().min(1, 'lastNameRequired').max(100),
  // .trim() before the checks: a trailing space picked up from autofill or a
  // paste would otherwise fail .email() and block the submission outright.
  email: z.string().trim().min(1, 'emailRequired').email('emailInvalid'),
  subject: z.enum(contactSubjects, { required_error: 'subjectRequired' }),
  message: z
    .string()
    .trim()
    .min(1, 'messageRequired')
    .min(20, 'messageTooShort')
    .max(2000),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
