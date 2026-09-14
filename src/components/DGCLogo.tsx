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
      title="Dominion Stars Global College"
      className={`flex items-center gap-2.5 select-none relative group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* SVG Emblem matching the DGC Dominion Global College crest */}
      <svg
        width={box}
        height={box}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform duration-200 hover:scale-102"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <linearGradient id="navyBorder" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="goldRibbon" x1="20" y1="160" x2="180" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <linearGradient id="capRed" x1="50" y1="60" x2="150" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="dgcLetterGrad" x1="30" y1="10" x2="170" y2="35" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>

        {/* Shield Outer Outline with decorative crown curves */}
        <path
          d="M100 22 C135 22 178 12 188 38 C188 85 186 128 100 178 C14 128 12 85 12 38 C22 12 65 22 100 22 Z"
          fill="url(#shieldGrad)"
          stroke="url(#navyBorder)"
          strokeWidth="6"
        />

        {/* Inner concentric ring / crest badge */}
        <circle cx="100" cy="98" r="62" fill="#1e3a8a" />
        <circle cx="100" cy="98" r="54" fill="#3b82f6" fillOpacity="0.25" stroke="#ffffff" strokeWidth="2.5" />

        {/* Top Letters: D G C */}
        <g transform="translate(0, -2)">
          <text
            x="52"
            y="26"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="26"
            fill="#1e3a8a"
            stroke="#ffffff"
            strokeWidth="1.5"
            textAnchor="middle"
          >
            D
          </text>
          <circle cx="100" cy="18" r="13" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
          <text
            x="100"
            y="25"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="22"
            fill="#ffffff"
            textAnchor="middle"
          >
            G
          </text>
          <text
            x="148"
            y="26"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="26"
            fill="#1e3a8a"
            stroke="#ffffff"
            strokeWidth="1.5"
            textAnchor="middle"
          >
            C
          </text>
        </g>

        {/* Arched College Ring Text */}
        <path id="archUpper" d="M 48,106 A 52,52 0 1,1 152,106" fill="none" />
        <text fontSize="8.5" fontFamily="'Cinzel', Georgia, serif" fontWeight="bold" fill="#ffffff" letterSpacing="0.8">
          <textPath href="#archUpper" startOffset="50%" textAnchor="middle">
            DOMINION GLOBAL COLLEGE
          </textPath>
        </text>

        {/* Red Stars */}
        <polygon points="40,126 43,133 50,133 44,138 46,145 40,140 34,145 36,138 30,133 37,133" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
        <polygon points="160,126 163,133 170,133 164,138 166,145 160,140 154,145 156,138 150,133 157,133" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />

        {/* Center Icons: Textbooks stacked */}
        {/* Book 1 (bottom) */}
        <path d="M 64 122 L 126 94 L 140 102 L 78 130 Z" fill="#334155" />
        <path d="M 64 122 L 78 130 L 78 136 L 64 128 Z" fill="#e2e8f0" />
        <path d="M 78 136 L 140 108 L 140 102 L 78 130 Z" fill="#cbd5e1" />
        {/* Book 2 (middle) */}
        <path d="M 68 114 L 124 88 L 136 95 L 80 121 Z" fill="#1e293b" stroke="#0284c7" strokeWidth="1" />
        {/* Book 3 (top) */}
        <path d="M 72 106 L 122 83 L 132 89 L 82 112 Z" fill="#0f172a" />

        {/* Graduation Cap (Red Mortarboard) */}
        <polygon points="100,56 142,75 100,88 58,75" fill="url(#capRed)" stroke="#991b1b" strokeWidth="1.5" />
        <path d="M 78 79 L 78 92 C 78 99, 122 99, 122 92 L 122 79" fill="#991b1b" />
        {/* Cap Button & Golden Tassel */}
        <circle cx="100" cy="73" r="2.5" fill="#facc15" />
        <path d="M 100 73 C 114 74, 128 85, 130 98" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
        <polygon points="128,97 132,97 134,106 126,106" fill="#facc15" />

        {/* Diploma Certificate Scroll with Red Ribbon */}
        <rect x="76" y="132" width="62" height="12" rx="3" transform="rotate(-14 76 132)" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
        <rect x="104" y="125" width="8" height="13" transform="rotate(-14 104 125)" fill="#dc2626" />
        {/* Ribbon tails */}
        <path d="M 112 135 L 118 144 L 111 146 Z" fill="#b91c1c" />
        <path d="M 108 136 L 105 146 L 112 145 Z" fill="#ef4444" />

        {/* Location Ribbon */}
        <path d="M 52 148 Q 100 162 148 148 L 144 159 Q 100 171 56 159 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
        <text x="100" y="157.5" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="8" fill="#ffffff" textAnchor="middle" letterSpacing="0.8">
          EXCELLENCE
        </text>

        {/* Motto Banner: MOTTO: STRIVING FOR THE CROWN OF EXCELLENCE */}
        <path
          d="M 12 158 Q 100 188 188 158 L 184 178 Q 100 204 16 178 Z"
          fill="url(#goldRibbon)"
          stroke="#ca8a04"
          strokeWidth="1.5"
        />
        <text
          x="100"
          y="173"
          fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
          fontWeight="800"
          fontSize="6.2"
          fill="#7f1d1d"
          textAnchor="middle"
          letterSpacing="0.3"
        >
          MOTTO: STRIVING FOR THE CROWN OF EXCELLENCE
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-900 leading-tight text-sm md:text-base">
              Dominion Stars
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase leading-none">
            GLOBAL COLLEGE
          </span>
        </div>
      )}
    </div>
  );
};
