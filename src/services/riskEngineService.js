import { ALL_SYSTEM_DOCUMENTS, formatDateBR } from './validityCalculator';

export const RISK_LEVELS = {
  BAIXO: { label: "Baixo Risco", class: "A", minScore: 800, color: "#10b981", badge: "badge-apta" },
  MEDIO: { label: "Médio Risco", class: "B/C", minScore: 600, color: "#f59e0b", badge: "badge-restricoes" },
  ALTO: { label: "Alto Risco / Crítico", class: "D", minScore: 0, color: "#ef4444", badge: "badge-nao-apta" }
};

export const STANDARD_RESTRICTIONS = [
  "Alocação condicionada à análise caso a caso dos requisitos do cliente e valor da carga",
  "Teto de valor de carga fixado em até R$ 300.000,00 por viagem",
  "Rastreamento obrigatório",
  "Obrigatoriedade de validação de licenças sanitárias/ambientais conforme produto transportado (AFE, VISA, IBAMA)",
  "Consulta prévia de motoristas e equipamento na Gerenciadora de Risco (12h)",
  "Exigência de apresentação de comprovante de averbação eletrônica a cada viagem realizada"
];

/**
 * Calculates the Risk Score breakdown (0 to 1000 points) based on carrier information and document audit
 */
/**
 * Calculates the Risk Score breakdown (0 to 1000 points) based on carrier information and document audit
 * Strictly verifies attached documents without granting default points for missing certificates.
 */
