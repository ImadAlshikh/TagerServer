import { userSchema } from "../utils/validator";
import { Request, Response } from "express";
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  getUserProfileService,
} from "../services/userService";

export const createUserController = async (req: Request, res: Response) => {
  try {
    const userDataValid = userSchema.safeParse(req.body);
    if (!userDataValid.success) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }
    const result = await createUserService(userDataValid.data);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
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
    const userId: string = (req.user as any).id;
    const result = await getUserProfileService(userId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
