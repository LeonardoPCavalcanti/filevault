# FileVault

Aplicacao de upload e gerenciamento de arquivos construida com NestJS + React + Cloudflare R2.

**Teste tecnico para:** Desenvolvedor FullStack - ConectaDev

---

## Demonstracao Online

A forma mais rapida de testar. Basta acessar o link abaixo:

**https://filevault-henna.vercel.app**

| Servico | URL |
|---------|-----|
| Frontend | https://filevault-henna.vercel.app |
| API | https://filevault-production-4509.up.railway.app/api |
| Documentacao Swagger | https://filevault-production-4509.up.railway.app/api/docs |

### O que testar

1. **Upload** -- arraste uma imagem (JPG, PNG) ou um PDF para a area de upload, ou clique para selecionar o arquivo
2. **Listagem** -- apos o upload, o arquivo aparece na tabela com nome, tamanho e data
3. **Preview** -- clique no icone do olho para visualizar a imagem ou o PDF diretamente no navegador
4. **Delete** -- clique no icone da lixeira para remover o arquivo
5. **Paginacao** -- envie varios arquivos para ver a navegacao entre paginas
6. **Swagger** -- acesse a documentacao interativa da API em `/api/docs` para testar os endpoints diretamente

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
| Deploy | Railway (API + PostgreSQL) + Vercel (Frontend) |

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
