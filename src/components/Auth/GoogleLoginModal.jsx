import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2, Truck, Settings, ExternalLink, KeyRound, HelpCircle, ArrowRight } from 'lucide-react';
import { handleGoogleCredentialResponse, getStoredGoogleClientId, saveGoogleClientId } from '../../services/authService';
import LogShareLogo from '../UI/LogShareLogo';

export default function GoogleLoginModal({ onLoginSuccess, onSwitchToCarrierPublic }) {
  const [clientId, setClientId] = useState(getStoredGoogleClientId() || "");
  const [showConfig, setShowConfig] = useState(false);
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
      const effectiveClientId = clientId.trim() || "102874628374-placeholder.apps.googleusercontent.com";

      try {
        window.google.accounts.id.initialize({
          client_id: effectiveClientId,
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
    saveGoogleClientId(clientId);
    setShowConfig(false);
    setErrorMessage(null);
  };

  const handleSimulateGoogleLogin = () => {
    // If the user clicks the simulation fallback button
    const emailPrompt = window.prompt("Digite seu e-mail corporativo da LogShare para autenticar (ex: seu.nome@logshare.com.br):", "auditor@logshare.com.br");
    if (!emailPrompt) return;

    const email = emailPrompt.toLowerCase().trim();
    if (!email.endsWith("@logshare.com.br")) {
      setErrorMessage(`Acesso negado: O e-mail ${email} não pertence ao domínio @logshare.com.br.`);
      return;
    }

    const user = {
      id: `google-user-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email,
      role: "Especialista em Homologação LogShare",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=0056D2&color=fff`,
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
        maxWidth: '480px',
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
            <span>GOOGLE WORKSPACE SSO OFICIAL</span>
          </div>
          <h1 style={{ fontSize: '1.35rem', color: 'var(--primary-900)', marginBottom: '0.4rem' }}>
            Acesso Restrito ao Backoffice
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Autentique-se com sua conta Google oficial <strong>(@logshare.com.br)</strong> para gerenciar dossiês, vigências e pareceres.
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

        {/* Official Google Identity Button Container */}
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

        {/* Domain Notice */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          fontSize: '0.78rem',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <ShieldCheck size={16} color="#0056D2" style={{ flexShrink: 0 }} />
          <span>
            Validação de domínio ativa: apenas contas <strong>@logshare.com.br</strong> possuem permissão de acesso.
          </span>
        </div>

        {/* Google Cloud Client ID Configuration Toggle */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-600)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              margin: '0 auto'
            }}
          >
            <Settings size={12} />
            <span>{showConfig ? "Ocultar configuração de Client ID" : "⚙️ Configurar Google Client ID da LogShare"}</span>
          </button>

          {showConfig && (
            <form onSubmit={handleSaveClientId} style={{ marginTop: '0.75rem', background: '#F1F5F9', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>
                Google OAuth Client ID (Google Cloud Console):
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: 123456789-abc.apps.googleusercontent.com"
                style={{ fontSize: '0.78rem', marginBottom: '0.5rem' }}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.7rem', color: '#0056D2', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <span>Abrir Google Cloud Console</span>
                  <ExternalLink size={10} />
                </a>
                <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                  Salvar Chave
                </button>
              </div>
            </form>
          )}
        </div>

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
