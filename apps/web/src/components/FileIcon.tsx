import { FileImage, FileText } from 'lucide-react';

interface FileIconProps {
  mimeType: string;
  className?: string;
}

export function FileIcon({ mimeType, className = 'h-5 w-5' }: FileIconProps) {
  const isImage = mimeType.startsWith('image/');
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
        isImage
          ? 'border-tone-image/25 bg-tone-image/10 text-tone-image'
          : 'border-tone-doc/25 bg-tone-doc/10 text-tone-doc'
      }`}
    >
      {isImage ? (
        <FileImage className={className} />
      ) : (
        <FileText className={className} />
      )}
    </span>
  );
}
