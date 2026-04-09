import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UploadZone } from './UploadZone';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

vi.mock('../hooks/use-files', () => ({
  useUploadFile: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

describe('UploadZone', () => {
  it('renders drop zone with instructions', () => {
    render(<UploadZone />, { wrapper: createWrapper() });
    expect(
      screen.getByText(/drag.*drop|clique para enviar/i),
    ).toBeInTheDocument();
  });

  it('shows accepted file types', () => {
    render(<UploadZone />, { wrapper: createWrapper() });
    expect(screen.getByText(/jpg.*png.*pdf/i)).toBeInTheDocument();
  });

  it('shows max file size', () => {
    render(<UploadZone />, { wrapper: createWrapper() });
    expect(screen.getByText(/10MB/)).toBeInTheDocument();
  });
});
