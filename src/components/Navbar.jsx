import React from 'react';
import { ShieldCheck, Truck, Cloud, FileSpreadsheet, RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import LogShareLogo from './UI/LogShareLogo';

export default function Navbar({ activeView, setActiveView, pendingCount, expiredCount, onResetData }) {
  return (
    <header className="navbar-header no-print">
      <div className="navbar-container">
        {/* Official Brand Logo Group */}
        <div className="brand-logo-group" onClick={() => setActiveView('specialist')} style={{ cursor: 'pointer' }}>
          <LogShareLogo height={34} variant="color" />
          <div className="brand-title-wrap" style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '0.75rem' }}>
            <span className="brand-tag">Compliance & Risco</span>
            <span className="brand-sub" style={{ fontSize: '0.7rem' }}>Homologação de Transportadores</span>
          </div>
        </div>

        {/* View Navigation Switcher */}
        <nav className="nav-switcher">
          <button
            id="nav-carrier-portal-btn"
            className={`nav-pill-btn ${activeView === 'carrier' ? 'active' : ''}`}
            onClick={() => setActiveView('carrier')}
            title="Formulário externo enviado para preenchimento da transportadora"
          >
            <Truck size={17} />
            <span>Portal do Transportador</span>
            <span style={{ fontSize: '0.68rem', opacity: 0.8, background: 'rgba(0,0,0,0.2)', padding: '1px 6px', borderRadius: 10 }}>Link Externo</span>
          </button>

          <button
            id="nav-specialist-panel-btn"
            className={`nav-pill-btn ${activeView === 'specialist' ? 'active' : ''}`}
            onClick={() => setActiveView('specialist')}
            title="Painel interno do analista de homologação e compliance LogShare"
          >
            <ShieldCheck size={17} />
            <span>Painel do Especialista</span>
            {pendingCount > 0 && (
              <span className="nav-counter" title={`${pendingCount} transportadores aguardando análise`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            id="nav-validity-monitor-btn"
            className={`nav-pill-btn ${activeView === 'validity' ? 'active' : ''}`}
            onClick={() => setActiveView('validity')}
            title="Painel Semáforo de Monitoramento de Validades (Vermelho Vencido, Amarelo 30d, Verde OK)"
          >
            <Clock size={17} />
            <span>Monitor de Vigências</span>
            {expiredCount > 0 && (
              <span className="nav-counter" style={{ background: '#EF4444' }} title={`${expiredCount} transportadores com documentos vencidos`}>
                {expiredCount} 🔴
              </span>
            )}
          </button>

          <button
            id="nav-gdrive-sync-btn"
            className={`nav-pill-btn ${activeView === 'gdrive' ? 'active' : ''}`}
            onClick={() => setActiveView('gdrive')}
            title="Integração e sincronização com Google Drive e Google Sheets"
          >
            <Cloud size={17} />
            <span>Google Drive Sync</span>
          </button>
        </nav>

        {/* Utility Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onResetData}
            title="Restaurar dados de demonstração com exemplos reais (Apta, Restrições e Não Apta)"
            style={{ color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}
          >
            <RefreshCw size={13} />
            <span style={{ fontSize: '0.75rem' }}>Resetar Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
