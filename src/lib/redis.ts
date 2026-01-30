import Redis from "ioredis";

const redis = new Redis(
  process.env.NODE_ENV == "production" ? process.env.REDIS_URL! : "",
);

export default redis;
