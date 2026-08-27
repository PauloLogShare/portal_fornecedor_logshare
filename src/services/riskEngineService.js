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
  "Teto de valor de carga fixado em até R$ 300.000,00 por viagem",
  "Teto de valor de carga fixado em até R$ 500.000,00 por viagem",
  "Obrigatoriedade de escolta armada em viagens com cargas visadas (eletrônicos/medicamentos)",
  "Obrigatoriedade de duplo rastreamento (telemetria primária + redundância móvel/isca)",
  "Proibição estrita de subcontratação ou redespacho sem prévia anuência da LogShare",
  "Exclusividade para transporte de cargas secas e não perigosas",
  "Obrigatoriedade de liberação de motoristas na Gerenciadora de Risco com antecedência mínima de 4h",
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

  // 1. Regularidade Documental (0 - 300 pts)
  const docs = carrier.documentos || [];
  const cnpjDoc = docs.find(d => d.id === "doc_cartao_cnpj" || d.id === "doc_cnpj");
  const rntrcDoc = docs.find(d => d.id === "doc_rntrc_antt" || d.id === "doc_rntrc");
  const rctrcDoc = docs.find(d => d.id === "doc_apolice_rctrc" || d.id === "doc_rctrc");
  const rcdcDoc = docs.find(d => d.id === "doc_apolice_rcdc" || d.id === "doc_rcdc");
  const cndDoc = docs.find(d => d.id === "doc_cnd_federal");
  const cndtDoc = docs.find(d => d.id === "doc_cndt_trabalhista" || d.id === "doc_cndt");
  const fgtsDoc = docs.find(d => d.id === "doc_crf_fgts" || d.id === "doc_fgts");
  const contratoDoc = docs.find(d => d.id === "doc_contrato_social" || d.id === "doc_contrato");
  const bancarioDoc = docs.find(d => d.id === "doc_dados_bancarios" || d.id === "doc_bancario");
  const compSeguroDoc = docs.find(d => d.id === "doc_comprovante_pagamento_seguro");
  const pgrDoc = docs.find(d => d.id === "doc_pgr_risco" || d.id === "doc_pgr");
  const frotaDoc = docs.find(d => d.id === "doc_relacao_frota_crlv");
  const cnhDoc = docs.find(d => d.id === "doc_cnh_toxicologico");

  const isLogShareInsurance = carrier.gestaoRisco?.estipuladoLogShare || carrier.gestaoRisco?.modeloSeguro === 'LOGSHARE_ESTIPULADO';

  if (cnpjDoc?.status === "VALIDO") documental += 35;
  if (rntrcDoc?.status === "VALIDO") documental += 50;
  
  if (isLogShareInsurance) {
    documental += 80; // Full insurance points covered by LogShare Master Policy
  } else {
    if (rctrcDoc?.status === "VALIDO") documental += 40;
    if (rcdcDoc?.status === "VALIDO") documental += 40;
  }

  if (compSeguroDoc?.status === "VALIDO" || isLogShareInsurance) documental += 25;
  if (pgrDoc?.status === "VALIDO") documental += 25;
  if (cndDoc?.status === "VALIDO") documental += 20;
  if (cndtDoc?.status === "VALIDO") documental += 20;
  if (fgtsDoc?.status === "VALIDO") documental += 15;
  if (contratoDoc?.status === "VALIDO") documental += 10;
  if (frotaDoc?.status === "VALIDO") documental += 10;
  if (cnhDoc?.status === "VALIDO") documental += 10;

  // 2. Saúde Financeira & Tempo de Atividade (0 - 300 pts)
  if (carrier.aberturaCNPJ) {
    const anoAbertura = new Date(carrier.aberturaCNPJ).getFullYear();
    const anosAtividade = 2026 - anoAbertura;
    if (anosAtividade >= 8) financeiro += 110;
    else if (anosAtividade >= 4) financeiro += 80;
    else if (anosAtividade >= 2) financeiro += 50;
    else financeiro += 20; // Menos de 2 anos
  } else {
    financeiro += 50;
  }

  // Pontualidade bancária e regularidade fiscal
  if (cndDoc?.status === "VALIDO" && fgtsDoc?.status === "VALIDO") {
    financeiro += 100;
  } else if (cndDoc?.status === "VALIDO" || fgtsDoc?.status === "VALIDO") {
    financeiro += 50;
  }

  if (bancarioDoc?.status === "VALIDO") {
    financeiro += 90;
  }

  // 3. Gerenciamento de Risco & Seguros (0 - 250 pts)
  const gr = carrier.gestaoRisco || {};
  if (gr.temPGR) gerenciamentoRisco += 70;
  if (gr.gerenciadoraRisco && gr.gerenciadoraRisco !== "Nenhuma cadastrada") gerenciamentoRisco += 80;
  
  if (gr.lmg >= 1000000) {
    gerenciamentoRisco += 100;
  } else if (gr.lmg >= 500000) {
    gerenciamentoRisco += 70;
  } else if (gr.lmg >= 200000) {
    gerenciamentoRisco += 40;
  } else if (gr.lmg > 0) {
    gerenciamentoRisco += 20;
  }

  // 4. Capacidade Operacional & Frota (0 - 150 pts)
  const po = carrier.perfilOperacional || {};
  const totalFrota = (po.frotaPropria || 0) + (po.frotaAgregada || 0);
  if (totalFrota >= 50) operacional += 60;
  else if (totalFrota >= 20) operacional += 45;
  else if (totalFrota >= 5) operacional += 30;
  else if (totalFrota >= 1) operacional += 15;

  const rastreadores = po.tecnologiaRastreamento || [];
  if (rastreadores.some(r => r.includes("Autotrac") || r.includes("Sascar") || r.includes("Omnilink") || r.includes("OnixSat"))) {
    operacional += 50;
  } else if (rastreadores.length > 0) {
    operacional += 25;
  }

  const sensores = po.sensoresSeguranca || [];
  if (sensores.length >= 3) operacional += 40;
  else if (sensores.length >= 1) operacional += 20;

  // Cap totals
  documental = Math.min(300, Math.max(0, documental));
  financeiro = Math.min(300, Math.max(0, financeiro));
  gerenciamentoRisco = Math.min(250, Math.max(0, gerenciamentoRisco));
  operacional = Math.min(150, Math.max(0, operacional));

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
 * Evaluates the carrier and provides automatic recommendation
 */
