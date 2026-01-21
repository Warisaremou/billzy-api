import { Injectable } from "@nestjs/common";
import type { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { APP_ENTITIES } from "../app.entities";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: process.env.DATABASE_TYPE,
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT!, 10) || 3309,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: false,
      entities: APP_ENTITIES,
    } as TypeOrmModuleOptions;
  }
}
