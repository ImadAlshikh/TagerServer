import { type UserType } from "../utils/validator";
import { type Profile } from "passport-google-oauth20";
import prisma from "../lib/prisma";

export const signinUserService = async (
  userData: Omit<UserType, "picture">
) => {
  const user = await prisma.user.create({
    data: { ...userData, name: userData.name! },
  });
  return user;
};

export const loginUserService = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { picture: { select: { secureUrl: true } } },
  });
  return user;
};

export const upsertUserWithGoogleService = async (userData: Profile) => {
  const user = await prisma.user.upsert({
    where: { email: userData._json.email },
    update: {
      googleId: userData.id,
    },
    create: {
      name: userData._json.given_name!,
      surname: userData._json.family_name,
      email: userData._json.email!,
      picture: { create: { secureUrl: userData._json.picture! } },
      googleId: userData.id,
    },
    include: { picture: { select: { secureUrl: true } } },
  });
  return user;
};

export const getAllUsersService = async () => {
  const users = await prisma.user.findMany();
  return users;
};

export const getUserByIdService = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error) {}
};

export const getUserProfileService = async (userId: string) => {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      surname: true,
      picture: true,
      phone: true,
      address: true,
      created_at: true,
    },
  });
  return profile;
};

export const updateProfileService = async ({
  id,
  name,
  surname,
  picture,
  phone,
  address,
}: {
  id: string;
  name: string;
  surname?: string;
  picture?: { secureUrl: string; publicId: string };
  phone?: string;
  address?: string;
}) => {
  const user = await prisma.user.update({
    where: { id: id },
    data: {
      name,
      surname,
      phone,
      address,
      ...(picture?.secureUrl
        ? {
            picture: {
              create: {
                secureUrl: picture.secureUrl,
                publicId: picture.publicId,
              },
            },
          }
        : {}),
    },
  });
  return user;
};
