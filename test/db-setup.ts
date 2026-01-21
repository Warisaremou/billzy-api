import "reflect-metadata";

import { config } from "dotenv";
import { join } from "node:path";
import { DataSource, DataSourceOptions } from "typeorm";

config({ path: join(__dirname, "../.env.test") });

const options = {
  type: 'mariadb',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT!, 10) || 3306,
  username: process.env.DATABASE_ROOT_USERNAME,
  password: process.env.DATABASE_ROOT_PASSWORD,
  database: process.env.DATABASE_NAME || 'my_invoice_test',
  logging: process.env.NODE_ENV !== "production",
  seedTracking: false,

  entities: [join(__dirname, "../**/*.entity{.ts,.js}")],
  migrations: [join(__dirname, "../src/database/migrations/**/*{.ts,.js}")],
  seeds: [join(__dirname, "../src/database/seeds/**/*{.ts,.js}")],
} as DataSourceOptions;

const AppDataSource = new DataSource(options);

module.exports = async () => {
  try {
    // Connect to the database as `root` for full access      
    const adminDataSource = await AppDataSource.initialize();

    // Drop and recreate the database schema
    await adminDataSource.synchronize(true);
    
    // - set up the test user with limited privileges (to simulate real conditions)
    await adminDataSource.query(`CREATE USER IF NOT EXISTS '${process.env.DATABASE_USERNAME}'@'%' IDENTIFIED BY '${process.env.DATABASE_PASSWORD}'`);
    await adminDataSource.query(`GRANT ALL PRIVILEGES ON \`${process.env.DATABASE_NAME}\`.* TO '${process.env.DATABASE_USERNAME}'@'%'`);
    await adminDataSource.query(`FLUSH PRIVILEGES;`);

    // Close the admin connection
    await adminDataSource.destroy();
  } catch (error) {
    console.error("Error during Data Source initialization", error)
  }
}