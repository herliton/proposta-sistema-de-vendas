# ESPECIFICAÇÃO MESTRE DE IMPLEMENTAÇÃO DO TIM

## Sistema de Vendas de Veículos, Recuperação de Crédito e Gestão de Propostas

**Versão:** 2.0 --- MySQL 8.0+ e CRUD integral\
**Idioma:** Português do Brasil
**Frontend:** React
**Backend:**  Node Js

------------------------------------------------------------------------

# 1. INSTRUÇÃO PRINCIPAL PARA A IA DE DESENVOLVIMENTO

Atue como engenheiro de software sênior, arquiteto full-stack e
especialista em segurança de aplicações. Implemente um sistema web
funcional para gestão de estoque de veículos, clientes PF/PJ, equipes,
usuários, simulações, propostas, aprovação de crédito, contratos
efetivados, consultoria de recuperação de crédito, comu366207451_vfc_userissões, permissões
e auditoria.

Esta especificação é o contrato funcional da implementação. Não entregue
apenas telas estáticas, exemplos isolados, pseudocódigo ou rotas
incompletas. Cada funcionalidade deve estar conectada ao banco MySQL e
possuir validação no frontend e, obrigatoriamente, no backend.

## 1.1 Regras obrigatórias de execução

1.  Antes de alterar o projeto, inspecione a estrutura existente,
    `package.json`, scripts, dependências, rotas, componentes,
    configuração e banco de dados.
2.  Preserve funcionalidades já existentes que não conflitem com esta
    especificação. Não recrie o projeto nem substitua bibliotecas sem
    necessidade.
3.  Se o repositório já tiver padrões arquiteturais definidos, siga-os;
    documente divergências relevantes.
4.  Use MySQL 8.0 ou superior, InnoDB, `utf8mb4` e migrações SQL
    versionadas.
5.  Implemente CRUD completo para todas as entidades gerenciáveis
    listadas neste documento.
6.  Não crie botões sem ação real. Não simule persistência com arrays
    locais, `localStorage` ou dados fixos em produção.
7.  Não deixe `TODO`, métodos vazios, endpoints fictícios ou telas sem
    integração. Se uma integração externa depender de credenciais,
    implemente o adaptador, a configuração por ambiente e mensagens de
    indisponibilidade.
8.  Entregue implementação incremental, executável e testada. Ao final,
    informe o que foi implementado, os comandos para executar, as
    variáveis de ambiente necessárias, as migrações executadas e os
    testes realizados.
9.  Não exponha senhas, tokens, segredos, dados pessoais ou detalhes
    internos em logs.
10. Quando houver ambiguidade de regra comercial, não invente valores
    financeiros. Isole a regra em configuração e registre a dúvida para
    confirmação.

# 2. STACK TÉCNICA

-   **Backend:** Node.js, Express.js e JavaScript CommonJS, salvo se o
    projeto existente já usar TypeScript de forma consistente.
-   **Banco:** MySQL 8.0+, driver `mysql2/promise`.
-   **Frontend:** React 19, Vite, TypeScript e Tailwind CSS v4, salvo
    incompatibilidade comprovada com o projeto existente.
-   **API:** REST JSON com prefixo `/api`.
-   **Autenticação:** JWT com expiração configurável; senhas com bcrypt.
-   **E-mail:** Nodemailer via SMTP.
-   **PDF:** PDFKit ou Puppeteer, conforme padrão do projeto.
-   **Integrações:** ViaCEP e serviço de consulta da Tabela FIPE.
-   **Testes:** Node test runner ou Jest/Vitest no backend, testes de
    componentes e integração conforme estrutura do projeto.
-   **Qualidade:** ESLint e formatação compatíveis com o projeto
    existente.

Não misture drivers ou ORMs sem necessidade. Para esta especificação,
priorize `mysql2/promise` com consultas parametrizadas e camada
Repository. Se o projeto já usar Prisma, Sequelize ou Knex, mantenha um
único padrão e adapte as migrações.

# 3. ARQUITETURA E ORGANIZAÇÃO

## 3.1 Backend

Organize, de forma compatível com o projeto existente, em camadas:

-   `routes/`: definição dos endpoints e middlewares.
-   `controllers/`: leitura da requisição e montagem da resposta HTTP.
-   `services/`: regras de negócio e coordenação de transações.
-   `repositories/`: consultas SQL parametrizadas.
-   `middlewares/`: autenticação, autorização, validação, tratamento de
    erros e auditoria.
-   `validators/`: validação dos parâmetros e corpos das requisições.
-   `services/integrations/`: ViaCEP, FIPE e e-mail.
-   `database/migrations/`: scripts versionados.
-   `database/seeds/`: dados iniciais idempotentes.
-   `tests/`: testes unitários e de integração.

Use pool de conexões MySQL. Nunca concatene entrada do usuário em SQL.
Use placeholders (`?`) para valores. Para ordenação dinâmica, aceite
apenas campos e direções presentes em listas permitidas.

## 3.2 Frontend

Organize por módulos funcionais, mantendo componentes reutilizáveis:

-   layout principal, navegação e menu baseado nas permissões;
-   páginas de listagem com filtros, paginação e ordenação;
-   formulários de criação e edição;
-   páginas de detalhes;
-   componentes de confirmação para exclusão lógica e mudanças de
    status;
-   estados de carregamento, vazio, sucesso e erro;
-   cliente HTTP centralizado, tratamento de sessão expirada e mensagens
    consistentes;
-   validações de formulário e máscaras para CPF, CNPJ, CEP, telefone e
    moeda.

A interface pode ocultar opções sem permissão, mas a autorização real
deve sempre ocorrer no backend.

