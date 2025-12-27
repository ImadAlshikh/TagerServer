import { type PostType } from "../utils/validator";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";

export const createPostService = async (postData: PostType) => {
  const { ownerId, categoryName, picture, ...restPostData } = postData;

  const trans = await prisma.$transaction(async (tx) => {
    const cost = Number(process.env.POST_CREATE_COST) || 5;
    const wallet = await tx.wallet.upsert({
      where: { userId: ownerId },
      create: { user: { connect: { id: ownerId } } },
      update: {},
    });
    if (wallet.freePoints < cost) {
      throw new AppError("Your wallet balance is insufficient", 402);
    }
    const post = await tx.post.create({
      data: {
        ...restPostData,
        tags: restPostData.tags?.length ? restPostData.tags : [],
        owner: { connect: { id: ownerId } },
        picture: {
          create: {
            secureUrl: picture.secure_url,
            publicId: picture.public_id,
          },
        },
        category: {
          connectOrCreate: {
            where: { name: categoryName.toLocaleLowerCase() },
            create: { name: categoryName },
          },
        },
      },
    });
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        freePoints: { decrement: 5 },
        logs: {
          create: { amount: -5, pointSource: "FREE", reason: "POST_CREATE" },
        },
      },
    });
    return { post };
  });

  return trans.post;
};

export const getAllPostsService = async (
  {
    cursor,
    limit,
  }: {
    cursor?: string;
    limit?: number | string;
  } = { limit: 10 }
) => {
  const postsCount = await prisma.post.count();
  const posts = await prisma.post.findMany({
    ...(cursor ? { where: { created_at: { lt: cursor } } } : {}),
    ...(limit ? (limit != -1 ? { take: Number(limit) } : {}) : {}),
    orderBy: {
      created_at: "desc",
    },
    include: {
      picture: { select: { secureUrl: true } },
      owner: {
        select: {
          name: true,
          surname: true,
          picture: true,
        },
      },
    },
  });
  return { posts, postsCount };
};

export const getPostByIdService = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      picture: { select: { secureUrl: true, publicId: true } },
      owner: { select: { name: true, picture: true, surname: true } },
    },
  });
  return post;
};

export const getPostsByUserIdService = async (userId: string) => {
  const posts = await prisma.post.findMany({
    where: { owner: { id: userId } },
  });
  return posts;
};

export const editPostByIdService = async (postData: PostType) => {
  const { id: postId, ...restPostData } = postData;
  const post = await prisma.post.update({
    where: { id: postId },
    data: restPostData,
  });
  return post;
};

export const searchPostService = async (searchQuery: string[]) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        ...(searchQuery.length
          ? {
              OR: searchQuery.flatMap((q) => [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { categoryName: { contains: q, mode: "insensitive" } },
                { tags: { hasSome: [q] } },
              ]),
            }
          : {}),
      },
      include: {
        owner: { select: { name: true, picture: true, surname: true } },
      },
    });
    return posts;
  } catch (error) {}
};
