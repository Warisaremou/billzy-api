import { Logger } from "@nestjs/common";
import morgan from "morgan";

export const requestLogMiddleware = () => {
  const logger = new Logger("Request");

  return morgan(
    (tokens, req, res) => {
      if (process.env.NODE_ENV === "production") {
        return JSON.stringify({
          "remote-address": tokens["remote-addr"]?.(req, res) || "",
          "remote-user": "",
          time: tokens["date"]?.(req, res, "iso") || "",
          method: tokens["method"]?.(req, res) || "",
          url: tokens["url"]?.(req, res) || "",
          "http-version": tokens["http-version"]?.(req, res) || "",
          "status-code": tokens["status"]?.(req, res) || "",
          "content-length": tokens["res"]?.(req, res, "content-length") || "",
          referrer: tokens["referrer"]?.(req, res) || "",
          "user-agent": tokens["user-agent"]?.(req, res) || "",
          "response-time": tokens["response-time"]?.(req, res) || "",
        });
      } else {
        return [
          tokens["date"]?.(req, res, "iso") || "",
          tokens["status"]?.(req, res) || "",
          tokens["method"]?.(req, res) || "",
          tokens["url"]?.(req, res) || "",
          tokens["res"]?.(req, res, "content-length") || "",
          tokens["response-time"]?.(req, res) || "",
        ].join(" ");
      }
    },
    {
      stream: {
        write: (message) => logger.log(message.replace("\n", "")),
      },
    },
  );
};
