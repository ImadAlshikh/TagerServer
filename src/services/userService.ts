import { type UserType } from "../utils/validator";
import { type Profile } from "passport-google-oauth20";
import prisma from "../lib/prisma";

export const createUserService = async (userData: UserType) => {
  const user = await prisma.user.create({
    data: { ...userData, name: userData.name! },
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
      picture: userData._json.picture,
      googleId: userData.id,
    },
  });
  return user;
};

export const getAllUsersService = async () => {
  const users = await prisma.user.findMany();
  return users;
};

export const getUserByIdService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user;
};

export const getUserProfileService = async (userId: string) => {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, surname: true, picture: true, created_at: true },
  });
  return profile;
};
