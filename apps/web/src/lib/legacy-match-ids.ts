/**
 * Match ids from TheStatsAPI (the previous data provider) → Goal API ids, so links shared before
 * the switch (/matches/mt_…) still open the right match centre.
 */
export const LEGACY_MATCH_IDS: Record<string, string> = {
  mt_982767800: 'cmtwihhyf5ec6qs07aa74zwqo',
  mt_735424375: 'cmu9exfop16wikm08sjxacs94',
  mt_982177608: 'cmuuzned3tv2vti07yy6v9d7j',
  mt_371866534: 'cmuuzodrtu4noti07roj377su',
  mt_468151508: 'cmvgff319ojujnv07n48jhibs',
};
