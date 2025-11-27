import "dotenv/config";
import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import postRouter from "./routes/postRoutes";
import chatRouter from "./routes/chatRoutes";
import ratingRouter from "./routes/ratingRoutes";
import reportRouter from "./routes/reportRotues";
import session from "express-session";
import connectRedis from "connect-redis";
import redis from "./lib/redis";
import passport from "passport";
import googleStrategy from "./authStrategies/GoogleStrategy";
import localStrategy from "./authStrategies/LocalStrategy";

const app = express();
const port = process.env.PORT;
const sessionMaxAge: number = 1000 * 60 * 60 * 24;
app.use(express.json());
app.use(cors({ credentials: true }));
const RedisStore = connectRedis(session);
app.use(
  session({
    store: new RedisStore({ client: redis }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: sessionMaxAge,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(googleStrategy);
passport.use(localStrategy);
app.get("/auth/google", passport.authenticate("google"));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/users/profile",
    failureRedirect: "/login",
  })
);

app.post(
  "/auth/local",
  passport.authenticate("local", { successRedirect: "/users/profile" })
);

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/chats", chatRouter);
app.use("/ratings", ratingRouter);
app.use("/reports", reportRouter);

app.listen(port, () => {
  console.log(`Express server start on port:${port}`);
});
