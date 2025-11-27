import { type PostType } from "../utils/validator";
import prisma from "../lib/prisma";

export const createPostService = async (postData: PostType) => {
  const { ownerId, ...restPostData } = postData;

  const post = await prisma.post.create({
    data: {
      ...restPostData,
      owner: { connect: { id: ownerId } },
    },
  });

  return post;
};

export const getAllPostsService = async () => {
  const posts = await prisma.post.findMany();
  return posts;
};

export const getPostByIdService = async (postId: string) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
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
    data: { ...restPostData },
  });
  return post;
};
