import type { UserRole } from "../../modules/roles/role.enum";
import { User } from "../../modules/users/entities/user.entity";

export interface JwtPayload {
  sub: string;
  role: UserRole;
  companies: string[];
}

export interface RequestResponseMessage {
  message: string;
}

export type UserData = Omit<User, "password" | "hash" | "refresh_token" | "refresh_token_expires_at">;

export enum InvoiceStatus {
  DRAFT = "brouillon",
  PUBLISHED = "publié",
}

export enum InvoicePaymentStatus {
  PAID = "payée",
  UNPAID = "impayée",
  PARTIALLY_PAID = "partiellement payée",
}
