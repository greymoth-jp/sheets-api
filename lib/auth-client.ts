"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient, oneTapClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3040",
  plugins: [
    magicLinkClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      autoSelect: true,
      context: "signin",
    }),
  ],
});

export const { useSession, signIn, signOut } = authClient;
