import React from 'react';

interface DGCLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'on-dark';
  className?: string;
  onClick?: () => void;
}

export const DGCLogo: React.FC<DGCLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'default',
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: { box: 32, pad: 'p-1', rounded: 'rounded-xl', textTitle: 'text-xs', textSub: 'text-[9px]' },
    md: { box: 40, pad: 'p-1', rounded: 'rounded-xl', textTitle: 'text-sm', textSub: 'text-[10px]' },
    lg: { box: 52, pad: 'p-1.5', rounded: 'rounded-2xl', textTitle: 'text-base', textSub: 'text-xs' },
    xl: { box: 72, pad: 'p-2', rounded: 'rounded-2xl', textTitle: 'text-xl', textSub: 'text-sm' },
  };

  const { box, pad, rounded } = sizeMap[size];

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title="Dominion Star Global College - Awgu, Enugu"
      aria-label="Dominion Star Global College Official Crest"
      className={`flex items-center gap-2.5 select-none relative group ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
    >
      {/* Official Dominion Star Global College Crest Logo in Clean White Emblem Badge */}
      <div className={`bg-white ${pad} ${rounded} shadow-xs border border-slate-200/90 shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105`}>
        <img
          src="/1789397544433.jpg"
          alt="Dominion Star Global College Crest Logo"
          width={box}
          height={box}
          style={{ width: `${box}px`, height: `${box}px` }}
          className="shrink-0 object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight leading-tight text-sm md:text-base ${
              variant === 'on-dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Dominion Star
            </span>
          </div>
          <span className={`text-[10px] font-bold tracking-wider uppercase leading-none ${
            variant === 'on-dark' ? 'text-blue-200' : 'text-blue-900'
          }`}>
            GLOBAL COLLEGE
          </span>
        </div>
      )}
    </div>
  );
};
