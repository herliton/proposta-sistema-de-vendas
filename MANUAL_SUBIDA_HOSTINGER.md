# Manual de execução local e publicação na Hostinger

Este manual descreve a situação encontrada no repositório e os caminhos de
publicação na Hostinger. O site atual usa hospedagem Cloud/Business com
frontend Vite estático; a API Express precisa ser publicada como uma
aplicação Node.js separada, preferencialmente em um subdomínio `api`.
A seção de VPS é uma alternativa separada.

> **Estado atual: não liberar para produção ainda.** Há bloqueadores de
> segurança e requisitos funcionais incompletos listados abaixo. Os
> comandos de infraestrutura não substituem a correção desses itens.

**Diagnóstico da publicação atual:** o build `593b3cf` foi publicado como
Vite estático. `https://solucoesfinanceiras.net.br/` responde `200`, mas
`/api/health` responde `404`; não há processo backend nem variáveis de
ambiente Node.js configuradas nesse site. A configuração local conecta ao
MySQL da Hostinger. O banco já foi salvo em backup privado antes da
intervenção; as quatro migrações Prisma foram aplicadas de forma aditiva
após verificar que as duas tabelas preexistentes não colidiam com as
tabelas da aplicação. Essas duas tabelas foram preservadas. A API ainda
precisa ser publicada e configurada para que o site funcione.

## 1. O que existe hoje

| Área | Estado observado | Diferença principal para a especificação |
|---|---|---|
| Frontend | React/Vite; consulta alguns endpoints da API | Não há suíte de testes de frontend nem verificação fim a fim de todos os CRUDs e estados da interface. |
| Classificados | Ligado ao estoque via `GET /api/veiculos`, com pesquisa, status, paginação, dados e mídias cadastradas; “Iniciar simulação” transfere o ID do veículo | Validar manualmente com usuário autenticado, veículos com/sem foto e cada status; o backend ainda exige cinco fotos no cadastro e a opção “Todos” inclui vendidos, que não podem iniciar simulação. |
| Backend | Node.js, Express, ES Modules e Prisma | A especificação permite manter o ORM existente; não é necessário migrar para `mysql2` apenas para publicar. |
| Banco | MySQL Hostinger conectado; quatro migrações aplicadas | O schema da aplicação agora está criado no banco; isso não comprova que todos os fluxos estejam completos. |
| Usuários e equipes | CRUD administrativo e fluxo inicial de administrador com segredo temporário, bloqueio transacional, auditoria e limite persistido de tentativas | Validar os cenários de configuração em banco local/homologação. O antigo `/api/auth/register` retorna `410` e não cria usuários. |
| Módulos e permissões | Consulta de módulos e leitura/atualização da matriz por perfil | O catálogo não tem CRUD completo nem há CRUD individual de permissão como especificado. |
| Clientes e veículos | CRUD, validações e consulta FIPE existentes | Não foi encontrada rota ViaCEP. Conferir transferência, escopo, exclusão lógica, contagem de propostas ativas e transições de status contra os requisitos. |
| Propostas/negócios | `Proposta` implementa parte da simulação, status, histórico e PDF | `/api/deals` tem apenas histórico e contratação de consultoria; não há CRUD completo de `deals` nem todos os endpoints especializados de simular/aprovar/rejeitar. |
| Comissões e auditoria | Tabelas, relatórios e geração de comissão existentes | Não há recurso `/api/commissions` com todas as operações de ajuste, pagamento e estorno. Percentuais padrão precisam de aprovação comercial. Validar a cobertura e imutabilidade da auditoria. |
| Financiamento bancário | Modelo não encontrado no schema/migrações | A própria especificação deixa o modelo pendente de definição. |
| PDF | PDFKit e endpoint de proposta existentes | O contrato pede arquivo privado persistido, hash no banco e URL temporária assinada; confirmar/implementar esse armazenamento. |
| Testes | Testes unitários de validação e configuração de segurança | Faltam testes de CRUD/API, autorização, isolamento por loja/equipe/vendedor, concorrência, PDF, SMTP e transições comerciais. |
| Publicação | O domínio está publicado como frontend Vite estático; API e variáveis Node.js ainda não estão configuradas | Publique o backend separadamente, configure `DATABASE_URL`, `JWT_SECRET`, `INITIAL_ADMIN_SETUP_TOKEN` e `CORS_ORIGINS`; aplique migrações somente após backup. |

