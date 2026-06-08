import { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import type { FileMetadata } from '@filevault/shared';
import { FileIcon } from './FileIcon';

interface FilePreviewModalProps {
  file: FileMetadata | null;
  presignedUrl: string | null;
  onClose: () => void;
}

export function FilePreviewModal({
  file,
  presignedUrl,
  onClose,
}: FilePreviewModalProps) {
  useEffect(() => {
    if (!file) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [file, onClose]);

  if (!file || !presignedUrl) return null;

  const isImage = file.mimeType.startsWith('image/');

  return (
    <div
      className="backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-base/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="modal-in panel flex max-h-[90vh] w-full max-w-4xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileIcon mimeType={file.mimeType} />
            <div className="min-w-0">
              <h3 className="truncate font-medium text-ink">{file.name}</h3>
              <p className="mono-label mt-0.5">
                {isImage ? 'imagem' : 'documento'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!isImage && (
              <a
                href={presignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-signal px-3 py-1.5 text-sm font-semibold text-[#0a0e10] transition-transform duration-150 hover:brightness-110 active:scale-95"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            )}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-lg p-2 text-muted transition-colors duration-150 hover:bg-elevated hover:text-ink active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-[400px] flex-1 items-center justify-center overflow-auto p-4">
          {isImage ? (
            <img
              src={presignedUrl}
              alt={file.name}
              className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-2xl shadow-black/50"
            />
          ) : (
            <iframe
              data-testid="pdf-embed"
              src={presignedUrl}
              className="h-[70vh] w-full rounded-lg border border-line bg-white"
              title={file.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
