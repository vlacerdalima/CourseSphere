#  <img width="500" height="500" alt="favicon" src="https://github.com/user-attachments/assets/4752650d-fa03-4f7a-9930-6692ff6e6b1d" />
 *CourseSphere*

**Plataforma de gestão de cursos online** , desafio técnico Full Stack.

<p>
  <a href="https://coursesphere-snowy.vercel.app">🌐 Plataforma CourseSphere</a> ·
  
</p>

> **Credenciais de teste:** crie sua própria conta em segundos, ou use `demo@coursesphere.com` / `Demo123` para ver a plataforma com conteúdo.

---

## Visão geral

CourseSphere é uma plataforma onde instrutores criam e gerenciam cursos com aulas em vídeo (YouTube/Vimeo), e outros usuários exploram o catálogo da plataforma. O projeto implementa autenticação JWT, CRUD completo de cursos e aulas com autorização por criador, consumo da RandomUser API para alunos fictícios, e deploy contínuo.

<!-- Screenshot principal aqui: GIF ou imagem do dashboard com cursos -->

## Stack

| Camada | Tecnologia |
|---|---|
| **Backend** | Node.js · Fastify v5 · TypeScript · Prisma ORM |
| **Banco de dados** | PostgreSQL (Neon — serverless) |
| **Validação** | Zod |
| **Autenticação** | JWT (jsonwebtoken) · bcrypt |
| **Testes** | Jest · ts-jest · Supertest |
| **Frontend** | React 19 · Vite · TypeScript |
| **UI** | Tailwind CSS v3 · shadcn/ui (tema Blue) |
| **Data fetching** | TanStack Query · Axios |
| **Formulários** | React Hook Form · Zod resolver |
| **Roteamento** | React Router v7 |
| **API externa** | RandomUser API (alunos fictícios) |
| **Deploy** | Railway (backend) · Vercel (frontend) · Neon (banco) |

## Por que Node.js em vez de Ruby on Rails?

O desafio sugere Rails + React, mas permite outras stacks. Optei por **Node.js + Fastify** por ser minha stack principal — com prazo de uma semana e concorrendo com 60 candidatos, priorizar a tecnologia onde tenho mais fluência foi decisão racional: menos tempo debugando framework, mais tempo entregando funcionalidades e qualidade.

Para manter o projeto imediatamente legível por um avaliador com background em Rails, adotei **arquitetura MVC explícita** no backend: controllers, models, routes e schemas em diretórios separados, com as mesmas responsabilidades que teriam no Rails. A separação de camadas é a mesma — só a linguagem muda. TypeScript adiciona tipagem estática que Rails não tem nativamente, e Prisma como ORM oferece migrations e type safety equivalentes ao ActiveRecord.

## Arquitetura

### Separação Backend / Frontend

O projeto é um **monorepo com duas aplicações independentes**: o backend é uma API REST em Fastify, o frontend é um SPA em React. Cada um deploya separadamente — backend no Railway, frontend no Vercel. A comunicação é exclusivamente via HTTP/JSON, sem server actions ou SSR.

**Por que React + Vite em vez de Next.js?** A aplicação é um dashboard protegido por autenticação — todas as páginas exigem login, não há conteúdo público indexável, e SSR não agrega valor. Next.js adicionaria complexidade de Server Components, diretivas `"use client"`, e verificações de `typeof window` para localStorage, sem nenhum ganho concreto. React + Vite mantém a arquitetura simples, alinhada com a recomendação do desafio ("preferencialmente React"), e com build otimizado como SPA estático.

```mermaid
graph LR
    subgraph Vercel
        FE[React SPA]
    end
    subgraph Railway
        BE[Fastify API]
    end
    subgraph Neon
        DB[(PostgreSQL)]
    end
    subgraph External
        RU[RandomUser API]
    end

    FE -->|HTTP/JSON + JWT| BE
    BE -->|Prisma| DB
    FE -->|fetch| RU
```

### MVC no Backend

O backend segue arquitetura **MVC explícita**, escolhida para alinhar com as expectativas de avaliação e manter separação clara de responsabilidades:

