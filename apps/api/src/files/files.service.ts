import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';
import { StorageService } from '../storage/storage.service';
import { validateFileType } from './validators/file-type.validator';
import { sanitizeFilename } from './validators/sanitize-filename';
import { toFileResponse } from './dto/file-response.dto';
import {
  FileMetadata,
  FileListResponse,
  PreviewResponse,
  MAX_FILE_SIZE,
} from '@filevault/shared';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
    private readonly storage: StorageService,
  ) {}

  async upload(file: Express.Multer.File): Promise<FileMetadata> {
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    if (!validateFileType(file.buffer, file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: JPEG, PNG, PDF',
      );
    }

    const safeName = sanitizeFilename(file.originalname);
    const { key } = await this.storage.upload(
      file.buffer,
      safeName,
      file.mimetype,
    );

    const entity = this.fileRepo.create({
      name: safeName,
      key,
      mimeType: file.mimetype,
      size: file.size,
    });

    const saved = await this.fileRepo.save(entity);
    return toFileResponse(saved);
  }

  async findAll(page: number, limit: number): Promise<FileListResponse> {
    const [files, total] = await this.fileRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      files: files.map(toFileResponse),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<FileMetadata> {
    const file = await this.fileRepo.findOneBy({ id });
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
    return toFileResponse(file);
  }

  async getPreviewUrl(id: string): Promise<PreviewResponse> {
    const file = await this.fileRepo.findOneBy({ id });
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    const expiresIn = 900;
    const presignedUrl = await this.storage.getPresignedUrl(
      file.key,
      expiresIn,
    );

    return { presignedUrl, expiresIn };
  }

  async remove(id: string): Promise<void> {
    const file = await this.fileRepo.findOneBy({ id });
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    await this.storage.delete(file.key);
    await this.fileRepo.remove(file);
  }
}
