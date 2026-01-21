import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentDetailsTable1768260103290 implements MigrationInterface {
  name = "AddPaymentDetailsTable1768260103290";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`payment_detail\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`owner_name\` varchar(255) NOT NULL, \`iban\` varchar(255) NOT NULL, \`bic\` varchar(255) NOT NULL, \`bank_name\` varchar(255) NOT NULL, \`company_id\` uuid NOT NULL, UNIQUE INDEX \`IDX_e802e5067c7a8ccd1f8996651c\` (\`iban\`), UNIQUE INDEX \`IDX_bd8c77ff5c41c22878fc3476fd\` (\`bic\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_detail\` ADD CONSTRAINT \`FK_da0cdbf32bf793d8a2b7dfd46bc\` FOREIGN KEY (\`company_id\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`payment_detail\` DROP FOREIGN KEY \`FK_da0cdbf32bf793d8a2b7dfd46bc\``);
    await queryRunner.query(`DROP INDEX \`IDX_bd8c77ff5c41c22878fc3476fd\` ON \`payment_detail\``);
    await queryRunner.query(`DROP INDEX \`IDX_e802e5067c7a8ccd1f8996651c\` ON \`payment_detail\``);
    await queryRunner.query(`DROP TABLE \`payment_detail\``);
  }
}