export function calculateRiskScore(carrier) {
  let documental = 0;
  let financeiro = 0;
  let gerenciamentoRisco = 0;
  let operacional = 0;

  const docs = carrier.documentos || [];
  const isLogShareInsurance = carrier.gestaoRisco?.estipuladoLogShare || carrier.gestaoRisco?.modeloSeguro === 'LOGSHARE_ESTIPULADO';

  // Helper para checar se documento foi efetivamente anexado e está válido
  const isDocValidAndAttached = (docId) => {
    const d = docs.find(item => item.id === docId);
    if (!d) return false;
    const hasFile = !!(d.arquivoBase64 || d.arquivoNome);
    return hasFile && d.status === "VALIDO";
  };

  // 1. Regularidade Documental & Habilitação (0 - 300 pts)
  // RNTRC ativo e auditado: 60 pts
  if (isDocValidAndAttached("doc_rntrc_antt") || isDocValidAndAttached("doc_rntrc")) {
    documental += 60;
  }

  // Cartão CNPJ auditado: 40 pts
  if (isDocValidAndAttached("doc_cartao_cnpj") || isDocValidAndAttached("doc_cnpj")) {
    documental += 40;
  }

  // Contrato Social Consolidado auditado: 40 pts
  if (isDocValidAndAttached("doc_contrato_social") || isDocValidAndAttached("doc_contrato")) {
    documental += 40;
  }

  // CND Federal / PGFN auditada: 35 pts
  if (isDocValidAndAttached("doc_cnd_federal")) {
    documental += 35;
  }

  // CNDT Trabalhista auditada: 30 pts
  if (isDocValidAndAttached("doc_cndt_trabalhista") || isDocValidAndAttached("doc_cndt")) {
    documental += 30;
  }

  // CRF FGTS auditado: 25 pts
  if (isDocValidAndAttached("doc_crf_fgts") || isDocValidAndAttached("doc_fgts")) {
    documental += 25;
  }

  // CNDs Estadual e Municipal auditadas: 30 pts (15 cada)
  if (isDocValidAndAttached("doc_cnd_estadual")) documental += 15;
  if (isDocValidAndAttached("doc_cnd_municipal")) documental += 15;

  // Seguros no Documental: só pontua se apólice própria for válida OU se escolheu LogShare com cadastro validado
  if (isLogShareInsurance) {
    documental += 40; // Pontuação pelo modelo LogShare garantido
  } else {
    if (isDocValidAndAttached("doc_apolice_rctrc") || isDocValidAndAttached("doc_rctrc")) documental += 20;
    if (isDocValidAndAttached("doc_apolice_rcdc") || isDocValidAndAttached("doc_rcdc")) documental += 20;
  }

  documental = Math.min(300, documental);

  // 2. Saúde Financeira, Fiscal & Tempo de Mercado (0 - 250 pts)
  // Tempo de Atividade (0 - 80 pts)
  if (carrier.aberturaCNPJ) {
    const anos = 2026 - new Date(carrier.aberturaCNPJ).getFullYear();
    if (anos >= 5) financeiro += 80;
    else if (anos >= 2) financeiro += 50;
    else if (anos >= 1) financeiro += 30;
  }

  // Capital Social Registrado (0 - 80 pts)
  const capital = carrier.capitalSocial || 0;
  if (capital >= 500000) financeiro += 80;
  else if (capital >= 100000) financeiro += 50;
  else if (capital >= 30000) financeiro += 30;

  // Regularidade Fiscal Plena comprovada por certidões anexadas (0 - 90 pts)
  const hasCndFed = isDocValidAndAttached("doc_cnd_federal");
  const hasCndt = isDocValidAndAttached("doc_cndt_trabalhista") || isDocValidAndAttached("doc_cndt");
  const hasFgts = isDocValidAndAttached("doc_crf_fgts") || isDocValidAndAttached("doc_fgts");
  
  if (hasCndFed && hasCndt && hasFgts) {
    financeiro += 90;
  } else if (hasCndFed || hasCndt || hasFgts) {
    financeiro += 30;
  }
  // Se nenhuma CND foi anexada, ganha 0 pontos fiscais (sem pontuação presumida)

  financeiro = Math.min(250, financeiro);

  // 3. Gerenciamento de Risco, PGR & Coberturas (0 - 250 pts)
  // Cobertura Securitária (LMG ou Estipulação LogShare): 0 - 120 pts
  const lmg = carrier.gestaoRisco?.lmg || 0;
  if (isLogShareInsurance) {
    gerenciamentoRisco += 120;
  } else if (lmg >= 1000000 && isDocValidAndAttached("doc_apolice_rctrc")) {
    gerenciamentoRisco += 120;
  } else if (lmg >= 500000 && isDocValidAndAttached("doc_apolice_rctrc")) {
    gerenciamentoRisco += 80;
  } else if (lmg >= 200000 && isDocValidAndAttached("doc_apolice_rctrc")) {
    gerenciamentoRisco += 40;
  }

  // Gerenciadora de Risco homologada (0 - 70 pts)
  const grNome = carrier.gestaoRisco?.gerenciadoraRisco;
  if (grNome && grNome !== "Nenhuma" && grNome !== "Nenhuma cadastrada") {
    gerenciamentoRisco += 70;
  }

  // PGR - Plano de Gerenciamento de Risco (0 - 60 pts)
  if (isLogShareInsurance || isDocValidAndAttached("doc_pgr_gerenciamento_risco") || isDocValidAndAttached("doc_pgr_risco") || isDocValidAndAttached("doc_pgr")) {
    gerenciamentoRisco += 60;
  }

  gerenciamentoRisco = Math.min(250, gerenciamentoRisco);

  // 4. Capacidade Operacional, Frota & Telemetria (0 - 200 pts)
  // Frota Operacional (0 - 100 pts)
  const totalFrota = (carrier.perfilOperacional?.frotaPropria || 0) + (carrier.perfilOperacional?.frotaAgregada || 0);
  if (totalFrota >= 20) operacional += 100;
  else if (totalFrota >= 5) operacional += 70;
  else if (totalFrota >= 1) operacional += 40;

  // Tecnologias de Rastreamento & Telemetria (0 - 100 pts)
  const tecnologias = carrier.perfilOperacional?.tecnologiaRastreamento || [];
  if (tecnologias.length >= 2 || tecnologias.some(t => t.toLowerCase().includes('duplo') || t.toLowerCase().includes('isca'))) {
    operacional += 100;
  } else if (tecnologias.length === 1) {
    operacional += 60;
  }

  operacional = Math.min(200, operacional);

  const scoreTotal = documental + financeiro + gerenciamentoRisco + operacional;

  return {
    scoreTotal,
    breakdown: {
      documental,
      financeiro,
      gerenciamentoRisco,
      operacional
    }
  };
}

