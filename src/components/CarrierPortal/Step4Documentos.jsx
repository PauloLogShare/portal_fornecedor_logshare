import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, Calendar, FileCheck, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { scanDocumentWithAI } from '../../services/aiDocumentScanner';
import { calculateDocumentValidity, formatDateBR } from '../../services/validityCalculator';

export const DOCUMENT_CHECKLIST = [
  { id: "doc_cnpj", nome: "Cartão CNPJ (Receita Federal)", obrigatorio: true, desc: "Emitido no site da Receita Federal com situação ativa e CNAE de transporte rodoviário." },
  { id: "doc_rntrc", nome: "Certificado RNTRC / ANTT", obrigatorio: true, desc: "Registro Nacional de Transportadores Rodoviários de Cargas na categoria ETC." },
  { id: "doc_rctrc", nome: "Apólice de Seguro RCTR-C", obrigatorio: true, desc: "Cópia da apólice vigente e comprovante de quitação da seguradora." },
  { id: "doc_rcdc", nome: "Apólice de Seguro RC-DC", obrigatorio: true, desc: "Apólice de desaparecimento de carga / roubo com especificação de LMG." },
  { id: "doc_contrato", nome: "Contrato Social Consolidado", obrigatorio: true, desc: "Última alteração consolidada ou requerimento de empresário individual." },
  { id: "doc_cnd_federal", nome: "CND Federal / Previdenciária", obrigatorio: true, desc: "Certidão Conjunta Negativa de Tributos Federais e Dívida Ativa da União." },
  { id: "doc_cndt", nome: "Certidão Negativa de Débitos Trabalhistas (CNDT)", obrigatorio: true, desc: "Emitida pelo TST comprovando inexistência de pendências na Justiça do Trabalho." },
  { id: "doc_fgts", nome: "Certificado de Regularidade do FGTS (CRF)", obrigatorio: true, desc: "Emitido pela Caixa Econômica Federal comprovando regularidade do FGTS." },
  { id: "doc_bancario", nome: "Comprovante de Domicílio Bancário", obrigatorio: true, desc: "Extrato, folha de cheque cancelada ou carta do banco em nome da pessoa jurídica." },
  { id: "doc_pgr", nome: "PGR - Plano de Gerenciamento de Risco", obrigatorio: false, desc: "Se aplicável, manual de procedimentos de segurança emitido pela Gerenciadora de Risco." },
  { id: "doc_ambiental_mopp", nome: "Licença Ambiental / Certificados MOPP / Bombeiros", obrigatorio: false, desc: "Obrigatório para cargas especiais, licenças de funcionamento ou AVCB." }
];

