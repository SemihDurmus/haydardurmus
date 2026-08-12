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
  name: z.string().min(1, 'nameRequired').max(100),
  email: z.string().min(1, 'emailRequired').email('emailInvalid'),
  subject: z.enum(contactSubjects, { required_error: 'subjectRequired' }),
  message: z
    .string()
    .min(1, 'messageRequired')
    .min(20, 'messageTooShort')
    .max(2000),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
