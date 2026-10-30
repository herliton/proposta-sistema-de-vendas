# VFC Multimarcas — Sistema de vendas

Aplicação web em evolução para gestão de veículos, clientes, propostas,
contratos, equipes e relatórios.

## Arquitetura

- **Frontend:** React 19, TypeScript, Vite 8 e Tailwind CSS v4 na raiz.
- **API:** Node.js, Express e ES Modules em `backend/`.
- **Banco:** MySQL 8+ com Prisma; migrações em
  `backend/prisma/migrations/`.
- **Uploads:** arquivos locais em `backend/uploads/`, servidos pela API
  em `/uploads`.

A implementação ainda não atende a todos os critérios da especificação
mestre e não deve ser considerada pronta para produção. Consulte o
[manual local e de publicação na Hostinger](./MANUAL_SUBIDA_HOSTINGER.md)
para lacunas, bloqueadores, configuração e procedimentos de subida.

O módulo **Classificados** consulta os veículos cadastrados pela API,
exibe seus dados e mídias e permite iniciar uma simulação já vinculada ao
veículo selecionado.

## Requisitos

- Node.js 22 (versão declarada em `.mise.toml`) e npm.
- MySQL 8 ou superior.
- Git e acesso à rede para instalar dependências.

## Configuração local

1. Configure MySQL e crie `backend/.env` com `DATABASE_URL` e
   `JWT_SECRET`. O manual explica as variáveis necessárias e como criar o
   banco.
2. Prepare e inicie a API:

   ```bash
   cd backend
   npm ci
   npm run prisma:generate
   npm run db:migrate:deploy
   npm run dev
   ```

3. Em outro terminal, na raiz do repositório, inicie o frontend:

   ```bash
   npm ci
   npm run dev
   ```

O backend usa a porta `4000` e o Vite usa `8443` por padrão. No
desenvolvimento, o Vite encaminha `/api` e `/uploads` para o backend.
No primeiro acesso, a aplicação solicita a configuração do administrador
inicial usando `INITIAL_ADMIN_SETUP_TOKEN` configurado somente no ambiente
da API. O procedimento e os demais bloqueadores de publicação estão no
manual; teste o fluxo em banco local/homologação antes de publicar.

## Testes manuais da API com Thunder Client

Importe a coleção `backend/thunder-client/VFC-Multimarcas.json` na
extensão Thunder Client. Configure as variáveis `baseUrl` (por exemplo
`http://localhost:4000`), `token` e `role`. Execute
`POST /api/auth/login` sem autorização, copie `data.token` da resposta e
defina-o em `token` no ambiente Thunder Client. As demais chamadas
protegidas usam Bearer Token.

A coleção cobre os endpoints atualmente montados no Express. Campos de
ID são variáveis (`{{resourceId}}`, `{{clienteId}}`, `{{veiculoId}}`,
etc.) e precisam ser substituídos por registros de teste existentes.
Criações e alterações devem ser testadas somente em banco local ou de
homologação. `POST /api/auth/register` permanece na coleção apenas para
confirmar que responde `410` e não cria usuários. Use as requisições de
estado e criação do administrador inicial somente durante o bootstrap.

Os endpoints ausentes exigidos pela especificação não aparecem como
implementados na coleção. O inventário de lacunas está no manual.

## Build e testes

```bash
# Frontend (na raiz)
npm run build

# Testes existentes do backend
cd backend
npm test
```

## Publicação

O procedimento documentado considera uma VPS Hostinger Ubuntu com Nginx
e API Node.js persistente. Confirme os recursos do plano contratado e
siga o [manual de publicação](./MANUAL_SUBIDA_HOSTINGER.md). Não use as
credenciais de desenvolvimento do Docker Compose em produção.

## Repositório

<https://github.com/herliton/proposta-sistema-de-vendas>
