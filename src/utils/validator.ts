import { z } from "zod";

/** User */
export const userRoles = ["USER", "ADMIN", "SUPPORT"] as const;
export const userSchema = z.object({
  id: z.cuid().optional(),
  googleId: z.string().optional(),
  name: z.string().max(20),
  surname: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  picture: z.string().optional(),
  role: z.enum(userRoles).optional(),
  country: z.string().optional(),
});
export type UserType = z.infer<typeof userSchema>;

/** Post */
export const postStatus = [
  "ACTIVE",
  "SOLD",
  "EXPIRED",
  "HIDDING",
  "REMOVED",
] as const;
export const saleType = ["ONETIME", "MULTIPLE"] as const;

export const postSchema = z.object({
  id: z.cuid().optional(),
  title: z.string().nonempty(),
  description: z.string().max(500).optional(),
  picture: z.string().optional(),
  price: z.number().nonnegative(),
  discount: z.number().max(100).nonnegative().optional(),
  categoryName: z.string().nonempty(),
  saleType: z.enum(saleType).optional(),
  tags: z.string().array().optional(),
  stock: z.number().optional(),
  status: z.enum(postStatus).optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  ownerId: z.cuid(),
});
export type PostType = z.infer<typeof postSchema>;

/** Message */
export const messageSchema = z.object({
  text: z.string(),
  senderId: z.cuid(),
  postId: z.cuid(),
  chatId: z.cuid(),
});
export type MessageType = z.infer<typeof messageSchema>;

/** Rating */
export const ratingSchema = z.object({
  text: z.string().optional(),
  rate: z.number().int().min(1).max(5),
  raterId: z.cuid(),
  ratedId: z.cuid(),
});
export type RatingType = z.infer<typeof ratingSchema>;

export enum Provider {
  Google = "google",
  Local = "local",
}
