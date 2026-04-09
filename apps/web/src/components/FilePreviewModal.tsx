import { X, Download } from 'lucide-react';
import type { FileMetadata } from '@filevault/shared';

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
  if (!file || !presignedUrl) return null;

  const isImage = file.mimeType.startsWith('image/');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-800 truncate">{file.name}</h3>
          <div className="flex items-center gap-2">
            {!isImage && (
              <a
                href={presignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[400px]">
          {isImage ? (
            <img
              src={presignedUrl}
              alt={file.name}
              className="max-w-full max-h-[70vh] object-contain rounded"
            />
          ) : (
            <iframe
              data-testid="pdf-embed"
              src={presignedUrl}
              className="w-full h-[70vh] rounded border border-gray-200"
              title={file.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
