# LogShare — Sistema de Homologação & Gestão de Risco de Transportadores

Plataforma desenvolvida para qualificação técnica, auditoria documental, cálculo de Score de Risco (0 a 1000) e emissão de pareceres estruturados de homologação de novos parceiros transportadores da **LogShare**, com sincronização automatizada no **Google Drive** e **Google Sheets**.

---

## 🚀 Funcionalidades Principais

### 1. 🌐 Portal do Transportador (Link Externo de Autoatendimento)
- **Assistente Passo a Passo (Multi-Step Form)**:
  - **Etapa 1 — Dados Cadastrais**: Razão Social, Nome Fantasia, CNPJ com auto-máscara e validação, Inscrição Estadual, Endereço completo, Contatos e Domicílio Bancário.
  - **Etapa 2 — Perfil Operacional & Frota**: Tipos de carga transportada (Geral, Fracionada, FTL, Refrigerada, Perigosos MOPP, E-commerce, Alto Valor), Regiões de atuação, Dimensionamento de frota (Própria vs. Agregada), Tipos de veículos e Tecnologias de rastreamento (Autotrac, Sascar, Omnilink, OnixSat) e sensores embarcados.
  - **Etapa 3 — Gestão de Risco & Seguros**: Apólices RCTR-C (Acidentes) e RC-DC (Roubo/Desaparecimento) obrigatórias, Limite Máximo de Garantia (LMG), Gerenciadora de Risco homologada (Buonny, OpenTech, Brasil Risk, etc.) e PGR.
  - **Etapa 4 — Checklist Documental & Upload Digital**: Upload de documentos em PDF/PNG/JPG com controle de vigência e status visual.
  - **Etapa 5 — Revisão, Declaração LGPD e Protocolo**: Consentimento com termos legais e emissão de protocolo oficial (`HOM-2026-XXXXX`).

### 2. 🛡️ Painel do Especialista LogShare (Backoffice de Compliance)
- **Gestão e Monitoramento de Dossiês**:
  - Métricas e KPIs em tempo real (Total de Dossiês, Aptas, Aptas com Restrições, Não Aptas, Aguardando).
  - Tabela dinâmica com busca em tempo real e filtros de status.
- **Auditoria Documental Item a Item**:
  - Marcação de status individual para cada documento: `[✓ Válido]`, `[⏳ Pendente]`, `[✗ Irregular / Vencido]`.
  - Alerta de vigências.
- **Motor de Score de Risco (0 a 1000 pontos)**:
  - Dimensão 1: Regularidade Documental (0-300 pts)
  - Dimensão 2: Saúde Financeira & Tempo de Mercado (0-300 pts)
  - Dimensão 3: Gerenciamento de Risco & Seguros (0-250 pts)
  - Dimensão 4: Capacidade Operacional & Frota (0-150 pts)
  - Classificação em faixas: **Baixo Risco (Classe A)**, **Médio Risco (Classe B/C)** e **Alto Risco (Classe D)**.
- **Emissor de Parecer Estruturado de Homologação**:
  - Geração nos 3 status oficiais: `Apta`, `Apta com Restrições`, `Não Apta`.
  - Resumo Executivo inteligente gerado automaticamente.
  - Condicionantes e Restrições operacionais pré-configuradas e personalizáveis.
  - Ações requeridas e passos para regularização.
  - **Impressão / PDF em Papel Timbrado Oficial LogShare**, cópia para área de transferência e sincronização com a nuvem.

### 3. ☁️ Integração com Google Drive e Planilhas Google
- **Estruturação de Pastas por CNPJ**:
  - `LogShare - Homologação de Transportadores / [CNPJ] - [Razão Social] / 01_Documentos_Cadastrais /`
  - `LogShare - Homologação de Transportadores / [CNPJ] - [Razão Social] / 02_Pareceres_Homologacao /`
- **Google Apps Script (GAS) Webhook**:
  - Código fonte pronto incluso na interface (aba *Google Drive Sync*) para implantação no Google Workspace com 1 clique.
  - Atualização automática de linhas na Planilha Google Mestre.
  - Exportação em lote de dados em CSV e backup JSON.

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- Node.js 18+ instalado.

### Instalação e Execução
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```
Acesse no navegador: **`http://localhost:5173/`**

### Build de Produção
```bash
npm run build
```

---

## 📁 Estrutura de Arquivos

```
├── index.html                      # Ponto de entrada com fontes Inter e Jakarta Sans
├── src/
│   ├── main.jsx                    # Bootstrap da aplicação React
│   ├── App.jsx                     # Roteador principal e gerenciador de estado
│   ├── index.css                   # Design System e variáveis visuais LogShare
│   ├── components/
│   │   ├── Navbar.jsx              # Cabeçalho e alternador de visão (Portal vs Painel)
│   │   ├── CarrierPortal/          # Portal Externo do Transportador
│   │   │   ├── CarrierPortal.jsx
│   │   │   ├── Step1Cadastral.jsx
│   │   │   ├── Step2Operacional.jsx
│   │   │   ├── Step3SegurosRisco.jsx
│   │   │   ├── Step4Documentos.jsx
│   │   │   └── Step5RevisaoProtocolo.jsx
│   │   ├── SpecialistPanel/        # Painel do Especialista em Homologação
│   │   │   ├── SpecialistDashboard.jsx
│   │   │   ├── DossierDetail.jsx
│   │   │   ├── RiskScoreEngine.jsx
│   │   │   └── ParecerGenerator.jsx
│   │   └── GoogleDriveSync/        # Módulo de Sincronização Google Workspace
│   │       └── DriveSyncView.jsx
│   └── services/
│       ├── sampleData.js           # Casos reais de exemplo (Apta, Restrições, Não Apta)
│       ├── riskEngineService.js    # Motor de cálculo de score 0-1000 e regras de risco
│       ├── storageService.js       # Persistência local e exportação CSV/JSON
│       └── driveSyncService.js     # Integração e script Google Apps Script
```

---

## 📋 Regras de Homologação e Classificação

| Status Final | Critérios | Diretriz Operacional |
| :--- | :--- | :--- |
| **🟢 Apta** | Documentação 100% regular, RNTRC ativo, seguros RCTR-C e RC-DC vigentes com LMG adequado, Score ≥ 800 | Liberação total para operar em qualquer rota compatível com a apólice. |
| **🟡 Apta com Restrições** | Pendências documentais menores ou score intermediário (600 a 799 pts) | Liberação condicionada a travas operacionais (teto de valor, tipo de carga seca, escolta/isca ou GR). |
| **🔴 Não Apta** | Documentação irregular/vencida, ausência de seguros obrigatórios, restrição grave em GR ou Score &lt; 600 | Bloqueio imediato na plataforma até regularização integral das pendências apontadas. |
