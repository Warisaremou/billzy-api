import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Response,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiExcludeEndpoint, ApiTags } from "@nestjs/swagger";
import { FileUploadDto } from "./dto/file-upload-dto";
import { FilesService } from "./files.service";

@ApiCookieAuth()
@ApiTags("Files")
@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("/upload")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "File upload",
    type: FileUploadDto,
  })
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }

  // TODO: Fix route to download files securely
  @Get(":path")
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  downloadFile(@Param("path") path: string, @Response() response) {
    return response.sendFile(path, { root: "./uploads" });
  }
}
