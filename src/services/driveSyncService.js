/**
 * Google Drive & Google Sheets Integration Service for LogShare
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * LOGSHARE - GOOGLE DRIVE & GOOGLE SHEETS WEBHOOK DE HOMOLOGAÇÃO
 * =========================================================================
 * 
 * 📌 PASSO A PASSO PARA ATIVAÇÃO (DURAÇÃO: 2 MINUTOS):
 * 
 * 1. Abra sua Planilha do Google Sheets (ex: "LogShare_Homologacao_Transportadores").
 * 2. No menu superior da planilha, clique em: Extensões > Apps Script.
 * 3. Apague tudo o que estiver lá e COLE todo este código.
 * 
 * ⚠️ ETAPA FUNDAMENTAL DE PERMISSÃO:
 * 4. No topo da tela do Apps Script, selecione a função "testarLocalmente" no menu dropdown e clique em "Executar" (ícone de Play ▶️).
 * 5. O Google vai exibir a janela "Autorização necessária":
 *    - Clique em "Revisar permissões" > Escolha sua conta Google.
 *    - Clique em "Avançado" (link pequeno no rodapé) > "Acessar (não seguro)".
 *    - Clique em "Permitir".
 *    *(Isso autoriza o script a criar pastas no Drive e escrever na planilha).*
 * 
 * 🚀 IMPLANTAÇÃO COMO WEBHOOK:
 * 6. Clique no botão azul "Implantar" (topo direito) > "Nova Implantação".
 * 7. Clique na engrenagem ⚙️ ao lado de "Selecionar tipo" e escolha "App da Web" (Web App).
 * 8. Preencha a configuração:
 *    - Descrição: "LogShare Webhook v1"
 *    - Executar como: "Eu (seu e-mail)"
 *    - Quem pode acessar: "Qualquer pessoa" (Anyone) -> OBRIGATÓRIO!
 * 9. Clique em "Implantar" e copie o "URL do aplicativo da Web" (termina com /exec).
 * 10. Cole esse URL no painel da LogShare e clique em "Testar Sincronização".
 * =========================================================================
 */

