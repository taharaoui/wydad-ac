import { requireAdminPage } from '@/lib/admin/auth';
import { createServiceClient } from '@/lib/supabase/service';
import { InviteForm, MemberActions, type MemberRow } from '@/components/admin/editorial/Members';

export const metadata = { title: 'Utilisateurs' };

const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Casablanca' }).format(new Date(iso)) : 'jamais');

/** The newsroom: who has access, with which role; invitations without sharing any password */
export default async function UsersPage() {
  const { supabase, member } = await requireAdminPage();
  const [{ data: rows }, { data: authored }] = await Promise.all([
    supabase.from('admin_users').select('*').order('created_at'),
    supabase.from('news_articles').select('created_by'),
  ]);
  const counts = new Map<string, number>();
  for (const a of authored ?? []) if (a.created_by) counts.set(a.created_by, (counts.get(a.created_by) ?? 0) + 1);

  // Last sign-in comes from Supabase Auth (service role, server only)
  const lastSignIn = new Map<string, string | null>();
  try {
    const { data } = await createServiceClient().auth.admin.listUsers({ perPage: 200 });
    for (const u of data.users) lastSignIn.set(u.id, u.last_sign_in_at ?? null);
  } catch {}

  const members: MemberRow[] = (rows ?? []).map((r) => ({
    userId: r.user_id,
    email: r.email ?? '',
    name: r.display_name || r.email || r.user_id.slice(0, 8),
    role: r.role as MemberRow['role'],
    canPublish: r.role === 'admin' || r.can_publish,
    active: r.active,
    lastSignIn: lastSignIn.get(r.user_id) ?? null,
    articles: counts.get(r.user_id) ?? 0,
    isMe: r.user_id === member.userId,
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-condensed text-4xl font-extrabold uppercase italic">Utilisateurs</h1>
        <p className="mt-1 max-w-3xl text-fg-secondary">
          Les personnes qui ont accès à la rédaction. Chacune a son propre compte : ne partagez jamais vos identifiants. Les droits sont vérifiés par le serveur et la base de données, pas seulement par l’interface.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-1 font-condensed text-2xl font-extrabold uppercase">Inviter un membre</h2>
        <p className="mb-4 text-sm text-fg-secondary">Le compte est créé sans mot de passe ; vous recevez un lien à lui envoyer, où il choisit le sien.</p>
        <InviteForm />
      </section>

      <section className="space-y-3">
        <h2 className="font-condensed text-2xl font-extrabold uppercase">Membres ({members.length})</h2>
        <ul className="space-y-3">
          {members.map((m) => (
            <li key={m.userId} className={`rounded-2xl border bg-white p-5 shadow-sm ${m.active ? 'border-border' : 'border-dashed border-border opacity-70'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-fg">
                    {m.name} {m.isMe && <span className="text-sm font-normal text-fg-muted">(vous)</span>}
                  </p>
                  <p className="text-sm text-fg-secondary">{m.email}</p>
                  <p className="mt-1 text-xs text-fg-muted">
                    {m.articles} article(s) · dernière connexion : {fmt(m.lastSignIn)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.role === 'admin' ? 'bg-wydad-logo text-white' : 'bg-surface-secondary text-fg'}`}>{m.role === 'admin' ? 'Administrateur' : 'Rédacteur'}</span>
                  {m.role === 'editor' && (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.canPublish ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>{m.canPublish ? 'Peut publier' : 'Relecture obligatoire'}</span>
                  )}
                  {!m.active && <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">Suspendu</span>}
                </div>
              </div>
              <div className="mt-3">
                <MemberActions m={m} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
