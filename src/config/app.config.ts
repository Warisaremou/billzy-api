import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV || "development",
  name: process.env.APP_NAME,
  frontendDomain: process.env.FRONTEND_DOMAIN,
  backendDomain: process.env.BACKEND_DOMAIN,
  port: parseInt(process.env.APP_PORT! || process.env.PORT!, 10) || 5050,
  apiPrefix: process.env.API_PREFIX || "api",
  apiVersion: process.env.API_VERSION || "1.0",
  fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || "en",
}));
