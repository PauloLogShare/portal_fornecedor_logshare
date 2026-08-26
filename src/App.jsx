import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CarrierPortal from './components/CarrierPortal/CarrierPortal';
import SpecialistDashboard from './components/SpecialistPanel/SpecialistDashboard';
import DossierDetail from './components/SpecialistPanel/DossierDetail';
import ValidityMonitorDashboard from './components/SpecialistPanel/ValidityMonitorDashboard';
import DriveSyncView from './components/GoogleDriveSync/DriveSyncView';
import { loadCarriers, resetToDefaults, saveCarrier } from './services/storageService';
import { syncCarrierToGoogleDrive } from './services/driveSyncService';
import { calculateDocumentValidity } from './services/validityCalculator';

export default function App() {
  const [activeView, setActiveView] = useState('specialist'); // 'carrier' | 'specialist' | 'validity' | 'gdrive'
  const [carriers, setCarriers] = useState([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const loaded = loadCarriers();
    setCarriers(loaded);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
    showToast(`Dossiê [${newCarrier.protocol}] registrado e pronto para análise do especialista!`);
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

  const pendingCount = carriers.filter(c => c.status === 'AGUARDANDO_ANALISE' || !c.status).length;
  
  // Count carriers with at least 1 expired mandatory document
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
        {/* VIEW 1: Portal do Transportador (Link Externo) */}
        {activeView === 'carrier' && (
          <CarrierPortal onDossierSubmitted={handleDossierSubmitted} />
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
            Validação IA OCR • Semáforo de Vigências (🔴 🟡 🟢) • Google Workspace Sync
          </div>
        </div>
      </footer>
    </div>
  );
}
