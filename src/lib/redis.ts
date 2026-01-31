import { Redis } from "ioredis";
import env from "./env.js";

const redis = new Redis(env.redis.url || "redis://localhost:6379");

export default redis;
