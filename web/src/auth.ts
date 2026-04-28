import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

type ExameoToken = {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  roles?: string[];
  error?: string;
};

async function refreshAccessToken(token: ExameoToken): Promise<ExameoToken> {
  try {
    const params = new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID ?? "web",
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET ?? "web-secret",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken ?? "",
    });

    const issuer = process.env.KEYCLOAK_ISSUER ?? "http://localhost:8081/realms/exameo";
    const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const refreshed = await response.json();
    if (!response.ok) {
      throw new Error(refreshed.error ?? "RefreshAccessTokenError");
    }

    return {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + (refreshed.expires_in ?? 0),
    };
  } catch {
    return { error: "RefreshAccessTokenError" };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "web",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "web-secret",
      issuer: process.env.KEYCLOAK_ISSUER ?? "http://localhost:8081/realms/exameo",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      const t = token as ExameoToken & Record<string, unknown>;

      if (account) {
        t.accessToken = account.access_token;
        t.refreshToken = account.refresh_token;
        t.expiresAt = account.expires_at;
      }

      const realmAccess = (profile as { realm_access?: { roles?: string[] } } | undefined)?.realm_access;
      if (realmAccess && Array.isArray(realmAccess.roles)) {
        t.roles = realmAccess.roles;
      }

      const stillValid = typeof t.expiresAt === "number" && Date.now() / 1000 < t.expiresAt - 30;
      if (stillValid) {
        return t;
      }

      if (t.refreshToken) {
        const refreshed = await refreshAccessToken({
          refreshToken: t.refreshToken,
          expiresAt: t.expiresAt,
        });
        return { ...t, ...refreshed };
      }

      return t;
    },
    async session({ session, token }) {
      const t = token as ExameoToken;
      const s = session as typeof session & {
        accessToken?: string;
        error?: string;
        user: typeof session.user & { roles?: string[] };
      };
      s.accessToken = t.accessToken;
      s.error = t.error;
      s.user.roles = t.roles ?? [];
      return s;
    },
  },
  pages: {
    signIn: "/login",
  },
});
