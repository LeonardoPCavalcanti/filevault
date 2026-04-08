import { FileEntity } from '../file.entity';
import { FileMetadata } from '@filevault/shared';

export function toFileResponse(entity: FileEntity): FileMetadata {
  return {
    id: entity.id,
    name: entity.name,
    mimeType: entity.mimeType,
    size: Number(entity.size),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
