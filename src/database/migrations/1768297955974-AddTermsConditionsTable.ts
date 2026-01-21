import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTermsConditionsTable1768297955974 implements MigrationInterface {
  name = "AddTermsConditionsTable1768297955974";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`terms_condition\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`content\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(`ALTER TABLE \`company\` ADD \`terms_condition_id\` uuid NULL`);
    await queryRunner.query(
      `ALTER TABLE \`company\` ADD UNIQUE INDEX \`IDX_58b12d469d506145961c068bbd\` (\`terms_condition_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_58b12d469d506145961c068bbd\` ON \`company\` (\`terms_condition_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`company\` ADD CONSTRAINT \`FK_58b12d469d506145961c068bbde\` FOREIGN KEY (\`terms_condition_id\`) REFERENCES \`terms_condition\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`company\` DROP FOREIGN KEY \`FK_58b12d469d506145961c068bbde\``);
    await queryRunner.query(`DROP INDEX \`REL_58b12d469d506145961c068bbd\` ON \`company\``);
    await queryRunner.query(`ALTER TABLE \`company\` DROP INDEX \`IDX_58b12d469d506145961c068bbd\``);
    await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`terms_condition_id\``);
    await queryRunner.query(`DROP TABLE \`terms_condition\``);
  }
}
