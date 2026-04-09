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
  @ApiOperation({ summary: 'Upload de arquivo (JPEG, PNG ou PDF)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Arquivo enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Tipo ou tamanho de arquivo invalido' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    return this.filesService.upload(file);
  }

  @Get()
  @ApiOperation({ summary: 'Listar arquivos enviados (paginado)' })
  @ApiResponse({ status: 200, description: 'Lista de arquivos paginada' })
  async findAll(@Query() query: FileListQueryDto) {
    return this.filesService.findAll(query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes do arquivo por ID' })
  @ApiResponse({ status: 200, description: 'Metadados do arquivo' })
  @ApiResponse({ status: 404, description: 'Arquivo nao encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.findOne(id);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Obter URL temporaria para preview do arquivo' })
  @ApiResponse({ status: 200, description: 'URL temporaria com expiracao' })
  @ApiResponse({ status: 404, description: 'Arquivo nao encontrado' })
  async preview(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.getPreviewUrl(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar um arquivo' })
  @ApiResponse({ status: 204, description: 'Arquivo deletado' })
  @ApiResponse({ status: 404, description: 'Arquivo nao encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.remove(id);
  }
}
