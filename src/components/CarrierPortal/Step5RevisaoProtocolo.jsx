import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, FileText, Send, Printer, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Step5RevisaoProtocolo({ formData, onSubmitSuccess, isSubmitted, submittedProtocol }) {
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = () => {
    if (!lgpdAccepted) {
      alert("Por favor, declare a veracidade das informações e aceite os termos LGPD para prosseguir.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // confetti fallback
      }
      onSubmitSuccess();
    }, 1000);
  };

  const handleCopyProtocol = () => {
    navigator.clipboard.writeText(submittedProtocol || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSubmitted) {
    return (
      <div className="animate-fade-in card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--status-apta-bg)',
          color: 'var(--status-apta-solid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <CheckCircle2 size={44} />
        </div>

        <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
          Dossiê Enviado com Sucesso para Homologação!
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
          Os dados e documentos da <strong>{formData.razaoSocial || 'transportadora'}</strong> foram recebidos com sucesso e já estão disponíveis no Painel de Compliance da LogShare.
        </p>

        {/* Protocol Box */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'var(--bg-subtle)',
          border: '2px dashed var(--primary-600)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Número de Protocolo Oficial
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-600)' }}>
              {submittedProtocol}
            </span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyProtocol}
            title="Copiar Protocolo"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            <span>Imprimir Comprovante de Envio</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-900)' }}>
            Seção 5 — Revisão dos Dados & Envio do Dossiê
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Revise atentamente as informações antes de formalizar o envio para a equipe de homologação LogShare.
          </p>
        </div>
        <FileText size={28} color="var(--primary-600)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Resumo Card 1: Cadastral */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--primary-900)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            1. Dados da Empresa
          </h3>
          <div className="form-grid-3" style={{ fontSize: '0.85rem' }}>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Razão Social:</strong>
              <div>{formData.razaoSocial || '—'}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>CNPJ:</strong>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formData.cnpj || '—'}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Contato Responsável:</strong>
              <div>{formData.contato?.responsavel || '—'} ({formData.contato?.cargo || '—'})</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>E-mail:</strong>
              <div>{formData.contato?.email || '—'}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Telefone:</strong>
              <div>{formData.contato?.telefone || '—'}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Cidade / UF:</strong>
              <div>{formData.endereco?.cidade || '—'} - {formData.endereco?.uf || '—'}</div>
            </div>
          </div>
        </div>

        {/* Resumo Card 2: Operacional & Frota */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--primary-900)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            2. Perfil Operacional & Risco
          </h3>
          <div className="form-grid-3" style={{ fontSize: '0.85rem' }}>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Frota Própria / Agregada:</strong>
              <div>{formData.perfilOperacional?.frotaPropria || 0} próprias / {formData.perfilOperacional?.frotaAgregada || 0} agregadas</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Seguradora & LMG:</strong>
              <div>{formData.gestaoRisco?.seguradora || '—'} (LMG: R$ {formData.gestaoRisco?.lmg ? formData.gestaoRisco.lmg.toLocaleString('pt-BR') : '0'})</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Gerenciadora de Risco:</strong>
              <div>{formData.gestaoRisco?.gerenciadoraRisco || '—'}</div>
            </div>
          </div>
        </div>

        {/* Resumo Card 3: Documentos Anexados */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--primary-900)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            3. Documentos Anexados ({(formData.documentos || []).length} arquivos)
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(formData.documentos || []).map(doc => (
              <span key={doc.id} className="badge badge-apta" style={{ fontSize: '0.75rem' }}>
                <CheckCircle2 size={12} />
                {doc.nome}
              </span>
            ))}
            {(formData.documentos || []).length === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--status-nao-apta-solid)' }}>
                Nenhum documento anexado. Recomendamos anexar os documentos obrigatórios antes de enviar.
              </span>
            )}
          </div>
        </div>

        {/* Termo de Consentimento e LGPD */}
        <div style={{
          border: '1.5px solid var(--primary-200)',
          background: 'var(--primary-50)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem'
        }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              id="lgpdConsent"
              checked={lgpdAccepted}
              onChange={(e) => setLgpdAccepted(e.target.checked)}
              style={{ marginTop: '0.2rem', width: '18px', height: '18px', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.825rem', color: 'var(--primary-900)' }}>
              <strong>Declaração de Veracidade e Consentimento LGPD:</strong> Declaro sob as penas da lei que todas as informações e documentos aqui fornecidos são verdadeiros, autênticos e vigentes. Autorizo a LogShare e suas parceiras de gerenciamento de risco a realizar consultas cadastrais, verificação de RNTRC na ANTT, checagem de apólices e consultas em birôs de crédito estritamente para fins de homologação e qualificação operacional de transporte.
            </div>
          </label>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            id="submit-dossier-btn"
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={isSubmitting || !lgpdAccepted}
            style={{ opacity: lgpdAccepted ? 1 : 0.6 }}
          >
            {isSubmitting ? (
              <span>Enviando e Sincronizando...</span>
            ) : (
              <>
                <Send size={18} />
                <span>Finalizar e Enviar Dossiê</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
