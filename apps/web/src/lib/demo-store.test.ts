import { beforeEach, describe, expect, it, vi } from 'vitest';
import { demoDelete, demoList, demoPreview, demoReset, demoUpload } from './demo-store';

describe('demo-store (backend simulado no navegador)', () => {
  beforeEach(() => {
    demoReset();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: () => 'blob:demo',
      revokeObjectURL: () => undefined,
    });
  });

  it('lista os arquivos de exemplo paginados, mais novo primeiro', async () => {
    const page = await demoList(1, 1);
    expect(page.total).toBe(2);
    expect(page.files).toHaveLength(1);
    expect(page.files[0].name).toBe('foto-perfil.jpg');
  });

  it('aceita upload dentro das regras e coloca o arquivo no topo', async () => {
    const file = new File(['abc'], 'recibo.pdf', { type: 'application/pdf' });
    const meta = await demoUpload(file);
    expect(meta.name).toBe('recibo.pdf');
    expect(meta.mimeType).toBe('application/pdf');
    const page = await demoList(1, 20);
    expect(page.total).toBe(3);
    expect(page.files[0].id).toBe(meta.id);
    const preview = await demoPreview(meta.id);
    expect(preview.presignedUrl).toBe('blob:demo');
    expect(preview.expiresIn).toBeGreaterThan(0);
  });

  it('recusa tipo fora da allowlist e tamanho acima do limite', async () => {
    await expect(
      demoUpload(new File(['x'], 'script.exe', { type: 'application/octet-stream' })),
    ).rejects.toThrow(/nao permitido/);
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'grande.png', {
      type: 'image/png',
    });
    await expect(demoUpload(big)).rejects.toThrow(/10 MB/);
  });

  it('apaga um arquivo e a listagem reflete na hora', async () => {
    await demoDelete('demo-1');
    const page = await demoList(1, 20);
    expect(page.total).toBe(1);
    await expect(demoPreview('demo-1')).rejects.toThrow(/nao encontrado/);
  });
});
