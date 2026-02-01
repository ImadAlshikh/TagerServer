import env from "./lib/env.js";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import chatRouter from "./routes/chat.routes.js";
import ratingRouter from "./routes/rating.routes.js";
import reportRouter from "./routes/report.routes.js";
import creditsRouter from "./routes/credits.routes.js";
import stripeRouter from "./routes/stripe.routes.js";
import session from "express-session";
import connectRedis from "connect-redis";
import redis from "./lib/redis.js";
import passport from "passport";
import googleStrategy from "./authStrategies/GoogleStrategy.js";
import { InitSocket } from "./lib/socket.js";
import { attachUser } from "./middlewares/attachUser.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { handleStripeWebhook } from "./webhooks/stripe.webhook.controller.js";

const app = express();
const server = http.createServer(app);
const port = env.server.port;
const sessionMaxAge: number = 1000 * 60 * 60 * 24;
const frontendUrl = env.frontend.url;
app.use(cors({ origin: frontendUrl, credentials: true }));

app.use((req, res, next) => {
  if (req.path === "/users/profile" || req.path === "/auth/google/callback") {
    console.log(`Debug [${req.path}]: Cookies received:`, req.headers.cookie);
    console.log(`Debug [${req.path}]: Session ID:`, req.sessionID);
    console.log(`Debug [${req.path}]: Session:`, req.session);
  }
  next();
});

if (env.env === "production") {
  app.set("trust proxy", 1); // trust first proxy
}

const RedisStore = connectRedis(session);
const sessionMiddleware = session({
  store: new RedisStore({ client: redis }),
  secret: env.auth.sessionSecret,
  resave: false,
  saveUninitialized: false,
  proxy: true, // Required for Heroku/Vercel/Railway
  cookie: {
    httpOnly: true,
    maxAge: sessionMaxAge,
    sameSite: env.env === "production" ? "none" : "lax",
    secure: env.env === "production",
  },
});

export const io = InitSocket(server, sessionMiddleware);
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(attachUser);
passport.use(googleStrategy);
app.get("/auth/google", passport.authenticate("google"));

app.get(
  "/auth/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", (err: any, user: any) => {
      console.log("Google Auth Callback Debug:");
      console.log("Error:", err);
      console.log("User:", user ? "Found" : "Not Found");
      console.log("Env:", env.env);

      if (err || !user) {
        console.log("Redirecting to /signin due to error or missing user");
        return res.redirect("/signin");
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("Login Error:", err);
          return next(err);
        }

        req.session.userId = user; // user is the id from GoogleStrategy
        console.log("Session UserID set:", req.session.userId);

        req.session.save((err: any) => {
          if (err) {
            console.error("Session Save Error:", err);
            return next(err);
          }
          console.log("Session saved, redirecting to frontend:", frontendUrl);
          return res.redirect(frontendUrl);
        });
      });
    })(req, res, next);
  },
);

app.use(
  "/checkout/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);
app.use(express.json());
app.use("/checkout", stripeRouter);
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/chats", chatRouter);
app.use("/ratings", ratingRouter);
app.use("/reports", reportRouter);
app.use("/credits", creditsRouter);
app.use(errorHandler);

server.listen(port, () => {
  console.log(`Express server start on port:${port}`);
});
