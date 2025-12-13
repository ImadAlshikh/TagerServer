import { Request, Response } from "express";
import {
  createPostService,
  getAllPostsService,
  getPostByIdService,
  getPostsByUserIdService,
  editPostByIdService,
  searchPostService,
} from "../services/postService";
import { postSchema, PostType } from "../utils/validator";
import cloudinary from "../lib/cloudinary";
import streamifier from "streamifier";

export const createPostController = async (req: Request, res: Response) => {
  try {
    let imageUrl;
    const postData: PostType = {
      ...req.body,
      price: Number(req.body.price),
      discount: Number(req.body?.discount),
      ownerId: (req.user as any).id,
      tags: req.body.tags.split(" "),
    };
    const postDataValid = postSchema.safeParse(postData);
    if (!postDataValid.success) {
      return res
        .status(400)
        .json({ success: false, message: postDataValid.error.issues });
    }
    if (req.file) {
      imageUrl = await new Promise<string>((resolve, reject) => {
        const uploadSteram = cloudinary.uploader.upload_stream(
          {
            folder: "posts",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result!.secure_url);
          }
        );
        streamifier.createReadStream(req.file!.buffer).pipe(uploadSteram);
      });
    }
    const result = await createPostService({ ...postData, picture: imageUrl });
    return res.status(201).json({
      success: true,
      data: result,
      message: "Post created successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
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

export const searchPostController = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    const result = await searchPostService(query);
    if (result) {
      return res.status(200).json({ success: true, data: result });
    }
  } catch (error: any) {
    return res.status(500).json({ success: true, message: error.message });
  }
};
