import React, { useState } from 'react';
import { Building2, MapPin, User, Mail, Phone, Hash, Calendar, Search, CheckCircle2, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { validateCNPJ, lookupCNPJ, lookupCEP } from '../../services/apiIntegrations';

export default function Step1Cadastral({ formData, updateFormData, errors }) {
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cnpjStatus, setCnpjStatus] = useState(null); // null | 'VALID' | 'INVALID' | 'LOOKUP_SUCCESS'
  const [cepStatus, setCepStatus] = useState(null); // null | 'SUCCESS'

  const handleChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleNestedChange = (parent, field, value) => {
    updateFormData(parent, {
      ...formData[parent],
      [field]: value
    });
  };

  // CNPJ mask & trigger
  const handleCnpjChange = async (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 14) v = v.slice(0, 14);

    let masked = v;
    if (v.length > 12) {
      masked = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    } else if (v.length > 8) {
      masked = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, "$1.$2.$3/$4");
    } else if (v.length > 5) {
      masked = v.replace(/^(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3");
    } else if (v.length > 2) {
      masked = v.replace(/^(\d{2})(\d{0,3})/, "$1.$2");
    }
    handleChange('cnpj', masked);

    if (v.length === 14) {
      const isValid = validateCNPJ(v);
      if (isValid) {
        setCnpjStatus('VALID');
        // Trigger auto-lookup
        handleFetchCNPJ(v);
      } else {
        setCnpjStatus('INVALID');
      }
    } else {
      setCnpjStatus(null);
    }
  };

  const handleFetchCNPJ = async (rawCnpj) => {
    const target = rawCnpj || (formData.cnpj || '').replace(/\D/g, '');
    if (target.length !== 14) return;

    setCnpjLoading(true);
    const res = await lookupCNPJ(target);
    setCnpjLoading(false);

    if (res.success) {
      setCnpjStatus('LOOKUP_SUCCESS');
      if (res.razaoSocial) handleChange('razaoSocial', res.razaoSocial);
      if (res.nomeFantasia) handleChange('nomeFantasia', res.nomeFantasia);
      if (res.aberturaCNPJ) handleChange('aberturaCNPJ', res.aberturaCNPJ);
      if (res.endereco) {
        updateFormData('endereco', {
          ...formData.endereco,
          ...res.endereco
        });
      }
      if (res.contato?.email && !formData.contato?.email) {
        handleNestedChange('contato', 'email', res.contato.email);
      }
      if (res.contato?.telefone && !formData.contato?.telefone) {
        handleNestedChange('contato', 'telefone', res.contato.telefone);
      }
    }
  };

  // CEP mask & auto-fill
  const handleCepChange = async (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);

    let masked = v;
    if (v.length > 5) {
      masked = v.replace(/^(\d{5})(\d{0,3})/, "$1-$2");
    }
    handleNestedChange('endereco', 'cep', masked);

    if (v.length === 8) {
      setCepLoading(true);
      const res = await lookupCEP(v);
      setCepLoading(false);

      if (res.success) {
        setCepStatus('SUCCESS');
        updateFormData('endereco', {
          ...formData.endereco,
          logradouro: res.logradouro || formData.endereco?.logradouro,
          bairro: res.bairro || formData.endereco?.bairro,
          cidade: res.cidade || formData.endereco?.cidade,
          uf: res.uf || formData.endereco?.uf,
          cep: masked
        });
        setTimeout(() => setCepStatus(null), 3000);
      }
    }
  };

  // Phone mask
  const handlePhoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    }
    handleNestedChange('contato', 'telefone', v);
  };

  return (
    <div className="animate-fade-in">
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-900)' }}>
            Seção 1 — Dados Cadastrais da Transportadora
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Digite o <strong>CNPJ</strong> para preenchimento automático integrado à Receita Federal e o <strong>CEP</strong> para carregar o endereço da sede.
          </p>
        </div>
        <Building2 size={28} color="var(--primary-600)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Bloco 1: Identificação Societária com CNPJ Auto-Fill */}
        <div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1.1 Identificação Fiscal & Societária (Integração Receita Federal)
          </h3>

          <div className="form-grid-3" style={{ marginBottom: '1rem' }}>
            {/* CNPJ Input with Auto Search */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="cnpj">
                CNPJ da Transportadora <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    id="cnpj"
                    type="text"
                    className="form-input"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj || ''}
                    onChange={handleCnpjChange}
                    maxLength={18}
                    required
                    style={{
                      borderColor: cnpjStatus === 'INVALID' ? 'var(--status-nao-apta-solid)' : cnpjStatus ? 'var(--status-apta-solid)' : undefined,
                      paddingRight: '2rem'
                    }}
                  />
                  {cnpjLoading && (
                    <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-600)' }} />
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleFetchCNPJ()}
                  disabled={cnpjLoading || (formData.cnpj || '').replace(/\D/g, '').length !== 14}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Search size={14} />
                  <span>Consultar CNPJ</span>
                </button>
              </div>

              {cnpjStatus === 'LOOKUP_SUCCESS' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-apta-solid)', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                  <CheckCircle2 size={14} />
                  <span>CNPJ Validado e dados importados com sucesso da Receita Federal!</span>
                </div>
              )}

              {cnpjStatus === 'INVALID' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-nao-apta-solid)', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                  <AlertTriangle size={14} />
                  <span>Dígitos verificadores do CNPJ são inválidos. Por favor, confira o número.</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="aberturaCNPJ">
                Data de Abertura (DD/MM/AAAA)
              </label>
              <input
                id="aberturaCNPJ"
                type="text"
                className="form-input"
                placeholder="DD/MM/AAAA"
                value={formData.aberturaCNPJ || ''}
                onChange={(e) => handleChange('aberturaCNPJ', e.target.value)}
              />
              <span className="form-hint">Tempo de atividade para cálculo de risco</span>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="razaoSocial">
                Razão Social <span className="required">*</span>
              </label>
              <input
                id="razaoSocial"
                type="text"
                className="form-input"
                placeholder="Ex: TransLog Brasil Transportes Rodoviários Ltda"
                value={formData.razaoSocial || ''}
                onChange={(e) => handleChange('razaoSocial', e.target.value)}
                required
              />
              {errors?.razaoSocial && <span style={{ color: 'var(--status-nao-apta-solid)', fontSize: '0.75rem' }}>{errors.razaoSocial}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="nomeFantasia">
                Nome Fantasia
              </label>
              <input
                id="nomeFantasia"
                type="text"
                className="form-input"
                placeholder="Ex: TransLog Express"
                value={formData.nomeFantasia || ''}
                onChange={(e) => handleChange('nomeFantasia', e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="inscricaoEstadual">
                Inscrição Estadual (IE)
              </label>
              <input
                id="inscricaoEstadual"
                type="text"
                className="form-input"
                placeholder="Ex: 123.456.789.000 ou ISENTO"
                value={formData.inscricaoEstadual || ''}
                onChange={(e) => handleChange('inscricaoEstadual', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Endereço com Busca Automática por CEP */}
        <div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1.2 Endereço da Sede Operacional (Busca por CEP)
          </h3>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="cep">
                CEP <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="cep"
                  type="text"
                  className="form-input"
                  placeholder="00000-000"
                  value={formData.endereco?.cep || ''}
                  onChange={handleCepChange}
                  maxLength={9}
                  required
                />
                {cepLoading && (
                  <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-600)' }} />
                )}
              </div>
              {cepStatus === 'SUCCESS' && (
                <span style={{ color: 'var(--status-apta-solid)', fontSize: '0.725rem', fontWeight: 600 }}>
                  ✓ Endereço carregado via CEP!
                </span>
              )}
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="logradouro">
                Logradouro (Rua / Av / Rodovia com Número) <span className="required">*</span>
              </label>
              <input
                id="logradouro"
                type="text"
                className="form-input"
                placeholder="Ex: Av. das Nações Unidas, 14261"
                value={formData.endereco?.logradouro || ''}
                onChange={(e) => handleNestedChange('endereco', 'logradouro', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="bairro">
                Bairro
              </label>
              <input
                id="bairro"
                type="text"
                className="form-input"
                placeholder="Ex: Vila Gertrudes"
                value={formData.endereco?.bairro || ''}
                onChange={(e) => handleNestedChange('endereco', 'bairro', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cidade">
                Cidade <span className="required">*</span>
              </label>
              <input
                id="cidade"
                type="text"
                className="form-input"
                placeholder="Ex: São Paulo"
                value={formData.endereco?.cidade || ''}
                onChange={(e) => handleNestedChange('endereco', 'cidade', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="uf">
                UF <span className="required">*</span>
              </label>
              <select
                id="uf"
                className="form-select"
                value={formData.endereco?.uf || 'SP'}
                onChange={(e) => handleNestedChange('endereco', 'uf', e.target.value)}
              >
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bloco 3: Contato Responsável */}
        <div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1.3 Contato Responsável pelo Cadastro
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="contatoNome">
                Nome do Responsável <span className="required">*</span>
              </label>
              <input
                id="contatoNome"
                type="text"
                className="form-input"
                placeholder="Ex: Carlos Eduardo Silveira"
                value={formData.contato?.responsavel || ''}
                onChange={(e) => handleNestedChange('contato', 'responsavel', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contatoCargo">
                Cargo / Função <span className="required">*</span>
              </label>
              <input
                id="contatoCargo"
                type="text"
                className="form-input"
                placeholder="Ex: Diretor de Operações / Sócio"
                value={formData.contato?.cargo || ''}
                onChange={(e) => handleNestedChange('contato', 'cargo', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="contatoEmail">
                E-mail Corporativo <span className="required">*</span>
              </label>
              <input
                id="contatoEmail"
                type="email"
                className="form-input"
                placeholder="exemplo@transportadora.com.br"
                value={formData.contato?.email || ''}
                onChange={(e) => handleNestedChange('contato', 'email', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contatoTelefone">
                Telefone / WhatsApp <span className="required">*</span>
              </label>
              <input
                id="contatoTelefone"
                type="text"
                className="form-input"
                placeholder="(00) 00000-0000"
                value={formData.contato?.telefone || ''}
                onChange={handlePhoneChange}
                maxLength={15}
                required
              />
            </div>
          </div>
        </div>

        {/* Bloco 4: Dados Bancários */}
        <div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1.4 Domicílio Bancário para Fretes e Pagamentos
          </h3>
          <div className="form-grid-4">
            <div className="form-group">
              <label className="form-label" htmlFor="banco">
                Banco
              </label>
              <input
                id="banco"
                type="text"
                className="form-input"
                placeholder="Ex: 341 - Itaú"
                value={formData.dadosBancarios?.banco || ''}
                onChange={(e) => handleNestedChange('dadosBancarios', 'banco', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="agencia">
                Agência
              </label>
              <input
                id="agencia"
                type="text"
                className="form-input"
                placeholder="0000"
                value={formData.dadosBancarios?.agencia || ''}
                onChange={(e) => handleNestedChange('dadosBancarios', 'agencia', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="conta">
                Conta Corrente
              </label>
              <input
                id="conta"
                type="text"
                className="form-input"
                placeholder="00000-0"
                value={formData.dadosBancarios?.conta || ''}
                onChange={(e) => handleNestedChange('dadosBancarios', 'conta', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="chavePix">
                Chave PIX (preferencial CNPJ)
              </label>
              <input
                id="chavePix"
                type="text"
                className="form-input"
                placeholder="CNPJ ou e-mail"
                value={formData.dadosBancarios?.chavePix || ''}
                onChange={(e) => handleNestedChange('dadosBancarios', 'chavePix', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
