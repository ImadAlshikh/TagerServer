import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import ratingRouter from "./routes/ratingRoutes.js";
import reportRouter from "./routes/reportRotues.js";
import session from "express-session";
import connectRedis from "connect-redis";
import redis from "./lib/redis.js";
import passport from "passport";
import googleStrategy from "./authStrategies/GoogleStrategy.js";
import { InitSocket } from "./lib/socket.js";
import { attachUser } from "./middlewares/attachUser.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const server = http.createServer(app);
export const io = InitSocket(server);

const port = Number(process.env.PORT);
const sessionMaxAge: number = 1000 * 60 * 60 * 24;
app.use(express.json());
const allowedOrigins = [
  process.env.FRONTEND_URL, // https://tager-client.vercel.app
  "http://localhost:3000",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow SSR / Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
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
      sameSite: "none",
      secure: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(attachUser);
passport.use(googleStrategy);
app.get("/auth/google", passport.authenticate("google"));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.FRONTEND_URL,
    failureRedirect: "/login",
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

app.use(errorHandler);

server.listen(port, () => {
  console.log(`Express server start on port:${port}`);
});
