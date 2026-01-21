import { Client } from "./modules/clients/entities/client.entity";
import { Company } from "./modules/companies/entities/company.entity";
import { File } from "./modules/files/entities/file.entity";
import { InvoiceItem } from "./modules/invoice-items/entities/invoice-item.entity";
import { Invoice } from "./modules/invoice/entities/invoice.entity";
import { PaymentDetail } from "./modules/payment_details/entities/payment_detail.entity";
import { Role } from "./modules/roles/entities/role.entity";
import { User } from "./modules/users/entities/user.entity";

export const APP_ENTITIES = [Role, Company, User, Client, File, Invoice, InvoiceItem, PaymentDetail];
