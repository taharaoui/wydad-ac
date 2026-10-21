interface WydadCrestProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'mono-light' | 'mono-dark';
}

/**
 * Wydad Athletic Club crest — a stylised shield with the "W" monogram,
 * star (for continental titles) and founding year.
 *
 * Variants:
 *  - full: red & white (default)
 *  - mono-light: all white (for dark backgrounds)
 *  - mono-dark: all dark (for light backgrounds)
 */
export function WydadCrest({ className = '', size = 40, variant = 'full' }: WydadCrestProps) {
  const red = variant === 'full' ? '#EA332F' : variant === 'mono-light' ? '#FFFFFF' : '#1A1A18';
  const white = variant === 'full' ? '#FFFFFF' : variant === 'mono-light' ? '#FFFFFF' : '#1A1A18';
  const accent = variant === 'full' ? '#EA332F' : variant === 'mono-light' ? 'rgba(255,255,255,0.7)' : 'rgba(26,26,24,0.6)';

  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Wydad Athletic Club"
    >
      {/* Shield shape */}
      <path
        d="M50 2 L95 20 L95 65 Q95 95 50 118 Q5 95 5 65 L5 20 Z"
        fill={red}
        stroke={white}
        strokeWidth="2"
      />

      {/* Inner shield border */}
      <path
        d="M50 8 L89 24 L89 63 Q89 90 50 112 Q11 90 11 63 L11 24 Z"
        fill="none"
        stroke={white}
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Star — for the 3 CAF Champions League titles */}
      <polygon
        points="50,14 53,22 61,22 55,27 57,35 50,30 43,35 45,27 39,22 47,22"
        fill={white}
      />

      {/* W monogram — bold & angular */}
      <path
        d="M24 45 L32 80 L42 58 L50 80 L58 58 L68 80 L76 45
           L70 45 L65 70 L58 50 L50 72 L42 50 L35 70 L30 45 Z"
        fill={white}
      />

      {/* Founding year */}
      <text
        x="50"
        y="98"
        textAnchor="middle"
        fill={white}
        fontSize="10"
        fontWeight="700"
        fontFamily="Cairo, sans-serif"
        letterSpacing="2"
        opacity="0.85"
      >
        1937
      </text>

      {/* Horizontal accent lines */}
      <line x1="22" y1="38" x2="78" y2="38" stroke={accent} strokeWidth="1" opacity="0.5" />
      <line x1="25" y1="90" x2="75" y2="90" stroke={accent} strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
