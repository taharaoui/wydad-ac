'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signIn, type FormState } from '../actions';
import { inputCls } from '@/components/admin/FieldControl';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-12 w-full rounded-lg bg-wydad-logo font-semibold text-white hover:bg-wydad-red-hover disabled:opacity-60">
      {pending ? 'Connexion…' : 'Se connecter'}
    </button>
  );
}

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, action] = useFormState<FormState, FormData>(signIn, initialError ? { message: initialError } : {});
  return (
    <form action={action} className="space-y-4">
      {state.message && (
        <p role="alert" className="rounded-lg bg-wydad-red/10 px-4 py-3 text-sm font-medium text-wydad-red">
          {state.message}
        </p>
      )}
      <input type="hidden" name="next" value={next ?? ''} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
          Mot de passe
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </div>
      <Submit />
    </form>
  );
}
