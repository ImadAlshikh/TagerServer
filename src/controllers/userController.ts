import { messageSchema, userSchema } from "../utils/validator";
import { Request, Response } from "express";
import {
  signinUserService,
  getAllUsersService,
  getUserByIdService,
  getUserProfileService,
  loginUserService,
} from "../services/userService";
import bcrypt from "bcrypt";
import { string, success, z } from "zod";
import redis from "../lib/redis";

export const signinUserController = async (req: Request, res: Response) => {
  try {
    let userDataValid = userSchema.safeParse(req.body);
    if (!userDataValid.success) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }
    const hashedPassword = await bcrypt.hash(userDataValid.data.password!, 10);
    userDataValid.data = { ...userDataValid.data, password: hashedPassword };
    const result = await signinUserService(userDataValid.data);
    const { password, ...restUserData } = result;
    req.session.userId = result.id;
    await redis.set(
      `user:${result.id}`,
      JSON.stringify(restUserData),
      "EX",
      Number(process.env.CACHE_TIME!)
    );
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const loginUserController = async (req: Request, res: Response) => {
  try {
    const validation = userSchema
      .pick({ email: true, password: true })
      .required()
      .safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }
    const { email, password } = req.body; //validation.data;
    const result = await loginUserService(email);
    if (!result?.password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, result.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const { password: _, ...restUserData } = result;
    req.session.userId = result.id;
    await redis.set(
      `user:${result.id}`,
      JSON.stringify(restUserData),
      "EX",
      Number(process.env.CACHE_TIME!)
    );
    return res.status(200).json({ success: true, data: restUserData });
  } catch (error) {}
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const result = await getAllUsersService();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.id;
    const result = await getUserByIdService(userId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getUserProfileController = async (req: Request, res: Response) => {
  try {
    if (!req.user && !req.session.userId)
      return res
        .status(400)
        .json({ success: false, message: "Session not found" });

    const result = await getUserProfileService(
      req.session.userId || (req.user as any).id
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      });
    });
  } catch (error) {}
};
