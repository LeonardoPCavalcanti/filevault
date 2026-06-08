import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadFile } from '../hooks/use-files';
import { MAX_FILE_SIZE } from '@filevault/shared';

export function UploadZone() {
  const uploadFile = useUploadFile();
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} excede o limite de 10MB`);
          continue;
        }

        setProgress(0);
        const interval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        try {
          await uploadFile.mutateAsync(file);
          setProgress(100);
          toast.success(`${file.name} enviado com sucesso`);
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Falha no upload',
          );
        } finally {
          clearInterval(interval);
          setTimeout(() => setProgress(0), 1000);
        }
      }
    },
    [uploadFile],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'application/pdf': ['.pdf'],
      },
      maxSize: MAX_FILE_SIZE,
      multiple: false,
    });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-dashed px-6 py-12 text-center transition-[border-color,background-color,box-shadow] duration-200 ${
          isDragActive
            ? 'border-signal/80 bg-signal/[0.06] shadow-[0_0_0_1px_rgba(200,242,61,0.4),0_0_40px_-8px_rgba(200,242,61,0.45)]'
            : 'border-line-strong bg-surface/40 hover:border-signal/40 hover:bg-surface/70'
        }`}
      >
        <input {...getInputProps()} />
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors duration-200 ${
            isDragActive
              ? 'border-signal/50 bg-signal/15 text-signal'
              : 'border-line-strong bg-elevated/60 text-muted group-hover:text-signal'
          }`}
        >
          <UploadCloud className="h-6 w-6" />
        </div>
        {isDragActive ? (
          <p className="font-medium text-signal">Solte para enviar ao vault</p>
        ) : (
          <>
            <p className="font-medium text-ink">
              Arraste um arquivo ou{' '}
              <span className="text-signal underline-offset-4 group-hover:underline">
                selecione
              </span>
            </p>
            <p className="mono-label mt-2">drag · drop · click — jpg · png · pdf — max 10MB</p>
          </>
        )}
      </div>

      {progress > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="mono-label">transferindo</span>
            <span className="tabular text-xs text-signal">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-signal transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {fileRejections.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Tipo de arquivo não suportado ou excede 10MB.</span>
        </div>
      )}
    </div>
  );
}
