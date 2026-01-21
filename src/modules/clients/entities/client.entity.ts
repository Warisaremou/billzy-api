import { Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { Invoice } from "../../../modules/invoice/entities/invoice.entity";
import { CompanyEntityHelper } from "../../../utils/entities-helpers/company-entity-helper";
import { Company } from "../../companies/entities/company.entity";

@Entity()
export class Client extends CompanyEntityHelper {
  @ManyToMany(() => Company, (company) => company.clients)
  @JoinTable()
  companies: Promise<Company[]>;

  @OneToMany(() => Invoice, (invoice) => invoice.client)
  invoices: Promise<Invoice[]>;
}
