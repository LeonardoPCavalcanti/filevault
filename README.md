# FileVault

File upload and management application built with NestJS + React + Cloudflare R2.

**Technical test for:** Desenvolvedor FullStack - ConectaDev

## Tech Stack

- **Backend:** NestJS, TypeORM, PostgreSQL
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Storage:** Cloudflare R2 (S3-compatible, presigned URLs)
- **Infra:** Docker Compose, Turborepo monorepo
- **CI:** GitHub Actions
- **Deploy:** Railway (API + DB) + Vercel (Frontend)

## Key Design Decisions

- **No base64 in database** -- files stored in Cloudflare R2, only metadata + key in PostgreSQL
- **Presigned URLs** -- files never publicly accessible; temporary URLs (15min expiry)
- **Magic bytes validation** -- validates actual file content, not just extension
- **Monorepo with shared types** -- end-to-end type safety

## Quick Start

### Prerequisites

- Docker + Docker Compose
- Cloudflare R2 account (free tier)

### 1. Clone and configure

```bash
git clone <repo-url>
cd filevault
cp .env.example .env
# Edit .env with your R2 credentials
```

### 2. Run with Docker Compose

```bash
docker compose up
```

- API: http://localhost:3000/api
- Swagger docs: http://localhost:3000/api/docs
- Frontend: http://localhost:8080

### Local Development (without Docker)

```bash
npm install
docker compose up postgres -d
npm run dev
```

- API: http://localhost:3000
- Frontend: http://localhost:5173

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/files/upload | Upload file (multipart/form-data) |
| GET | /api/files?page=1&limit=20 | List files (paginated) |
| GET | /api/files/:id | File details |
| GET | /api/files/:id/preview | Get presigned URL |
| DELETE | /api/files/:id | Delete file |
| GET | /api/health | Health check |

## Security

- MIME type whitelist (JPEG, PNG, PDF only)
- Magic bytes validation (prevents extension spoofing)
- File size limit (10MB)
- Filename sanitization (prevents path traversal)
- Rate limiting (10 requests/minute on upload)
- Helmet security headers
- CORS restricted to frontend origin
- Presigned URLs with 15-minute expiry

## Testing

```bash
npm test                                    # All tests
npm test --workspace=@filevault/api         # Backend unit tests
npm run test:e2e --workspace=@filevault/api # Backend E2E tests
npm test --workspace=@filevault/web         # Frontend tests
```

## Project Structure

```
filevault/
├── apps/
│   ├── api/        # NestJS backend
│   └── web/        # React frontend
├── packages/
│   └── shared/     # Shared TypeScript types
├── docker-compose.yml
└── turbo.json
```
