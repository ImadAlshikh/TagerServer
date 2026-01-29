import { config } from "dotenv";
import path from "path";

// Determine which .env file to load based on NODE_ENV
const env = process.env.NODE_ENV || "development";
const envFile = env === "production" ? ".env.production" : ".env.development";

// Load the appropriate .env file
config({ path: path.resolve(process.cwd(), envFile) });

console.log(`🔧 Environment: ${env}`);
console.log(`📁 Loaded: ${envFile}`);
console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
