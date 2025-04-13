import newman from "newman";
import fs from "fs";
import dotenv from "dotenv";

// Carrega variáveis do .env
dotenv.config();

const environment = process.env.NODE_ENV || "development";
function resolveServiceUrl(serviceName) {
  const suffix = environment === "production" ? "PROD" : "DEV";
  return process.env[`${serviceName}_SERVICE_URL_${suffix}`];
}

const userServiceUrl = resolveServiceUrl("USER");
const emailServiceUrl = resolveServiceUrl("EMAIL");
const authServiceUrl = resolveServiceUrl("AUTH");

console.log(`[newman] Executando testes em ambiente ${environment}`);

// Carregando o arquivo JSON usando fs
const userCollection = JSON.parse(
  fs.readFileSync("./src/tests/userService.postman_collection.json", "utf-8")
);

newman.run(
  {
    collection: userCollection,
    reporters: ["cli"],
    envVar: [
      {
        key: "user_service_url",
        value: userServiceUrl,
      },
      {
        key: "email_service_url",
        value: emailServiceUrl,
      },
      {
        key: "auth_service_url",
        value: authServiceUrl,
      },
    ],
  },
  function (err) {
    if (err) {
      console.error("Erro ao rodar a collection:", err);
    } else {
      console.log("Collection executada com sucesso!");
    }
  }
);
