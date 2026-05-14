import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddProviderSubjectToUsers20260514000000 implements MigrationInterface {
  name = 'AddProviderSubjectToUsers20260514000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'provider_subject',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_provider_provider_subject',
        columnNames: ['provider', 'provider_subject'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_provider_provider_subject');
    await queryRunner.dropColumn('users', 'provider_subject');
  }
}
