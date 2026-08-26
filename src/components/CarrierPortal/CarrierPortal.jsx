import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Building2, Truck, ShieldCheck, FileCheck, CheckCircle2, Share2, Copy, Check } from 'lucide-react';
import Step1Cadastral from './Step1Cadastral';
import Step2Operacional from './Step2Operacional';
import Step3SegurosRisco from './Step3SegurosRisco';
import Step4Documentos from './Step4Documentos';
import Step5RevisaoProtocolo from './Step5RevisaoProtocolo';
import { generateProtocolNumber, saveCarrier } from '../../services/storageService';
import { calculateRiskScore } from '../../services/riskEngineService';
import LogShareLogo from '../UI/LogShareLogo';

const STEPS = [
  { id: 1, label: "1. Cadastral", icon: Building2 },
  { id: 2, label: "2. Operacional", icon: Truck },
  { id: 3, label: "3. Seguros & Risco", icon: ShieldCheck },
  { id: 4, label: "4. Documentos", icon: FileCheck },
  { id: 5, label: "5. Revisão & Envio", icon: CheckCircle2 }
];

export default function CarrierPortal({ onDossierSubmitted }) {
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
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header do Portal */}
      <div style={{
        background: 'linear-gradient(135deg, #0A192F 0%, #103265 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <LogShareLogo height={38} variant="color" />
            <span style={{ display: 'inline-block', background: 'rgba(0, 210, 255, 0.15)', color: '#00D2FF', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
              PORTAL EXTERNO DO PARCEIRO
            </span>
          </div>
          <h1 style={{ color: 'white', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Homologação de Transportadores LogShare
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.4 }}>
            Preencha os dados e anexe os documentos exigidos para qualificação técnica, análise de conformidade de risco e habilitação operacional.
          </p>
        </div>

        <div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyExternalLink}
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            title="Copiar link externo para enviar ao transportador via WhatsApp ou E-mail"
          >
            {copiedLink ? <Check size={14} color="#10B981" /> : <Share2 size={14} />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Externo'}</span>
          </button>
        </div>
      </div>

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
                  {isCompleted ? <Check size={20} /> : <Icon size={18} />}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Step Content Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {currentStep === 1 && (
          <Step1Cadastral formData={formData} updateFormData={updateFormData} errors={errors} />
        )}
        {currentStep === 2 && (
          <Step2Operacional formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 3 && (
          <Step3SegurosRisco formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 4 && (
          <Step4Documentos formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 5 && (
          <Step5RevisaoProtocolo
            formData={formData}
            onSubmitSuccess={handleFinalSubmit}
            isSubmitted={isSubmitted}
            submittedProtocol={submittedProtocol}
          />
        )}
      </div>

      {/* Navigation Actions */}
      {!isSubmitted && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={currentStep === 1}
            style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
          >
            <ChevronLeft size={18} />
            <span>Voltar</span>
          </button>

          {currentStep < 5 && (
            <button
              id="next-step-btn"
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              <span>Avançar para Etapa {currentStep + 1}</span>
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
