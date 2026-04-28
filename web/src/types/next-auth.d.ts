import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      roles?: string[];
    } & DefaultSession["user"];
  }
}

export {};
