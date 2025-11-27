import { Request, Response } from "express";
import {
  createPostService,
  getAllPostsService,
  getPostByIdService,
  getPostsByUserIdService,
  editPostByIdService,
} from "../services/postService";
import { postSchema, PostType } from "../utils/validator";

export const createPostController = async (req: Request, res: Response) => {
  try {
    const postData: PostType = {
      ...req.body,
      ownerId: (req.user as any).id,
    };
    const postDataValid = postSchema.safeParse(postData);
    if (!postDataValid.success) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }
    const result = await createPostService(postDataValid.data);
    return res.status(201).json({
      success: true,
      data: result,
      message: "Post created successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getAllPostsController = async (req: Request, res: Response) => {
  try {
    const result = await getAllPostsService();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getPostByIdController = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const result = await getPostByIdService(postId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getPostsByUserIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.params.userId;
    const result = await getPostsByUserIdService(userId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const editPostByIdController = async (req: Request, res: Response) => {
  try {
    const postData: PostType = req.body;
    const postDataValid = postSchema.safeParse(postData);
    if (1 > 2 && !postDataValid.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
        error: postDataValid.error,
      });
    }
    const result = await editPostByIdService(postData);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
