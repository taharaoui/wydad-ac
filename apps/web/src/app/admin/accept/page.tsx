import Image from 'next/image';
import Link from 'next/link';
import { AcceptForm } from './AcceptForm';

export const metadata = { title: 'Activer mon compte' };
export const dynamic = 'force-dynamic';

/** Landing page of an invitation link: the new member chooses their password */
export default function AcceptPage({ searchParams }: { searchParams: { token_hash?: string; type?: string } }) {
  const type = searchParams.type === 'recovery' ? 'recovery' : 'invite';
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/images/wydad-crest.svg" alt="" width={64} height={81} className="h-20 w-auto" priority />
          <h1 className="mt-5 font-condensed text-3xl font-extrabold uppercase italic">{type === 'invite' ? 'Bienvenue dans la rédaction' : 'Nouveau mot de passe'}</h1>
          <p className="mt-1 text-sm text-fg-muted">Wydad Athletic Club</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          {searchParams.token_hash ? (
            <AcceptForm tokenHash={searchParams.token_hash} type={type} />
          ) : (
            <p className="text-sm text-fg-secondary">Lien incomplet. Ouvrez le lien d’invitation en entier, ou demandez-en un nouveau à un administrateur.</p>
          )}
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/admin/login" className="font-semibold text-wydad-logo hover:underline">J’ai déjà un mot de passe</Link>
        </p>
      </div>
    </main>
  );
}
