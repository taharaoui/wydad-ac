'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { INSTAGRAM_URL, type InstagramPost, type InstagramProfile } from '@/lib/instagram';
import { InstagramIcon, KindIcon, VerifiedBadge } from '@/components/ui/InstagramIcons';

/** Formatted the same on server and client (Intl compact output differs between them in Arabic) */
const millions = (n: number) => `${(n / 1_000_000).toFixed(1)} M`;
const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');

/** iPhone with the club's Instagram profile on screen: header, stats, Follow, posts grid. */
function PhoneMockup({ profile, posts }: { profile: InstagramProfile; posts: InstagramPost[] }) {
  const t = useTranslations('home');
  return (
    <div className="relative mx-auto w-[270px] shrink-0 sm:w-[290px]" aria-hidden>
      {/* Side buttons */}
      <span className="absolute -start-[3px] top-[110px] h-8 w-[3px] rounded-s bg-[#2a2a2e]" />
      <span className="absolute -start-[3px] top-[160px] h-14 w-[3px] rounded-s bg-[#2a2a2e]" />
      <span className="absolute -end-[3px] top-[140px] h-20 w-[3px] rounded-e bg-[#2a2a2e]" />
      <div className="rounded-[46px] bg-[#1c1c1f] p-[10px] shadow-[0_30px_70px_rgb(0_0_0/0.28),inset_0_0_0_2px_#3a3a3f]">
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[37px] bg-white text-[#0f0f0f]" dir="ltr">
          {/* Status bar + Dynamic Island */}
          <div className="flex h-11 items-center justify-between px-7 pt-1 text-[12px] font-semibold">
            <span>9:41</span>
            <span className="absolute start-1/2 top-2.5 h-[26px] w-[86px] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1">
              <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><rect x="0" y="6" width="3" height="4" rx="1" /><rect x="4.3" y="4" width="3" height="6" rx="1" /><rect x="8.6" y="2" width="3" height="8" rx="1" /><rect x="12.9" y="0" width="3" height="10" rx="1" /></svg>
              <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="18" height="10" rx="3" fill="none" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="14" height="7" rx="1.8" fill="currentColor" /><rect x="19.5" y="3.5" width="1.5" height="4" rx="0.7" fill="currentColor" opacity="0.4" /></svg>
            </span>
          </div>

          {/* Profile header */}
          <div className="flex items-center gap-1 px-4 pt-1 text-[15px] font-bold">
            {profile.username}
            <VerifiedBadge />
          </div>
          <div className="mt-3 flex items-center gap-4 px-4">
            <span className="rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] p-[2px]">
              <span className="block rounded-full bg-white p-[2px]">
                <Image src={profile.avatar} alt="" width={64} height={64} className="h-[60px] w-[60px] rounded-full object-cover" />
              </span>
            </span>
            <span className="flex flex-1 justify-around text-center text-[11px] leading-tight">
              <span>
                <b className="block text-[14px]">{thousands(profile.posts)}</b>
                {t('ig_posts')}
              </span>
              <span>
                <b className="block text-[14px]">{millions(profile.followers)}</b>
                {t('ig_followers')}
              </span>
            </span>
          </div>
          <p className="mt-2 px-4 text-[12px] font-semibold">{profile.fullName}</p>
          <p className="px-4 text-[11px] text-[#555]">Casablanca · 1937 · #DimaWydad</p>
          <div className="mt-2.5 px-4">
            <span className="block rounded-lg bg-[#0095F6] py-1.5 text-center text-[12px] font-semibold text-white">{t('ig_follow_short')}</span>
          </div>

          {/* Grid tabs */}
          <div className="mt-3 flex border-t border-black/10">
            <span className="flex flex-1 justify-center border-t border-black py-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg>
            </span>
            <span className="flex flex-1 justify-center py-2 opacity-40">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M10 9l5 3-5 3z" fill="currentColor" /></svg>
            </span>
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-3 gap-[2px]">
            {posts.slice(0, 9).map((p) => (
              <span key={p.shortcode} className="relative aspect-[3/4] overflow-hidden bg-[#eee]">
                <Image src={p.image} alt="" fill sizes="100px" className="object-cover" />
                {p.kind !== 'image' && (
                  <span className="absolute end-1 top-1 text-white drop-shadow">
                    {p.kind === 'video' ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12-7.5z" /></svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="7" width="13" height="13" rx="2" /><path d="M8 3h11a2 2 0 0 1 2 2v11" /></svg>
                    )}
                  </span>
                )}
              </span>
            ))}
          </div>
          {/* Home indicator */}
          <span className="absolute bottom-2 start-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-black/80" />
        </div>
      </div>
    </div>
  );
}