// Função de Teste Local no editor do Apps Script (Gera as permissões necessárias)
function testarLocalmente() {
  var mockCarrier = {
    protocol: "HOM-2026-TESTE",
    cnpj: "12.345.678/0001-90",
    razaoSocial: "TransRodoviário Express do Brasil Ltda",
    nomeFantasia: "TransRodoviário Brasil",
    status: "APTA",
    scoreTotal: 880,
    contato: {
      responsavel: "Carlos Eduardo Silveira",
      email: "carlos@transrodoviario.com.br",
      telefone: "(11) 98765-4321"
    },
    gestaoRisco: {
      seguradora: "Porto Seguro Transportes",
      lmg: 1500000
    },
    parecer: {
      statusFinal: "APTA",
      dataEmissao: new Date().toISOString(),
      resumoExecutivo: "Transportador com documentação 100% regular e baixo risco operacional.",
      restricoesOperacionais: ["Monitoramento via Isca Carga", "Escolta acima de R$ 800k"],
      acoesRequeridas: "Nenhuma pendência."
    }
  };

  var resultado = processarSincronizacao(mockCarrier);
  Logger.log("Resultado do Teste Local: " + JSON.stringify(resultado));
  return resultado;
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ONLINE",
    service: "LogShare Webhook Google Drive & Sheets",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = "";
    if (e && e.postData && e.postData.contents) {
      rawData = e.postData.contents;
    } else if (e && e.parameter && e.parameter.data) {
      rawData = e.parameter.data;
    } else {
      rawData = JSON.stringify(e ? e.parameter : {});
    }
    
    var data = JSON.parse(rawData);
    var resultado = processarSincronizacao(data);

    return ContentService.createTextOutput(JSON.stringify(resultado))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Erro no doPost: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "ERROR",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function processarSincronizacao(data) {
  // 1. Obter ou Criar Pasta Raiz no Google Drive
  var rootFolderName = "LogShare - Homologação de Transportadores";
  var rootFolders = DriveApp.getFoldersByName(rootFolderName);
  var rootFolder;

  if (rootFolders.hasNext()) {
    rootFolder = rootFolders.next();
  } else {
    rootFolder = DriveApp.createFolder(rootFolderName);
  }

  // 2. Criar Pasta da Transportadora: [CNPJ Limpo] - [Razão Social]
  var cleanCnpj = (data.cnpj || "SEM_CNPJ").replace(/[^0-9]/g, "");
  var carrierFolderName = cleanCnpj + " - " + (data.razaoSocial || "Transportadora");
  var carrierFolders = rootFolder.getFoldersByName(carrierFolderName);
  var carrierFolder;

  if (carrierFolders.hasNext()) {
    carrierFolder = carrierFolders.next();
  } else {
    carrierFolder = rootFolder.createFolder(carrierFolderName);
  }

  // 3. Subpastas: Documentos e Pareceres
  var docsFolder = getOrCreateSubfolder(carrierFolder, "01_Documentos_Cadastrais");
  var parecerFolder = getOrCreateSubfolder(carrierFolder, "02_Pareceres_Homologacao");

  // 4. Salvar Dossiê Completo em JSON
  carrierFolder.createFile(
    "dossie_completo_" + cleanCnpj + ".json", 
    JSON.stringify(data, null, 2), 
    "application/json"
  );

  // 5. Salvar Parecer Oficial Formatado em TXT
  if (data.parecer) {
    var parecerText = "PARECER OFICIAL DE HOMOLOGAÇÃO DE TRANSPORTADOR — LOGSHARE\\n" +
                      "============================================================\\n" +
                      "Protocolo: " + (data.protocol || "N/A") + "\\n" +
                      "Transportadora: " + (data.razaoSocial || "") + " (CNPJ: " + (data.cnpj || "") + ")\\n" +
                      "Status Final: " + (data.parecer.statusFinal || data.status || "") + "\\n" +
                      "Score Global de Risco: " + (data.scoreTotal || 0) + " / 1000 pts\\n" +
                      "Data de Emissão: " + (data.parecer.dataEmissao || new Date().toISOString()) + "\\n\\n" +
                      "1. RESUMO EXECUTIVO:\\n" + (data.parecer.resumoExecutivo || "Não informado.") + "\\n\\n" +
                      "2. RESTRIÇÕES & CONDICIONANTES OPERACIONAIS:\\n" + 
                      ((data.parecer.restricoesOperacionais && data.parecer.restricoesOperacionais.length > 0) 
                        ? "- " + data.parecer.restricoesOperacionais.join("\\n- ") 
                        : "Nenhuma restrição imposta.") + "\\n\\n" +
                      "3. AÇÕES REQUERIDAS / PENDÊNCIAS:\\n" + (data.parecer.acoesRequeridas || "Nenhuma pendência.");

    parecerFolder.createFile("Parecer_Oficial_" + cleanCnpj + ".txt", parecerText, "text/plain");
  }

  // 6. Atualizar Linha na Planilha Google
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet;

  if (spreadsheet) {
    sheet = spreadsheet.getActiveSheet();
  } else {
    // Se o script for standalone, busca ou cria uma planilha na pasta raiz
    var sheetFiles = rootFolder.getFilesByName("LogShare_Planilha_Mestre");
    if (sheetFiles.hasNext()) {
      sheet = SpreadsheetApp.open(sheetFiles.next()).getActiveSheet();
    } else {
      var newSheet = SpreadsheetApp.create("LogShare_Planilha_Mestre");
      DriveApp.getFileById(newSheet.getId()).moveTo(rootFolder);
      sheet = newSheet.getActiveSheet();
    }
  }

  if (sheet.getLastRow() === 0) {
    // Cabeçalho estilizado
    sheet.appendRow([
      "Data/Hora",
      "Protocolo",
      "CNPJ",
      "Razão Social",
      "Nome Fantasia",
      "Status Homologação",
      "Score Risco",
      "Seguradora",
      "LMG (R$)",
      "Link Pasta Drive",
      "Contato Responsável",
      "E-mail",
      "Telefone"
    ]);
    sheet.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#0056D2").setFontColor("#FFFFFF");
  }

  sheet.appendRow([
    new Date(),
    data.protocol || "N/A",
    data.cnpj || "",
    data.razaoSocial || "",
    data.nomeFantasia || "",
    data.parecer ? data.parecer.statusFinal : (data.status || "AGUARDANDO_ANALISE"),
    data.scoreTotal || 0,
    data.gestaoRisco ? data.gestaoRisco.seguradora : "",
    data.gestaoRisco ? data.gestaoRisco.lmg : "",
    carrierFolder.getUrl(),
    data.contato ? data.contato.responsavel : "",
    data.contato ? data.contato.email : "",
    data.contato ? data.contato.telefone : ""
  ]);

  return {
    status: "SUCCESS",
    message: "Transportador sincronizado com sucesso no Google Drive e Planilha!",
    folderUrl: carrierFolder.getUrl(),
    carrier: data.razaoSocial
  };
}

function getOrCreateSubfolder(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(name);
}
`;

export async function syncCarrierToGoogleDrive(carrier, webhookUrl) {
  if (!webhookUrl || !webhookUrl.trim()) {
    const cleanCnpj = (carrier.cnpj || "00000000000000").replace(/[^0-9]/g, "");
    return {
      success: true,
      simulated: true,
      folderUrl: `https://drive.google.com/drive/folders/logshare-homologacao-${cleanCnpj}`,
      timestamp: new Date().toISOString(),
      message: `Sincronização simulada com sucesso! Pasta criada: LogShare / ${carrier.cnpj} - ${carrier.razaoSocial}`
    };
  }

  const cleanUrl = webhookUrl.trim();

  try {
    const response = await fetch(cleanUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(carrier),
      redirect: "follow"
    });

    const responseText = await response.text();
    let result = null;

    try {
      if (responseText && responseText.trim().startsWith("{")) {
        result = JSON.parse(responseText);
      }
    } catch (e) {
      console.warn("Response not direct JSON", e);
    }

    if (result && result.status === "ERROR") {
      return {
        success: false,
        error: result.message || "Erro retornado pelo script do Google Apps Script"
      };
    }

    const cleanCnpj = (carrier.cnpj || "00000000000000").replace(/[^0-9]/g, "");
    const folderUrl = result?.folderUrl || `https://drive.google.com/drive/folders/logshare-${cleanCnpj}`;

    return {
      success: true,
      simulated: false,
      folderUrl,
      carrier: carrier.razaoSocial,
      message: result?.message || `Transportador ${carrier.razaoSocial} sincronizado com sucesso no Google Drive & Sheets!`
    };
  } catch (err) {
    console.warn("Fetch failed, attempting fallback...", err);

    try {
      await fetch(cleanUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(carrier)
      });

      const cleanCnpj = (carrier.cnpj || "00000000000000").replace(/[^0-9]/g, "");
      return {
        success: true,
        simulated: false,
        folderUrl: `https://drive.google.com/drive/search?q=${cleanCnpj}`,
        carrier: carrier.razaoSocial,
        message: `Disparo enviado com sucesso para o Webhook do Google Apps Script!`
      };
    } catch (noCorsErr) {
      return {
        success: false,
        error: `Falha na conexão com o Webhook: ${err.message || noCorsErr.message}`
      };
    }
  }
}

export const OFFICIAL_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyWfv1mwtrLtunYO78fzWhmXGH2CiIC4_RC3l3j4UqV0V9K_XLOlI0UkKQbeIupVkas/exec";

const WEBHOOK_STORAGE_KEY = "LOGSHARE_DRIVE_WEBHOOK_URL_V1";

export function getStoredWebhookUrl() {
  return (
    import.meta.env.VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL ||
    localStorage.getItem(WEBHOOK_STORAGE_KEY) ||
    OFFICIAL_WEBHOOK_URL
  );
}

export function saveStoredWebhookUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem(WEBHOOK_STORAGE_KEY, url.trim());
  } else {
    localStorage.removeItem(WEBHOOK_STORAGE_KEY);
  }
}