### Bloqueadores antes de expor a API à internet

1. **Segredo JWT:** a aplicação agora falha ao iniciar em produção sem
   `JWT_SECRET`; gere um segredo exclusivo e não reutilize valores antigos.
2. **Cadastro público fechado:** `/api/auth/register` retorna `410` e
   não cria usuários. O primeiro administrador usa a tela de
   configuração inicial protegida por segredo de servidor; teste esse
   fluxo antes de publicar.
3. **Seed de módulos/permissões:** a inicialização agora insere somente
   registros ausentes em lotes; permissões personalizadas existentes não
   são sobrescritas e o seed evita transações longas no MySQL remoto.
4. **Hardening HTTP:** CORS agora exige origens explícitas em produção,
   mas login e recuperação de senha ainda não têm limite de tentativas. O
   handler global envia `err.message` ao cliente. Corrigir esses itens
   antes de expor a API.
5. **Primeiro administrador:** não foi encontrado seed/migração de usuário
   `ADMIN`. Implementar o fluxo inicial pela aplicação descrito na
   seção 5.3.1 abaixo. Não usar o cadastro público nem armazenar senha em
   texto puro para contornar isso.
6. **Segredos e Docker Compose:** `backend/docker-compose.yml` contém
   senhas exemplificativas e publica a porta 3306. Usar apenas em
   desenvolvimento isolado; nunca usar esses valores em produção.
7. **Uploads e PDFs:** uploads ficam no disco local da instância. Defina
   armazenamento persistente, permissões, backup e política de acesso.
   Não tratar `/uploads` como armazenamento privado de documentos.
8. **Decisões comerciais:** confirmar fórmula financeira, taxas,
   percentuais de comissão, cancelamento/reversão de venda, permissões e
   dados empresariais do PDF antes de ativar os fluxos.

## 2. Ferramentas e situação desta máquina

Na inspeção desta máquina foram encontrados:

- Node.js `24.19.0`; o projeto declara Node.js `22` em `.mise.toml`.
- npm `12.2.0`.
- MySQL `8.4.11`, compatível com o requisito MySQL 8+.
- Docker `29.1.3`.
- Dependências npm ainda não instaladas na raiz nem em `backend/`.
- O arquivo local `backend/.env` não é versionado. Nunca publique valores
  reais de `.env` ou de arquivos de exemplo.

Use Node.js 22 para alinhar desenvolvimento, testes e VPS. Com `mise`
instalado:

```bash
cd /caminho/para/proposta-sistema-de-vendas
mise install
node --version
npm --version
```

Ter o MySQL ou Docker instalado não confirma que o serviço esteja em
execução nem que exista um banco configurado.

## 3. Preparar o MySQL

Crie um banco e usuário próprios para a aplicação; não use `root` na API.
Para uma instalação local:

```bash
sudo mysql
```

No prompt MySQL, substitua `SENHA_FORTE_UNICA` por uma senha gerada e
guarde-a em local seguro:

```sql
CREATE DATABASE vfc_multimarcas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
CREATE USER 'vfc_user'@'localhost' IDENTIFIED BY 'SENHA_FORTE_UNICA';
GRANT ALL PRIVILEGES ON vfc_multimarcas.* TO 'vfc_user'@'localhost';
```

Se usar banco do hPanel, informe à API o hostname, database, usuário e
senha exibidos no painel. Restrinja o acesso remoto ao IP da VPS; não
abra a porta 3306 para toda a internet.

## 4. Executar localmente

### API

Crie `backend/.env` com os valores locais. Modelo:

