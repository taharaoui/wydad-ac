import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/admin/auth';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'Connexion' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  const admin = await getAdmin();
  if (admin.status === 'admin') redirect('/admin');

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/images/wydad-crest.svg" alt="" width={64} height={81} className="h-20 w-auto" priority />
          <h1 className="mt-5 font-condensed text-3xl font-extrabold uppercase italic">Administration</h1>
          <p className="mt-1 text-sm text-fg-muted">Wydad Athletic Club</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          {admin.status === 'unconfigured' ? (
            <div className="space-y-2 text-sm text-fg-secondary">
              <p className="font-semibold text-fg">Supabase n’est pas encore configuré.</p>
              <p>
                Renseignez <code className="rounded bg-surface-secondary px-1">NEXT_PUBLIC_SUPABASE_URL</code> et{' '}
                <code className="rounded bg-surface-secondary px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, puis suivez docs/ADMIN.md.
              </p>
            </div>
          ) : (
            <LoginForm
              next={searchParams.next}
              initialError={searchParams.error === 'forbidden' || admin.status === 'forbidden' ? 'Ce compte n’a pas accès à l’administration.' : undefined}
            />
          )}
        </div>
        <p className="mt-6 text-center text-xs text-fg-muted">Accès réservé aux administrateurs désignés par le club.</p>
      </div>
    </main>
  );
}
