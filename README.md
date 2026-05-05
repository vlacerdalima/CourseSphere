# CourseSphere

Plataforma colaborativa de gestão de cursos online — desafio técnico Full Stack.

## Stack

| Camada | Tecnologias |
|---|---|
| Backend | Node.js 20+, Fastify v5, Prisma, PostgreSQL, Zod, JWT, bcrypt |
| Frontend | Next.js 14+ (App Router), Tailwind CSS, shadcn/ui, TanStack Query, Axios, React Hook Form |
| Infra | Docker (PostgreSQL), Neon (produção) |

## Pré-requisitos

- Node.js >= 20
- npm >= 10
- Docker (para o banco local)

## Setup local

1. **Clone o repositório**
   ```bash
   git clone <url-do-repo>
   cd CourseSphere
   ```

2. **Copie os arquivos de variáveis de ambiente**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. **Suba o banco de dados**
   ```bash
   docker compose up -d
   ```

4. **Backend**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npm run dev
   ```
   A API estará disponível em `http://localhost:3333`.

5. **Frontend** (em outro terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   O app estará disponível em `http://localhost:3000`.

## Estrutura do monorepo

```
CourseSphere/
├── backend/                  # API Fastify + Prisma
│   ├── src/
│   │   ├── controllers/      # Manipulam HTTP, chamam models
│   │   ├── models/           # Queries Prisma + regras de negócio
│   │   ├── routes/           # Registram endpoints e middlewares
│   │   ├── middlewares/      # Auth, error handling
│   │   ├── schemas/          # Zod schemas de validação
│   │   └── lib/              # Prisma client, JWT helpers
│   └── prisma/schema.prisma
├── frontend/                 # Next.js App Router
│   └── src/
│       ├── app/              # Rotas e layouts
│       ├── components/       # Componentes React
│       ├── services/         # Axios + serviços de API
│       ├── hooks/            # TanStack Query hooks
│       ├── contexts/         # AuthContext
│       └── types/            # Tipos TypeScript compartilhados
├── docker-compose.yml
└── .env.example
```

## Decisões técnicas

**Node.js em vez de Rails** — Node é minha stack principal; produtividade e familiaridade maiores para o prazo do desafio. A arquitetura MVC explícita do backend espelha a separação de responsabilidades esperada por quem avalia com background em Rails.

**Fastify em vez de Express** — performance superior e suporte nativo a TypeScript + schemas.

**Monorepo sem Turborepo/Nx** — escopo do desafio não justifica overhead de tooling. Backend e frontend compartilham apenas os tipos via `frontend/src/types/index.ts`.

**JWT manual** — não usa a integração nativa do Fastify para deixar a implementação explícita e auditável.

## Deploy

> _A preencher após configuração do ambiente de produção._

## Credenciais de teste

> _A preencher após implementação do seed._
