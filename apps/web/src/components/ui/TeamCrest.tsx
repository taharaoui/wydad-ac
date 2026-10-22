import Image from 'next/image';
import { clubCrestUrl } from '@/lib/clubs';

interface TeamCrestProps {
  team: { id: string; name: string; short_name: string; logo_url?: string };
  /** Rendered size in px (square box; the crest keeps its aspect ratio inside it) */
  size: number;
  /** Classes for the initials badge shown when the club has no crest */
  fallbackClassName?: string;
  className?: string;
}

export function TeamCrest({ team, size, fallbackClassName = '', className = '' }: TeamCrestProps) {
  const src = team.logo_url ?? clubCrestUrl(team.id, team.name);

  if (!src) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center font-bold ${fallbackClassName} ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.28)) }}
        aria-label={team.name}
      >
        {team.short_name.slice(0, 3)}
      </span>
    );
  }

  return (
    <span className={`relative block shrink-0 ${className}`} style={{ width: size, height: size }}>
      <Image src={src} alt={team.name} fill sizes={`${size * 2}px`} className="object-contain" />
    </span>
  );
}
