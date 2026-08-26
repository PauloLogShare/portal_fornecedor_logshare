/**
 * Traffic Light Validity Engine (Semáforo de Vigências)
 * Colors:
 * 🔴 Red (EXPIRED): Validity < Current Date
 * 🟡 Yellow (EXPIRING_SOON): Current Date <= Validity <= Current Date + 30 days
 * 🟢 Green (VALID): Validity > Current Date + 30 days or Indeterminada
 */

// All 11 Official Documents for Carrier Homologation
export const ALL_SYSTEM_DOCUMENTS = [
  { id: "doc_cnpj", shortName: "Cartão CNPJ", nome: "Cartão CNPJ (Receita Federal)", obrigatorio: true, category: "societario" },
  { id: "doc_rntrc", shortName: "RNTRC / ANTT", nome: "Certificado RNTRC / ANTT", obrigatorio: true, category: "regulatorio" },
  { id: "doc_rctrc", shortName: "Seguro RCTR-C", nome: "Apólice de Seguro RCTR-C (Acidente)", obrigatorio: true, category: "seguros" },
  { id: "doc_rcdc", shortName: "Seguro RC-DC", nome: "Apólice de Seguro RC-DC (Roubo)", obrigatorio: true, category: "seguros" },
  { id: "doc_contrato", shortName: "Contrato Social", nome: "Contrato Social Consolidado", obrigatorio: true, category: "societario" },
  { id: "doc_cnd_federal", shortName: "CND Federal", nome: "CND Federal / Previdenciária", obrigatorio: true, category: "fiscal" },
  { id: "doc_cndt", shortName: "CNDT Trabalhista", nome: "Certidão Negativa Trabalhista (CNDT)", obrigatorio: true, category: "fiscal" },
  { id: "doc_fgts", shortName: "CRF FGTS", nome: "Certificado de Regularidade FGTS (CRF)", obrigatorio: true, category: "fiscal" },
  { id: "doc_bancario", shortName: "Comp. Bancário", nome: "Comprovante de Domicílio Bancário", obrigatorio: true, category: "societario" },
  { id: "doc_pgr", shortName: "PGR Risco", nome: "PGR - Plano de Gerenciamento de Risco", obrigatorio: false, category: "seguros" },
  { id: "doc_ambiental_mopp", shortName: "Licença / MOPP", nome: "Licença Ambiental / Certificado MOPP", obrigatorio: false, category: "regulatorio" }
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
    label: "N/A"
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
      ...TRAFFIC_LIGHT_COLORS.EXPIRED,
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

  // Real today at 00:00:00
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
