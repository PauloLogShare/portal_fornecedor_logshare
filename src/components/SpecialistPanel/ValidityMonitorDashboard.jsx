import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, Calendar, Mail, MessageSquare, Send, Search, Filter, ShieldAlert, FileText, Check, Copy, LayoutGrid, Table, Eye, Layers } from 'lucide-react';
import { calculateDocumentValidity, TRAFFIC_LIGHT_COLORS, getCarriersValidityMetrics, ALL_SYSTEM_DOCUMENTS, formatDateBR } from '../../services/validityCalculator';

export default function ValidityMonitorDashboard({ carriers, onSelectCarrier }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'EXPIRED' | 'EXPIRING_SOON' | 'VALID'
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'societario' | 'regulatorio' | 'seguros' | 'fiscal'
  const [selectedCarrierForAlert, setSelectedCarrierForAlert] = useState(null);
  const [copiedAlert, setCopiedAlert] = useState(false);

  // Metrics
  const metrics = getCarriersValidityMetrics(carriers);

  // Analyze each carrier's document list against all 11 system documents
  const analyzedCarriers = carriers.map(carrier => {
    const carrierDocs = carrier.documentos || [];
    
    // Map across all 11 official documents
    const docAnalyses = ALL_SYSTEM_DOCUMENTS.map(docDef => {
      const found = carrierDocs.find(d => d.id === docDef.id);
      if (!found) {
        return {
          ...docDef,
          status: "AUSENTE",
          vigencia: "Ausente",
          arquivoNome: null,
          analysis: calculateDocumentValidity("Ausente")
        };
      }
      return {
        ...docDef,
        ...found,
        analysis: calculateDocumentValidity(found.vigencia)
      };
    });

    const hasExpired = docAnalyses.some(d => d.analysis.key === "EXPIRED" && d.obrigatorio);
    const hasExpiringSoon = docAnalyses.some(d => d.analysis.key === "EXPIRING_SOON" && d.obrigatorio);
    
    let carrierSeverity = "VALID";
    if (hasExpired) carrierSeverity = "EXPIRED";
    else if (hasExpiringSoon) carrierSeverity = "EXPIRING_SOON";

    return {
      ...carrier,
      docAnalyses,
      carrierSeverity
    };
  });

  // Filter carriers by search and severity
  const filtered = analyzedCarriers.filter(c => {
    const matchesSearch =
      (c.razaoSocial || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.cnpj || '').includes(searchTerm);

    if (!matchesSearch) return false;
    if (filterSeverity === 'ALL') return true;
    return c.carrierSeverity === filterSeverity;
  });

  // Count carriers by severity
  const expiredCarriersCount = analyzedCarriers.filter(c => c.carrierSeverity === 'EXPIRED').length;
  const expiringSoonCarriersCount = analyzedCarriers.filter(c => c.carrierSeverity === 'EXPIRING_SOON').length;
  const validCarriersCount = analyzedCarriers.filter(c => c.carrierSeverity === 'VALID').length;

  // Filter columns based on category tab
  const visibleColumns = ALL_SYSTEM_DOCUMENTS.filter(docDef => {
    if (selectedCategory === 'ALL') return true;
    return docDef.category === selectedCategory;
  });

  const handleOpenAlertModal = (carrier) => {
    setSelectedCarrierForAlert(carrier);
  };

  const getAlertMessage = (carrier) => {
    if (!carrier) return "";
    const pendencias = (carrier.docAnalyses || []).filter(d => d.analysis.key === "EXPIRED" || d.analysis.key === "EXPIRING_SOON");
    
    return `Olá, ${carrier.contato?.responsavel || 'Prezado Parceiro'} da transportadora ${carrier.razaoSocial}!\n\n` +
           `Identificamos documentos com necessidade de atualização cadastral no monitoramento da LogShare (CNPJ ${carrier.cnpj}):\n\n` +
           pendencias.map(p => `• ${p.nome}: ${p.analysis.formattedLabel}`).join('\n') +
           `\n\nPor favor, envie as certidões e apólices vigentes pelo Portal do Transportador LogShare para manter seu cadastro apto e sem travas operacionais.\n\n` +
           `Atenciosamente,\nEquipe de Homologação & Gestão de Risco LogShare`;
  };

  const handleCopyAlertMessage = () => {
    const msg = getAlertMessage(selectedCarrierForAlert);
    navigator.clipboard.writeText(msg);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2000);
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
            <span>MATRIZ COMPLETA DE CONFORMIDADE</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Monitor de Vigências & Validades (11 Documentos)
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '650px' }}>
            Controle de vencimentos com padrão de data <strong>DD/MM/AAAA</strong>: <strong style={{ color: '#F87171' }}>🔴 Vermelho (Vencido)</strong>, <strong style={{ color: '#FBBF24' }}>🟡 Amarelo (≤ 30 dias para vencer)</strong> e <strong style={{ color: '#34D399' }}>🟢 Verde (Válido / OK)</strong>.
          </p>
        </div>

        {/* View Mode Switcher + Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
            >
              <Table size={14} />
              <span>Matriz em Tabela</span>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('cards')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
            >
              <LayoutGrid size={14} />
              <span>Visão em Cards</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
            <span>🔴 <strong>Vencido</strong></span>
            <span>🟡 <strong>≤ 30 dias</strong></span>
            <span>🟢 <strong>Válido / OK</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Total Vencidos (Vermelho) */}
        <div
          className="card"
          onClick={() => setFilterSeverity(filterSeverity === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid var(--status-nao-apta-solid)',
            background: filterSeverity === 'EXPIRED' ? 'var(--status-nao-apta-bg)' : 'white',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-nao-apta-text)', textTransform: 'uppercase' }}>
              🔴 Transportadores com Vencidos
            </span>
            <AlertCircle size={20} color="var(--status-nao-apta-solid)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-nao-apta-solid)', marginTop: '0.4rem' }}>
            {expiredCarriersCount}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '8px' }}>
              ({metrics.expiredDocs} docs vencidos)
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requer bloqueio preventivo</span>
        </div>

        {/* Total A Vencer em 30d (Amarelo) */}
        <div
          className="card"
          onClick={() => setFilterSeverity(filterSeverity === 'EXPIRING_SOON' ? 'ALL' : 'EXPIRING_SOON')}
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid var(--status-restricoes-solid)',
            background: filterSeverity === 'EXPIRING_SOON' ? 'var(--status-restricoes-bg)' : 'white',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-restricoes-text)', textTransform: 'uppercase' }}>
              🟡 A Vencer em ≤ 30 Dias
            </span>
            <Clock size={20} color="var(--status-restricoes-solid)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-restricoes-solid)', marginTop: '0.4rem' }}>
            {expiringSoonCarriersCount}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '8px' }}>
              ({metrics.expiringSoonDocs} docs a vencer)
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Disparar alerta de renovação</span>
        </div>

        {/* Total Conformes (Verde) */}
        <div
          className="card"
          onClick={() => setFilterSeverity(filterSeverity === 'VALID' ? 'ALL' : 'VALID')}
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid var(--status-apta-solid)',
            background: filterSeverity === 'VALID' ? 'var(--status-apta-bg)' : 'white',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-apta-text)', textTransform: 'uppercase' }}>
              🟢 100% Conformes (OK)
            </span>
            <CheckCircle2 size={20} color="var(--status-apta-solid)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-apta-solid)', marginTop: '0.4rem' }}>
            {validCarriersCount}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '8px' }}>
              ({metrics.validDocs} docs regulares)
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Operação liberada</span>
        </div>
      </div>

      {/* Filter and Category Tabs Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Buscar transportador na matriz..."
              style={{ paddingLeft: '2.4rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Severity Pills */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${filterSeverity === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterSeverity('ALL')}
            >
              Todos ({analyzedCarriers.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterSeverity === 'EXPIRED' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setFilterSeverity('EXPIRED')}
            >
              🔴 Vencidos ({expiredCarriersCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterSeverity === 'EXPIRING_SOON' ? 'btn-warning' : 'btn-secondary'}`}
              onClick={() => setFilterSeverity('EXPIRING_SOON')}
            >
              🟡 A Vencer ≤30d ({expiringSoonCarriersCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterSeverity === 'VALID' ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => setFilterSeverity('VALID')}
            >
              🟢 Conformes ({validCarriersCount})
            </button>
          </div>
        </div>

        {/* Category Sub-Filters for Matrix Columns */}
        {viewMode === 'table' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={14} /> Agrupar Documentos:
            </span>
            {[
              { id: 'ALL', label: '🌟 Todos os 11 Documentos' },
              { id: 'seguros', label: '🛡️ Seguros & PGR' },
              { id: 'fiscal', label: '🏛️ Fiscal & Trabalhista' },
              { id: 'regulatorio', label: '🚛 RNTRC & Licenças' },
              { id: 'societario', label: '🏢 Societário & Bancário' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategory(cat.id)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)' }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: MATRIZ EM TABELA COM STICKY COLUMN & SCROLL INTELIGENTE           */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  {/* Sticky Column: Transportador & Semáforo */}
                  <th style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 10,
                    background: 'var(--bg-subtle)',
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    minWidth: '240px',
                    borderBottom: '2px solid var(--border-light)',
                    boxShadow: '4px 0 8px rgba(0,0,0,0.04)'
                  }}>
                    Transportadora (CNPJ)
                  </th>

                  <th style={{
                    position: 'sticky',
                    left: '240px',
                    zIndex: 10,
                    background: 'var(--bg-subtle)',
                    padding: '0.85rem 0.5rem',
                    textAlign: 'center',
                    minWidth: '75px',
                    borderBottom: '2px solid var(--border-light)',
                    boxShadow: '4px 0 8px rgba(0,0,0,0.06)'
                  }}>
                    Semáforo
                  </th>

                  {/* Document Columns */}
                  {visibleColumns.map(docDef => (
                    <th
                      key={docDef.id}
                      style={{
                        padding: '0.85rem 0.75rem',
                        textAlign: 'center',
                        minWidth: '150px',
                        borderBottom: '2px solid var(--border-light)',
                        color: 'var(--primary-900)'
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{docDef.shortName}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {docDef.obrigatorio ? 'Exigido' : 'Opcional'}
                      </div>
                    </th>
                  ))}

                  <th style={{
                    padding: '0.85rem 1rem',
                    textAlign: 'right',
                    minWidth: '150px',
                    borderBottom: '2px solid var(--border-light)'
                  }}>
                    Ações de Alerta
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(carrier => {
                  return (
                    <tr
                      key={carrier.id}
                      style={{ transition: 'background 0.15s ease' }}
                      className="table-row-hover"
                    >
                      {/* Sticky Left 1: Transportador */}
                      <td style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 5,
                        background: 'white',
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid var(--border-light)',
                        boxShadow: '4px 0 8px rgba(0,0,0,0.04)'
                      }}>
                        <div
                          onClick={() => onSelectCarrier(carrier.id)}
                          style={{ fontWeight: 700, color: 'var(--primary-600)', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          {carrier.razaoSocial}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {carrier.cnpj}
                        </div>
                      </td>

                      {/* Sticky Left 2: Semáforo Global */}
                      <td style={{
                        position: 'sticky',
                        left: '240px',
                        zIndex: 5,
                        background: 'white',
                        padding: '0.85rem 0.5rem',
                        textAlign: 'center',
                        borderBottom: '1px solid var(--border-light)',
                        boxShadow: '4px 0 8px rgba(0,0,0,0.06)'
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {carrier.carrierSeverity === 'EXPIRED' && '🔴'}
                          {carrier.carrierSeverity === 'EXPIRING_SOON' && '🟡'}
                          {carrier.carrierSeverity === 'VALID' && '🟢'}
                        </span>
                      </td>

                      {/* Dynamic Document Cells */}
                      {visibleColumns.map(docDef => {
                        const doc = carrier.docAnalyses.find(d => d.id === docDef.id);
                        const val = doc?.analysis || calculateDocumentValidity(doc?.vigencia);

                        return (
                          <td
                            key={docDef.id}
                            style={{
                              padding: '0.65rem 0.5rem',
                              textAlign: 'center',
                              borderBottom: '1px solid var(--border-light)'
                            }}
                          >
                            <div
                              title={`${docDef.nome}: ${val.formattedLabel}`}
                              style={{
                                padding: '5px 8px',
                                borderRadius: 'var(--radius-sm)',
                                background: val.bg,
                                border: `1px solid ${val.border}`,
                                color: val.text,
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px',
                                minWidth: '115px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <span>{val.icon}</span>
                                <span>{String(val.formattedDate || '—')}</span>
                              </div>
                              {val.daysRemaining !== 9999 && val.daysRemaining !== -999 && (
                                <span style={{ fontSize: '0.65rem', opacity: 0.85, fontWeight: 500 }}>
                                  {val.daysRemaining < 0
                                    ? `Venceu há ${Math.abs(val.daysRemaining)}d`
                                    : val.daysRemaining <= 30
                                    ? `Vence em ${val.daysRemaining}d`
                                    : `${val.daysRemaining}d restantes`}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Ações */}
                      <td style={{
                        padding: '0.85rem 1rem',
                        textAlign: 'right',
                        borderBottom: '1px solid var(--border-light)'
                      }}>
                        {carrier.carrierSeverity !== 'VALID' ? (
                          <button
                            type="button"
                            className="btn btn-warning btn-sm"
                            onClick={() => handleOpenAlertModal(carrier)}
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                          >
                            <Send size={13} />
                            <span>Notificar</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--status-apta-text)', fontWeight: 600 }}>
                            ✓ Regular
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={visibleColumns.length + 3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      Nenhum transportador encontrado com os filtros de vigência selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: VISÃO EM CARDS POR TRANSPORTADOR (100% RESPONSIVA, ZERO SCROLL)   */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(carrier => (
            <div
              key={carrier.id}
              className="card"
              style={{
                borderLeft: `5px solid ${carrier.carrierSeverity === 'EXPIRED' ? '#EF4444' : carrier.carrierSeverity === 'EXPIRING_SOON' ? '#F59E0B' : '#10B981'}`
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3
                    onClick={() => onSelectCarrier(carrier.id)}
                    style={{ fontSize: '1.05rem', color: 'var(--primary-900)', cursor: 'pointer', margin: 0 }}
                  >
                    {carrier.razaoSocial}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    CNPJ: {carrier.cnpj} • Contato: {carrier.contato?.responsavel || 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>
                    {carrier.carrierSeverity === 'EXPIRED' && '🔴'}
                    {carrier.carrierSeverity === 'EXPIRING_SOON' && '🟡'}
                    {carrier.carrierSeverity === 'VALID' && '🟢'}
                  </span>
                </div>
              </div>

              {/* Grid of 11 Documents inside the Card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {ALL_SYSTEM_DOCUMENTS.map(docDef => {
                  const doc = carrier.docAnalyses.find(d => d.id === docDef.id);
                  const val = doc?.analysis || calculateDocumentValidity(doc?.vigencia);

                  return (
                    <div
                      key={docDef.id}
                      style={{
                        padding: '0.45rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: val.bg,
                        border: `1px solid ${val.border}`,
                        color: val.text,
                        fontSize: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span>{val.icon}</span>
                          <span>{docDef.shortName}</span>
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                          {String(val.formattedDate || '—')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>
                        {val.daysRemaining < 0
                          ? `Venceu há ${Math.abs(val.daysRemaining)} dias`
                          : val.daysRemaining <= 30
                          ? `Vence em ${val.daysRemaining} dias`
                          : `Válido (${val.daysRemaining === 9999 ? 'Indet.' : `${val.daysRemaining}d`})`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onSelectCarrier(carrier.id)}
                >
                  <Eye size={14} />
                  <span>Auditar Dossiê</span>
                </button>

                {carrier.carrierSeverity !== 'VALID' && (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleOpenAlertModal(carrier)}
                  >
                    <Send size={13} />
                    <span>Disparar Notificação</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Disparo de Alerta de Renovação */}
      {selectedCarrierForAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 25, 47, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '620px', width: '100%', padding: '2rem' }}>
            <div className="card-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-900)' }}>
                  Disparo de Alerta de Renovação de Documentos
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedCarrierForAlert.razaoSocial} (CNPJ: {selectedCarrierForAlert.cnpj})
                </span>
              </div>
              <ShieldAlert size={26} color="var(--status-restricoes-solid)" />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">
                Mensagem Formatada (Padrão DD/MM/AAAA para WhatsApp / E-mail):
              </label>
              <textarea
                rows={9}
                readOnly
                className="form-textarea"
                style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', background: 'var(--bg-subtle)' }}
                value={getAlertMessage(selectedCarrierForAlert)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedCarrierForAlert(null)}
              >
                Fechar
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCopyAlertMessage}
                >
                  {copiedAlert ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedAlert ? 'Mensagem Copiada!' : 'Copiar Mensagem'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
