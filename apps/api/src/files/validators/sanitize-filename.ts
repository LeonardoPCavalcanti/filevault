import { basename } from 'path';

export function sanitizeFilename(name: string): string {
  let safe = basename(name);
  safe = safe.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  if (safe.length > 255) {
    safe = safe.substring(0, 255);
  }
  return safe || 'unnamed';
}
