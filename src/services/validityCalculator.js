/**
 * Traffic Light Validity Engine (Semáforo de Vigências) & Master Document Registry
 * Official Document Requirements based on LogShare Homologation Standard:
 * 1. Documentação Societária e Fiscal
 * 2. Habilitação Regulatória de Transporte
 * 3. ANVISA e Vigilância Sanitária
 * 4. Seguros e Gerenciamento de Risco
 * 5. Frota e Motoristas
 */

export const OFFICIAL_DOCUMENT_CATEGORIES = [
  {
    id: "cat_societaria_fiscal",
    number: 1,
    title: "1. DOCUMENTAÇÃO SOCIETÁRIA E FISCAL",
    shortTitle: "Societária e Fiscal",
    description: "Atos constitutivos, cadastros tributários e certidões negativas fiscais/trabalhistas.",
    badgeColor: "#0056D2",
    badgeBg: "#EFF6FF"
  },
  {
    id: "cat_regulatoria",
    number: 2,
    title: "2. HABILITAÇÃO REGULATÓRIA DE TRANSPORTE",
    shortTitle: "Habilitação Regulatória",
    description: "Registros na ANTT, licenças de operação e cadastros ambientais.",
    badgeColor: "#0D9488",
    badgeBg: "#F0FDFA"
  },
  {
    id: "cat_anvisa",
    number: 3,
    title: "3. ANVISA E VIGILÂNCIA SANITÁRIA",
    shortTitle: "ANVISA & Vigilância",
    description: "Autorizações e licenças sanitárias para medicamentos, cosméticos, saneantes ou alimentos.",
    badgeColor: "#7C3AED",
    badgeBg: "#F5F3FF"
  },
  {
    id: "cat_seguros_pgr",
    number: 4,
    title: "4. SEGUROS E GERENCIAMENTO DE RISCO",
    shortTitle: "Seguros Requeridos & PGR",
    description: "Apólices requeridas de RCTR-C / RC-DC (ou operação sob apólice estipulada LogShare), quitação e PGR.",
    badgeColor: "#0284C7",
    badgeBg: "#F0F9FF"
  },
  {
    id: "cat_frota_motoristas",
    number: 5,
    title: "5. FROTA E MOTORISTAS",
    shortTitle: "Frota e Condutores",
    description: "Relação de veículos com CRLV vigente e condutores com CNH e toxicológico regular.",
    badgeColor: "#D97706",
    badgeBg: "#FFFBEB"
  }
];

