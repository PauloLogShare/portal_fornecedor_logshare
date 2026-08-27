import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CarrierPortal from './components/CarrierPortal/CarrierPortal';
import SpecialistDashboard from './components/SpecialistPanel/SpecialistDashboard';
import DossierDetail from './components/SpecialistPanel/DossierDetail';
import ValidityMonitorDashboard from './components/SpecialistPanel/ValidityMonitorDashboard';
import DriveSyncView from './components/GoogleDriveSync/DriveSyncView';
import GoogleLoginModal from './components/Auth/GoogleLoginModal';
import POPHomologacaoModal from './components/SpecialistPanel/POPHomologacaoModal';
import { loadCarriers, resetToDefaults, saveCarrier } from './services/storageService';
import { syncCarrierToGoogleDrive } from './services/driveSyncService';
import { calculateDocumentValidity } from './services/validityCalculator';
import { getStoredUser, saveUserSession, clearUserSession } from './services/authService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appMode, setAppMode] = useState('SPECIALIST'); // 'SPECIALIST' | 'CARRIER_STANDALONE'
  const [activeView, setActiveView] = useState('specialist'); // 'carrier' | 'specialist' | 'validity' | 'gdrive'
  const [carriers, setCarriers] = useState([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isPOPOpen, setIsPOPOpen] = useState(false);

  useEffect(() => {
    // Check url param ?mode=carrier
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'carrier' || params.get('portal') === 'true') {
      setAppMode('CARRIER_STANDALONE');
    }

    const loadedUser = getStoredUser();
    if (loadedUser) {
      setCurrentUser(loadedUser);
    }

    const loadedCarriers = loadCarriers();
    setCarriers(loadedCarriers);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    saveUserSession(user);
    setAppMode('SPECIALIST');
    showToast(`Bem-vindo, ${user.name}! Acesso liberado via Google Workspace.`);
  };

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
    showToast("Sessão Google Workspace encerrada.");
  };

  const handleResetData = () => {
    if (window.confirm("Deseja restaurar os dados de exemplo da demonstração (Apta, Com Restrições, Não Apta e Aguardando)?")) {
      const reset = resetToDefaults();
      setCarriers(reset);
      setSelectedCarrierId(null);
      showToast("Dados de demonstração restaurados com sucesso!");
    }
  };

  const handleDossierSubmitted = (newCarrier) => {
    const updated = loadCarriers();
    setCarriers(updated);
    showToast(`Dossiê [${newCarrier.protocol}] atualizado com sucesso!`);
  };

  const handleUpdateCarrierList = (updatedList) => {
    setCarriers(updatedList);
  };

  const handleSelectCarrier = (id) => {
    setSelectedCarrierId(id);
    setActiveView('specialist');
  };

  const handleBackToList = () => {
    setSelectedCarrierId(null);
  };

  const handleSyncDriveDirect = async (carrier) => {
    const res = await syncCarrierToGoogleDrive(carrier);
    showToast(res.message || "Sincronizado no Google Drive!");
    return res;
  };

  // =========================================================================
  // SCENARIO 1: STANDALONE CARRIER PUBLIC PORTAL (ISOLATED VIEW)
  // =========================================================================
  if (appMode === 'CARRIER_STANDALONE') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-subtle)', padding: '1.5rem 1rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <CarrierPortal
            isStandalone={true}
            carriers={carriers}
            onDossierSubmitted={handleDossierSubmitted}
            onOpenSpecialistLogin={() => setAppMode('SPECIALIST')}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 2: SPECIALIST LOGIN SCREEN VIA GOOGLE SSO
  // =========================================================================
  if (!currentUser) {
    return (
      <GoogleLoginModal
        onLoginSuccess={handleLoginSuccess}
        onSwitchToCarrierPublic={() => setAppMode('CARRIER_STANDALONE')}
      />
    );
  }

  // =========================================================================
  // SCENARIO 3: AUTHENTICATED SPECIALIST BACKOFFICE & RISK MANAGEMENT
  // =========================================================================
  const pendingCount = carriers.filter(c => c.status === 'AGUARDANDO_ANALISE' || !c.status).length;
  
  const expiredCount = carriers.filter(c => {
    return (c.documentos || []).some(d => {
      const v = calculateDocumentValidity(d.vigencia);
      return v.key === 'EXPIRED' && d.obrigatorio;
    });
  }).length;

  return (
    <div className="app-wrapper">
      {/* Navigation Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          if (view === 'specialist') {
            setSelectedCarrierId(null);
          }
        }}
        pendingCount={pendingCount}
        expiredCount={expiredCount}
        onResetData={handleResetData}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenStandalonePortal={() => setAppMode('CARRIER_STANDALONE')}
        onOpenPOP={() => setIsPOPOpen(true)}
      />

      {/* POP Modal */}
      <POPHomologacaoModal
        isOpen={isPOPOpen}
        onClose={() => setIsPOPOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0A192F',
          color: '#FFFFFF',
          border: '1px solid #00D2FF',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.25s ease'
        }}>
          <span style={{ color: '#00D2FF' }}>●</span>
          {toastMessage}
        </div>
      )}

      {/* Main Body View */}
      <main className="main-content">
        {/* VIEW 1: Portal do Transportador (Dentro do Painel) */}
        {activeView === 'carrier' && (
          <CarrierPortal
            carriers={carriers}
            onDossierSubmitted={handleDossierSubmitted}
          />
        )}

        {/* VIEW 2: Painel do Especialista LogShare (Backoffice) */}
        {activeView === 'specialist' && (
          <>
            {selectedCarrierId ? (
              <DossierDetail
                carrierId={selectedCarrierId}
                allCarriers={carriers}
                onBack={handleBackToList}
                onUpdateCarrierList={handleUpdateCarrierList}
                onSyncDrive={handleSyncDriveDirect}
              />
            ) : (
              <SpecialistDashboard
                carriers={carriers}
                onSelectCarrier={handleSelectCarrier}
                onNewCarrierClick={() => setActiveView('carrier')}
                onOpenDriveSync={() => setActiveView('gdrive')}
                onOpenPOP={() => setIsPOPOpen(true)}
              />
            )}
          </>
        )}

        {/* VIEW 3: Monitor Semáforo de Vigências */}
        {activeView === 'validity' && (
          <ValidityMonitorDashboard
            carriers={carriers}
            onSelectCarrier={handleSelectCarrier}
          />
        )}

        {/* VIEW 4: Sincronização Google Drive */}
        {activeView === 'gdrive' && (
          <DriveSyncView carriers={carriers} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-light)',
        background: 'white',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }} className="no-print">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>LogShare</strong> — Plataforma Inteligente de Homologação e Gestão de Risco de Transportadores
          </div>
          <div>
            Autenticação Google SSO (@logshare.com.br) • Validação IA OCR • Semáforo de Vigências
          </div>
        </div>
      </footer>
    </div>
  );
}
