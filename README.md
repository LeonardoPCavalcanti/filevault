# FileVault

Aplicacao de upload e gerenciamento de arquivos construida com NestJS + React + Cloudflare R2.

**Teste tecnico para:** Desenvolvedor FullStack - ConectaDev

## Stack

- **Backend:** NestJS, TypeORM, PostgreSQL
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Armazenamento:** Cloudflare R2 (compativel com S3, presigned URLs)
- **Infra:** Docker Compose, Turborepo monorepo
- **CI:** GitHub Actions
- **Deploy:** Railway (API + DB) + Vercel (Frontend)

## Decisoes de Projeto

- **Sem base64 no banco** -- arquivos armazenados no Cloudflare R2, apenas metadados + chave no PostgreSQL
- **Presigned URLs** -- arquivos nunca ficam publicos; URLs temporarias (expiracao de 15min)
- **Validacao por magic bytes** -- valida o conteudo real do arquivo, nao apenas a extensao
- **Monorepo com tipos compartilhados** -- type safety de ponta a ponta

## Inicio Rapido

### Pre-requisitos

- Docker + Docker Compose
- Conta no Cloudflare R2 (tier gratuito)

### 1. Clonar e configurar

```bash
git clone <repo-url>
cd filevault
cp .env.example .env
# Edite o .env com suas credenciais do R2
```

### 2. Rodar com Docker Compose

```bash
docker compose up
```

- API: http://localhost:3000/api
- Documentacao Swagger: http://localhost:3000/api/docs
- Frontend: http://localhost:8080

### Desenvolvimento Local (sem Docker)

```bash
npm install
docker compose up postgres -d
npm run dev
```

- API: http://localhost:3000
- Frontend: http://localhost:5173

## Endpoints da API

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | /api/files/upload | Upload de arquivo (multipart/form-data) |
| GET | /api/files?page=1&limit=20 | Listar arquivos (paginado) |
| GET | /api/files/:id | Detalhes do arquivo |
| GET | /api/files/:id/preview | Obter presigned URL |
| DELETE | /api/files/:id | Deletar arquivo |
| GET | /api/health | Health check |

## Seguranca

- Whitelist de MIME types (apenas JPEG, PNG, PDF)
- Validacao por magic bytes (previne spoofing de extensao)
- Limite de tamanho (10MB)
- Sanitizacao de nome de arquivo (previne path traversal)
- Rate limiting (10 requisicoes/minuto no upload)
- Headers de seguranca com Helmet
- CORS restrito a origem do frontend
- Presigned URLs com expiracao de 15 minutos

## Testes

```bash
npm test                                    # Todos os testes
npm test --workspace=@filevault/api         # Testes unitarios do backend
npm run test:e2e --workspace=@filevault/api # Testes E2E do backend
npm test --workspace=@filevault/web         # Testes do frontend
```

## Estrutura do Projeto

```
filevault/
├── apps/
│   ├── api/        # Backend NestJS
│   └── web/        # Frontend React
├── packages/
│   └── shared/     # Tipos TypeScript compartilhados
├── docker-compose.yml
└── turbo.json
```