export function evaluateCarrier(carrier) {
  const { scoreTotal, breakdown } = calculateRiskScore(carrier);
  const docs = carrier.documentos || [];
  
  const rntrcDoc = docs.find(d => d.id === "doc_rntrc_antt" || d.id === "doc_rntrc");
  const rctrcDoc = docs.find(d => d.id === "doc_apolice_rctrc" || d.id === "doc_rctrc");
  const rcdcDoc = docs.find(d => d.id === "doc_apolice_rcdc" || d.id === "doc_rcdc");
  const cnpjDoc = docs.find(d => d.id === "doc_cartao_cnpj" || d.id === "doc_cnpj");

  const isLogShareInsurance = carrier.gestaoRisco?.estipuladoLogShare || carrier.gestaoRisco?.modeloSeguro === 'LOGSHARE_ESTIPULADO';

  // Critical deal breakers (Only RNTRC and CNPJ are mandatory absolute dealbreakers; insurance is covered by LogShare if estipulado)
  const hasCriticalFailure = 
    rntrcDoc?.status === "IRREGULAR" || 
    cnpjDoc?.status === "IRREGULAR" ||
    (!isLogShareInsurance && (rctrcDoc?.status === "IRREGULAR" || rcdcDoc?.status === "IRREGULAR"));

  let suggestedStatus = "APTA";
  let riskLevel = RISK_LEVELS.BAIXO;

  if (hasCriticalFailure || scoreTotal < 600) {
    suggestedStatus = "NAO_APTA";
    riskLevel = RISK_LEVELS.ALTO;
  } else if (scoreTotal < 800 || docs.some(d => d.status === "PENDENTE" && d.obrigatorio)) {
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
    hasCriticalFailure
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
    return `Transportadora ${carrier.razaoSocial} avaliada com score intermediário (${score}/1000 pontos) e nível de risco moderado. A empresa possui RNTRC e seguros vigentes, contudo foram identificadas pendências documentais parciais ou limites de apólice (${lmgFormatted}) que exigem condicionamento operacional preventivo. Liberação condicionada ao estrito cumprimento das restrições e prazos de regularização fixados neste parecer.`;
  }

  return `Após análise minuciosa pelo time de Homologação e Compliance LogShare, a transportadora ${carrier.razaoSocial} foi classificada como NÃO APTA (Score ${score}/1000 pontos). Identificadas não conformidades críticas de ordem regulatória, ausência/irregularidade em seguros obrigatórios (RCTR-C/RC-DC) ou pendências impeditivas em gerenciamento de risco. Operação suspensa/bloqueada na plataforma até integral saneamento dos itens apontados.`;
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