# 4. PADRÕES DE BANCO DE DADOS MYSQL

## 4.1 Convenções

-   Todas as tabelas transacionais devem usar `ENGINE=InnoDB`,
    `CHARSET=utf8mb4` e `COLLATE=utf8mb4_unicode_ci`.
-   Use `VARCHAR(36)` para UUIDs em formato textual, gerados no backend
    ou com `UUID()`. Padronize um único método.
-   Valores monetários: `DECIMAL(12,2)`; nunca use `FLOAT` ou `DOUBLE`
    para valores financeiros.
-   Datas de criação: `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`.
-   Atualização:
    `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    quando aplicável.
-   Flags booleanas: `TINYINT(1) NOT NULL DEFAULT 0/1`.
-   Defina `NOT NULL`, `DEFAULT`, índices e restrições explicitamente.
-   Toda tabela gerenciável deve possuir `criado_em` e, quando houver
    edição, `atualizado_em`.
-   Nas tabelas com exclusão lógica, usar `excluido_em DATETIME NULL` e,
    quando necessário, `excluido_por VARCHAR(36) NULL`. Todas as
    consultas normais devem filtrar `excluido_em IS NULL`.
-   Não aplique exclusão lógica automaticamente a registros que devam
    constituir evidência contábil ou de auditoria. Logs de auditoria
    devem ser imutáveis pela aplicação.
-   Use restrições `CHECK` do MySQL 8.0 para valores possíveis quando
    apropriado, sem substituir validação de aplicação.
-   Use índices para FKs, campos de busca e filtros frequentes.
-   Não dependa de `INSERT IGNORE` para esconder erros de seed. Seeds
    devem ser idempotentes por chave única e documentar a estratégia de
    atualização.
-   Todas as alterações de schema devem ser entregues em migrações
    versionadas e reversíveis quando tecnicamente seguro.

## 4.2 Dependência circular entre equipes e usuários

As tabelas `equipes` e `usuarios` têm dependência circular: uma equipe
referencia seu gerente em `usuarios`, enquanto o usuário referencia sua
equipe. Resolva a criação em etapas:

1.  Criar `equipes` sem a FK de `gerente_id`.
2.  Criar `usuarios` com a FK `equipe_id`.
3.  Adicionar a FK `equipes.gerente_id` para `usuarios.id` após ambas
    existirem.

Ao excluir ou desativar um gerente, tratar a equipe explicitamente. Não
excluir usuários que possuam negócios, comissões ou logs associados.

# 5. ENTIDADES E CRUD OBRIGATÓRIO

Implemente CRUD integral para cada entidade abaixo. Para cada uma,
disponibilize operações de listar com filtros/paginação, consultar por
ID, criar, atualizar e excluir logicamente quando aplicável. Operações
não permitidas por integridade ou regra de negócio devem retornar erro
HTTP claro e não deixar alterações parciais.

## 5.1 `modulos_sistema` --- catálogo de módulos

Campos existentes: `id`, `nome`, `rota`, `icone`.

CRUD: - listar módulos; - consultar módulo por ID; - criar módulo; -
atualizar nome, rota e ícone; - excluir módulo somente se não houver
permissões associadas, ou mediante fluxo administrativo explícito.

Regras: - `id` é identificador estável, único e não deve ser alterado
após uso. - Rotas devem ser únicas. - Apenas ADMIN pode gerenciar o
catálogo. - A exclusão de módulo não deve remover silenciosamente
configurações importantes.

## 5.2 `permissoes_perfil` --- permissões por perfil e módulo

Campos existentes: `id`, `perfil`, `modulo_id`, `pode_acessar`.

CRUD: - listar permissões por perfil; - consultar permissão por ID; -
criar ou configurar permissão; - atualizar `pode_acessar`; - remover uma
configuração apenas por ADMIN, respeitando a regra de acesso padrão.

Regras: - Manter unicidade `(perfil, modulo_id)`. - Perfis permitidos:
`ADMIN`, `GERENTE`, `VENDEDOR`, `SUPORTE`. - `ADMIN` tem acesso
administrativo total por regra explícita do backend; a interface não
deve depender apenas de uma linha na matriz. - Negar por padrão quando
não existir permissão configurada. - A alteração de permissões deve ser
auditada. - Proteger contra remoção acidental do último acesso
administrativo. - Separar permissão de menu de autorização para ações
sensíveis quando necessário. Uma permissão de leitura não deve autorizar
aprovação, exclusão ou alteração financeira.

## 5.3 `equipes` --- equipes comerciais

Campos existentes: `id`, `nome`, `gerente_id`, `criado_em`. Adicionar
`atualizado_em` e campos de exclusão lógica conforme padrão.

CRUD: - listar equipes com nome e gerente; - consultar equipe por ID e
visualizar seus membros; - criar equipe; - editar nome e gerente; -
desativar/excluir logicamente a equipe conforme vínculos; - transferir
usuários entre equipes, com autorização e auditoria.

Regras: - O gerente indicado deve existir, estar ativo e ter perfil
`GERENTE`, salvo exceção administrativa documentada. - Definir política
para usuários vinculados a uma equipe desativada: exigir transferência
ou desvinculação explícita. - Não permitir que gerente comum consulte ou
altere equipes fora de seu escopo. - A exclusão física só pode ocorrer
se não houver vínculos; preferir exclusão lógica.

Vínculos vendedor-equipe são períodos históricos (`EquipeVinculo`):
`iniciadoEm`, `encerradoEm`, usuário que associou e usuário que encerrou.
Um vendedor tem somente uma equipe atual (`Usuario.equipeId`), mas pode
ter vários vínculos encerrados ao longo do tempo. Gerente pode associar
vendedor sem equipe ou desassociar vendedor da própria equipe; desmarcar
o vendedor encerra o período e limpa sua equipe/gerente atuais. A aba de
edição apresenta o histórico de períodos. A migração cria um vínculo
inicial para membros existentes; como não há datas históricas anteriores,
esse período começa na data da migração.

## 5.4 `usuarios` --- usuários e equipe

Campos existentes: identidade, contato, endereço, perfil, equipe, chave
PIX, meta mensal, status ativo, primeiro acesso e dados de redefinição
de senha.

CRUD: - listar usuários com filtros por nome, e-mail, perfil, equipe e
situação; - consultar usuário por ID; - criar usuário; - atualizar dados
cadastrais, perfil, equipe, meta e situação; - desativar usuário; -
reativar usuário; - iniciar redefinição de senha; - alterar senha no
primeiro acesso; - consultar equipe e dados de perfil conforme
permissão.

Regras: - E-mail único e normalizado (trim e lowercase). - Não retornar
`hash_senha`, token de redefinição ou segredo em respostas da API. - A
senha nunca deve ser armazenada em texto puro. - Preferir envio de link
de ativação/redefinição com token de uso único, em vez de enviar senha
temporária por e-mail. Se o requisito de senha temporária for mantido,
gerar senha aleatória, expiração curta e exigir troca no primeiro
acesso. - Guardar somente o hash do token de redefinição; o token em
texto puro só é enviado ao usuário. - Token de redefinição deve expirar,
ser de uso único e ser invalidado após sucesso. - Não permitir que um
usuário comum altere seu próprio perfil para ADMIN. - Não permitir
desativar o último ADMIN ativo. - Usuário inativo não pode autenticar
nem usar tokens antigos. - Validar CPF/CNPJ quando forem introduzidos em
fluxos que os exijam; não inventar obrigatoriedade para os campos
existentes. - Dados de chave PIX devem ter acesso restrito. - Nunca
excluir fisicamente usuário que possua histórico comercial ou de
auditoria.

## 5.5 `veiculos` --- estoque

Campos existentes: marca, modelo, ano de fabricação/modelo, código e
preço FIPE, preço sugerido, preço mínimo, status, descrição, cinco URLs
de fotos e URL de vídeo.

CRUD: - listar veículos com filtros por marca, modelo, anos, faixa de
preço e status; - consultar veículo por ID, fotos, vídeo e quantidade de
simulações/propostas ativas; - cadastrar veículo; - editar dados,
preços, descrição e mídias; - desativar ou retirar de exposição; -
consultar/atualizar avaliação FIPE por integração, quando disponível.

Regras: - `preco_sugerido >= preco_minimo >= 0`. - Preços e anos devem
ser validados no servidor. - A especificação original exige cinco URLs
de fotos no cadastro. Preserve essa exigência inicialmente; caso o
produto deva permitir cadastro sem todas as fotos, trate como decisão de
produto, não como alteração implícita. - A duração do vídeo deve ser
limitada a 60 segundos quando houver upload ou metadados verificáveis.
Se for somente URL externa, documentar que a duração não pode ser
garantida apenas pela URL. - `VENDIDO` não pode voltar para `DISPONIVEL`
por edição genérica. Exigir fluxo administrativo auditado de reversão,
se permitido. - Não permitir apagar veículo com histórico de negócio.
Usar desativação/exclusão lógica. - A consulta `simulacoes_ativas_count`
deve contar negócios nos estados `SIMULACAO` e `PROPOSTA`, sem gerar uma
consulta N+1. Usar agregação ou subconsulta eficiente. - A transição de
status deve ser centralizada em serviço de negócio, não em qualquer
endpoint CRUD.

## 5.6 `clientes` --- pessoas físicas e jurídicas

Campos existentes: tipo, dados PF/PJ, telefone, e-mail, endereço,
vendedor atual e criação.

CRUD: - listar clientes com busca por nome, CPF, CNPJ, telefone e
e-mail; - consultar cliente por ID e histórico comercial autorizado; -
criar cliente PF ou PJ; - atualizar dados; - transferir responsável
comercial; - desativar/excluir logicamente; - preencher endereço por CEP
via ViaCEP, permitindo revisão manual e tratando indisponibilidade.

Regras: - Para `PF`, exigir `nome_completo` e CPF conforme política de
cadastro aprovada; campos exclusivos de PJ não devem ser usados como
substitutos. - Para `PJ`, exigir razão social e CNPJ conforme política
aprovada; permitir nome fantasia e pessoa de contato. - Validar dígitos
verificadores de CPF/CNPJ no backend, além de unicidade no banco. -
Normalizar documentos para pesquisa e evitar duplicidade por diferenças
de pontuação. Decidir e documentar se serão armazenados apenas dígitos
ou com máscara; preferir armazenar apenas dígitos. - Não exigir que
ViaCEP esteja disponível para salvar um endereço já informado
manualmente. - O vendedor atual deve existir e estar ativo. - A
transferência de cliente deve ser auditada. - Não permitir exclusão
física de cliente com negócios; preservar histórico e restringir acesso
a dados pessoais.

## 5.7 `negocios` --- simulações, propostas e vendas

Campos existentes: tipo, cliente, veículo, vendedor, status, valores
financeiros, número de parcelas, taxa, motivo de recusa e datas.

CRUD e operações: - listar negócios com filtros por cliente, veículo,
vendedor, equipe, tipo, status e período; - consultar negócio por ID com
histórico de alterações autorizado; - criar simulação; - atualizar
simulação ou proposta em aberto; - gerar proposta comercial em PDF; -
registrar recusa de crédito; - aprovar proposta; - cancelar negócio
segundo regras de transição; - registrar contratação de consultoria de
recuperação de crédito; - consultar histórico de status.

Regras: - `tipo`: `VENDA_VEICULO` ou `CONSULTORIA_CREDITO`. - `status`:
`SIMULACAO`, `PROPOSTA`, `CREDITO_RECUSADO`, `CONTRATO_EFETIVADO`,
`CANCELADO`. - Cliente e vendedor devem existir e estar ativos no
momento da operação. - Negócio do tipo venda de veículo deve referenciar
veículo; negócio de consultoria pode não referenciar veículo. - Não
permitir alterar diretamente status, vendedor, valores finais ou veículo
por atualização genérica sem passar pelas regras de negócio. - Simulação
e proposta só podem ser editadas enquanto estiverem nos estados
permitidos. Negócios efetivados não podem ser reescritos como se
estivessem em aberto. - Validar
`valor_negociado >= veiculos.preco_minimo` no servidor, usando o preço
mínimo atual e a política de exceção aprovada. - Validar entrada, taxa,
parcelas e valores não negativos. Documentar a unidade de `taxa_juros`
(percentual mensal ou anual) antes de implementar o cálculo. - O cálculo
de amortização deve ter fórmula, periodicidade, arredondamento e testes
definidos. Não assumir taxa mensal/anual sem confirmação. - A
atualização do veículo para `EM_NEGOCIACAO`, a gravação do negócio e o
log devem ocorrer na mesma transação. - Ao rejeitar uma proposta, só
devolver o veículo para `DISPONIVEL` se não existir outra
simulação/proposta ativa para ele e se não estiver vendido. - Ao aprovar
uma proposta, bloquear concorrência por transação/lock, verificar que o
veículo não foi vendido e impedir duas vendas simultâneas do mesmo
veículo. - Na aprovação, definir veículo como `VENDIDO`, efetivar o
negócio e encerrar/rejeitar as demais simulações/propostas pendentes do
veículo com motivo `Veículo Vendido`, tudo em transação. - Não criar
comissões duplicadas ao repetir uma requisição. Usar idempotência ou
restrição única adequada. - As regras de cancelamento e eventual
reversão de venda precisam ser explícitas, autorizadas e auditadas.

## 5.8 `comissoes` --- livro de comissões

Campos existentes: negócio, usuário, tipo, valor, pago e criação.
Adicionar atualização quando aplicável e campos de pagamento se a
operação precisar de data/comprovante.

CRUD: - listar comissões com filtros por usuário, negócio, tipo,
situação e período; - consultar comissão por ID; - criar comissão por
rotina autorizada; - editar valor/tipo somente por perfil autorizado e
antes do pagamento, com auditoria; - marcar como paga e registrar
data/responsável; - cancelar/estornar por operação específica e
auditada; - exportar relatório.

Regras: - Comissão ligada a negócio e usuário existentes. - Valor não
negativo. - Comissões de negócio efetivado devem seguir regra de cálculo
configurável e documentada. - A especificação de origem não define
percentuais, bases de cálculo nem divisão entre
vendedor/gerente/consultoria. Não inventar esses parâmetros: criar
configuração ou solicitar decisão do responsável pelo produto. - Após
pagamento, não permitir edição destrutiva; usar estorno/ajuste
auditado. - Não excluir fisicamente comissões. - A geração deve ser
transacional e idempotente.

## 5.9 `logs_auditoria` --- trilha imutável

Campos existentes: usuário, ação, detalhes JSON e data de criação.

Operações: - listar e consultar logs para perfis autorizados; - filtrar
por usuário, ação, entidade e período; - exportar registros, se
autorizado. - Não disponibilizar criação, edição ou exclusão genérica
pela API pública. Os serviços internos gravam os eventos.

Regras: - Cada evento deve registrar usuário executor, ação,
entidade/tipo, ID do registro, data/hora e detalhes seguros antes/depois
quando necessário. - Nunca incluir senhas, tokens, segredos ou dados
pessoais desnecessários. - Falha ao registrar auditoria em operação
crítica deve impedir o commit da transação quando a auditoria fizer
parte do requisito de integridade. - Somente perfis autorizados podem
consultar logs; nenhum usuário comum pode apagá-los.

## 5.10 Entidade pendente: tabelas de financiamento bancário

O módulo `BANK_TABLES` existe no catálogo, mas a especificação original
não contém uma tabela para armazenar as tabelas de financiamento. Não
invente campos definitivos sem confirmação. Antes de implementar o CRUD
desse módulo, definir pelo menos: - instituição financeira; -
produto/modalidade; - taxa e periodicidade; - número mínimo/máximo de
parcelas; - vigência inicial/final; - situação ativa/inativa; - usuário
responsável e datas de auditoria.

Se a implementação precisar avançar sem resposta, propor um modelo
inicial em migração separada e marcá-lo como decisão pendente de
validação.

**Implementação inicial (pendente de validação comercial):** tabelas
`TabelaFinanciamento` e `Beneficio` (migração
`20261023040000_financing_rates_benefits`), com exclusão lógica e auditoria.
API: `/api/financing-rates` (leitura pelo módulo RATES; escrita ADMIN/SUPPORT) e
`/api/benefits` (leitura pelo módulo BENEFITS; escrita ADMIN/SUPPORT). A
simulação usa apenas tabelas ativas, vigentes e mensais, e o backend recusa
taxa/parcelas que não constem em tabela vigente. Os valores antes fixos na
simulação foram semeados como registros editáveis.

Os benefícios escolhidos na simulação são gravados em `PropostaBeneficio`
(migração `20261023050000_proposal_benefits`), com cópia do nome e da
descrição no momento da proposta, e listados no PDF (seção 3). O backend
rejeita benefícios inexistentes ou inativos (`beneficioIds`).

### Equipes e vendedores

Um vendedor pertence a no máximo uma equipe (`Usuario.equipeId`). O
gerente cria/edita a sua equipe associando vendedores ativos da mesma
loja (`memberIds`); quem estava em outra equipe é movido e a auditoria
registra `movedFrom`. O gerente também pode cadastrar um vendedor novo
(`POST /teams/sellers`), já vinculado a ele e à sua equipe. As opções vêm
de `GET /teams/seller-options`.

### Ficha de recuperação de crédito

Consultoria vendida para elevar o score. Todo financiamento recusado
(`CREDIT_REJECTED`) cria a `OportunidadeCredito` e a `FichaRecuperacao`
(1:1, opcional) com os dados da proposta; também é possível criar a ficha
direto, com cliente existente ou novo (`POST /credit-recovery/fichas`).
Nome, e-mail, telefone e endereço ficam em `Cliente` (fonte única).
Vendedor e gerente complementam; só ADMIN/SUPPORT/MANAGER excluem registros.

Escopo: ADMIN/SUPPORT por loja; MANAGER as fichas suas ou de seus
vendedores; SELLER só as suas. Uma ficha aberta por cliente.

Passos (abas):
1. **Ficha cadastral**: identificação, documentos, CNH, endereço (ViaCEP),
   residência, contatos, referências (Amigo/Pai/Mãe/Filho/Outros), empresa,
   simulação e segunda opção de veículo, cada uma com parcelas
   (quantidade, mínima, máxima).
2. **Controle administrativo** (`FichaContato`): contatos numerados, com
   protocolo automático DDMMHHmm, SPC, dívida, consultor(a), setor, tratativa.
3. **Análise bancária** (`FichaAnaliseBancaria`): instituição, data/hora,
   resposta, quem submeteu e a proposta completa.
4. **Acompanhamento financeiro** (`FichaAcompanhamento`): contatos com
   checklist OK/Não de 9 requisitos fixos, responsável e data/hora; score de
   início e de término do acompanhamento com data/hora (`PATCH .../score`).

O primeiro contato, análise ou acompanhamento muda o status de ABERTA
para EM_ANDAMENTO.

Complementos:
- Exclusão: `DELETE /credit-recovery/fichas/:id` (lógica, `deletedAt`,
  auditoria `FICHA_DELETED`), só ADMIN/SUPPORT/MANAGER.
- Evolução do score: diferença término − início exibida como `+N pts`
  (verde), `-N pts` (vermelho) ou `0 pts` na lista e no passo 4.
- Gerente: vê e complementa todas as fichas da loja (como Admin/Suporte).
- Ficha cadastral editável por Vendedor, Gerente, Admin e Suporte (só
  CPF/CNPJ é fixo). Cada alteração grava em `AuditLog`
  (`FICHA_RECUPERACAO_UPDATED.alteracoes`: campo, valor antes, valor depois,
  usuário e data/hora); salvar sem mudança não gera registro.
- Passo 5 - Dossiê: `GET /credit-recovery/fichas/:id/dossie` gera o PDF com
  a ficha completa + linha do tempo (quem, quando, o quê) montada a partir
  de `AuditLog` (ações `FICHA_*`, incluindo mudanças de score com valor
  anterior). `GET /credit-recovery/fichas/:id/historico` alimenta a aba.
- PDF: `GET /credit-recovery/fichas/:id/pdf` (PDFKit, `fichaPdfService.js`),
  com logo/dados da loja, os 4 passos, valores em R$ e datas pt-BR; mesmo
  escopo por perfil. Botão "Baixar PDF" no cabeçalho da ficha.

## 5.11 PDF - Requisito Especial
- Use biblioteca pdfkit no backend.
- Proposta deve conter: Logo da loja (de /imagem/), dados do cliente, foto principal do veículo, valores, entrada, financiado, parcelas, taxa, validade.
- Salvar em storage privado: /imagem/documentos/ e guardar hash_arquivo no banco.
- Retornar URL temporária assinada.

# 6. PADRÃO DE ENDPOINTS REST E CRUD

Use nomes de recursos consistentes em inglês na URL, mantendo o conteúdo
e as mensagens em português, conforme padrão inicial do projeto.

## 6.1 Endpoints CRUD padrão

Para cada recurso gerenciável, implemente:

-   `GET /api/{resource}` --- listar com paginação, filtros e ordenação
    permitida.
-   `GET /api/{resource}/:id` --- consultar por ID.
-   `POST /api/{resource}` --- criar.
-   `PUT /api/{resource}/:id` --- atualizar integralmente os campos
    editáveis, com validação.
-   `PATCH /api/{resource}/:id` --- atualização parcial somente se
    prevista pelo contrato da API.
-   `DELETE /api/{resource}/:id` --- exclusão lógica/desativação, quando
    aplicável; nunca apagar histórico financeiro ou de auditoria.

Recursos mínimos: - `/api/modules` - `/api/permissions` - `/api/teams` -
`/api/users` - `/api/vehicles` - `/api/customers` - `/api/deals` -
`/api/commissions` - `/api/audit-logs` (somente leitura) -
`/api/bank-financing-tables` após definição do modelo.

Para compatibilidade com as rotas existentes, podem ser mantidos aliases
`/api/vehicles`, `/api/customers` e `/api/deals`. Não criar rotas
duplicadas com comportamentos diferentes.

## 6.2 Rotas especializadas

Autenticação: - `POST /api/auth/login` -
`POST /api/auth/forgot-password` - `POST /api/auth/reset-password` -
`POST /api/auth/first-access-change` - `GET /api/auth/me` -
`POST /api/auth/logout`, se houver estratégia de revogação de
sessão/token.

Permissões: - `GET /api/permissions/modules` -
`GET /api/permissions/role/:role` - `PUT /api/permissions/role/:role`

Negócios: - `POST /api/deals/simulate` - `GET /api/deals/:id/pdf` -
`PATCH /api/deals/:id/reject` - `PATCH /api/deals/:id/approve` -
`POST /api/deals/:id/credit-consultancy` - `GET /api/deals/:id/history`

Veículos: - `GET /api/vehicles` deve incluir `simulacoes_ativas_count`
calculado no banco. - `POST /api/vehicles` deve validar campos e
mídias. - Atualização de status deve passar por serviços de domínio.

Clientes: - `GET /api/customers/lookup/cep/:cep` pode consultar ViaCEP
por meio do backend, com timeout e tratamento de falhas.

## 6.3 Resposta e erros padronizados

Resposta de lista:
## 9.4 PDF - Requisito Especial
- Use biblioteca pdfkit no backend.
- Proposta deve conter: Logo da loja (de /imagem/), dados do cliente, foto principal do veículo, valores, entrada, financiado, parcelas, taxa, validade.
- Salvar em storage privado: /imagem/documentos/ e guardar hash_arquivo no banco.
- Retornar URL temporária assinada.

``` json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Resposta de erro:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Verifique os dados informados.",
    "details": []
  }
}
```

Use status HTTP coerentes: - `200`: consulta/atualização bem-sucedida; -
`201`: criação; - `204`: exclusão lógica sem corpo, se esse padrão for
adotado; - `400`: requisição malformada; - `401`: não autenticado; -
`403`: sem autorização; - `404`: recurso inexistente ou não acessível; -
`409`: conflito de unicidade, concorrência ou regra de negócio; - `422`:
dados semanticamente inválidos, se esse padrão for adotado; - `429`:
limite de requisições excedido; - `500`: erro interno genérico, sem
stack trace para o cliente.

Não revele se um e-mail existe em fluxos de recuperação de senha. Use a
mensagem neutra prevista no requisito original.

# 7. PAGINAÇÃO, FILTROS E PESQUISA

-   Paginação padrão: 20 registros; limite máximo configurável, por
    exemplo 100.
-   Retornar total e total de páginas.
-   Validar `page`, `pageSize`, filtros e ordenação.
-   Busca textual deve usar parâmetros e limites razoáveis.
-   Aplicar filtros no banco, não carregar todos os registros para
    filtrar no frontend.
-   Respeitar permissões e escopo do usuário antes de contar ou retornar
    registros.
-   Evitar N+1; usar `JOIN`, agregações ou consultas específicas.
-   Índices devem corresponder aos filtros reais e ser validados com
    `EXPLAIN` quando necessário.

# 8. AUTORIZAÇÃO E ESCOPO DOS DADOS

Perfis: - `ADMIN`: administração global. - `GERENTE`: equipe sob sua
responsabilidade e funções gerenciais autorizadas. - `VENDEDOR`: seus
clientes e negócios, além de dados de estoque autorizados. - `SUPORTE`:
operações de suporte, aprovação de crédito, tabelas bancárias e
comissões conforme permissões.

Regras obrigatórias: 1. Autenticar e autorizar no backend em cada
endpoint. 2. Aplicar escopo de registros em consultas, atualizações,
PDFs e exportações. 3. Um vendedor não pode obter registros de outro
vendedor alterando o ID na URL. 4. Um gerente só pode acessar sua
equipe, salvo autorização administrativa explícita. 5. Somente suporte
ou perfil autorizado pode aprovar/rejeitar crédito. 6. Somente ADMIN
pode gerenciar perfis, módulos e permissões globais. 7. Validar o acesso
ao módulo e a permissão da ação. Permissão de menu não substitui
autorização de API. 8. Não confiar no `perfil`, `usuario_id`,
`equipe_id` ou preço enviados pelo frontend. Obter identidade do token
validado e confirmar os dados no banco. 9. Responder com `403` ou `404`
de forma consistente, sem expor dados de outros usuários.

# 9. SEGURANÇA

-   Senhas com bcrypt e fator de custo configurado adequadamente.
-   JWT assinado com segredo forte via variável de ambiente, expiração e
    validação de emissor/audiência quando aplicável.
-   Não armazenar tokens de acesso em locais vulneráveis sem avaliar o
    risco; preferir estratégia segura compatível com a aplicação.
-   Aplicar rate limit em login e recuperação de senha.
-   Validar e normalizar todos os dados recebidos.
-   Configurar CORS para origens permitidas, Helmet e limites de
    payload.
-   Prevenir SQL injection por consultas parametrizadas.
-   Prevenir XSS escapando conteúdo exibido e sanitizando HTML quando
    necessário.
-   Proteger contra CSRF se a autenticação usar cookies.
-   Nunca enviar segredo SMTP, JWT secret ou credenciais do banco ao
    frontend.
-   Armazenar segredos somente em variáveis de ambiente/secret manager.
-   Configurar TLS em produção.
-   Criar política de logs sem dados sensíveis.
-   Proteger informações pessoais segundo a LGPD: acesso mínimo
    necessário, finalidade, retenção e trilha de auditoria.
-   Recuperação de senha: token aleatório criptograficamente seguro,
    armazenado como hash, validade de uma hora, uso único e resposta
    neutra.
-   E-mail HTML deve escapar os dados variáveis do usuário para evitar
    injeção de HTML.

# 10. REGRAS DE NEGÓCIO TRANSACIONAIS

Use `connection.beginTransaction()`, `commit()` e `rollback()` com
`try/finally` para liberar a conexão. Operações críticas devem ser
atômicas.

## 10.1 Simular proposta

1.  Validar identidade e autorização.
2.  Obter cliente, veículo, vendedor e preços diretamente do banco.
3.  Bloquear ou verificar o veículo de forma compatível com a
    concorrência.
4.  Validar status do veículo e preço mínimo.
5.  Calcular valores com regra financeira definida e precisão decimal.
6.  Criar/atualizar negócio.
7.  Atualizar status do veículo quando a regra permitir.
8.  Gravar auditoria.
9.  Commit; em erro, rollback.

## 10.2 Aprovar proposta

1.  Confirmar permissão de aprovação.
2.  Iniciar transação e bloquear a linha do veículo com
    `SELECT ... FOR UPDATE`.
3.  Confirmar que o negócio está em estado aprovável e o veículo ainda
    não foi vendido.
4.  Efetivar negócio e marcar veículo como vendido.
5.  Atualizar negócios pendentes concorrentes conforme regra definida.
6.  Gerar comissões de forma idempotente.
7.  Gravar auditoria.
8.  Commit.

## 10.3 Rejeitar proposta

1.  Validar estado e autorização.
2.  Registrar motivo da recusa.
3.  Atualizar negócio.
4.  Verificar outros negócios ativos do veículo antes de liberá-lo.
5.  Atualizar veículo somente se a regra de disponibilidade permitir.
6.  Registrar auditoria na mesma transação.

## 10.4 Integridade e repetição de requisições

-   Requisições repetidas não podem duplicar vendas, comissões ou
    pagamentos.
-   Tratar `ER_DUP_ENTRY`, deadlocks e conflitos de status.
-   Usar chaves únicas e/ou chave de idempotência nas operações
    críticas.
-   Em caso de deadlock, aplicar número limitado de tentativas
    controladas quando seguro.
-   Não confiar apenas em validação feita antes da transação.

# 11. INTERFACE: TELAS E COMPORTAMENTO

Cada entidade CRUD deve ter, conforme aplicável:

1.  **Listagem:** tabela responsiva, pesquisa, filtros, paginação,
    ordenação permitida, indicador de carregamento e estado sem
    resultados.
2.  **Novo cadastro:** formulário com campos obrigatórios identificados,
    máscaras e validação.
3.  **Detalhes:** dados completos permitidos, relacionamentos e
    histórico relevante.
4.  **Edição:** carregar os dados reais da API e enviar apenas campos
    permitidos.
5.  **Exclusão/desativação:** diálogo de confirmação que explique o
    efeito.
6.  **Feedback:** mensagens claras para sucesso, validação, conflito,
    falta de permissão e indisponibilidade.
7.  **Acessibilidade:** labels, navegação por teclado, foco visível e
    mensagens de erro associadas aos campos.
8.  **Responsividade:** funcionamento em desktop, tablet e celular.

Não exibir ações proibidas ao perfil atual; ainda assim, o servidor deve
bloquear requisições não autorizadas.

Na tela de nova simulação do vendedor, permitir filtrar clientes por parte
do nome e por CPF/CNPJ, e veículos por placa ou outras informações
cadastrais, como marca, modelo, ano e código FIPE. O filtro deve apenas
facilitar a seleção dos registros autorizados e disponíveis, sem alterar
as validações de acesso e negócio da API.

# 12. INTEGRAÇÕES

## 12.1 ViaCEP

-   Consultar por CEP por meio de serviço isolado.
-   Aplicar timeout, tratamento de CEP inválido, indisponibilidade e
    resposta sem resultado.
-   Permitir edição manual do endereço.
-   Não salvar dados externos sem validação.

## 12.2 Tabela FIPE

-   Implementar cliente isolado para consulta de marca/modelo/ano e
    valor de referência.
-   Não assumir disponibilidade permanente nem fixar URLs não
    confirmadas.
-   Registrar data da consulta e fonte do valor se o schema for
    ampliado.
-   Não substituir automaticamente preço sugerido ou mínimo pelo valor
    FIPE.
-   Tratar a FIPE como referência, não como preço comercial obrigatório.

## 12.3 E-mail

-   Configurar SMTP por variáveis de ambiente.
-   Implementar templates de redefinição de senha e ativação de usuário.
-   Tratar falha de envio sem revelar segredos.
-   Não registrar token ou senha em logs.
-   Em ambiente de desenvolvimento, usar serviço SMTP de teste ou modo
    explicitamente configurado.

## 12.4 PDF

-   Gerar PDF no backend com dados persistidos e autorização validada.
-   Incluir identificação da proposta, cliente, veículo, valores,
    condições, data de emissão e identificação da empresa quando esses
    dados forem fornecidos.
-   Não inventar razão social, CNPJ, endereço ou identidade visual da
    empresa.
-   Evitar que parâmetros de URL alterem os valores oficiais do
    documento.
-   Registrar a geração do documento quando relevante para auditoria.

# 13. MIGRAÇÕES, SEEDS E CONFIGURAÇÃO

-   Criar migrações SQL numeradas e ordenadas.
-   Corrigir a dependência circular de equipes/usuários por criação em
    etapas.
-   Definir FKs e política de exclusão para cada relacionamento.
-   Criar índices para e-mail, documentos, status, relacionamentos e
    filtros frequentes.
-   Criar seeds idempotentes para os módulos e permissões iniciais.
-   Não apagar ou sobrescrever permissões já customizadas em uma nova
    execução de seed.
-   Incluir `.env.example` sem segredos reais.
-   Variáveis esperadas, conforme uso: `PORT`, `NODE_ENV`, `DB_HOST`,
    `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`,
    `JWT_EXPIRES_IN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`,
    `SMTP_USER`, `SMTP_PASS`, `FRONTEND_URL`.
-   Incluir instruções para criar o banco, executar migrações, aplicar
    seeds e iniciar backend/frontend.
-   Não versionar `.env` real.

# 14. TESTES MÍNIMOS OBRIGATÓRIOS

Para cada entidade CRUD: - criação válida; - validação de campos
obrigatórios; - consulta por ID existente e inexistente; - listagem,
filtros e paginação; - atualização válida e inválida; - exclusão
lógica/desativação; - duplicidade de e-mail/CPF/CNPJ quando aplicável; -
restrições de chave estrangeira; - tentativa de acesso sem
autenticação; - tentativa de acesso sem permissão; - tentativa de
acessar registro fora do escopo do usuário.

Testes de negócio: - proposta abaixo do preço mínimo é rejeitada; -
veículo vendido não pode ser vendido novamente; - duas aprovações
concorrentes não geram duas vendas; - rejeição não libera veículo com
outra proposta ativa; - falha na criação de comissão causa rollback da
operação crítica, quando a comissão fizer parte dela; - repetir
aprovação não duplica comissões; - token expirado ou reutilizado não
redefine senha; - logs críticos são gerados; - cálculos financeiros
cobrem taxa zero, entrada, arredondamento e diferentes prazos conforme
fórmula aprovada.

# 15. CRITÉRIOS DE ACEITE

A implementação somente pode ser considerada concluída quando:

-   [ ] Todas as tabelas do escopo possuem migrações MySQL funcionais.
-   [ ] Todas as entidades gerenciáveis possuem CRUD completo de
    backend.
-   [ ] Cada CRUD possui telas integradas à API, sem dados fictícios em
    produção.
-   [ ] Paginação, filtros e ordenação são executados no servidor.
-   [ ] Autenticação e autorização são verificadas no backend.
-   [ ] O escopo por perfil, equipe e vendedor está aplicado em todas as
    consultas e operações.
-   [ ] Operações comerciais críticas usam transações.
-   [ ] Integridade referencial e regras de exclusão foram testadas.
-   [ ] As integrações possuem tratamento de indisponibilidade.
-   [ ] Os fluxos de e-mail e PDF estão implementados e autorizados.
-   [ ] Existem testes automatizados para CRUD, segurança e regras de
    negócio.
-   [ ] O projeto inicia a partir das instruções documentadas.
-   [ ] Não existem botões sem ação, endpoints fictícios, erros
    silenciosos ou segredos versionados.
-   [ ] Decisões de produto pendentes estão listadas claramente, sem
    valores financeiros inventados.

# 16. ORDEM RECOMENDADA DE IMPLEMENTAÇÃO

Execute em etapas verificáveis:

1.  Inspecionar o repositório e apresentar um resumo da arquitetura
    atual.
2.  Comparar o schema existente com este documento e preparar migrações
    MySQL.
3.  Implementar conexão, tratamento global de erros, validação e
    autenticação.
4.  Implementar permissões, módulos, usuários e equipes.
5.  Implementar veículos e clientes.
6.  Implementar negócios, simulações, propostas e transições de status.
7.  Implementar comissões e auditoria.
8.  Definir e implementar tabelas de financiamento após validar o modelo
    de dados.
9.  Implementar todas as telas CRUD e os estados de interface.
10. Implementar integrações ViaCEP, FIPE, SMTP e PDF.
11. Executar testes automatizados e corrigir falhas.
12. Entregar resumo de arquivos alterados, migrações, variáveis,
    comandos e pendências.

Ao concluir cada etapa, execute os testes disponíveis antes de avançar.
Não declare uma etapa concluída sem verificar sua execução.

# 17. DECISÕES DE NEGÓCIO QUE PRECISAM DE CONFIRMAÇÃO

Não invente respostas para os itens abaixo. Documente-os como pendências
ou implemente-os como configuração provisória claramente identificada:

1.  Fórmula financeira: taxa mensal ou anual, sistema de amortização,
    arredondamento e tratamento de entrada.
2.  Regras de comissão: percentuais, base de cálculo, beneficiários e
    momento de geração.
3.  Modelo completo das tabelas de financiamento bancário.
4.  Se as cinco fotos são obrigatórias em todos os fluxos ou apenas na
    publicação do veículo.
5.  Quais perfis podem transferir clientes, alterar preços mínimos,
    cancelar contratos e reverter uma venda.
6.  Regras de cancelamento após contrato efetivado e impactos em veículo
    e comissões.
7.  Campos e identificação da empresa que devem constar na proposta PDF.
8.  Se haverá múltiplas lojas/filiais formalizadas no banco. A visão
    geral menciona gestão multi-loja, mas o schema original não possui
    entidade `lojas` nem relacionamento de loja. Não declarar multi-loja
    concluído sem modelar esse escopo.
9.  Regras de retenção e acesso aos dados pessoais, conforme política da
    empresa e LGPD.

**Orientação final para a IA:** implemente primeiro o que está
especificado, mantenha rastreabilidade entre requisito, endpoint, tela,
migração e teste, e apresente as decisões pendentes de forma objetiva.
Não altere regras comerciais silenciosamente.

## Textos da proposta comercial em PDF

O PDF da proposta usa somente dados reais do banco. Validade, prazo de
entrega, documentação/transferência e textos de prazos e garantia ficam na
tabela `ConfiguracaoProposta` (uma linha por loja, com textos padrão quando
ainda não editada). O ADMIN altera esses campos em Configurações, pelas rotas
`GET/PUT /api/stores/:id/proposal-settings`.
