// Sample Carrier Dossiês with realistic transportation data for LogShare
// All dates formatted strictly in DD/MM/YYYY

export const INITIAL_CARRIERS = [
  {
    id: "CARRIER-2026-001",
    protocol: "HOM-2026-89421",
    razaoSocial: "TransRodoviário Express do Brasil Ltda",
    nomeFantasia: "TransRodoviário Express",
    cnpj: "12.345.678/0001-90",
    inscricaoEstadual: "114.567.890.112",
    aberturaCNPJ: "15/03/2014",
    endereco: {
      logradouro: "Av. das Nações Unidas",
      numero: "14261",
      bairro: "Vila Gertrudes",
      cidade: "São Paulo",
      uf: "SP",
      cep: "04794-000"
    },
    contato: {
      responsavel: "Carlos Eduardo Silveira",
      cargo: "Diretor de Operações e Frota",
      email: "carlos.silveira@transrodoviario.com.br",
      telefone: "(11) 98765-4321"
    },
    dadosBancarios: {
      banco: "341 - Itaú Unibanco",
      agencia: "0912",
      conta: "45890-1",
      chavePix: "12.345.678/0001-90"
    },
    perfilOperacional: {
      tiposCarga: ["Carga Geral / Seca", "Lotação (FTL)", "E-commerce & Expressa", "Cargas de Alto Valor"],
      regioes: ["Sudeste (SP, RJ, MG)", "Sul (PR, SC, RS)", "Centro-Oeste (GO, MT, MS)"],
      frotaPropria: 35,
      frotaAgregada: 50,
      tiposVeiculos: ["VUC / 3/4", "Truck", "Carreta LS", "Carreta Baú 28 Paletes"],
      tecnologiaRastreamento: ["Autotrac Satelital", "Sascar", "Omnilink"],
      sensoresSeguranca: ["Trava de 5ª Roda", "Sensor de Desengate", "Botão de Pânico", "Teclado de Comunicação de Bordo"]
    },
    gestaoRisco: {
      seguradora: "Porto Seguro Transportes",
      apoliceRCTR_C: "01.077.982.0001-44",
      apoliceRC_DC: "01.077.982.0002-55",
      vigenciaApolice: "28/02/2028",
      lmg: 1500000,
      gerenciadoraRisco: "Buonny Projetos e Serviços",
      temPGR: true
    },
    documentos: [
      { id: "doc_cnpj", nome: "Cartão CNPJ (Receita Federal)", status: "VALIDO", vigencia: "31/12/2028", arquivoNome: "Cartao_CNPJ_TransRodoviario.pdf", obrigatorio: true },
      { id: "doc_rntrc", nome: "Certificado RNTRC / ANTT", status: "VALIDO", vigencia: "10/05/2029", arquivoNome: "Certificado_ANTT_RNTRC.pdf", obrigatorio: true },
      { id: "doc_rctrc", nome: "Apólice de Seguro RCTR-C", status: "VALIDO", vigencia: "28/02/2028", arquivoNome: "Apolice_RCTR_C_Porto.pdf", obrigatorio: true },
      { id: "doc_rcdc", nome: "Apólice de Seguro RC-DC", status: "VALIDO", vigencia: "28/02/2028", arquivoNome: "Apolice_RC_DC_Porto.pdf", obrigatorio: true },
      { id: "doc_contrato", nome: "Contrato Social Consolidado", status: "VALIDO", vigencia: "Indeterminada", arquivoNome: "Contrato_Social_Consolidado.pdf", obrigatorio: true },
      { id: "doc_cnd_federal", nome: "CND Federal / Previdenciária", status: "VALIDO", vigencia: "15/10/2027", arquivoNome: "CND_Federal_Receita.pdf", obrigatorio: true },
      { id: "doc_cndt", nome: "Certidão Negativa Trabalhista (CNDT)", status: "VALIDO", vigencia: "20/11/2027", arquivoNome: "CNDT_Tribunal_Trabalho.pdf", obrigatorio: true },
      { id: "doc_fgts", nome: "Certificado de Regularidade FGTS (CRF)", status: "VALIDO", vigencia: "30/09/2027", arquivoNome: "CRF_FGTS_Caixa.pdf", obrigatorio: true },
      { id: "doc_bancario", nome: "Comprovante de Domicílio Bancário", status: "VALIDO", vigencia: "Indeterminada", arquivoNome: "Carta_Bancaria_Itau.pdf", obrigatorio: true },
      { id: "doc_pgr", nome: "PGR - Plano de Gerenciamento de Risco", status: "VALIDO", vigencia: "10/01/2028", arquivoNome: "PGR_Buonny_2026.pdf", obrigatorio: false },
      { id: "doc_ambiental_mopp", nome: "Licença Ambiental / MOPP", status: "VALIDO", vigencia: "15/08/2028", arquivoNome: "Licenca_IBAMA_MOPP.pdf", obrigatorio: false }
    ],
    status: "APTA",
    scoreTotal: 940,
    scoreBreakdown: {
      documental: 300,
      financeiro: 290,
      gerenciamentoRisco: 240,
      operacional: 110
    },
    parecer: {
      statusFinal: "APTA",
      dataEmissao: "20/08/2026",
      especialistaNome: "Dra. Renata Vasconcellos (LogShare Compliance)",
      resumoExecutivo: "Transportador com histórico operacional consolidado de 12 anos. Todos os documentos com vigência ampla e regular. Apólices de seguro RCTR-C e RC-DC com LMG de R$ 1.500.000,00 e gerenciamento de risco ativo via Buonny.",
      restricoesOperacionais: [],
      acoesRequeridas: "Nenhuma pendência identificada. Cadastro liberado para qualquer rota e operação compatível com o LMG da apólice.",
      observacoesInternas: "Parceiro com excelente pontuação para rotas prioritárias."
    },
    dataCriacao: "18/08/2026",
    ultimaAtualizacao: "20/08/2026"
  },
  {
    id: "CARRIER-2026-002",
    protocol: "HOM-2026-77312",
    razaoSocial: "LogNorte Transportes & Cargas Especiais Ltda",
    nomeFantasia: "LogNorte Cargas",
    cnpj: "98.765.432/0001-10",
    inscricaoEstadual: "002.884.119.001",
    aberturaCNPJ: "10/06/2021",
    endereco: {
      logradouro: "Rodovia BR-153, Km 12",
      numero: "S/N",
      bairro: "Distrito Industrial",
      cidade: "Goiânia",
      uf: "GO",
      cep: "74000-000"
    },
    contato: {
      responsavel: "Marcos Vinícius Prado",
      cargo: "Gerente de Logística",
      email: "marcos.prado@lognorte.com.br",
      telefone: "(62) 99123-8877"
    },
    dadosBancarios: {
      banco: "001 - Banco do Brasil",
      agencia: "3201-4",
      conta: "19402-9",
      chavePix: "financeiro@lognorte.com.br"
    },
    perfilOperacional: {
      tiposCarga: ["Carga Geral / Seca", "Lotação (FTL)", "Granel"],
      regioes: ["Centro-Oeste (GO, MT, MS)", "Norte (PA, TO)"],
      frotaPropria: 8,
      frotaAgregada: 25,
      tiposVeiculos: ["Truck", "Carreta LS", "Bitrem Graneleiro"],
      tecnologiaRastreamento: ["OnixSat"],
      sensoresSeguranca: ["Botão de Pânico"]
    },
    gestaoRisco: {
      seguradora: "Tokio Marine Seguradora",
      apoliceRCTR_C: "TM-2026-90118",
      apoliceRC_DC: "TM-2026-90119",
      vigenciaApolice: "15/11/2027",
      lmg: 400000,
      gerenciadoraRisco: "OpenTech Gestão Logística",
      temPGR: true
    },
    documentos: [
      { id: "doc_cnpj", nome: "Cartão CNPJ (Receita Federal)", status: "VALIDO", vigencia: "31/12/2028", arquivoNome: "CNPJ_LogNorte.pdf", obrigatorio: true },
      { id: "doc_rntrc", nome: "Certificado RNTRC / ANTT", status: "VALIDO", vigencia: "20/08/2028", arquivoNome: "ANTT_LogNorte.pdf", obrigatorio: true },
      { id: "doc_rctrc", nome: "Apólice de Seguro RCTR-C", status: "VALIDO", vigencia: "15/11/2027", arquivoNome: "RCTR_C_Tokio.pdf", obrigatorio: true },
      { id: "doc_rcdc", nome: "Apólice de Seguro RC-DC", status: "VALIDO", vigencia: "15/11/2027", arquivoNome: "RC_DC_Tokio.pdf", obrigatorio: true },
      { id: "doc_contrato", nome: "Contrato Social Consolidado", status: "VALIDO", vigencia: "Indeterminada", arquivoNome: "Contrato_Social.pdf", obrigatorio: true },
      { id: "doc_cnd_federal", nome: "CND Federal / Previdenciária", status: "VALIDO", vigencia: "01/11/2027", arquivoNome: "CND_Federal.pdf", obrigatorio: true },
      { id: "doc_cndt", nome: "Certidão Negativa Trabalhista (CNDT)", status: "IRREGULAR", vigencia: "10/01/2025", arquivoNome: "CNDT_2025_Vencida.pdf", obrigatorio: true },
      { id: "doc_fgts", nome: "Certificado de Regularidade FGTS (CRF)", status: "VALIDO", vigencia: "15/09/2026", arquivoNome: "CRF_Caixa.pdf", obrigatorio: true },
      { id: "doc_bancario", nome: "Comprovante de Domicílio Bancário", status: "VALIDO", vigencia: "Indeterminada", arquivoNome: "Extrato_BB.pdf", obrigatorio: true },
      { id: "doc_pgr", nome: "PGR - Plano de Gerenciamento de Risco", status: "VALIDO", vigencia: "15/11/2027", arquivoNome: "PGR_OpenTech.pdf", obrigatorio: false },
      { id: "doc_ambiental_mopp", nome: "Licença Ambiental / MOPP", status: "PENDENTE", vigencia: "Ausente", arquivoNome: "Ausente.pdf", obrigatorio: false }
    ],
    status: "APTA_COM_RESTRICOES",
    scoreTotal: 685,
    scoreBreakdown: {
      documental: 230,
      financeiro: 210,
      gerenciamentoRisco: 165,
      operacional: 80
    },
    parecer: {
      statusFinal: "APTA_COM_RESTRICOES",
      dataEmissao: "22/08/2026",
      especialistaNome: "Especialista em Homologação LogShare",
      resumoExecutivo: "Transportadora de médio porte com foco regional. Cadastro aprovado com ressalvas devido ao limite de apólice (LMG R$ 400.000,00) e pendência na renovação da CNDT.",
      restricoesOperacionais: [
        "Teto de valor de carga fixado em R$ 300.000,00 por viagem",
        "Rastreamento obrigatório",
        "Consulta prévia de motoristas e equipamento na Gerenciadora de Risco (12h)"
      ],
      acoesRequeridas: "1. Enviar CNDT atualizada em até 15 dias corridos.\n2. Para cargas acima de R$ 350 mil, apresentar endosso de apólice com ampliação do LMG.",
      observacoesInternas: "Operação restrita a cargas secas e rotas pavimentadas."
    },
    dataCriacao: "21/08/2026",
    ultimaAtualizacao: "22/08/2026"
  },
  {
    id: "CARRIER-2026-003",
    protocol: "HOM-2026-61044",
    razaoSocial: "TransVeloz Soluções Logísticas ME",
    nomeFantasia: "TransVeloz Express",
    cnpj: "45.112.334/0001-56",
    inscricaoEstadual: "ISENTO",
    aberturaCNPJ: "20/11/2025",
    endereco: {
      logradouro: "Rua Santa Ifigênia",
      numero: "330",
      bairro: "Centro",
      cidade: "Curitiba",
      uf: "PR",
      cep: "80010-000"
    },
    contato: {
      responsavel: "Fernando Henrique Lima",
      cargo: "Sócio Administrador",
      email: "fernando@transvelozexpress.com",
      telefone: "(41) 99888-1122"
    },
    dadosBancarios: {
      banco: "260 - Nu Pagamentos",
      agencia: "0001",
      conta: "8821039-1",
      chavePix: "45.112.334/0001-56"
    },
    perfilOperacional: {
      tiposCarga: ["Cargas de Alto Valor", "E-commerce & Expressa"],
      regioes: ["Sul (PR, SC, RS)"],
      frotaPropria: 2,
      frotaAgregada: 3,
      tiposVeiculos: ["Vans / Utilitários", "VUC / 3/4"],
      tecnologiaRastreamento: ["Rastreador Celular / App"],
      sensoresSeguranca: []
    },
    gestaoRisco: {
      seguradora: "Não informada",
      apoliceRCTR_C: "Sem Apólice Ativa",
      apoliceRC_DC: "Sem Apólice Ativa",
      vigenciaApolice: "Vencida",
      lmg: 0,
      gerenciadoraRisco: "Nenhuma cadastrada",
      temPGR: false
    },
    documentos: [
      { id: "doc_cnpj", nome: "Cartão CNPJ (Receita Federal)", status: "VALIDO", vigencia: "31/12/2028", arquivoNome: "CNPJ_TransVeloz.pdf", obrigatorio: true },
      { id: "doc_rntrc", nome: "Certificado RNTRC / ANTT", status: "IRREGULAR", vigencia: "15/02/2025", arquivoNome: "ANTT_Suspenso.pdf", obrigatorio: true },
      { id: "doc_rctrc", nome: "Apólice de Seguro RCTR-C", status: "IRREGULAR", vigencia: "Vencida", arquivoNome: "Ausente.pdf", obrigatorio: true },
      { id: "doc_rcdc", nome: "Apólice de Seguro RC-DC", status: "IRREGULAR", vigencia: "Vencida", arquivoNome: "Ausente.pdf", obrigatorio: true },
      { id: "doc_contrato", nome: "Contrato Social Consolidado", status: "VALIDO", vigencia: "Indeterminada", arquivoNome: "Contrato_Social.pdf", obrigatorio: true },
      { id: "doc_cnd_federal", nome: "CND Federal / Previdenciária", status: "IRREGULAR", vigencia: "01/01/2025", arquivoNome: "Certidao_Positiva.pdf", obrigatorio: true },
      { id: "doc_cndt", nome: "Certidão Negativa Trabalhista (CNDT)", status: "IRREGULAR", vigencia: "01/01/2025", arquivoNome: "Nao_Enviado.pdf", obrigatorio: true },
      { id: "doc_fgts", nome: "Certificado de Regularidade FGTS (CRF)", status: "IRREGULAR", vigencia: "10/02/2025", arquivoNome: "CRF_Inadimplente.pdf", obrigatorio: true },
      { id: "doc_bancario", nome: "Comprovante de Domicílio Bancário", status: "VALIDO", vigencia: "Indeterminada", arquivoNome: "Comprovante_NuBank.pdf", obrigatorio: true },
      { id: "doc_pgr", nome: "PGR - Plano de Gerenciamento de Risco", status: "IRREGULAR", vigencia: "Inexistente", arquivoNome: "Inexistente.pdf", obrigatorio: false },
      { id: "doc_ambiental_mopp", nome: "Licença Ambiental / MOPP", status: "IRREGULAR", vigencia: "Inexistente", arquivoNome: "Inexistente.pdf", obrigatorio: false }
    ],
    status: "NAO_APTA",
    scoreTotal: 310,
    scoreBreakdown: {
      documental: 80,
      financeiro: 100,
      gerenciamentoRisco: 30,
      operacional: 100
    },
    parecer: {
      statusFinal: "NAO_APTA",
      dataEmissao: "23/08/2026",
      especialistaNome: "Especialista em Homologação LogShare",
      resumoExecutivo: "Empresa recém-constituída com pendências críticas impeditivas para operação. Ausência total de seguros obrigatórios (RCTR-C e RC-DC), RNTRC suspenso e irregularidades fiscais.",
      restricoesOperacionais: [
        "BLOQUEIO TOTAL NA PLATAFORMA LOGSHARE"
      ],
      acoesRequeridas: "1. Regularizar situação do RNTRC perante a ANTT;\n2. Contratar apólices de seguro obrigatórias RCTR-C e RC-DC;\n3. Sanar apontamentos fiscais e trabalhistas.",
      observacoesInternas: "Risco severo de sinistralidade e passivo fiscal."
    },
    dataCriacao: "23/08/2026",
    ultimaAtualizacao: "23/08/2026"
  },
  {
    id: "CARRIER-2026-004",
    protocol: "HOM-2026-99052",
    razaoSocial: "Sul Minas Cargas Fracionadas S/A",
    nomeFantasia: "Sul Minas Logística",
    cnpj: "33.882.119/0001-44",
    inscricaoEstadual: "062.991.002.331",
    aberturaCNPJ: "04/09/2018",
    endereco: {
      logradouro: "Av. do Contorno",
      numero: "4500",
      bairro: "Funcionários",
      cidade: "Belo Horizonte",
      uf: "MG",
      cep: "30110-028"
    },
    contato: {
      responsavel: "Juliana Mendes Alcantara",
      cargo: "Supervisora de Contratos e Homologação",
      email: "juliana.alcantara@sulminaslog.com.br",
      telefone: "(31) 98444-5566"
    },
    dadosBancarios: {
      banco: "033 - Santander Brasil",
      agencia: "1102",
      conta: "770192-3",
      chavePix: "33.882.119/0001-44"
    },
    perfilOperacional: {
      tiposCarga: ["Fracionada", "Refrigerada & Congelada", "Carga Geral / Seca"],
      regioes: ["Sudeste (SP, RJ, MG, ES)", "Nordeste (BA, PE, CE)"],
      frotaPropria: 22,
      frotaAgregada: 40,
      tiposVeiculos: ["VUC / 3/4", "Toco Refrigerado", "Truck Frigorífico", "Carreta 3 Eixos"],
      tecnologiaRastreamento: ["Autotrac", "Omnilink com Sensor de Temperatura"],
      sensoresSeguranca: ["Sensor de Abertura de Baú", "Sensor de Temperatura em Tempo Real", "Trava de 5ª Roda"]
    },
    gestaoRisco: {
      seguradora: "Chubb Seguros Brasil",
      apoliceRCTR_C: "CH-2026-8812",
      apoliceRC_DC: "CH-2026-8813",
      vigenciaApolice: "30/04/2028",
      lmg: 800000,
      gerenciadoraRisco: "Brasil Risk Gerenciamento",
      temPGR: true
    },
    documentos: [
      { id: "doc_cnpj", nome: "Cartão CNPJ (Receita Federal)", status: "VALIDO", vigencia: "31/12/2028", arquivoNome: "Cartao_CNPJ_SulMinas.pdf", obrigatorio: true },
      { id: "doc_rntrc", nome: "Certificado RNTRC / ANTT", status: "VALIDO", vigencia: "12/10/2028", arquivoNome: "RNTRC_ANTT_Ativo.pdf", obrigatorio: true },
      { id: "doc_rctrc", nome: "Apólice de Seguro RCTR-C", status: "VALIDO", vigencia: "30/04/2028", arquivoNome: "Apolice_RCTR_C_Chubb.pdf", obrigatorio: true },
      { id: "doc_rcdc", nome: "Apólice de Seguro RC-DC", status: "VALIDO", vigencia: "30/04/2028", arquivoNome: "Apolice_RC_DC_Chubb.pdf", obrigatorio: true },
      { id: "doc_contrato", nome: "Contrato Social Consolidado", status: "VALIDO", vigencia: "Indeterminada", arquivoNome: "Estatuto_Social_SulMinas.pdf", obrigatorio: true },
      { id: "doc_cnd_federal", nome: "CND Federal / Previdenciária", status: "VALIDO", vigencia: "05/12/2027", arquivoNome: "CND_Federal_Regular.pdf", obrigatorio: true },
      { id: "doc_cndt", nome: "Certidão Negativa Trabalhista (CNDT)", status: "VALIDO", vigencia: "10/12/2027", arquivoNome: "CNDT_Regular.pdf", obrigatorio: true },
      { id: "doc_fgts", nome: "Certificado de Regularidade FGTS (CRF)", status: "VALIDO", vigencia: "01/10/2027", arquivoNome: "CRF_FGTS_Valido.pdf", obrigatorio: true },
      { id: "doc_bancario", nome: "Comprovante de Domicílio Bancário", status: "VALIDO", vigencia: "Indeterminada", arquivoNome: "Carta_Santander.pdf", obrigatorio: true },
      { id: "doc_pgr", nome: "PGR - Plano de Gerenciamento de Risco", status: "VALIDO", vigencia: "30/04/2028", arquivoNome: "PGR_BrasilRisk_CargaFria.pdf", obrigatorio: false },
      { id: "doc_ambiental_mopp", nome: "Licença Ambiental / MOPP", status: "VALIDO", vigencia: "15/09/2028", arquivoNome: "MOPP_SulMinas.pdf", obrigatorio: false }
    ],
    status: "AGUARDANDO_ANALISE",
    scoreTotal: 860,
    scoreBreakdown: {
      documental: 290,
      financeiro: 270,
      gerenciamentoRisco: 220,
      operacional: 80
    },
    parecer: null,
    dataCriacao: "26/08/2026",
    ultimaAtualizacao: "26/08/2026"
  }
];
