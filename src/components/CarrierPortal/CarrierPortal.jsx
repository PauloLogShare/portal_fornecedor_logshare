import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Building2, Truck, ShieldCheck, FileCheck, CheckCircle2, Share2, Copy, Check, Search, Lock, UserCheck } from 'lucide-react';
import Step1Cadastral from './Step1Cadastral';
import Step2Operacional from './Step2Operacional';
import Step3SegurosRisco from './Step3SegurosRisco';
import Step4Documentos from './Step4Documentos';
import Step5RevisaoProtocolo from './Step5RevisaoProtocolo';
import CarrierStatusLookup from './CarrierStatusLookup';
import { generateProtocolNumber, saveCarrier, loadCarriers } from '../../services/storageService';
import { calculateRiskScore } from '../../services/riskEngineService';
import LogShareLogo from '../UI/LogShareLogo';

const STEPS = [
  { id: 1, label: "1. Cadastral", icon: Building2 },
  { id: 2, label: "2. Operacional", icon: Truck },
  { id: 3, label: "3. Seguros & Risco", icon: ShieldCheck },
  { id: 4, label: "4. Documentos", icon: FileCheck },
  { id: 5, label: "5. Revisão & Envio", icon: CheckCircle2 }
];

export default function CarrierPortal({ onDossierSubmitted, carriers = [], isStandalone = false, onOpenSpecialistLogin }) {
  const [portalTab, setPortalTab] = useState('NEW'); // 'NEW' | 'LOOKUP'
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedProtocol, setSubmittedProtocol] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [formData, setFormData] = useState({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    inscricaoEstadual: "",
    aberturaCNPJ: "",
    endereco: {
      logradouro: "",
      bairro: "",
      cidade: "",
      uf: "SP",
      cep: ""
    },
    contato: {
      responsavel: "",
      cargo: "",
      email: "",
      telefone: ""
    },
    dadosBancarios: {
      banco: "",
      agencia: "",
      conta: "",
      chavePix: ""
    },
    perfilOperacional: {
      tiposCarga: ["Carga Geral / Seca", "Lotação (FTL)"],
      regioes: ["Sudeste (SP, RJ, MG, ES)"],
      frotaPropria: 5,
      frotaAgregada: 10,
      tiposVeiculos: ["Truck (3 Eixos)", "Carreta 2 Eixos / 3 Eixos (LS / Vanderleia)"],
      tecnologiaRastreamento: ["Autotrac Satelital", "Omnilink"],
      sensoresSeguranca: ["Trava de 5ª Roda (Desengate)", "Botão de Pânico no Painel"]
    },
    gestaoRisco: {
      seguradora: "Porto Seguro Transportes",
      apoliceRCTR_C: "",
      apoliceRC_DC: "",
      vigenciaApolice: "",
      lmg: 500000,
      gerenciadoraRisco: "Buonny Projetos e Serviços",
      temPGR: true
    },
    documentos: []
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCurrentStep = () => {
    const errs = {};
    if (currentStep === 1) {
      if (!formData.razaoSocial?.trim()) errs.razaoSocial = "Razão Social é obrigatória.";
      if (!formData.cnpj?.trim()) errs.cnpj = "CNPJ é obrigatório.";
      if (!formData.endereco?.cidade?.trim()) errs.cidade = "Cidade é obrigatória.";
      if (!formData.contato?.email?.trim()) errs.email = "E-mail corporativo é obrigatório.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(5, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = () => {
    const protocol = generateProtocolNumber();
    const { scoreTotal, breakdown } = calculateRiskScore(formData);

    const newCarrierRecord = {
      ...formData,
      id: `CARRIER-${Date.now()}`,
      protocol: protocol,
      status: "AGUARDANDO_ANALISE",
      scoreTotal,
      scoreBreakdown: breakdown,
      parecer: null,
      dataCriacao: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString()
    };

    saveCarrier(newCarrierRecord);
    setSubmittedProtocol(protocol);
    setIsSubmitted(true);
    if (onDossierSubmitted) {
      onDossierSubmitted(newCarrierRecord);
    }
  };

  const handleCopyExternalLink = () => {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Standalone Public Header (Only shown when accessed directly by carrier) */}
      {isStandalone && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 0 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '1.5rem'
        }}>
          <LogShareLogo height={34} variant="dark" />
          {onOpenSpecialistLogin && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenSpecialistLogin}
              style={{ fontSize: '0.78rem' }}
            >
              <Lock size={13} />
              <span>Área Restrita Especialistas</span>
            </button>
          )}
        </div>
      )}

      {/* Portal Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0A192F 0%, #103265 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '1.75rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <LogShareLogo height={36} variant="color" />
            <span style={{ display: 'inline-block', background: 'rgba(0, 210, 255, 0.15)', color: '#00D2FF', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
              PORTAL DO PARCEIRO TRANSPORTADOR
            </span>
          </div>
          <h1 style={{ color: 'white', fontSize: '1.55rem', marginBottom: '0.4rem' }}>
            Homologação & Qualificação de Transportadores
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.4 }}>
            Preencha os dados e anexe os documentos exigidos para qualificação técnica, análise de conformidade de risco e habilitação operacional.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          {/* Sub-Tab Navigation Switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`btn btn-sm ${portalTab === 'NEW' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setPortalTab('NEW');
                setIsSubmitted(false);
              }}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
            >
              <Truck size={14} />
              <span>Novo Cadastro</span>
            </button>
            <button
              className={`btn btn-sm ${portalTab === 'LOOKUP' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPortalTab('LOOKUP')}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
            >
              <Search size={14} />
              <span>Consultar Meu Protocolo</span>
            </button>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyExternalLink}
            style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.15)', fontSize: '0.725rem' }}
            title="Copiar link externo para enviar ao transportador"
          >
            {copiedLink ? <Check size={12} color="#10B981" /> : <Share2 size={12} />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Externo'}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: FORMULÁRIO DE CADASTRO (5 ETAPAS)                              */}
      {/* ===================================================================== */}
      {portalTab === 'NEW' && (
        <>
          {/* Stepper Navigation */}
          {!isSubmitted && (
            <div className="stepper-nav">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div
                    key={step.id}
                    className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => {
                      if (isCompleted) setCurrentStep(step.id);
                    }}
                  >
                    <div className="step-circle">
                      {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                    </div>
                    <span className="step-label">{step.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Form Content Card */}
          <div className="card" style={{ padding: '2rem' }}>
            {currentStep === 1 && (
              <Step1Cadastral
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}

            {currentStep === 2 && (
              <Step2Operacional
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {currentStep === 3 && (
              <Step3SegurosRisco
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {currentStep === 4 && (
              <Step4Documentos
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {currentStep === 5 && (
              <Step5RevisaoProtocolo
                formData={formData}
                isSubmitted={isSubmitted}
                protocol={submittedProtocol}
                onSubmitFinal={handleFinalSubmit}
              />
            )}

            {/* Step Controls */}
            {!isSubmitted && (
              <div className="step-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handlePrev}
                  >
                    <ChevronLeft size={18} />
                    <span>Voltar Etapa</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                  >
                    <span>Avançar para Etapa {currentStep + 1}</span>
                    <ChevronRight size={18} />
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: CONSULTA DE PROTOCOLO E REENVIO DE PENDÊNCIAS                   */}
      {/* ===================================================================== */}
      {portalTab === 'LOOKUP' && (
        <CarrierStatusLookup
          carriers={carriers.length > 0 ? carriers : loadCarriers()}
          onCarrierUpdated={(updated) => {
            if (onDossierSubmitted) onDossierSubmitted(updated);
          }}
        />
      )}

      {/* Footer Legal & LGPD */}
      <footer style={{
        marginTop: '2.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border-light)',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} LogShare Tecnologia em Logística & Compliance de Transportes. Todos os dados são processados em conformidade com a LGPD (Lei 13.709/2018).
        </p>
      </footer>
    </div>
  );
}
