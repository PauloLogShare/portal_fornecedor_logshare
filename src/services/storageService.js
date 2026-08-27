import { INITIAL_CARRIERS } from "./sampleData";
import { upsertCarrierToSupabase } from "./supabaseService";

const STORAGE_KEY = "LOGSHARE_CARRIERS_DB_V2";

export function loadCarriers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading from localStorage, using initial carriers", err);
  }
  // Default to sample data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CARRIERS));
  return INITIAL_CARRIERS;
}

export function saveAllCarriers(carriers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carriers));
  } catch (err) {
    console.error("Error saving carriers to localStorage", err);
  }
}

export function saveCarrier(newCarrier) {
  const carriers = loadCarriers();
  const index = carriers.findIndex(c => c.id === newCarrier.id || (c.cnpj && c.cnpj === newCarrier.cnpj) || (c.protocol && c.protocol === newCarrier.protocol));
  
  let updated;
  if (index >= 0) {
    updated = [...carriers];
    updated[index] = { ...updated[index], ...newCarrier, ultimaAtualizacao: new Date().toISOString() };
  } else {
    updated = [newCarrier, ...carriers];
  }
  
  saveAllCarriers(updated);

  // Sincroniza em segundo plano com a nuvem Supabase
  try {
    upsertCarrierToSupabase(newCarrier);
  } catch (cloudErr) {
    console.warn("Could not save carrier to Supabase cloud:", cloudErr);
  }

  return updated;
}

export function deleteCarrier(id) {
  const carriers = loadCarriers();
  const updated = carriers.filter(c => c.id !== id);
  saveAllCarriers(updated);
  return updated;
}

export function resetToDefaults() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CARRIERS));
  return INITIAL_CARRIERS;
}

export function generateProtocolNumber() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `HOM-${year}-${randomNum}`;
}

export function exportToCSV(carriers) {
  const headers = [
    "Protocolo",
    "Razao Social",
    "Nome Fantasia",
    "CNPJ",
    "Status",
    "Score",
    "Seguradora",
    "LMG (R$)",
    "Frota Total",
    "Data Criacao",
    "Data Parecer"
  ];

  const rows = carriers.map(c => [
    `"${c.protocol || ''}"`,
    `"${c.razaoSocial || ''}"`,
    `"${c.nomeFantasia || ''}"`,
    `"${c.cnpj || ''}"`,
    `"${c.status || ''}"`,
    c.scoreTotal || 0,
    `"${c.gestaoRisco?.seguradora || ''}"`,
    c.gestaoRisco?.lmg || 0,
    (c.perfilOperacional?.frotaPropria || 0) + (c.perfilOperacional?.frotaAgregada || 0),
    `"${c.dataCriacao || ''}"`,
    `"${c.parecer?.dataEmissao || ''}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `LogShare_Homologacao_Transportadores_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(carriers) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(carriers, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `LogShare_Homologacoes_Export_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
