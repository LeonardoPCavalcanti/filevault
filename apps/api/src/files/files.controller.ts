import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FileListQueryDto } from './dto/file-list-query.dto';
import { MAX_FILE_SIZE } from '@filevault/shared';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file (JPEG, PNG, or PDF)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.filesService.upload(file);
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded files (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated file list' })
  async findAll(@Query() query: FileListQueryDto) {
    return this.filesService.findAll(query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file details by ID' })
  @ApiResponse({ status: 200, description: 'File metadata' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.findOne(id);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Get presigned URL for file preview' })
  @ApiResponse({ status: 200, description: 'Presigned URL with expiry' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async preview(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.getPreviewUrl(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 204, description: 'File deleted' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.remove(id);
  }
}
