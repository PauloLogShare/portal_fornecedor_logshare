/**
 * Risk Engine & Homologation Analysis Service - LogShare
 * Implements rigorous transportation compliance rules & risk scoring (0-1000)
 */

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
export function calculateRiskScore(carrier) {
  let documental = 0;
  let financeiro = 0;
  let gerenciamentoRisco = 0;
  let operacional = 0;

  const docs = carrier.documentos || [];
  const isLogShareInsurance = carrier.gestaoRisco?.estipuladoLogShare || carrier.gestaoRisco?.modeloSeguro === 'LOGSHARE_ESTIPULADO';

  // 1. Regularidade Documental & Fiscal (0 - 300 pts)
  const rntrcDoc = docs.find(d => d.id === "doc_rntrc_antt" || d.id === "doc_rntrc");
  if (rntrcDoc?.status === "VALIDO") documental += 50;

  const rctrcDoc = docs.find(d => d.id === "doc_apolice_rctrc" || d.id === "doc_rctrc");
  if (rctrcDoc?.status === "VALIDO" || isLogShareInsurance) documental += 40;

  const rcdcDoc = docs.find(d => d.id === "doc_apolice_rcdc" || d.id === "doc_rcdc");
  if (rcdcDoc?.status === "VALIDO" || isLogShareInsurance) documental += 40;

  const cnpjDoc = docs.find(d => d.id === "doc_cartao_cnpj" || d.id === "doc_cnpj");
  if (cnpjDoc?.status === "VALIDO") documental += 35;

  const quitacaoDoc = docs.find(d => d.id === "doc_quitacao_seguro" || d.id === "doc_comprovante_pagamento_seguro");
  if (quitacaoDoc?.status === "VALIDO" || isLogShareInsurance) documental += 25;

  const pgrDoc = docs.find(d => d.id === "doc_pgr_gerenciamento_risco" || d.id === "doc_pgr");
  if (pgrDoc?.status === "VALIDO") documental += 25;

  const cndFederalDoc = docs.find(d => d.id === "doc_cnd_federal");
  if (cndFederalDoc?.status === "VALIDO") documental += 20;

  const cndtDoc = docs.find(d => d.id === "doc_cndt_trabalhista" || d.id === "doc_cndt");
  if (cndtDoc?.status === "VALIDO") documental += 20;

  const crfDoc = docs.find(d => d.id === "doc_crf_fgts" || d.id === "doc_fgts");
  if (crfDoc?.status === "VALIDO") documental += 15;

  const contratoDoc = docs.find(d => d.id === "doc_contrato_social" || d.id === "doc_contrato");
  if (contratoDoc?.status === "VALIDO") documental += 10;

  const frotaDoc = docs.find(d => d.id === "doc_relacao_frota_crlv");
  if (frotaDoc?.status === "VALIDO") documental += 10;

  const cnhDoc = docs.find(d => d.id === "doc_cnh_motoristas_toxicol" || d.id === "doc_cnh_toxicologico");
  if (cnhDoc?.status === "VALIDO") documental += 10;

  documental = Math.min(300, documental);

  // 2. Saúde Financeira & Tempo de Atividade (0 - 300 pts)
  if (carrier.aberturaCNPJ) {
    const anos = 2026 - new Date(carrier.aberturaCNPJ).getFullYear();
    if (anos >= 5) financeiro += 100;
    else if (anos >= 2) financeiro += 70;
    else financeiro += 40;
  } else {
    financeiro += 50;
  }

  const capital = carrier.capitalSocial || 0;
  if (capital >= 500000) financeiro += 100;
  else if (capital >= 100000) financeiro += 70;
  else financeiro += 40;

  const fiscalNegativa = (cndFederalDoc?.status === "VALIDO") && (cndtDoc?.status === "VALIDO") && (crfDoc?.status === "VALIDO");
  if (fiscalNegativa) financeiro += 100;
  else financeiro += 50;

  financeiro = Math.min(300, financeiro);

  // 3. Gestão de Risco & Seguros (0 - 200 pts)
  const lmg = carrier.gestaoRisco?.lmg || 0;
  if (isLogShareInsurance || lmg >= 1000000) gerenciamentoRisco += 100;
  else if (lmg >= 500000) gerenciamentoRisco += 70;
  else if (lmg >= 200000) gerenciamentoRisco += 40;

  if (carrier.gestaoRisco?.gerenciadoraRisco && carrier.gestaoRisco.gerenciadoraRisco !== "Nenhuma" && carrier.gestaoRisco.gerenciadoraRisco !== "Nenhuma cadastrada") {
    gerenciamentoRisco += 50;
  }

  if (carrier.gestaoRisco?.pgrProprio || pgrDoc?.status === "VALIDO") {
    gerenciamentoRisco += 50;
  }

  gerenciamentoRisco = Math.min(200, gerenciamentoRisco);

  // 4. Capacidade Operacional & Rastreamento (0 - 200 pts)
  const totalFrota = (carrier.perfilOperacional?.frotaPropria || 0) + (carrier.perfilOperacional?.frotaAgregada || 0);
  if (totalFrota >= 20) operacional += 100;
  else if (totalFrota >= 5) operacional += 70;
  else if (totalFrota >= 1) operacional += 40;

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
 */
export function evaluateCarrier(carrier) {
  const { scoreTotal, breakdown } = calculateRiskScore(carrier);
  const docs = carrier.documentos || [];
  
  const rntrcDoc = docs.find(d => d.id === "doc_rntrc_antt" || d.id === "doc_rntrc");
  const rctrcDoc = docs.find(d => d.id === "doc_apolice_rctrc" || d.id === "doc_rctrc");
  const rcdcDoc = docs.find(d => d.id === "doc_apolice_rcdc" || d.id === "doc_rcdc");
  const cnpjDoc = docs.find(d => d.id === "doc_cartao_cnpj" || d.id === "doc_cnpj");

  const isLogShareInsurance = carrier.gestaoRisco?.estipuladoLogShare || carrier.gestaoRisco?.modeloSeguro === 'LOGSHARE_ESTIPULADO';

  // Critical deal breakers
  const hasCriticalFailure = 
    rntrcDoc?.status === "IRREGULAR" || 
    cnpjDoc?.status === "IRREGULAR" ||
    (!isLogShareInsurance && (rctrcDoc?.status === "IRREGULAR" || rcdcDoc?.status === "IRREGULAR"));

  // REGRA ESTRITA: Na versão APTA COM RESTRIÇÕES NÃO poderá conter nenhum documento obrigatório vencido ou faltando!
  // Se houver qualquer documento obrigatório faltando ou vencido/irregular/pendente -> NÃO APTA
  const hasMissingOrExpiredMandatory = docs.some(d => {
    const isMandatory = d.obrigatorio;
    if (!isMandatory) return false;

    // Se o seguro for estipulado pela LogShare, apólices próprias não bloqueiam
    if (isLogShareInsurance && (d.id === "doc_apolice_rctrc" || d.id === "doc_apolice_rcdc" || d.id === "doc_quitacao_seguro")) {
      return false;
    }

    // Documento obrigatório faltando (sem anexo) ou não válido (pendente / irregular)
    const isMissing = !d.arquivoBase64 && !d.arquivoNome;
    const isNotValid = d.status === "IRREGULAR" || d.status === "PENDENTE";
    return isMissing || isNotValid;
  });

  let suggestedStatus = "APTA";
  let riskLevel = RISK_LEVELS.BAIXO;

  if (hasCriticalFailure || hasMissingOrExpiredMandatory || scoreTotal < 600) {
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
    hasCriticalFailure,
    hasMissingOrExpiredMandatory
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
 * Generates automated required actions based on document statuses
 */
export function generateRequiredActions(carrier, status) {
  const docs = carrier.documentos || [];
  const pendencias = docs.filter(d => d.status === "PENDENTE" || d.status === "IRREGULAR");

  if (status === "APTA") {
    return "Nenhuma ação corretiva necessária. Manter vigência e averbação das apólices em dia para renovação anual.";
  }

  const actions = [];
  pendencias.forEach((d, idx) => {
    actions.push(`${idx + 1}. Regularizar e reenviar: ${d.nome} (Motivo: Situação ${d.status === "PENDENTE" ? "Pendente de apresentação/atualização" : "Irregular ou Vencida"}).`);
  });

  if (carrier.gestaoRisco?.lmg < 500000 && status === "APTA_COM_RESTRICOES") {
    actions.push(`${actions.length + 1}. Caso pretenda operar com cargas de maior valor agregado, apresentar endosso de apólice com expansão de LMG para no mínimo R$ 500.000,00.`);
  }

  return actions.join("\n");
}
