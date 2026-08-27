import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, ArrowRight, UserCheck, CheckCircle2, Truck, Sparkles } from 'lucide-react';
import { loginWithGoogleSSO, LOGSHARE_AUTHORIZED_SPECIALISTS } from '../../services/authService';
import LogShareLogo from '../UI/LogShareLogo';

export default function GoogleLoginModal({ onLoginSuccess, onSwitchToCarrierPublic }) {
  const [selectedSpecialist, setSelectedSpecialist] = useState(LOGSHARE_AUTHORIZED_SPECIALISTS[0].email);
  const [customEmail, setCustomEmail] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleGoogleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const email = isCustom ? customEmail : selectedSpecialist;
    const res = await loginWithGoogleSSO(email);
    setLoading(false);

    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #103265 0%, #0A192F 100%)',
      padding: '1.5rem'
    }}>
      <div className="card animate-scale-up" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <LogShareLogo height={44} variant="dark" />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#E0EDFF', color: '#0056D2', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Lock size={12} />
            <span>ACESSO RESTRITO — ESPECIALISTAS LOGSHARE</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', color: 'var(--primary-900)', marginBottom: '0.4rem' }}>
            Homologação & Gestão de Risco
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Autentique-se com sua conta corporativa <strong>Google Workspace (@logshare.com.br)</strong> para gerenciar os cadastros e pareceres.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            background: 'var(--status-nao-apta-bg)',
            border: '1px solid var(--status-nao-apta-border)',
            color: 'var(--status-nao-apta-text)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profile Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ marginBottom: '0.6rem' }}>
            Selecione seu perfil de especialista ou digite seu e-mail:
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {LOGSHARE_AUTHORIZED_SPECIALISTS.map(spec => (
              <div
                key={spec.id}
                onClick={() => {
                  setSelectedSpecialist(spec.email);
                  setIsCustom(false);
                  setErrorMessage(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${(!isCustom && selectedSpecialist === spec.email) ? 'var(--primary-600)' : 'var(--border-light)'}`,
                  background: (!isCustom && selectedSpecialist === spec.email) ? 'var(--status-apta-bg)' : 'white',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'var(--primary-700)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {spec.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                    {spec.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {spec.email} • <span style={{ color: 'var(--primary-600)' }}>{spec.role}</span>
                  </div>
                </div>
                {(!isCustom && selectedSpecialist === spec.email) && (
                  <CheckCircle2 size={18} color="var(--status-apta-solid)" />
                )}
              </div>
            ))}
          </div>

          {/* Custom Email Option */}
          <div style={{ paddingTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              {isCustom ? "← Escolher especialista da lista" : "Outro e-mail @logshare.com.br"}
            </button>

            {isCustom && (
              <div style={{ marginTop: '0.5rem' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="seu.nome@logshare.com.br"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* Google SSO Login Action Button */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleGoogleSubmit}
          disabled={loading || (isCustom && !customEmail)}
          style={{
            width: '100%',
            padding: '0.85rem 1.25rem',
            fontSize: '0.925rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-md)',
            background: 'linear-gradient(135deg, #0056D2 0%, #0A192F 100%)'
          }}
        >
          {/* Google Multicolored "G" Logo */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>{loading ? "Autenticando no Google..." : "Entrar com Google Workspace"}</span>
        </button>

        {/* Switch to Carrier Public View */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-light)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            É um transportador parceiro preenchendo seu cadastro?
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onSwitchToCarrierPublic}
            style={{ width: '100%', fontSize: '0.8rem' }}
          >
            <Truck size={14} />
            <span>Acessar Portal do Transportador Externo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
