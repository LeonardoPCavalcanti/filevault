import { validateFileType } from './file-type.validator';

describe('validateFileType', () => {
  it('should accept valid JPEG (magic bytes FFD8FF)', () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
    expect(validateFileType(buffer, 'image/jpeg')).toBe(true);
  });

  it('should accept valid PNG (magic bytes 89504E47)', () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d]);
    expect(validateFileType(buffer, 'image/png')).toBe(true);
  });

  it('should accept valid PDF (magic bytes 25504446)', () => {
    const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
    expect(validateFileType(buffer, 'application/pdf')).toBe(true);
  });

  it('should reject file with mismatched MIME and magic bytes', () => {
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d]);
    expect(validateFileType(pngBytes, 'image/jpeg')).toBe(false);
  });

  it('should reject unsupported MIME type', () => {
    const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(validateFileType(buffer, 'application/zip')).toBe(false);
  });

  it('should reject empty buffer', () => {
    const buffer = Buffer.from([]);
    expect(validateFileType(buffer, 'image/jpeg')).toBe(false);
  });
});
