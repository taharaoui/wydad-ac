import { getLocale } from 'next-intl/server';
import { getAnnouncements } from '@/lib/cms/site';
import { SmartLink } from './header/SmartLink';

/** Announcement banners set in the CMS (active and within their dates); nothing when there are none */
export async function AnnouncementBar() {
  const announcements = await getAnnouncements(await getLocale());
  if (announcements.length === 0) return null;
  return (
    <div className="relative z-[60] border-b border-wydad-logo/15 bg-white text-wydad-logo">
      {announcements.map((a) => (
        <p key={a.id} className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-sm font-medium sm:px-6 lg:px-8">
          <span>{a.message}</span>
          {a.linkUrl && (
            <SmartLink href={a.linkUrl} className="font-condensed font-bold uppercase tracking-wide underline underline-offset-4 hover:no-underline">
              {a.linkLabel || '→'}
            </SmartLink>
          )}
        </p>
      ))}
    </div>
  );
}
