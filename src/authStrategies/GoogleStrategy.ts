import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  getUserByIdService,
  upsertUserWithGoogleService,
} from "../services/userService";
import redis from "../lib/redis";

const googleStrategy: GoogleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "http://localhost:3001/auth/google/callback",
    scope: ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await upsertUserWithGoogleService(profile);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);
passport.serializeUser((user, done) => {
  return done(null, (user as any).id);
});

passport.deserializeUser(async (userId: string, done) => {
  try {
    console.log(`${userId} logined`);
    const cached = await redis.get(`user:${userId}`);
    if (cached) return done(null, JSON.parse(cached));
    const user = await getUserByIdService(userId);
    redis.set(
      `user:${userId}`,
      JSON.stringify(user),
      "EX",
      process.env.CACHE_TIME!
    );
    return done(null, user);
  } catch (err) {
    done(err);
  }
});

export default googleStrategy;
