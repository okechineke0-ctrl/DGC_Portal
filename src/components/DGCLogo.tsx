import React from 'react';

interface DGCLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const DGCLogo: React.FC<DGCLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: { box: 36, textTitle: 'text-xs', textSub: 'text-[9px]' },
    md: { box: 44, textTitle: 'text-sm', textSub: 'text-[10px]' },
    lg: { box: 56, textTitle: 'text-base', textSub: 'text-xs' },
    xl: { box: 80, textTitle: 'text-xl', textSub: 'text-sm' },
  };

  const { box } = sizeMap[size];

  return (
    <div
      onClick={onClick}
      title="Dominion Global College - Awgu, Enugu"
      className={`flex items-center gap-2.5 select-none relative group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Official Dominion Global College Crest Logo */}
      <img
        src="/logo.svg"
        alt="Dominion Global College Crest Logo"
        width={box}
        height={box}
        style={{ width: `${box}px`, height: `${box}px` }}
        className="shrink-0 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-900 leading-tight text-sm md:text-base">
              Dominion Global
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-wider text-blue-900 uppercase leading-none">
            COLLEGE · AWGU
          </span>
        </div>
      )}
    </div>
  );
};
