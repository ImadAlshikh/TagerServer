import "express-session";

declare module "http" {
  interface IncomingMessage {
    session?: Express.Session & { userId?: string };
  }
}
