import pino from "pino";

const logger = pino({
  enabled: true,
  level: "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: true,
      ignore: "pid,hostname",
    },
  },
});

export default logger;
