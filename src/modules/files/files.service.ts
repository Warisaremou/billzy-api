import { HttpStatus, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { File } from "./entities/file.entity";

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly filesRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(file: Express.Multer.File | any): Promise<File> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: "select a file to upload",
        },
      });
    }

    const normalizedPath = file.path && file.path.replace(/\\/g, "/");
    const path = {
      local: `/${normalizedPath}`,
      s3: file.location,
    };

    return await this.filesRepository.save(
      this.filesRepository.create({
        path: path[this.configService.get("file.driver")],
      }),
    );
  }
}
