# 📋 Documentação de Endpoints - Backend Integração Ficha Cliente

Este documento descreve os endpoints esperados do backend para integração com o sistema de "Ficha do Cliente" no frontend.

## 🔐 Autenticação

Todos os endpoints requerem o header:
```
Authorization: ****** [token]
```

## 📁 Endpoints de Fichas

### 1. Criar Nova Ficha
```
POST /fichas
Content-Type: application/json
Authorization: Bearer [token]

Body:
{
  "clienteId": 123,
  "telefoneFixo": "(11) 3000-0000",
  "telefoneCelular": "(11) 99999-9999",
  "whatsapp": "(11) 99999-9999",
  "dataNascimento": "1990-05-15",
  "sexo": "M",
  "estadoCivil": "Casado(a)",
  "residenciaTipo": "Casa",
  "tempoResidencia": "5",
  "empresaNome": "Empresa XYZ",
  "cargoFuncao": "Analista",
  "classificacaoTrabalho": "CLT",
  "renda": "5000.00",
  "valorVeiculo": "50000.00",
  "valorEntrada": "15000.00",
  "valorFinanciado": "35000.00",
  "taxaMensal": "1.2",
  "garantiaEstendida": true,
  "garantiaEstendidaValor": "2500.00",
  "seguroVeiculo": false,
  "seguroVeiculoValor": "0.00",
  "protecaoFinanceira": true,
  "protecaoFinanceiraValor": "1800.00",
  "rastreamentoGps": false,
  "rastreamentoGpsValor": "0.00",
  "assessoriaJuridica": false,
  "assessoriaJuridicaValor": "0.00"
}

Response 200:
{
  "data": {
    "id": 456,
    "clienteId": 123,
    "createdAt": "2026-11-11T10:00:00Z",
    ...
  },
  "message": "Ficha salva com sucesso"
}
```

### 2. Atualizar Ficha
```
PUT /fichas/:fichaId
Content-Type: application/json
Authorization: Bearer [token]

Body: (mesmo da criação, mas com campos opcionais)

Response 200:
{
  "data": { ... },
  "message": "Ficha atualizada com sucesso"
}
```

### 3. Recuperar Ficha
```
GET /fichas/:fichaId
Authorization: Bearer [token]

Response 200:
{
  "data": { ... },
  "message": "Ficha recuperada com sucesso"
}
```

### 4. Listar Fichas do Cliente
```
GET /fichas/cliente/:clienteId
Authorization: Bearer [token]

Response 200:
{
  "data": [ { ... }, { ... } ],
  "message": "Fichas recuperadas com sucesso"
}
```

### 5. Deletar Ficha
```
DELETE /fichas/:fichaId
Authorization: Bearer [token]

Response 204: (Sem conteúdo)
```

### 6. Persistir Ficha com PDF
```
POST /fichas/persist-with-pdf
Content-Type: multipart/form-data
Authorization: Bearer [token]

Body:
- ficha (JSON string)
- pdf (Blob/File)

Response 200:
{
  "data": {
    "fichaId": 456,
    "pdfId": "abc123def456",
    "fileName": "ficha-joao-silva-2026-11-11.pdf"
  },
  "message": "Ficha e PDF salvos com sucesso"
}
```

## 📄 Endpoints de PDFs

### 1. Upload de PDF
```
POST /fichas/upload-pdf
Content-Type: multipart/form-data
Authorization: Bearer [token]

Body:
- file (Blob/File)
- clienteNome (string)
- clienteEmail (string)

Response 200:
{
  "data": {
    "pdfId": "abc123def456",
    "fileName": "ficha-joao-silva-2026-11-11.pdf",
    "emailSent": true
  },
  "message": "PDF salvo com sucesso"
}
```

### 2. Download de PDF
```
GET /fichas/download-pdf/:pdfId
Authorization: Bearer [token]

Response 200: (Binary PDF data)
Content-Type: application/pdf
```

### 3. Listar PDFs do Cliente
```
GET /fichas/pdfs/:clienteId
Authorization: Bearer [token]

Response 200:
{
  "data": [
    {
      "pdfId": "abc123def456",
      "fileName": "ficha-joao-silva-2026-11-11.pdf",
      "createdAt": "2026-11-11T10:00:00Z",
      "fileSize": 245632
    }
  ]
}
```

### 4. Deletar PDF
```
DELETE /fichas/pdf/:pdfId
Authorization: Bearer [token]

Response 204: (Sem conteúdo)
```

## ✉️ Endpoints de Email

