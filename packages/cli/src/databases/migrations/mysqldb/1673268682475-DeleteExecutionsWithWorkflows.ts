import { MigrationInterface, QueryRunner } from 'typeorm';
import { logMigrationEnd, logMigrationStart } from '@db/utils/migrationHelpers';
import config from '@/config';

export class DeleteExecutionsWithWorkflows1673268682475 implements MigrationInterface {
	name = 'DeleteExecutionsWithWorkflows1673268682475';
	public async up(queryRunner: QueryRunner): Promise<void> {
		logMigrationStart(this.name);
		const tablePrefix = config.getEnv('database.tablePrefix');

		await queryRunner.query(`ALTER TABLE \`${tablePrefix}execution_entity\` MODIFY workflowId INT`);

		const workflowIds: Array<{ id: number }> = await queryRunner.query(`
			SELECT id FROM \`${tablePrefix}workflow_entity\`
		`);

		await queryRunner.query(
			`DELETE FROM \`${tablePrefix}execution_entity\`
			 WHERE workflowId IS NOT NULL
			 ${workflowIds.length ? `AND workflowId NOT IN (${workflowIds.map(({ id }) => id).join()})` : ''}`,
		);

		await queryRunner.query(
			`ALTER TABLE \`${tablePrefix}execution_entity\`
			 ADD CONSTRAINT \`FK_${tablePrefix}execution_entity_workflowId\`
			 FOREIGN KEY (\`workflowId\`) REFERENCES \`${tablePrefix}workflow_entity\`(\`id\`)
			 ON DELETE CASCADE`,
		);

		logMigrationEnd(this.name);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const tablePrefix = config.getEnv('database.tablePrefix');
		await queryRunner.query(
			`ALTER TABLE \`${tablePrefix}execution_entity\`
			 DROP FOREIGN KEY \`FK_${tablePrefix}execution_entity_workflowId\``,
		);

		await queryRunner.query(
			`ALTER TABLE \`${tablePrefix}execution_entity\` MODIFY workflowId varchar(255);`,
		);
	}
}
