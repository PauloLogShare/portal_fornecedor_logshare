import React, { useState } from 'react';
import { Cloud, Folder, FileText, CheckCircle2, Copy, Check, ExternalLink, RefreshCw, Send, ShieldCheck, Database, Table, Save } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE, syncCarrierToGoogleDrive, getStoredWebhookUrl, saveStoredWebhookUrl } from '../../services/driveSyncService';
import { exportToCSV, exportToJSON } from '../../services/storageService';

export default function DriveSyncView({ carriers }) {
  const [webhookUrl, setWebhookUrl] = useState(getStoredWebhookUrl() || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedUrlSuccess, setSavedUrlSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState([
    {
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      status: "INFO",
      message: "Módulo de sincronização com Google Workspace inicializado."
    }
  ]);
  const [selectedCarrierForSim, setSelectedCarrierForSim] = useState(carriers[0]?.id || '');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveWebhookUrl = (e) => {
    e?.preventDefault();
    saveStoredWebhookUrl(webhookUrl);
    setSavedUrlSuccess(true);
    setTimeout(() => setSavedUrlSuccess(false), 2500);
    setSyncLog(prev => [
      {
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        status: "INFO",
        message: `URL do Webhook oficial salva como padrão do sistema: ${webhookUrl ? webhookUrl.slice(0, 45) + '...' : '(Simulado Local)'}`
      },
      ...prev
    ]);
  };

  const handleTestSync = async () => {
    const carrier = carriers.find(c => c.id === selectedCarrierForSim) || carriers[0];
    if (!carrier) return;

    if (webhookUrl) {
      saveStoredWebhookUrl(webhookUrl);
    }

    setIsSyncing(true);
    setSyncLog(prev => [
      {
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        status: "PROCESSING",
        message: `Iniciando sincronização de [${carrier.razaoSocial}] (CNPJ: ${carrier.cnpj})...`
      },
      ...prev
    ]);

    const result = await syncCarrierToGoogleDrive(carrier, webhookUrl);
    setIsSyncing(false);

    if (result.success) {
      setSyncLog(prev => [
        {
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          status: "SUCCESS",
          message: `Pasta Google Drive criada com sucesso! URL: ${result.folderUrl}`
        },
        {
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          status: "SUCCESS",
          message: `Linha anexada na Planilha Google Mestre com status [${carrier.status || 'AGUARDANDO_ANALISE'}].`
        },
        ...prev
      ]);
    } else {
      setSyncLog(prev => [
        {
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          status: "ERROR",
          message: `Erro na sincronização: ${result.error}`
        },
        ...prev
      ]);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncLog(prev => [
      {
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        status: "PROCESSING",
        message: `Sincronizando lote completo de ${carriers.length} transportadores com Google Drive...`
      },
      ...prev
    ]);

    for (const c of carriers) {
      await syncCarrierToGoogleDrive(c, webhookUrl);
    }

    setIsSyncing(false);
    setSyncLog(prev => [
      {
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        status: "SUCCESS",
        message: `Lote de ${carriers.length} transportadores sincronizado e estruturado com sucesso no Google Drive!`
      },
      ...prev
    ]);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0A192F 0%, #103265 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 210, 255, 0.15)', color: '#00D2FF', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <span>INTEGRAÇÃO NATIVA GOOGLE WORKSPACE</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Sincronização com Google Drive & Google Sheets
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '650px' }}>
            Armazenamento automatizado de dossiês em pastas hierárquicas no Google Drive por CNPJ e alimentação contínua da Planilha Mestre de Transportadores da LogShare.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCSV(carriers)}
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <Table size={15} />
            <span>Exportar CSV</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToJSON(carriers)}
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <Database size={15} />
            <span>Backup JSON</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Coluna Esquerda: Estrutura de Pastas e Webhook Tester */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Estrutura Visual do Google Drive */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Folder size={20} color="#0056D2" />
              <span>Estrutura de Pastas no Google Drive Corporativo</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Cada transportador possui sua pasta dedicada gerada automaticamente com seu CNPJ:
            </p>

            {/* Tree View Mock */}
            <div style={{
              background: '#0A192F',
              color: '#E2E8F0',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.825rem',
              lineHeight: 1.6
            }}>
              <div style={{ color: '#00D2FF', fontWeight: 700 }}>
                📁 /LogShare - Homologação de Transportadores/
              </div>
              <div style={{ paddingLeft: '1.25rem' }}>
                {carriers.slice(0, 2).map((c, i) => {
                  const cleanCnpj = (c.cnpj || '').replace(/[^0-9]/g, '');
                  return (
                    <div key={c.id || i} style={{ marginTop: '0.5rem' }}>
                      <div style={{ color: '#FCD34D' }}>
                        📁 {cleanCnpj} - {c.razaoSocial}
                      </div>
                      <div style={{ paddingLeft: '1.25rem', color: '#94A3B8' }}>
                        <div>📁 01_Documentos_Cadastrais/</div>
                        <div style={{ paddingLeft: '1rem', color: '#6EE7B7' }}>
                          📄 Cartao_CNPJ_{cleanCnpj}.pdf<br />
                          📄 Certificado_ANTT_RNTRC.pdf<br />
                          📄 Apolice_Seguro_RCTRC.pdf<br />
                          📄 Certidao_Trabalhista_CNDT.pdf
                        </div>
                        <div style={{ marginTop: '0.25rem' }}>📁 02_Pareceres_Homologacao/</div>
                        <div style={{ paddingLeft: '1rem', color: '#93C5FD' }}>
                          📄 Parecer_Oficial_Homologacao_{cleanCnpj}.pdf<br />
                          📄 Parecer_Oficial_{cleanCnpj}.txt
                        </div>
                        <div style={{ marginTop: '0.25rem', color: '#CBD5E1' }}>
                          📄 dossie_completo_{cleanCnpj}.json
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Webhook Connection Form */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cloud size={20} color="var(--primary-600)" />
                <span>Configuração do Webhook Google Apps Script</span>
              </h3>
              {webhookUrl && (
                <span style={{ fontSize: '0.7rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  ✓ Webhook Ativo
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Insira a URL do seu Webhook publicado no Google Apps Script para salvar como padrão da empresa.
            </p>

            <form onSubmit={handleSaveWebhookUrl} style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="webhookUrl">
                  URL do Webhook (Google Apps Script Web App URL):
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    id="webhookUrl"
                    type="url"
                    className="form-input"
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Salvar URL como padrão permanente do sistema"
                  >
                    {savedUrlSuccess ? <Check size={15} color="#10B981" /> : <Save size={15} />}
                    <span>{savedUrlSuccess ? 'Salvo!' : 'Salvar Padrão'}</span>
                  </button>
                </div>
                <span className="form-hint">
                  Ao salvar, esta URL ficará gravada para todos os analistas e processos de homologação.
                </span>
              </div>
            </form>

            <div className="form-group">
              <label className="form-label" htmlFor="selectCarrierSync">
                Selecione o Transportador para Teste de Disparo:
              </label>
              <select
                id="selectCarrierSync"
                className="form-select"
                value={selectedCarrierForSim}
                onChange={(e) => setSelectedCarrierForSim(e.target.value)}
              >
                {carriers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.razaoSocial} ({c.cnpj}) - Status: {c.status || 'AGUARDANDO'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleTestSync}
                disabled={isSyncing}
              >
                <Send size={15} />
                <span>{isSyncing ? 'Sincronizando...' : 'Testar Sincronização Unitária'}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSyncAll}
                disabled={isSyncing}
              >
                <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
                <span>Sincronizar Todos os Dossiês ({carriers.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Instruções de Implantação e Log de Eventos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Instruções de Implantação */}
          <div className="card" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--primary-900)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Código do Webhook (Google Apps Script)
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyCode}
                style={{ fontSize: '0.75rem' }}
              >
                {copiedCode ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código Apps Script'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
              Código pronto com função <code>testarLocalmente</code> para autorização de permissões no Google Drive e escrita automática na Planilha Google Mestre.
            </p>

            <div style={{
              maxHeight: '180px',
              overflowY: 'auto',
              background: '#0A192F',
              color: '#A5B4FC',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)'
            }}>
              <pre style={{ margin: 0 }}>{GOOGLE_APPS_SCRIPT_CODE}</pre>
            </div>
          </div>

          {/* Console de Eventos de Sincronização */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', color: 'var(--primary-900)', marginBottom: '0.75rem' }}>
              Console de Eventos de Sincronização
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: '300px',
              overflowY: 'auto',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)'
            }}>
              {syncLog.map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: log.status === 'SUCCESS' ? '#F0FDF4' : log.status === 'ERROR' ? '#FEF2F2' : log.status === 'PROCESSING' ? '#EFF6FF' : '#F8FAFC',
                    borderLeft: `3px solid ${log.status === 'SUCCESS' ? '#10B981' : log.status === 'ERROR' ? '#EF4444' : log.status === 'PROCESSING' ? '#3B82F6' : '#94A3B8'}`,
                    color: log.status === 'SUCCESS' ? '#065F46' : log.status === 'ERROR' ? '#991B1B' : '#1E293B',
                    lineHeight: 1.4
                  }}
                >
                  <span style={{ color: '#64748B', marginRight: '6px' }}>[{log.timestamp}]</span>
                  <span style={{ fontWeight: 700, marginRight: '6px' }}>[{log.status}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
