import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./lib/decorators/public.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get("/info")
  getInfo(): object {
    return this.appService.getInfo();
  }
}
