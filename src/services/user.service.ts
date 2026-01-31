import { type UserType } from "../utils/validator.js";
import { type Profile } from "passport-google-oauth20";
import { prisma } from "../lib/prisma.js";
import { mapPrismaError } from "../utils/PrismaErrorMapper.js";
import axios from "axios";
import cloudinary from "../lib/cloudinary.js";

export const signupUserService = async (
  userData: Omit<UserType, "picture">,
) => {
  try {
    const trans = await prisma.$transaction(async (tx: any) => {
      const user = await prisma.user.create({
        data: { ...userData, name: userData.name!.trim() },
      });
      const wallet = await tx.wallet.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });
      return { user };
    });
    return trans.user;
  } catch (error) {
    mapPrismaError(error);
  }
};

export const signinUserService = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      surname: true,
      password: true,
      picture: true,
      posts: {
        take: 2,
        include: {
          owner: {
            select: {
              name: true,
              surname: true,
              picture: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      },
      wallet: {
        select: { freePoints: true, paidPoints: true },
      },
      phone: true,
      address: true,
      created_at: true,
    },
  });
  return user;
};

export const upsertUserWithGoogleService = async (userData: Profile) => {
  const user = await prisma.user.findUnique({
    where: { email: userData._json.email },
    select: { picture: true },
  });

  let picture: any;
  if (userData._json.picture && !user?.picture?.secureUrl) {
    const imageResponse = await axios.get(userData._json.picture, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const base64 = Buffer.from(imageResponse.data).toString("base64");
    const dataUri = base64 && `data:image/jpeg;base64,${base64}`;
    picture =
      dataUri &&
      (await cloudinary.uploader.upload(dataUri, {
        folder: "users",
        transformation: { width: 250, height: 250, format: "webp" },
      }));
  }

  const trans = await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.upsert({
      where: { email: userData._json.email },
      update: {
        googleId: userData.id,
        ...(picture && {
          picture: {
            create: {
              secureUrl: picture.secure_url,
              publicId: picture.public_id,
            },
          },
        }),
      },
      create: {
        name: userData._json.given_name!,
        surname: userData._json.family_name,
        email: userData._json.email!,
        googleId: userData.id,
        ...(picture && {
          picture: {
            create: {
              secureUrl: picture.secure_url,
              publicId: picture.public_id,
            },
          },
        }),
      },
      include: { picture: { select: { secureUrl: true } } },
    });

    const wallet = await tx.wallet.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    return { user };
  });

  return trans.user;
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
      email: true,
      picture: true,
      posts: {
        take: 2,
        include: {
          owner: {
            select: {
              name: true,
              surname: true,
              picture: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      },
      wallet: {
        select: { freePoints: true, paidPoints: true },
      },
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
      name: name.trim(),
      surname: surname?.trim(),
      phone: phone?.trim(),
      address: address?.trim(),
      ...(picture?.secureUrl
        ? {
            picture: {
              upsert: {
                create: {
                  secureUrl: picture.secureUrl,
                  publicId: picture.publicId,
                },
                update: {
                  secureUrl: picture.secureUrl,
                  publicId: picture.publicId,
                },
              },
            },
          }
        : {}),
    },
  });
  return user;
};
