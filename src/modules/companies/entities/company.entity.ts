import { Entity, JoinColumn, ManyToMany, OneToMany, OneToOne } from "typeorm";
import { Invoice } from "../../../modules/invoice/entities/invoice.entity";
import { TermsCondition } from "../../../modules/terms_conditions/entities/terms_condition.entity";
import { CompanyEntityHelper } from "../../../utils/entities-helpers/company-entity-helper";
import { Client } from "../../clients/entities/client.entity";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Company extends CompanyEntityHelper {
  @OneToOne(() => TermsCondition, (termsCondition) => termsCondition.company, { nullable: true, cascade: true })
  @JoinColumn({ name: "terms_condition_id" })
  terms_condition: TermsCondition;

  @ManyToMany(() => User, (user) => user.companies)
  users: Promise<User[]>;

  @ManyToMany(() => Client, (client) => client.companies, { cascade: true })
  clients: Promise<Client[]>;

  @OneToMany(() => Invoice, (invoice) => invoice.company, { cascade: true })
  invoices: Promise<Invoice[]>;
}
