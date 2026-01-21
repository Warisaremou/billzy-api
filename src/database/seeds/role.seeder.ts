import { UserRole } from "src/modules/roles/role.enum";
import { DataSource } from "typeorm";
import type { Seeder } from "typeorm-extension";
import { Role } from "../../modules/roles/entities/role.entity";

export default class RoleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Role);

    const existingCount = await repository.count();
    if (existingCount > 0) {
      console.log(`Roles already exist, skipping...`);
      return;
    }

    await repository.save([
      {
        name: UserRole.SUPER_ADMIN,
      },
      {
        name: UserRole.ADMIN,
      },
      {
        name: UserRole.USER,
      },
    ]);

    console.log("✅ Created 3 roles successfully");
  }
}
