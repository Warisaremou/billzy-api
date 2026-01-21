import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";
import type { Seeder } from "typeorm-extension";
import { Client } from "../../modules/clients/entities/client.entity";
import { Company } from "../../modules/companies/entities/company.entity";

const NUMBER_OF_CLIENTS = 3;
export default class ClientSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Client);
    const companyRepository = dataSource.getRepository(Company);

    const existingCount = await repository.count();
    if (existingCount > 0) {
      console.log(`Clients already exist, skipping...`);
      return;
    }

    const companies = await companyRepository.find({ take: 2 });
    const secondCompany = companies[1];

    if (!secondCompany) {
      throw new Error("Second company not found. Please run company seeder first.");
    }

    const clients = Array.from({ length: NUMBER_OF_CLIENTS }, () => ({
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

    const savedClients = await repository.save(clients);

    // Use query builder to insert into junction table directly
    for (const client of savedClients) {
      await dataSource.createQueryBuilder().relation(Client, "companies").of(client.id).add(secondCompany.id);
    }

    console.log(`✅ Created ${clients.length} clients with fake data`);
    console.log(`✅ Associated ${clients.length} clients with company: ${secondCompany.name}`);
  }
}
