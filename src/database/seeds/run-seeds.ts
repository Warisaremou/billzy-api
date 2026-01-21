import { AppDataSource } from "../data-source";
import ClientSeeder from "./client.seeder";
import CompanySeeder from "./company.seeder";
import RoleSeeder from "./role.seeder";
import UserSeeder from "./user.seeder";

async function runSeeds() {
  try {
    console.log("Initializing data source...");
    await AppDataSource.initialize();
    console.log("✅ Data source initialized successfully");

    console.log("\n🌱 Running Role Seeder...");
    const roleSeeder = new RoleSeeder();
    await roleSeeder.run(AppDataSource);
    console.log("✅ Role Seeder completed");

    console.log("\n🌱 Running Company Seeder...");
    const companySeeder = new CompanySeeder();
    await companySeeder.run(AppDataSource);
    console.log("✅ Company Seeder completed");

    console.log("\n🌱 Running User Seeder...");
    const userSeeder = new UserSeeder();
    await userSeeder.run(AppDataSource);
    console.log("✅ User Seeder completed");

    console.log("\n🌱 Running Client Seeder...");
    const clientSeeder = new ClientSeeder();
    await clientSeeder.run(AppDataSource);
    console.log("✅ Client Seeder completed");

    console.log("\n✨ All seeds completed successfully!");
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error running seeds:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

runSeeds();
