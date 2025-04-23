import { defineConfig } from "cypress";
import dotenvPlugin from "cypress-dotenv";
import { resolveServiceUrl } from "./src/utils/resolveServiceUrl";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return dotenvPlugin(config);
    },
    baseUrl: resolveServiceUrl("USER"),
  },
  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "cypress/reports",
    overwrite: false,
    html: true,
    json: true,
  },
  env: {
    AUTH_SERVICE_URL: resolveServiceUrl("AUTH"),
    EMAIL_SERVICE_URL: resolveServiceUrl("EMAIL"),
    EVENT_SERVICE_URL: resolveServiceUrl("EVENT"),
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  },
});
