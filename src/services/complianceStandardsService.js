/**
 * Compliance Standards & ESG Audit Engine - LogShare
 * 
 * Verifies carrier compliance against specific industry & regulatory standards:
 * - ANVISA RDC Nº 48/2013 (Item 3.3.5 - Boas Práticas de Transporte e Armazenagem de Cosméticos)
 * - ISO 9001:2015 & EFfCI (Item 8.4.3 - Controle de Provedores Externos / Ingredientes Cosméticos)
 * - ISO 22716:2007 (Item 6.2 - Terceirização e Boas Práticas de Fabricação Cosmética GMP)
 * - Requisitos de Fornecedores do Grupo Boticário (Qualidade, Abastecimento, SSOMA, ESG e Meio Ambiente)
 */

export const COMPLIANCE_PILLARS = [
  {
    id: "qualidade_abastecimento",
    name: "Qualidade & Abastecimento",
    normas: ["ISO 9001:2015 (Item 8.4.3)", "ISO 22716:2007 (Item 6.2)", "Padrão Grupo Boticário"],
    description: "Qualificação técnica do transportador, integridade física da carga, rastreabilidade e pontualidade no abastecimento.",
    icon: "Award",
    color: "#0056D2"
  },
  {
    id: "sanitaria_cosmeticos",
    name: "Vigilância Sanitária & Boas Práticas",
    normas: ["ANVISA RDC Nº 48/2013 (Item 3.3.5)", "EFfCI (Item 8.4.3)", "Portaria 344/98"],
    description: "Higiene de veículos, POPs de higienização de baús, prevenção de contaminação cruzada, CRT e controle de temperatura.",
    icon: "Sparkles",
    color: "#7C3AED"
  },
  {
    id: "seguranca_saude_ssoma",
    name: "Saúde & Segurança Ocupacional (SSOMA)",
    normas: ["NR-01", "Lei 13.103/2015 (Motoristas)", "Diretrizes SSOMA Grupo Boticário"],
    description: "Exame toxicológico periódico dos motoristas, CNHs profissionais em dia, PGR de trânsito e gestão de fadiga.",
    icon: "ShieldAlert",
    color: "#D97706"
  },
  {
    id: "meio_ambiente_sustentabilidade",
    name: "Meio Ambiente & Sustentabilidade",
    normas: ["CTF/IBAMA", "Proconve / Controle de Emissões", "ESG Grupo Boticário"],
    description: "Registro CTF no IBAMA, licença ambiental de operação, controle de fumaça preta e gestão de resíduos da frota.",
    icon: "Leaf",
    color: "#059669"
  },
  {
    id: "responsabilidade_social_governanca",
    name: "Responsabilidade Social & Governança (ESG)",
    normas: ["CLT", "TST / CNDT", "FGTS / CRF", "Pacto Contra Trabalho Escravo"],
    description: "Regularidade fiscal e trabalhista plena, certidão negativa de débitos trabalhistas e conformidade com direitos humanos.",
    icon: "Users",
    color: "#2563EB"
  }
];

/**
 * Evaluates carrier compliance against the 5 regulatory pillars
 */
