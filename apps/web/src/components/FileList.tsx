import { Eye, Trash2, FolderOpen } from 'lucide-react';
import type { FileMetadata } from '@filevault/shared';
import { FileIcon } from './FileIcon';
import { Pagination } from './Pagination';

interface FileListProps {
  files: FileMetadata[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPreview: (file: FileMetadata) => void;
  onDelete: (file: FileMetadata) => void;
  onPageChange: (page: number) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function SkeletonRow() {
  return (
    <tr data-testid="skeleton-row" className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-6" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
    </tr>
  );
}

export function FileList({
  files,
  total,
  page,
  limit,
  isLoading,
  onPreview,
  onDelete,
  onPageChange,
}: FileListProps) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="px-4 py-3 w-10" />
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </tbody>
        </table>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FolderOpen className="mx-auto h-12 w-12 mb-3" />
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="px-4 py-3 w-10" />
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr
                key={file.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <FileIcon mimeType={file.mimeType} />
                </td>
                <td className="px-4 py-3 font-medium text-gray-800 truncate max-w-xs">
                  {file.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatSize(file.size)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(file.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPreview(file)}
                      aria-label="Preview"
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(file)}
                      aria-label="Delete"
                      className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={onPageChange}
      />
    </div>
  );
}
