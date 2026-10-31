import type {
  FileListResponse,
  FileMetadata,
  PreviewResponse,
} from '@filevault/shared';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@filevault/shared';

/**
 * Modo demonstracao: a API nao esta publicada, entao o site ao vivo simula o
 * backend inteiro no navegador. Os metadados vivem em memoria e os bytes
 * ficam em object URLs (equivalente local da presigned URL de curta duracao).
 * Nada sai do navegador e tudo some ao recarregar a pagina.
 */
export const isDemo =
  import.meta.env.VITE_DEMO === 'true' || !import.meta.env.VITE_API_URL;

interface DemoFile extends FileMetadata {
  url: string;
}

const PREVIEW_EXPIRES_IN = 15 * 60;

function seedSvg(label: string, hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
  <rect width="100%" height="100%" fill="hsl(${hue} 45% 14%)"/>
  <circle cx="640" cy="120" r="140" fill="hsl(${hue} 70% 55% / .35)"/>
  <text x="48" y="430" font-family="monospace" font-size="40" fill="hsl(${hue} 70% 80%)">${label}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function iso(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

const seeds: DemoFile[] = [
  {
    id: 'demo-1',
    name: 'contrato-assinado.png',
    mimeType: 'image/png',
    size: 482_311,
    createdAt: iso(180),
    updatedAt: iso(180),
    url: seedSvg('contrato-assinado.png', 150),
  },
  {
    id: 'demo-2',
    name: 'foto-perfil.jpg',
    mimeType: 'image/jpeg',
    size: 1_204_776,
    createdAt: iso(95),
    updatedAt: iso(95),
    url: seedSvg('foto-perfil.jpg', 30),
  },
];

let files: DemoFile[] = [...seeds];
let seq = 0;

function toMetadata(f: DemoFile): FileMetadata {
  return {
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function demoList(page: number, limit: number): Promise<FileListResponse> {
  await wait(120);
  const ordered = [...files].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const start = (page - 1) * limit;
  return {
    files: ordered.slice(start, start + limit).map(toMetadata),
    total: ordered.length,
    page,
    limit,
  };
}

export async function demoUpload(file: File): Promise<FileMetadata> {
  // As mesmas regras que a API aplica (allowlist de MIME e tamanho maximo).
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new Error('Tipo de arquivo nao permitido. Use JPG, PNG ou PDF.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo maior que o limite de 10 MB.');
  }
  await wait(400 + Math.min(file.size / 20_000, 1200));
  const now = new Date().toISOString();
  const stored: DemoFile = {
    id: `demo-${Date.now()}-${++seq}`,
    name: file.name,
    mimeType: file.type,
    size: file.size,
    createdAt: now,
    updatedAt: now,
    url: URL.createObjectURL(file),
  };
  files = [stored, ...files];
  return toMetadata(stored);
}

export async function demoPreview(id: string): Promise<PreviewResponse> {
  await wait(80);
  const found = files.find((f) => f.id === id);
  if (!found) throw new Error('Arquivo nao encontrado');
  return { presignedUrl: found.url, expiresIn: PREVIEW_EXPIRES_IN };
}

export async function demoDelete(id: string): Promise<void> {
  await wait(120);
  const found = files.find((f) => f.id === id);
  if (found && found.url.startsWith('blob:')) URL.revokeObjectURL(found.url);
  files = files.filter((f) => f.id !== id);
}

/** Somente para testes: volta ao estado inicial. */
export function demoReset(): void {
  files = [...seeds];
  seq = 0;
}