export function evaluateComplianceStandards(carrier) {
  const docs = carrier.documentos || [];
  const po = carrier.perfilOperacional || {};
  const gr = carrier.gestaoRisco || {};

  // 1. Qualidade & Abastecimento
  const hasRntrc = docs.some(d => (d.id === "doc_rntrc_antt" || d.id === "doc_rntrc") && d.status === "VALIDO");
  const hasFrotaCRLV = docs.some(d => d.id === "doc_relacao_frota_crlv" && d.status === "VALIDO");
  const hasPGR = gr.temPGR || docs.some(d => (d.id === "doc_pgr_risco" || d.id === "doc_pgr") && d.status === "VALIDO");
  const hasTelemetria = (po.tecnologiaRastreamento || []).length > 0;
  const scoreQualidade = (hasRntrc ? 30 : 0) + (hasFrotaCRLV ? 25 : 0) + (hasPGR ? 25 : 0) + (hasTelemetria ? 20 : 0);
  const statusQualidade = scoreQualidade >= 75 ? "CONFORME" : scoreQualidade >= 40 ? "PARCIAL" : "NAO_CONFORME";

  // 2. Vigilância Sanitária & Cosméticos (RDC 48/2013 e ISO 22716)
  const hasAfe = docs.some(d => d.id === "doc_afe_anvisa" && d.status === "VALIDO");
  const hasLicencaSanitaria = docs.some(d => d.id === "doc_licenca_sanitaria" && d.status === "VALIDO");
  const hasPOP = docs.some(d => d.id === "doc_pop_boas_praticas" && d.status === "VALIDO");
  const hasCRT = docs.some(d => d.id === "doc_responsabilidade_tecnica" && d.status === "VALIDO");
  const scoreSanitaria = (hasLicencaSanitaria ? 35 : 0) + (hasPOP ? 25 : 0) + (hasAfe ? 25 : 0) + (hasCRT ? 15 : 0);
  const statusSanitaria = scoreSanitaria >= 60 ? "CONFORME" : scoreSanitaria >= 25 ? "PARCIAL" : "EM_QUALIFICACAO";

  // 3. Saúde & Segurança (SSOMA)
  const hasCNHToxicol = docs.some(d => d.id === "doc_cnh_toxicologico" && d.status === "VALIDO");
  const hasGerenciadora = gr.gerenciadoraRisco && gr.gerenciadoraRisco !== "Nenhuma cadastrada";
  const scoreSSOMA = (hasCNHToxicol ? 50 : 0) + (hasPGR ? 30 : 0) + (hasGerenciadora ? 20 : 0);
  const statusSSOMA = scoreSSOMA >= 70 ? "CONFORME" : scoreSSOMA >= 40 ? "PARCIAL" : "NAO_CONFORME";

  // 4. Meio Ambiente & Sustentabilidade
  const hasIbama = docs.some(d => d.id === "doc_ctf_ibama" && d.status === "VALIDO");
  const hasAlvara = docs.some(d => (d.id === "doc_alvara_funcionamento" || d.id === "doc_ambiental_mopp") && d.status === "VALIDO");
  const scoreAmbiente = (hasAlvara ? 60 : 0) + (hasIbama ? 40 : 0);
  const statusAmbiente = scoreAmbiente >= 60 ? "CONFORME" : "EM_QUALIFICACAO";

  // 5. Responsabilidade Social & Governança (ESG)
  const hasCndt = docs.some(d => (d.id === "doc_cndt_trabalhista" || d.id === "doc_cndt") && d.status === "VALIDO");
  const hasFgts = docs.some(d => (d.id === "doc_crf_fgts" || d.id === "doc_fgts") && d.status === "VALIDO");
  const hasCndFederal = docs.some(d => d.id === "doc_cnd_federal" && d.status === "VALIDO");
  const scoreSocial = (hasCndt ? 35 : 0) + (hasFgts ? 35 : 0) + (hasCndFederal ? 30 : 0);
  const statusSocial = scoreSocial >= 70 ? "CONFORME" : scoreSocial >= 35 ? "PARCIAL" : "NAO_CONFORME";

  // Global Compliance Score (0 - 100%)
  const overallPercentage = Math.round(
    (scoreQualidade * 0.25) +
    (scoreSanitaria * 0.20) +
    (scoreSSOMA * 0.20) +
    (scoreAmbiente * 0.15) +
    (scoreSocial * 0.20)
  );

  return {
    overallPercentage,
    boticarioApproved: overallPercentage >= 70 && statusQualidade === "CONFORME" && statusSocial === "CONFORME",
    pillars: [
      {
        id: "qualidade_abastecimento",
        name: "1. Qualidade & Abastecimento",
        normas: "ISO 9001:2015 (8.4.3) / ISO 22716 (6.2)",
        score: scoreQualidade,
        status: statusQualidade,
        details: `${hasRntrc ? "✓ RNTRC Ativo" : "✗ Sem RNTRC"} | ${hasFrotaCRLV ? "✓ Frota Auditada" : "Pendente CRLV"} | ${hasTelemetria ? "✓ Telemetria Ativa" : "Sem Telemetria"}`
      },
      {
        id: "sanitaria_cosmeticos",
        name: "2. Vigilância Sanitária & Cosméticos",
        normas: "ANVISA RDC Nº 48/2013 (Item 3.3.5) / EFfCI (8.4.3)",
        score: scoreSanitaria,
        status: statusSanitaria,
        details: `${hasLicencaSanitaria ? "✓ Licença Sanitária" : "Licença Sanitária a verificar"} | ${hasPOP ? "✓ POPs de Higiene & Temperatura" : "POPs em implantação"}`
      },
      {
        id: "seguranca_saude_ssoma",
        name: "3. Saúde & Segurança (SSOMA)",
        normas: "NR-01 / Lei 13.103 / Diretrizes Grupo Boticário",
        score: scoreSSOMA,
        status: statusSSOMA,
        details: `${hasCNHToxicol ? "✓ CNHs + Toxicológico Periódico em dia" : "Pendente Toxicológico"} | ${hasPGR ? "✓ PGR de Segurança Ativo" : "Sem PGR"}`
      },
      {
        id: "meio_ambiente_sustentabilidade",
        name: "4. Meio Ambiente & Sustentabilidade",
        normas: "CTF/IBAMA / Controle de Emissões / ESG",
        score: scoreAmbiente,
        status: statusAmbiente,
        details: `${hasAlvara ? "✓ Alvará / AVCB Regular" : "Pendente Alvará"} | ${hasIbama ? "✓ CTF/IBAMA Ativo" : "CTF/IBAMA Setorial"}`
      },
      {
        id: "responsabilidade_social_governanca",
        name: "5. Responsabilidade Social & Governança",
        normas: "CLT / CNDT Trabalhista / CRF FGTS / ESG",
        score: scoreSocial,
        status: statusSocial,
        details: `${hasCndt ? "✓ CNDT Trabalhista Válida" : "Pendente CNDT"} | ${hasFgts ? "✓ CRF FGTS Regular" : "Pendente CRF"}`
      }
    ]
  };
}
