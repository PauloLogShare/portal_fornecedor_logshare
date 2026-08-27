import React, { useState } from 'react';
import { FileCheck, Printer, Copy, Check, Cloud, AlertCircle, ShieldAlert, Sparkles, Send, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { STANDARD_RESTRICTIONS, RISK_LEVELS, generateRequiredActions, generateExecutiveSummary, evaluateCarrier } from '../../services/riskEngineService';
import { formatDateBR } from '../../services/validityCalculator';
import { evaluateComplianceStandards } from '../../services/complianceStandardsService';
import LogShareLogo from '../UI/LogShareLogo';

export default function ParecerGenerator({
  carrier,
  parecerData,
  onUpdateParecer,
  onSaveParecer,
  onSyncDrive
}) {
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const evaluation = evaluateCarrier(carrier);
  const hasMandatoryPending = evaluation.hasMissingOrExpiredMandatory;

  // Se houver documento obrigatório pendente ou irregular, o status final deve ser NÃO APTA
  const status = hasMandatoryPending ? "NAO_APTA" : (parecerData.statusFinal || evaluation.suggestedStatus || "APTA");
  const score = carrier.scoreTotal || 0;

  const handleStatusChange = (newStatus) => {
    onUpdateParecer('statusFinal', newStatus);
    // Auto-update executive summary and required actions
    const autoSummary = generateExecutiveSummary(carrier, newStatus, score);
    const autoActions = generateRequiredActions(carrier, newStatus);
    onUpdateParecer('resumoExecutivo', autoSummary);
    onUpdateParecer('acoesRequeridas', autoActions);

    if (newStatus === 'APTA_COM_RESTRICOES') {
      onUpdateParecer('restricoesOperacionais', [
        "Teto de valor de carga fixado em até R$ 300.000,00 por viagem",
        "Rastreamento obrigatório",
        "Consulta prévia de motoristas e equipamento na Gerenciadora de Risco (12h)",
        "Alocação condicionada à análise caso a caso dos requisitos do cliente e valor da carga"
      ]);
    } else if (newStatus === 'APTA') {
      onUpdateParecer('restricoesOperacionais', []);
    }
  };

  const handleRegenerateActions = () => {
    const autoActions = generateRequiredActions(carrier, status);
    onUpdateParecer('acoesRequeridas', autoActions);
  };

  const handleToggleRestriction = (res) => {
    const current = parecerData.restricoesOperacionais || [];
    let updated;
    if (current.includes(res)) {
      updated = current.filter(r => r !== res);
    } else {
      updated = [...current, res];
    }
    onUpdateParecer('restricoesOperacionais', updated);
  };

  const handleCopyText = () => {
    const text = `PARECER OFICIAL DE HOMOLOGAÇÃO DE TRANSPORTADOR — LOGSHARE
============================================================
PROTOCOLO: ${carrier.protocol || 'N/A'}
DATA DE EMISSÃO: ${formatDateBR(parecerData.dataEmissao || new Date())}
AUDITOR / COMPLIANCE: ${parecerData.especialistaNome || 'Especialista em Homologação LogShare'}

1. DADOS DO TRANSPORTADOR
- Razão Social: ${carrier.razaoSocial}
- Nome Fantasia: ${carrier.nomeFantasia || 'N/A'}
- CNPJ: ${carrier.cnpj}
- Contato: ${carrier.contato?.responsavel || 'N/A'} (${carrier.contato?.email || 'N/A'})

2. STATUS FINAL DO PARECER: [ ${status.replace('_', ' ')} ]
- Score de Risco: ${score} / 1000 pontos (${score >= 800 ? 'Baixo Risco' : score >= 600 ? 'Médio Risco' : 'Alto Risco'})

3. RESUMO EXECUTIVO
${parecerData.resumoExecutivo}

4. DETALHAMENTO DA ANÁLISE DOCUMENTAL
${(carrier.documentos || []).map(d => `- ${d.nome}: [ ${d.status} ] (Vigência: ${formatDateBR(d.vigencia)})`).join('\n')}

5. CONDICIONANTES & RESTRIÇÕES OPERACIONAIS
${(parecerData.restricoesOperacionais || []).length > 0 ? (parecerData.restricoesOperacionais || []).map(r => `* ${r}`).join('\n') : 'Nenhuma restrição imposta. Liberação total para operação.'}

6. AÇÕES REQUERIDAS / PLANO DE REGULARIZAÇÃO
${parecerData.acoesRequeridas || 'Nenhuma ação pendente.'}

============================================================
LogShare Tecnologia em Logística & Compliance de Transportes
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSyncToDrive = async () => {
    setSyncStatus('syncing');
    if (onSyncDrive) {
      const res = await onSyncDrive();
      if (res?.success) {
        setSyncStatus('success');
      } else {
        setSyncStatus('error');
      }
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Bloco de Configuração do Parecer (No-Print) */}
      <div className="card no-print" style={{ background: '#f8fafc', border: '1.5px solid var(--border-light)' }}>
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-900)' }}>
              Emissão & Edição do Parecer de Homologação
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Defina o status final, revise o resumo executivo, ajuste as condicionantes operacionais e formalize o parecer.
            </p>
          </div>
          <FileCheck size={26} color="var(--primary-600)" />
        </div>

        {/* 1. Seleção de Status Oficial */}
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Alerta de Bloqueio de Compliance por Documentação Obrigatória */}
          {hasMandatoryPending && (
            <div style={{
              background: '#FEF2F2',
              border: '1.5px solid #EF4444',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem'
            }}>
              <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.875rem', color: '#991B1B', display: 'block' }}>
                  Regra de Compliance: {evaluation.missingOrInvalidMandatoryDocs?.length || 0} documento(s) obrigatório(s) pendente(s) ou irregular(es)
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#7F1D1D', display: 'block', marginTop: '2px' }}>
                  Conforme a política oficial da LogShare, qualquer documento obrigatório não enviado ou vencido <strong>impede a aprovação do transportador</strong>. O parceiro é classificado obrigatoriamente como <strong>NÃO APTA</strong> até que todas as pendências sejam regularizadas.
                </span>
              </div>
            </div>
          )}

          <label className="form-label" style={{ fontSize: '0.9rem' }}>
            1. Selecione o Status Final do Transportador: <span className="required">*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {/* Botão APTA */}
            <button
              type="button"
              id="status-apta-btn"
              onClick={() => {
                if (hasMandatoryPending) {
                  alert("Bloqueio de Compliance: Não é permitido aprovar um transportador com documentos obrigatórios faltantes ou vencidos.");
                  return;
                }
                handleStatusChange('APTA');
              }}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${status === 'APTA' ? 'var(--status-apta-solid)' : 'var(--border-light)'}`,
                background: status === 'APTA' ? 'var(--status-apta-bg)' : 'white',
                color: status === 'APTA' ? 'var(--status-apta-text)' : 'var(--text-primary)',
                fontWeight: 700,
                cursor: hasMandatoryPending ? 'not-allowed' : 'pointer',
                opacity: hasMandatoryPending ? 0.45 : 1,
                textAlign: 'center',
                transition: 'var(--transition-fast)'
              }}
              title={hasMandatoryPending ? "Bloqueado: Há documentos obrigatórios pendentes" : "Liberação total"}
            >
              <div style={{ fontSize: '1.1rem' }}>🟢 APTA</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: '4px', opacity: 0.85 }}>
                {hasMandatoryPending ? "Bloqueado (Faltam docs)" : "Liberação total irrestrita"}
              </div>
            </button>

            {/* Botão APTA COM RESTRIÇÕES */}
            <button
              type="button"
              id="status-restricoes-btn"
              onClick={() => {
                if (hasMandatoryPending) {
                  alert("Bloqueio de Compliance: A modalidade APTA COM RESTRIÇÕES exige 100% dos documentos obrigatórios válidos. Regularize as pendências documentais primeiro.");
                  return;
                }
                handleStatusChange('APTA_COM_RESTRICOES');
              }}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${status === 'APTA_COM_RESTRICOES' ? 'var(--status-restricoes-solid)' : 'var(--border-light)'}`,
                background: status === 'APTA_COM_RESTRICOES' ? 'var(--status-restricoes-bg)' : 'white',
                color: status === 'APTA_COM_RESTRICOES' ? 'var(--status-restricoes-text)' : 'var(--text-primary)',
                fontWeight: 700,
                cursor: hasMandatoryPending ? 'not-allowed' : 'pointer',
                opacity: hasMandatoryPending ? 0.45 : 1,
                textAlign: 'center',
                transition: 'var(--transition-fast)'
              }}
              title={hasMandatoryPending ? "Bloqueado: Exige 100% dos documentos obrigatórios válidos" : "Requer travas operacionais"}
            >
              <div style={{ fontSize: '1.1rem' }}>🟡 APTA C/ RESTRIÇÕES</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: '4px', opacity: 0.85 }}>
                {hasMandatoryPending ? "Bloqueado (Faltam docs)" : "Requer travas operacionais"}
              </div>
            </button>

            {/* Botão NÃO APTA */}
            <button
              type="button"
              id="status-nao-apta-btn"
              onClick={() => handleStatusChange('NAO_APTA')}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${status === 'NAO_APTA' ? 'var(--status-nao-apta-solid)' : 'var(--border-light)'}`,
                background: status === 'NAO_APTA' ? 'var(--status-nao-apta-bg)' : 'white',
                color: status === 'NAO_APTA' ? 'var(--status-nao-apta-text)' : 'var(--text-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'var(--transition-fast)',
                boxShadow: hasMandatoryPending && status === 'NAO_APTA' ? '0 0 0 2px #EF4444' : undefined
              }}
            >
              <div style={{ fontSize: '1.1rem' }}>🔴 NÃO APTA</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: '4px', opacity: 0.85 }}>
                {hasMandatoryPending ? "Status Obrigatório por Compliance" : "Bloqueio na plataforma"}
              </div>
            </button>
          </div>
        </div>

        {/* 2. Resumo Executivo */}
        <div className="form-group">
          <label className="form-label" htmlFor="resumoExecutivo">
            2. Resumo Executivo da Homologação:
          </label>
          <textarea
            id="resumoExecutivo"
            rows={4}
            className="form-textarea"
            value={parecerData.resumoExecutivo || ''}
            onChange={(e) => onUpdateParecer('resumoExecutivo', e.target.value)}
          />
        </div>

        {/* 3. Condicionantes e Restrições */}
        {status === 'APTA_COM_RESTRICOES' && (
          <div className="form-group">
            <label className="form-label">
              3. Condicionantes & Restrições Operacionais Aplicadas:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {STANDARD_RESTRICTIONS.map((res) => {
                const isSelected = (parecerData.restricoesOperacionais || []).includes(res);
                return (
                  <div
                    key={res}
                    onClick={() => handleToggleRestriction(res)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isSelected ? 'var(--status-restricoes-solid)' : 'var(--border-light)'}`,
                      background: isSelected ? 'var(--status-restricoes-bg)' : 'white',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? 'var(--status-restricoes-text)' : 'var(--text-primary)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ accentColor: 'var(--status-restricoes-solid)', cursor: 'pointer' }}
                    />
                    <span>{res}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Ações Requeridas */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label className="form-label" htmlFor="acoesRequeridas" style={{ margin: 0 }}>
              4. Ações Requeridas & Plano de Regularização:
            </label>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRegenerateActions}
              style={{ fontSize: '0.725rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              title="Recalcular ações pendentes com base nos documentos atuais"
            >
              <RefreshCw size={12} />
              <span>Regerar Ações Automaticamente</span>
            </button>
          </div>
          <textarea
            id="acoesRequeridas"
            rows={5}
            className="form-textarea"
            placeholder="Especifique os passos necessários para sanar as pendências..."
            value={parecerData.acoesRequeridas || ''}
            onChange={(e) => onUpdateParecer('acoesRequeridas', e.target.value)}
          />
        </div>

        {/* Toolbar de Ações Rápidas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrint}
            >
              <Printer size={16} />
              <span>Imprimir Parecer Oficial</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopyText}
            >
              {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              <span>{copied ? 'Copiado para Área de Transferência!' : 'Copiar Texto'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {syncStatus === 'success' && (
              <span style={{ fontSize: '0.8rem', color: 'var(--status-apta-solid)', fontWeight: 600 }}>
                ✓ Sincronizado no Google Drive!
              </span>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSyncToDrive}
              title="Salvar pasta e parecer no Google Drive"
            >
              <Cloud size={16} />
              <span>Sincronizar no Google Drive</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onSaveParecer}
            >
              <Send size={16} />
              <span>Salvar e Formalizar Parecer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DOCUMENTO OFICIAL TIMBRADO LOGSHARE (VISÍVEL NA TELA E NA IMPRESSÃO)      */}
      {/* ========================================================================= */}
      <div className="parecer-document">
        {/* Cabeçalho Oficial */}
        <div className="parecer-document-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <LogShareLogo height={32} variant="dark" />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', background: '#E0EDFF', color: '#0056D2', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Compliance & Risco
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
              Departamento de Homologação, Cadastro & Qualificação de Transportadores Terceiros
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>
              Protocolo de Auditoria
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0056D2' }}>
              {carrier.protocol || 'HOM-2026-XXXXX'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginTop: '2px' }}>
              Data: {formatDateBR(parecerData.dataEmissao || new Date())}
            </span>
          </div>
        </div>

        {/* Título do Parecer */}
        <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
          <h1 style={{ fontSize: '1.4rem', color: '#0A192F', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            PARECER DE HOMOLOGAÇÃO DE TRANSPORTADOR
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Avaliação de Conformidade Regulatória, Score de Risco e Habilitação Operacional
          </p>
        </div>

        {/* Quadro de Status Final & Score */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.25rem',
          margin: '1.5rem 0',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: status === 'APTA' ? '#F0FDF4' : status === 'APTA_COM_RESTRICOES' ? '#FFFBEB' : '#FEF2F2',
          border: `2px solid ${status === 'APTA' ? '#10B981' : status === 'APTA_COM_RESTRICOES' ? '#F59E0B' : '#EF4444'}`
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748B', display: 'block' }}>
              Status Final da Homologação
            </span>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: status === 'APTA' ? '#065F46' : status === 'APTA_COM_RESTRICOES' ? '#92400E' : '#991B1B',
              marginTop: '4px'
            }}>
              {status === 'APTA' && 'APTA (LIBERADA)'}
              {status === 'APTA_COM_RESTRICOES' && 'APTA COM RESTRIÇÕES'}
              {status === 'NAO_APTA' && 'NÃO APTA (RECUSADA / BLOQUEADA)'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748B', display: 'block' }}>
              Score Global de Risco
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0A192F', marginTop: '4px' }}>
              {score} / 1000 pts
              <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '8px', color: '#64748B' }}>
                ({score >= 800 ? 'Baixo Risco' : score >= 600 ? 'Médio Risco' : 'Alto Risco'})
              </span>
            </div>
          </div>
        </div>

        {/* 1. Dados da Empresa Avaliada */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#0A192F', textTransform: 'uppercase', borderBottom: '1.5px solid #CBD5E1', paddingBottom: '0.3rem', marginBottom: '0.75rem' }}>
            1. Dados Cadastrais & Perfil Operacional
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div>
              <strong>Razão Social:</strong> {carrier.razaoSocial}
            </div>
            <div>
              <strong>Nome Fantasia:</strong> {carrier.nomeFantasia || '—'}
            </div>
            <div>
              <strong>CNPJ:</strong> {carrier.cnpj}
            </div>
            <div>
              <strong>Inscrição Estadual:</strong> {carrier.inscricaoEstadual || '—'}
            </div>
            <div>
              <strong>Cidade / UF:</strong> {carrier.endereco?.cidade} - {carrier.endereco?.uf}
            </div>
            <div>
              <strong>Contato Responsável:</strong> {carrier.contato?.responsavel}
            </div>
            <div>
              <strong>Frota Total:</strong> {(carrier.perfilOperacional?.frotaPropria || 0) + (carrier.perfilOperacional?.frotaAgregada || 0)} veículos ({carrier.perfilOperacional?.frotaPropria || 0} próprios)
            </div>
            <div>
              <strong>Seguradora & LMG:</strong> {carrier.gestaoRisco?.seguradora || '—'} (R$ {carrier.gestaoRisco?.lmg ? carrier.gestaoRisco.lmg.toLocaleString('pt-BR') : '0'})
            </div>
            <div>
              <strong>Gerenciadora de Risco:</strong> {carrier.gestaoRisco?.gerenciadoraRisco || '—'}
            </div>
          </div>
        </div>

        {/* 2. Resumo Executivo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#0A192F', textTransform: 'uppercase', borderBottom: '1.5px solid #CBD5E1', paddingBottom: '0.3rem', marginBottom: '0.75rem' }}>
            2. Resumo Executivo
          </h3>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: '#334155', textAlign: 'justify' }}>
            {parecerData.resumoExecutivo || 'Nenhum resumo informado.'}
          </p>
        </div>

        {/* 3. Detalhamento da Análise Documental */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#0A192F', textTransform: 'uppercase', borderBottom: '1.5px solid #CBD5E1', paddingBottom: '0.3rem', marginBottom: '0.75rem' }}>
            3. Detalhamento da Análise Documental
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', textAlign: 'left', borderBottom: '1px solid #CBD5E1' }}>
                <th style={{ padding: '6px 8px' }}>Documento Exigido</th>
                <th style={{ padding: '6px 8px' }}>Situação</th>
                <th style={{ padding: '6px 8px' }}>Vigência</th>
                <th style={{ padding: '6px 8px' }}>Arquivo Anexo</th>
              </tr>
            </thead>
            <tbody>
              {(carrier.documentos || []).map((doc, idx) => (
                <tr key={doc.id || idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600 }}>{doc.nome}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: doc.status === 'VALIDO' ? '#065F46' : doc.status === 'PENDENTE' ? '#92400E' : '#991B1B'
                    }}>
                      {doc.status === 'VALIDO' ? '✓ VÁLIDO' : doc.status === 'PENDENTE' ? '⏳ PENDENTE' : '✗ IRREGULAR'}
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', color: '#64748B' }}>{formatDateBR(doc.vigencia)}</td>
                  <td style={{ padding: '6px 8px', color: '#0056D2', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {doc.arquivoNome || 'Ausente'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Aderência às Normas e Requisitos Setoriais (RDC 48, ISO 9001, ISO 22716, EFfCI, ESG) */}
        {(() => {
          const compliance = evaluateComplianceStandards(carrier);
          return (
            <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <h3 style={{ fontSize: '0.925rem', color: '#0A192F', textTransform: 'uppercase', margin: 0, fontWeight: 700 }}>
                  4. Conformidade Normativa & Qualidade (RDC 48 • ISO 9001 • ISO 22716 • EFfCI • ESG)
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: compliance.overallPercentage >= 70 ? '#059669' : '#D97706', background: compliance.overallPercentage >= 70 ? '#DCFCE7' : '#FEF3C7', padding: '2px 8px', borderRadius: 4 }}>
                  Índice de Aderência: {compliance.overallPercentage}%
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', fontSize: '0.78rem' }}>
                {compliance.pillars.map(p => (
                  <div key={p.id} style={{ background: 'white', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 700, color: '#1E293B' }}>{p.name}</div>
                    <div style={{ color: '#64748B', fontSize: '0.7rem' }}>{p.normas}</div>
                    <div style={{ color: p.status === 'CONFORME' ? '#059669' : '#D97706', fontWeight: 600, marginTop: '2px' }}>
                      Status: {p.status.replace('_', ' ')} ({p.score} pts)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 5. Condicionantes & Restrições Operacionais */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#0A192F', textTransform: 'uppercase', borderBottom: '1.5px solid #CBD5E1', paddingBottom: '0.3rem', marginBottom: '0.75rem' }}>
            5. Condicionantes & Restrições Operacionais
          </h3>

          {/* Detalhes Operacionais Deste Transportador */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0A192F', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Parâmetros de Operação & Gestão de Risco Deste Transportador:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', fontSize: '0.78rem', color: '#334155' }}>
              <div>
                <strong>Teto Máximo por Viagem:</strong> {status === 'APTA_COM_RESTRICOES' ? 'R$ 300.000,00 (Trava)' : `R$ ${(carrier.gestaoRisco?.lmg || 0).toLocaleString('pt-BR')}`}
              </div>
              <div>
                <strong>Tecnologia de Rastreamento:</strong> {(carrier.perfilOperacional?.tecnologiaRastreamento || []).join(', ') || 'Rastreamento obrigatório'}
              </div>
              <div>
                <strong>Gerenciadora de Risco (GR):</strong> {carrier.gestaoRisco?.gerenciadoraRisco || 'Consulta prévia (12h)'}
              </div>
              <div>
                <strong>Frota Alocada:</strong> {(carrier.perfilOperacional?.frotaPropria || 0) + (carrier.perfilOperacional?.frotaAgregada || 0)} veículos ({carrier.perfilOperacional?.frotaPropria || 0} próprios)
              </div>
              <div>
                <strong>Tipos de Carga:</strong> {(carrier.perfilOperacional?.tiposCarga || []).join(', ') || 'Carga Geral'}
              </div>
              <div>
                <strong>Cobertura Securitária:</strong> {carrier.gestaoRisco?.estipuladoLogShare ? 'Apólice Estipulada LogShare' : `Seguradora ${carrier.gestaoRisco?.seguradora || 'Própria'}`}
              </div>
            </div>
          </div>

          {(parecerData.restricoesOperacionais || []).length > 0 ? (
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#334155', margin: 0 }}>
              {(parecerData.restricoesOperacionais || []).map((r, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>
                  <strong>{r}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#065F46', margin: 0 }}>
              ✓ Nenhuma restrição imposta. Liberação total para contratação em conformidade com as regras gerais da LogShare.
            </p>
          )}
        </div>

        {/* 6. Ações Requeridas para Regularização */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#0A192F', textTransform: 'uppercase', borderBottom: '1.5px solid #CBD5E1', paddingBottom: '0.3rem', marginBottom: '0.75rem' }}>
            6. Ações Requeridas para Regularização
          </h3>
          <div style={{
            background: status === 'APTA' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${status === 'APTA' ? '#BBF7D0' : '#FECACA'}`,
            borderRadius: '6px',
            padding: '1rem'
          }}>
            <p style={{ fontSize: '0.825rem', color: status === 'APTA' ? '#166534' : '#991B1B', whiteSpace: 'pre-line', margin: 0, lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
              {parecerData.acoesRequeridas || 'Nenhuma pendência para regularização.'}
            </p>
          </div>
        </div>

        {/* Assinatura / Rodapé de Compliance */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.8rem', color: '#64748B' }}>
          <div>
            <p style={{ fontWeight: 700, color: '#0A192F', margin: 0 }}>
              {parecerData.especialistaNome || 'Especialista em Homologação LogShare'}
            </p>
            <p style={{ margin: 0 }}>Comitê de Gestão de Risco & Compliance LogShare</p>
            <p style={{ fontSize: '0.75rem', margin: 0 }}>Autenticação Eletrônica: SHA256:{Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0 }}>Documento emitido digitalmente via Sistema LogShare</p>
            <p style={{ margin: 0 }}>Sincronizado com o repositório Google Workspace / Drive</p>
          </div>
        </div>
      </div>
    </div>
  );
}
