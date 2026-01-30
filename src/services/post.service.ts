import { type PostType } from "../utils/validator";
import prisma from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";

export const createPostService = async (postData: PostType) => {
  const { ownerId, categoryName, picture, ...restPostData } = postData;

  const trans = await prisma.$transaction(async (tx) => {
    let promoteCost;

    const createCost = (await prisma.price.findUnique({
      where: { key: "POST_CREATE" },
    }))!.credits;
    if (!createCost) {
      throw new AppError("Internal server error", 500);
    }
    let totalCost = createCost;
    if (postData.promoted) {
      promoteCost = (await prisma.price.findUnique({
        where: { key: "POST_PROMOTE" },
      }))!.credits;
      if (!promoteCost) {
        throw new AppError("Internal server error", 500);
      }
      totalCost += promoteCost;
    }

    const wallet = await tx.wallet.upsert({
      where: { userId: ownerId },
      create: { user: { connect: { id: ownerId } } },
      update: {},
    });

    const totalAvailable = wallet.freePoints + wallet.paidPoints;
    if (totalAvailable < totalCost) {
      throw new AppError("Your wallet balance is insufficient", 402);
    }

    const freePointsToUse = Math.min(wallet.freePoints, totalCost);
    const paidPointsToUse = totalCost - freePointsToUse;

    const post = await tx.post.create({
      data: {
        ...restPostData,
        tags: restPostData.tags?.length ? restPostData.tags : [],
        owner: { connect: { id: ownerId } },
        ...(picture?.secure_url
          ? {
              picture: {
                create: {
                  secureUrl: picture.secure_url,
                  publicId: picture.public_id,
                },
              },
            }
          : {}),

        category: {
          connectOrCreate: {
            where: { name: categoryName.toLocaleLowerCase() },
            create: { name: categoryName },
          },
        },
      },
    });

    // Deduct from wallet and create logs
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        freePoints: { decrement: freePointsToUse },
        paidPoints: { decrement: paidPointsToUse },
        logs: {
          create: [
            ...(freePointsToUse > 0
              ? [
                  {
                    amount: -freePointsToUse,
                    pointSource: "FREE" as const,
                    reason: "POST_CREATE" as const,
                  },
                ]
              : []),
            ...(paidPointsToUse > 0
              ? [
                  {
                    amount: -paidPointsToUse,
                    pointSource: "PAID" as const,
                    reason: "POST_CREATE" as const,
                  },
                ]
              : []),
          ],
        },
      },
    });
    return { post };
  });

  return trans.post;
};

export const getPostsService = async ({
  cursor,
  limit = 10,
  searchQueries = [],
  orderBy = "created_at",
  orderDir = "desc",
  category,
}: {
  cursor?: string;
  limit?: number | string;
  searchQueries?: string[];
  orderBy?: string;
  orderDir?: string;
  category?: string;
}) => {
  const where: Prisma.PostWhereInput = {
    status: "ACTIVE",
    ...(cursor ? { created_at: { lt: cursor } } : {}),
    ...(searchQueries.length
      ? {
          OR: searchQueries.flatMap((q) => [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { categoryName: { contains: q, mode: "insensitive" } },
            { tags: { hasSome: [q] } },
          ]),
        }
      : {}),
    ...(category ? { categoryName: category } : {}),
  };

  const [postsCount, posts] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      ...(limit != -1 ? { take: Number(limit) } : {}),
      orderBy: [{ promoted: "desc" }, { [orderBy]: orderDir }],
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
    }),
  ]);

  return { posts, postsCount };
};

export const getAllPostsService = async (
  {
    cursor,
    limit,
  }: {
    cursor?: string;
    limit?: number | string;
  } = { limit: 10 },
) => {
  const postsCount = await prisma.post.count();
  const where: Prisma.PostWhereInput = {
    status: "ACTIVE",
    ...(cursor && { created_at: { lt: cursor } }),
  };
  const posts = await prisma.post.findMany({
    where: where,
    ...(limit ? (limit != -1 ? { take: Number(limit) } : {}) : {}),
    orderBy: [
      { promoted: "desc" },
      {
        created_at: "desc",
      },
    ],
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
    where: { ownerId: userId },
    include: {
      owner: {
        select: {
          name: true,
          surname: true,
          picture: true,
        },
      },
      picture: { select: { secureUrl: true } },
    },
    orderBy: { created_at: "desc" },
  });
  return posts;
};

export const editPostByIdService = async (postData: PostType) => {
  const { id: postId, picture, categoryName, ...restPostData } = postData;

  const data: Prisma.PostUpdateInput = {
    ...restPostData,
    tags: restPostData.tags?.length ? restPostData.tags : [],
    ...(categoryName && {
      category: {
        connectOrCreate: {
          where: { name: categoryName.toLowerCase() },
          create: { name: categoryName },
        },
      },
    }),
  };

  if (picture?.secure_url) {
    data.picture = {
      upsert: {
        create: {
          secureUrl: picture.secure_url,
          publicId: picture.public_id,
        },
        update: {
          secureUrl: picture.secure_url,
          publicId: picture.public_id,
        },
      },
    };
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data,
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
        picture: { select: { secureUrl: true } },
      },
    });
    return posts;
  } catch (error) {}
};

export const deletePostByIdService = async (postId: string) => {
  const post = await prisma.post.delete({
    where: { id: postId },
    include: {
      picture: { select: { publicId: true } },
    },
  });
  return post;
};
