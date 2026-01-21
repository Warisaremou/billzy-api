export class UserContext {
  userId: string;
  userCompanies: string[];

  constructor(userId: string, userCompanies: string[]) {
    this.userId = userId;
    this.userCompanies = userCompanies;
  }
}
