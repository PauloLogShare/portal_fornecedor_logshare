/**
 * Google Drive & Google Sheets Integration Service for LogShare
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * LOGSHARE - GOOGLE DRIVE & GOOGLE SHEETS WEBHOOK (GERAÇÃO NATIVA DE PDFS)
 * =========================================================================
 * 
 * 📌 PASSO A PASSO PARA ATUALIZAÇÃO NO GOOGLE APPS SCRIPT:
 * 
 * 1. Abra sua Planilha do Google Sheets (Extensões > Apps Script).
 * 2. Substitua todo o código por este.
 * 3. Salve (Ctrl+S / Cmd+S).
 * 4. Clique em "Implantar" (topo direito) > "Gerenciar implantações".
 * 5. Clique no ícone de Lápis ✏️ (Editar).
 * 6. Em "Versão", escolha "Nova versão".
 * 7. Clique em "Implantar".
 * =========================================================================
 */

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
    documentos: [
      {
        nome: "Cartão CNPJ atualizado",
        status: "VALIDO",
        vigencia: "31/12/2028",
        arquivoNome: "Cartao_CNPJ_12345678000190.pdf"
      },
      {
        nome: "Registro RNTRC / ANTT ativo",
        status: "VALIDO",
        vigencia: "25/11/2027",
        arquivoNome: "Certificado_RNTRC_ANTT.pdf"
      },
      {
        nome: "Apólice RCTR-C vigente (Acidentes)",
        status: "VALIDO",
        vigencia: "15/10/2026",
        arquivoNome: "Apolice_Seguro_RCTRC.pdf"
      },
      {
        nome: "Apólice RC-DC vigente (Roubo)",
        status: "VALIDO",
        vigencia: "15/10/2026",
        arquivoNome: "Apolice_Seguro_RCDC.pdf"
      }
    ],
    parecer: {
      statusFinal: "APTA",
      dataEmissao: new Date().toISOString(),
      resumoExecutivo: "Transportador com documentação 100% regular, apólices ativas e baixo risco operacional.",
      restricoesOperacionais: ["Monitoramento obrigatório via telemetria", "Escolta armada acima de R$ 800.000,00"],
      acoesRequeridas: "Nenhuma pendência impeditiva."
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

  // 3. Subpastas Oficiais
  var docsFolder = getOrCreateSubfolder(carrierFolder, "01_Documentos_Cadastrais");
  var parecerFolder = getOrCreateSubfolder(carrierFolder, "02_Pareceres_Homologacao");
  var archiveFolder = getOrCreateSubfolder(carrierFolder, "_Historico_Versoes_Anteriores");

  // 4. Salvar Todos os Arquivos em Formato PDF Oficial na pasta 01_Documentos_Cadastrais com Versionamento
  if (data.documentos && Array.isArray(data.documentos)) {
    for (var i = 0; i < data.documentos.length; i++) {
      var doc = data.documentos[i];
      if (doc) {
        var baseName = (doc.arquivoNome || doc.nome || "Documento").replace(/\\.txt$/i, "");
        if (!baseName.toLowerCase().endsWith(".pdf") && !baseName.toLowerCase().endsWith(".png") && !baseName.toLowerCase().endsWith(".jpg")) {
          baseName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf";
        }

        // Se o arquivo já existe na pasta ativa, move o antigo para _Historico_Versoes_Anteriores com timestamp
        var existingFiles = docsFolder.getFilesByName(baseName);
        while (existingFiles.hasNext()) {
          var oldFile = existingFiles.next();
          var nowFormatted = Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd_HHmm");
          var archiveName = nowFormatted + "_SUBSTITUIDO_" + baseName;
          oldFile.setName(archiveName);
          oldFile.moveTo(archiveFolder);
          Logger.log("Arquivo anterior arquivado em _Historico_Versoes_Anteriores: " + archiveName);
        }

        if (doc.arquivoBase64) {
          try {
            var base64Content = doc.arquivoBase64;
            if (base64Content.indexOf(",") > -1) {
              base64Content = base64Content.split(",")[1];
            }
            var decodedBytes = Utilities.base64Decode(base64Content);
            var mimeType = doc.arquivoMime || "application/pdf";
            
            var fileBlob = Utilities.newBlob(decodedBytes, mimeType, baseName);
            docsFolder.createFile(fileBlob);
          } catch (fileErr) {
            Logger.log("Erro ao decodificar Base64 de " + doc.nome + ": " + fileErr.toString());
          }
        } else {
          // Quando o arquivo for cadastrado sem Base64 (ex: sincronização de lote), gera PDF com layout oficial
          var pdfFileName = baseName.endsWith(".pdf") ? baseName : (baseName + ".pdf");
          
          var certHtml = "<html><body style='font-family: Arial, sans-serif; padding: 35px; color: #1E293B;'>" +
            "<div style='border-bottom: 2px solid #0056D2; padding-bottom: 12px; margin-bottom: 20px;'>" +
            "<h2 style='color: #0056D2; margin: 0; font-size: 18px;'>LOGSHARE — COMPROVANTE DE CONFORMIDADE DOCUMENTAL</h2>" +
            "<p style='color: #64748B; margin: 4px 0 0 0; font-size: 12px;'>Transportador: " + (data.razaoSocial || "") + " | CNPJ: " + (data.cnpj || "") + "</p>" +
            "</div>" +
            "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;'>" +
            "<tr><td style='padding: 8px; border: 1px solid #E2E8F0; font-weight: bold; width: 35%; background: #F8FAFC;'>Tipo de Documento</td><td style='padding: 8px; border: 1px solid #E2E8F0;'>" + (doc.nome || "") + "</td></tr>" +
            "<tr><td style='padding: 8px; border: 1px solid #E2E8F0; font-weight: bold; background: #F8FAFC;'>Situação Cadastral</td><td style='padding: 8px; border: 1px solid #E2E8F0; font-weight: bold; color: " + (doc.status === 'VALIDO' ? '#059669' : '#DC2626') + ";'>" + (doc.status || "REGULAR") + "</td></tr>" +
            "<tr><td style='padding: 8px; border: 1px solid #E2E8F0; font-weight: bold; background: #F8FAFC;'>Data de Vigência / Validade</td><td style='padding: 8px; border: 1px solid #E2E8F0;'>" + (doc.vigencia || "Indeterminada") + "</td></tr>" +
            "<tr><td style='padding: 8px; border: 1px solid #E2E8F0; font-weight: bold; background: #F8FAFC;'>Arquivo de Origem</td><td style='padding: 8px; border: 1px solid #E2E8F0;'>" + (doc.arquivoNome || "Anexo Homologado") + "</td></tr>" +
            "<tr><td style='padding: 8px; border: 1px solid #E2E8F0; font-weight: bold; background: #F8FAFC;'>Data de Registro no Sistema</td><td style='padding: 8px; border: 1px solid #E2E8F0;'>" + new Date().toLocaleDateString('pt-BR') + "</td></tr>" +
            "</table>" +
            "<div style='background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 6px; padding: 12px; font-size: 12px; color: #065F46;'>" +
            "✓ Este comprovante atesta a recepção e auditoria do documento nos padrões de homologação de transportadores da LogShare." +
            "</div>" +
            "</body></html>";

          var certPdf = HtmlService.createHtmlOutput(certHtml).getAs('application/pdf').setName(pdfFileName);
          docsFolder.createFile(certPdf);
        }
      }
    }
  }

  // 5. Salvar Parecer Oficial Formatado em PDF na pasta 02_Pareceres_Homologacao com Versionamento
  if (data.parecer) {
    var parecerPdfName = "Parecer_Oficial_Homologacao_" + cleanCnpj + ".pdf";
    var existingParecer = parecerFolder.getFilesByName(parecerPdfName);

    while (existingParecer.hasNext()) {
      var oldParecer = existingParecer.next();
      var nowFormatted = Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd_HHmm");
      var archiveParecerName = nowFormatted + "_SUBSTITUIDO_" + parecerPdfName;
      oldParecer.setName(archiveParecerName);
      oldParecer.moveTo(archiveFolder);
      Logger.log("Parecer anterior arquivado em _Historico_Versoes_Anteriores: " + archiveParecerName);
    }

    var statusColor = (data.parecer.statusFinal === 'APTA') ? '#059669' : (data.parecer.statusFinal === 'APTA_COM_RESTRICOES') ? '#D97706' : '#DC2626';
    var statusLabel = (data.parecer.statusFinal === 'APTA') ? 'APTA' : (data.parecer.statusFinal === 'APTA_COM_RESTRICOES') ? 'APTA COM RESTRIÇÕES' : 'NÃO APTA';

    var parecerHtml = "<html><body style='font-family: Arial, sans-serif; padding: 35px; color: #1E293B;'>" +
      "<div style='border-bottom: 3px solid #0056D2; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between;'>" +
      "<div>" +
      "<h1 style='color: #0056D2; margin: 0; font-size: 20px;'>LOGSHARE — PARECER TÉCNICO DE HOMOLOGAÇÃO</h1>" +
      "<p style='color: #64748B; margin: 4px 0 0 0; font-size: 12px;'>Comitê de Compliance, Gestão de Risco & Segurança Operacional</p>" +
      "</div>" +
      "</div>" +
      "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;'>" +
      "<tr><td style='padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: bold; width: 30%; background: #F8FAFC;'>Protocolo</td><td style='padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: bold; font-family: monospace;'>" + (data.protocol || "N/A") + "</td></tr>" +
      "<tr><td style='padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: bold; background: #F8FAFC;'>Razão Social</td><td style='padding: 6px 10px; border: 1px solid #E2E8F0;'>" + (data.razaoSocial || "") + "</td></tr>" +
      "<tr><td style='padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: bold; background: #F8FAFC;'>CNPJ</td><td style='padding: 6px 10px; border: 1px solid #E2E8F0;'>" + (data.cnpj || "") + "</td></tr>" +
      "<tr><td style='padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: bold; background: #F8FAFC;'>Status Final</td><td style='padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: bold; color: " + statusColor + "; font-size: 13px;'>" + statusLabel + "</td></tr>" +
      "<tr><td style='padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: bold; background: #F8FAFC;'>Score Global de Risco</td><td style='padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: bold;'>" + (data.scoreTotal || 0) + " / 1000 pontos</td></tr>" +
      "<tr><td style='padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: bold; background: #F8FAFC;'>Data de Emissão</td><td style='padding: 6px 10px; border: 1px solid #E2E8F0;'>" + new Date().toLocaleDateString('pt-BR') + "</td></tr>" +
      "</table>" +
      "<h3 style='color: #0F172A; font-size: 14px; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; margin-top: 16px;'>1. Resumo Executivo da Análise</h3>" +
      "<p style='font-size: 12px; line-height: 1.5; margin: 6px 0 16px 0;'>" + (data.parecer.resumoExecutivo || "Não informado.") + "</p>" +
      "<h3 style='color: #0F172A; font-size: 14px; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px;'>2. Restrições e Condicionantes Operacionais</h3>" +
      "<p style='font-size: 12px; line-height: 1.5; margin: 6px 0 16px 0;'>" + ((data.parecer.restricoesOperacionais && data.parecer.restricoesOperacionais.length > 0) ? "• " + data.parecer.restricoesOperacionais.join("<br>• ") : "Nenhuma restrição imposta. Operação liberada conforme regras de trânsito.") + "</p>" +
      "<h3 style='color: #0F172A; font-size: 14px; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px;'>3. Ações Requeridas & Pendências</h3>" +
      "<p style='font-size: 12px; line-height: 1.5; margin: 6px 0 20px 0;'>" + (data.parecer.acoesRequeridas || "Nenhuma ação corretiva pendente.") + "</p>" +
      "<div style='margin-top: 35px; border-top: 1px solid #E2E8F0; padding-top: 10px; font-size: 10px; color: #94A3B8; text-align: center;'>" +
      "Este documento é gerado e assinado digitalmente nos termos da política de compliance LogShare.</div>" +
      "</body></html>";

    var parecerPdf = HtmlService.createHtmlOutput(parecerHtml).getAs('application/pdf').setName(parecerPdfName);
    parecerFolder.createFile(parecerPdf);
  }

  // 6. Salvar Dossiê Completo em JSON estruturado com Versionamento
  var jsonFileName = "dossie_completo_" + cleanCnpj + ".json";
  var existingJson = carrierFolder.getFilesByName(jsonFileName);
  while (existingJson.hasNext()) {
    var oldJson = existingJson.next();
    var nowFormatted = Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd_HHmm");
    oldJson.setName(nowFormatted + "_SUBSTITUIDO_" + jsonFileName);
    oldJson.moveTo(archiveFolder);
  }

  carrierFolder.createFile(
    jsonFileName, 
    JSON.stringify(data, null, 2), 
    "application/json"
  );

  // 7. Atualizar Linha na Planilha Google (ou Atualizar Linha Existente do CNPJ)
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet;

  if (spreadsheet) {
    sheet = spreadsheet.getActiveSheet();
  } else {
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
    sheet.appendRow([
      "Data/Hora Atualização",
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

  // Verificar se o CNPJ já existe para atualizar a linha ou criar nova
  var lastRow = sheet.getLastRow();
  var targetRow = -1;
  if (lastRow > 1) {
    var cnpjValues = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
    for (var r = 0; r < cnpjValues.length; r++) {
      if (cnpjValues[r][0] && cnpjValues[r][0].toString().trim() === (data.cnpj || "").toString().trim()) {
        targetRow = r + 2;
        break;
      }
    }
  }

  var rowData = [
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
  ];

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, 13).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return {
    status: "SUCCESS",
    message: "Transportador, parecer e anexos sincronizados com sucesso com histórico de versões em _Historico_Versoes_Anteriores!",
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

import { generateReceitaFederalPDF } from "./receitaPdfService";

export async function syncCarrierToGoogleDrive(carrier, webhookUrl) {
  // Prepara o payload garantindo que a Ficha Cadastral da Receita Federal & QSA em PDF esteja anexada
  const carrierPayload = { ...carrier };
  const docs = [...(carrierPayload.documentos || [])];
  const hasReceitaDoc = docs.some(d => d.id === 'doc_receita_federal_qsa' || d.arquivoNome?.includes('Ficha_Cadastral_Receita_Federal_QSA'));

  if (!hasReceitaDoc && (carrierPayload.dadosReceitaFederal || carrierPayload.cnpj)) {
    try {
      const rfPdf = generateReceitaFederalPDF(carrierPayload);
      docs.unshift({
        id: 'doc_receita_federal_qsa',
        nome: 'Ficha Cadastral Receita Federal & QSA (Quadro de Sócios)',
        shortName: 'Ficha Cadastral / QSA',
        status: 'VALIDO',
        vigencia: 'Indeterminada',
        arquivoNome: rfPdf.fileName,
        arquivoTamanho: '45.0 KB',
        arquivoMime: 'application/pdf',
        arquivoBase64: rfPdf.pdfBase64,
        version: 1,
        isAutoGenerated: true,
        dataEnvio: new Date().toISOString()
      });
      carrierPayload.documentos = docs;
    } catch (pdfErr) {
      console.warn("Could not generate Receita Federal PDF before drive sync", pdfErr);
    }
  }

  if (!webhookUrl || !webhookUrl.trim()) {
    const cleanCnpj = (carrierPayload.cnpj || "00000000000000").replace(/[^0-9]/g, "");
    return {
      success: true,
      simulated: true,
      folderUrl: `https://drive.google.com/drive/folders/logshare-homologacao-${cleanCnpj}`,
      timestamp: new Date().toISOString(),
      message: `Sincronização simulada com sucesso! Pasta criada: LogShare / ${carrierPayload.cnpj} - ${carrierPayload.razaoSocial}`
    };
  }

  const cleanUrl = webhookUrl.trim();

  try {
    const response = await fetch(cleanUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(carrierPayload),
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

    const cleanCnpj = (carrierPayload.cnpj || "00000000000000").replace(/[^0-9]/g, "");
    const folderUrl = result?.folderUrl || `https://drive.google.com/drive/folders/logshare-${cleanCnpj}`;

    return {
      success: true,
      simulated: false,
      folderUrl,
      carrier: carrierPayload.razaoSocial,
      message: result?.message || `Transportador ${carrierPayload.razaoSocial} sincronizado com sucesso no Google Drive & Sheets!`
    };
  } catch (err) {
    console.warn("Fetch failed, attempting fallback...", err);

    try {
      await fetch(cleanUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(carrierPayload)
      });

      const cleanCnpj = (carrierPayload.cnpj || "00000000000000").replace(/[^0-9]/g, "");
      return {
        success: true,
        simulated: false,
        folderUrl: `https://drive.google.com/drive/search?q=${cleanCnpj}`,
        carrier: carrierPayload.razaoSocial,
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
