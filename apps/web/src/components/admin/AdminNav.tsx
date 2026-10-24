'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface NavGroup {
  label: string;
  items: { href: string; label: string }[];
}

/** Admin sidebar: grouped modules; a drawer on small screens */
export function AdminNav({ groups, email, signOut }: { groups: NavGroup[]; email: string; signOut: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const active = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <nav aria-label="Administration" className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-5 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/wydad-crest-white.svg" alt="" className="h-10 w-auto" />
        <span className="font-condensed text-xl font-extrabold uppercase italic leading-none text-white">
          Admin
          <span className="block text-xs font-bold not-italic tracking-wide text-white/70">Wydad Athletic Club</span>
        </span>
      </Link>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        <ul>
          <li>
            <Link href="/admin" aria-current={active('/admin') ? 'page' : undefined} className={`block rounded-lg px-3 py-2 text-[15px] font-medium ${active('/admin') ? 'bg-white text-wydad-logo' : 'text-white/90 hover:bg-white/10'}`}>
              Tableau de bord
            </Link>
          </li>
        </ul>
        {groups.map((g) => (
          <div key={g.label}>
            <p className="px-3 pb-1.5 font-condensed text-xs font-bold uppercase tracking-[0.16em] text-white/60">{g.label}</p>
            <ul className="space-y-0.5">
              {g.items.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={active(i.href) ? 'page' : undefined}
                    className={`block rounded-lg px-3 py-1.5 text-[15px] font-medium ${active(i.href) ? 'bg-white text-wydad-logo' : 'text-white/90 hover:bg-white/10'}`}
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/15 px-5 py-4">
        <p className="truncate text-sm text-white/75" title={email}>
          {email}
        </p>
        <div className="mt-2 flex items-center gap-4 text-sm">
          <a href="/fr" target="_blank" rel="noopener" className="font-semibold text-white hover:underline">
            Voir le site
          </a>
          <form action={signOut}>
            <button type="submit" className="font-semibold text-white/80 hover:text-white hover:underline">
              Déconnexion
            </button>
          </form>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between bg-wydad-logo px-4 py-3 text-white lg:hidden">
        <span className="font-condensed text-lg font-extrabold uppercase italic">Admin Wydad</span>
        <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="admin-drawer" className="min-h-11 rounded-lg px-3 font-semibold hover:bg-white/10">
          Menu
        </button>
      </div>
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 bg-wydad-logo lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" id="admin-drawer">
          <button type="button" aria-label="Fermer le menu" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 start-0 w-72 max-w-[85vw] bg-wydad-logo shadow-xl">{nav}</aside>
        </div>
      )}
    </>
  );
}
