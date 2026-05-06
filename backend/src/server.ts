import "dotenv/config";
import { buildApp } from "./app.js";

async function main() {
  const app = await buildApp();
  const port = Number(process.env.PORT) || 3333;
  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