- **Controllers** — manipulam HTTP: validam input via Zod, checam autorização, chamam o model, retornam response. Nunca acessam Prisma diretamente.
- **Models** — concentram queries Prisma e regras de domínio. Não conhecem HTTP.
- **Schemas (Zod)** — definem shapes de validação, puros e reutilizáveis.
- **Middlewares** — auth (valida JWT, busca user no banco) e plugins do Fastify.

```
backend/src/
├── controllers/     # HTTP handlers
├── models/          # Prisma queries + regras de domínio
├── routes/          # Registro de endpoints
├── schemas/         # Validação Zod
├── middlewares/     # Auth middleware
├── lib/             # Prisma singleton, JWT helpers, authorization
├── app.ts           # Fastify setup + plugins
└── server.ts        # Entry point
```

### Modelo de Dados

```mermaid
erDiagram
    User ||--o{ Course : creates
    Course ||--o{ Lesson : contains

    User {
        string id PK
        string name
        string email UK
        string password
        string avatarUrl
        datetime createdAt
        datetime updatedAt
    }

    Course {
        string id PK
        string name
        string description
        string coverUrl
        datetime startDate
        datetime endDate
        string creatorId FK
        datetime createdAt
        datetime updatedAt
    }

    Lesson {
        string id PK
        string title
        string description
        enum status "draft | published"
        string videoUrl
        string courseId FK
        datetime createdAt
        datetime updatedAt
    }
```

## Decisões técnicas

### Segurança

- **Mensagens de erro genéricas:** registro e login nunca revelam se um email já existe ou se a senha está errada — retornam mensagens genéricas pra prevenir enumeração de emails.
- **JWT com payload mínimo:** apenas `{ userId }`. Email não vai no token porque é mutável e JWT é assinado, não criptografado.
- **bcrypt no model:** hash de senha encapsulado dentro da função `createUser`, não no controller. O controller é HTTP-only.
- **Proteção IDOR:** `creatorId` sempre vem do `request.user` (token JWT), nunca do body da requisição. Testado explicitamente.
- **Ordem de checagem 404 → 403:** controllers verificam existência do recurso antes de checar autorização. Inverter vazaria a informação "esse ID existe".
- **Token no localStorage:** decisão consciente dado o prazo. Em produção, seria httpOnly cookie com `Secure` e `SameSite=Strict`. O backend foi projetado para `Authorization: Bearer`, e migrar para cookies exigiria refatorar middleware, CORS e todos os testes.

### Performance

- **Autorização em memória:** em vez de uma função `isCourseCreator` com query separada, a verificação de autoria usa `course.creator.id` já retornado por `findCourseById`. Elimina roundtrip ao banco em cada update/delete.
- **`_count` no Prisma:** contagem de aulas por curso via subquery do Prisma em vez de N+1 requests no frontend.
- **TanStack Query:** invalidação seletiva após mutações. Criar curso invalida `["courses"]` (matcher parcial); criar aula invalida `["course", courseId]`.

### Frontend

- **Services tipados:** wrappers Axios com tipos TypeScript. Nenhum componente chama Axios direto.
- **RandomUser com seed:** avatares determinísticos por `courseId` — mesmo curso sempre mostra os mesmos alunos. Chamada via `fetch` nativo (não Axios) pra evitar injeção do JWT numa API externa.
- **Gradiente determinístico:** cursos sem `coverUrl` recebem gradiente gerado por hash do UUID. Mesmo curso, mesma cor, sempre.
- **Visibilidade de rascunhos:** criador do curso vê todas as aulas; outros usuários veem apenas `status: "published"`. Filtro aplicado em lista de aulas, sidebar do player, e navegação Anterior/Próxima.

## API

Base URL: `/api`. Rotas protegidas requerem `Authorization: Bearer <token>`. Erros retornam `{ "error": "mensagem" }`.

