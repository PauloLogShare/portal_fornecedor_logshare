import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Sparkles, Trash2, Calendar, ShieldCheck, Check, Filter, AlertTriangle, History } from 'lucide-react';
import { scanDocumentWithAI } from '../../services/aiDocumentScanner';
import { calculateDocumentValidity, formatDateBR, ALL_SYSTEM_DOCUMENTS, OFFICIAL_DOCUMENT_CATEGORIES } from '../../services/validityCalculator';
import DocumentVersionHistoryModal from '../SpecialistPanel/DocumentVersionHistoryModal';

export default function Step4Documentos({ formData, updateFormData }) {
  const docs = formData.documentos || [];
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [scanningDocId, setScanningDocId] = useState(null);
  const [historyModalDoc, setHistoryModalDoc] = useState(null);

  const readFileAsBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (docDef, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanningDocId(docDef.id);

    // 1. Read Base64 for Google Drive auto-sync
    const base64Data = await readFileAsBase64(file);

    // 2. OCR AI Scanning for Dates and Numbers
    const aiResult = await scanDocumentWithAI(file, docDef);

    setScanningDocId(null);

    const existingIndex = docs.findIndex(d => d.id === docDef.id);
    const existingDoc = existingIndex >= 0 ? docs[existingIndex] : null;
    const isExpired = aiResult.validityAnalysis?.key === "EXPIRED";

    // Versioning logic: preserve previous file in history array
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

    const newDoc = {
      id: docDef.id,
      nome: docDef.nome,
      shortName: docDef.shortName,
      obrigatorio: docDef.obrigatorio,
      categoryId: docDef.categoryId,
      status: isExpired ? "IRREGULAR" : "VALIDO",
      vigencia: aiResult.extractedVigencia || "31/12/2028",
      arquivoNome: file.name,
      arquivoTamanho: `${(file.size / 1024).toFixed(1)} KB`,
      arquivoMime: file.type || "application/pdf",
      arquivoBase64: base64Data,
      version: version,
      history: updatedHistory,
      aiAnalysis: {
        confidence: aiResult.confidence,
        extractedDocType: aiResult.extractedDocType,
        extractedNumber: aiResult.extractedNumber,
        extractedRazaoSocial: aiResult.extractedRazaoSocial,
        notes: aiResult.extractedNotes,
        isExpired
      },
      dataEnvio: new Date().toISOString()
    };

    let updated;
    if (existingIndex >= 0) {
      updated = [...docs];
      updated[existingIndex] = { ...updated[existingIndex], ...newDoc };
    } else {
      updated = [...docs, newDoc];
    }

    updateFormData('documentos', updated);
  };

  const handleVigenciaChange = (docId, dateVal) => {
    const validity = calculateDocumentValidity(dateVal);
    const updated = docs.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          vigencia: dateVal,
          status: validity.key === "EXPIRED" ? "IRREGULAR" : "VALIDO"
        };
      }
      return d;
    });
    updateFormData('documentos', updated);
  };

  const handleRemoveDoc = (docId) => {
    const updated = docs.filter(d => d.id !== docId);
    updateFormData('documentos', updated);
  };

  // Metrics
  const isLogShareInsurance = formData.gestaoRisco?.estipuladoLogShare || formData.gestaoRisco?.modeloSeguro === 'LOGSHARE_ESTIPULADO';
  const mandatoryDocs = ALL_SYSTEM_DOCUMENTS.filter(d => d.obrigatorio);
  const mandatoryUploadedCount = mandatoryDocs.filter(m => docs.some(d => d.id === m.id)).length;
  const totalUploadedCount = docs.length;

  // Filtered list
  const filteredDocs = selectedCategory === "ALL" 
    ? ALL_SYSTEM_DOCUMENTS 
    : ALL_SYSTEM_DOCUMENTS.filter(d => d.categoryId === selectedCategory);

  return (
    <div className="animate-fade-in">
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-900)' }}>
            Seção 4 — Checklist Documental & Habilitação Operacional
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Anexe os documentos comprobatórios organizados por categoria. O sistema realiza leitura inteligente de datas e conformidade.
          </p>
        </div>
        <FileText size={28} color="var(--primary-600)" />
      </div>

      {/* Progress & Summary Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #0A192F 0%, #103265 100%)',
        color: 'white',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#93C5FD', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Progresso de Homologação Documental
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
            {mandatoryUploadedCount} de {mandatoryDocs.length} Documentos Obrigatórios Anexados
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '180px',
            height: '10px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.round((mandatoryUploadedCount / mandatoryDocs.length) * 100)}%`,
              height: '100%',
              background: mandatoryUploadedCount === mandatoryDocs.length ? '#10B981' : '#FCD34D',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FCD34D' }}>
            {Math.round((mandatoryUploadedCount / mandatoryDocs.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`btn btn-sm ${selectedCategory === "ALL" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setSelectedCategory("ALL")}
          style={{ fontSize: '0.78rem' }}
        >
          <Filter size={13} />
          <span>Todos ({ALL_SYSTEM_DOCUMENTS.length})</span>
        </button>

        {OFFICIAL_DOCUMENT_CATEGORIES.map(cat => {
          const countInCat = ALL_SYSTEM_DOCUMENTS.filter(d => d.categoryId === cat.id).length;
          const uploadedInCat = ALL_SYSTEM_DOCUMENTS.filter(d => d.categoryId === cat.id && docs.some(doc => doc.id === d.id)).length;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                fontSize: '0.78rem',
                borderColor: isSelected ? undefined : cat.badgeColor,
                color: isSelected ? undefined : 'var(--text-primary)'
              }}
            >
              <span>{cat.shortTitle}</span>
              <span style={{
                background: isSelected ? 'rgba(255,255,255,0.25)' : cat.badgeBg,
                color: isSelected ? 'white' : cat.badgeColor,
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: 700,
                marginLeft: '4px'
              }}>
                {uploadedInCat}/{countInCat}
              </span>
            </button>
          );
        })}
      </div>

      {/* Documents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredDocs.map((docDef) => {
          const uploaded = docs.find(d => d.id === docDef.id);
          const isScanning = scanningDocId === docDef.id;
          const validity = uploaded?.vigencia ? calculateDocumentValidity(uploaded.vigencia) : null;
          const cat = OFFICIAL_DOCUMENT_CATEGORIES.find(c => c.id === docDef.categoryId);

          return (
            <div
              key={docDef.id}
              className="card"
              style={{
                padding: '1.25rem',
                border: uploaded 
                  ? (validity?.key === 'EXPIRED' ? '1.5px solid #FCA5A5' : '1.5px solid #86EFAC') 
                  : (docDef.obrigatorio ? '1.5px solid #FCA5A5' : '1px solid var(--border-light)'),
                background: uploaded ? (validity?.key === 'EXPIRED' ? '#FFF5F5' : '#F0FDF4') : 'white',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 380px' }}>
                  {/* Category Pill & Mandatory Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.675rem',
                      background: cat?.badgeBg || '#F1F5F9',
                      color: cat?.badgeColor || '#475569',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 700
                    }}>
                      {cat?.title}
                    </span>

                    {isLogShareInsurance && docDef.categoryId === 'cat_seguros_pgr' ? (
                      <span style={{ fontSize: '0.675rem', background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                        ✓ COBERTO VIA APÓLICE LOGSHARE
                      </span>
                    ) : docDef.obrigatorio ? (
                      <span style={{ fontSize: '0.675rem', background: '#FEF2F2', color: '#991B1B', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>
                        🔴 OBRIGATÓRIO
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.675rem', background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                        ⚪ CONDICIONAL / SETORIAL
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '0.95rem', color: 'var(--primary-900)', margin: '0 0 0.25rem 0' }}>
                    {docDef.nome}
                  </h3>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                    {docDef.hint}
                  </p>

                  {docDef.condicionalText && !docDef.obrigatorio && (
                    <div style={{ fontSize: '0.75rem', color: '#B45309', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} />
                      <span>{docDef.condicionalText}</span>
                    </div>
                  )}

                  {/* Uploaded File Info & AI OCR */}
                  {uploaded ? (
                    <div style={{
                      background: 'white',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      marginTop: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <CheckCircle2 size={16} color="#10B981" />
                          <strong style={{ fontSize: '0.825rem', color: 'var(--primary-900)' }}>
                            {uploaded.arquivoNome}
                          </strong>
                          <span style={{ fontSize: '0.675rem', background: '#E2E8F0', color: '#1E293B', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>
                            v{uploaded.version || 1}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ({uploaded.arquivoTamanho})
                          </span>

                          {/* History Button if previous versions exist */}
                          {uploaded.history && uploaded.history.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setHistoryModalDoc(uploaded)}
                              style={{
                                border: '1px solid #BFDBFE',
                                background: '#EFF6FF',
                                color: '#1E40AF',
                                borderRadius: '4px',
                                padding: '1px 6px',
                                fontSize: '0.675rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              title="Visualizar versões anteriores arquivadas deste documento"
                            >
                              <History size={11} />
                              <span>Histórico ({uploaded.history.length})</span>
                            </button>
                          )}
                        </div>

                        {/* Validity Badge */}
                        {uploaded.vigencia && (
                          <span style={{
                            background: validity?.bg,
                            color: validity?.text,
                            border: `1px solid ${validity?.border}`,
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            {validity?.icon} {validity?.label} ({formatDateBR(uploaded.vigencia)})
                          </span>
                        )}
                      </div>

                      {/* AI Extraction Notes */}
                      {uploaded.aiAnalysis?.notes && (
                        <div style={{ fontSize: '0.75rem', color: '#1E293B', background: '#F8FAFC', padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Sparkles size={12} color="#0056D2" />
                          <span>{uploaded.aiAnalysis.notes}</span>
                        </div>
                      )}

                      {/* Manual Validity Date Editor */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Data de Vigência / Validade:
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ width: '130px', padding: '2px 8px', fontSize: '0.75rem', height: '28px' }}
                          placeholder="DD/MM/AAAA"
                          value={uploaded.vigencia || ''}
                          onChange={(e) => handleVigenciaChange(docDef.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Upload & Delete Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label
                    className={`btn btn-sm ${uploaded ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ cursor: isScanning ? 'wait' : 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                  >
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      style={{ display: 'none' }}
                      disabled={isScanning}
                      onChange={(e) => handleFileUpload(docDef, e)}
                    />
                    {isScanning ? (
                      <>
                        <Sparkles size={14} className="animate-spin" />
                        <span>Lendo com IA...</span>
                      </>
                    ) : uploaded ? (
                      <>
                        <UploadCloud size={14} />
                        <span>Substituir (v{(uploaded.version || 1) + 1})</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={14} />
                        <span>Anexar Documento</span>
                      </>
                    )}
                  </label>

                  {uploaded && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRemoveDoc(docDef.id)}
                      style={{ color: '#EF4444', borderColor: '#FCA5A5', padding: '0.35rem 0.5rem' }}
                      title="Excluir documento"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Histórico de Versões */}
      <DocumentVersionHistoryModal
        isOpen={!!historyModalDoc}
        onClose={() => setHistoryModalDoc(null)}
        document={historyModalDoc}
        carrierName={formData.razaoSocial}
      />
    </div>
  );
}
