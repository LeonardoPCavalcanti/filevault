import { Eye, Trash2, Inbox } from 'lucide-react';
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

const headCell = 'px-5 py-3 mono-label text-left';

function SkeletonRow() {
  return (
    <tr data-testid="skeleton-row" className="border-t border-line/60">
      <td className="px-5 py-4"><div className="h-4 w-5 animate-pulse rounded bg-line-strong" /></td>
      <td className="px-5 py-4"><div className="h-4 w-40 animate-pulse rounded bg-line-strong" /></td>
      <td className="px-5 py-4"><div className="h-4 w-16 animate-pulse rounded bg-line-strong" /></td>
      <td className="px-5 py-4"><div className="h-4 w-20 animate-pulse rounded bg-line-strong" /></td>
      <td className="px-5 py-4"><div className="ml-auto h-4 w-14 animate-pulse rounded bg-line-strong" /></td>
    </tr>
  );
}

function Header() {
  return (
    <thead>
      <tr className="bg-elevated/40">
        <th className={`${headCell} w-12`} />
        <th className={headCell}>Nome</th>
        <th className={headCell}>Tamanho</th>
        <th className={headCell}>Enviado</th>
        <th className={`${headCell} w-28 text-right`}>Ações</th>
      </tr>
    </thead>
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
        <table className="w-full border-collapse">
          <Header />
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
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-line-strong bg-elevated/50 text-faint">
          <Inbox className="h-6 w-6" />
        </div>
        <p className="font-medium text-muted">Nenhum arquivo enviado ainda</p>
        <p className="mono-label mt-2">o manifesto aparecerá aqui</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <Header />
          <tbody>
            {files.map((file, idx) => (
              <tr
                key={file.id}
                className="rise group border-t border-line/60 transition-colors duration-150 hover:bg-signal/[0.035]"
                style={{ '--i': Math.min(idx, 8) } as React.CSSProperties}
              >
                <td className="px-5 py-4">
                  <FileIcon mimeType={file.mimeType} />
                </td>
                <td className="max-w-xs truncate px-5 py-4 font-medium text-ink">
                  {file.name}
                </td>
                <td className="tabular px-5 py-4 text-sm text-muted">
                  {formatSize(file.size)}
                </td>
                <td className="tabular px-5 py-4 text-sm text-muted">
                  {formatDate(file.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-70 transition-opacity duration-150 group-hover:opacity-100">
                    <button
                      onClick={() => onPreview(file)}
                      aria-label="Visualizar"
                      className="rounded-lg p-2 text-muted transition-colors duration-150 hover:bg-signal/10 hover:text-signal active:scale-95"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(file)}
                      aria-label="Deletar"
                      className="rounded-lg p-2 text-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger active:scale-95"
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
      <div className="px-5 pb-4">
        <Pagination
          page={page}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
