import React, { useState } from 'react';
import { FileText, X, Printer, Copy, Check, ShieldCheck, Sparkles, BookOpen, Layers, Award, Leaf, Users, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Download } from 'lucide-react';
import LogShareLogo from '../UI/LogShareLogo';
import logoImg from '../../assets/logo_logshare.png';

export default function POPHomologacaoModal({ isOpen, onClose }) {
  const [activeSubTab, setActiveSubTab] = useState('normas'); // 'normas' | 'pontuacao' | 'classificacao' | 'bpf' | 'fluxo' | 'completo'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrintFullPOP = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    const popHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>POP-LOG-HOM-001 — Procedimento Operacional Padrão de Homologação</title>
        <style>
          @page {
            size: A4;
            margin: 18mm 15mm 18mm 15mm;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1E293B;
            line-height: 1.5;
            font-size: 11pt;
            margin: 0;
            padding: 0;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 2px solid #0056D2;
          }
          .header-table td {
            border: 1px solid #CBD5E1;
            padding: 8px 12px;
            font-size: 10pt;
          }
          .header-title {
            font-size: 13pt;
            font-weight: 800;
            color: #0056D2;
            text-align: center;
          }
          h2 {
            color: #0056D2;
            font-size: 12pt;
            border-bottom: 2px solid #0056D2;
            padding-bottom: 4px;
            margin-top: 22px;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          h3 {
            color: #0F172A;
            font-size: 11pt;
            margin-top: 14px;
            margin-bottom: 6px;
          }
          p, ul, ol {
            margin-top: 4px;
            margin-bottom: 10px;
            font-size: 10pt;
          }
          ul {
            padding-left: 20px;
          }
          li {
            margin-bottom: 4px;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 16px 0;
            font-size: 9.5pt;
          }
          table.data-table th {
            background: #0056D2;
            color: #FFFFFF;
            padding: 6px 8px;
            border: 1px solid #0056D2;
            text-align: left;
            font-weight: 700;
          }
          table.data-table td {
            border: 1px solid #E2E8F0;
            padding: 6px 8px;
          }
          table.data-table tr:nth-child(even) {
            background: #F8FAFC;
          }
          .alert-box {
            background: #EFF6FF;
            border-left: 4px solid #0056D2;
            padding: 10px 14px;
            margin: 12px 0;
            font-size: 9.5pt;
            color: #1E3A8A;
          }
          .tag {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 8.5pt;
          }
          .tag-apta { background: #DCFCE7; color: #166534; }
          .tag-restricoes { background: #FEF3C7; color: #92400E; }
          .tag-nao-apta { background: #FEE2E2; color: #991B1B; }
          .footer-sign {
            margin-top: 40px;
            border-top: 1px solid #CBD5E1;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
            color: #64748B;
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <!-- Header Oficial Padronizado -->
        <table class="header-table">
          <tr>
            <td style="width: 25%; text-align: center; vertical-align: middle; background: #FFFFFF;">
              <img src="${window.location.origin}/logo_logshare.png" alt="LogShare" style="max-height: 42px; max-width: 160px;" onerror="this.outerHTML='<strong style=\\'color:#0056D2;font-size:16pt;\\'>LogShare®</strong>'">
            </td>
            <td style="width: 50%;" class="header-title">
              PROCEDIMENTO OPERACIONAL PADRÃO (POP)<br>
              <span style="font-size: 10pt; color: #334155; font-weight: normal;">QUALIFICAÇÃO, AUDITORIA E HOMOLOGAÇÃO DE TRANSPORTADORES RODOVIÁRIOS</span>
            </td>
            <td style="width: 25%; font-size: 8.5pt; line-height: 1.4;">
              <strong>CÓDIGO:</strong> POP-LOG-HOM-001<br>
              <strong>VERSÃO:</strong> 2.0<br>
              <strong>DATA:</strong> 27/08/2026<br>
              <strong>PRÓX. REVISÃO:</strong> 27/08/2027
            </td>
          </tr>
        </table>

        <!-- 1. OBJETIVO & COBERTURA NORMATIVA -->
        <h2>1. Objetivo & Cobertura Integral das Normas Regulatórias</h2>
        <p>
          Estabelecer critérios técnicos, objetivos, sanitários e de gestão de risco para qualificação, auditoria documental e homologação de transportadores rodoviários de cargas parceiros na plataforma LogShare, atendendo com rigor a:
        </p>
        <ul>
          <li><strong>ANVISA RDC Nº 48/2013 (Item 3.3.5)</strong>: Boas Práticas de Fabricação, Armazenamento e Transporte de Cosméticos e Saneantes.</li>
          <li><strong>ISO 9001:2015 (Item 8.4.3)</strong>: Controle de Provedores Externos de Processos e Serviços Logísticos.</li>
          <li><strong>ISO 22716:2007 (Item 6.2)</strong>: Contratos e Subcontratação — GMP Cosméticos.</li>
          <li><strong>EFfCI GMP (Item 8.4.3)</strong>: Boas Práticas e Rastreabilidade de Ingredientes e Matérias-Primas Cosméticas.</li>
          <li><strong>Requisitos de Fornecedores do Grupo Boticário</strong>: Qualidade, Abastecimento, SSOMA (Saúde e Segurança), Meio Ambiente e Responsabilidade Social / ESG.</li>
        </ul>

        <!-- 2. CAMPO DE APLICAÇÃO -->
        <h2>2. Campo de Aplicação & Responsabilidades</h2>
        <p>
          Aplica-se a 100% dos transportadores rodoviários de cargas (empresas frotistas, agregados e transportadores com RNTRC ativo) cadastrados ou em processo de qualificação na LogShare.
        </p>
        <p>
          <strong>Responsabilidades:</strong>
        </p>
        <ul>
          <li><strong>Transportador:</strong> Preencher com exatidão as informações e anexar os 24 documentos oficiais com vigência ativa.</li>
          <li><strong>Especialista de Homologação LogShare:</strong> Auditar autenticidade, vigências, validar apólices e emitir o Parecer Técnico Oficial.</li>
          <li><strong>Comitê de Compliance & Qualidade:</strong> Monitorar vigências e aplicar travas e condicionantes operacionais.</li>
        </ul>

        <!-- 3. MATRIZ DE PONTUAÇÃO (SCORE DE RISCO 0 A 1000) -->
        <h2>3. Matriz de Pontuação do Transportador (Score de 0 a 1000 pontos)</h2>
        <p>
          O Score Global de Risco avalia a maturidade jurídica, operacional e securitária do parceiro:
        </p>

        <div class="alert-box">
          <strong>FÓRMULA DO SCORE:</strong> Total (1000 pts) = Regularidade Documental (300) + Saúde Financeira (300) + Gestão de Risco & Seguros (200) + Capacidade Operacional (200)
        </div>

        <h3>3.1. Pilar 1: Regularidade Documental & Fiscal (0 a 300 pontos)</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40%;">Documento / Requisito</th>
              <th style="width: 45%;">Regra de Validação & Autenticidade</th>
              <th style="width: 15%; text-align: right;">Pontos</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Registro RNTRC / ANTT Ativo</strong></td><td>Habilitado na base da ANTT para transporte remunerado</td><td style="text-align: right; font-weight: bold; color: #0056D2;">50 pts</td></tr>
            <tr><td><strong>Apólice RCTR-C ou Estipulação LogShare</strong></td><td>Apólice própria ativa ou averbação na Apólice Mestre LogShare</td><td style="text-align: right; font-weight: bold; color: #0056D2;">40 pts</td></tr>
            <tr><td><strong>Apólice RC-DC ou Estipulação LogShare</strong></td><td>Apólice própria ativa ou averbação na Apólice Mestre LogShare</td><td style="text-align: right; font-weight: bold; color: #0056D2;">40 pts</td></tr>
            <tr><td><strong>Cartão CNPJ Atualizado</strong></td><td>Situação ATIVA e regular na Receita Federal do Brasil</td><td style="text-align: right; font-weight: bold; color: #0056D2;">35 pts</td></tr>
            <tr><td><strong>Quitação Seguro & PGR Formalizado</strong></td><td>Comprovante de pagamento da parcela e PGR ativo</td><td style="text-align: right; font-weight: bold; color: #0056D2;">50 pts</td></tr>
            <tr><td><strong>CND Federal + CNDT + CRF FGTS</strong></td><td>Certidões negativas tributárias, trabalhistas e previdenciárias</td><td style="text-align: right; font-weight: bold; color: #0056D2;">55 pts</td></tr>
            <tr><td><strong>Frota CRLV + CNH Toxicológico + Contrato</strong></td><td>Relação veicular em dia, exames toxicológicos e contrato social</td><td style="text-align: right; font-weight: bold; color: #0056D2;">30 pts</td></tr>
          </tbody>
        </table>

        <h3>3.2. Pilar 2: Saúde Financeira & Tempo de Atividade (0 a 300 pontos)</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40%;">Critério</th>
              <th style="width: 45%;">Faixa de Avaliação</th>
              <th style="width: 15%; text-align: right;">Pontos</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Tempo de Fundação do CNPJ</strong></td><td>> 5 anos (100 pts) | 2 a 5 anos (70 pts) | < 2 anos (40 pts)</td><td style="text-align: right; font-weight: bold;">Até 100 pts</td></tr>
            <tr><td><strong>Capital Social Integralizado</strong></td><td>> R$ 500k (100 pts) | R$ 100k a 500k (70 pts) | < R$ 100k (40 pts)</td><td style="text-align: right; font-weight: bold;">Até 100 pts</td></tr>
            <tr><td><strong>Regularidade Fiscal Plena</strong></td><td>100% CNDs Negativas (100 pts) | Com pendência menor (50 pts)</td><td style="text-align: right; font-weight: bold;">Até 100 pts</td></tr>
          </tbody>
        </table>

        <div class="page-break"></div>

        <h3>3.3. Pilar 3: Gestão de Risco, Apólices e PGR (0 a 200 pontos)</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40%;">Critério</th>
              <th style="width: 45%;">Faixa de Avaliação</th>
              <th style="width: 15%; text-align: right;">Pontos</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>LMG por Viagem</strong></td><td>>= R$ 1.000.000,00 ou Estipulada LogShare (100 pts) | R$ 500k (70 pts)</td><td style="text-align: right; font-weight: bold;">Até 100 pts</td></tr>
            <tr><td><strong>Gerenciadora de Risco Homologada</strong></td><td>Buonny, OpenTech, Brasil Risk, AngelLira, Kronos, GoldenSat, etc.</td><td style="text-align: right; font-weight: bold;">50 pts</td></tr>
            <tr><td><strong>PGR Formalizado & Implementado</strong></td><td>Plano ativo com regras de parada, rotas e escolta armada</td><td style="text-align: right; font-weight: bold;">50 pts</td></tr>
          </tbody>
        </table>

        <h3>3.4. Pilar 4: Capacidade Operacional & Rastreamento (0 a 200 pontos)</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40%;">Critério</th>
              <th style="width: 45%;">Faixa de Avaliação</th>
              <th style="width: 15%; text-align: right;">Pontos</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Dimensão da Frota Operacional</strong></td><td>>= 20 veículos (100 pts) | 5 a 19 veículos (70 pts) | 1 a 4 veículos (40 pts)</td><td style="text-align: right; font-weight: bold;">Até 100 pts</td></tr>
            <tr><td><strong>Tecnologias de Rastreamento</strong></td><td>Duplo rastreamento / isca móvel (100 pts) | Telemetria primária (60 pts)</td><td style="text-align: right; font-weight: bold;">Até 100 pts</td></tr>
          </tbody>
        </table>

        <!-- 4. CRITÉRIOS DE CLASSIFICAÇÃO -->
        <h2>4. Critérios de Classificação & Decisão</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 25%;">Status</th>
              <th style="width: 25%;">Score de Risco</th>
              <th style="width: 50%;">Diretriz Operacional & Condicionantes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="tag tag-apta">APTA</span></td>
              <td><strong>>= 800 pontos</strong></td>
              <td>Liberação irrestrita para contratação em toda a malha LogShare.</td>
            </tr>
            <tr>
              <td><span class="tag tag-restricoes">APTA COM RESTRIÇÕES</span></td>
              <td><strong>600 a 799 pontos</strong></td>
              <td>Operação com travas: Teto de carga (R$ 300k-500k), escolta armada para cargas visadas, duplo rastreamento e proibição de redespacho.</td>
            </tr>
            <tr>
              <td><span class="tag tag-nao-apta">NÃO APTA</span></td>
              <td><strong>< 600 pontos ou Dealbreaker</strong></td>
              <td>Bloqueio cadastral na plataforma LogShare até regularização formal.</td>
            </tr>
          </tbody>
        </table>

        <!-- 5. BOAS PRÁTICAS COSMÉTICOS & GRUPO BOTICÁRIO -->
        <h2>5. Boas Práticas de Transporte (RDC 48 / EFfCI / Grupo Boticário)</h2>
        <ul>
          <li><strong>Higiene de Baús (RDC 48 - Item 3.3.5):</strong> Veículos devem ser limpos, secos e isentos de odores, resíduos químicos ou umidade. Proibida contaminação cruzada.</li>
          <li><strong>SSOMA (Diretrizes Grupo Boticário):</strong> Motoristas profissionais com exame toxicológico periódico regular (Lei 13.103/2015) e cumprimento estrito de jornadas de descanso.</li>
          <li><strong>Meio Ambiente:</strong> Comprovação de CTF/IBAMA ativo e controle de emissões/fumaça preta Proconve.</li>
          <li><strong>Responsabilidade Social:</strong> CNDT Trabalhista, CRF FGTS e compromisso formal de combate ao trabalho escravo e infantil.</li>
        </ul>

        <!-- 6. ASSINATURAS E CONTROLE -->
        <div class="footer-sign">
          <div>
            <p><strong>Comitê de Compliance & Qualidade LogShare</strong><br>
            Responsável Técnico de Homologação<br>
            Autenticação Eletrônica: SHA256-HOM-LOGSHARE-2026</p>
          </div>
          <div style="text-align: right;">
            <p><strong>LogShare Tecnologia e Logística Colaborativa</strong><br>
            Documento Emitido em 27/08/2026<br>
            Válido em todo território nacional</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(popHtml);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 450);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LogShareLogo height={32} variant="white" />
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}
            >
              {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handlePrintFullPOP}
              className="btn btn-primary btn-sm"
              style={{ background: '#00D2FF', color: '#0A192F', fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Gerar e Imprimir PDF Completo do POP com todas as tabelas e normas"
            >
              <Printer size={15} />
              <span>Imprimir / Gerar PDF Completo</span>
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
                justifyContent: 'center',
                marginLeft: '0.25rem'
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrintFullPOP}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700 }}
            >
              <Printer size={14} />
              <span>Imprimir PDF Completo</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 600 }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
