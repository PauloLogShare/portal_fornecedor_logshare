import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, FileText, Send, Printer, Copy, Check, Lock, Calendar, Truck, ArrowRight, UserCheck, AlertCircle, AlertTriangle, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDateBR, ALL_SYSTEM_DOCUMENTS } from '../../services/validityCalculator';

export default function Step5RevisaoProtocolo({
  formData,
  onSubmitFinal,
  onSubmitSuccess,
  isSubmitted,
  protocol,
  submittedProtocol,
  onGoToStep
}) {
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeProtocol = protocol || submittedProtocol || 'HOM-2026-XXXXX';

  // Análise de documentos obrigatórios pendentes
  const isLogShareInsurance = formData.gestaoRisco?.estipuladoLogShare || formData.gestaoRisco?.modeloSeguro === 'LOGSHARE_ESTIPULADO';
  const availableSystemDocs = isLogShareInsurance 
    ? ALL_SYSTEM_DOCUMENTS.filter(d => d.categoryId !== "cat_seguros_pgr") 
    : ALL_SYSTEM_DOCUMENTS;
  const mandatoryDocs = availableSystemDocs.filter(d => d.obrigatorio);
  const pendingMandatory = mandatoryDocs.filter(m => {
    const uploaded = (formData.documentos || []).find(d => d.id === m.id);
    return !uploaded || uploaded.status === 'IRREGULAR';
  });

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
      if (onSubmitFinal) {
        onSubmitFinal();
      } else if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    }, 600);
  };

  const handleCopyProtocol = () => {
    const shareText = `Homologação LogShare - Protocolo: ${activeProtocol} | CNPJ: ${formData.cnpj || ''}`;
    navigator.clipboard.writeText(shareText);
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
          Dossiê Recebido com Sucesso para Homologação!
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
          Os dados da transportadora <strong>{formData.razaoSocial || 'Transportadora'}</strong> foram salvos e o protocolo oficial foi gerado no sistema.
        </p>

        {/* Protocol Box */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1.25rem',
          background: 'var(--bg-subtle)',
          border: '2px dashed var(--primary-600)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 2.25rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Número de Protocolo Oficial
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-600)' }}>
              {activeProtocol}
            </span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyProtocol}
            title="Copiar Protocolo e Dados"
          >
            {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            <span>{copied ? 'Copiado!' : 'Copiar Dados'}</span>
          </button>
        </div>

        {/* AVISO IMPORTANTE DE RETORNO / DOCUMENTOS PENDENTES */}
        {pendingMandatory.length > 0 ? (
          <div style={{
            background: '#FEF2F2',
            border: '1.5px solid #FCA5A5',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            maxWidth: '720px',
            margin: '0 auto 2rem auto',
            textAlign: 'left',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
          }}>
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <AlertCircle size={24} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 0.4rem 0', color: '#991B1B', fontSize: '1.05rem', fontWeight: 800 }}>
                  📌 Lembrete Importante: Documentos Obrigatórios Pendentes ({pendingMandatory.length})
                </h3>
                <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.875rem', color: '#7F1D1D', lineHeight: 1.55 }}>
                  Identificamos que restam <strong>{pendingMandatory.length} documento(s) obrigatório(s)</strong> a serem anexados. Para que nossa equipe de compliance possa concluir a homologação e liberar as operações, <strong>você poderá retornar a qualquer momento através deste link</strong> (ou acessando a aba <strong>"Consultar Meu Protocolo"</strong> com o seu CNPJ: <code>{formData.cnpj || 'seu CNPJ'}</code>) para continuar o envio dos documentos.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {onGoToStep && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onGoToStep(4)}
                      style={{ fontSize: '0.825rem', background: '#DC2626', borderColor: '#DC2626' }}
                    >
                      <Upload size={14} />
                      <span>Continuar Cadastro e Anexar Documentos Agora</span>
                    </button>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleCopyProtocol}
                    style={{ fontSize: '0.825rem' }}
                  >
                    {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    <span>Salvar Link de Acesso com Protocolo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            maxWidth: '680px',
            margin: '0 auto 1.5rem auto',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <CheckCircle2 size={22} color="#10B981" />
              <div style={{ fontSize: '0.875rem', color: '#065F46' }}>
                <strong>Checklist Completo:</strong> Todos os documentos obrigatórios foram enviados com sucesso!
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            <span>Imprimir Comprovante de Envio</span>
          </button>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-light)',
          textAlign: 'left',
          maxWidth: '680px',
          margin: '2.5rem auto 0 auto',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <h4 style={{ color: 'var(--primary-900)', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} color="var(--primary-600)" />
            <span>Próximas Etapas da Homologação LogShare:</span>
          </h4>
          <ol style={{ paddingLeft: '1.25rem', lineHeight: 1.6, margin: 0 }}>
            <li>Nossa equipe de compliance e gestão de risco auditará a autenticidade das apólices e certidões.</li>
            <li>Você pode acompanhar a situação a qualquer momento na aba <strong>"Consultar Meu Protocolo"</strong> informando seu CNPJ (<code>{formData.cnpj}</code>) e o protocolo (<code>{activeProtocol}</code>).</li>
            <li>O parecer oficial final será emitido em até 24 a 48 horas úteis após o envio completo dos documentos obrigatórios.</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-900)' }}>
            Seção 5 — Revisão dos Dados e Envio do Dossiê
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Confira o resumo das informações antes de gerar o protocolo oficial de homologação.
          </p>
        </div>
        <FileText size={28} color="var(--primary-600)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* BANNER DE ALERTA EM DESTAQUE SE HOUVER DOCUMENTOS OBRIGATÓRIOS FALTANDO */}
        {pendingMandatory.length > 0 && (
          <div style={{
            background: '#FEF2F2',
            border: '2px solid #F87171',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
          }}>
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <AlertCircle size={24} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', color: '#991B1B', fontSize: '1rem', fontWeight: 800 }}>
                  ⚠️ Atenção: {pendingMandatory.length} Documento(s) Obrigatório(s) não Anexado(s)
                </h3>
                <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', color: '#7F1D1D', lineHeight: 1.55 }}>
                  Você pode <strong>enviar o formulário agora</strong> para registrar seus dados e gerar o seu protocolo oficial. Lembramos que <strong>você poderá retornar a este link com o seu acesso a qualquer momento</strong> e continuar o cadastro para envio dos documentos pendentes para que nossa equipe dê seguimento à análise de dados e homologação.
                </p>
                <div style={{
                  background: 'white',
                  border: '1px solid #FECACA',
                  borderRadius: 6,
                  padding: '0.75rem 1rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Documentos obrigatórios pendentes:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#B91C1C' }}>
                    {pendingMandatory.map(m => (
                      <li key={m.id} style={{ marginBottom: '2px' }}>
                        <strong>{m.nome}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
                {onGoToStep && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => onGoToStep(4)}
                    style={{
                      background: '#DC2626',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Upload size={13} />
                    <span>Voltar à Etapa 4 para Anexar Documentos Agora</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resumo 1: Cadastral */}
        <div className="card" style={{ background: 'var(--bg-subtle)', padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-900)', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.25rem' }}>
            1. Dados Cadastrais & Contato
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div><strong>Razão Social:</strong> {formData.razaoSocial || '—'}</div>
            <div><strong>CNPJ:</strong> {formData.cnpj || '—'}</div>
            <div><strong>Nome Fantasia:</strong> {formData.nomeFantasia || '—'}</div>
            <div><strong>Data Abertura:</strong> {formatDateBR(formData.aberturaCNPJ) || '—'}</div>
            <div><strong>Cidade / UF:</strong> {formData.endereco?.cidade || '—'}/{formData.endereco?.uf || '—'}</div>
            <div><strong>CEP:</strong> {formData.endereco?.cep || '—'}</div>
            <div><strong>Responsável:</strong> {formData.contato?.responsavel || '—'} ({formData.contato?.cargo || '—'})</div>
            <div><strong>E-mail:</strong> {formData.contato?.email || '—'}</div>
            <div><strong>Telefone:</strong> {formData.contato?.telefone || '—'}</div>
          </div>
        </div>

        {/* Resumo 2: Operacional */}
        <div className="card" style={{ background: 'var(--bg-subtle)', padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-900)', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.25rem' }}>
            2. Perfil Operacional & Frota
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div><strong>Frota Própria:</strong> {formData.perfilOperacional?.frotaPropria || 0} veículos</div>
            <div><strong>Frota Agregada:</strong> {formData.perfilOperacional?.frotaAgregada || 0} veículos</div>
            <div><strong>Rastreamento:</strong> {(formData.perfilOperacional?.tecnologiaRastreamento || []).join(', ') || '—'}</div>
            <div><strong>Regiões:</strong> {(formData.perfilOperacional?.regioes || []).join(', ') || '—'}</div>
          </div>
        </div>

        {/* Resumo 3: Seguros e PGR */}
        <div className="card" style={{ background: 'var(--bg-subtle)', padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-900)', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.25rem' }}>
            3. Seguros & Gerenciamento de Risco
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
            {isLogShareInsurance ? (
              <div style={{ gridColumn: '1 / -1', color: '#065F46', fontWeight: 700 }}>
                🛡️ Cobertura Securitária Estipulada via Apólice Mestre LogShare (RCTR-C, RC-DC e Gerenciamento de Risco)
              </div>
            ) : (
              <>
                <div><strong>Seguradora:</strong> {formData.gestaoRisco?.seguradora || '—'}</div>
                <div><strong>LMG Cobertura:</strong> R$ {formData.gestaoRisco?.lmg ? formData.gestaoRisco.lmg.toLocaleString('pt-BR') : '0'}</div>
                <div><strong>Gerenciadora de Risco:</strong> {formData.gestaoRisco?.gerenciadoraRisco || '—'}</div>
                <div><strong>PGR Homologado:</strong> {formData.gestaoRisco?.temPGR ? 'Sim' : 'Não'}</div>
              </>
            )}
          </div>
        </div>

        {/* Resumo 4: Documentos Anexados */}
        <div className="card" style={{ background: 'var(--bg-subtle)', padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-900)', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.25rem' }}>
            4. Documentos Anexados ({(formData.documentos || []).length} arquivos)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem' }}>
            {(formData.documentos || []).map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span>• {d.nome}</span>
                <span style={{ color: 'var(--primary-600)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  {d.arquivoNome} (Vigência: {formatDateBR(d.vigencia)})
                </span>
              </div>
            ))}
            {(formData.documentos || []).length === 0 && (
              <span style={{ color: 'var(--status-nao-apta-solid)' }}>Nenhum documento anexado.</span>
            )}
          </div>
        </div>

        {/* Termo de Declaração e LGPD */}
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FCD34D',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem'
        }}>
          <label style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              style={{ marginTop: '3px', width: '16px', height: '16px' }}
              checked={lgpdAccepted}
              onChange={(e) => setLgpdAccepted(e.target.checked)}
            />
            <span style={{ fontSize: '0.85rem', color: '#92400E', lineHeight: 1.5 }}>
              Declaro para todos os fins de direito que todas as informações prestadas e documentos anexados são autênticos, válidos e representam fielmente a situação da transportadora. Autorizo a <strong>LogShare</strong> a consultar e validar os dados perante órgãos reguladores (ANTT, Receita Federal, Seguradoras e Gerenciadoras de Risco) nos termos da LGPD (Lei nº 13.709/2018).
            </span>
          </label>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !lgpdAccepted}
            style={{
              padding: '0.9rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <Send size={18} />
            <span>{isSubmitting ? "Gerando Protocolo..." : "Gerar Protocolo & Enviar Dossiê"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
