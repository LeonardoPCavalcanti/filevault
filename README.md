# FileVault

Aplicacao de upload e gerenciamento de arquivos construida com NestJS + React + Cloudflare R2.

**Teste tecnico para:** Desenvolvedor FullStack - ConectaDev

---

## Como Testar a Aplicacao

### Opcao 1: Acessar online (mais rapido)

A aplicacao esta deployada e funcionando:

| Servico | URL |
|---------|-----|
| Frontend | https://filevault-henna.vercel.app |
| API | https://filevault-production-4509.up.railway.app/api |
| Swagger (documentacao da API) | https://filevault-production-4509.up.railway.app/api/docs |

**Passo a passo para testar:**

1. Acesse https://filevault-henna.vercel.app
2. **Upload:** arraste uma imagem (JPG, PNG) ou PDF para a area de upload, ou clique para selecionar
3. **Listagem:** o arquivo aparece na tabela com nome, tamanho e data
4. **Preview:** clique no icone do olho para visualizar a imagem ou PDF
5. **Delete:** clique no icone da lixeira para remover o arquivo
6. **Paginacao:** envie varios arquivos e navegue entre as paginas

### Opcao 2: Rodar localmente com Docker

Pre-requisitos: Docker e Docker Compose instalados.

```bash
git clone https://github.com/LeonardoPCavalcanti/filevault.git
cd filevault
cp .env.example .env
```

Edite o `.env` com suas credenciais do Cloudflare R2 (veja a secao [Variaveis de Ambiente](#variaveis-de-ambiente) abaixo), e depois:

```bash
docker compose up
```

| Servico | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |

### Opcao 3: Rodar localmente sem Docker (desenvolvimento)

Pre-requisitos: Node.js 20+, Docker (apenas para o PostgreSQL).

```bash
git clone https://github.com/LeonardoPCavalcanti/filevault.git
cd filevault
npm install
cp .env.example .env
```

Edite o `.env` com suas credenciais do Cloudflare R2, e depois:

```bash
docker compose up postgres -d   # sobe apenas o PostgreSQL
npm run dev                     # sobe API + frontend em paralelo
```

| Servico | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |

### Rodar os Testes

```bash
npm test                                    # todos os testes (32 testes)
npm test --workspace=@filevault/api         # 19 testes unitarios do backend
npm run test:e2e --workspace=@filevault/api # 11 testes E2E do backend
npm test --workspace=@filevault/web         # 13 testes do frontend
```

---

## Stack

- **Backend:** NestJS, TypeORM, PostgreSQL
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, TanStack Query
- **Armazenamento:** Cloudflare R2 (compativel com S3, presigned URLs)
- **Infra:** Docker Compose, Turborepo monorepo
- **CI:** GitHub Actions (lint, typecheck, testes automaticos a cada push)
- **Deploy:** Railway (API + PostgreSQL) + Vercel (Frontend)

## Decisoes de Projeto

- **Sem base64 no banco** -- arquivos armazenados no Cloudflare R2, apenas metadados + chave no PostgreSQL
- **Presigned URLs** -- arquivos nunca ficam publicos; URLs temporarias com expiracao de 15 minutos
- **Validacao por magic bytes** -- valida o conteudo real do arquivo, nao apenas a extensao
- **Monorepo com tipos compartilhados** -- type safety de ponta a ponta entre frontend e backend

## Endpoints da API

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | /api/files/upload | Upload de arquivo (multipart/form-data, max 10MB) |
| GET | /api/files?page=1&limit=20 | Listar arquivos (paginado) |
| GET | /api/files/:id | Detalhes do arquivo |
| GET | /api/files/:id/preview | Obter presigned URL para visualizacao |
| DELETE | /api/files/:id | Deletar arquivo (R2 + banco) |
| GET | /api/health | Health check (status da API e do banco) |

Todos os endpoints estao documentados interativamente no Swagger (`/api/docs`).

## Seguranca

- Whitelist de MIME types (apenas JPEG, PNG, PDF)
- Validacao por magic bytes (previne spoofing de extensao)
- Limite de tamanho de arquivo (10MB)
- Sanitizacao de nome de arquivo (previne path traversal)
- Rate limiting (10 requisicoes/minuto no upload)
- Headers de seguranca com Helmet
- CORS restrito a origem do frontend
- Presigned URLs com expiracao de 15 minutos

## Variaveis de Ambiente

Copie `.env.example` para `.env` e preencha:

| Variavel | Descricao |
|----------|-----------|
| `DATABASE_URL` | URL de conexao PostgreSQL |
| `R2_ACCOUNT_ID` | Account ID da Cloudflare |
| `R2_ACCESS_KEY_ID` | Access Key do token R2 |
| `R2_SECRET_ACCESS_KEY` | Secret Key do token R2 |
| `R2_BUCKET_NAME` | Nome do bucket no R2 |
| `R2_ENDPOINT` | Endpoint S3 do R2 |
| `CORS_ORIGIN` | URL do frontend (para CORS) |
| `VITE_API_URL` | URL da API (usado pelo frontend) |

Para criar as credenciais do R2 gratuitamente: Cloudflare Dashboard > R2 Object Storage > Criar bucket > Manage API Tokens > Create API Token.

## Estrutura do Projeto

```
filevault/
├── apps/
│   ├── api/                 # Backend NestJS
│   │   ├── src/
│   │   │   ├── config/      # Validacao de env e config do R2
│   │   │   ├── files/       # Modulo de arquivos (controller, service, entity, DTOs)
│   │   │   ├── health/      # Health check
│   │   │   └── storage/     # Servico de integracao com Cloudflare R2
│   │   └── test/            # Testes E2E
│   └── web/                 # Frontend React
│       └── src/
│           ├── components/   # UploadZone, FileList, FilePreviewModal, Pagination
│           ├── hooks/        # React Query hooks (upload, listagem, preview, delete)
│           └── lib/          # Cliente HTTP (axios)
├── packages/
│   └── shared/              # Tipos TypeScript compartilhados (FileMetadata, etc.)
├── .github/workflows/       # CI com GitHub Actions
├── docker-compose.yml       # Postgres + API + Frontend (nginx)
├── turbo.json               # Configuracao do Turborepo
└── vercel.json              # Configuracao de deploy do frontend
```
