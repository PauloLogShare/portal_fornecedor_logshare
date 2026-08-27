import React, { useState } from 'react';
import { Search, ShieldCheck, CheckCircle2, AlertTriangle, Clock, Upload, FileText, FileCheck, ArrowRight, Printer, AlertCircle, Sparkles, Send, Plus, History } from 'lucide-react';
import { calculateDocumentValidity, formatDateBR, ALL_SYSTEM_DOCUMENTS, OFFICIAL_DOCUMENT_CATEGORIES } from '../../services/validityCalculator';
import { scanDocumentWithAI } from '../../services/aiDocumentScanner';
import { saveCarrier } from '../../services/storageService';
import { calculateRiskScore } from '../../services/riskEngineService';

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

  const readFileAsBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleUploadOrReplaceDoc = async (docDef, file) => {
    if (!file || !foundCarrier) return;
    setUploadingDocId(docDef.id);

    try {
      const base64Data = await readFileAsBase64(file);
      const scan = await scanDocumentWithAI(file, docDef, foundCarrier);
      setUploadingDocId(null);

      const isExpired = scan.validityAnalysis?.key === "EXPIRED";
      const existingDocs = foundCarrier.documentos || [];
      const existingIndex = existingDocs.findIndex(d => d.id === docDef.id);
      const existingDoc = existingIndex >= 0 ? existingDocs[existingIndex] : null;

      const previousHistory = existingDoc?.history || [];
      let updatedHistory = [...previousHistory];
      let version = 1;

      if (existingDoc && (existingDoc.arquivoBase64 || existingDoc.arquivoNome)) {
        version = (existingDoc.version || 1) + 1;
        updatedHistory.push({
          version: existingDoc.version || 1,
          arquivoNome: existingDoc.arquivoNome,
          arquivoTamanho: existingDoc.arquivoTamanho,
          arquivoMime: existingDoc.arquivoMime,
          arquivoBase64: existingDoc.arquivoBase64,
          vigencia: existingDoc.vigencia,
          status: existingDoc.status,
          dataEnvio: existingDoc.dataEnvio || new Date().toISOString(),
          substituidoEm: new Date().toISOString()
        });
      }

      const newDocObj = {
        id: docDef.id,
        nome: docDef.nome,
        shortName: docDef.shortName || docDef.nome,
        obrigatorio: docDef.obrigatorio || false,
        categoryId: docDef.categoryId,
        status: isExpired ? "IRREGULAR" : "VALIDO",
        vigencia: scan.extractedVigencia || "31/12/2028",
        arquivoNome: file.name,
        arquivoTamanho: `${(file.size / 1024).toFixed(1)} KB`,
        arquivoMime: file.type || "application/pdf",
        arquivoBase64: base64Data,
        version: version,
        history: updatedHistory,
        rntrcData: scan.rntrcData || null,
        aiAnalysis: {
          confidence: scan.confidence,
          extractedDocType: scan.extractedDocType,
          extractedNumber: scan.extractedNumber,
          extractedRazaoSocial: scan.extractedRazaoSocial,
          rntrcData: scan.rntrcData || null,
          notes: scan.extractedNotes,
          isExpired
        },
        dataEnvio: new Date().toISOString()
      };

      let updatedDocs;
      if (existingIndex >= 0) {
        updatedDocs = [...existingDocs];
        updatedDocs[existingIndex] = newDocObj;
      } else {
        updatedDocs = [...existingDocs, newDocObj];
      }

      const carrierWithNewDocs = {
        ...foundCarrier,
        documentos: updatedDocs
      };

      const { scoreTotal, breakdown } = calculateRiskScore(carrierWithNewDocs);

      const updatedCarrier = {
        ...carrierWithNewDocs,
        scoreTotal,
        scoreBreakdown: breakdown,
        status: "AGUARDANDO_ANALISE", // Retorna para reanálise do especialista
        ultimaAtualizacao: new Date().toISOString()
      };

      saveCarrier(updatedCarrier);
      setFoundCarrier(updatedCarrier);
      if (onCarrierUpdated) onCarrierUpdated(updatedCarrier);
      setSuccessMessage(`Documento "${docDef.nome}" anexado com sucesso e enviado para análise do especialista!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Erro ao enviar documento:", err);
      setUploadingDocId(null);
    }
  };

  // Cálculo da lista completa de documentos (enviados e pendentes)
  const isLogShareInsurance = foundCarrier?.gestaoRisco?.estipuladoLogShare === true;

  const availableSystemDocs = isLogShareInsurance 
    ? ALL_SYSTEM_DOCUMENTS.filter(d => d.categoryId !== "cat_seguros_pgr")
    : ALL_SYSTEM_DOCUMENTS;

  const processedDocIds = new Set();
  const allDisplayDocs = [];

  // 1. Processar todos os documentos do checklist do sistema
  availableSystemDocs.forEach(sysDoc => {
    processedDocIds.add(sysDoc.id);
    const uploaded = (foundCarrier?.documentos || []).find(d => d.id === sysDoc.id);

    if (uploaded) {
      const validity = calculateDocumentValidity(uploaded.vigencia);
      const isIrregular = uploaded.status === 'IRREGULAR' || validity.key === 'EXPIRED';
      allDisplayDocs.push({
        ...sysDoc,
        ...uploaded,
        isUploaded: true,
        isIrregular,
        validity
      });
    } else {
      allDisplayDocs.push({
        ...sysDoc,
        isUploaded: false,
        isIrregular: sysDoc.obrigatorio,
        status: 'NAO_ENVIADO',
        vigencia: null,
        validity: { label: 'Não Enviado', icon: '🔴', key: 'MISSING', bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' }
      });
    }
  });

  // 2. Adicionar quaisquer outros documentos customizados que foram anexados (ex: Ficha Receita Federal)
  (foundCarrier?.documentos || []).forEach(uploaded => {
    if (!processedDocIds.has(uploaded.id)) {
      const validity = calculateDocumentValidity(uploaded.vigencia);
      const isIrregular = uploaded.status === 'IRREGULAR' || validity.key === 'EXPIRED';
      allDisplayDocs.push({
        id: uploaded.id,
        nome: uploaded.nome || uploaded.arquivoNome || 'Documento Anexado',
        shortName: uploaded.shortName || 'Documento',
        obrigatorio: uploaded.obrigatorio || false,
        ...uploaded,
        isUploaded: true,
        isIrregular,
        validity
      });
    }
  });

  // Contadores
  const mandatoryDocs = allDisplayDocs.filter(d => d.obrigatorio);
  const missingMandatoryDocs = mandatoryDocs.filter(d => !d.isUploaded);
  const expiredMandatoryDocs = mandatoryDocs.filter(d => d.isUploaded && d.isIrregular);
  const totalPendingMandatory = missingMandatoryDocs.length + expiredMandatoryDocs.length;
  const regularDocs = allDisplayDocs.filter(d => d.isUploaded && !d.isIrregular);

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

          {/* Pending Mandatory Alert Banner */}
          {totalPendingMandatory > 0 && (
            <div style={{
              background: '#FEF2F2',
              border: '1.5px solid #EF4444',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <AlertCircle size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                  Atenção: Identificamos {totalPendingMandatory} documento(s) obrigatório(s) pendente(s) de envio ou vencido(s)
                </h4>
                <p style={{ fontSize: '0.835rem', color: '#7F1D1D', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
                  Para que a equipe de especialistas da LogShare possa concluir a análise de dados e liberar a homologação, realize o upload dos documentos destacados em vermelho abaixo.
                </p>
              </div>
            </div>
          )}

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

          {/* Document Status Table with Upload & Re-upload buttons */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-900)', margin: 0 }}>
                  Situação dos Documentos & Envio de Pendências
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Abaixo estão listados todos os documentos do checklist. Você pode anexar pendências ou atualizar versões.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                  ✓ {regularDocs.length} Regular{regularDocs.length !== 1 ? 'es' : ''}
                </span>
                {totalPendingMandatory > 0 && (
                  <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>
                    🔴 {totalPendingMandatory} Obrigatório{totalPendingMandatory !== 1 ? 's' : ''} Pendente{totalPendingMandatory !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {allDisplayDocs.map((doc) => {
                const isMissing = !doc.isUploaded;
                const isExpired = doc.isUploaded && doc.isIrregular;
                const isValid = doc.isUploaded && !doc.isIrregular;

                return (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.15rem',
                      borderRadius: 'var(--radius-md)',
                      background: isMissing
                        ? (doc.obrigatorio ? '#FFF5F5' : '#F8FAFC')
                        : isExpired ? '#FEF2F2' : '#FFFFFF',
                      border: isMissing
                        ? (doc.obrigatorio ? '1.5px dashed #EF4444' : '1px dashed #CBD5E1')
                        : isExpired ? '1.5px solid #FCA5A5' : '1px solid #BBF7D0',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      boxShadow: isMissing && doc.obrigatorio ? '0 1px 4px rgba(239, 68, 68, 0.08)' : 'none'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.885rem', color: 'var(--primary-900)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span>{isMissing ? (doc.obrigatorio ? '🔴' : '⚪') : isExpired ? '🔴' : '🟢'}</span>
                        <span>{doc.nome}</span>
                        {doc.obrigatorio && (
                          <span style={{ fontSize: '0.65rem', background: '#FEE2E2', color: '#991B1B', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
                            OBRIGATÓRIO
                          </span>
                        )}
                        {doc.version && doc.version > 1 && (
                          <span style={{ fontSize: '0.65rem', background: '#E2E8F0', color: '#1E293B', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>
                            v{doc.version}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.775rem', color: isMissing && doc.obrigatorio ? '#B91C1C' : 'var(--text-muted)', marginTop: '3px' }}>
                        {isMissing ? (
                          <span>{doc.hint || 'Documento obrigatório não anexado no cadastro inicial.'}</span>
                        ) : (
                          <span>
                            Vigência: <strong>{formatDateBR(doc.vigencia)}</strong> • Arquivo: {doc.arquivoNome || 'Anexado'} ({doc.arquivoTamanho || 'OK'})
                          </span>
                        )}
                      </div>

                      {doc.rntrcData && (
                        <div style={{ fontSize: '0.725rem', color: '#166534', marginTop: '3px', fontWeight: 600 }}>
                          ✓ RNTRC Nº {doc.rntrcData.numero} • Categoria: {doc.rntrcData.categoria} • Situação: {doc.rntrcData.situacao}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {/* Status Tag */}
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: isMissing
                          ? (doc.obrigatorio ? '#FEE2E2' : '#F1F5F9')
                          : isExpired ? '#FEE2E2' : '#DCFCE7',
                        color: isMissing
                          ? (doc.obrigatorio ? '#991B1B' : '#475569')
                          : isExpired ? '#991B1B' : '#166534'
                      }}>
                        {isMissing
                          ? (doc.obrigatorio ? '✗ NÃO ENVIADO' : '⚪ OPCIONAL PENDENTE')
                          : isExpired ? '✗ VENCIDO / IRREGULAR' : '✓ REGULAR'}
                      </span>

                      {/* Direct Upload / Re-upload Action */}
                      <label
                        htmlFor={`upload-doc-${doc.id}`}
                        className={`btn ${isMissing && doc.obrigatorio ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        style={{
                          cursor: 'pointer',
                          fontSize: '0.775rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap',
                          background: isMissing && doc.obrigatorio ? '#DC2626' : undefined,
                          borderColor: isMissing && doc.obrigatorio ? '#DC2626' : undefined,
                          color: isMissing && doc.obrigatorio ? '#FFFFFF' : undefined
                        }}
                      >
                        <Upload size={13} />
                        <span>
                          {uploadingDocId === doc.id
                            ? "Processando..."
                            : isMissing
                            ? "Anexar Documento"
                            : "Substituir Arquivo"}
                        </span>
                        <input
                          id={`upload-doc-${doc.id}`}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          style={{ display: 'none' }}
                          disabled={uploadingDocId === doc.id}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleUploadOrReplaceDoc(doc, e.target.files[0]);
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
