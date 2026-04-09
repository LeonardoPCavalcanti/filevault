import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FileList } from './FileList';
import type { FileMetadata } from '@filevault/shared';

const mockFiles: FileMetadata[] = [
  {
    id: '1',
    name: 'photo.jpg',
    mimeType: 'image/jpeg',
    size: 204800,
    createdAt: '2026-04-08T10:00:00Z',
    updatedAt: '2026-04-08T10:00:00Z',
  },
  {
    id: '2',
    name: 'document.pdf',
    mimeType: 'application/pdf',
    size: 1048576,
    createdAt: '2026-04-08T11:00:00Z',
    updatedAt: '2026-04-08T11:00:00Z',
  },
];

describe('FileList', () => {
  it('renders file names', () => {
    render(
      <FileList
        files={mockFiles}
        total={2}
        page={1}
        limit={20}
        isLoading={false}
        onPreview={vi.fn()}
        onDelete={vi.fn()}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });

  it('shows skeleton when loading', () => {
    render(
      <FileList
        files={[]}
        total={0}
        page={1}
        limit={20}
        isLoading={true}
        onPreview={vi.fn()}
        onDelete={vi.fn()}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getAllByTestId('skeleton-row')).toHaveLength(3);
  });

  it('shows empty state when no files', () => {
    render(
      <FileList
        files={[]}
        total={0}
        page={1}
        limit={20}
        isLoading={false}
        onPreview={vi.fn()}
        onDelete={vi.fn()}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/nenhum arquivo/i)).toBeInTheDocument();
  });

  it('calls onPreview when eye button clicked', async () => {
    const onPreview = vi.fn();
    render(
      <FileList
        files={mockFiles}
        total={2}
        page={1}
        limit={20}
        isLoading={false}
        onPreview={onPreview}
        onDelete={vi.fn()}
        onPageChange={vi.fn()}
      />,
    );
    const previewButtons = screen.getAllByLabelText('Visualizar');
    await userEvent.click(previewButtons[0]);
    expect(onPreview).toHaveBeenCalledWith(mockFiles[0]);
  });

  it('calls onDelete when trash button clicked', async () => {
    const onDelete = vi.fn();
    render(
      <FileList
        files={mockFiles}
        total={2}
        page={1}
        limit={20}
        isLoading={false}
        onPreview={vi.fn()}
        onDelete={onDelete}
        onPageChange={vi.fn()}
      />,
    );
    const deleteButtons = screen.getAllByLabelText('Deletar');
    await userEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith(mockFiles[0]);
  });
});
