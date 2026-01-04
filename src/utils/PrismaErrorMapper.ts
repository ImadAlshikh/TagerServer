import { AppError } from "./AppError";

type PrismaError = {
  code?: string;
};

export function mapPrismaError(err: unknown): never {
  const e = err as PrismaError;

  if (e?.code) {
    switch (e.code) {
      case "P2002":
        throw new AppError("Already exists", 409);

      case "P2025":
        throw new AppError("Not found", 404);

      case "P2003":
        throw new AppError("Invalid relation", 400);

      default:
        throw new AppError("Database error", 400);
    }
  }

  throw new AppError(`Internal server error:${err}`, 500);
}
