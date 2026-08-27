import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Clock, Search, Filter, ArrowRight, Download, FileSpreadsheet, Plus, Cloud, BookOpen } from 'lucide-react';
import { exportToCSV, exportToJSON } from '../../services/storageService';
import LogShareLogo from '../UI/LogShareLogo';

export default function SpecialistDashboard({ carriers, onSelectCarrier, onNewCarrierClick, onOpenDriveSync, onOpenPOP }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'AGUARDANDO_ANALISE' | 'APTA' | 'APTA_COM_RESTRICOES' | 'NAO_APTA'

  // Filter carriers
  const filteredCarriers = carriers.filter(c => {
    const matchesSearch =
      (c.razaoSocial || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.cnpj || '').includes(searchTerm) ||
      (c.protocol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.nomeFantasia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.endereco?.cidade || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = carriers.length;
  const aptaCount = carriers.filter(c => c.status === 'APTA').length;
  const restricoesCount = carriers.filter(c => c.status === 'APTA_COM_RESTRICOES').length;
  const naoAptaCount = carriers.filter(c => c.status === 'NAO_APTA').length;
  const aguardandoCount = carriers.filter(c => c.status === 'AGUARDANDO_ANALISE' || !c.status).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header do Painel */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
            <LogShareLogo height={36} variant="color" />
            <span style={{ display: 'inline-block', background: 'rgba(0, 210, 255, 0.15)', color: '#00D2FF', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
              BACKOFFICE DE COMPLIANCE & QUALIFICAÇÃO
            </span>
          </div>
          <h1 style={{ color: 'white', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Painel do Especialista em Homologação
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '650px' }}>
            Audite os dossiês cadastrais recebidos, analise vigências de seguros e RNTRC, calcule o score de risco e emita os pareceres oficiais da LogShare.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {onOpenPOP && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenPOP}
              style={{ background: 'rgba(0, 210, 255, 0.15)', color: '#00D2FF', borderColor: 'rgba(0, 210, 255, 0.4)', fontWeight: 700 }}
              title="Consultar Procedimento Operacional Padrão (POP-LOG-HOM-001)"
            >
              <BookOpen size={15} />
              <span>Ver POP (Regras & Normas)</span>
            </button>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCSV(carriers)}
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            title="Exportar dados para Excel / CSV"
          >
            <FileSpreadsheet size={15} />
            <span>Exportar CSV</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenDriveSync}
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            title="Ver status de pastas no Google Drive"
          >
            <Cloud size={15} />
            <span>Drive Sync</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={onNewCarrierClick}
            style={{ background: '#00D2FF', color: '#0A192F', fontWeight: 700 }}
          >
            <Plus size={15} />
            <span>Novo Transportador</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Total */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Dossiês</span>
            <ShieldCheck size={20} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-900)', marginTop: '0.5rem' }}>
            {totalCount}
          </div>
        </div>

        {/* Aguardando Análise */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Aguardando Análise</span>
            <Clock size={20} color="var(--primary-500)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-600)', marginTop: '0.5rem' }}>
            {aguardandoCount}
          </div>
        </div>

        {/* Aptas */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-apta-solid)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Aptas (Liberadas)</span>
            <CheckCircle2 size={20} color="var(--status-apta-solid)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-apta-solid)', marginTop: '0.5rem' }}>
            {aptaCount}
          </div>
        </div>

        {/* Aptas com Restrições */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-restricoes-solid)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Aptas c/ Restrições</span>
            <AlertTriangle size={20} color="var(--status-restricoes-solid)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-restricoes-solid)', marginTop: '0.5rem' }}>
            {restricoesCount}
          </div>
        </div>

        {/* Não Aptas */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-nao-apta-solid)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Não Aptas (Bloqueio)</span>
            <XCircle size={20} color="var(--status-nao-apta-solid)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-nao-apta-solid)', marginTop: '0.5rem' }}>
            {naoAptaCount}
          </div>
        </div>
      </div>

      {/* Tabela de Dossiês com Barra de Filtros */}
      <div className="card">
        {/* Search and Filters Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              id="search-carriers-input"
              type="text"
              className="form-input"
              placeholder="Buscar por Razão Social, CNPJ, Protocolo ou Cidade..."
              style={{ paddingLeft: '2.4rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'AGUARDANDO_ANALISE', label: 'Aguardando' },
              { id: 'APTA', label: 'Aptas' },
              { id: 'APTA_COM_RESTRICOES', label: 'C/ Restrições' },
              { id: 'NAO_APTA', label: 'Não Aptas' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`btn btn-sm ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(tab.id)}
                style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-full)' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', textAlign: 'left', borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Protocolo & Data</th>
                <th style={{ padding: '0.75rem 1rem' }}>Transportadora (CNPJ)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Local & Frota</th>
                <th style={{ padding: '0.75rem 1rem' }}>Seguro / LMG</th>
                <th style={{ padding: '0.75rem 1rem' }}>Score de Risco</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarriers.map((carrier) => {
                const totalFrota = (carrier.perfilOperacional?.frotaPropria || 0) + (carrier.perfilOperacional?.frotaAgregada || 0);
                const score = carrier.scoreTotal || 0;

                return (
                  <tr
                    key={carrier.id}
                    style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s ease', cursor: 'pointer' }}
                    onClick={() => onSelectCarrier(carrier.id)}
                    className="table-row-hover"
                  >
                    {/* Protocolo */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-600)', fontSize: '0.8rem' }}>
                        {carrier.protocol || 'HOM-2026-N/A'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(carrier.dataCriacao || Date.now()).toLocaleDateString('pt-BR')}
                      </div>
                    </td>

                    {/* Razão Social */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {carrier.razaoSocial}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {carrier.cnpj}
                      </div>
                    </td>

                    {/* Local & Frota */}
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                      <div>{carrier.endereco?.cidade} - {carrier.endereco?.uf}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{totalFrota} veículos ({carrier.perfilOperacional?.frotaPropria || 0} próprios)</div>
                    </td>

                    {/* Seguros */}
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                      <div>{carrier.gestaoRisco?.seguradora || 'Sem apólice'}</div>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                        LMG: R$ {carrier.gestaoRisco?.lmg ? carrier.gestaoRisco.lmg.toLocaleString('pt-BR') : '0'}
                      </div>
                    </td>

                    {/* Score */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: score >= 800 ? '#10B981' : score >= 600 ? '#F59E0B' : '#EF4444' }}>
                          {score}
                        </span>
                        <div style={{ width: '60px', height: '6px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${(score / 1000) * 100}%`, height: '100%', background: score >= 800 ? '#10B981' : score >= 600 ? '#F59E0B' : '#EF4444' }} />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${carrier.status === 'APTA' ? 'badge-apta' : carrier.status === 'APTA_COM_RESTRICOES' ? 'badge-restricoes' : carrier.status === 'NAO_APTA' ? 'badge-nao-apta' : 'badge-em-analise'}`}>
                        {carrier.status === 'APTA' && 'APTA'}
                        {carrier.status === 'APTA_COM_RESTRICOES' && 'RESTRIÇÕES'}
                        {carrier.status === 'NAO_APTA' && 'NÃO APTA'}
                        {(carrier.status === 'AGUARDANDO_ANALISE' || !carrier.status) && 'AGUARDANDO'}
                      </span>
                    </td>

                    {/* Ação */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCarrier(carrier.id);
                        }}
                      >
                        <span>Auditar Dossiê</span>
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredCarriers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Nenhum transportador encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
