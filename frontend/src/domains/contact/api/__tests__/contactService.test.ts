/**
 * The contact form used to fake its submission — it slept for a second and
 * showed the success message without ever calling the API, so nothing reached
 * the admin inbox. These lock in that it really posts, and that the form's
 * shape is reconciled with the stored record.
 */
import { contactService } from '../contactService';
import { contactFormSchema, type ContactFormData } from '../../types';

const { apiPostMock } = vi.hoisted(() => ({ apiPostMock: vi.fn() }));

vi.mock('@shared/api/client', () => ({
  apiPost: apiPostMock,
  ApiError: class ApiError extends Error {},
}));

const FORM: ContactFormData = {
  firstName: '  Ayşe  ',
  lastName: '  Kara  ',
  email: '  Ayse.Kara@Example.com  ',
  subject: 'acquisition',
  message: 'I would like to ask about the price of painting 8597.',
};

describe('contactFormSchema', () => {
  it('accepts a filled-in form', () => {
    expect(contactFormSchema.safeParse(FORM).success).toBe(true);
  });

  it('requires both name fields', () => {
    const firstMissing = contactFormSchema.safeParse({ ...FORM, firstName: '   ' });
    const lastMissing = contactFormSchema.safeParse({ ...FORM, lastName: '' });
    expect(firstMissing.success).toBe(false);
    expect(lastMissing.success).toBe(false);
    // The message is an i18n key the form resolves against validation.*
    expect(firstMissing.error?.issues[0].message).toBe('firstNameRequired');
    expect(lastMissing.error?.issues[0].message).toBe('lastNameRequired');
  });

  it('keeps multi-word names intact rather than splitting them', () => {
    const parsed = contactFormSchema.safeParse({ ...FORM, firstName: 'Ayşe Nur' });
    expect(parsed.success).toBe(true);
    expect(parsed.data?.firstName).toBe('Ayşe Nur');
  });
});

describe('contactService.send', () => {
  beforeEach(() => apiPostMock.mockReset());

  it('posts to the public contact endpoint', async () => {
    apiPostMock.mockResolvedValue({ id: 1 });
    await contactService.send(FORM);
    expect(apiPostMock).toHaveBeenCalledTimes(1);
    expect(apiPostMock.mock.calls[0][0]).toBe('/contact-messages');
  });

  it('sends the two name fields straight through, trimmed', async () => {
    apiPostMock.mockResolvedValue({ id: 1 });
    await contactService.send(FORM);
    const body = apiPostMock.mock.calls[0][1];
    expect(body.firstName).toBe('Ayşe');
    expect(body.lastName).toBe('Kara');
    expect(body.email).toBe('Ayse.Kara@Example.com');
  });

  it('keeps the chosen subject by writing it into the message body', async () => {
    apiPostMock.mockResolvedValue({ id: 1 });
    await contactService.send(FORM);
    const body = apiPostMock.mock.calls[0][1];
    expect(body.message).toBe(
      'Subject: Acquisition / Purchase\n\nI would like to ask about the price of painting 8597.',
    );
  });

  it('returns the request promise untouched, so failures reach the form', () => {
    // The service must not swallow errors — the page needs the rejection to
    // show the server's message (a 429 from the rate limiter, typically).
    // Asserting identity proves there's no try/catch in between, without
    // creating a rejected promise: a rejecting mock alongside a resolving one
    // in the same file makes the runner report a spurious unhandled rejection.
    const response = Promise.resolve({ id: 1 });
    apiPostMock.mockReturnValue(response);
    expect(contactService.send(FORM)).toBe(response);
  });
});
