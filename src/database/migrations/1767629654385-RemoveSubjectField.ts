import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSubjectField1767629654385 implements MigrationInterface {
  name = "RemoveSubjectField1767629654385";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`subject\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`subject\` text NOT NULL`);
  }
}
