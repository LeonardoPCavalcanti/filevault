import { FileImage, FileText } from 'lucide-react';

interface FileIconProps {
  mimeType: string;
  className?: string;
}

export function FileIcon({ mimeType, className = 'h-5 w-5' }: FileIconProps) {
  if (mimeType.startsWith('image/')) {
    return <FileImage className={`${className} text-green-600`} />;
  }
  return <FileText className={`${className} text-red-600`} />;
}
