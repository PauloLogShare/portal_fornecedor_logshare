import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ziiyyiddpdzovmpjhlfz.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_qY4JBkOfzDVTJq0ctxyhbQ_RyYQfLS9";

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export function isSupabaseConfigured() {
  return !!supabase;
}

/**
 * Converte o objeto do Frontend (camelCase) para o formato do Supabase (snake_case)
 */
export function formatCarrierForSupabase(carrier) {
  return {
    id: carrier.id || `CARRIER-${Date.now()}`,
    protocol: carrier.protocol || `HOM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    cnpj: (carrier.cnpj || '').trim(),
    razao_social: carrier.razaoSocial || '',
    nome_fantasia: carrier.nomeFantasia || '',
    abertura_cnpj: carrier.aberturaCNPJ || null,
    capital_social: carrier.capitalSocial || 0,
    endereco: carrier.endereco || {},
    contato: carrier.contato || {},
    perfil_operacional: carrier.perfilOperacional || {},
    gestao_risco: carrier.gestaoRisco || {},
    dados_receita_federal: carrier.dadosReceitaFederal || {},
    documentos: carrier.documentos || [],
    status: carrier.status || 'AGUARDANDO_ANALISE',
    score_total: carrier.scoreTotal || 0,
    score_breakdown: carrier.scoreBreakdown || {},
    parecer: carrier.parecer || null,
    updated_at: new Date().toISOString()
  };
}

/**
 * Converte o registro do Supabase (snake_case) para o formato do Frontend (camelCase)
 */
export function formatCarrierFromSupabase(row) {
  if (!row) return null;
  return {
    id: row.id,
    protocol: row.protocol,
    cnpj: row.cnpj,
    razaoSocial: row.razao_social,
    nomeFantasia: row.nome_fantasia,
    aberturaCNPJ: row.abertura_cnpj,
    capitalSocial: Number(row.capital_social) || 0,
    endereco: row.endereco || {},
    contato: row.contato || {},
    perfilOperacional: row.perfil_operacional || {},
    gestaoRisco: row.gestao_risco || {},
    dadosReceitaFederal: row.dados_receita_federal || {},
    documentos: row.documentos || [],
    status: row.status,
    scoreTotal: row.score_total || 0,
    scoreBreakdown: row.score_breakdown || {},
    parecer: row.parecer,
    dataCriacao: row.created_at,
    ultimaAtualizacao: row.updated_at
  };
}

/**
 * Busca todos os transportadores do Supabase
 */
export async function fetchCarriersFromSupabase() {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('carriers')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn("Aviso ao buscar transportadores do Supabase:", error.message);
      return null;
    }

    return (data || []).map(formatCarrierFromSupabase);
  } catch (err) {
    console.error("Erro inesperado no Supabase fetch:", err);
    return null;
  }
}

/**
 * Salva ou atualiza um transportador no Supabase
 */
export async function upsertCarrierToSupabase(carrier) {
  if (!supabase) return null;

  try {
    const payload = formatCarrierForSupabase(carrier);
    const { data, error } = await supabase
      .from('carriers')
      .upsert(payload, { onConflict: 'protocol' })
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar transportador no Supabase:", error);
      return null;
    }

    return formatCarrierFromSupabase(data);
  } catch (err) {
    console.error("Erro inesperado no Supabase upsert:", err);
    return null;
  }
}

/**
 * Inscrição em tempo real para sincronização de novos cadastros e pareceres
 */
export function subscribeToCarriers(onUpdate) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('realtime:carriers')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'carriers' }, (payload) => {
      if (onUpdate) {
        onUpdate(payload);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