// All 24 Official Documents for Carrier Homologation
export const ALL_SYSTEM_DOCUMENTS = [
  // =========================================================================
  // 1. DOCUMENTAÇÃO SOCIETÁRIA E FISCAL
  // =========================================================================
  {
    id: "doc_contrato_social",
    categoryId: "cat_societaria_fiscal",
    nome: "Contrato Social / Estatuto e última alteração consolidada",
    shortName: "Contrato Social Consolidado",
    obrigatorio: true,
    hint: "Última alteração consolidada registrada na Junta Comercial."
  },
  {
    id: "doc_cartao_cnpj",
    categoryId: "cat_societaria_fiscal",
    nome: "Cartão CNPJ atualizado",
    shortName: "Cartão CNPJ",
    obrigatorio: true,
    hint: "Comprovante de Inscrição e Situação Cadastral na Receita Federal."
  },
  {
    id: "doc_inscricao_estadual_municipal",
    categoryId: "cat_societaria_fiscal",
    nome: "Inscrição Estadual e/ou Municipal",
    shortName: "Inscrição Estadual/Municipal",
    obrigatorio: true,
    hint: "Comprovante de cadastro no SEFAZ Estadual / Prefeitura Municipal."
  },
  {
    id: "doc_cnd_federal",
    categoryId: "cat_societaria_fiscal",
    nome: "Certidão Negativa de Débitos Federais (CND – Receita/PGFN)",
    shortName: "CND Federal / PGFN",
    obrigatorio: true,
    hint: "Certidão Conjunta Negativa de Tributos Federais e Dívida Ativa da União."
  },
  {
    id: "doc_crf_fgts",
    categoryId: "cat_societaria_fiscal",
    nome: "Certificado de Regularidade do FGTS (CRF)",
    shortName: "CRF FGTS",
    obrigatorio: true,
    hint: "Certificado de Regularidade emitido pela Caixa Econômica Federal."
  },
  {
    id: "doc_cndt_trabalhista",
    categoryId: "cat_societaria_fiscal",
    nome: "Certidão Negativa de Débitos Trabalhistas (CNDT)",
    shortName: "CNDT Trabalhista",
    obrigatorio: true,
    hint: "Certidão emitida pelo Tribunal Superior do Trabalho (TST)."
  },
  {
    id: "doc_cnd_estadual",
    categoryId: "cat_societaria_fiscal",
    nome: "Certidão Negativa de Débitos Tributários Estaduais (ICMS / SEFAZ)",
    shortName: "CND Estadual (ICMS / SEFAZ)",
    obrigatorio: true,
    hint: "Certidão de regularidade fiscal emitida pela Secretaria da Fazenda Estadual (SEFAZ)."
  },
  {
    id: "doc_cnd_municipal",
    categoryId: "cat_societaria_fiscal",
    nome: "Certidão Negativa de Débitos Tributários Municipais (ISS / Prefeitura)",
    shortName: "CND Municipal (ISS / Prefeitura)",
    obrigatorio: true,
    hint: "Certidão de regularidade fiscal emitida pela Prefeitura Municipal sede da transportadora."
  },
  {
    id: "doc_dados_bancarios",
    categoryId: "cat_societaria_fiscal",
    nome: "Dados bancários em nome da empresa (comprovante de domicílio bancário)",
    shortName: "Comprovante Domicílio Bancário",
    obrigatorio: true,
    hint: "Extrato bancário, cabeçalho de conta ou declaração bancária com CNPJ da transportadora."
  },

  // =========================================================================
  // 2. HABILITAÇÃO REGULATÓRIA DE TRANSPORTE
  // =========================================================================
  {
    id: "doc_rntrc_antt",
    categoryId: "cat_regulatoria",
    nome: "Registro RNTRC / ANTT ativo",
    shortName: "RNTRC / ANTT Ativo",
    obrigatorio: true,
    hint: "Certificado de Registro Nacional de Transportadores Rodoviários de Cargas na ANTT."
  },
  {
    id: "doc_antt_produtos_perigosos",
    categoryId: "cat_regulatoria",
    nome: "Certificado de registro ANTT para transporte de produtos perigosos",
    shortName: "ANTT Produtos Perigosos",
    obrigatorio: false,
    condicionalText: "Obrigatório se transportar cargas químicas, perigosas ou inflamáveis",
    hint: "Certificado de transporte de produtos perigosos / homologação ambiental."
  },
  {
    id: "doc_ctf_ibama",
    categoryId: "cat_regulatoria",
    nome: "Certificado de Registro no CTF/IBAMA (Cadastro Técnico Federal)",
    shortName: "CTF / IBAMA",
    obrigatorio: false,
    condicionalText: "Obrigatório para atividades com controle ambiental",
    hint: "Comprovante de Regularidade no Cadastro Técnico Federal do IBAMA."
  },
  {
    id: "doc_alvara_funcionamento",
    categoryId: "cat_regulatoria",
    nome: "Licença/alvará de funcionamento da sede e filiais",
    shortName: "Alvará de Funcionamento / AVCB",
    obrigatorio: true,
    hint: "Alvará de Funcionamento da Prefeitura e Atestado de Vistoria do Corpo de Bombeiros (AVCB)."
  },

  // =========================================================================
  // 3. ANVISA E VIGILÂNCIA SANITÁRIA (RDC 48 / ISO 22716 / EFfCI)
  // =========================================================================
  {
    id: "doc_afe_anvisa",
    categoryId: "cat_anvisa",
    nome: "AFE – Autorização de Funcionamento (ANVISA) para transporte de medicamentos, cosméticos, saneantes e/ou alimentos",
    shortName: "AFE ANVISA",
    obrigatorio: false,
    condicionalText: "Obrigatório para cosméticos, medicamentos, saneantes ou alimentos (RDC 48/2013)",
    hint: "Publicação no Diário Oficial da União da Autorização de Funcionamento da ANVISA."
  },
  {
    id: "doc_ae_anvisa_controlados",
    categoryId: "cat_anvisa",
    nome: "AE – Autorização Especial (ANVISA) para produtos controlados (Portaria 344/98)",
    shortName: "AE ANVISA (Controlados 344/98)",
    obrigatorio: false,
    condicionalText: "Obrigatório para medicamentos e insumos controlados (Portaria 344/98)",
    hint: "Autorização Especial emitida pela ANVISA para medicamentos e substâncias controladas."
  },
  {
    id: "doc_licenca_sanitaria",
    categoryId: "cat_anvisa",
    nome: "Licença Sanitária Estadual/Municipal vigente",
    shortName: "Licença Sanitária (VISA)",
    obrigatorio: false,
    condicionalText: "Obrigatório para operações sob vigilância sanitária municipal/estadual",
    hint: "Alvará / Licença Sanitária emitida pelo órgão municipal ou estadual de vigilância sanitária."
  },
  {
    id: "doc_responsabilidade_tecnica",
    categoryId: "cat_anvisa",
    nome: "Certificado de Responsabilidade Técnica (responsável técnico habilitado)",
    shortName: "Certificado CRT / CRF / CRQ",
    obrigatorio: false,
    condicionalText: "Obrigatório sob regime com Farmacêutico ou Químico Responsável",
    hint: "Certidão de Regularidade Técnica emitida pelo conselho de classe (CRF/CRQ)."
  },
  {
    id: "doc_pop_boas_praticas",
    categoryId: "cat_anvisa",
    nome: "POPs de Boas Práticas de Transporte e Armazenagem (limpeza, controle de temperatura, rastreabilidade)",
    shortName: "POPs Boas Práticas / Qualidade",
    obrigatorio: false,
    condicionalText: "Exigência RDC 48/2013 Item 3.3.5 & Padrão de Qualidade para cosméticos e higiene",
    hint: "Procedimentos Operacionais Padrão de limpeza de baús, temperatura e prevenção de contaminação."
  },

  // =========================================================================
  // 4. SEGUROS E GERENCIAMENTO DE RISCO (REQUERIDOS / ESTIPULAÇÃO LOGSHARE)
  // =========================================================================
  {
    id: "doc_apolice_rctrc",
    categoryId: "cat_seguros_pgr",
    nome: "Apólice RCTR-C vigente (Responsabilidade Civil do Transportador Rodoviário – Carga)",
    shortName: "Apólice RCTR-C (Acidente)",
    obrigatorio: false,
    requeridoLogShare: true,
    condicionalText: "Requerido se apólice própria; dispensado se coberto por Apólice Estipulada LogShare",
    hint: "Apólice para cobertura de acidentes rodoviários, colisão e tombamento."
  },
  {
    id: "doc_apolice_rcdc",
    categoryId: "cat_seguros_pgr",
    nome: "Apólice RC-DC vigente (Desaparecimento de Carga)",
    shortName: "Apólice RC-DC (Roubo/Desvio)",
    obrigatorio: false,
    requeridoLogShare: true,
    condicionalText: "Requerido se apólice própria; dispensado se coberto por Apólice Estipulada LogShare",
    hint: "Apólice para cobertura de roubo, furto qualificado e desaparecimento de carga."
  },
  {
    id: "doc_comprovante_pagamento_seguro",
    categoryId: "cat_seguros_pgr",
    nome: "Comprovante de pagamento das apólices (última parcela)",
    shortName: "Comprovante Quitação Seguro",
    obrigatorio: false,
    requeridoLogShare: true,
    condicionalText: "Requerido caso possua apólice própria para comprovação de quitação",
    hint: "Comprovante bancário de quitação da última parcela/fatura emitida pela seguradora."
  },
  {
    id: "doc_pgr_risco",
    categoryId: "cat_seguros_pgr",
    nome: "PGR – Plano de Gerenciamento de Risco (gerenciadora, tecnologia de rastreamento)",
    shortName: "PGR - Gerenciamento de Risco",
    obrigatorio: false,
    requeridoLogShare: true,
    condicionalText: "Requerido se PGR próprio; dispensado se adotar PGR LogShare",
    hint: "Documento oficial do PGR com regras de parada, rotas e tecnologias de rastreamento."
  },
  {
    id: "doc_plano_contingencia",
    categoryId: "cat_seguros_pgr",
    nome: "Plano de contingência / atendimento a emergências",
    shortName: "Plano de Contingência / PAE",
    obrigatorio: false,
    condicionalText: "Recomendado para alto valor agregado e atendimento a sinistros",
    hint: "Fluxograma de pronta resposta, acionamento de autoridades e contingência operacional."
  },

  // =========================================================================
  // 5. FROTA E MOTORISTAS (SSOMA / NR-01 / LEI 13.103)
  // =========================================================================
  {
    id: "doc_relacao_frota_crlv",
    categoryId: "cat_frota_motoristas",
    nome: "Relação da frota (própria e agregada) com CRLV vigente",
    shortName: "Relação Frota + CRLV Vigente",
    obrigatorio: true,
    hint: "Espelho da frota com placas, tipo de veículo, capacidade de carga e CRLV do exercício."
  },
  {
    id: "doc_cnh_toxicologico",
    categoryId: "cat_frota_motoristas",
    nome: "CNH válida dos motoristas com exame toxicológico em dia",
    shortName: "CNH Motoristas + Toxicológico",
    obrigatorio: true,
    hint: "Comprovante de CNHs profissionais dos condutores com exame toxicológico periódico regular (Lei 13.103)."
  }
];

