# Keycloak Login (BFF Pattern)

## Sobre

Projeto de estudo que implementa autenticação com Keycloak usando o padrão **BFF (Backend for Frontend)**. O token nunca chega ao browser — o BFF (Express) se comunica com o Keycloak, guarda os tokens em memória e devolve apenas um cookie `session_id` httpOnly signed para o frontend (React).

---

## Fluxos de Autenticação

### 1. Login

![Fluxo de Login](images/login.png)

**Detalhes:**
- O frontend envia `username` e `password` via POST JSON
- O BFF faz um **Resource Owner Password Grant** (Direct Access Grant) no endpoint `/token` do Keycloak
- O Keycloak valida as credenciais e retorna `access_token` + `refresh_token`
- O BFF guarda os tokens em memória (Map) indexados por um UUID (`session_id`)
- O browser recebe apenas o cookie `session_id` (httpOnly, signed, sameSite=lax)
- Para obter dados do usuário, o frontend chama `/auth/me`, que usa o `access_token` para consultar o `/userinfo` do Keycloak

### 2. Primeiro Login (Troca de Senha Obrigatória)

![Fluxo de Primeiro Login](images/first-login.png)

**Detalhes:**
- Quando o Keycloak tem `UPDATE_PASSWORD` como required action no usuário, o Direct Grant falha com `"Account is not fully set up"`
- O BFF detecta isso, consulta a Admin API para confirmar que é `UPDATE_PASSWORD`, e retorna `403 password_change_required`
- O frontend redireciona para a tela de troca de senha
- O BFF valida a senha antiga (tentando um Direct Grant), seta a nova senha via Admin API, limpa as required actions, e faz auto-login

### 3. Esqueci Minha Senha

![Fluxo de Reset de Senha](images/reset-password.png)

**Detalhes:**
- O BFF busca o usuário via Admin API (não revela se o usuário existe — sempre retorna `{ok: true}`)
- Gera um código de 6 dígitos com expiração de 10 minutos e loga no console (simulando envio de email)
- O frontend envia o código + nova senha
- O BFF valida o código, reseta a senha via Admin API, e faz auto-login

### 4. Logout

![Fluxo de Logout](images/logout.png)

---

## Segurança

| Aspecto | Implementação |
|---|---|
| Token no browser | ❌ Nunca exposto — fica só no BFF |
| Cookie | httpOnly + signed + sameSite=lax |
| Validação de sessão | Cada `/auth/me` valida o token no Keycloak |
| Senha | Validada pelo Keycloak (nunca pelo BFF) |
| Reset code | 6 dígitos, expira em 10 min, uso único |
| User enumeration | `/forgot-password` sempre retorna `{ok: true}` |

---

## Estrutura do Projeto

```
keycloak-login/
├── docker-compose.yml          # Keycloak + Postgres
├── bff/
│   ├── .env                    # Variáveis de ambiente
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts            # Express + middleware + rotas
│       ├── config.ts           # Env vars + URLs do Keycloak
│       ├── keycloak.ts         # Helpers (admin token, find user, reset password)
│       ├── sessions.ts         # Store em memória + createSession
│       └── routes/
│           ├── login.ts            # POST /auth/login
│           ├── me.ts               # GET  /auth/me
│           ├── logout.ts           # POST /auth/logout
│           ├── changePassword.ts   # POST /auth/change-password
│           ├── forgotPassword.ts   # POST /auth/forgot-password
│           └── resetPassword.ts    # POST /auth/reset-password
└── frontend/
    ├── package.json
    ├── vite.config.ts          # Proxy /auth → BFF
    └── src/
        ├── main.tsx            # ChakraProvider + Router + AuthProvider
        ├── App.tsx             # Rotas (PublicRoute / PrivateRoute)
        ├── hooks/
        │   └── useAuth.tsx     # Context de autenticação
        └── pages/
            ├── LoginPage.tsx
            ├── HomePage.tsx
            ├── ChangePasswordPage.tsx
            ├── ForgotPasswordPage.tsx
            └── ResetPasswordPage.tsx
```

---

## Setup

### 1. Subir o Keycloak

```bash
docker compose up -d
```

Acesse http://localhost:8080 com `admin` / `admin`.

### 2. Configurar o Realm no Keycloak

1. Crie um realm chamado **myrealm**
2. Crie um client chamado **myclient**:
   - Client authentication: **ON**
   - Direct access grants: **ON**
   - Valid redirect URIs: `http://localhost:3001/*`
   - Web origins: `http://localhost:5173`
3. Copie o **Client Secret** (aba Credentials) e cole no `bff/.env` em `KEYCLOAK_CLIENT_SECRET`
4. Crie um usuário de teste no realm (aba Credentials → Set password → **desmarcar Temporary**)

### 3. Rodar o BFF

```bash
cd bff
npm install
npm run dev
```

### 4. Rodar o Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173.

---

## Endpoints do BFF

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login com username + password |
| GET | `/auth/me` | Retorna dados do usuário autenticado |
| POST | `/auth/logout` | Encerra sessão |
| POST | `/auth/change-password` | Troca de senha (primeiro acesso) |
| POST | `/auth/forgot-password` | Solicita código de reset |
| POST | `/auth/reset-password` | Valida código e define nova senha |