```dotenv
NODE_ENV=development
PORT=4000
DATABASE_URL="mysql://vfc_user:SENHA_CODIFICADA@127.0.0.1:3306/vfc_multimarcas"
JWT_SECRET=SEGREDO_ALEATORIO_LOCAL
INITIAL_ADMIN_SETUP_TOKEN=OUTRO_SEGREDO_ALEATORIO
CORS_ORIGINS=http://localhost:5173
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
APP_URL=http://localhost:8443/
SMTP_CONFIG_ENCRYPTION_KEY=
```

Caracteres especiais da senha dentro de `DATABASE_URL` precisam ser
codificados como URL (`@` vira `%40`, por exemplo). Não use segredos
reais em exemplos, commits ou mensagens.

Instale, gere o Prisma Client e aplique as migrações existentes:

```bash
cd backend
npm ci
npm run prisma:generate
npm run db:migrate:deploy
npm run dev
```

A API usa a porta 4000 por padrão. `GET /api/health` verifica se a API
consegue consultar o banco. SMTP é necessário para redefinição de senha e
envio de acesso. `APP_URL` é usado para montar links de e-mail;
`FRONTEND_URL`, citada na especificação, não é consumida pelo código
atual. Use uma `SMTP_CONFIG_ENCRYPTION_KEY` exclusiva para cifrar a senha
SMTP gravada no banco.

Gere segredos com ferramenta criptográfica, por exemplo:

```bash
openssl rand -base64 48
```

Não use o fallback `dev-secret` em nenhum ambiente exposto. O seed de
módulos/permissões roda ao iniciar a API e precisa ser corrigido antes de
customizar permissões.

### Frontend

Em outro terminal, na raiz:

```bash
npm ci
npm run dev
```

O Vite usa a porta 8443 por padrão e encaminha `/api` e `/uploads` para
`http://localhost:4000`. Para build:

```bash
npm run build
```

O artefato é gerado em `dist/`. `VITE_API_URL` é público e fica embutido
no bundle; nunca coloque segredos nele. Em VPS, o padrão recomendado é
manter `/api` e encaminhar as requisições pelo Nginx no mesmo domínio. Na
hospedagem Cloud/Business atual, publique a API em um subdomínio Node.js e
faça o build do frontend com
`VITE_API_URL=https://api.SEUDOMINIO/api`; configure o mesmo domínio do
frontend em `CORS_ORIGINS` no backend.

### Testes existentes

```bash
cd backend
npm test
```

O teste encontrado cobre validação de cliente; essa execução não comprova
os critérios de aceite da especificação.

### Testes manuais da API com Thunder Client

A coleção importável está em
[`backend/thunder-client/VFC-Multimarcas.json`](./backend/thunder-client/VFC-Multimarcas.json).
No VS Code, abra a extensão Thunder Client, escolha **Import** e selecione
esse arquivo. A coleção cobre os endpoints atualmente montados em
`backend/src/app.js`, incluindo rotas de autenticação, permissões,
clientes, vendedores, veículos, propostas, contratos, financeiro,
relatórios, recuperação de crédito, negócios, lojas, equipes e auditoria.
`GET /api/health` também está incluído.

Crie um ambiente Thunder Client para uso local e configure:

| Variável | Exemplo/uso |
|---|---|
| `baseUrl` | `http://localhost:4000` |
| `token` | Bearer token da resposta `data.token` do login |
| `role` | Perfil consultado/atualizado nas rotas de permissões, por exemplo `SELLER` |
| `resourceId`, `clienteId`, `veiculoId`, `propostaId`, `contratoId`, `lojaId`, `equipeId`, `vendedorId`, `usuarioId` | IDs existentes no banco de teste, conforme o endpoint |
| `email`, `emailNovo`, `password`, `temporaryPassword`, `newPassword`, `resetToken` | Dados de usuário/token criados exclusivamente para teste |
| `cpfValido`, `cnpjValido`, `fipeCode` | Documento de teste válido e código FIPE real, conforme a operação |
| `smtpHost`, `smtpUser`, `smtpPassword`, `smtpFrom`, `appUrl` | Dados de SMTP de homologação; não salvar credenciais de produção no ambiente Thunder |