export const TRAFFIC_LIGHT_COLORS = {
  EXPIRED: {
    key: "EXPIRED",
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FCA5A5",
    text: "#991B1B",
    badge: "badge-recusada",
    icon: "🔴",
    label: "Vencido"
  },
  EXPIRING_SOON: {
    key: "EXPIRING_SOON",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FCD34D",
    text: "#92400E",
    badge: "badge-restricoes",
    icon: "🟡",
    label: "A Vencer (≤ 30 dias)"
  },
  VALID: {
    key: "VALID",
    color: "#10B981",
    bg: "#F0FDF4",
    border: "#86EFAC",
    text: "#065F46",
    badge: "badge-apta",
    icon: "🟢",
    label: "Válido / OK"
  },
  NOT_APPLICABLE: {
    key: "NOT_APPLICABLE",
    color: "#64748B",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    text: "#475569",
    badge: "badge-pendente",
    icon: "⚪",
    label: "Pendente / N/A"
  }
};

/**
 * Robustly parses any date (Date object, timestamp, or string) into normalized Date at midnight
 */
export function parseDateRobust(dateVal) {
  if (!dateVal) return null;

  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return null;
    return new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate(), 0, 0, 0);
  }

  if (typeof dateVal === 'number') {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    }
    return null;
  }

  if (typeof dateVal !== 'string') return null;
  const str = dateVal.trim();
  
  if (str.toLowerCase().includes('indeterm')) return 'INDETERMINADA';
  if (str.toLowerCase().includes('vencid') || str.toLowerCase().includes('ausente') || str.toLowerCase().includes('inexist')) {
    return 'VENCIDO';
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const brMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1;
    const year = parseInt(brMatch[3], 10);
    return new Date(year, month, day, 0, 0, 0);
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return new Date(year, month, day, 0, 0, 0);
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  }
  return null;
}

