import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import cors from "cors";
import userRouter from "./routes/user.routes";
import postRouter from "./routes/post.routes";
import chatRouter from "./routes/chat.routes";
import ratingRouter from "./routes/rating.routes";
import reportRouter from "./routes/report.routes";
import creditsRouter from "./routes/credits.routes";
import stripeRouter from "./routes/stripe.routes";
import session from "express-session";
import connectRedis from "connect-redis";
import redis from "./lib/redis";
import passport from "passport";
import googleStrategy from "./authStrategies/GoogleStrategy";
import { InitSocket } from "./lib/socket";
import { attachUser } from "./middlewares/attachUser.middleware";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { handleStripeWebhook } from "./webhooks/stripe.webhook.controller";

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT);
const sessionMaxAge: number = 1000 * 60 * 60 * 24;
app.use(cors({ origin: process.env.FRONTEND_URL!, credentials: true }));

const RedisStore = connectRedis(session);
const sessionMiddleware = session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: sessionMaxAge,
    sameSite: "lax",
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
      if (err || !user) {
        return res.redirect("/signin");
      }

      req.logIn(user, (err) => {
        if (err) return next(err);

        req.session.userId = user.id;

        return res.redirect(process.env.FRONTEND_URL!);
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
