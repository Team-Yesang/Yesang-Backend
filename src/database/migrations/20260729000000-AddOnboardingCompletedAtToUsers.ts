import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOnboardingCompletedAtToUsers20260729000000 implements MigrationInterface {
  name = 'AddOnboardingCompletedAtToUsers20260729000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'onboarding_completed_at',
        type: 'datetime',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'onboarding_completed_at');
  }
}
