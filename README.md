# 👤 user-service · Catálogo de Eventos

Serviço de usuários (cadastro, perfil, permissões/*roles* e favoritos) do projeto *Catálogo de Eventos*, construído com **Fastify** + **TypeScript** + **Prisma** (PostgreSQL)..

---

## 🧩 Estratégia de teste

O UserService depende de **dois** serviços externos: o **AuthService** (emite o token no cadastro e valida o token em toda rota protegida) e o **EmailService** (valida o código de recuperação na troca de senha). Em vez de testar contra os serviços reais, a pipeline sobe o **UserService de verdade** — com seu próprio banco PostgreSQL descartável — e mocka só essas duas dependências externas com **WireMock**, garantindo:

- **Isolamento**: falhas do AuthService ou do EmailService não derrubam o CI do UserService.
- **Foco no que importa**: o que é validado é o contrato, as regras de negócio e a persistência real via Prisma/PostgreSQL — não os mocks.

Quatro repositórios sustentam essa estratégia:

| Repositório | Papel |
|---|---|
| **`user-service-eventsCatalog`** (este repo) | Serviço testado. |
| [`collectionTestApiUserService`](https://github.com/LucasMCFidelis/collectionTestApiUserService) | Collection Postman com os casos de teste deste serviço (cadastro, validação de credenciais, perfil, papéis e favoritos). É também o repositório que builda o **mock deste UserService** para quem depende dele (ex.: o AuthService). |
| [`collectionTestApiAuthService`](https://github.com/LucasMCFidelis/collectionTestApiAuthService) | Mappings do WireMock que simulam o AuthService (emissão de token / validação de token). |
| [`collectionTestApiEmailService`](https://github.com/LucasMCFidelis/collectionTestApiEmailService) | Mappings do WireMock que simulam o EmailService (validação do código de recuperação de senha). |

O modo mock só é ativado com `ACTIVE_MOCK="true"` + header `x-mock-scenario` na requisição — fora disso, o header é ignorado e a chamada vai para a URL real. Ou seja, não há risco de mock "vazar" para produção.

---

## ⚙️ Pipeline de CI

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — roda em pull requests para `main` ou `develop`, e em push direto na `main`.

Toda a orquestração dos testes vive no [`docker-compose.yml`](docker-compose.yml), no profile `test`. A pipeline em si só repassa os *secrets* do seed e delega tudo ao Compose.

1. Checkout do UserService (este repo).
2. Sobe o ambiente de teste com `docker compose --profile test up -d --build`, repassando `ADMIN_PASSWORD`, `ADMIN_DATA` e `USER_ROLES` (secrets do GitHub) como variáveis de ambiente. Esse comando builda e orquestra cinco serviços:
   - **`db-test`**: PostgreSQL descartável (dados em `tmpfs`), usado só durante o teste.
   - **`migrate-test`**: job descartável que roda `prisma migrate deploy` e `prisma db seed`, criando os papéis (a partir de `USER_ROLES`) e os usuários administradores iniciais (a partir de `ADMIN_DATA`/`ADMIN_PASSWORD`) no banco de teste.
   - **`app-test`**: a imagem real do UserService (mesmo `Dockerfile` de produção, estágio `prod`), rodando com `START_SCRIPT=start:dev` e `ACTIVE_MOCK=true`, aguardando ficar *healthy* (checagem TCP na porta `8080`).
   - **`auth-service-mock`**: builda a imagem de mock direto do repositório [`collectionTestApiAuthService`](https://github.com/LucasMCFidelis/collectionTestApiAuthService) (via `docker/mock.Dockerfile`), publicando-se na rede como `auth-service`.
   - **`email-service-mock`**: builda a imagem de mock direto do repositório [`collectionTestApiEmailService`](https://github.com/LucasMCFidelis/collectionTestApiEmailService) (via `docker/mock.Dockerfile`), publicando-se na rede como `email-service`.
   - **`tests`**: builda a imagem de execução do Newman direto do repositório [`collectionTestApiUserService`](https://github.com/LucasMCFidelis/collectionTestApiUserService) (via `docker/tests-runner.Dockerfile`), rodando a collection contra o `app-test` assim que ele fica *healthy*.
3. Para e remove os containers/volumes (`docker compose --profile test down -v`).
4. Publica o relatório HTML do Newman (`reports/relatorio.html`) como artifact do GitHub Actions — mesmo em caso de falha.

### Diagrama do fluxo

```
docker compose --profile test up --build

  ┌──────────────────────────┐                       ┌──────────────────────────┐
  │ migrate-test             │                       │ db-test                  │
  │ prisma migrate deploy +  │ ────────────────────> │ (Postgres descartável,   │
  │ prisma db seed           │   1. cria papéis e    │ tmpfs)                   │
  │ (USER_ROLES / ADMIN_*)   │      admin em         └──┬───────────────────────┘
  └──────────────────────────┘                          |
                                                        │ 2. usado por app-test
                                                        │    (DATABASE_URL_USER)
                                                        ▼
┌────────────────────────┐                           ┌──────────────────────────┐
│ tests (Newman)         │ ── x-mock-scenario ──>    │ app-test                 │
│ build: repo            │                           │ (UserService real)       │
│ collectionTestApi-     │<── 200/400/401/404/409    │ ACTIVE_MOCK=true         │
│ UserService            │ + dados/token             │ START_SCRIPT=start:dev   │
│ depends_on: app-test   │                           └──┬─────────────────┬─────┘
│ (service_healthy)      │                              │ POST /auth/*    │ POST /emails/*
└────────────────────────┘                              │                 │
   │ volume                                             ▼                 ▼
   │                                  ┌──────────────────────┐   ┌───────────────────────┐
   ▼                                  │ auth-service-mock    │   │ email-service-mock    │
┌────────────────────┐                │ (WireMock)           │   │ (WireMock)            │
│ ./reports/         │                │ alias: auth-service  │   │ alias: email-service  │
│ relatorio.html     │                └──────────────────────┘   └───────────────────────┘
└────────────────────┘
```

### O que a pipeline garante
- Build sem erros.
- Migrations do Prisma aplicadas e seed de papéis/administrador executado no banco descartável.
- Rotas de usuários (`/users`) respondendo corretamente: cadastro, busca por `userId`/`userEmail`, atualização, exclusão e atualização de papel (`/users/update-role-user`, restrita a Admin).
- Validação de credenciais (`POST /users/validate-credentials`) usada pelo AuthService no login.
- Fluxo de recuperação de senha (`PATCH /users/recuperacao/atualizar-senha`), validando o código junto ao EmailService mockado.
- Rotas de permissões (`/roles`).
- Autorização por dono do recurso: um usuário comum só pode alterar/ver/excluir seus próprios dados; administradores têm acesso irrestrito.
- Regras de negócio e validação de payload cobrindo, entre outros: e-mail já cadastrado, usuário não encontrado, credenciais inválidas, token ausente/inválido e permissão insuficiente ao tentar trocar o papel de outro usuário sem ser Admin.
- Relatório navegável disponível como artifact, mesmo em caso de falha.

> ℹ️ As rotas de favoritos ainda não tiveram testes devidamente implementados porque também dependem de um **EventService** (`getEventById`) para trazer os dados completos do evento favoritado. Esse serviço ainda não tem um mock equivalente, mas é planejado a adição e uso neste pipeline para testar essas rotas de favoritos.

Detalhes de cada cenário de teste (cadastro, login, permissões) estão documentados no README do repositório [`collectionTestApiUserService`](https://github.com/LucasMCFidelis/collectionTestApiUserService).

---

## 🚀 Reproduzindo os testes localmente

Esse ambiente é o mesmo usado na CI, orquestrado pelo [`docker-compose.yml`](docker-compose.yml) através do profile `test`. Não é necessário instalar Postgres/Newman/WireMock na máquina — o Compose builda tudo (UserService real, os dois mocks e o runner do Newman) a partir das imagens/contextos definidos no arquivo.

### Pré-requisitos
- Docker + Docker Compose

### 1. Clone este repositório

```bash
git clone https://github.com/LucasMCFidelis/user-service-eventsCatalog.git
cd user-service-eventsCatalog
```

*(ajuste a URL caso o nome do repositório remoto seja diferente)*

### 2. Copie o `.env.example` para `.env`

```bash
cp .env.example .env
```

O Compose lê o `.env` da raiz do projeto automaticamente. Conteúdo do `.env.example`:


O que é obrigatório preencher para o fluxo `docker compose --profile test` (job `migrate-test`):

- **`USER_ROLES`**: JSON com os papéis a criar — precisa incluir um papel `"Admin"` e `"User"`.
- **`ADMIN_DATA`**: JSON com os dados (nome/e-mail) dos administradores a criar no seed.
- **`ADMIN_PASSWORD`**: senha aplicada aos administradores criados pelo seed (a mesma senha para todos, nesta implementação).

### 3. Suba o ambiente de teste

```bash
docker compose --profile test up --build
```

Para usar versões locais dos repositórios de teste em vez de puxar do GitHub, defina `AUTH_MOCK_GIT`/`EMAIL_MOCK_GIT`/`API_TESTS_GIT` no `.env` apontando para as pastas locais, ou passe-as inline:

```bash
AUTH_MOCK_GIT=../collectionTestApiAuthService \
EMAIL_MOCK_GIT=../collectionTestApiEmailService \
API_TESTS_GIT=../collectionTestApiUserService \
docker compose --profile test up --build
```

### 4. Veja o relatório

O relatório HTML do Newman é gerado em `./reports/relatorio.html` (montado como volume pelo serviço `tests`) e pode ser aberto direto no navegador.

### 5. Encerre e limpe o ambiente

```bash
docker compose --profile test down -v
```

---

## 🔑 Variáveis de ambiente relevantes para os testes

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL_USER` | ✔️ | Connection string do PostgreSQL. No modo teste, é montada automaticamente pelo `docker-compose.yml` (o valor do `.env` só vale fora do Docker). |
| `NODE_ENV` | ✔️ | Define o sufixo de URL usado (`_DEV`/`_PROD`); é fixado pelo `START_SCRIPT` via `cross-env`, então passar `NODE_ENV` direto por fora do script não tem efeito. |
| `AUTH_SERVICE_URL_DEV` | ✔️ (em CI/teste) | Aponta para o WireMock que simula o AuthService (montada automaticamente no modo teste). |
| `EMAIL_SERVICE_URL_DEV` | ✔️ (em CI/teste) | Aponta para o WireMock que simula o EmailService (montada automaticamente no modo teste). |
| `ACTIVE_MOCK` | opcional | `"true"` habilita o repasse do header `x-mock-scenario` para AuthService e EmailService (fixada como `"true"` no modo teste). |
| `USER_ROLES` | ✔️ (para o seed) | JSON com os papéis a criar no banco de teste; precisa incluir um papel `"Admin"` e um `"User"` . |
| `ADMIN_DATA` | ✔️ (para o seed) | JSON com os dados dos administradores a criar no seed. |
| `ADMIN_PASSWORD` | ✔️ (para o seed) | Senha usada para os administradores criados pelo seed. |