/**
 * Evaluates carrier status and compliance against strict mandatory document requirements
 * If ANY mandatory document is missing (not attached) or invalid/expired, status is strictly NAO_APTA.
 */
export function evaluateCarrier(carrier) {
  const { scoreTotal, breakdown } = calculateRiskScore(carrier);
  const isLogShareInsurance = carrier.gestaoRisco?.estipuladoLogShare || carrier.gestaoRisco?.modeloSeguro === 'LOGSHARE_ESTIPULADO';

  const availableSystemDocs = isLogShareInsurance 
    ? ALL_SYSTEM_DOCUMENTS.filter(d => d.categoryId !== "cat_seguros_pgr")
    : ALL_SYSTEM_DOCUMENTS;

  const mandatorySystemDocs = availableSystemDocs.filter(d => d.obrigatorio);

  // Verifica se QUALQUER documento obrigatório do checklist do sistema não foi anexado ou não está VALIDO
  const missingOrInvalidMandatoryDocs = mandatorySystemDocs.filter(m => {
    const uploaded = (carrier.documentos || []).find(d => d.id === m.id);
    if (!uploaded) return true; // Nunca anexado no portal!
    const hasFile = !!(uploaded.arquivoBase64 || uploaded.arquivoNome);
    if (!hasFile) return true; // Sem arquivo anexo real!
    return uploaded.status !== "VALIDO"; // Pendente ou Irregular!
  });

  const hasMissingOrExpiredMandatory = missingOrInvalidMandatoryDocs.length > 0;

  let suggestedStatus = "APTA";
  let riskLevel = RISK_LEVELS.BAIXO;

  if (hasMissingOrExpiredMandatory || scoreTotal < 600) {
    suggestedStatus = "NAO_APTA";
    riskLevel = RISK_LEVELS.ALTO;
  } else if (scoreTotal < 800) {
    suggestedStatus = "APTA_COM_RESTRICOES";
    riskLevel = RISK_LEVELS.MEDIO;
  } else {
    suggestedStatus = "APTA";
    riskLevel = RISK_LEVELS.BAIXO;
  }

  return {
    scoreTotal,
    breakdown,
    suggestedStatus,
    riskLevel,
    hasCriticalFailure: hasMissingOrExpiredMandatory,
    hasMissingOrExpiredMandatory,
    missingOrInvalidMandatoryDocs
  };
}

/**
 * Generates an executive summary tailored to the analysis results
 */
export function generateExecutiveSummary(carrier, status, score) {
  const tempoAtividade = carrier.aberturaCNPJ ? `${2026 - new Date(carrier.aberturaCNPJ).getFullYear()} anos` : "tempo consolidado";
  const frotaTotal = (carrier.perfilOperacional?.frotaPropria || 0) + (carrier.perfilOperacional?.frotaAgregada || 0);
  const grName = carrier.gestaoRisco?.gerenciadoraRisco || "Gerenciadora de Risco";
  const lmgFormatted = carrier.gestaoRisco?.lmg ? `R$ ${carrier.gestaoRisco.lmg.toLocaleString('pt-BR')}` : "Não informado";

  if (status === "APTA") {
    return `Transportadora ${carrier.razaoSocial} apresenta histórico operacional sólido com ${tempoAtividade} de constituição. Estrutura documental 100% em conformidade com as diretrizes regulatórias da ANTT e Receita Federal. Apólices de seguro RCTR-C e RC-DC válidas com Limite Máximo de Garantia (LMG) de ${lmgFormatted}. Gestão de risco integrada via ${grName}, frota com ${frotaTotal} veículos monitorados e score global de ${score}/1000 pontos. Homologação Apta com liberação irrestrita para operações na LogShare.`;
  }

  if (status === "APTA_COM_RESTRICOES") {
    return `Transportadora ${carrier.razaoSocial} avaliada com score intermediário (${score}/1000 pontos) e nível de risco moderado. Todos os documentos obrigatórios encontram-se válidos e regulares, com liberação operacional aprovada sob travas de segurança (Teto de carga de R$ 300k por viagem e Rastreamento obrigatório). DIRETRIZ DE ALOCAÇÃO: Os casos com restrições serão analisados e validados caso a caso pela LogShare, a depender das exigências específicas do cliente/embarcador em questão, das licenças regulatórias necessárias para a rota/produto (ex: AFE, VISA, IBAMA) e do valor específico da carga.`;
  }

  return `Após auditoria técnica de homologação, a transportadora ${carrier.razaoSocial} foi classificada como NÃO APTA (Score ${score}/1000 pontos). Foram identificados documentos obrigatórios faltantes/vencidos ou impeditivos regulatórios críticos. Conforme política de compliance, qualquer documento obrigatório pendente ou vencido impede a operação na plataforma até regularização formal.`;
}

