import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilePreviewModal } from './FilePreviewModal';

describe('FilePreviewModal', () => {
  it('renders nothing when no file selected', () => {
    const { container } = render(
      <FilePreviewModal file={null} presignedUrl={null} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders image preview for image MIME type', () => {
    render(
      <FilePreviewModal
        file={{ id: '1', name: 'photo.jpg', mimeType: 'image/jpeg', size: 1024, createdAt: '', updatedAt: '' }}
        presignedUrl="https://example.com/photo.jpg"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('renders PDF embed for PDF MIME type', () => {
    render(
      <FilePreviewModal
        file={{ id: '2', name: 'doc.pdf', mimeType: 'application/pdf', size: 1024, createdAt: '', updatedAt: '' }}
        presignedUrl="https://example.com/doc.pdf"
        onClose={vi.fn()}
      />,
    );
    const embed = screen.getByTestId('pdf-embed');
    expect(embed).toHaveAttribute('src', 'https://example.com/doc.pdf');
  });

  it('shows download button for PDF', () => {
    render(
      <FilePreviewModal
        file={{ id: '2', name: 'doc.pdf', mimeType: 'application/pdf', size: 1024, createdAt: '', updatedAt: '' }}
        presignedUrl="https://example.com/doc.pdf"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/download/i)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(
      <FilePreviewModal
        file={{ id: '1', name: 'photo.jpg', mimeType: 'image/jpeg', size: 1024, createdAt: '', updatedAt: '' }}
        presignedUrl="https://example.com/photo.jpg"
        onClose={onClose}
      />,
    );
    await userEvent.click(screen.getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalled();
  });
});
