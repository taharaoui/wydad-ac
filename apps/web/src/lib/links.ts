/** Official Wydad ticketing platform. Override with NEXT_PUBLIC_TICKETS_URL if it ever moves. */
export const TICKETS_URL = process.env.NEXT_PUBLIC_TICKETS_URL || 'https://wydad.ticketing.ma/';

/** On-site page that embeds the ticketing platform, so visitors stay on the club site */
export const TICKETS_PAGE = '/billetterie';
