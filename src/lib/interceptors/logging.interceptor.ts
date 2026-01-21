import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === "http") {
      return this.logHttpCall(context, next);
    }
    return next.handle();
  }

  private logHttpCall(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.get("user-agent") || "";
    const { ip, method, path: url } = request;

    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url} - User Agent: ${userAgent} - IP: ${ip}`);

    return next.handle().pipe(
      tap({
        next: (val: unknown): void => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const executionTime = Date.now() - startTime;

          this.logger.log(
            `Outgoing Response: ${method} ${url} - Status: ${statusCode} - Execution Time: ${executionTime}ms`,
          );
        },
        error: (err: Error): void => {
          const executionTime = Date.now() - startTime;
          this.logger.error(
            `Request Failed: ${method} ${url} - Error: ${err.message} - Execution Time: ${executionTime}ms`,
          );
        },
      }),
    );
  }
}
