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
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const createPostController = catchAsync(
  async (req: Request, res: Response) => {
    const postData: PostType = {
      ...req.body,
      price: Number(req.body.price),
      discount: Number(req.body?.discount),
      ownerId: (req.user as any).id,
      tags: req.body.tags?.split(" ") || [],
    };

    const validation = postSchema.safeParse(postData);
    if (!validation.success) {
      throw new AppError("Invalid post data", 400);
    }

    let picture: string | undefined;

    if (req.file?.buffer) {
      picture = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "posts" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result.secure_url);
          }
        );

        streamifier.createReadStream(req.file?.buffer!).pipe(uploadStream);
      });
    }

    const result = await createPostService({
      ...postData,
      picture,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: "Post created successfully",
    });
  }
);

export const getAllPostsController = catchAsync(
  async (req: Request, res: Response) => {
    const { cursorId, limit } = req.body;
    const result = await getAllPostsService({cursorId, limit});
    res.status(200).json({ success: true, data: result });
  }
);

export const getPostByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const postId = req.params.id;
    const result = await getPostByIdService(postId);

    if (!result) throw new AppError("Post not found", 404);

    res.status(200).json({ success: true, data: result });
  }
);

export const getPostsByUserIdController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const result = await getPostsByUserIdService(userId);
    res.status(200).json({ success: true, data: result });
  }
);

export const editPostByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const postData: PostType = req.body;

    const validation = postSchema.safeParse(postData);
    if (!validation.success) {
      throw new AppError("Invalid post data", 400);
    }

    const result = await editPostByIdService(postData);
    res.status(200).json({ success: true, data: result });
  }
);

export const searchPostController = catchAsync(
  async (req: Request, res: Response) => {
    const { query } = req.body;
    if (!query) throw new AppError("Query is required", 400);

    const result = await searchPostService(query);
    res.status(200).json({ success: true, data: result });
  }
);
