'use client';

import { useEffect, useId, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { TOPICS, type SubscribeResult, type Topic } from '@/lib/newsletter/schema';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done'; ok: boolean; message: string };

/**
 * Newsletter signup. `full` shows the topic picker; `compact` is a single row for other pages.
 * The message shown always reflects what the server answered: no success without its confirmation.
 */
export function NewsletterForm({ variant = 'full', source, defaultTopics = ['club', 'matches'], tone = 'light' }: { variant?: 'full' | 'compact'; source: string; defaultTopics?: Topic[]; tone?: 'light' | 'dark' }) {
  const t = useTranslations('newsletter');
  const locale = useLocale();
  const id = useId();
  const [email, setEmail] = useState('');
  const [topics, setTopics] = useState<Topic[]>(defaultTopics);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [startedAt, setStartedAt] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [fieldError, setFieldError] = useState<string>();

  useEffect(() => setStartedAt(Date.now()), []);

  const toggle = (topic: Topic) => setTopics((cur) => (cur.includes(topic) ? cur.filter((x) => x !== topic) : [...cur, topic]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(undefined);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setFieldError(t('invalid_email'));
    if (topics.length === 0) return setFieldError(t('choose_topic'));
    if (!consent) return setFieldError(t('consent_required'));
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, topics, locale, consent, source, website, startedAt }),
      });
      const data = (await res.json()) as SubscribeResult;
      if (data.result === 'pending') {
        setStatus({ kind: 'done', ok: true, message: t(data.emailSent ? 'ok_confirm' : 'ok_saved', { email: email.trim() }) });
        setEmail('');
      } else if (data.result === 'exists') {
        setStatus({ kind: 'done', ok: true, message: t('already') });
      } else {
        const key = { invalid: 'invalid_email', consent: 'consent_required', topics: 'choose_topic', rate_limited: 'rate_limited', unavailable: 'unavailable', server: 'error' }[data.code];
        setStatus({ kind: 'done', ok: false, message: t(key) });
      }
    } catch {
      setStatus({ kind: 'done', ok: false, message: t('error') });
    }
  };

  const dark = tone === 'dark';
  const muted = dark ? 'text-white/70' : 'text-fg-secondary';

  return (
    <form onSubmit={submit} noValidate className="w-full" aria-describedby={`${id}-privacy`}>
      {/* Honeypot: hidden from people and assistive tech */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
        </label>
      </div>

      {variant === 'full' && (
        <fieldset className="mb-5">
          <legend className={`mb-3 font-condensed text-sm font-bold uppercase tracking-[0.14em] ${muted}`}>{t('topics')}</legend>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => {
              const on = topics.includes(topic);
              return (
                <label
                  key={topic}
                  className={`inline-flex min-h-11 cursor-pointer select-none items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-wydad-logo/40 ${
                    on ? 'border-wydad-logo bg-wydad-logo text-white' : dark ? 'border-white/25 text-white hover:border-white' : 'border-border text-fg hover:border-wydad-logo'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(topic)} />
                  {on && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {t(`t_${topic}`)}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          {t('email')}
        </label>
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('email_placeholder')}
          aria-invalid={!!fieldError || undefined}
          className={`min-h-12 w-full flex-1 rounded-lg border px-4 text-base outline-none transition focus:ring-2 ${
            dark ? 'border-white/25 bg-white/10 text-white placeholder:text-white/50 focus:border-white focus:ring-white/30' : 'border-border bg-white text-fg focus:border-wydad-logo focus:ring-wydad-logo/20'
          }`}
        />
        <button
          type="submit"
          disabled={status.kind === 'sending'}
          className={`min-h-12 shrink-0 rounded-lg px-6 font-condensed text-lg font-bold uppercase tracking-wide transition-colors disabled:opacity-60 ${
            dark ? 'bg-white text-wydad-logo hover:bg-white/90' : 'bg-wydad-logo text-white hover:bg-wydad-red-hover'
          }`}
        >
          {status.kind === 'sending' ? t('subscribing') : t('subscribe')}
        </button>
      </div>

      <label className={`mt-3 flex cursor-pointer items-start gap-3 text-sm ${muted}`}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-wydad-logo" />
        <span>{t('consent')}</span>
      </label>

      <div aria-live="polite" className="min-h-[1.5rem]">
        {fieldError && <p className={`mt-3 text-sm font-semibold ${dark ? 'text-white' : 'text-wydad-red'}`}>{fieldError}</p>}
        {status.kind === 'done' && (
          <p role={status.ok ? 'status' : 'alert'} className={`mt-3 rounded-lg px-4 py-3 text-sm font-medium ${status.ok ? (dark ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-800') : dark ? 'bg-black/30 text-white' : 'bg-wydad-red/10 text-wydad-red'}`}>
            {status.message}
          </p>
        )}
      </div>
      <p id={`${id}-privacy`} className={`mt-2 text-xs ${dark ? 'text-white/55' : 'text-fg-muted'}`}>
        {t('privacy')}
      </p>
    </form>
  );
}
