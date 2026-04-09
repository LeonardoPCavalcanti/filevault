// apps/api/test/files.e2e-spec.ts - Testes E2E dos endpoints de arquivos
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { FilesModule } from '../src/files/files.module';
import { StorageService } from '../src/storage/storage.service';
import { FileEntity } from '../src/files/file.entity';
import { DataSource } from 'typeorm';

describe('Files (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const mockStorageService = {
    upload: jest.fn().mockResolvedValue({ key: 'test-key-123.pdf' }),
    delete: jest.fn().mockResolvedValue(undefined),
    getPresignedUrl: jest
      .fn()
      .mockResolvedValue('https://presigned.example.com/file'),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [FileEntity],
          synchronize: true,
        }),
        ThrottlerModule.forRoot([
          { name: 'default', ttl: 60000, limit: 100 },
        ]),
        FilesModule,
      ],
    })
      .overrideProvider(StorageService)
      .useValue(mockStorageService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    // Limpar todos os dados entre os testes
    await dataSource.synchronize(true);
  });

  describe('POST /api/files/upload', () => {
    it('should upload a valid PDF and return 201', () => {
      const pdfBuffer = Buffer.from([
        0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e,
      ]);

      return request(app.getHttpServer())
        .post('/api/files/upload')
        .attach('file', pdfBuffer, {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('test.pdf');
          expect(res.body.mimeType).toBe('application/pdf');
          expect(res.body).not.toHaveProperty('key');
        });
    });

    it('should upload a valid JPEG and return 201', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);

      return request(app.getHttpServer())
        .post('/api/files/upload')
        .attach('file', jpegBuffer, {
          filename: 'photo.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.mimeType).toBe('image/jpeg');
        });
    });

    it('should reject invalid file type with 400', () => {
      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);

      return request(app.getHttpServer())
        .post('/api/files/upload')
        .attach('file', exeBuffer, {
          filename: 'virus.exe',
          contentType: 'application/x-msdownload',
        })
        .expect(400);
    });

    it('should reject mismatched magic bytes with 400', () => {
      const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d]);

      return request(app.getHttpServer())
        .post('/api/files/upload')
        .attach('file', pngBytes, {
          filename: 'fake.pdf',
          contentType: 'application/pdf',
        })
        .expect(400);
    });
  });

  describe('GET /api/files', () => {
    it('should return empty paginated list', () => {
      return request(app.getHttpServer())
        .get('/api/files')
        .expect(200)
        .expect((res) => {
          expect(res.body.files).toEqual([]);
          expect(res.body.total).toBe(0);
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(20);
        });
    });

    it('should return uploaded files', async () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
      await request(app.getHttpServer())
        .post('/api/files/upload')
        .attach('file', pdfBuffer, {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      return request(app.getHttpServer())
        .get('/api/files')
        .expect(200)
        .expect((res) => {
          expect(res.body.files).toHaveLength(1);
          expect(res.body.total).toBe(1);
        });
    });

    it('should respect pagination params', () => {
      return request(app.getHttpServer())
        .get('/api/files?page=2&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(2);
          expect(res.body.limit).toBe(5);
        });
    });
  });

  describe('GET /api/files/:id/preview', () => {
    it('should return presigned URL for existing file', async () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
      const uploadRes = await request(app.getHttpServer())
        .post('/api/files/upload')
        .attach('file', pdfBuffer, {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      return request(app.getHttpServer())
        .get(`/api/files/${uploadRes.body.id}/preview`)
        .expect(200)
        .expect((res) => {
          expect(res.body.presignedUrl).toBe(
            'https://presigned.example.com/file',
          );
          expect(res.body.expiresIn).toBe(900);
        });
    });

    it('should return 404 for non-existent file', () => {
      return request(app.getHttpServer())
        .get('/api/files/00000000-0000-0000-0000-000000000000/preview')
        .expect(404);
    });
  });

  describe('DELETE /api/files/:id', () => {
    it('should delete existing file and return 204', async () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
      const uploadRes = await request(app.getHttpServer())
        .post('/api/files/upload')
        .attach('file', pdfBuffer, {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      await request(app.getHttpServer())
        .delete(`/api/files/${uploadRes.body.id}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/files/${uploadRes.body.id}`)
        .expect(404);
    });

    it('should return 404 for non-existent file', () => {
      return request(app.getHttpServer())
        .delete('/api/files/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
