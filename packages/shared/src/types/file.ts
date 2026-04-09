export interface FileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  file: FileMetadata;
}

export interface FileListResponse {
  files: FileMetadata[];
  total: number;
  page: number;
  limit: number;
}

export interface PreviewResponse {
  presignedUrl: string;
  expiresIn: number;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB maximo
