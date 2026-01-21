import * as bcrypt from "bcrypt";
import { UserRole } from "src/modules/roles/role.enum";
import { DataSource } from "typeorm";
import type { Seeder } from "typeorm-extension";
import { Company } from "../../modules/companies/entities/company.entity";
import { Role } from "../../modules/roles/entities/role.entity";
import { User } from "../../modules/users/entities/user.entity";

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const companyRepository = dataSource.getRepository(Company);

    const existingCount = await userRepository.count();
    if (existingCount > 0) {
      console.log(`Users already exist, skipping...`);
      return;
    }

    const superAdminRole = await roleRepository.findOne({
      where: { name: UserRole.SUPER_ADMIN },
    });
    const adminRole = await roleRepository.findOne({
      where: { name: UserRole.ADMIN },
    });
    const userRole = await roleRepository.findOne({
      where: { name: UserRole.USER },
    });

    if (!superAdminRole || !adminRole || !userRole) {
      throw new Error("One or more roles not found. Please run role seeder first.");
    }

    const companies = await companyRepository.find({ take: 2 });
    const secondCompany = companies[1];

    if (!secondCompany) {
      throw new Error("Second company not found. Please run company seeder first.");
    }

    const defaultPassword = "@Password1234";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const users = [
      {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: hashedPassword,
        is_active: true,
        role: superAdminRole,
      },
      {
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@example.com",
        password: hashedPassword,
        is_active: true,
        role: superAdminRole,
      },
      {
        first_name: "Admin",
        last_name: "User",
        email: "admin.user@example.com",
        password: hashedPassword,
        is_active: true,
        role: adminRole,
      },
      {
        first_name: "Regular",
        last_name: "User1",
        email: "regular.user1@example.com",
        password: hashedPassword,
        is_active: true,
        role: userRole,
      },
      {
        first_name: "Regular",
        last_name: "User2",
        email: "regular.user2@example.com",
        password: hashedPassword,
        is_active: true,
        role: userRole,
      },
    ];

    const savedUsers = await userRepository.save(users);

    const usersToAssociate = savedUsers.filter(
      (user) => user.role.name === UserRole.ADMIN || user.role.name === UserRole.USER,
    );

    // Use query builder to insert into junction table directly
    for (const user of usersToAssociate) {
      await dataSource.createQueryBuilder().relation(User, "companies").of(user.id).add(secondCompany.id);
    }

    console.log(`✅ Created ${users.length} users with password`);
    console.log(`✅ Associated ${usersToAssociate.length} users with company: ${secondCompany.name}`);
    console.log("All users password:", defaultPassword);
  }
}
