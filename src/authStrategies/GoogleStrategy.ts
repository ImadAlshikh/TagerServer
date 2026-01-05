import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { upsertUserWithGoogleService } from "../services/userService";

const googleStrategy: GoogleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google/callback`,
    scope: ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await upsertUserWithGoogleService(profile);
      return done(null, user.id);
    } catch (err) {
      return done(err);
    }
  }
);
passport.serializeUser((id, done) => {
  return done(null, id);
});

passport.deserializeUser(async (userId: string, done) => {
  try {
    return done(null, { id: userId });
  } catch (err) {
    done(err);
  }
});

export default googleStrategy;