### Autenticação

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/register` | — | Cria conta. Retorna `{ token, user }` |
| POST | `/auth/login` | — | Autentica. Retorna `{ token, user }` |
| PATCH | `/auth/profile` | ✓ | Atualiza nome e/ou avatarUrl |

### Cursos

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/courses` | ✓ | Lista cursos do usuário. `?search=` |
| GET | `/courses/explore` | ✓ | Lista todos os cursos da plataforma. `?search=` |
| GET | `/courses/:id` | ✓ | Detalhes com aulas |
| POST | `/courses` | ✓ | Cria curso |
| PUT | `/courses/:id` | ✓ criador | Atualiza curso |
| DELETE | `/courses/:id` | ✓ criador | Remove curso e aulas (cascade) |

### Aulas (aninhadas em cursos)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/courses/:courseId/lessons` | ✓ | Lista aulas. `?status=draft\|published` |
| POST | `/courses/:courseId/lessons` | ✓ criador | Cria aula |
| PUT | `/courses/:courseId/lessons/:id` | ✓ criador | Atualiza aula |
| DELETE | `/courses/:courseId/lessons/:id` | ✓ criador | Remove aula |

## Cobertura de testes

```
Test Suites: 13 passed, 13 total
Tests:       103 passed, 103 total
```

Os testes cobrem:
- Auth (registro, login, atualização de perfil)
- CRUD de cursos (criação, listagem, filtro, edição, exclusão)
- Endpoint de exploração (listagem global, isolamento de dados)
- CRUD de aulas (criação, listagem com filtro de status, edição, exclusão)
- Autorização (403 pra não-criador, 404 antes de 403)
- Proteção IDOR (creatorId do body é ignorado)
- Cascade (deletar curso remove aulas)
- Acesso cruzado (aula de outro curso retorna 404)
- Whitelist de videoUrl (YouTube e Vimeo)

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- Docker (para PostgreSQL local)

### Setup

```bash
# Clonar
git clone https://github.com/seu-usuario/coursesphere.git
cd coursesphere

# Backend
cd backend
cp .env.example .env          # configurar DATABASE_URL e JWT_SECRET
npm install
docker compose up -d           # sobe PostgreSQL local
npx prisma migrate dev         # aplica migrations
npm run dev                    # API em http://localhost:3333

# Frontend (novo terminal)
cd frontend
cp .env.example .env           # VITE_API_URL=http://localhost:3333/api
npm install
npm run dev                    # SPA em http://localhost:5173
```

### Variáveis de ambiente

**Backend (`.env`):**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/coursesphere
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Frontend (`.env`):**
```
VITE_API_URL=http://localhost:3333/api
```

### Rodando testes

```bash
cd backend
npm test
```

## Diário de desenvolvimento

### Dia 1 — Fundação e autenticação

Defini a stack e a arquitetura antes de escrever qualquer linha de código. Optei por **Node.js + Fastify** no backend em vez de Rails (sugestão do desafio) por ser minha stack principal — escolha racional pelo prazo de uma semana, com arquitetura MVC explícita pra alinhar com a expectativa de quem avalia. Frontend ficou com **Next.js + Tailwind + shadcn/ui** em monorepo separado, deixando o contrato HTTP entre as duas camadas explícito em vez de borrá-lo com server actions.

Setup inicial cobriu monorepo, schema Prisma com `User`, `Course` e `Lesson` (UUIDs e cascade delete), `docker-compose` para PostgreSQL local, e a infraestrutura base do Fastify (CORS, error handler global, singleton do Prisma, helpers de JWT, middleware de autenticação).

Implementei o **módulo de autenticação completo** com registro e login. Decisões de segurança que vale destacar: senha com hash bcrypt, mensagens de erro genéricas em ambos os endpoints para evitar enumeração de emails, e payload do JWT contendo apenas `userId` (não `email`, que é mutável e expõe dado pessoal desnecessariamente já que JWT é apenas assinado, não criptografado). Cobertura de testes com Jest + Supertest validando os fluxos críticos: registro válido, email duplicado, login válido, credenciais inválidas.

Revisando o controller de auth depois de pronto, percebi que o hash da senha estava sendo feito ali — o que tecnicamente é regra de negócio vazando pra camada HTTP. Refatorei movendo o `bcrypt.hash` pra dentro do `createUser` no model, e a verificação de senha pra um helper `verifyUserPassword` também no model. O controller ficou verdadeiramente HTTP-only: valida input, chama o model, retorna status. Pequena mudança, mas consolida a separação MVC que é critério explícito de avaliação.

