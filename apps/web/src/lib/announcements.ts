import { TICKETS_URL } from './links';
import { VIDEOS } from './videos';

/**
 * Flash-bar announcements, in display order. Text lives in the `header` messages so each
 * announcement exists in AR / FR / EN. The next-match announcement is added automatically from
 * the fixtures API, before these. Remove an entry here to retire it.
 */
export interface AnnouncementConfig {
  id: string;
  /** Message key; may use {title} */
  messageKey: string;
  ctaKey?: string;
  href?: string;
  /** Value for {title}, per language */
  title?: { ar: string; fr: string; en: string };
  /** ISO date-time, formatted in Moroccan time into {date} */
  date?: string;
  /** Hidden from this moment on (ISO date-time), e.g. once an event is over */
  until?: string;
}

const latestVideo = VIDEOS[0];

export const ANNOUNCEMENTS: AnnouncementConfig[] = [
  {
    // Basketball, DISLOG Basketball League matchday 3: Wydad vs FUS, Mohammed V complex arena
    id: 'basket-wac-fus-2026-10-26',
    messageKey: 'announce_basket_wac_fus',
    ctaKey: 'announce_basket_cta',
    href: '/basketball',
    date: '2026-10-26T18:00:00Z',
    until: '2026-10-26T21:00:00Z',
  },
  { id: 'tickets', messageKey: 'announce_tickets', ctaKey: 'announce_tickets_cta', href: TICKETS_URL },
  ...(latestVideo
    ? [
        {
          id: `video-${latestVideo.id}`,
          messageKey: 'announce_video',
          ctaKey: 'announce_video_cta',
          href: `/wydad-tv/${latestVideo.id}`,
          title: latestVideo.title,
        },
      ]
    : []),
];
