import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { magicLink, oneTap } from "better-auth/plugins";
import { render } from "@react-email/components";
import { Resend } from "resend";
import { getDb } from "./db/client";
import { MagicLinkEmail } from "@/components/emails/MagicLinkEmail";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.warn(`[auth] ${key} is not set — provider unavailable until configured`);
    return "";
  }
  return value;
}

export const auth = betterAuth({
  secret: requireEnv("BETTER_AUTH_SECRET"),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3040",
  database: drizzleAdapter(getDb(), { provider: "sqlite" }),
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  },
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const apiKey = requireEnv("RESEND_API_KEY");
        if (!apiKey) return;
        const resend = new Resend(apiKey);
        const html = await render(MagicLinkEmail({ url }));
        await resend.emails.send({
          from: "SheetsAPI <noreply@sheetsapi.io>",
          to: email,
          subject: "Your SheetsAPI sign-in link",
          html,
        });
      },
    }),
    oneTap(),
  ],
  socialProviders: {
    ...(process.env.APPLE_CLIENT_ID
      ? {
          apple: {
            clientId: process.env.APPLE_CLIENT_ID ?? "",
            teamId: process.env.APPLE_TEAM_ID ?? "",
            keyId: process.env.APPLE_KEY_ID ?? "",
            privateKey: process.env.APPLE_PRIVATE_KEY ?? "",
          },
        }
      : {}),
    google: {
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
      // Request Sheets + Drive scopes so users can connect their spreadsheets
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
      ],
      accessType: "offline",
    },
  },
});