### 1. Enviar PDF por Email
```
POST /fichas/email-pdf
Content-Type: application/json
Authorization: Bearer [token]

Body:
{
  "pdfId": "abc123def456",
  "destinatario": "cliente@email.com"
}

Response 200:
{
  "message": "Email enviado com sucesso",
  "data": {
    "messageId": "msg123"
  }
}
```

### 2. Enviar Ficha por Email
```
POST /fichas/:fichaId/send-email
Content-Type: application/json
Authorization: Bearer [token]

Body:
{
  "destinatario": "cliente@email.com",
  "incluirPdf": true
}

Response 200:
{
  "message": "Email enviado com sucesso",
  "data": { ... }
}
```

## 📊 Endpoints de Estatísticas

### 1. Obter Estatísticas de Fichas
```
GET /fichas/stats
Authorization: Bearer [token]

Response 200:
{
  "data": {
    "totalFichas": 150,
    "fichasEsteMes": 25,
    "fichasComPdf": 145,
    "emailsEnviados": 140,
    "mediaValorFinanciado": 35000.00
  }
}
```

## 🛠️ Implementação Frontend

### Importar as funções:
```typescript
import {
  saveFichaToBackend,
  updateFichaOnBackend,
  getFichaFromBackend,
  listClientFichas,
  deleteFichaFromBackend,
  persistFichaWithPdf,
  sendFichaByEmail,
  getFichasStats
} from "./api/fichasApi";

import {
  savePdfToServer,
  sendPdfByEmail,
  downloadPdfFromServer,
  listClientPdfs,
  deletePdfFromServer
} from "./api/pdfStorage";
```

### Exemplo de uso:
```typescript
const token = localStorage.getItem("vfcAuthToken") || "";

// Salvar ficha
const result = await saveFichaToBackend(fichaData, token);
if (result.success) {
  console.log("Ficha ID:", result.fichaId);
}

// Persistir com PDF
const pdfResult = await persistFichaWithPdf(fichaData, pdfBlob, fileName, token);
if (pdfResult.success) {
  console.log("Ficha ID:", pdfResult.fichaId);
  console.log("PDF ID:", pdfResult.pdfId);
}

// Enviar por email
await sendFichaByEmail(fichaId, clienteEmail, true, token);
```

## 📝 Status HTTP Esperados

| Status | Significado |
|--------|-------------|
| 200 | OK - Operação bem-sucedida |
| 201 | Created - Recurso criado |
| 204 | No Content - Deletado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito nos dados |
| 422 | Unprocessable Entity - Validação falhou |
| 500 | Internal Server Error - Erro no servidor |

## 🔒 Validações Esperadas do Backend

### Para Ficha:
- `clienteId`: Deve existir na tabela de clientes
- `telefoneFixo`, `telefoneCelular`, `whatsapp`: Formato de telefone válido
- `dataNascimento`: Data válida e no passado
- `valorVeiculo`, `valorEntrada`, `valorFinanciado`: Números positivos
- `valorFinanciado` deve ser menor que `valorVeiculo - valorEntrada`
- `taxaMensal`: Entre 0.1% e 10% ao mês

### Para Email:
- Email deve ser válido
- Servidor SMTP deve estar configurado
- PDF deve estar salvo antes de enviar

### Para PDF:
- Arquivo deve ser PDF válido
- Tamanho máximo: 50MB
- Nome do arquivo: Sanitizado e único

## 📦 Estrutura de Diretórios Esperada (Backend)

```
/uploads
  /fichas
    /pdfs
      ficha-joao-silva-2026-11-11.pdf
      ficha-maria-santos-2026-11-11.pdf
  /fichas_backup
    [backups de fichas deletadas]
```

## 🔄 Fluxo Completo de Integração

1. **Usuário preenche formulário** → Frontend valida dados localmente
2. **Clica "Visualizar Ficha"** → Frontend salva em localStorage e mostra preview
3. **Preview revisado** → Usuário clica "Gerar e Baixar PDF"
4. **PDF gerado** → Frontend faz download local E envia para backend
5. **Backend persiste PDF** → Armazena em `/uploads/fichas/pdfs/`
6. **Email enviado** → Backend envia para cliente com PDF anexado
7. **Feedback ao usuário** → Frontend exibe sucesso/erro

## 🚀 Próximas Implementações

- [ ] Webhook para notificações de eventos
- [ ] Assinatura digital de PDFs
- [ ] Backup automático para cloud
- [ ] Versionamento de fichas
- [ ] Aprovação em workflow
- [ ] Integração com sistema de crédito

---

**Data de Criação:** 2026-11-11  
**Versão:** 1.0  
**Status:** Documentação Completa
