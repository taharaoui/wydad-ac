'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function UnsubscribeButton({ token }: { token: string }) {
  const t = useTranslations('newsletter');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'invalid' | 'error'>('idle');
  const submit = async () => {
    setState('sending');
    try {
      const res = await fetch('/api/newsletter/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const { result } = (await res.json()) as { result: string };
      setState(result === 'ok' ? 'ok' : result === 'invalid' ? 'invalid' : 'error');
    } catch {
      setState('error');
    }
  };
  if (state === 'ok') return <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 font-medium text-emerald-800">{t('unsubscribed')}</p>;
  return (
    <div aria-live="polite">
      <button type="button" onClick={submit} disabled={state === 'sending' || !token} className="inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-6 font-condensed text-lg font-bold uppercase text-white hover:bg-wydad-red-hover disabled:opacity-50">
        {t('unsubscribe_button')}
      </button>
      {(state === 'invalid' || !token) && <p className="mt-3 text-sm text-wydad-red">{t('invalid_link_text')}</p>}
      {state === 'error' && <p className="mt-3 text-sm text-wydad-red">{t('error')}</p>}
    </div>
  );
}
