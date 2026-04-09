import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  FileListResponse,
  FileMetadata,
  PreviewResponse,
} from '@filevault/shared';

export function useFiles(page: number = 1, limit: number = 20) {
  return useQuery<FileListResponse>({
    queryKey: ['files', page, limit],
    queryFn: async () => {
      const { data } = await api.get<FileListResponse>(
        `/files?page=${page}&limit=${limit}`,
      );
      return data;
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation<FileMetadata, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<FileMetadata>('/files/upload', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useFilePreview(id: string | null) {
  return useQuery<PreviewResponse>({
    queryKey: ['file-preview', id],
    queryFn: async () => {
      const { data } = await api.get<PreviewResponse>(
        `/files/${id}/preview`,
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await api.delete(`/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}