Faça login em `POST /api/auth/login` e copie o campo `data.token` da
resposta para a variável `token`. Endpoints protegidos usam
`Authorization: Bearer {{token}}`; login, recuperação/redefinição de
senha, cadastro atual e health check não usam essa variável. Se o login
de teste exigir primeiro acesso, conclua a troca de senha e faça login
novamente para obter um token válido.

Comece por health check e login; depois use as listagens para obter IDs
válidos antes de testar detalhes e alterações. Algumas operações exigem
pré-condições comerciais, como proposta aprovada para criar contrato e
proposta recusada para contratar consultoria de crédito. Mantenha os
dados de teste isolados e não reutilize senha de produção.

Os corpos JSON da coleção são modelos de requisição. Substitua valores
marcados como `{{variavel}}` por dados coerentes e existentes. A API
aplica validações e regras de negócio, então chamadas de atualização,
aprovação, cancelamento, pagamento e exclusão podem retornar conflito
quando o registro não está no estado permitido. Upload de mídia exige
arquivo multipart selecionado manualmente no Thunder Client. Execute
criações e operações mutáveis somente em banco local ou de homologação;
não use a coleção para disparar testes destrutivos em produção.

`POST /api/auth/register` permanece na coleção somente para confirmar que
o cadastro público foi encerrado: deve responder `410` sem criar usuário.
As chamadas de estado e criação do primeiro administrador estão
disponíveis no grupo de autenticação. Endpoints exigidos pela
especificação mas que ainda não existem não são simulados na coleção;
consulte a tabela de lacunas acima.

## 5. Publicar em uma VPS Hostinger

Este roteiro assume Ubuntu e acesso SSH/root. Confirme no hPanel a versão
do sistema, os nomes de host e a forma de acesso ao MySQL.

### 5.1 Preparar servidor e DNS

1. Crie uma VPS Ubuntu e configure o domínio/subdomínio do sistema.
2. Aponte os registros DNS `A` do domínio e, se usado, `www` para o IP
   público da VPS.
3. Atualize o sistema e instale Nginx, Git, certificados TLS e
   ferramentas básicas. Instale Node.js 22 por método mantido e confirme
   `node --version` e `npm --version`.
4. Permita no firewall somente SSH, HTTP e HTTPS. Não exponha as portas
   4000 e 3306 publicamente.
5. Configure MySQL local ou banco do hPanel, crie usuário exclusivo,
   programe backups e teste a restauração.

### 5.2 Obter e instalar o código

Use deploy key restrito ou outro método aprovado para clonar o
repositório privado. Não coloque token do GitHub na URL ou no histórico
do shell. Substitua `<URL-DO-REPOSITORIO>`:

```bash
sudo mkdir -p /var/www/vfc-multimarcas
sudo chown "$USER":"$USER" /var/www/vfc-multimarcas
git clone <URL-DO-REPOSITORIO> /var/www/vfc-multimarcas
```

Instale dependências do backend:

```bash
cd /var/www/vfc-multimarcas/backend
npm ci
npm run prisma:generate
```

Crie `/etc/vfc-multimarcas/backend.env` fora do repositório, com
permissões restritas ao root e ao usuário do serviço. Configure:

```dotenv
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://USUARIO:SENHA_CODIFICADA@HOST:3306/BANCO
JWT_SECRET=SEGREDO_ALEATORIO_EXCLUSIVO
SMTP_HOST=...
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
APP_URL=https://SEU_DOMINIO/
SMTP_CONFIG_ENCRYPTION_KEY=OUTRO_SEGREDO_ALEATORIO
```

Antes de migrar dados reais, faça backup e revise as migrações pendentes.
Após corrigir os bloqueadores:

```bash
cd /var/www/vfc-multimarcas/backend
npm run db:migrate:deploy
```

Não execute `prisma migrate dev` em produção. Antes de liberar o site,
configure e teste o fluxo de primeiro administrador da seção 5.3.1.

### 5.3 Build do frontend

