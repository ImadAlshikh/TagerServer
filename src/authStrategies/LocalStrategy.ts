import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { UserType } from "../utils/validator";
import { userSchema } from "../utils/validator";
import { getUserByIdService } from "../services/userService";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import redis from "../lib/redis";

const localStrategy: LocalStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passReqToCallback: true,
  },
  async (req, email, password, done) => {
    try {
      const { name, surname } = req.body;
      const userData: UserType = { email, password, name, surname };
      const result = userSchema.safeParse(userData);
      const hashedPassword = await bcrypt.hash(userData.password!, 10);
      if (result.success) {
        const userExists = await prisma.user.findUnique({
          where: { email: email },
        });
        if (!userExists) {
          return done(null, false);
        } else if (userExists && !userExists.password) {
          const user = await prisma.user.update({
            where: { email: result.data.email },
            data: { password: hashedPassword! },
          });
          return done(null, user.id);
        } else if (userExists) {
          return done(null, userExists.id);
        }
      } else {
      }
      done(null, false);
    } catch (error) {
      return done(error);
    }
  }
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
    process.env.CACHE_TIME!
  );
  done(null, user);
});

export default localStrategy;
