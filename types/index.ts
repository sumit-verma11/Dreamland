import type {
  Chat,
  Favorite,
  Inquiry,
  Message,
  PriceHistory,
  Property,
  PropertyMedia,
  Review,
  User,
} from "@prisma/client";

export type SafeUser = Omit<User, "hashedPassword" | "emailVerified"> & {
  emailVerified: string | null;
};

export type {
  Chat,
  Favorite,
  Inquiry,
  Message,
  PriceHistory,
  Property,
  PropertyMedia,
  Review,
  User,
};
