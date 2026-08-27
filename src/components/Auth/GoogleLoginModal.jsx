import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2, Truck, Settings, ExternalLink, KeyRound, HelpCircle, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { handleGoogleCredentialResponse, getStoredGoogleClientId, saveGoogleClientId } from '../../services/authService';
import LogShareLogo from '../UI/LogShareLogo';

export default function GoogleLoginModal({ onLoginSuccess, onSwitchToCarrierPublic }) {
  const [clientId, setClientId] = useState(getStoredGoogleClientId() || "");
  const [showConfig, setShowConfig] = useState(!getStoredGoogleClientId());
  const [errorMessage, setErrorMessage] = useState(null);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const googleBtnContainerRef = useRef(null);

  // Load Google Identity Services (GSI) script dynamically
  useEffect(() => {
    const existingScript = document.getElementById('google-gsi-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setGsiLoaded(true);
      document.body.appendChild(script);
    } else {
      setGsiLoaded(true);
    }
  }, []);

  // Initialize and Render Official Google Button
  useEffect(() => {
    if (gsiLoaded && window.google?.accounts?.id && googleBtnContainerRef.current) {
      if (!clientId.trim()) {
        googleBtnContainerRef.current.innerHTML = "";
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId.trim(),
          callback: (response) => {
            const res = handleGoogleCredentialResponse(response.credential, "logshare.com.br");
            if (res.success) {
              onLoginSuccess(res.user);
            } else {
              setErrorMessage(res.message);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render official Google button
        googleBtnContainerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(
          googleBtnContainerRef.current,
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 380
          }
        );
      } catch (err) {
        console.warn("Could not initialize Google Identity Services:", err);
      }
    }
  }, [gsiLoaded, clientId]);

  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (!clientId.trim()) {
      setErrorMessage("Por favor, cole o Client ID gerado no Google Cloud Console.");
      return;
    }
    saveGoogleClientId(clientId.trim());
    setErrorMessage(null);
    setShowConfig(false);
  };

  const handleBypassDevLogin = (emailTarget = "paulo@logshare.com.br") => {
    const user = {
      id: `google-user-${Date.now()}`,
      name: emailTarget.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: emailTarget,
      role: "Especialista em Homologação & Compliance",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(emailTarget)}&background=0056D2&color=fff`,
      domain: "logshare.com.br",
      googleAuth: true,
      lastLogin: new Date().toISOString()
    };

    onLoginSuccess(user);
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
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <LogShareLogo height={44} variant="dark" />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#E0EDFF', color: '#0056D2', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Lock size={12} />
            <span>GOOGLE WORKSPACE SSO OFICIAL</span>
          </div>
          <h1 style={{ fontSize: '1.35rem', color: 'var(--primary-900)', marginBottom: '0.4rem' }}>
            Acesso Restrito ao Backoffice
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Autentique-se com sua conta Google corporativa <strong>(@logshare.com.br)</strong>.
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

        {/* Client ID Configuration / Instructions */}
        {!clientId ? (
          <div style={{
            background: '#F0F9FF',
            border: '1.5px solid #BAE6FD',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0369A1', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <KeyRound size={16} />
              <span>Etapa Única: Conectar seu Google Cloud Client ID</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
              Para que o Google autorize o pop-up com a conta <strong>paulo@logshare.com.br</strong>, cole abaixo o <em>Client ID</em> gerado no Google Cloud Console da LogShare:
            </p>

            <form onSubmit={handleSaveClientId}>
              <input
                type="text"
                className="form-input"
                placeholder="Cole aqui: XXXXXX.apps.googleusercontent.com"
                style={{ fontSize: '0.8rem', marginBottom: '0.6rem', background: 'white' }}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.725rem', color: '#0056D2', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                >
                  <span>1. Abrir Google Cloud Console</span>
                  <ExternalLink size={11} />
                </a>
                <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}>
                  Salvar e Ativar Botão
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Official Google Identity Button Container */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '52px',
            marginBottom: '1.25rem'
          }}>
            <div ref={googleBtnContainerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {!gsiLoaded && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Carregando Google Identity Services...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Development Quick Bypass for LogShare Specialists */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.25rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Acesso Rápido em Desenvolvimento:
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleBypassDevLogin("paulo@logshare.com.br")}
            style={{
              width: '100%',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #0056D2 0%, #103265 100%)'
            }}
          >
            <UserCheck size={15} />
            <span>Entrar como paulo@logshare.com.br</span>
          </button>
        </div>

        {/* Configure Client ID link */}
        {clientId && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.725rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {showConfig ? "Ocultar Client ID" : "Alterar Google Client ID configurado"}
            </button>
            {showConfig && (
              <form onSubmit={handleSaveClientId} style={{ marginTop: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  style={{ fontSize: '0.75rem', marginBottom: '0.4rem' }}
                />
                <button type="submit" className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem' }}>
                  Salvar
                </button>
              </form>
            )}
          </div>
        )}

        {/* Switch to Carrier Public View */}
        <div style={{
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
