if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

const config = {
  env: process.env.NODE_ENV,

  server: {
    port: Number(process.env.PORT) || 3000,
  },

  frontend: {
    url: process.env.FRONTEND_URL!,
  },

  database: {
    url: process.env.DATABASE_URL!,
  },

  auth: {
    sessionSecret: process.env.SESSION_SECRET!,
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  cloudinary: {
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET!,
    webhookSecret: process.env.STRIPE_SIG!,
  },

  redis: {
    url: process.env.REDIS_URL!,
    cacheTime: Number(process.env.CACHE_TIME) || 0,
  },
};

export default config;
