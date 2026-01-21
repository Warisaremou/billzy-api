import "reflect-metadata";

import { join } from "node:path";
import { DataSource, type DataSourceOptions } from "typeorm";
import type { SeederOptions } from "typeorm-extension";

const options = {
  type: process.env.DATABASE_TYPE || "mariadb",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT!, 10) || 3306,
  username: process.env.DATABASE_USERNAME || "api",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "my_invoice",
  synchronize: false,
  dropSchema: false,
  logging: process.env.NODE_ENV !== "production",
  seedTracking: false,

  entities: [join(__dirname, "../**/*.entity{.ts,.js}")],
  migrations: [join(__dirname, "./migrations/**/*{.ts,.js}")],
  seeds: [join(__dirname, "./seeds/**/*{.ts,.js}")],
  factories: [join(__dirname, "./factories/**/*{.ts,.js}")],
} as DataSourceOptions & SeederOptions;

export const AppDataSource = new DataSource(options);
