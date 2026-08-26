import React from 'react';
import { Truck, Map, Radio, Shield, Check } from 'lucide-react';

const TIPOS_CARGA_OPCOES = [
  "Carga Geral / Seca",
  "Lotação (FTL)",
  "Fracionada (LTL)",
  "E-commerce & Expressa",
  "Refrigerada & Congelada",
  "Produtos Químicos / Perigosos (MOPP)",
  "Cargas de Alto Valor / Eletrônicos",
  "Granel Sólido",
  "Granel Líquido",
  "Farmacêuticos & Medicamentos"
];

const REGIOES_OPCOES = [
  "Sudeste (SP, RJ, MG, ES)",
  "Sul (PR, SC, RS)",
  "Centro-Oeste (GO, MT, MS, DF)",
  "Nordeste (BA, PE, CE, PB, RN, AL, SE, PI, MA)",
  "Norte (PA, AM, RO, TO, AC, AP, RR)",
  "Rotas Mercosul (Internacional)"
];

const TIPOS_VEICULOS_OPCOES = [
  "Vans / Utilitários (Fiorino, Master)",
  "VUC / Caminhão 3/4",
  "Toco (2 Eixos)",
  "Truck (3 Eixos)",
  "Bitruck (4 Eixos)",
  "Carreta 2 Eixos / 3 Eixos (LS / Vanderleia)",
  "Carreta Baú 28 a 30 Paletes",
  "Bitrem / Rodotrem (Graneleiro / Tanque)"
];

const TECNOLOGIAS_RASTREAMENTO = [
  "Autotrac Satelital",
  "Sascar Telemetria",
  "Omnilink",
  "OnixSat",
  "Positron",
  "Sighra",
  "Rastreador Celular / Aplicativo Mobile",
  "Outra Tecnologia Homologada"
];

const SENSORES_SEGURANCA = [
  "Trava de 5ª Roda (Desengate)",
  "Sensor de Abertura de Baú / Portas",
  "Botão de Pânico no Painel",
  "Teclado de Comunicação de Bordo",
  "Sensor de Temperatura em Tempo Real",
  "Bloqueador de Combustível / Ignição",
  "Sirene de Alarme",
  "Sensor de Desvio de Rota"
];

export default function Step2Operacional({ formData, updateFormData }) {
  const handleNestedChange = (parent, field, value) => {
    updateFormData(parent, {
      ...formData[parent],
      [field]: value
    });
  };

  const toggleArrayItem = (field, item) => {
    const current = formData.perfilOperacional?.[field] || [];
    let updated;
    if (current.includes(item)) {
      updated = current.filter(i => i !== item);
    } else {
      updated = [...current, item];
    }
    handleNestedChange('perfilOperacional', field, updated);
  };

  const perfil = formData.perfilOperacional || {};

  return (
    <div className="animate-fade-in">
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-900)' }}>
            Seção 2 — Perfil Operacional, Frota & Tecnologia
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Especifique a capacidade logística, especialidades de transporte e sistemas de rastreamento embarcados.
          </p>
        </div>
        <Truck size={28} color="var(--primary-600)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* 2.1 Tipos de Carga */}
        <div>
          <label className="form-label" style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>
            2.1 Tipos de Carga Transportada <span className="required">*</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {TIPOS_CARGA_OPCOES.map((tipo) => {
              const isSelected = perfil.tiposCarga?.includes(tipo);
              return (
                <button
                  type="button"
                  key={tipo}
                  onClick={() => toggleArrayItem('tiposCarga', tipo)}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.825rem',
                    padding: '0.45rem 0.9rem'
                  }}
                >
                  {isSelected && <Check size={14} />}
                  {tipo}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2.2 Regiões de Atuação */}
        <div>
          <label className="form-label" style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>
            2.2 Regiões de Atuação Geográfica <span className="required">*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.6rem' }}>
            {REGIOES_OPCOES.map((regiao) => {
              const isSelected = perfil.regioes?.includes(regiao);
              return (
                <div
                  key={regiao}
                  onClick={() => toggleArrayItem('regioes', regiao)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-light)'}`,
                    background: isSelected ? 'var(--primary-50)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected || false}
                    onChange={() => {}} // handled by div
                    style={{ cursor: 'pointer', accentColor: 'var(--primary-600)' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--primary-900)' : 'var(--text-primary)' }}>
                    {regiao}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2.3 Tamanho e Tipos da Frota */}
        <div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            2.3 Dimensionamento da Frota & Tipologia
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="frotaPropria">
                Quantidade de Veículos Próprios <span className="required">*</span>
              </label>
              <input
                id="frotaPropria"
                type="number"
                min="0"
                className="form-input"
                placeholder="0"
                value={perfil.frotaPropria ?? ''}
                onChange={(e) => handleNestedChange('perfilOperacional', 'frotaPropria', parseInt(e.target.value) || 0)}
                required
              />
              <span className="form-hint">Cavalos mecânicos e caminhões com CRLV no CNPJ da empresa</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="frotaAgregada">
                Quantidade de Veículos Agregados / Terceiros Frequentes
              </label>
              <input
                id="frotaAgregada"
                type="number"
                min="0"
                className="form-input"
                placeholder="0"
                value={perfil.frotaAgregada ?? ''}
                onChange={(e) => handleNestedChange('perfilOperacional', 'frotaAgregada', parseInt(e.target.value) || 0)}
              />
              <span className="form-hint">Veículos contratados sob contrato de agregação ou TAC contínuo</span>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Tipos de Veículos Disponíveis na Operação:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TIPOS_VEICULOS_OPCOES.map((veiculo) => {
                const isSelected = perfil.tiposVeiculos?.includes(veiculo);
                return (
                  <button
                    type="button"
                    key={veiculo}
                    onClick={() => toggleArrayItem('tiposVeiculos', veiculo)}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}
                  >
                    {isSelected && <Check size={13} />}
                    {veiculo}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2.4 Tecnologia Embarcada e Gerenciamento de Risco */}
        <div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            2.4 Telemetria, Rastreadores & Sensores de Segurança
          </h3>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Sistemas de Rastreamento / Telemetria Utilizados:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TECNOLOGIAS_RASTREAMENTO.map((tec) => {
                const isSelected = perfil.tecnologiaRastreamento?.includes(tec);
                return (
                  <button
                    type="button"
                    key={tec}
                    onClick={() => toggleArrayItem('tecnologiaRastreamento', tec)}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}
                  >
                    {isSelected && <Radio size={13} />}
                    {tec}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="form-label">Sensores e Atuadores de Segurança Embarcados:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.5rem' }}>
              {SENSORES_SEGURANCA.map((sensor) => {
                const isSelected = perfil.sensoresSeguranca?.includes(sensor);
                return (
                  <div
                    key={sensor}
                    onClick={() => toggleArrayItem('sensoresSeguranca', sensor)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isSelected ? 'var(--status-apta-solid)' : 'var(--border-light)'}`,
                      background: isSelected ? 'var(--status-apta-bg)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 600 : 400
                    }}
                  >
                    <Shield size={14} color={isSelected ? 'var(--status-apta-solid)' : 'var(--text-muted)'} />
                    <span>{sensor}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
