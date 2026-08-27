import React, { useState } from 'react';
import { ShieldCheck, FileCheck, AlertTriangle, DollarSign, UploadCloud, FileText, CheckCircle2, AlertCircle, Eye, Trash2, Calendar, Sparkles } from 'lucide-react';
import { scanDocumentWithAI } from '../../services/aiDocumentScanner';
import { formatDateBR, calculateDocumentValidity, ALL_SYSTEM_DOCUMENTS } from '../../services/validityCalculator';

const GERENCIADORAS_RISCO = [
  "Buonny Projetos e Serviços",
  "OpenTech Gestão Logística",
  "Brasil Risk Gerenciamento",
  "AngelLira",
  "Kronos Gerenciamento de Risco",
  "GoldenSat",
  "Gristec",
  "Gerenciadora Própria Interna",
  "Outra Gerenciadora Homologada"
];

const SEGURADORAS_COMUNS = [
  "Porto Seguro Transportes",
  "Tokio Marine Seguradora",
  "Chubb Seguros Brasil",
  "Sompo Seguros",
  "Allianz Seguros",
  "MAPFRE Seguros",
  "Bradesco Seguros",
  "Fairfax Brasil (FF Seguros)",
  "Zurich Seguros",
  "Outra Companhia Seguradora"
];

// Documentos da Categoria 4 (Seguros e Gerenciamento de Risco)
const SEGUROS_DOC_DEFS = ALL_SYSTEM_DOCUMENTS.filter(d => d.categoryId === "cat_seguros_pgr");