/**
 * Generates automated required actions based on document statuses and operational restrictions
 */
export function generateRequiredActions(carrier, status) {
  const docs = carrier.documentos || [];
  const isLogShareInsurance = carrier.gestaoRisco?.estipuladoLogShare || carrier.gestaoRisco?.modeloSeguro === 'LOGSHARE_ESTIPULADO';

  const availableSystemDocs = isLogShareInsurance 
    ? ALL_SYSTEM_DOCUMENTS.filter(d => d.categoryId !== "cat_seguros_pgr")
    : ALL_SYSTEM_DOCUMENTS;

  const mandatoryDocs = availableSystemDocs.filter(d => d.obrigatorio);

  // 1. Documentos obrigatórios não enviados
  const missingMandatoryDocs = mandatoryDocs.filter(m => {
    const uploaded = docs.find(d => d.id === m.id);
    return !uploaded || (!uploaded.arquivoBase64 && !uploaded.arquivoNome);
  });

  // 2. Documentos vencidos ou irregulares
  const expiredDocs = docs.filter(d => {
    return d.status === "IRREGULAR" || d.status === "PENDENTE";
  });

  const actions = [];

  if (missingMandatoryDocs.length > 0) {
    actions.push(`--- DOCUMENTOS OBRIGATÓRIOS NÃO ENVIADOS (PENDÊNCIAS IMPEDITIVAS) ---`);
    missingMandatoryDocs.forEach((m, idx) => {
      actions.push(`${idx + 1}. Anexar: ${m.nome} (Exigência: ${m.hint || 'Documento obrigatório de compliance fiscal/regulatório'}).`);
    });
  }

  if (expiredDocs.length > 0) {
    if (actions.length > 0) actions.push('');
    actions.push(`--- DOCUMENTOS VENCIDOS OU IRREGULARES ---`);
    expiredDocs.forEach((d, idx) => {
      actions.push(`${idx + 1}. Atualizar e reenviar: ${d.nome} (Situação: ${d.status} • Vigência: ${formatDateBR(d.vigencia) || 'Vencida'}).`);
    });
  }

  if (status === "APTA_COM_RESTRICOES") {
    if (actions.length > 0) actions.push('');
    actions.push(`--- CONDICIONANTES & RESTRIÇÕES OPERACIONAIS APLICADAS ---`);
    actions.push(`1. Limite operacional: Teto de carga de R$ 300.000,00 por viagem.`);
    actions.push(`2. Rastreamento obrigatório: Telemetria ativa em todas as viagens com averbação eletrônica.`);
    actions.push(`3. Gerenciamento de risco: Consulta prévia obrigatória de motoristas e equipamentos (12h antes do carregamento).`);
    actions.push(`4. Diretriz LogShare: Alocação condicionada à validação caso a caso com base nas exigências do cliente e licenças sanitárias/ambientais.`);
  }

  if (actions.length === 0) {
    return "Nenhuma pendência documental ou ação corretiva necessária. Manter a vigência das apólices e certidões em dia para renovação anual contínua.";
  }

  return actions.join("\n");
}
