import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import postRouter from "./routes/postRoutes";
import chatRouter from "./routes/chatRoutes";
import ratingRouter from "./routes/ratingRoutes";
import reportRouter from "./routes/reportRotues";
import creditsRouter from "./routes/creditsRoutes";
import session from "express-session";
import connectRedis from "connect-redis";
import redis from "./lib/redis";
import passport from "passport";
import googleStrategy from "./authStrategies/GoogleStrategy";
import { InitSocket } from "./lib/socket";
import { attachUser } from "./middlewares/attachUser";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const server = http.createServer(app);

const port = Number(process.env.PORT);
const sessionMaxAge: number = 1000 * 60 * 60 * 24;
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
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
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000",
    failureRedirect: "/signin",
  }),
  (req, res) => {
    req.session.userId = (req.user as any).id;
  }
);

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
