import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

const mockS3Send = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockS3Send })),
  PutObjectCommand: jest.fn().mockImplementation((input) => input),
  DeleteObjectCommand: jest.fn().mockImplementation((input) => input),
  GetObjectCommand: jest.fn().mockImplementation((input) => input),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest
    .fn()
    .mockResolvedValue('https://presigned-url.example.com/file'),
}));

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    mockS3Send.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                'r2.endpoint': 'https://test.r2.cloudflarestorage.com',
                'r2.accessKeyId': 'test-key',
                'r2.secretAccessKey': 'test-secret',
                'r2.bucketName': 'test-bucket',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should upload file and return key', async () => {
      mockS3Send.mockResolvedValueOnce({});
      const buffer = Buffer.from('test file content');
      const result = await service.upload(buffer, 'test.pdf', 'application/pdf');

      expect(result).toHaveProperty('key');
      expect(result.key).toMatch(/\.pdf$/);
      expect(mockS3Send).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete file by key', async () => {
      mockS3Send.mockResolvedValueOnce({});
      await service.delete('some-key.pdf');
      expect(mockS3Send).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPresignedUrl', () => {
    it('should return a presigned URL', async () => {
      const result = await service.getPresignedUrl('some-key.pdf');
      expect(result).toBe('https://presigned-url.example.com/file');
    });
  });
});
