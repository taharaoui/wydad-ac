import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getMatchById, getMatchContext, getStandings } from '@/services/matches';
import { MatchHeader } from '@/components/matches/MatchHeader';
import { MatchStatsPanel } from '@/components/matches/MatchStats';
import { MatchPitch } from '@/components/matches/MatchPitch';
import { PlayerOfTheMatch } from '@/components/matches/PlayerOfTheMatch';
import { PlayerStatsTable } from '@/components/matches/PlayerStatsTable';
import { isWydadTeam } from '@/lib/stats-api';
import { getPlayerOfTheMatch } from '@/lib/rating';
import { buildMatchSummary, teamAverageRating } from '@/lib/match-summary';
import { getPlayerPhotos } from '@/lib/player-photos';
import { formatKickoff, formatKickoffLong } from '@/lib/datetime';
import { findArryadiaHighlight, highlightsSearchUrl } from '@/lib/highlights';
import { getVideos, matchVideos } from '@/lib/videos';
import { BehindTheScenes } from '@/components/matches/centre/BehindTheScenes';
import { isWydad } from '@/lib/clubs';
import { currentWydadCoach } from '@/lib/match-notes';
import { getCmsPlayerPhotos, getMatchNote } from '@/lib/cms/club';
import type { Match } from '@/types';
import { MatchTabs, type MatchTab } from '@/components/matches/centre/MatchTabs';
import { HighlightsCard } from '@/components/matches/centre/HighlightsCard';
import { Commentary, type CommentaryItem } from '@/components/matches/centre/Commentary';
import { MatchInfoCard } from '@/components/matches/centre/MatchInfoCard';
import { MiniStandings } from '@/components/matches/centre/MiniStandings';
import { FormPills } from '@/components/matches/centre/FormGuide';
import { H2HPanel } from '@/components/matches/centre/H2HPanel';
import { TeamCrest } from '@/components/ui/TeamCrest';

/**
 * Rendered on first visit, then cached, instead of at build time: prerendering every page would
 * exceed TheStatsAPI's 12 requests/minute and bake demo data into them.
 */
