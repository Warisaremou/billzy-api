import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1765921221392 implements MigrationInterface {
  name = "FirstMigration1765921221392";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`role\` (\`id\` uuid NOT NULL, \`name\` enum ('super_admin', 'admin', 'user') NOT NULL DEFAULT 'user', UNIQUE INDEX \`IDX_ae4578dcaed5adff96595e6166\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` uuid NOT NULL, \`email\` varchar(255) NOT NULL, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`password\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 0, \`hash\` varchar(255) NULL, \`refresh_token\` varchar(255) NULL, \`refresh_token_expires_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`role_id\` uuid NULL, UNIQUE INDEX \`IDX_USER_HASH\` (\`hash\`), UNIQUE INDEX \`IDX_USER_EMAIL\` (\`email\`), UNIQUE INDEX \`IDX_USER_ID\` (\`id\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`company\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`name\` varchar(255) NOT NULL, \`siret\` varchar(14) NOT NULL, \`tva_number\` varchar(20) NOT NULL, \`phone\` varchar(255) NOT NULL, \`address_street\` varchar(255) NOT NULL, \`address_zipcode\` varchar(255) NOT NULL, \`address_city\` varchar(255) NOT NULL, \`address_country\` varchar(255) NOT NULL, \`logo_url\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_a76c5cd486f7779bd9c319afd2\` (\`name\`), UNIQUE INDEX \`IDX_3a1413b6c95d7b7874673ab623\` (\`siret\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`client\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`name\` varchar(255) NOT NULL, \`siret\` varchar(14) NOT NULL, \`tva_number\` varchar(20) NOT NULL, \`phone\` varchar(255) NOT NULL, \`address_street\` varchar(255) NOT NULL, \`address_zipcode\` varchar(255) NOT NULL, \`address_city\` varchar(255) NOT NULL, \`address_country\` varchar(255) NOT NULL, \`logo_url\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_480f88a019346eae487a0cd7f0\` (\`name\`), UNIQUE INDEX \`IDX_c16b63823bf9928ccc7fff1bb9\` (\`siret\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`invoice\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`reference\` varchar(255) NOT NULL, \`issue_date\` date NOT NULL, \`due_date\` date NOT NULL, \`subject\` text NOT NULL, \`status\` enum ('brouillon', 'publié') NOT NULL DEFAULT 'brouillon', \`total_ht\` decimal(10,2) NOT NULL DEFAULT '0.00', \`total_vat\` decimal(10,2) NOT NULL DEFAULT '0.00', \`total_ttc\` decimal(10,2) NOT NULL DEFAULT '0.00', \`company_id\` uuid NOT NULL, \`client_id\` uuid NOT NULL, UNIQUE INDEX \`IDX_2b8cd0eee430702085736816a9\` (\`reference\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`invoice_item\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`label\` varchar(255) NOT NULL, \`description\` text NULL, \`quantity\` int NOT NULL DEFAULT '1', \`unit_price\` decimal(10,2) NOT NULL DEFAULT '0.00', \`vat_rate\` decimal(10,2) NOT NULL DEFAULT '0.00', \`unit_total_ht\` decimal(10,2) NOT NULL DEFAULT '0.00', \`invoice_id\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`file\` (\`id\` uuid NOT NULL, \`path\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_companies_company\` (\`userId\` uuid NOT NULL, \`companyId\` uuid NOT NULL, INDEX \`IDX_11ac2b5cec7baf03fc36120011\` (\`userId\`), INDEX \`IDX_3faa3b15b4ac404e4e5aaebe8d\` (\`companyId\`), PRIMARY KEY (\`userId\`, \`companyId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`client_companies_company\` (\`clientId\` uuid NOT NULL, \`companyId\` uuid NOT NULL, INDEX \`IDX_a7b4e39784baf4cc5c1bdf8e1e\` (\`clientId\`), INDEX \`IDX_0c721a10c88f90befb69816798\` (\`companyId\`), PRIMARY KEY (\`clientId\`, \`companyId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_fb2e442d14add3cefbdf33c4561\` FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD CONSTRAINT \`FK_7718b2d8c649496f6ffd8e0399d\` FOREIGN KEY (\`company_id\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD CONSTRAINT \`FK_c2dcbb1f285e8b596858aceb923\` FOREIGN KEY (\`client_id\`) REFERENCES \`client\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item\` ADD CONSTRAINT \`FK_9830c1881dd701d440c2164c3cd\` FOREIGN KEY (\`invoice_id\`) REFERENCES \`invoice\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_companies_company\` ADD CONSTRAINT \`FK_11ac2b5cec7baf03fc361200111\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_companies_company\` ADD CONSTRAINT \`FK_3faa3b15b4ac404e4e5aaebe8df\` FOREIGN KEY (\`companyId\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`client_companies_company\` ADD CONSTRAINT \`FK_a7b4e39784baf4cc5c1bdf8e1e3\` FOREIGN KEY (\`clientId\`) REFERENCES \`client\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`client_companies_company\` ADD CONSTRAINT \`FK_0c721a10c88f90befb698167981\` FOREIGN KEY (\`companyId\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`client_companies_company\` DROP FOREIGN KEY \`FK_0c721a10c88f90befb698167981\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`client_companies_company\` DROP FOREIGN KEY \`FK_a7b4e39784baf4cc5c1bdf8e1e3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_companies_company\` DROP FOREIGN KEY \`FK_3faa3b15b4ac404e4e5aaebe8df\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_companies_company\` DROP FOREIGN KEY \`FK_11ac2b5cec7baf03fc361200111\``,
    );
    await queryRunner.query(`ALTER TABLE \`invoice_item\` DROP FOREIGN KEY \`FK_9830c1881dd701d440c2164c3cd\``);
    await queryRunner.query(`ALTER TABLE \`invoice\` DROP FOREIGN KEY \`FK_c2dcbb1f285e8b596858aceb923\``);
    await queryRunner.query(`ALTER TABLE \`invoice\` DROP FOREIGN KEY \`FK_7718b2d8c649496f6ffd8e0399d\``);
    await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_fb2e442d14add3cefbdf33c4561\``);
    await queryRunner.query(`DROP INDEX \`IDX_0c721a10c88f90befb69816798\` ON \`client_companies_company\``);
    await queryRunner.query(`DROP INDEX \`IDX_a7b4e39784baf4cc5c1bdf8e1e\` ON \`client_companies_company\``);
    await queryRunner.query(`DROP TABLE \`client_companies_company\``);
    await queryRunner.query(`DROP INDEX \`IDX_3faa3b15b4ac404e4e5aaebe8d\` ON \`user_companies_company\``);
    await queryRunner.query(`DROP INDEX \`IDX_11ac2b5cec7baf03fc36120011\` ON \`user_companies_company\``);
    await queryRunner.query(`DROP TABLE \`user_companies_company\``);
    await queryRunner.query(`DROP TABLE \`file\``);
    await queryRunner.query(`DROP TABLE \`invoice_item\``);
    await queryRunner.query(`DROP INDEX \`IDX_2b8cd0eee430702085736816a9\` ON \`invoice\``);
    await queryRunner.query(`DROP TABLE \`invoice\``);
    await queryRunner.query(`DROP INDEX \`IDX_c16b63823bf9928ccc7fff1bb9\` ON \`client\``);
    await queryRunner.query(`DROP INDEX \`IDX_480f88a019346eae487a0cd7f0\` ON \`client\``);
    await queryRunner.query(`DROP TABLE \`client\``);
    await queryRunner.query(`DROP INDEX \`IDX_3a1413b6c95d7b7874673ab623\` ON \`company\``);
    await queryRunner.query(`DROP INDEX \`IDX_a76c5cd486f7779bd9c319afd2\` ON \`company\``);
    await queryRunner.query(`DROP TABLE \`company\``);
    await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
    await queryRunner.query(`DROP INDEX \`IDX_USER_ID\` ON \`user\``);
    await queryRunner.query(`DROP INDEX \`IDX_USER_EMAIL\` ON \`user\``);
    await queryRunner.query(`DROP INDEX \`IDX_USER_HASH\` ON \`user\``);
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP INDEX \`IDX_ae4578dcaed5adff96595e6166\` ON \`role\``);
    await queryRunner.query(`DROP TABLE \`role\``);
  }
}
