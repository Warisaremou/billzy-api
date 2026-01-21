import { S3Client } from "@aws-sdk/client-s3";
import { HttpException, HttpStatus, Module } from "@nestjs/common";
import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { TypeOrmModule } from "@nestjs/typeorm";
import { diskStorage } from "multer";
import multerS3 from "multer-s3";
import { File } from "./entities/file.entity";
import { FacturXService } from "./facturx.service";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { PdfService } from "./pdf.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const storages = {
          local: () =>
            diskStorage({
              destination: "./uploads",
              filename: (request, file, callback) => {
                callback(
                  null,
                  `${randomStringGenerator()}.${file.originalname.split(".").pop()?.toLowerCase() ?? "file"}`,
                );
              },
            }),
          s3: () => {
            const s3 = new S3Client({
              region: configService.get<string>("file.region", { infer: true }),
              endpoint: configService.get<string>("file.bucketEndpoint", { infer: true }),
              credentials: {
                accessKeyId: configService.getOrThrow<string>("file.accessKeyId", {
                  infer: true,
                }),
                secretAccessKey: configService.getOrThrow<string>("file.secretAccessKey", {
                  infer: true,
                }),
              },
            });

            return multerS3({
              s3: s3,
              bucket: configService.getOrThrow("file.bucketId", {
                infer: true,
              }),
              contentType: multerS3.AUTO_CONTENT_TYPE,
              key: (request, file, callback) => {
                callback(null, `${randomStringGenerator()}.${file.originalname.split(".").pop()?.toLowerCase()}`);
              },
            });
          },
        };

        return {
          fileFilter: (request, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/i)) {
              return callback(
                new HttpException(
                  {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                      file: `Only image files are allowed (jpg, jpeg, png, gif, pdf).`,
                    },
                  },
                  HttpStatus.UNPROCESSABLE_ENTITY,
                ),
                false,
              );
            }

            callback(null, true);
          },
          storage: storages[configService.get("file.driver")](),
          limits: {
            fileSize: configService.get("file.maxFileSize"),
          },
        };
      },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, PdfService, FacturXService],
  exports: [PdfService],
})
export class FilesModule {}
