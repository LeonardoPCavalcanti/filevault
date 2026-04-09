import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadFile } from '../hooks/use-files';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@filevault/shared';

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
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Solte o arquivo aqui</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">
              Drag & drop ou clique para enviar
            </p>
            <p className="text-sm text-gray-400 mt-1">
              .jpg, .png, .pdf (max 10MB)
            </p>
          </>
        )}
      </div>

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {fileRejections.length > 0 && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Tipo de arquivo nao suportado ou excede 10MB</span>
        </div>
      )}
    </div>
  );
}