/** Instagram rail (Al Hilal "Must watch stories" style): phone mockup, portrait cards, dots, Follow us. */
export function InstagramStories({ profile, posts, title }: { profile: InstagramProfile; posts: InstagramPost[]; title?: string }) {
  const t = useTranslations('home');
  const scroller = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  // Active dot = the card closest to the rail's start edge (left in LTR, right in RTL)
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    const box = el.getBoundingClientRect();
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const r = child.getBoundingClientRect();
      const dist = Math.abs(rtl ? box.right - r.right : r.left - box.left);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  };

  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="ig-stories" className="rounded-3xl bg-surface-secondary/70 px-5 py-10 sm:px-10">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <h2 id="ig-stories" className="font-condensed text-5xl font-extrabold uppercase leading-none text-wydad-red sm:text-6xl">
            {title ?? t('ig_title')}
          </h2>
          <p className="mt-2 text-lg text-fg-secondary sm:text-xl">{t('ig_subtitle')}</p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="group mt-8 inline-flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white shadow-lg transition-transform group-hover:scale-105">
              <InstagramIcon className="h-9 w-9" />
            </span>
            <span>
              <span className="flex items-center gap-1.5 text-xl font-bold text-fg" dir="ltr">
                @{profile.username}
                <VerifiedBadge />
              </span>
              <span className="text-fg-secondary">
                <bdi>{millions(profile.followers)}</bdi> {t('ig_followers')} · <bdi>{thousands(profile.posts)}</bdi> {t('ig_posts')}
              </span>
            </span>
            <span className="sr-only"> {t('ig_new_tab')}</span>
          </a>
          <div className="mt-8 hidden lg:block">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-wydad-logo px-6 text-lg font-semibold text-white transition-colors hover:bg-wydad-red-hover"
            >
              <InstagramIcon className="h-5 w-5" />
              {t('ig_follow')}
              <span className="sr-only"> {t('ig_new_tab')}</span>
            </a>
          </div>
        </div>
        <PhoneMockup profile={profile} posts={posts} />
      </div>

      <div className="mt-8 rounded-3xl bg-surface p-4 sm:p-8">
        <ul ref={scroller} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto">
          {posts.map((p) => (
            <li key={p.shortcode} className="relative w-[70%] shrink-0 snap-start sm:w-[38%] lg:w-[calc((100%-120px)/6)]">
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-surface-secondary">
                <Image
                  src={p.image}
                  alt={p.caption || 'Instagram @wacofficiel'}
                  fill
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 38vw, 70vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <KindIcon kind={p.kind} />
                <span className="sr-only"> {t('ig_new_tab')}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-center gap-1.5 lg:hidden" aria-hidden>
          {posts.map((p, i) => (
            <span key={p.shortcode} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-4 bg-fg' : 'w-1.5 bg-fg/25'}`} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end lg:hidden">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-wydad-logo px-6 text-lg font-semibold text-white transition-colors hover:bg-wydad-red-hover"
        >
          {t('ig_follow')}
          <span className="sr-only"> {t('ig_new_tab')}</span>
        </a>
      </div>
    </section>
  );
}
