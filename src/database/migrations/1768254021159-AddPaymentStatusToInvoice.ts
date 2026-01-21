import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentStatusToInvoice1768254021159 implements MigrationInterface {
  name = "AddPaymentStatusToInvoice1768254021159";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD \`payment_status\` enum ('payée', 'impayée', 'partiellement payée') NOT NULL DEFAULT 'impayée'`,
    );
    await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`issue_date\` \`issue_date\` date NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`issue_date\` \`issue_date\` date NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`payment_status\``);
  }
}
