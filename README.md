# FileVault

[![CI](https://github.com/LeonardoPCavalcanti/filevault/actions/workflows/ci.yml/badge.svg)](https://github.com/LeonardoPCavalcanti/filevault/actions/workflows/ci.yml)
![Testes](https://img.shields.io/badge/testes-32_unit_%2B_11_E2E-c8f23d)
[![Demo](https://img.shields.io/badge/demo-vercel-black?logo=vercel)](https://filevault-api.vercel.app)

Aplicação de upload e gerenciamento de arquivos construída com NestJS + React + Cloudflare R2 — upload direto ao object storage via presigned URLs, validação por magic bytes e tipos compartilhados em monorepo.

[![FileVault — upload de arquivos](docs/preview.png)](https://filevault-api.vercel.app)

**Demo ao vivo: [filevault-api.vercel.app](https://filevault-api.vercel.app)**

---

## O que este projeto ensina

> Mais do que um CRUD de arquivos, este projeto estuda **como aplicações reais lidam com upload de blobs** sem sobrecarregar o servidor nem confiar cegamente no cliente.

### 1. Upload desacoplado com Presigned URLs
O caminho ingênuo — o arquivo passa pelo servidor da API até o storage — desperdiça banda e memória do backend e cria um gargalo. A abordagem usada aqui separa **dados** de **controle**:
- O banco (PostgreSQL) guarda apenas **metadados** (nome, tamanho, tipo, chave do objeto) — nunca os bytes.
- Os bytes vivem no **object storage** (Cloudflare R2, compatível com a API S3).
- O acesso ao arquivo é dado por uma **presigned URL**: um link **temporário e assinado** (expira em 15 min) que autoriza uma única operação. O arquivo nunca fica público; não há servidor servindo o blob.

Esse é o padrão de fato em produção (S3, GCS, R2) — e a razão de NÃO guardar arquivos como base64 no banco.

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente (React)
    participant A as API (NestJS)
    participant DB as PostgreSQL
    participant R2 as Cloudflare R2

    C->>A: POST /api/files/upload (multipart)
    A->>A: valida MIME + magic bytes + tamanho
    A->>R2: PutObject (chave UUID)
    A->>DB: INSERT metadados (nome, tipo, tamanho, chave)
    A-->>C: 201 (id do arquivo)

    Note over C,R2: Visualização — o blob nunca passa pela API
    C->>A: GET /api/files/:id/preview
    A->>R2: gera presigned URL (expira em 15 min)
    A-->>C: URL assinada
    C->>R2: GET direto no bucket (URL temporária)
```

### 2. Não confie na extensão: validação por *magic bytes*
Um arquivo `virus.exe` renomeado para `foto.png` engana a extensão e até o MIME enviado pelo cliente. Por isso a validação lê os **bytes iniciais** do arquivo (a *magic number* — ex.: PNG começa com `89 50 4E 47`) para confirmar o tipo **real**. É um exemplo concreto de **defense in depth** e de "nunca confie na entrada do cliente".

### 3. Type safety de ponta a ponta (monorepo)
Frontend e backend compartilham os **mesmos tipos TypeScript** via Turborepo. O contrato da API é verificado em tempo de compilação dos dois lados — se o backend muda um campo, o frontend não compila. Menos bugs de integração, mais refatoração segura.

### 4. Superfície de ataque de um endpoint de upload
O projeto trata as ameaças clássicas: limite de tamanho (evita exaustão de disco/memória), *rate limiting* (evita abuso), sanitização de filename (evita **path traversal**), whitelist de MIME, headers de segurança (Helmet) e CORS restrito. Bom estudo de **como pensar em segurança** num recurso que recebe dados arbitrários.

---

## Demonstracao Online

A interface esta publicada em **https://filevault-api.vercel.app** (Vercel, deploy automatico a cada push).

> A API e o banco rodam localmente via Docker Compose (instrucoes abaixo) — o backend publico
> esta temporariamente fora do ar enquanto migra de provedor. A pilha completa sobe com um
> unico `docker compose up`.

### Funcionalidades

- **Upload** -- arraste e solte imagens (JPG, PNG) ou PDFs na area de upload, ou clique para selecionar
- **Listagem paginada** -- arquivos enviados aparecem em tabela com nome, tamanho e data, com navegacao entre paginas
- **Preview** -- visualizacao de imagens e PDFs diretamente no navegador via presigned URL temporaria
- **Delete** -- remocao do arquivo tanto do object storage (R2) quanto do banco
- **API documentada** -- todos os endpoints descritos interativamente no Swagger (`/api/docs`)

### Regras de upload

- Tipos aceitos: JPEG, PNG e PDF
- Tamanho maximo: 10MB por arquivo
- Arquivos com extensao falsa sao rejeitados (validacao por magic bytes)

---

## Rodar Localmente

### Opcao A: Com Docker (recomendado)

Pre-requisitos: [Docker](https://docs.docker.com/get-docker/) e Docker Compose.

```bash
# 1. Clonar o repositorio
git clone https://github.com/LeonardoPCavalcanti/filevault.git
cd filevault

# 2. Configurar variaveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Cloudflare R2 (veja a secao "Variaveis de Ambiente")

# 3. Subir todos os servicos
docker compose up
```

Depois acesse:

| Servico | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |

### Opcao B: Sem Docker (desenvolvimento)

Pre-requisitos: Node.js 20+ e Docker (apenas para o PostgreSQL).

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/LeonardoPCavalcanti/filevault.git
cd filevault
npm install

# 2. Configurar variaveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Cloudflare R2

# 3. Subir o banco de dados
docker compose up postgres -d

# 4. Rodar API e frontend em paralelo
npm run dev
```

Depois acesse:

| Servico | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |

---

## Testes Automatizados

O projeto possui 32 testes (19 unitarios no backend, 13 no frontend) alem de 11 testes E2E.

```bash
# Rodar todos os testes
npm test

# Apenas backend (unitarios)
npm test --workspace=@filevault/api

# Apenas backend (E2E)
npm run test:e2e --workspace=@filevault/api

# Apenas frontend
npm test --workspace=@filevault/web
```

Os testes tambem rodam automaticamente no CI (GitHub Actions) a cada push.

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Backend | NestJS, TypeORM, PostgreSQL |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, TanStack Query |
| Armazenamento | Cloudflare R2 (compativel com S3, presigned URLs) |
| Infra | Docker Compose, Turborepo (monorepo) |
| CI/CD | GitHub Actions (lint, typecheck, testes) |
| Deploy | Vercel (frontend) · API + PostgreSQL via Docker Compose |

## Decisoes de Projeto

| Decisao | Motivo |
|---------|--------|
| Sem base64 no banco | Arquivos ficam no Cloudflare R2; no PostgreSQL ficam apenas metadados e a chave do objeto |
| Presigned URLs | Arquivos nunca ficam publicos; URLs temporarias com expiracao de 15 minutos |
| Validacao por magic bytes | Valida o conteudo real do arquivo, nao apenas a extensao (previne spoofing) |
| Monorepo com tipos compartilhados | Type safety de ponta a ponta entre frontend e backend |
| Turborepo | Build otimizado com cache entre workspaces |

## Endpoints da API

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `POST` | `/api/files/upload` | Upload de arquivo (multipart/form-data, max 10MB) |
| `GET` | `/api/files?page=1&limit=20` | Listar arquivos (paginado) |
| `GET` | `/api/files/:id` | Detalhes do arquivo |
| `GET` | `/api/files/:id/preview` | Obter presigned URL para visualizacao |
| `DELETE` | `/api/files/:id` | Deletar arquivo (R2 + banco) |
| `GET` | `/api/health` | Health check (status da API e do banco) |

Todos os endpoints estao documentados interativamente no Swagger (`/api/docs`).

## Seguranca

| Medida | Descricao |
|--------|-----------|
| MIME whitelist | Apenas JPEG, PNG e PDF sao aceitos |
| Magic bytes | Valida os bytes iniciais do arquivo para confirmar o tipo real |
| Limite de tamanho | Maximo de 10MB por arquivo |
| Sanitizacao de filename | Remove caracteres perigosos e previne path traversal |
| Rate limiting | 10 requisicoes/minuto no endpoint de upload |
| Helmet | Headers de seguranca HTTP |
| CORS | Restrito a origem do frontend |
| Presigned URLs | URLs temporarias com expiracao de 15 minutos |

## Variaveis de Ambiente

Copie `.env.example` para `.env` e preencha com suas credenciais:

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexao PostgreSQL | `postgresql://user:pass@localhost:5433/filevault` |
| `R2_ACCOUNT_ID` | Account ID da Cloudflare | `abc123...` |
| `R2_ACCESS_KEY_ID` | Access Key do token R2 | `def456...` |
| `R2_SECRET_ACCESS_KEY` | Secret Key do token R2 | `ghi789...` |
| `R2_BUCKET_NAME` | Nome do bucket no R2 | `filevault-uploads` |
| `R2_ENDPOINT` | Endpoint S3 do R2 | `https://<account_id>.r2.cloudflarestorage.com` |
| `CORS_ORIGIN` | URL do frontend (CORS) | `http://localhost:5173` |
| `VITE_API_URL` | URL da API (usado no frontend) | `http://localhost:3000` |

**Como obter credenciais do R2 (gratuito):**
1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Va em R2 Object Storage > Create bucket
3. Em Manage R2 API Tokens > Create API Token
4. Copie o Account ID, Access Key ID e Secret Access Key

## Estrutura do Projeto

```
filevault/
├── apps/
│   ├── api/                 # Backend NestJS
│   │   ├── src/
│   │   │   ├── config/      # Validacao de env e config do R2
│   │   │   ├── files/       # Modulo de arquivos (controller, service, entity, DTOs)
│   │   │   ├── health/      # Health check com verificacao do banco
│   │   │   └── storage/     # Servico de integracao com Cloudflare R2
│   │   └── test/            # Testes E2E
│   └── web/                 # Frontend React
│       └── src/
│           ├── components/   # UploadZone, FileList, FilePreviewModal, Pagination
│           ├── hooks/        # React Query hooks (upload, listagem, preview, delete)
│           └── lib/          # Cliente HTTP (axios)
├── packages/
│   └── shared/              # Tipos e constantes compartilhados entre front e back
├── .github/workflows/       # CI com GitHub Actions
├── docker-compose.yml       # PostgreSQL + API + Frontend (nginx)
├── turbo.json               # Configuracao do Turborepo
└── vercel.json              # Configuracao de deploy do frontend
```
