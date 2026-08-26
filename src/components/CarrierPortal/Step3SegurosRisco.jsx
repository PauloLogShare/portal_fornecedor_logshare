import React from 'react';
import { ShieldCheck, FileCheck, AlertTriangle, DollarSign } from 'lucide-react';

const GERENCIADORAS_RISCO = [
  "Buonny Projetos e Serviços",
  "OpenTech Gestão Logística",
  "Brasil Risk Gerenciamento",
  "AngelLira",
  "Kronos Gerenciamento de Risco",
  "GoldenSat",
  "Gristec",
  "Gerenciadora Própria Interna",
  "Nenhuma cadastrada"
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

export default function Step3SegurosRisco({ formData, updateFormData }) {
  const handleNestedChange = (parent, field, value) => {
    updateFormData(parent, {
      ...formData[parent],
      [field]: value
    });
  };

  const gr = formData.gestaoRisco || {};

  return (
    <div className="animate-fade-in">
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-900)' }}>
            Seção 3 — Gestão de Risco, Apólices de Seguro & PGR
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            A LogShare exige estrita conformidade com apólices de seguro vigentes (RCTR-C e RC-DC) e homologação em Gerenciadora de Risco.
          </p>
        </div>
        <ShieldCheck size={28} color="var(--primary-600)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Banner Informativo de Conformidade */}
        <div style={{
          background: 'var(--primary-50)',
          borderLeft: '4px solid var(--primary-600)',
          padding: '1rem',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={20} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.825rem', color: 'var(--primary-900)' }}>
            <strong>Requisito Obrigatório LogShare:</strong> Todo parceiro transportador deve possuir apólice de <strong>RCTR-C (Acidentes)</strong> e <strong>RC-DC (Roubo/Desaparecimento de Carga)</strong> ativas com averbação eletrônica e Limite Máximo de Garantia (LMG) compatível com o valor das cargas a serem transportadas.
          </div>
        </div>

        {/* 3.1 Companhia Seguradora e Apólices */}
        <div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3.1 Coberturas de Seguro de Carga
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
                Valor máximo coberto pela apólice para uma única viagem/veículo
              </span>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="apoliceRCTR_C">
                Número da Apólice RCTR-C (Acidente) <span className="required">*</span>
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
                Número da Apólice RC-DC (Roubo) <span className="required">*</span>
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
                type="date"
                className="form-input"
                value={gr.vigenciaApolice || ''}
                onChange={(e) => handleNestedChange('gestaoRisco', 'vigenciaApolice', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* 3.2 Gerenciamento de Risco e PGR */}
        <div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
              <span className="form-hint">Empresa responsável por consulta de cadastro de motoristas e monitoramento</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Plano de Gerenciamento de Risco (PGR) Formalizado?
              </label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
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
      </div>
    </div>
  );
}