```bash
cd /var/www/vfc-multimarcas
npm ci
VITE_API_URL=/api npm run build
```

Sirva o conteúdo de `dist/` pelo Nginx. O bundle é público: não inclua
senha, token permanente ou URL com credenciais.

### 5.3.1 Primeiro acesso: criar o administrador pela aplicação

O fluxo está implementado. A tela permite cadastrar **somente o primeiro
administrador**, sem seleção de perfil ou criação pública de usuários.
Depois do bootstrap, usuários subsequentes são criados por administrador
autenticado.

**Comportamento implementado:**

1. A interface consulta um endpoint público de estado de configuração
   que retorna apenas se o bootstrap ainda está pendente. Não deve expor
   dados de usuários, existência de e-mails ou informações internas.
2. Se ainda não houver administrador, a aplicação mostra a tela
   “Configuração inicial” com nome, e-mail, senha, confirmação e um
   código temporário de configuração. O papel `ADMIN` é fixado pelo
   backend; nunca é aceito do corpo da requisição.
3. Antes da primeira tentativa, o operador configura no ambiente da API
   um segredo aleatório de uso único (por exemplo,
   `INITIAL_ADMIN_SETUP_TOKEN`) e o fornece diretamente na tela de
   configuração por canal seguro. Esse segredo não pode estar no bundle
   do frontend, no repositório, em logs ou no arquivo público de variáveis
   `VITE_*`. Não o transmita por URL.
4. O endpoint de criação valida o código em tempo constante, aplica
   limite persistido de dez tentativas por janela de 15 minutos e valida
   os campos/senha no backend. A senha é
   armazenada somente como hash bcrypt. O segredo não deve ser retornado
   pela API.
5. A verificação “não existe administrador” e a criação do usuário
   ocorrem dentro de transação MySQL protegida por bloqueio consultivo,
   impedindo duas requisições simultâneas de criar dois primeiros
   administradores. O marcador persistido de conclusão impede reabrir o
   bootstrap após reinicialização. A auditoria não grava senha nem código.
6. Se outro operador já completou o bootstrap, devolver conflito
   (`409`) sem criar usuário. Após sucesso, o processo remove o segredo
   da variável em memória. Remova-o também do arquivo de ambiente e
   reinicie a API; a tela passa a exibir o login normal. O marcador
   persistido impede reabrir o bootstrap após reinicialização.
7. `POST /api/auth/register` retorna `410` sem criar usuário. Criação de
   usuários depois do bootstrap só ocorre por rota autenticada e
   autorizada para `ADMIN`.

**Procedimento operacional na VPS:**

1. Antes de expor o domínio publicamente, configure
   `INITIAL_ADMIN_SETUP_TOKEN` no arquivo protegido da API com um valor
   forte e aleatório. Gere-o em terminal seguro com `openssl rand -hex 32`,
   copie-o diretamente para o ambiente da API e proteja o arquivo
   (`chmod 600`). Não o salve em `.env` do frontend ou nas variáveis
   compartilhadas do Thunder Client. Restrinja o acesso à tela de
   configuração durante esse período (por exemplo, allowlist de IP no
   Nginx/firewall ou janela de manutenção), mantendo a API acessível
   apenas pelo proxy local.
2. Abra `https://SEU_DOMINIO/` e conclua “Configuração inicial” com os
   dados do administrador responsável. Use uma senha exclusiva e forte.
3. Confirme o acesso ao painel e que a aplicação redireciona para o login
   normal. Confirme também que uma segunda chamada ao bootstrap responde
   `409` e não cria outro administrador.
4. Remova `INITIAL_ADMIN_SETUP_TOKEN` do arquivo de ambiente e reinicie a
   API. Confirme que não é possível reabrir o cadastro inicial e que
   `POST /api/auth/register` não aceita cadastro público.
5. Guarde as credenciais administrativas em um gerenciador de senhas
   corporativo. Não as coloque em documentação, histórico de shell,
   chamados ou logs.

