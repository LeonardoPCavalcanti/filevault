import { useState } from 'react';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
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
      toast.success(`${file.name} deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Shield className="h-7 w-7 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-800">FileVault</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h2 className="text-lg font-medium text-gray-700 mb-3">Upload</h2>
          <UploadZone />
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-700 mb-3">Files</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <FileList
              files={data?.files ?? []}
              total={data?.total ?? 0}
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