export default function Step3SegurosRisco({ formData, updateFormData }) {
  const [scanningDocId, setScanningDocId] = useState(null);

  const gr = formData.gestaoRisco || {};
  const docs = formData.documentos || [];

  const handleNestedChange = (parent, field, value) => {
    updateFormData(parent, {
      ...formData[parent],
      [field]: value
    });
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleInsuranceFileUpload = async (docDef, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanningDocId(docDef.id);

    // 1. Convert to Base64
    const base64Data = await readFileAsBase64(file);

    // 2. OCR AI Scanning for Dates & Policy Numbers
    const aiResult = await scanDocumentWithAI(file, docDef);

    setScanningDocId(null);

    const isExpired = aiResult.validityAnalysis?.key === "EXPIRED";
    const existingIndex = docs.findIndex(d => d.id === docDef.id);

    const newDoc = {
      id: docDef.id,
      nome: docDef.nome,
      shortName: docDef.shortName,
      obrigatorio: docDef.obrigatorio,
      categoryId: "cat_seguros_pgr",
      status: isExpired ? "IRREGULAR" : "VALIDO",
      vigencia: aiResult.extractedVigencia || "31/12/2028",
      arquivoNome: file.name,
      arquivoTamanho: `${(file.size / 1024).toFixed(1)} KB`,
      arquivoMime: file.type || "application/pdf",
      arquivoBase64: base64Data,
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

    let updatedDocs;
    if (existingIndex >= 0) {
      updatedDocs = [...docs];
      updatedDocs[existingIndex] = { ...updatedDocs[existingIndex], ...newDoc };
    } else {
      updatedDocs = [...docs, newDoc];
    }

    updateFormData('documentos', updatedDocs);

    // Auto-update policy fields in gestaoRisco if scanned from RCTR-C / RC-DC
    if (docDef.id === "doc_apolice_rctrc" && aiResult.extractedVigencia) {
      handleNestedChange('gestaoRisco', 'vigenciaApolice', aiResult.extractedVigencia);
    }
  };

  const handleRemoveDoc = (docId) => {
    const updatedDocs = docs.filter(d => d.id !== docId);
    updateFormData('documentos', updatedDocs);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-900)' }}>
            Seção 3 — Gestão de Risco, Apólices de Seguro & PGR
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Informe os dados de cobertura securitária e anexe as apólices vigentes (RCTR-C / RC-DC), comprovantes e o PGR.
          </p>
        </div>
        <ShieldCheck size={28} color="var(--primary-600)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Banner Informativo de Conformidade */}
        <div style={{
          background: '#FEF2F2',
          borderLeft: '4px solid #EF4444',
          padding: '1rem',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.825rem', color: '#991B1B', lineHeight: 1.4 }}>
            <strong>Requisito Obrigatório LogShare:</strong> Todo transportador parceiro deve possuir apólices ativas de <strong>RCTR-C (Acidentes)</strong> e <strong>RC-DC (Roubo/Desaparecimento de Carga)</strong> com quitação em dia e Limite Máximo de Garantia (LMG) adequado, além de homologação em Gerenciadora de Risco com PGR ativo.
          </div>
        </div>

        {/* 3.1 Coberturas de Seguro de Carga */}
        <div className="card" style={{ background: 'var(--bg-subtle)', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--primary-900)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3.1 Coberturas & Informações das Apólices
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="seguradora">
                Companhia Seguradora <span className="required">*</span>
              </label>
              <select
                id="seguradora"
                className="form-select"
                value={gr.seguradora || ''}
                onChange={(e) => handleNestedChange('gestaoRisco', 'seguradora', e.target.value)}
                required
              >
                <option value="">Selecione a seguradora...</option>
                {SEGURADORAS_COMUNS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lmg">
                Limite Máximo de Garantia (LMG por Embarque em R$) <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  R$
                </span>
                <input
                  id="lmg"
                  type="number"
                  step="10000"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Ex: 500000"
                  value={gr.lmg ?? ''}
                  onChange={(e) => handleNestedChange('gestaoRisco', 'lmg', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <span className="form-hint">
                Valor máximo de mercadoria coberto por viagem/veículo
              </span>
            </div>
          </div>

          <div className="form-grid-3" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="apoliceRCTR_C">
                Número da Apólice RCTR-C (Acidentes) <span className="required">*</span>
              </label>
              <input
                id="apoliceRCTR_C"
                type="text"
                className="form-input"
                placeholder="Ex: 01.077.982.0001-44"
                value={gr.apoliceRCTR_C || ''}
                onChange={(e) => handleNestedChange('gestaoRisco', 'apoliceRCTR_C', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apoliceRC_DC">
                Número da Apólice RC-DC (Roubo/Desvio) <span className="required">*</span>
              </label>
              <input
                id="apoliceRC_DC"
                type="text"
                className="form-input"
                placeholder="Ex: 01.077.982.0002-55"
                value={gr.apoliceRC_DC || ''}
                onChange={(e) => handleNestedChange('gestaoRisco', 'apoliceRC_DC', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="vigenciaApolice">
                Data de Vencimento da Apólice <span className="required">*</span>
              </label>
              <input
                id="vigenciaApolice"
                type="text"
                className="form-input"
                placeholder="DD/MM/AAAA"
                value={gr.vigenciaApolice || ''}
                onChange={(e) => handleNestedChange('gestaoRisco', 'vigenciaApolice', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* 3.2 Gerenciadora de Risco & PGR */}
        <div className="card" style={{ background: 'var(--bg-subtle)', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--primary-900)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3.2 Gerenciadora de Risco Homologada & PGR
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="gerenciadoraRisco">
                Gerenciadora de Risco Parceira <span className="required">*</span>
              </label>
              <select
                id="gerenciadoraRisco"
                className="form-select"
                value={gr.gerenciadoraRisco || ''}
                onChange={(e) => handleNestedChange('gestaoRisco', 'gerenciadoraRisco', e.target.value)}
                required
              >
                <option value="">Selecione a gerenciadora...</option>
                {GERENCIADORAS_RISCO.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <span className="form-hint">Empresa responsável por consulta cadastral de motoristas e telemetria</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Plano de Gerenciamento de Risco (PGR) Ativo? <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.6rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="temPGR"
                    checked={gr.temPGR === true}
                    onChange={() => handleNestedChange('gestaoRisco', 'temPGR', true)}
                    style={{ accentColor: 'var(--primary-600)' }}
                  />
                  <span>Sim, possuímos PGR ativo</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="temPGR"
                    checked={gr.temPGR === false}
                    onChange={() => handleNestedChange('gestaoRisco', 'temPGR', false)}
                    style={{ accentColor: 'var(--primary-600)' }}
                  />
                  <span>Não possuímos PGR</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 3.3 Upload de Documentos de Seguro e PGR (Categoria 4 Oficial) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck size={18} color="#E53935" />
                <span>3.3 Documentos Comprobatórios de Seguro & Gerenciamento de Risco</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Anexe os arquivos digitais (PDF ou imagem). Os documentos anexados aqui são salvos e sincronizados automaticamente com o dossiê.
              </p>
            </div>
            <span style={{ fontSize: '0.725rem', background: '#FEF2F2', color: '#B91C1C', padding: '3px 10px', borderRadius: 4, fontWeight: 700 }}>
              4 Documentos Obrigatórios
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {SEGUROS_DOC_DEFS.map((docDef) => {
              const uploaded = docs.find(d => d.id === docDef.id);
              const isScanning = scanningDocId === docDef.id;
              const validity = uploaded?.vigencia ? calculateDocumentValidity(uploaded.vigencia) : null;

              return (
                <div
                  key={docDef.id}
                  className="card"
                  style={{
                    padding: '1rem 1.25rem',
                    border: uploaded ? '1.5px solid #86EFAC' : docDef.obrigatorio ? '1.5px solid #FCA5A5' : '1px solid var(--border-light)',
                    background: uploaded ? '#F0FDF4' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: '1 1 350px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-900)' }}>
                          {docDef.nome}
                        </span>
                        {docDef.obrigatorio ? (
                          <span style={{ fontSize: '0.675rem', background: '#FEF2F2', color: '#991B1B', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>
                            🔴 OBRIGATÓRIO
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.675rem', background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                            ⚪ RECOMENDADO
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem 0' }}>
                        {docDef.hint}
                      </p>

                      {/* Upload status or metadata */}
                      {uploaded ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.4rem', fontSize: '0.78rem' }}>
                          <span style={{ color: '#065F46', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} color="#10B981" />
                            <span>{uploaded.arquivoNome}</span>
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>({uploaded.arquivoTamanho})</span>
                          {uploaded.vigencia && (
                            <span style={{
                              background: validity?.bg || '#F3F4F6',
                              color: validity?.text || '#1F2937',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontWeight: 700,
                              fontSize: '0.72rem'
                            }}>
                              {validity?.icon} Vigência: {formatDateBR(uploaded.vigencia)}
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Upload / Replace Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label
                        className={`btn btn-sm ${uploaded ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ cursor: isScanning ? 'wait' : 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          style={{ display: 'none' }}
                          disabled={isScanning}
                          onChange={(e) => handleInsuranceFileUpload(docDef, e)}
                        />
                        {isScanning ? (
                          <>
                            <Sparkles size={14} className="animate-spin" />
                            <span>Analisando com IA...</span>
                          </>
                        ) : uploaded ? (
                          <>
                            <UploadCloud size={14} />
                            <span>Substituir Arquivo</span>
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
                          title="Remover anexo"
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
        </div>
      </div>
    </div>
  );
}
