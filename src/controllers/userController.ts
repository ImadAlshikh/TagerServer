import { Request, Response } from "express";
import bcrypt from "bcrypt";
import streamifier from "streamifier";

import { userSchema } from "../utils/validator";
import {
  signinUserService,
  loginUserService,
  getAllUsersService,
  getUserByIdService,
  getUserProfileService,
  updateProfileService,
} from "../services/userService";

import redis from "../lib/redis";
import cloudinary from "../lib/cloudinary";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const signinUserController = catchAsync(
  async (req: Request, res: Response) => {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError("Invalid data", 400);
    }

    const hashedPassword = await bcrypt.hash(validation.data.password!, 10);

    const user = await signinUserService({
      ...validation.data,
      password: hashedPassword,
    });

    const { password, ...rest } = user;

    req.session.userId = user.id;

    await redis.set(
      `user:${user.id}`,
      JSON.stringify(rest),
      "EX",
      Number(process.env.CACHE_TIME)
    );

    res.status(201).json({ success: true, data: rest });
  }
);

export const loginUserController = catchAsync(
  async (req: Request, res: Response) => {
    const validation = userSchema
      .pick({ email: true, password: true })
      .safeParse(req.body);

    if (!validation.success) {
      throw new AppError("Invalid input", 400);
    }

    const { email, password } = validation.data;

    const user = await loginUserService(email);
    if (!user?.password) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password!, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const { password: _, ...rest } = user;

    req.session.userId = user.id;

    await redis.set(
      `user:${user.id}`,
      JSON.stringify(rest),
      "EX",
      Number(process.env.CACHE_TIME)
    );

    res.status(200).json({ success: true, data: rest });
  }
);

export const getAllUsersController = catchAsync(
  async (_req: Request, res: Response) => {
    const users = await getAllUsersService();
    res.status(200).json({ success: true, data: users });
  }
);

export const getUserByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = await getUserByIdService(userId);

    if (!user) throw new AppError("User not found", 404);

    res.status(200).json({ success: true, data: user });
  }
);

export const getProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.session.userId || (req.user as any)?.id;

    const user = await getUserProfileService(userId);
    res.status(200).json({ success: true, data: user });
  }
);

export const updateProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.session.userId || (req.user as any)?.id;

    const { name, surname, phone, address } = req.body;
    const partialUserSchema = userSchema.pick({
      name: true,
      surname: true,
      phone: true,
      address: true,
    });
    const dataValid = partialUserSchema.safeParse({
      name,
      surname,
      phone,
      address,
    });
    if (!dataValid.success) {
      throw new AppError("Invalid data", 401);
    }
    let picture;

    if (req.file?.buffer) {
      const oldUser = await getUserProfileService(id);

      const uploadResult = await new Promise<{
        secureUrl: string;
        publicId: string;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "users" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve({
              secureUrl: result.secure_url,
              publicId: result.public_id,
            });
          }
        );

        streamifier.createReadStream(req.file?.buffer!).pipe(uploadStream);
      });

      picture = uploadResult;

      if (oldUser?.picture?.publicId) {
        await cloudinary.uploader.destroy(oldUser.picture.publicId);
      }
    }

    const user = await updateProfileService({
      id,
      name,
      surname,
      phone,
      address,
      picture,
    });

    res.json({ success: true, data: user });
  }
);

export const logoutController = catchAsync(
  async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false });
      }
      res.clearCookie("connect.sid", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      res.status(200).json({ success: true });
    });
  }
);