export function generateStaticParams() {
  return [];
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [match, standings] = await Promise.all([getMatchById(id), getStandings()]);
  if (!match) notFound();

  const t = await getTranslations({ locale, namespace: 'matches' });
  const context = await getMatchContext(match);

  const isFinished = match.status === 'finished';
  const played = isFinished || match.status === 'live';
  const hasEvents = !!match.events && match.events.length > 0;
  const hasStats = !!match.stats;
  const hasLineups = !!match.home_lineup && !!match.away_lineup;
  const hasRatings = [match.home_lineup, match.away_lineup].some(
    (l) => l?.players.some((p) => p.rating != null),
  );

  // Wydad always in club red, opponent in blue
  const WYDAD = 'rgb(var(--color-wydad-red))';
  const OPPONENT = 'rgb(var(--color-accent-blue))';
  const homeColor = isWydadTeam(match.home_team.id) ? WYDAD : OPPONENT;
  const awayColor = isWydadTeam(match.home_team.id) ? OPPONENT : WYDAD;

  const summary = buildMatchSummary(match);
  // Hand-entered scorers/venue when the source has none
  const note = await getMatchNote(match.id);
  if (note?.goals?.length) {
    summary.goals = note.goals.map((g) => ({ side: g.side, player: g.player, count: 1, assists: [], minute: g.minute, penalty: g.penalty }));
  }
  if (note?.venue && !match.venue) match.venue = note.venue;
  // The source still lists departed Wydad coaches on later fixtures
  if (isWydadTeam(match.home_team.id)) match.home_coach = currentWydadCoach(match.home_coach, match.kickoff);
  else match.away_coach = currentWydadCoach(match.away_coach, match.kickoff);
  const potm = getPlayerOfTheMatch(match.home_lineup, match.away_lineup);
  const playerIds = [...(match.home_lineup?.players ?? []), ...(match.away_lineup?.players ?? [])].map((p) => p.id);
  // Photos set in the CMS win over the files in public/assets/players
  const photos = { ...getPlayerPhotos(playerIds), ...(await getCmsPlayerPhotos(playerIds)) };
  const dateLabel = formatKickoffLong(match.kickoff, locale);
  const wydadTeam = isWydad(match.home_team.id) ? match.home_team : match.away_team;

  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB';
  const shortDate = (m: Match) =>
    new Intl.DateTimeFormat(dateLocale, { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'Africa/Casablanca' })
      .format(new Date(m.kickoff));

  const home = {
    team: match.home_team,
    name: match.home_team.name,
    lineup: match.home_lineup!,
    color: homeColor,
    rating: teamAverageRating(match.home_lineup),
    coach: match.home_coach,
  };
  const away = {
    team: match.away_team,
    name: match.away_team.name,
    lineup: match.away_lineup!,
    color: awayColor,
    rating: teamAverageRating(match.away_lineup),
    coach: match.away_coach,
  };

  const formCard = (context.wydadForm.length > 0 || context.opponentForm.length > 0) && (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-3 font-display text-base font-bold text-fg">{t('recent_form')}</h3>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
        {[
          [wydadTeam, context.wydadForm],
          [context.opponent, context.opponentForm],
        ].map(([team, list]) => (
          <div key={(team as Match['home_team']).id} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-fg">
              <TeamCrest team={team as Match['home_team']} size={22} fallbackClassName="rounded-full bg-surface-secondary text-fg-muted" />
              <span className="truncate">{(team as Match['home_team']).name}</span>
            </span>
            <FormPills matches={list as Match[]} teamId={(team as Match['home_team']).id} />
          </div>
        ))}
      </div>
    </section>
  );

  // Commentary feed, newest first. Botola has no timeline in the API, so it is rebuilt
  // from the player stats (goals and cards come without a minute).
  const teamName = (side: 'home' | 'away') => (side === 'home' ? match.home_team.name : match.away_team.name);
  const commentary: CommentaryItem[] = [];
  if (played) {
    if (isFinished) {
      commentary.push({
        id: 'ft',
        kind: 'full_time',
        label: t('ft_badge'),
        minute: 90,
        text: t('ft_text', { home: match.home_team.name, hs: match.score_home ?? 0, away: match.away_team.name, as: match.score_away ?? 0 }),
      });
    }
    if (hasEvents) {
      for (const e of [...match.events!].sort((a, b) => b.minute - a.minute)) {
        const side = e.team_id === match.home_team.id ? 'home' : 'away';
        const team = teamName(side);
        if (e.type === 'goal' || e.type === 'penalty_scored' || e.type === 'own_goal') {
          commentary.push({ id: e.id, kind: 'goal', minute: e.minute, text: t('goal_text', { player: e.player_name, team }) });
        } else if (e.type === 'yellow_card' || e.type === 'red_card') {
          commentary.push({ id: e.id, kind: e.type === 'red_card' ? 'red' : 'yellow', minute: e.minute, text: t(e.type === 'red_card' ? 'card_red_text' : 'card_yellow_text', { player: e.player_name, team }) });
        } else if (e.type === 'substitution') {
          commentary.push({ id: e.id, kind: 'sub', minute: e.minute, text: e.assist_name ? t('sub_text', { team, in: e.player_name, out: e.assist_name }) : t('sub_text_in', { team, in: e.player_name }) });
        }
      }
    } else {
      summary.goals.forEach((g, i) =>
        commentary.push({
          id: `g${i}`,
          kind: 'goal',
          minute: g.minute,
          text:
            g.count > 1
              ? t('goal_text_multi', { player: g.player, count: g.count, team: teamName(g.side) })
              : t(g.penalty ? 'goal_pen_text' : 'goal_text', { player: g.player, team: teamName(g.side) }),
        }),
      );
      summary.cards
        .slice()
        .sort((a, b) => (a.color === b.color ? 0 : a.color === 'red' ? -1 : 1))
        .forEach((c, i) =>
          commentary.push({
            id: `c${i}`,
            kind: c.color === 'red' ? 'red' : 'yellow',
            text: t(c.color === 'red' ? 'card_red_text' : 'card_yellow_text', { player: c.player, team: teamName(c.side) }),
          }),
        );
      summary.subs
        .slice()
        .reverse()
        .forEach((sub, i) =>
          commentary.push({
            id: `s${i}`,
            kind: 'sub',
            minute: sub.minute,
            text: sub.playerOut
              ? t('sub_text', { team: teamName(sub.side), in: sub.playerIn, out: sub.playerOut })
              : t('sub_text_in', { team: teamName(sub.side), in: sub.playerIn }),
          }),
        );
    }
    // Latest first; events without a minute stay at the top, in their original order
    const head = commentary[0]?.kind === 'full_time' ? 1 : 0;
    const timed = commentary.splice(head).sort((a, b) => (b.minute ?? Infinity) - (a.minute ?? Infinity));
    commentary.push(...timed);
    commentary.push({ id: 'ko', kind: 'kick_off', label: t('kickoff'), minute: 0, text: t('ko_text', { home: match.home_team.name, away: match.away_team.name }) });
  }

  const [highlightId, clubVideos] = await Promise.all([
    note?.highlightYoutubeId ?? findArryadiaHighlight(match),
    getVideos(),
  ]);
  const btsVideos = matchVideos(clubVideos, match);

  const extras = (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-5">
        <HighlightsCard
          videoId={highlightId}
          searchUrl={highlightsSearchUrl(match.home_team.name, match.away_team.name)}
          finished={played}
          title={`${match.home_team.name} – ${match.away_team.name}`}
        />
        <BehindTheScenes videos={btsVideos} />
        {potm && (
          <PlayerOfTheMatch
            player={potm.player}
            teamName={potm.side === 'home' ? match.home_team.name : match.away_team.name}
            color={potm.side === 'home' ? homeColor : awayColor}
          />
        )}
      </div>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-5">
        <MatchInfoCard match={match} dateLabel={dateLabel} officials={note?.officials} locale={locale} />
        <MiniStandings standings={standings} teamIds={[match.home_team.id, match.away_team.id]} />
        {formCard}
      </div>
    </div>
  );

  const overview = played ? (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-14">
      <Commentary items={commentary} keyMomentsLabel={t('key_moments')} note={hasEvents || note?.goals?.length ? undefined : t('events_note')} />
      {extras}
    </div>
  ) : (
    extras
  );

  const unavailable = (
    <p className="rounded-2xl border border-border bg-surface p-5 text-sm text-fg-muted">
      {t('detailed_stats_unavailable')}
    </p>
  );

  const tabs: MatchTab[] = [
    { id: 'overview', label: t('tab_overview'), title: played ? t('commentary') : t('tab_overview'), icon: 'overview', content: overview },
  ];
  if (hasLineups) {
    tabs.push({
      id: 'lineups',
      label: t('tab_lineups'),
      title: t('tab_lineups'),
      icon: 'lineups',
      content: <MatchPitch home={home} away={away} playerOfTheMatchId={potm?.player.id} photos={photos} />,
    });
  }
  if (played) {
    tabs.push({
      id: 'stats',
      label: t('tab_stats'),
      title: t('tab_stats'),
      icon: 'stats',
      content: hasStats || hasRatings ? (
        <div className="grid gap-5">
          {hasStats && <MatchStatsPanel stats={match.stats!} homeColor={homeColor} awayColor={awayColor} />}
          {hasLineups && hasRatings && <PlayerStatsTable home={home} away={away} />}
        </div>
      ) : (
        unavailable
      ),
    });
  }
  tabs.push({
    id: 'h2h',
    label: t('tab_h2h'),
    title: t('tab_h2h'),
    icon: 'h2h',
    content: <H2HPanel context={context} wydad={wydadTeam} dateOf={shortDate} />,
  });

  return (
    <div>
      <MatchHeader
        match={match}
        dateLabel={dateLabel}
        timeLabel={formatKickoff(match.kickoff, locale).time}
        goals={summary.goals}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <MatchTabs tabs={tabs} />
      </div>
    </div>
  );
}
