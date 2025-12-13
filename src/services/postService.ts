import { type PostType } from "../utils/validator";
import prisma from "../lib/prisma";

export const createPostService = async (postData: PostType) => {
  const { ownerId, categoryName, ...restPostData } = postData;

  const post = await prisma.post.create({
    data: {
      ...restPostData,
      owner: { connect: { id: ownerId } },
      category: {
        connectOrCreate: {
          where: { name: categoryName.toLocaleLowerCase() },
          create: { name: categoryName },
        },
      },
    },
  });

  return post;
};

export const getAllPostsService = async () => {
  const posts = await prisma.post.findMany({
    include: {
      owner: { select: { name: true, picture: true, surname: true } },
    },
  });
  return posts;
};

export const getPostByIdService = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
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