export default function Step4Documentos({ formData, updateFormData }) {
  const docs = formData.documentos || [];
  const [scanningDocId, setScanningDocId] = useState(null);

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

    // 1. Read Base64 for Google Drive sync
    const base64Data = await readFileAsBase64(file);

    // 2. Call Real AI Document Scanner with PDF.js and neural date regex parser
    const aiResult = await scanDocumentWithAI(file, docDef);

    setScanningDocId(null);

    const existingIndex = docs.findIndex(d => d.id === docDef.id);
    const isExpired = aiResult.validityAnalysis?.key === "EXPIRED";

    const newDoc = {
      id: docDef.id,
      nome: docDef.nome,
      obrigatorio: docDef.obrigatorio,
      status: isExpired ? "IRREGULAR" : "VALIDO",
      vigencia: aiResult.extractedVigencia || "31/12/2028",
      arquivoNome: file.name,
      arquivoTamanho: `${(file.size / 1024).toFixed(1)} KB`,
      arquivoMime: file.type || "application/pdf",
      arquivoBase64: base64Data, // Stored for Google Drive auto-upload
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

  return (
    <div className="animate-fade-in">
      <div className="card-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-600)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <Sparkles size={14} />
            <span>LEITURA ÓPTICA POR IA EM TEMPO REAL (PDF.JS & OCR)</span>
          </div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-900)' }}>
            Seção 4 — Checklist Documental & Upload com Detecção de Validade
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Ao anexar qualquer arquivo, nosso motor de IA lê o texto e extrai automaticamente a data de validade (ex: <em>"Válido até 21/03/2025"</em>) classificando o status no padrão <strong>DD/MM/AAAA</strong>.
          </p>
        </div>
        <FileCheck size={28} color="var(--primary-600)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {DOCUMENT_CHECKLIST.map((docDef) => {
          const uploaded = docs.find(d => d.id === docDef.id);
          const hasFile = !!uploaded?.arquivoNome;
          const isScanning = scanningDocId === docDef.id;
          const validity = hasFile ? calculateDocumentValidity(uploaded.vigencia) : null;

          return (
            <div
              key={docDef.id}
              style={{
                border: `1.5px solid ${hasFile ? validity?.border || 'var(--status-apta-border)' : 'var(--border-light)'}`,
                background: hasFile ? validity?.bg || 'var(--status-apta-bg)' : 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                {/* Doc Info */}
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    {hasFile ? (
                      <span style={{ fontSize: '1.1rem' }}>{validity?.icon || '🟢'}</span>
                    ) : (
                      <FileText size={18} color="var(--text-muted)" />
                    )}
                    <h4 style={{ fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                      {docDef.nome}
                    </h4>
                    {docDef.obrigatorio ? (
                      <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#991b1b', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                        OBRIGATÓRIO
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#64748b', padding: '1px 6px', borderRadius: 4 }}>
                        SE APLICÁVEL
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {docDef.desc}
                  </p>

                  {hasFile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: validity?.text || 'var(--text-primary)' }}>
                        Arquivo: {uploaded.arquivoNome} {uploaded.arquivoTamanho && `(${uploaded.arquivoTamanho})`}
                      </span>
                      {uploaded.aiAnalysis && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(0, 86, 210, 0.1)', color: '#0056D2', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                          <Sparkles size={11} />
                          IA Confiança: {uploaded.aiAnalysis.confidence}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Upload Action & Vigência */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {hasFile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <input
                          type="text"
                          title="Data de vigência / validade extraída pela IA (DD/MM/AAAA)"
                          className="form-input"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: '135px', fontWeight: 700, textAlign: 'center' }}
                          value={uploaded.vigencia || ''}
                          onChange={(e) => handleVigenciaChange(docDef.id, e.target.value)}
                        />
                      </div>
                      <span style={{ fontSize: '0.725rem', color: validity?.text, fontWeight: 700, textAlign: 'right' }}>
                        {validity?.formattedLabel}
                      </span>
                    </div>
                  )}

                  {isScanning ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-600)', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Lendo PDF por IA...</span>
                    </div>
                  ) : hasFile ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRemoveDoc(docDef.id)}
                      style={{ color: 'var(--status-nao-apta-solid)' }}
                      title="Remover arquivo"
                    >
                      <Trash2 size={14} />
                      <span>Remover</span>
                    </button>
                  ) : (
                    <label
                      htmlFor={`upload-${docDef.id}`}
                      className="btn btn-primary btn-sm"
                      style={{ cursor: 'pointer' }}
                    >
                      <Upload size={14} />
                      <span>Anexar e Ler com IA</span>
                      <input
                        id={`upload-${docDef.id}`}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(docDef, e)}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Extra AI Insights Banner */}
              {hasFile && uploaded.aiAnalysis?.notes && (
                <div style={{
                  background: validity?.key === "EXPIRED" ? '#FEE2E2' : 'rgba(255,255,255,0.7)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  color: validity?.key === "EXPIRED" ? '#991B1B' : '#334155',
                  borderLeft: `3px solid ${validity?.color || 'var(--primary-600)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {validity?.key === "EXPIRED" && <AlertTriangle size={15} color="#EF4444" style={{ flexShrink: 0 }} />}
                  <div>
                    <span style={{ fontWeight: 700 }}>Diagnóstico IA: </span>
                    {uploaded.aiAnalysis.extractedDocType && `${uploaded.aiAnalysis.extractedDocType} • `}
                    {uploaded.aiAnalysis.notes}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
