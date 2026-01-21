import { ClassSerializerInterceptor, ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory, Reflector } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule, type SwaggerCustomOptions } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger({
      prefix: "Billzy",
      json: process.env.NODE_ENV === "production",
    }),
  });

  const configService: ConfigService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: `/${configService.get("app.apiPrefix")}/uploads/`,
  });

  // Activate cookie reader
  app.use(cookieParser());
  // Configure CORS
  app.enableCors({
    origin: configService.get("app.frontendDomain"),
    credentials: true,
  });

  // Security middlewares to set security-related HTTP headers
  app.use(helmet());

  const apiPrefix = configService.get("app.apiPrefix");
  const apiVersion = configService.get("app.apiVersion");
  const port = configService.get("app.port");
  const appName = configService.get("app.name");

  app.setGlobalPrefix(apiPrefix);

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle(`${appName} API`)
    .setDescription(`API documentation for ${appName}`)
    .setVersion(apiVersion)
    .addCookieAuth("access_token")
    .build();

  const swaggerOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      withCredentials: true,
    },
  };

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api/docs", app, document, swaggerOptions);

  await app.listen(port);
}
bootstrap();
