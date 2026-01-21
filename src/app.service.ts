import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    return "Hello World!";
  }

  getInfo(): object {
    this.logger.log("Fetching application info");
    return {
      app: "Invoicing API",
      version: "1.0.0",
      description: "API for managing invoices and their articles.",
    };
  }
}
