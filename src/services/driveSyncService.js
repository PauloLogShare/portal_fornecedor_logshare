/**
 * Google Drive & Google Sheets Integration Service for LogShare
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * LOGSHARE - GOOGLE DRIVE & GOOGLE SHEETS WEBHOOK DE HOMOLOGAÇÃO
 * =========================================================================
 * Instruções de Implantação:
 * 1. Abra o Google Drive da LogShare e crie uma nova "Planilha Google" (ex: "LogShare_Homologacao_Transportadores").
 * 2. Na planilha, clique em: Extensões > Apps Script.
 * 3. Cole este código substituindo todo o conteúdo existente.
 * 4. Clique em "Implantar" > "Nova Implantação".
 * 5. Escolha tipo: "App da Web" (Web App).
 * 6. Configuração:
 *    - Executar como: "Eu" (sua conta Google)
 *    - Quem pode acessar: "Qualquer pessoa" (Anyone)
 * 7. Copie o URL gerado e insira na plataforma LogShare no campo de Webhook URL.
 * =========================================================================
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    // 1. Obter ou Criar Pasta Principal no Google Drive
    var rootFolderName = "LogShare - Homologação de Transportadores";
    var rootFolders = DriveApp.getFoldersByName(rootFolderName);
    var rootFolder;
    
    if (rootFolders.hasNext()) {
      rootFolder = rootFolders.next();
    } else {
      rootFolder = DriveApp.createFolder(rootFolderName);
    }
    
    // 2. Criar Pasta Específica da Transportadora: [CNPJ Limpo] - [Razão Social]
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
    
    // 4. Salvar Dossiê em JSON e Resumo TXT
    var jsonFile = carrierFolder.createFile("dossie_completo_" + cleanCnpj + ".json", JSON.stringify(data, null, 2), "application/json");
    
    if (data.parecer) {
      var parecerText = "PARECER DE HOMOLOGAÇÃO LOGSHARE\\n" +
                        "==================================\\n" +
                        "Protocolo: " + (data.protocol || "N/A") + "\\n" +
                        "Transportadora: " + data.razaoSocial + " (CNPJ: " + data.cnpj + ")\\n" +
                        "Status Final: " + data.parecer.statusFinal + "\\n" +
                        "Score de Risco: " + (data.scoreTotal || 0) + "/1000\\n" +
                        "Data: " + (data.parecer.dataEmissao || new Date().toISOString()) + "\\n\\n" +
                        "RESUMO EXECUTIVO:\\n" + data.parecer.resumoExecutivo + "\\n\\n" +
                        "RESTRIÇÕES OPERACIONAIS:\\n" + (data.parecer.restricoesOperacionais || []).join("\\n- ") + "\\n\\n" +
                        "AÇÕES REQUERIDAS:\\n" + data.parecer.acoesRequeridas;
      parecerFolder.createFile("Parecer_Oficial_" + cleanCnpj + ".txt", parecerText, "text/plain");
    }
    
    // 5. Atualizar Linha na Planilha Google
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      // Cria cabeçalho se planilha estiver vazia
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
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "SUCCESS",
      message: "Transportador sincronizado com sucesso no Google Drive e Planilha!",
      folderUrl: carrierFolder.getUrl(),
      carrier: data.razaoSocial
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ERROR",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
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
  if (!webhookUrl) {
    // Return simulated success with local mockup URL
    const cleanCnpj = (carrier.cnpj || "00000000000000").replace(/[^0-9]/g, "");
    return {
      success: true,
      simulated: true,
      folderUrl: `https://drive.google.com/drive/folders/logshare-homologacao-${cleanCnpj}`,
      timestamp: new Date().toISOString(),
      message: `Sincronização simulada com sucesso! Pasta criada: LogShare / ${carrier.cnpj} - ${carrier.razaoSocial}`
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" }, // Avoid CORS preflight on Apps Script
      body: JSON.stringify(carrier)
    });
    const result = await response.json();
    return {
      success: true,
      simulated: false,
      ...result
    };
  } catch (err) {
    console.error("Error syncing to Google Apps Script webhook", err);
    return {
      success: false,
      error: err.message || "Falha na conexão com o Webhook Google Apps Script"
    };
  }
}
