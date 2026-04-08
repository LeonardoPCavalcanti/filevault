import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileEntity } from './file.entity';
import { StorageService } from '../storage/storage.service';

describe('FilesService', () => {
  let service: FilesService;
  let mockRepo: Record<string, jest.Mock>;
  let mockStorage: Record<string, jest.Mock>;

  const mockFile: FileEntity = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'test.pdf',
    key: 'abc-123.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    createdAt: new Date('2026-04-08'),
    updatedAt: new Date('2026-04-08'),
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockReturnValue(mockFile),
      save: jest.fn().mockResolvedValue(mockFile),
      findAndCount: jest.fn().mockResolvedValue([[mockFile], 1]),
      findOneBy: jest.fn().mockResolvedValue(mockFile),
      remove: jest.fn().mockResolvedValue(mockFile),
    };

    mockStorage = {
      upload: jest.fn().mockResolvedValue({ key: 'abc-123.pdf' }),
      delete: jest.fn().mockResolvedValue(undefined),
      getPresignedUrl: jest.fn().mockResolvedValue('https://presigned.example.com/file'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: getRepositoryToken(FileEntity), useValue: mockRepo },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  describe('upload', () => {
    const validPdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);

    it('should upload file and save metadata', async () => {
      const result = await service.upload({
        buffer: validPdfBuffer,
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File);

      expect(mockStorage.upload).toHaveBeenCalledWith(validPdfBuffer, 'test.pdf', 'application/pdf');
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should reject invalid MIME type', async () => {
      await expect(
        service.upload({
          buffer: Buffer.from([0x00]),
          originalname: 'virus.exe',
          mimetype: 'application/x-msdownload',
          size: 1024,
        } as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject mismatched magic bytes', async () => {
      const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d]);
      await expect(
        service.upload({
          buffer: pngBytes,
          originalname: 'fake.pdf',
          mimetype: 'application/pdf',
          size: 1024,
        } as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated files', async () => {
      const result = await service.findAll(1, 20);
      expect(result.files).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe('findOne', () => {
    it('should return a file by id', async () => {
      const result = await service.findOne(mockFile.id);
      expect(result.id).toBe(mockFile.id);
    });

    it('should throw NotFoundException for unknown id', async () => {
      mockRepo.findOneBy.mockResolvedValueOnce(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPreviewUrl', () => {
    it('should return presigned URL', async () => {
      const result = await service.getPreviewUrl(mockFile.id);
      expect(result.presignedUrl).toBe('https://presigned.example.com/file');
      expect(result.expiresIn).toBe(900);
    });
  });

  describe('remove', () => {
    it('should delete from storage and database', async () => {
      await service.remove(mockFile.id);
      expect(mockStorage.delete).toHaveBeenCalledWith('abc-123.pdf');
      expect(mockRepo.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException for unknown id', async () => {
      mockRepo.findOneBy.mockResolvedValueOnce(null);
      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
