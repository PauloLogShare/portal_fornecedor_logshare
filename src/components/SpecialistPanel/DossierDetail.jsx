import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, FileText, Shield, Truck, Building2, DollarSign, Calendar, Eye, RefreshCw, Save, Send, Sparkles, Layers } from 'lucide-react';
import RiskScoreEngine from './RiskScoreEngine';
import ParecerGenerator from './ParecerGenerator';
import { calculateRiskScore, evaluateCarrier, generateExecutiveSummary, generateRequiredActions } from '../../services/riskEngineService';
import { saveCarrier } from '../../services/storageService';
import { calculateDocumentValidity, OFFICIAL_DOCUMENT_CATEGORIES, ALL_SYSTEM_DOCUMENTS, formatDateBR } from '../../services/validityCalculator';

export default function DossierDetail({ carrierId, allCarriers, onBack, onUpdateCarrierList, onSyncDrive }) {
  const carrier = allCarriers.find(c => c.id === carrierId) || allCarriers[0];
  
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'parecer' | 'profile'
  const [docsState, setDocsState] = useState(carrier.documentos || []);
  const [currentCarrier, setCurrentCarrier] = useState(carrier);

  const [parecerState, setParecerState] = useState(
    carrier.parecer || {
      statusFinal: carrier.status || "APTA",
      dataEmissao: new Date().toISOString(),
      especialistaNome: "Especialista em Homologação LogShare",
      resumoExecutivo: "",
      restricoesOperacionais: [],
      acoesRequeridas: "",
      observacoesInternas: ""
    }
  );

  // Recalculate score whenever docs change
  useEffect(() => {
    const updatedCarrier = {
      ...currentCarrier,
      documentos: docsState
    };
    const { scoreTotal, breakdown } = calculateRiskScore(updatedCarrier);
    const evaluation = evaluateCarrier(updatedCarrier);
    
    const updatedWithScore = {
      ...updatedCarrier,
      scoreTotal,
      scoreBreakdown: breakdown
    };

    setCurrentCarrier(updatedWithScore);

    // If parecer executive summary is empty, generate default
    if (!parecerState.resumoExecutivo) {
      setParecerState(prev => ({
        ...prev,
        statusFinal: evaluation.suggestedStatus,
        resumoExecutivo: generateExecutiveSummary(updatedWithScore, evaluation.suggestedStatus, scoreTotal),
        acoesRequeridas: generateRequiredActions(updatedWithScore, evaluation.suggestedStatus)
      }));
    }
  }, [docsState]);

  const handleDocStatusChange = (docId, newStatus) => {
    const updated = docsState.map(d => {
      if (d.id === docId) {
        return { ...d, status: newStatus };
      }
      return d;
    });
    setDocsState(updated);
  };

  const handleDocVigenciaChange = (docId, vigencia) => {
    const validity = calculateDocumentValidity(vigencia);
    const updated = docsState.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          vigencia,
          status: validity.key === "EXPIRED" ? "IRREGULAR" : d.status === "IRREGULAR" ? "VALIDO" : d.status
        };
      }
      return d;
    });
    setDocsState(updated);
  };

  const handleUpdateParecerField = (field, value) => {
    setParecerState(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'statusFinal') {
        // Regenerate summary based on new status
        updated.resumoExecutivo = generateExecutiveSummary(currentCarrier, value, currentCarrier.scoreTotal);
        updated.acoesRequeridas = generateRequiredActions(currentCarrier, value);
      }
      return updated;
    });
  };

  const handleSaveAndFinalize = () => {
    const finalized = {
      ...currentCarrier,
      status: parecerState.statusFinal,
      parecer: {
        ...parecerState,
        dataEmissao: new Date().toISOString()
      },
      ultimaAtualizacao: new Date().toISOString()
    };

    const updatedList = saveCarrier(finalized);
    onUpdateCarrierList(updatedList);
    setCurrentCarrier(finalized);
    alert(`Parecer de Homologação formalizado com sucesso! Status: ${parecerState.statusFinal.replace('_', ' ')}`);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Bar with Return & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Voltar para Lista de Dossiês</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Protocolo: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-600)' }}>{currentCarrier.protocol || 'N/A'}</strong>
          </span>
          <span className={`badge ${currentCarrier.status === 'APTA' ? 'badge-apta' : currentCarrier.status === 'APTA_COM_RESTRICOES' ? 'badge-restricoes' : currentCarrier.status === 'NAO_APTA' ? 'badge-nao-apta' : 'badge-em-analise'}`}>
            {currentCarrier.status ? currentCarrier.status.replace(/_/g, ' ') : 'EM ANÁLISE'}
          </span>
        </div>
      </div>

      {/* Header Profile Summary */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #103265 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#00D2FF', textTransform: 'uppercase', fontWeight: 700 }}>
              Dossiê de Homologação
            </span>
            <h2 style={{ fontSize: '1.5rem', color: 'white', margin: '0.25rem 0' }}>
              {currentCarrier.razaoSocial}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#cbd5e1', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <span><strong>CNPJ:</strong> {currentCarrier.cnpj}</span>
              <span>•</span>
              <span><strong>Fantasia:</strong> {currentCarrier.nomeFantasia || '—'}</span>
              <span>•</span>
              <span><strong>Local:</strong> {currentCarrier.endereco?.cidade} - {currentCarrier.endereco?.uf}</span>
              <span>•</span>
              <span><strong>Contato:</strong> {currentCarrier.contato?.responsavel} ({currentCarrier.contato?.telefone})</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Score Atual</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: currentCarrier.scoreTotal >= 800 ? '#10B981' : currentCarrier.scoreTotal >= 600 ? '#F59E0B' : '#EF4444' }}>
              {currentCarrier.scoreTotal}
              <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/1000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('audit')}
        >
          <FileText size={15} />
          <span>Auditoria Documental & Score</span>
        </button>

        <button
          className={`btn ${activeTab === 'parecer' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('parecer')}
        >
          <Shield size={15} />
          <span>Emitir Parecer Oficial</span>
        </button>

        <button
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('profile')}
        >
          <Truck size={15} />
          <span>Ficha Cadastral & Frota</span>
        </button>
      </div>

      {/* TAB 1: Auditoria Documental & Score */}
      {activeTab === 'audit' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Coluna Esquerda: Checklist Documental */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-900)' }}>
                  Validação Documental Item a Item
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Analise a autenticidade e validade dos documentos. Ao alterar os status, o Score de Risco é recalculado instantaneamente.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {OFFICIAL_DOCUMENT_CATEGORIES.map(cat => {
                const categoryDocs = docsState.filter(d => {
                  const masterDef = ALL_SYSTEM_DOCUMENTS.find(m => m.id === d.id);
                  return d.categoryId === cat.id || masterDef?.categoryId === cat.id;
                });

                if (categoryDocs.length === 0) return null;

                return (
                  <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '4px 8px',
                      background: cat.badgeBg,
                      borderLeft: `4px solid ${cat.badgeColor}`,
                      borderRadius: '0 4px 4px 0'
                    }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: cat.badgeColor }}>
                        {cat.title}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        ({categoryDocs.length} documentos)
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {categoryDocs.map((doc) => {
                        const validity = calculateDocumentValidity(doc.vigencia);
                        return (
                          <div
                            key={doc.id}
                            style={{
                              border: `1.5px solid ${doc.status === 'VALIDO' ? validity.border : doc.status === 'PENDENTE' ? 'var(--status-restricoes-border)' : 'var(--status-nao-apta-border)'}`,
                              background: doc.status === 'VALIDO' ? validity.bg : doc.status === 'PENDENTE' ? 'var(--status-restricoes-bg)' : 'var(--status-nao-apta-bg)',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.75rem 1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <span style={{ fontSize: '1rem' }}>{validity.icon}</span>
                                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                    {doc.nome}
                                  </span>
                                  {doc.obrigatorio ? (
                                    <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#991b1b', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                      🔴 OBRIGATÓRIO
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.65rem', background: '#F1F5F9', color: '#475569', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                      ⚪ CONDICIONAL
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                    Arquivo: {doc.arquivoNome || 'Nenhum anexo'}
                                  </span>
                                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: validity.text }}>
                                    • {validity.formattedLabel}
                                  </span>
                                </div>
                              </div>

                              {/* Status Toggle Buttons */}
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button
                                  type="button"
                                  className={`btn btn-sm ${doc.status === 'VALIDO' ? 'btn-success' : 'btn-secondary'}`}
                                  onClick={() => handleDocStatusChange(doc.id, 'VALIDO')}
                                  style={{ padding: '0.2rem 0.55rem', fontSize: '0.725rem' }}
                                >
                                  ✓ Válido
                                </button>

                                <button
                                  type="button"
                                  className={`btn btn-sm ${doc.status === 'PENDENTE' ? 'btn-warning' : 'btn-secondary'}`}
                                  onClick={() => handleDocStatusChange(doc.id, 'PENDENTE')}
                                  style={{ padding: '0.2rem 0.55rem', fontSize: '0.725rem' }}
                                >
                                  ⏳ Pendente
                                </button>

                                <button
                                  type="button"
                                  className={`btn btn-sm ${doc.status === 'IRREGULAR' ? 'btn-danger' : 'btn-secondary'}`}
                                  onClick={() => handleDocStatusChange(doc.id, 'IRREGULAR')}
                                  style={{ padding: '0.2rem 0.55rem', fontSize: '0.725rem' }}
                                >
                                  ✗ Irregular
                                </button>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', paddingTop: '0.25rem', borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
                              <span>Vigência informada:</span>
                              <input
                                type="text"
                                className="form-input"
                                style={{ width: '130px', padding: '0.15rem 0.4rem', fontSize: '0.75rem', fontWeight: 600, height: '26px' }}
                                value={doc.vigencia || ''}
                                onChange={(e) => handleDocVigenciaChange(doc.id, e.target.value)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={() => setActiveTab('parecer')}
              >
                <span>Avançar para Emissão do Parecer</span>
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Coluna Direita: Score Engine */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <RiskScoreEngine scoreTotal={currentCarrier.scoreTotal} breakdown={currentCarrier.scoreBreakdown} />

            {/* Quick Summary Card */}
            <div className="card">
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-900)', marginBottom: '0.75rem' }}>
                Resumo da Gestão de Risco
              </h4>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <div><strong>Seguradora:</strong> {currentCarrier.gestaoRisco?.seguradora || 'Não informada'}</div>
                <div><strong>LMG Cobertura:</strong> R$ {currentCarrier.gestaoRisco?.lmg ? currentCarrier.gestaoRisco.lmg.toLocaleString('pt-BR') : '0'}</div>
                <div><strong>Apólice RCTR-C:</strong> {currentCarrier.gestaoRisco?.apoliceRCTR_C || '—'}</div>
                <div><strong>Apólice RC-DC:</strong> {currentCarrier.gestaoRisco?.apoliceRC_DC || '—'}</div>
                <div><strong>Gerenciadora de Risco:</strong> {currentCarrier.gestaoRisco?.gerenciadoraRisco || '—'}</div>
                <div><strong>PGR Formalizado:</strong> {currentCarrier.gestaoRisco?.temPGR ? 'Sim (Ativo)' : 'Não'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Parecer de Homologação */}
      {activeTab === 'parecer' && (
        <ParecerGenerator
          carrier={currentCarrier}
          parecerData={parecerState}
          onUpdateParecer={handleUpdateParecerField}
          onSaveParecer={handleSaveAndFinalize}
          onSyncDrive={() => onSyncDrive(currentCarrier)}
        />
      )}

      {/* TAB 3: Ficha Cadastral Completa */}
      {activeTab === 'profile' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-900)' }}>
              Ficha Cadastral e Operacional Completa
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.875rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-700)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                1. Identificação da Empresa & Contatos
              </h4>
              <div className="form-grid-3">
                <div><strong>Razão Social:</strong> {currentCarrier.razaoSocial}</div>
                <div><strong>Nome Fantasia:</strong> {currentCarrier.nomeFantasia || '—'}</div>
                <div><strong>CNPJ:</strong> {currentCarrier.cnpj}</div>
                <div><strong>Inscrição Estadual:</strong> {currentCarrier.inscricaoEstadual || '—'}</div>
                <div><strong>Data de Abertura:</strong> {currentCarrier.aberturaCNPJ || '—'}</div>
                <div><strong>Endereço:</strong> {currentCarrier.endereco?.logradouro}, {currentCarrier.endereco?.bairro} - {currentCarrier.endereco?.cidade}/{currentCarrier.endereco?.uf} - CEP {currentCarrier.endereco?.cep}</div>
                <div><strong>Contato:</strong> {currentCarrier.contato?.responsavel} ({currentCarrier.contato?.cargo})</div>
                <div><strong>E-mail:</strong> {currentCarrier.contato?.email}</div>
                <div><strong>Telefone:</strong> {currentCarrier.contato?.telefone}</div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-700)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                2. Perfil Operacional & Frota
              </h4>
              <div className="form-grid-2">
                <div>
                  <strong>Tipos de Carga:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {(currentCarrier.perfilOperacional?.tiposCarga || []).map(t => (
                      <span key={t} className="badge badge-em-analise" style={{ fontSize: '0.75rem' }}>{t}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <strong>Regiões Atendidas:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {(currentCarrier.perfilOperacional?.regioes || []).map(r => (
                      <span key={r} className="badge badge-em-analise" style={{ fontSize: '0.75rem' }}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-grid-3" style={{ marginTop: '0.75rem' }}>
                <div><strong>Frota Própria:</strong> {currentCarrier.perfilOperacional?.frotaPropria || 0} veículos</div>
                <div><strong>Frota Agregada:</strong> {currentCarrier.perfilOperacional?.frotaAgregada || 0} veículos</div>
                <div><strong>Rastreadores:</strong> {(currentCarrier.perfilOperacional?.tecnologiaRastreamento || []).join(', ') || 'Nenhum'}</div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-700)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                3. Dados Bancários
              </h4>
              <div className="form-grid-4">
                <div><strong>Banco:</strong> {currentCarrier.dadosBancarios?.banco || '—'}</div>
                <div><strong>Agência:</strong> {currentCarrier.dadosBancarios?.agencia || '—'}</div>
                <div><strong>Conta:</strong> {currentCarrier.dadosBancarios?.conta || '—'}</div>
                <div><strong>Chave PIX:</strong> {currentCarrier.dadosBancarios?.chavePix || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
