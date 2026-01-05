import dotenv from "dotenv";
const envFile =
  process.env.NODE_ENV == "development" ? ".env.development" : ".env";
dotenv.config({ path: envFile });
