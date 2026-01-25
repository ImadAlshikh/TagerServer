import { Request, Response } from "express";
import {
  createPostService,
  getAllPostsService,
  getPostByIdService,
  getPostsByUserIdService,
  editPostByIdService,
  searchPostService,
  getPostsService,
  deletePostByIdService,
} from "../services/post.service";

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

    let result = await createPostService({
      ...postData,
    });

    if (req.file?.buffer) {
      try {
        const picture = await new Promise<{
          secure_url: string;
          public_id: string;
        }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "posts",
              transformation: {
                width: 400,
                height: 400,
                crop: "fill",
                format: "webp",
              },
            },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result);
            },
          );

          streamifier.createReadStream(req.file?.buffer!).pipe(uploadStream);
        });

        result = await editPostByIdService({
          ...postData,
          id: result.id,
          picture,
        });
      } catch (error) {}
    }

    res.status(201).json({
      success: true,
      data: result,
      message: "Post created successfully",
    });
  },
);

export const getAllPostsController = catchAsync(
  async (req: Request, res: Response) => {
    let { cursor, limit } = req.query as {
      cursor?: string;
      limit?: string;
    };
    limit === "undefined" ? (limit = undefined) : limit;
    cursor === "undefined" ? (cursor = undefined) : cursor;
    const result = await getAllPostsService({ cursor, limit });
    res.status(200).json({ success: true, data: result });
  },
);

export const getPostsController = catchAsync(
  async (req: Request, res: Response) => {
    let { cursor, limit, searchQuery, orderBy, orderDir, category } =
      req.query as {
        cursor?: string;
        limit?: string;
        searchQuery?: string;
        orderBy?: string;
        orderDir?: string;
        category?: string;
      };
    limit === "undefined" ? (limit = undefined) : limit;
    cursor === "undefined" ? (cursor = undefined) : cursor;
    searchQuery === "undefined" || searchQuery === ""
      ? (searchQuery = undefined)
      : searchQuery;
    orderBy === "undefined" || orderBy === "" ? (orderBy = undefined) : orderBy;
    orderDir === "undefined" || orderDir === ""
      ? (orderDir = undefined)
      : orderDir;
    category === "undefined" || category === ""
      ? (category = undefined)
      : category;
    const searchQueries = searchQuery?.split(" ");
    const result = await getPostsService({
      cursor,
      limit,
      searchQueries,
      orderBy,
      orderDir,
      category,
    });
    res.status(200).json({ success: true, data: result });
  },
);

export const getPostByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const postId = req.params.id;
    const result = await getPostByIdService(postId);

    if (!result) throw new AppError("Post not found", 404);

    res.status(200).json({ success: true, data: result });
  },
);

export const getPostsByUserIdController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    if (!userId) throw new AppError("User id required", 400);
    const result = await getPostsByUserIdService(userId);
    res.status(200).json({ success: true, data: result });
  },
);

export const editPostByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const postData = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      discount: req.body.discount ? Number(req.body.discount) : undefined,
      tags: req.body.tags?.split(" ") || [],
    };

    const userId = req.session.userId || (req.user as any)?.id;

    if (!postData.id) {
      throw new AppError("Post ID is required", 400);
    }

    // Verify ownership
    const existingPost = await getPostByIdService(postData.id);
    if (!existingPost) {
      throw new AppError("Post not found", 404);
    }

    if (existingPost.ownerId !== userId) {
      throw new AppError("Permission denied", 403);
    }

    const validation = postSchema.safeParse({
      ...postData,
      ownerId: userId, // Ensure validation passes with correct owner
    });

    if (!validation.success) {
      throw new AppError("Invalid post data", 400);
    }

    let picture: { secure_url: string; public_id: string } | undefined;

    if (req.file?.buffer) {
      // Delete old image from Cloudinary if it exists
      if (existingPost.picture?.publicId) {
        try {
          await cloudinary.uploader.destroy(existingPost.picture.publicId);
        } catch (error) {
          console.error("Failed to delete old image from Cloudinary:", error);
        }
      }

      picture = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "posts",
              transformation: {
                width: 400,
                height: 400,
                crop: "fill",
                format: "webp",
              },
            },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result);
            },
          );

          streamifier.createReadStream(req.file?.buffer!).pipe(uploadStream);
        },
      );
    }

    const result = await editPostByIdService({
      ...postData,
      picture,
    });
    res.status(200).json({ success: true, data: result });
  },
);

export const searchPostController = catchAsync(
  async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query) throw new AppError("Query is required", 400);
    const result = await searchPostService(query.toString().split(","));
    res.status(200).json({ success: true, data: result });
  },
);

export const deletePostByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const postId = req.params.id;
    const userId = req.session.userId || (req.user as any)?.id;

    if (!postId) {
      throw new AppError("Post ID is required", 400);
    }

    // Verify ownership
    const existingPost = await getPostByIdService(postId);
    if (!existingPost) {
      throw new AppError("Post not found", 404);
    }

    if (existingPost.ownerId !== userId) {
      throw new AppError("Permission denied", 403);
    }

    // Delete image from Cloudinary if it exists
    if (existingPost.picture?.publicId) {
      try {
        await cloudinary.uploader.destroy(existingPost.picture.publicId);
      } catch (error) {
        console.error("Failed to delete image from Cloudinary:", error);
      }
    }

    // Delete post from database
    await deletePostByIdService(postId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  },
);

export const deletePostImageByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const postId = req.params.id;
    const userId = req.session.userId || (req.user as any)?.id;

    if (!postId) {
      throw new AppError("Post ID is required", 400);
    }

    // Verify ownership
    const existingPost = await getPostByIdService(postId);
    if (!existingPost) {
      throw new AppError("Post not found", 404);
    }

    if (existingPost.ownerId !== userId) {
      throw new AppError("Permission denied", 403);
    }

    if (!existingPost.picture?.publicId) {
      throw new AppError("Post has no image to delete", 404);
    }

    // Delete image from Cloudinary
    try {
      await cloudinary.uploader.destroy(existingPost.picture.publicId);
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
      throw new AppError("Failed to delete image", 500);
    }

    // Remove picture relation from post using Prisma directly
    const prisma = (await import("../lib/prisma")).default;
    await prisma.post.update({
      where: { id: postId },
      data: {
        picture: {
          disconnect: true,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Post image deleted successfully",
    });
  },
);
