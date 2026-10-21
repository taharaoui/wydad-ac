'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

interface MatchCountdownProps {
  kickoff: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(kickoff: string): TimeLeft | null {
  const diff = new Date(kickoff).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const LABELS = {
  ar: { days: 'أيام', hours: 'ساعات', minutes: 'دقائق', seconds: 'ثوانٍ' },
  fr: { days: 'jours', hours: 'heures', minutes: 'minutes', seconds: 'secondes' },
  en: { days: 'days', hours: 'hours', minutes: 'min', seconds: 'sec' },
} as const;

export function MatchCountdown({ kickoff }: MatchCountdownProps) {
  const locale = useLocale() as 'ar' | 'fr' | 'en';
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft(kickoff));
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(kickoff));
    }, 1000);
    return () => clearInterval(interval);
  }, [kickoff]);

  if (!mounted || !timeLeft) return null;

  const labels = LABELS[locale] || LABELS.en;
  const units = [
    { value: timeLeft.days, label: labels.days },
    { value: timeLeft.hours, label: labels.hours },
    { value: timeLeft.minutes, label: labels.minutes },
    { value: timeLeft.seconds, label: labels.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {units.map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center">
            <span className="font-display text-xl font-bold text-white tabular-nums sm:text-2xl">
              {String(value).padStart(2, '0')}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40 sm:text-xs">
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="mb-3 text-lg font-light text-white/20">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