/**
 * Formats any date strictly to a String formatted as DD/MM/YYYY (guaranteed to never return an Object)
 */
export function formatDateBR(dateVal) {
  if (!dateVal) return '—';

  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return '—';
    const day = String(dateVal.getDate()).padStart(2, '0');
    const month = String(dateVal.getMonth() + 1).padStart(2, '0');
    const year = dateVal.getFullYear();
    return `${day}/${month}/${year}`;
  }

  if (typeof dateVal === 'string') {
    const s = dateVal.trim();
    if (s.toLowerCase().includes('indeterm')) return 'Indeterminada';
    if (s.toLowerCase().includes('vencid')) return 'Vencida';
    if (s.toLowerCase().includes('inexist')) return 'Inexistente';
    if (s.toLowerCase().includes('ausente')) return 'Ausente';
  }
  
  const d = parseDateRobust(dateVal);
  if (d === 'INDETERMINADA') return 'Indeterminada';
  if (d === 'VENCIDO') return 'Vencida';
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) {
    return typeof dateVal === 'string' ? dateVal : '—';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calculates document validity status compared to current computer date
 */
export function calculateDocumentValidity(vigenciaStr) {
  if (!vigenciaStr || vigenciaStr === "Ausente" || vigenciaStr === "Não informada" || vigenciaStr === "Inexistente") {
    return {
      ...TRAFFIC_LIGHT_COLORS.NOT_APPLICABLE,
      daysRemaining: -999,
      formattedDate: "Ausente",
      formattedLabel: "Ausente / Não informada"
    };
  }

  const parsed = parseDateRobust(vigenciaStr);

  if (parsed === "INDETERMINADA") {
    return {
      ...TRAFFIC_LIGHT_COLORS.VALID,
      daysRemaining: 9999,
      formattedDate: "Indeterminada",
      formattedLabel: "Vigência Indeterminada (OK)"
    };
  }

  if (parsed === "VENCIDO") {
    return {
      ...TRAFFIC_LIGHT_COLORS.EXPIRED,
      daysRemaining: -1,
      formattedDate: "Vencida",
      formattedLabel: "Documento Vencido"
    };
  }

  if (!parsed || !(parsed instanceof Date) || isNaN(parsed.getTime())) {
    return {
      ...TRAFFIC_LIGHT_COLORS.NOT_APPLICABLE,
      daysRemaining: 0,
      formattedDate: typeof vigenciaStr === 'string' ? vigenciaStr : "—",
      formattedLabel: typeof vigenciaStr === 'string' ? vigenciaStr : "—"
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const diffMs = parsed.getTime() - today.getTime();
  const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const formattedDate = formatDateBR(parsed);

  if (daysRemaining < 0) {
    return {
      ...TRAFFIC_LIGHT_COLORS.EXPIRED,
      daysRemaining,
      formattedDate,
      formattedLabel: `Venceu em ${formattedDate} (há ${Math.abs(daysRemaining)} dias)`
    };
  }

  if (daysRemaining <= 30) {
    return {
      ...TRAFFIC_LIGHT_COLORS.EXPIRING_SOON,
      daysRemaining,
      formattedDate,
      formattedLabel: `Vence em ${formattedDate} (${daysRemaining} dias restantes)`
    };
  }

  return {
    ...TRAFFIC_LIGHT_COLORS.VALID,
    daysRemaining,
    formattedDate,
    formattedLabel: `Válido até ${formattedDate} (${daysRemaining} dias restantes)`
  };
}

/**
 * Computes overall metrics for all carriers
 */
export function getCarriersValidityMetrics(carriers) {
  let totalDocs = 0;
  let expiredDocs = 0;
  let expiringSoonDocs = 0;
  let validDocs = 0;

  carriers.forEach(carrier => {
    const docs = carrier.documentos || [];
    docs.forEach(doc => {
      totalDocs++;
      const val = calculateDocumentValidity(doc.vigencia);
      if (val.key === "EXPIRED") expiredDocs++;
      else if (val.key === "EXPIRING_SOON") expiringSoonDocs++;
      else if (val.key === "VALID") validDocs++;
    });
  });

  return {
    totalDocs,
    expiredDocs,
    expiringSoonDocs,
    validDocs
  };
}