Antes de expor publicamente, execute todos os testes de bootstrap em
banco local ou de homologação e complete o procedimento operacional na
VPS. O fluxo está implementado, mas não foi testado contra o MySQL desta
máquina.

### 5.4 Manter a API em execução

Use systemd ou gerenciador equivalente para iniciar no boot e reiniciar
em falha. Execute a API como usuário sem privilégios. Exemplo de unidade
`/etc/systemd/system/vfc-api.service`; ajuste diretórios, usuário e
caminho absoluto do Node.js instalado:

```ini
[Unit]
Description=API VFC Multimarcas
After=network.target

[Service]
Type=simple
User=vfcapp
Group=vfcapp
WorkingDirectory=/var/www/vfc-multimarcas/backend
EnvironmentFile=/etc/vfc-multimarcas/backend.env
ExecStart=/CAMINHO/ABSOLUTO/PARA/node src/server.js
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Serviços systemd não carregam automaticamente o ambiente interativo de
`mise`/NVM. Configure `ExecStart` com o caminho real do Node.js 22.
Configure permissões de `backend/uploads` para que somente o serviço
grave arquivos.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now vfc-api
sudo systemctl status vfc-api
journalctl -u vfc-api -n 100 --no-pager
```

Não grave variáveis de ambiente, tokens, senha SMTP ou dados pessoais nos
logs.

### 5.5 Nginx, SPA e HTTPS

Exemplo mínimo de virtual host; troque o domínio e valide a configuração
antes de recarregar:

```nginx
server {
    listen 80;
    server_name SEU_DOMINIO www.SEU_DOMINIO;
    root /var/www/vfc-multimarcas/dist;
    index index.html;

    client_max_body_size 105m;

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Valide e recarregue o Nginx. Emita/instale TLS para o domínio com
Let's Encrypt (Certbot ou método oferecido pelo hPanel), force HTTPS e
confirme que a porta 4000 segue privada.

O limite Nginx acompanha aproximadamente o limite atual da API; revise
ambos conforme a política de mídia. `/uploads` serve arquivos estáticos
publicamente. Não o use para documentos confidenciais.

## 6. Checklist pós-publicação

- [ ] DNS resolve para a VPS e HTTPS apresenta certificado válido.
- [ ] `GET https://SEU_DOMINIO/api/health` retorna saúde da API e banco.
- [ ] Login funciona com usuário provisionado pelo fluxo seguro.
- [ ] A configuração inicial foi testada em homologação, cria apenas um
  administrador, é transacional, auditada e fica desativada após o uso.
- [ ] O segredo temporário do bootstrap foi removido do ambiente após o
  cadastro e não aparece em logs ou no frontend compilado.
- [ ] `POST /api/auth/register` responde `410` sem criar usuário.
- [ ] CORS aceita somente origens previstas.
- [ ] JWT não tem fallback para segredo de desenvolvimento.
- [ ] Permissões customizadas sobrevivem a reinícios/deploys.
- [ ] Restauração de backups MySQL e uploads foi testada.
- [ ] SMTP envia mensagens sem registrar credenciais em logs.
- [ ] Uploads têm retenção, backup e acesso definidos.
- [ ] Testes de autorização, escopo e concorrência foram executados em
  homologação.
- [ ] Nenhum segredo foi compilado no frontend ou versionado.
- [ ] Decisões comerciais pendentes da especificação foram aprovadas.

## 7. Rotina de atualização

1. Faça backup do banco e uploads e registre a versão atual.
2. Publique código sem apagar `backend/uploads` nem o arquivo de ambiente.
3. Instale dependências e gere o Prisma Client.
4. Revise as migrações e execute `npm run db:migrate:deploy`.
5. Gere/publice novamente o frontend.
6. Reinicie a API e valide `/api/health`, login e fluxos críticos.
7. Em falha, pare a publicação e restaure código/dados conforme rollback
   previamente testado. Não reverta migrações manualmente sem avaliar os
   dados.

Antes de operação comercial real, acrescente backup automatizado,
homologação, monitoramento, alertas e rollback testado.
