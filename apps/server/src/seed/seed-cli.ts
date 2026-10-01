import { loadConfig } from "../config/config";
import { connectDatabase } from "../database/database";
import { migrate } from "../database/migrate";
import { createLogger } from "../http/logger";
import { SAMPLE_CATALOG } from "./sample-catalog";
import { seedCatalog } from "./seed-catalog";

const config = loadConfig();

if (config.appEnv === "production") {
  console.error("Refusing to load sample data: APP_ENV is production.");
  process.exit(1);
}

const logger = createLogger(config);
const database = connectDatabase(config.databaseUrl);

try {
  // Das Seeden funktioniert auch auf einer frischen Datenbank.
  await migrate(database.sql, logger);
  await seedCatalog(database.db, SAMPLE_CATALOG);
  logger.info(
    { niches: SAMPLE_CATALOG.length, gadgets: SAMPLE_CATALOG.reduce((sum, niche) => sum + niche.gadgets.length, 0) },
    "sample catalog loaded",
  );
} catch (error) {
  logger.fatal({ err: error }, "seeding failed");
  process.exitCode = 1;
} finally {
  await database.close();
}
