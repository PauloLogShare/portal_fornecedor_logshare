import React from 'react';
import { History, X, FileText, Download, Calendar, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export default function DocumentVersionHistoryModal({ isOpen, onClose, document: doc, carrierName }) {
  if (!isOpen || !doc) return null;

  const history = doc.history || [];
  const currentVersion = doc.version || (history.length + 1);

  const downloadBase64File = (base64Data, fileName, mimeType) => {
    if (!base64Data) {
      alert("Arquivo não disponível para download local.");
      return;
    }
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = fileName || "documento_historico.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '650px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0A192F 0%, #103265 100%)',
          color: 'white',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(0, 210, 255, 0.2)', padding: '8px', borderRadius: '8px', color: '#00D2FF' }}>
              <History size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#00D2FF', color: '#0A192F', padding: '1px 6px', borderRadius: 4 }}>
                  ISO 9001 • RASTREABILIDADE
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{carrierName}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', color: 'white', margin: '2px 0 0 0' }}>
                Histórico & Versionamento do Documento
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#CBD5E1',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Documento Auditado
            </span>
            <h4 style={{ fontSize: '1rem', color: 'var(--primary-900)', margin: '2px 0 0 0' }}>
              {doc.nome}
            </h4>
          </div>

          {/* Versão Vigente Atual */}
          <div style={{
            background: '#F0FDF4',
            border: '2px solid #86EFAC',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ background: '#10B981', color: 'white', fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: 4 }}>
                  VERSÃO ATUAL (v{currentVersion}) • VIGENTE
                </span>
                <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>
                  ✓ Ativa no Google Drive
                </span>
              </div>

              {doc.arquivoBase64 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => downloadBase64File(doc.arquivoBase64, doc.arquivoNome, doc.arquivoMime)}
                  style={{ fontSize: '0.75rem', padding: '3px 8px', height: 'auto' }}
                >
                  <Download size={13} />
                  <span>Baixar Atual</span>
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.78rem', marginTop: '4px' }}>
              <div>
                <span style={{ color: '#166534', fontWeight: 600 }}>Arquivo: </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{doc.arquivoNome || 'Anexo padrão'}</span>
              </div>
              <div>
                <span style={{ color: '#166534', fontWeight: 600 }}>Vigência: </span>
                <strong>{doc.vigencia || 'Indeterminada'}</strong>
              </div>
              <div>
                <span style={{ color: '#166534', fontWeight: 600 }}>Enviado em: </span>
                <span>{doc.dataEnvio ? new Date(doc.dataEnvio).toLocaleString('pt-BR') : 'Data de cadastro'}</span>
              </div>
            </div>
          </div>

          {/* Lista de Versões Anteriores / Arquivadas */}
          <div>
            <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} />
              <span>Versões Anteriores Arquivadas em <code>_Historico_Versoes_Anteriores/</code> ({history.length})</span>
            </h5>

            {history.length === 0 ? (
              <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '6px', padding: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Nenhuma versão anterior arquivada. Este documento está em sua primeira versão (v1).
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.map((hist, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderLeft: '4px solid #94A3B8',
                      borderRadius: '6px',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: '#E2E8F0', color: '#475569', fontWeight: 700, fontSize: '0.72rem', padding: '2px 6px', borderRadius: 4 }}>
                          Versão {hist.version || idx + 1}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          Substituída em: {hist.substituidoEm ? new Date(hist.substituidoEm).toLocaleString('pt-BR') : 'Data anterior'}
                        </span>
                      </div>

                      {hist.arquivoBase64 && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => downloadBase64File(hist.arquivoBase64, `v${hist.version || idx + 1}_${hist.arquivoNome}`, hist.arquivoMime)}
                          style={{ fontSize: '0.72rem', padding: '2px 6px', height: 'auto' }}
                        >
                          <Download size={12} />
                          <span>Baixar v{hist.version || idx + 1}</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.35rem', fontSize: '0.75rem', color: '#475569' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>Arquivo Antigo: </span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{hist.arquivoNome}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 600 }}>Vigência da Época: </span>
                        <span>{hist.vigencia || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#64748B'
        }}>
          <span>Rastreabilidade conforme ISO 9001 (7.5.3) & ANVISA RDC 48</span>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
