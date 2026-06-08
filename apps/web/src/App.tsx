import { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Database, Lock } from 'lucide-react';
import type { FileMetadata } from '@filevault/shared';
import { useFiles, useFilePreview, useDeleteFile } from './hooks/use-files';
import { UploadZone } from './components/UploadZone';
import { FileList } from './components/FileList';
import { FilePreviewModal } from './components/FilePreviewModal';

export default function App() {
  const [page, setPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);

  const { data, isLoading } = useFiles(page);
  const { data: preview } = useFilePreview(selectedFile?.id ?? null);
  const deleteFile = useDeleteFile();

  const handleDelete = async (file: FileMetadata) => {
    try {
      await deleteFile.mutateAsync(file.id);
      toast.success(`${file.name} deletado`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao deletar');
    }
  };

  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <div className="rise flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-signal/30 bg-signal/10">
              <ShieldCheck className="h-5 w-5 text-signal" />
            </div>
            <div className="leading-tight">
              <p className="font-mono text-[0.95rem] font-bold tracking-tight">
                file<span className="text-signal">vault</span>
              </p>
              <p className="mono-label">Secure object storage</p>
            </div>
          </div>

          <div
            className="rise hidden items-center gap-5 text-faint sm:flex"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            <span className="flex items-center gap-1.5 mono-label">
              <Lock className="h-3.5 w-3.5" /> Signed URLs
            </span>
            <span className="flex items-center gap-1.5 mono-label">
              <Database className="h-3.5 w-3.5" /> R2 backend
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
        <section className="rise mb-10" style={{ '--i': 1 } as React.CSSProperties}>
          <h1 className="max-w-xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-[2.6rem]">
            Envie, guarde e recupere
            <br />
            <span className="text-muted">arquivos com segurança.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
            Upload direto para armazenamento de objetos, preview instantâneo e
            acesso por URLs assinadas de curta duração.
          </p>
        </section>

        <section
          className="rise mb-9"
          style={{ '--i': 2 } as React.CSSProperties}
        >
          <h2 className="mono-label mb-3">// upload</h2>
          <UploadZone />
        </section>

        <section className="rise" style={{ '--i': 3 } as React.CSSProperties}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="mono-label">// manifesto</h2>
            <span className="tabular text-xs text-faint">
              {String(total).padStart(3, '0')}{' '}
              {total === 1 ? 'objeto' : 'objetos'}
            </span>
          </div>
          <div className="panel overflow-hidden">
            <FileList
              files={data?.files ?? []}
              total={total}
              page={page}
              limit={data?.limit ?? 20}
              isLoading={isLoading}
              onPreview={setSelectedFile}
              onDelete={handleDelete}
              onPageChange={setPage}
            />
          </div>
        </section>
      </main>

      <FilePreviewModal
        file={selectedFile}
        presignedUrl={preview?.presignedUrl ?? null}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  );
}