### Dia 2 — Cursos, aulas e backend completo

Implementei os módulos de **cursos** e **aulas** com CRUD completo, cobrindo o backend inteiro em dois dias. No módulo de cursos, optei por verificar autoria em memória (`course.creator.id === request.user.id`) usando dados já retornados por `findCourseById`, em vez de criar uma função `isCourseCreator` com query separada — elimina uma roundtrip ao banco em toda operação de update/delete sem perder segurança. Durante a implementação, identifiquei que o middleware de auth injetava apenas o payload do JWT (`{ userId }`) em vez do usuário completo. Refatorei para buscar o usuário no banco a cada request autenticado — isso padronizou `request.user.id` em todo o codebase e adicionou uma camada de segurança: se o usuário for deletado após o JWT ser emitido, a requisição retorna 401 em vez de prosseguir com dados órfãos.

No módulo de aulas, a decisão principal foi usar **rotas aninhadas** (`/api/courses/:courseId/lessons`) em vez de rotas planas com `courseId` no body. A rota explicita a hierarquia REST e torna a relação entre entidades visível na URL. Criei um helper `assertCourseOwnership` em `src/lib/authorization.ts` que retorna um `AuthorizationResult` tipado em vez de lançar exceção — padrão funcional que mantém o fluxo de controle previsível nos controllers. O model usa `findLessonByIdAndCourseId` com filtro duplo (`lessonId AND courseId`) para impedir acesso cruzado entre cursos: aula existente em outro curso retorna 404, sem vazar existência de recursos.

Validação de `videoUrl` usa whitelist de domínios (YouTube e Vimeo) via `new URL().hostname` dentro de um `.refine()` do Zod. `courseId` é imutável no PUT — campo não declarado no schema Zod, então descartado silenciosamente. Status padrão de aula é `draft`.

**Resultado do dia:** backend 100% completo. 78 testes passando (11 auth + 28 cursos + 39 aulas), zero regressões entre módulos.

### Dia 3 — Frontend: migração, fundação e deploy

Migrei o frontend de **Next.js para React + Vite** antes de escrever qualquer lógica. A decisão foi técnica: toda a aplicação é um dashboard protegido por autenticação — não há páginas públicas indexáveis, SEO não é requisito, e SSR não traz benefício. React + Vite alinha com a recomendação do desafio e elimina a complexidade de Server Components.

Implementei a **infraestrutura completa do frontend**: instância Axios com interceptors (JWT no request, cleanup em 401), AuthContext com hidratação do localStorage, ProtectedRoute e PublicOnlyRoute, TanStack Query provider, e todos os services tipados (auth, courses, lessons). Telas de login e registro funcionais com React Hook Form + Zod.

Fiz o **deploy no Railway** (backend) e **Vercel** (frontend). Resolvi problemas de CORS (porta 5173 do Vite vs 3000 do Next.js antigo), PORT do Railway (atribuição dinâmica vs fixo), e configuração de SPA no Vercel (vercel.json com rewrites).

### Dia 4+ — Design, integração e polish

Trabalhei com protótipo de design e implementei: home page com hero e social proof, login e cadastro com layout split-screen e manifesto, dashboard com sidebar e grid de cursos, página de explorar (todos os cursos da plataforma), detalhe do curso com alunos matriculados via RandomUser API, player de aula com embed de YouTube/Vimeo e navegação Anterior/Próxima.

Adicionei ao backend: endpoint de exploração (`GET /api/courses/explore`), campos `coverUrl` nos cursos e `description` nas aulas, `avatarUrl` nos usuários com PATCH de perfil, e página de perfil no frontend.

Refinamentos de UX baseados em testes com usuários reais: sidebar responsiva com drawer em mobile, redirect pós-registro para `/explore` (novo usuário vê conteúdo imediatamente), redirect pós-criação de curso para a página de detalhe (guia o usuário a criar aulas), lista de requisitos de senha em tempo real (✓/✗ visual), modal de curso responsivo, e deduplicação de avatares do RandomUser.

---

*Desenvolvido por Vitor Lacerda — CIn/UFPE, 2026.*
