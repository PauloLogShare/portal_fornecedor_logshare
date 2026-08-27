import React from 'react';
import logoImg from '../../assets/logo_logshare.png';

export default function LogShareLogo({ height = 34, variant = 'color', showText = true, className = '' }) {
  // Em fundos escuros (header/navbar/dark cards), envolve em badge branco sutil para legibilidade máxima
  if (variant === 'white' || variant === 'color' || variant === 'onDark') {
    return (
      <div style={{
        background: '#FFFFFF',
        padding: '3px 8px',
        borderRadius: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        flexShrink: 0
      }}>
        <img
          src={logoImg}
          alt="LogShare"
          style={{ height: `${height}px`, width: 'auto', display: 'block', objectFit: 'contain' }}
          className={className}
        />
      </div>
    );
  }

  // Em fundos claros/brancos (papel timbrado, pareceres, modais), renderiza diretamente transparente
  return (
    <img
      src={logoImg}
      alt="LogShare"
      style={{ height: `${height}px`, width: 'auto', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain', flexShrink: 0 }}
      className={className}
    />
  );
}
