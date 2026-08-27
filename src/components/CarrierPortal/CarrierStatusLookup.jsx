import React, { useState } from 'react';
import { Search, ShieldCheck, CheckCircle2, AlertTriangle, Clock, Upload, FileText, FileCheck, ArrowRight, Printer, AlertCircle, Sparkles, Send } from 'lucide-react';
import { calculateDocumentValidity, formatDateBR } from '../../services/validityCalculator';
import { scanDocumentWithAI } from '../../services/aiDocumentScanner';
import { saveCarrier } from '../../services/storageService';

export default function CarrierStatusLookup({ carriers, onCarrierUpdated }) {
  const [cnpjQuery, setCnpjQuery] = useState('');
  const [protocolQuery, setProtocolQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundCarrier, setFoundCarrier] = useState(null);
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSearch = (e) => {
    e?.preventDefault();
    setSearched(true);
    setSuccessMessage(null);

    const cleanCnpj = cnpjQuery.replace(/\D/g, '');
    const cleanProto = protocolQuery.trim().toUpperCase();

    const result = carriers.find(c => {
      const matchCnpj = (c.cnpj || '').replace(/\D/g, '') === cleanCnpj;
      const matchProto = (c.protocol || '').toUpperCase() === cleanProto;
      return matchCnpj || (cleanProto && matchProto);
    });

    setFoundCarrier(result || null);
  };

  const handleReuploadDoc = async (docId, file) => {
    if (!file || !foundCarrier) return;
    setUploadingDocId(docId);

    const docDef = (foundCarrier.documentos || []).find(d => d.id === docId) || { id: docId, nome: docId };
    const scan = await scanDocumentWithAI(file, docDef);
    setUploadingDocId(null);

    const isExpired = scan.validityAnalysis?.key === "EXPIRED";
    const updatedDocs = (foundCarrier.documentos || []).map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: isExpired ? "IRREGULAR" : "VALIDO",
          vigencia: scan.extractedVigencia,
          arquivoNome: file.name,
          arquivoTamanho: `${(file.size / 1024).toFixed(1)} KB`,
          dataEnvio: new Date().toISOString()
        };
      }
      return d;
    });

    const updatedCarrier = {
      ...foundCarrier,
      documentos: updatedDocs,
      status: "AGUARDANDO_ANALISE", // Moves back to review queue
      ultimaAtualizacao: new Date().toISOString()
    };

    saveCarrier(updatedCarrier);
    setFoundCarrier(updatedCarrier);
    if (onCarrierUpdated) onCarrierUpdated(updatedCarrier);
    setSuccessMessage(`Documento "${docDef.nome}" atualizado e enviado para reanálise do especialista!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-900)', margin: 0 }}>
              Consultar Situação da Homologação
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Informe o CNPJ ou o número do Protocolo para consultar o parecer e reenviar documentos pendentes.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr)) 160px', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">CNPJ da Empresa:</label>
            <input
              type="text"
              className="form-input"
              placeholder="00.000.000/0000-00"
              value={cnpjQuery}
              onChange={(e) => setCnpjQuery(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Número do Protocolo (Opcional):</label>
            <input
              type="text"
              className="form-input"
              placeholder="HOM-2026-XXXXX"
              value={protocolQuery}
              onChange={(e) => setProtocolQuery(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Search size={16} />
            <span>Consultar</span>
          </button>
        </form>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div style={{
          background: 'var(--status-apta-bg)',
          border: '1px solid var(--status-apta-border)',
          color: 'var(--status-apta-text)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} color="var(--status-apta-solid)" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Results Box */}
      {searched && foundCarrier && (
        <div className="card animate-fade-in" style={{ padding: '2rem' }}>
          {/* Header Status */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Protocolo: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-700)' }}>{foundCarrier.protocol || 'HOM-2026-XXXXX'}</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-900)', marginTop: '4px', marginBottom: '4px' }}>
                {foundCarrier.razaoSocial}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                CNPJ: {foundCarrier.cnpj} • Cidade: {foundCarrier.endereco?.cidade || '—'}/{foundCarrier.endereco?.uf || '—'}
              </div>
            </div>

            <div>
              {foundCarrier.status === 'APTA' && (
                <div style={{ background: '#F0FDF4', border: '2px solid #10B981', color: '#065F46', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={18} color="#10B981" />
                  <span>HOMOLOGAÇÃO APTA (LIBERADA)</span>
                </div>
              )}
              {foundCarrier.status === 'APTA_COM_RESTRICOES' && (
                <div style={{ background: '#FFFBEB', border: '2px solid #F59E0B', color: '#92400E', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={18} color="#F59E0B" />
                  <span>APTA COM RESTRIÇÕES OPERACIONAIS</span>
                </div>
              )}
              {foundCarrier.status === 'NAO_APTA' && (
                <div style={{ background: '#FEF2F2', border: '2px solid #EF4444', color: '#991B1B', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={18} color="#EF4444" />
                  <span>NÃO APTA (DOCUMENTAÇÃO PENDENTE)</span>
                </div>
              )}
              {(foundCarrier.status === 'AGUARDANDO_ANALISE' || !foundCarrier.status) && (
                <div style={{ background: '#F1F5F9', border: '2px solid #64748B', color: '#334155', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={18} color="#64748B" />
                  <span>EM ANÁLISE PELO ESPECIALISTA LOGSHARE</span>
                </div>
              )}
            </div>
          </div>

          {/* Parecer / Parecer Details */}
          {foundCarrier.parecer?.resumoExecutivo && (
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-900)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Parecer do Especialista LogShare
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                {foundCarrier.parecer.resumoExecutivo}
              </p>

              {(foundCarrier.parecer.restricoesOperacionais || []).length > 0 && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #CBD5E1' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400E' }}>
                    Condicionantes Operacionais:
                  </span>
                  <ul style={{ margin: '4px 0 0 1.25rem', padding: 0, fontSize: '0.8rem', color: '#78350F' }}>
                    {foundCarrier.parecer.restricoesOperacionais.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Document Status Table with Re-upload button */}
          <div>
            <h4 style={{ fontSize: '1rem', color: 'var(--primary-900)', marginBottom: '0.75rem' }}>
              Situação dos Documentos & Reenvio de Pendências
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {(foundCarrier.documentos || []).map(doc => {
                const validity = calculateDocumentValidity(doc.vigencia);
                const isIrregular = doc.status === 'IRREGULAR' || validity.key === 'EXPIRED';

                return (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isIrregular ? '#FEF2F2' : 'white',
                      border: `1px solid ${isIrregular ? '#FCA5A5' : 'var(--border-light)'}`,
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-900)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{validity.icon}</span>
                        <span>{doc.nome}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Vigência: <strong>{formatDateBR(doc.vigencia)}</strong> • Arquivo: {doc.arquivoNome || 'Ausente'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: isIrregular ? '#FEE2E2' : '#DCFCE7',
                        color: isIrregular ? '#991B1B' : '#166534'
                      }}>
                        {isIrregular ? '✗ PENDENTE / VENCIDO' : '✓ REGULAR'}
                      </span>

                      {/* Direct Re-upload Action */}
                      <label
                        htmlFor={`reupload-${doc.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        <Upload size={13} />
                        <span>{uploadingDocId === doc.id ? "Processando..." : "Substituir Arquivo"}</span>
                        <input
                          id={`reupload-${doc.id}`}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleReuploadDoc(doc.id, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {searched && !foundCarrier && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-900)' }}>Nenhum cadastro localizado</h3>
          <p style={{ fontSize: '0.85rem', maxWidth: '460px', margin: '0.5rem auto 1rem' }}>
            Não encontramos nenhum dossiê com o CNPJ ou protocolo informado. Verifique os dados digitados ou realize um novo cadastro.
          </p>
        </div>
      )}
    </div>
  );
}
