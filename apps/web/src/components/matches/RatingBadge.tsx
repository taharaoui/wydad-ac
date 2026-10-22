import { formatRating, ratingColor } from '@/lib/rating';

interface RatingBadgeProps {
  rating: number | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'min-w-[2rem] px-1 py-px text-[11px]',
  md: 'min-w-[2.5rem] px-1.5 py-0.5 text-xs',
  lg: 'min-w-[3.5rem] px-2 py-1 text-xl',
};

export function RatingBadge({ rating, size = 'md', className = '' }: RatingBadgeProps) {
  if (rating == null) {
    return (
      <span className={`inline-flex items-center justify-center rounded-md bg-fg-muted/20 font-bold text-fg-muted ${SIZES[size]} ${className}`}>
        –
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-bold tabular-nums text-white ${SIZES[size]} ${className}`}
      style={{ backgroundColor: ratingColor(rating) }}
    >
      {formatRating(rating)}
    </span>
  );
}
