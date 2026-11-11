# Ficha de Cliente - Implementação de Geração de PDF

## 📋 Resumo das Mudanças

O componente "Ficha do Cliente" foi aprimorado com um fluxo completo de 3 etapas até a geração do PDF:

### Etapas Implementadas:

1. **FORMULÁRIO (Etapa 1)** - Coleta de dados do cliente
   - Informações pessoais (nome, data de nascimento, sexo, estado civil)
   - Contato (telefone fixo, celular, WhatsApp)
   - Informações profissionais (empresa, cargo, classificação, renda)
   - Dados de residência (tipo, tempo)
   - Valores de financiamento (veículo, entrada, valor a financiar, taxa mensal)

2. **PREVIEW (Etapa 2)** - Visualização da Ficha antes de gerar PDF
   - Exibição formatada de todos os dados preenchidos
   - Cálculo automático de simulações de parcelamento (12x, 24x, 36x, 48x, 60x)
   - Tabela com valor das parcelas, total e juros estimados
   - Botão para editar a ficha se necessário
   - Botão para gerar o PDF

3. **PDF (Etapa 3)** - Geração e download do PDF
   - Conversão da ficha visualizada em imagem de alta qualidade
   - Geração de PDF com paginação automática se necessário
   - Download automático do arquivo

## 🎯 Fluxo de Uso

```
Preenchimento de Dados → Salvar → Visualizar Preview → Gerar PDF → Download
```

## 📄 Arquivos Modificados/Criados

### Novo Arquivo:
- **`/src/SellerClientRegistration2.tsx`** (24.3 KB)
  - Componente principal com as 3 etapas integradas
  - Gerenciamento de estado com `currentStep`
  - Integração com `generateFichaPdf()` e `calcularSimulacoes()`
  - Formatação visual completa da ficha

### Componentes Utilizados:
- **`/src/components/FichaPdfGenerator.tsx`** (2.1 KB)
  - `generateFichaPdf()` - Converte elemento HTML para PDF com múltiplas páginas
  - `calcularSimulacoes()` - Calcula parcelamentos com base em valor e taxa

### Já Existente (Sem Mudanças):
- `/src/App.tsx` - Já importava `SellerClientRegistration2`
- `/src/MoneyInput.tsx` - Componente de entrada de valores monetários
- `/src/api/baseUrl.ts` - Configuração de URL da API

## 🔧 Tecnologias Utilizadas

- **html2canvas** - Converte elemento HTML em canvas/imagem
- **jsPDF** - Gera arquivos PDF com suporte a múltiplas páginas
- **React** - Gerenciamento de estado e ciclo de vida

## ✨ Funcionalidades Principais

### 1. Formulário com 5 Passos
Cada passo está claramente identificado numericamente no formulário:
- 01 - Informações do Cliente
- 02 - Contato
- 03 - Informações Profissionais
- 04 - Residência
- 05 - Valores de Financiamento

### 2. Validação
- Campo "Cliente" é obrigatório
- Taxa mensal é obrigatória
- Formatação automática de telefones (máscara)
- Conversão automática de valores monetários

### 3. Simulações Automáticas
Ao visualizar a ficha, são calculadas automaticamente as simulações para:
- 12 parcelas
- 24 parcelas
- 36 parcelas
- 48 parcelas
- 60 parcelas

Cada simulação inclui:
- Valor da parcela
- Total a pagar
- Juros estimados

### 4. Preview Profissional
A visualização da ficha inclui:
- Header com data de geração
- Agrupamento de dados por seção
- Formatação monetária (R$)
- Tabela de simulações com bordas e alinhamento
- Estilos inline para compatibilidade com PDF

### 5. Geração de PDF
- Nome do arquivo: `Ficha_{NomeDoCliente}_{DataAtual}.pdf`
- Qualidade: 2x escala
- Formato: A4 em modo retrato
- Paginação automática se conteúdo ultrapassar uma página
- Margens: 10mm em todos os lados

## 🚀 Como Usar

### Para o Vendedor

1. Acesse o menu "Ficha do Cliente"
2. Selecione um cliente na lista
3. Preencha todos os dados do formulário
4. Clique em "Visualizar Ficha"
5. Revise os dados na prévia
6. Clique em "Gerar e Baixar PDF"
7. O PDF será baixado automaticamente

### Para Editar

Se após visualizar a ficha desejar fazer alterações:
1. Clique em "Editar Ficha"
2. Modifique os dados necessários
3. Clique novamente em "Visualizar Ficha"

## 📊 Estado do Componente

```typescript
type FormData = {
  telefoneFixo: string;
  telefoneCelular: string;
  whatsapp: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  residenciaTipo: string;
  tempoResidencia: string;
  empresaNome: string;
  cargoFuncao: string;
  classificacaoTrabalho: string;
  renda: string;
  valorVeiculo: string;
  valorEntrada: string;
  valorFinanciado: string;
  taxaMensal: string;
}
```

## 🔐 Segurança

- Token de autenticação validado em todas as requisições
- Dados sensíveis são apenas processados no lado do cliente
- PDF é gerado localmente antes de download

## 🐛 Tratamento de Erros

- Mensagens amigáveis de erro/sucesso
- Campos obrigatórios validados
- Fallback para "N/A" em campos não preenchidos
- Try-catch para operações de API e geração de PDF

## 📱 Responsividade

- Grid layout responsivo
- Tabela de simulações adaptável
- Estilos específicos para preview (print-friendly)

## 🎨 CSS Utilizado

Classes CSS utilizadas (definidas em `/src/index.css`):
- `.content` e `.module-content`
- `.module-heading`
- `.panel` e `.form-panel`
- `.step-title`
- `.customer-form-grid`
- `.form-actions`
- `.auth-submit` e `.secondary-button`
- `.notice-success` e `.notice-error`
- `.money-input-wrapper`
- `.ficha-preview`

## 📝 Notas

- A taxa mensal padrão é 1.2%
- Valores monetários são formatados com 2 casas decimais
- Datas são formatadas conforme localização pt-BR
- Os dados salvos retornam com ID da ficha criada do backend

## 🔄 Fluxo de API

1. **GET** `/clientes` - Carrega lista de clientes ao montar o componente
2. **POST** `/seller-client-registration` - Salva os dados da ficha e retorna com ID
3. Geração de PDF acontece localmente no navegador (sem API)

---

**Data de Implementação:** 2026-11-11
**Status:** ✅ Completo e testado
