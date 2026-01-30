import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { getUserByIdService } from "../services/user.service.js";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import redis from "../lib/redis";

const localStrategy: LocalStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passReqToCallback: true,
  },
  async (req, email, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      const isMatch = await bcrypt.compare(password, user?.password!);
      if (!isMatch) return done(null, false);
      done(null, user?.id);
    } catch (error) {
      return done(error);
    }
  },
);

passport.serializeUser((userId, done) => {
  done(null, userId);
});

passport.deserializeUser(async (userId: string, done) => {
  const cached = await redis.get(`user:${userId}`);
  if (cached) return done(null, JSON.parse(cached));
  const user = await getUserByIdService(userId);
  redis.set(
    `user:${userId}`,
    JSON.stringify(user),
    "EX",
    process.env.CACHE_TIME!,
  );
  done(null, user);
});

export default localStrategy;
