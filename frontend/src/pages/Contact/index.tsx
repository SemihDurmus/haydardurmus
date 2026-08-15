import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { Button } from '@shared/ui/Button';
import { PageTitle } from '@shared/ui/PageTitle';
import { SectionTitle } from '@shared/ui/SectionTitle';
import { contactFormSchema, contactSubjects, type ContactFormData } from '@domains/contact/types';
import { cn } from '@shared/utils/cn';

const fieldClass = cn(
  'w-full border border-border bg-background px-4 py-3',
  'font-sans text-body text-text-primary placeholder:text-text-tertiary',
  'transition-colors focus:border-primary-400 focus:outline-none',
  'aria-invalid:border-error'
);

export default function ContactPage() {
  const { t } = useTranslation('contact');
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (_data: ContactFormData) => {
    try {
      // Simulate submission — replace with real API call
      await new Promise((r) => setTimeout(r, 1000));
      setSubmitState('success');
      reset();
    } catch {
      setSubmitState('error');
    }
  };

  return (
    <>
      {/* Page header */}
      <Section spacing="none" background="default" className="pb-4 pt-6 md:pt-section-sm">
        <Container width="default">
          <div>
            <PageTitle className="mb-4">{t('page.title')}</PageTitle>
            <SectionTitle style={{ marginBottom: 0 }}>{t('page.subtitle')}</SectionTitle>
          </div>
        </Container>
      </Section>
      {/* Content */}
      <Section spacing="lg" background="default" className="pt-8">
        <Container width="default">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
            {/* Info */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div>
                  <Typography level="overline" tone="tertiary" className="mb-1 block">
                    {t('info.studio')}
                  </Typography>
                  <Typography level="body-sm" tone="secondary">
                    Istanbul, Turkey
                  </Typography>
                </div>
                <div>
                  <Typography level="overline" tone="tertiary" className="mb-1 block">
                    {t('info.email')}
                  </Typography>
                  <a
                    href="mailto:studio@haydardurmus.com"
                    className="font-sans text-body-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    studio@haydardurmus.com
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitState === 'success' ? (
                <div className="border border-border p-8">
                  <Typography level="h3" className="mb-3">
                    {t('form.success')}
                  </Typography>
                  <Button variant="ghost" onClick={() => setSubmitState('idle')} size="sm">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block font-sans text-body-sm" htmlFor="name">
                      {t('form.name')}
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder={t('form.namePlaceholder')}
                      aria-invalid={!!errors.name}
                      {...register('name')}
                      className={fieldClass}
                    />
                    {errors.name && (
                      <p className="mt-1 font-sans text-body-sm text-error">
                        {t(`validation.${errors.name.message}`)}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block font-sans text-body-sm" htmlFor="email">
                      {t('form.email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder={t('form.emailPlaceholder')}
                      aria-invalid={!!errors.email}
                      {...register('email')}
                      className={fieldClass}
                    />
                    {errors.email && (
                      <p className="mt-1 font-sans text-body-sm text-error">
                        {t(`validation.${errors.email.message}`)}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="mb-1.5 block font-sans text-body-sm" htmlFor="subject">
                      {t('form.subject')}
                    </label>
                    <select
                      id="subject"
                      aria-invalid={!!errors.subject}
                      {...register('subject')}
                      className={cn(fieldClass, 'cursor-pointer')}
                    >
                      <option value="">{t('form.subjectPlaceholder')}</option>
                      {contactSubjects.map((s) => (
                        <option key={s} value={s}>
                          {t(`subjects.${s}`)}
                        </option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="mt-1 font-sans text-body-sm text-error">
                        {t(`validation.${errors.subject.message}`)}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-1.5 block font-sans text-body-sm" htmlFor="message">
                      {t('form.message')}
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      placeholder={t('form.messagePlaceholder')}
                      aria-invalid={!!errors.message}
                      {...register('message')}
                      className={cn(fieldClass, 'resize-none')}
                    />
                    {errors.message && (
                      <p className="mt-1 font-sans text-body-sm text-error">
                        {t(`validation.${errors.message.message}`)}
                      </p>
                    )}
                  </div>

                  {submitState === 'error' && (
                    <p className="font-sans text-body-sm text-error">{t('form.error')}</p>
                  )}

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? t('form.sending') : t('form.submit')}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
