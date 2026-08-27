import React, { useState } from 'react';
import { FileText, X, Printer, Copy, Check, ShieldCheck, Sparkles, BookOpen, Layers, Award, Leaf, Users, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import LogShareLogo from '../UI/LogShareLogo';

export default function POPHomologacaoModal({ isOpen, onClose }) {
  const [activeSubTab, setActiveSubTab] = useState('normas'); // 'normas' | 'pontuacao' | 'classificacao' | 'bpf' | 'fluxo'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `PROCEDIMENTO OPERACIONAL PADRÃO (POP) — LOGSHARE
CÓDIGO: POP-LOG-HOM-001 | VERSÃO: 2.0
TÍTULO: QUALIFICAÇÃO, AUDITORIA E HOMOLOGAÇÃO DE TRANSPORTADORES RODOVIÁRIOS

1. OBJETIVO & COBERTURA NORMATIVA:
- ANVISA RDC Nº 48/2013 (Item 3.3.5) — Boas Práticas de Transporte de Cosméticos e Saneantes.
- ISO 9001:2015 (Item 8.4.3) — Controle e Informação para Provedores Externos.
- ISO 22716:2007 (Item 6.2) — Contratos e Terceirização GMP Cosméticos.
- EFfCI GMP (Item 8.4.3) — Boas Práticas para Ingredientes Cosméticos.
- Requisitos de Fornecedores do Grupo Boticário (Qualidade, Abastecimento, SSOMA, Meio Ambiente e ESG).

2. MATRIZ DE PONTUAÇÃO (SCORE DE RISCO: 0 A 1000 PONTOS):
- Pilar 1: Regularidade Documental & Fiscal (0 - 300 pts)
- Pilar 2: Saúde Financeira & Tempo de Atividade (0 - 300 pts)
- Pilar 3: Gestão de Risco, Apólices e PGR (0 - 200 pts)
- Pilar 4: Capacidade Operacional & Rastreamento (0 - 200 pts)

3. CLASSIFICAÇÃO:
- APTA: Score >= 800 pts e sem impeditivos.
- APTA COM RESTRIÇÕES: Score 600 - 799 pts.
- NÃO APTA: Score < 600 pts ou RNTRC/CNPJ irregular.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '1050px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0A192F 0%, #103265 100%)',
          color: 'white',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <LogShareLogo height={30} variant="white" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: 'rgba(0, 210, 255, 0.2)', color: '#00D2FF', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                  POP-LOG-HOM-001 • REV. 2.0
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Documento Auditável</span>
              </div>
              <h2 style={{ fontSize: '1.15rem', color: 'white', margin: '2px 0 0 0' }}>
                Procedimento Operacional Padrão — Homologação de Transportadores
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}
            >
              {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}
            >
              <Printer size={14} />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#CBD5E1',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          padding: '0.5rem 1.25rem',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveSubTab('normas')}
            className={`btn btn-sm ${activeSubTab === 'normas' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          >
            <ShieldCheck size={14} />
            <span>1. Cobertura das Normas (RDC 48 / ISO / Boticário)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pontuacao')}
            className={`btn btn-sm ${activeSubTab === 'pontuacao' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          >
            <Award size={14} />
            <span>2. Matriz de Pontuação (0 - 1000 pts)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('classificacao')}
            className={`btn btn-sm ${activeSubTab === 'classificacao' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          >
            <Layers size={14} />
            <span>3. Classificação & Restrições Operacionais</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bpf')}
            className={`btn btn-sm ${activeSubTab === 'bpf' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          >
            <Sparkles size={14} />
            <span>4. Boas Práticas & Cosméticos</span>
          </button>

          <button
            onClick={() => setActiveSubTab('fluxo')}
            className={`btn btn-sm ${activeSubTab === 'fluxo' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          >
            <BookOpen size={14} />
            <span>5. Fluxo Operacional</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, fontSize: '0.875rem', lineHeight: 1.6, color: '#334155' }}>
          {/* TAB 1: Cobertura das Normas */}
          {activeSubTab === 'normas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#EFF6FF', borderLeft: '4px solid #0056D2', padding: '1rem', borderRadius: '0 6px 6px 0' }}>
                <h3 style={{ fontSize: '1rem', color: '#1E3A8A', margin: '0 0 0.25rem 0' }}>
                  Aderência Rigorosa às Normas Nacionais, Internacionais e Diretrizes do Grupo Boticário
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#1E40AF', margin: 0 }}>
                  Este POP padroniza a auditoria documental e qualificação de transportadores para assegurar que 100% das operações na malha LogShare atendam às exigências regulatórias sanitárias, de qualidade e sustentabilidade.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {/* Card 1: ANVISA RDC 48 */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', background: '#FAFAFA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#EDE9FE', color: '#6D28D9', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: '0.75rem' }}>
                      ANVISA RDC Nº 48/2013 (Item 3.3.5)
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                    Boas Práticas de Fabricação & Transporte de Cosméticos
                  </h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                    <li>Qualificação formal de transportadores terceirizados.</li>
                    <li>Auditoria de higiene e integridade física de veículos/baús.</li>
                    <li>POPs de limpeza, controle de odores e prevenção de contaminação cruzada.</li>
                    <li>Controle de temperatura para cosméticos sensíveis.</li>
                  </ul>
                </div>

                {/* Card 2: ISO 9001 & EFfCI */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', background: '#FAFAFA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: '0.75rem' }}>
                      ISO 9001:2015 (8.4.3) & EFfCI (8.4.3)
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                    Controle de Provedores Externos & Ingredientes Cosméticos
                  </h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                    <li>Matriz objetiva de qualificação e Score de Risco de 0 a 1000 pontos.</li>
                    <li>Monitoramento contínuo de vigências de documentos e apólices.</li>
                    <li>Auditoria e emissão de parecer técnico formal assinado digitalmente.</li>
                    <li>Rastreabilidade de lotes e controle de desempenho operacional.</li>
                  </ul>
                </div>

                {/* Card 3: ISO 22716 */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', background: '#FAFAFA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: '0.75rem' }}>
                      ISO 22716:2007 (Item 6.2)
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                    Contratos e Subcontratação — GMP Cosméticos
                  </h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                    <li>Contrato técnico formal com definição de responsabilidades.</li>
                    <li>Proibição de subcontratação/redespacho sem anuência prévia da LogShare.</li>
                    <li>Termo de responsabilidade e compliance ético e operacional.</li>
                  </ul>
                </div>

                {/* Card 4: Grupo Boticário */}
                <div style={{ border: '1px solid #86EFAC', borderRadius: '8px', padding: '1rem', background: '#F0FDF4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: '0.75rem' }}>
                      Diretrizes Fornecedores Grupo Boticário (ESG & SSOMA)
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', color: '#065F46', margin: '0 0 0.35rem 0' }}>
                    Qualidade, Abastecimento, SSOMA, Meio Ambiente & Social
                  </h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: '#166534' }}>
                    <li><strong>SSOMA:</strong> CNHs com exame toxicológico periódico (Lei 13.103) e PGR ativo.</li>
                    <li><strong>Meio Ambiente:</strong> CTF/IBAMA ativo e controle de fumaça preta/emissões.</li>
                    <li><strong>Responsabilidade Social:</strong> CNDT Trabalhista, CRF FGTS e combate ao trabalho escravo.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Matriz de Pontuação */}
          {activeSubTab === 'pontuacao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                O Score Global de Risco (0 a 1000 pontos) avalia o transportador em 4 pilares ponderados:
              </p>

              {/* Tabela Pilar 1 */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ background: '#0056D2', color: 'white', padding: '8px 12px', fontWeight: 700, fontSize: '0.85rem' }}>
                  Pilar 1: Regularidade Documental & Fiscal (0 a 300 pontos)
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: '6px 10px' }}>Documento</th>
                      <th style={{ padding: '6px 10px' }}>Critério de Validação</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right' }}>Pontuação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 600 }}>Registro RNTRC / ANTT Ativo</td>
                      <td style={{ padding: '6px 10px' }}>Habilitado na ANTT para transporte remunerado</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0056D2' }}>50 pts</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 600 }}>Apólice RCTR-C (ou Estipulação LogShare)</td>
                      <td style={{ padding: '6px 10px' }}>Apólice própria ativa ou cobertura mestre LogShare</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0056D2' }}>40 pts</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 600 }}>Apólice RC-DC (ou Estipulação LogShare)</td>
                      <td style={{ padding: '6px 10px' }}>Apólice própria ativa ou cobertura mestre LogShare</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0056D2' }}>40 pts</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 600 }}>Cartão CNPJ Atualizado</td>
                      <td style={{ padding: '6px 10px' }}>Situação ATIVA na Receita Federal</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0056D2' }}>35 pts</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 600 }}>Quitação Seguro & PGR</td>
                      <td style={{ padding: '6px 10px' }}>Comprovante de pagamento e PGR formalizado</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0056D2' }}>50 pts (25+25)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 600 }}>Certidões Negativas (CND Federal + CNDT + CRF)</td>
                      <td style={{ padding: '6px 10px' }}>Regularidade tributária, trabalhista e FGTS</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0056D2' }}>55 pts (20+20+15)</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 10px', fontWeight: 600 }}>Frota CRLV + CNH Toxicológico + Contrato Social</td>
                      <td style={{ padding: '6px 10px' }}>Documentação veicular, motoristas e societária</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0056D2' }}>30 pts (10+10+10)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Demais Pilares em Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#0056D2', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
                    Pilar 2: Saúde Financeira (0 - 300 pts)
                  </h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.78rem' }}>
                    <li><strong>Tempo de Atividade:</strong> {'>'} 5 anos (100 pts) | 2 a 5 anos (70 pts) | {'<'} 2 anos (40 pts)</li>
                    <li><strong>Capital Social:</strong> {'>'} R$ 500k (100 pts) | R$ 100k-500k (70 pts) | {'<'} R$ 100k (40 pts)</li>
                    <li><strong>Regularidade Plena:</strong> CNDs 100% negativas (100 pts) | Pendência menor (50 pts)</li>
                  </ul>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#0056D2', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
                    Pilar 3: Gestão de Risco (0 - 200 pts)
                  </h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.78rem' }}>
                    <li><strong>LMG por Viagem:</strong> {'>='} R$ 1M ou Estipulada LogShare (100 pts) | R$ 500k (70 pts)</li>
                    <li><strong>Gerenciadora Parceira:</strong> Buonny, OpenTech, Brasil Risk, etc. (50 pts)</li>
                    <li><strong>PGR Formalizado:</strong> Implementado e com regras de escolta (50 pts)</li>
                  </ul>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#0056D2', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
                    Pilar 4: Capacidade Operacional (0 - 200 pts)
                  </h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.78rem' }}>
                    <li><strong>Dimensão da Frota:</strong> {'>='} 20 veículos (100 pts) | 5-19 veículos (70 pts)</li>
                    <li><strong>Tecnologia de Rastreamento:</strong> Duplo rastreamento / isca móvel (100 pts) | Telemetria primária (60 pts)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Classificação & Restrições */}
          {activeSubTab === 'classificacao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ border: '2px solid #10B981', background: '#F0FDF4', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065F46', fontWeight: 800, fontSize: '1rem' }}>
                    <CheckCircle2 size={18} color="#10B981" />
                    <span>APTA (LIBERADA)</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#166534', margin: '0.4rem 0' }}>
                    <strong>Score $\ge$ 800 pontos</strong> e sem nenhum impeditivo crítico.
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#14532D', margin: 0 }}>
                    Liberação total para contratação em qualquer rota, respeitando o LMG e o perfil de carga contratado.
                  </p>
                </div>

                <div style={{ border: '2px solid #F59E0B', background: '#FFFBEB', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400E', fontWeight: 800, fontSize: '1rem' }}>
                    <AlertTriangle size={18} color="#F59E0B" />
                    <span>APTA COM RESTRIÇÕES</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#92400E', margin: '0.4rem 0' }}>
                    <strong>Score entre 600 e 799 pontos</strong> ou pendência menor.
                  </p>
                  <ul style={{ fontSize: '0.75rem', color: '#78350F', paddingLeft: '1.1rem', margin: 0 }}>
                    <li>Teto de carga de R$ 300k a R$ 500k por viagem.</li>
                    <li>Escolta armada obrigatória em cargas visadas.</li>
                    <li>Duplo rastreamento obrigatório.</li>
                    <li>Proibição de redespacho sem anuência prévia.</li>
                  </ul>
                </div>

                <div style={{ border: '2px solid #EF4444', background: '#FEF2F2', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991B1B', fontWeight: 800, fontSize: '1rem' }}>
                    <XCircle size={18} color="#EF4444" />
                    <span>NÃO APTA (BLOQUEADA)</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#991B1B', margin: '0.4rem 0' }}>
                    <strong>Score {'<'} 600 pontos</strong> ou ocorrência de Dealbreaker.
                  </p>
                  <ul style={{ fontSize: '0.75rem', color: '#7F1D1D', paddingLeft: '1.1rem', margin: 0 }}>
                    <li>RNTRC irregular, suspenso ou vencido.</li>
                    <li>Cartão CNPJ inapto na Receita Federal.</li>
                    <li>Fraude documental ou trabalho análogo ao escravo.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Boas Práticas & Cosméticos */}
          {activeSubTab === 'bpf' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#0A192F', margin: 0 }}>
                Diretrizes Específicas para Produtos Cosméticos, Farmacêuticos e de Higiene
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: '#0056D2', margin: '0 0 0.4rem 0' }}>
                    1. Higiene & Limpeza de Baús (RDC 48 - Item 3.3.5)
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0 }}>
                    Veículos devem ser limpos, secos e isentos de odores, resíduos químicos, pragas ou umidade. É obrigatório registrar a higienização periódica em checklist pré-carregamento.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: '#0056D2', margin: '0 0 0.4rem 0' }}>
                    2. Prevenção de Contaminação Cruzada (EFfCI)
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0 }}>
                    É terminantemente proibido o transporte conjunto de produtos cosméticos ou insumos com agrotóxicos, produtos químicos tóxicos, corrosivos ou lixo.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: '#0056D2', margin: '0 0 0.4rem 0' }}>
                    3. Gestão Térmica & Cadeia Fria
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0 }}>
                    Para cargas sensíveis (perfumes, cremes e matérias-primas termolábeis), é exigida comprovação de baú isotérmico ou refrigerado com termo-higrômetro calibrado.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: '#0056D2', margin: '0 0 0.4rem 0' }}>
                    4. Responsabilidade Técnica (CRT)
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0 }}>
                    Operações sanitárias de grande porte devem apresentar Certidão de Regularidade Técnica emitida pelo CRF ou CRQ com profissional habilitado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Fluxo Operacional */}
          {activeSubTab === 'fluxo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#0A192F', margin: 0 }}>
                Etapas do Processo de Homologação Digital LogShare
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                  <span style={{ background: '#0056D2', color: 'white', fontWeight: 800, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: '#0F172A' }}>Submissão do Dossiê Cadastral</strong>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0 0' }}>O transportador preenche os dados nas 4 seções do Portal e anexa os 24 documentos oficiais em formato PDF ou imagem.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                  <span style={{ background: '#0056D2', color: 'white', fontWeight: 800, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: '#0F172A' }}>Leitura OCR por IA & Cálculo Preliminar</strong>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0 0' }}>O motor de IA extrai automaticamente vigências, CNPJ e números de apólice, calculando o score preliminar e a aderência normativa.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                  <span style={{ background: '#0056D2', color: 'white', fontWeight: 800, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: '#0F172A' }}>Auditoria Técnica pelo Especialista de Compliance</strong>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0 0' }}>O especialista audita os documentos, valida ou ajusta o status e insere as condicionantes operacionais requeridas.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                  <span style={{ background: '#0056D2', color: 'white', fontWeight: 800, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>4</span>
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: '#0F172A' }}>Emissão de Parecer Oficial & Sincronização em Nuvem</strong>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0 0' }}>Geração de PDF timbrado com protocolo único e sincronização instantânea na pasta do Google Drive e na planilha Google Sheets.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          padding: '0.85rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: '#64748B'
        }}>
          <div>
            <span>Homologado pelo Comitê de Compliance e Qualidade LogShare • Próxima Revisão: 27/08/2027</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600 }}
          >
            Fechar POP
          </button>
        </div>
      </div>
    </div>
  );
}
