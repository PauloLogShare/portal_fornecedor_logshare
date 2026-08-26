import React from 'react';

export default function LogShareLogo({ height = 36, variant = 'color', showText = true }) {
  // variant: 'color' (for dark header/light text), 'dark' (for white paper/navy text), 'iconOnly'
  const textColor = variant === 'dark' ? '#1E2544' : '#FFFFFF';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', verticalAlign: 'middle' }}>
      {/* SVG Icon: 3 Interconnected Geolocation Pins/Nodes */}
      <svg
        height={height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Top Node - Red */}
        <path
          d="M50 12C38.9543 12 30 20.9543 30 32C30 41.5 44 58 50 64C56 58 70 41.5 70 32C70 20.9543 61.0457 12 50 12Z"
          fill="#E53935"
        />
        <circle cx="50" cy="31" r="9" fill="#FFFFFF" />

        {/* Bottom Left Node - Navy */}
        <path
          d="M26 48C14.9543 48 6 56.9543 6 68C6 77.5 20 94 26 100C32 94 46 77.5 46 68C46 56.9543 37.0457 48 26 48Z"
          fill="#1E2243"
          transform="translate(2, -8)"
        />
        <circle cx="28" cy="60" r="9" fill="#FFFFFF" />

        {/* Bottom Right Node - Teal / Green */}
        <path
          d="M68 48C56.9543 48 48 56.9543 48 68C48 77.5 62 94 68 100C74 94 88 77.5 88 68C88 56.9543 79.0457 48 68 48Z"
          fill="#00A896"
          transform="translate(4, -8)"
        />
        <circle cx="72" cy="60" r="9" fill="#FFFFFF" />
      </svg>

      {/* Stylized Wordmark */}
      {showText && (
        <div style={{ display: 'flex', alignItems: 'baseline', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
          <span style={{ fontSize: `${height * 0.72}px`, fontWeight: 800, letterSpacing: '-0.03em', color: textColor }}>
            LogShare
          </span>
          <span style={{ fontSize: `${height * 0.32}px`, fontWeight: 700, marginLeft: '2px', color: textColor, opacity: 0.85 }}>
            ®
          </span>
        </div>
      )}
    </div>
  );
}
