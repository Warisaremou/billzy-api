import { registerAs } from "@nestjs/config";

export default registerAs("mail", () => ({
  port: parseInt(process.env.MAIL_PORT!, 10),
  host: process.env.MAIL_HOST,
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  defaultEmailSender: process.env.MAIL_DEFAULT_SENDER,
  defaultSenderName: process.env.MAIL_DEFAULT_SENDER_NAME,
  ignoreTLS: process.env.MAIL_IGNORE_TLS === "true",
  secure: process.env.MAIL_SECURE === "true",
  requireTLS: process.env.MAIL_REQUIRE_TLS === "true",
}));
