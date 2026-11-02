'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { acceptInvite, type FormState } from '../actions';
import { inputCls } from '@/components/admin/FieldControl';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-12 w-full rounded-lg bg-wydad-logo font-semibold text-white hover:bg-wydad-red-hover disabled:opacity-60">
      {pending ? 'Activation…' : 'Activer mon compte'}
    </button>
  );
}

export function AcceptForm({ tokenHash, type }: { tokenHash: string; type: string }) {
  const [state, action] = useFormState<FormState, FormData>(acceptInvite, {});
  return (
    <form action={action} className="space-y-4">
      {state.message && (
        <p role="alert" className="rounded-lg bg-wydad-red/10 px-4 py-3 text-sm font-medium text-wydad-red">
          {state.message}
        </p>
      )}
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Choisissez un mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className={inputCls} aria-describedby="pw-help" />
        <p id="pw-help" className="mt-1 text-xs text-fg-muted">10 caractères minimum. Personnel : ne le partagez avec personne.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold">Confirmez le mot de passe</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputCls} />
      </div>
      <Submit />
    </form>
  );
}
