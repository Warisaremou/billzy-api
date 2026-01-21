import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";
import type { Seeder } from "typeorm-extension";
import { Company } from "../../modules/companies/entities/company.entity";

const NUMBER_OF_COMPANIES = 6;
export default class CompanySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Company);

    const existingCount = await repository.count();
    if (existingCount > 0) {
      console.log(`Companies already exist, skipping...`);
      return;
    }

    const companies = Array.from({ length: NUMBER_OF_COMPANIES }, () => ({
      name: faker.company.name(),
      siret: faker.string.numeric(14),
      tva_number: `FR${faker.string.numeric(11)}`,
      phone: `+33${faker.string.numeric(9)}`,
      address_street: faker.location.streetAddress(),
      address_zipcode: faker.location.zipCode(),
      address_city: faker.location.city(),
      address_country: "France",
      logo_url: faker.image.avatar(),
    }));

    await repository.save(companies);
    console.log(`✅ Created ${companies.length} companies with fake data`);
  }
}
