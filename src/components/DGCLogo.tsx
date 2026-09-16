import React from 'react';

interface DGCLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  /** Use `light` on dark headers so the wordmark stays legible. */
  tone?: 'dark' | 'light';
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: { box: 'w-9 h-9', title: 'text-sm', sub: 'text-[9px]' },
  md: { box: 'w-11 h-11', title: 'text-base', sub: 'text-[10px]' },
  lg: { box: 'w-14 h-14', title: 'text-lg', sub: 'text-[11px]' },
  xl: { box: 'w-20 h-20', title: 'text-2xl', sub: 'text-xs' },
} as const;

export const DGCLogo: React.FC<DGCLogoProps> = ({
  size = 'md',
  showText = true,
  tone = 'dark',
  className = '',
  onClick,
}) => {
  const { box, title, sub } = sizeMap[size];
  const isLight = tone === 'light';

  return (
    <div
      onClick={onClick}
      title="Dominion Global College — Awgu, Enugu"
      className={`flex items-center gap-2.5 select-none relative group min-w-0 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Official Dominion Global College crest, framed so the square artwork
          sits cleanly on both light cards and dark headers. */}
      <span
        className={`${box} shrink-0 grid place-items-center rounded-xl bg-white p-1 ring-1 ring-slate-900/10 shadow-sm overflow-hidden transition-transform duration-200 group-hover:scale-105`}
      >
        <img
          src="/1789397544433.jpg"
          alt="Dominion Global College crest"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </span>

      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`${title} font-extrabold tracking-tight leading-tight truncate ${
              isLight ? 'text-white' : 'text-slate-900'
            }`}
          >
            Dominion Global
          </span>
          <span
            className={`${sub} font-bold tracking-[0.18em] uppercase leading-none truncate ${
              isLight ? 'text-blue-200' : 'text-blue-900'
            }`}
          >
            College · Awgu
          </span>
        </div>
      )}
    </div>
  );
};
