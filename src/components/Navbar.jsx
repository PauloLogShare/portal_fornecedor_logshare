import React from 'react';
import { ShieldCheck, Truck, Cloud, FileSpreadsheet, RefreshCw, CheckCircle2, Clock, AlertTriangle, LogOut, User, Lock, ExternalLink, BookOpen } from 'lucide-react';
import LogShareLogo from './UI/LogShareLogo';

export default function Navbar({
  activeView,
  setActiveView,
  pendingCount,
  expiredCount,
  onResetData,
  currentUser,
  onLogout,
  onOpenStandalonePortal,
  onOpenPOP,
  cloudStatus,
  onRefreshCloud
}) {
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

        {/* View Navigation Switcher (Internal Specialist Tools) */}
        <nav className="nav-switcher">
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

          <button
            id="nav-carrier-portal-btn"
            className={`nav-pill-btn ${activeView === 'carrier' ? 'active' : ''}`}
            onClick={() => setActiveView('carrier')}
            title="Visualização da visão que o transportador externo acessa"
          >
            <Truck size={17} />
            <span>Portal do Parceiro</span>
          </button>
        </nav>

        {/* User Account & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Authenticated Specialist Pill */}
          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '4px 10px 4px 6px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              color: '#FFFFFF'
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#0056D2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}>
                {currentUser.name.charAt(0)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontWeight: 700, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#93C5FD' }}>
                  @logshare
                </span>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Sair da conta Google Workspace"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#F87171',
                    cursor: 'pointer',
                    padding: '2px',
                    marginLeft: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          )}

          {/* Cloud Database Sync Indicator */}
          {onRefreshCloud && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onRefreshCloud}
              title="Sincronizar e carregar os envios em tempo real da Nuvem Supabase"
              style={{
                background: cloudStatus === 'online' ? 'rgba(16, 185, 129, 0.12)' : cloudStatus === 'syncing' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: cloudStatus === 'online' ? '#34D399' : cloudStatus === 'syncing' ? '#FBBF24' : '#F87171',
                borderColor: cloudStatus === 'online' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                fontSize: '0.725rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={12} className={cloudStatus === 'syncing' ? 'animate-spin' : ''} />
              <span>{cloudStatus === 'syncing' ? 'Sincronizando...' : 'Supabase Nuvem'}</span>
            </button>
          )}

          {/* POP Oficial Button */}
          {onOpenPOP && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenPOP}
              title="Consultar Procedimento Operacional Padrão (POP-LOG-HOM-001) com regras e normas"
              style={{ background: 'rgba(0, 210, 255, 0.1)', color: '#00D2FF', borderColor: 'rgba(0, 210, 255, 0.3)', fontSize: '0.725rem', fontWeight: 700 }}
            >
              <BookOpen size={13} />
              <span>POP Homologação</span>
            </button>
          )}

          {/* Standalone View Button */}
          {onOpenStandalonePortal && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenStandalonePortal}
              title="Abrir a visão isolada que o transportador externo enxerga"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.2)', fontSize: '0.725rem' }}
            >
              <ExternalLink size={12} />
              <span>Visão Transportador</span>
            </button>
          )}

          {/* Reset Demo Button */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onResetData}
            title="Restaurar dados de demonstração (Apta, Restrições e Não Apta)"
            style={{ color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', fontSize: '0.725rem', padding: '0.35rem 0.6rem' }}
          >
            <RefreshCw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
