import { ALLOWED_MIME_TYPES, AllowedMimeType } from '@filevault/shared';

const MAGIC_BYTES: Record<AllowedMimeType, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
};

export function validateFileType(
  buffer: Buffer,
  declaredMime: string,
): boolean {
  if (!ALLOWED_MIME_TYPES.includes(declaredMime as AllowedMimeType)) {
    return false;
  }

  const expected = MAGIC_BYTES[declaredMime as AllowedMimeType];
  if (!expected || buffer.length < expected.length) {
    return false;
  }

  return expected.every((byte, i) => buffer[i] === byte);
}
