import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";
import type { Provider } from "next-auth/providers";

declare module "next-auth" {
  interface User {
    id?: string; // <-- Add this
    token?: string;
    refreshToken?: string;
    mainDealerRefId?: string; // <-- Add this
    userType?: string; // <-- Add this
    tokenExpires?: number; // <-- Add this
    backendUser?: any; // <-- Add this to fix the error
  }
  interface Session {
    user?: {
      id?: string; // <-- Add this
      name?: string | null;
      email?: string | null;
      userType?: string; // <-- Add this
      backendUser?: any; // <-- Add this to fix the error
      mainDealerRef?: any; // <-- Add this to fix the error
      isInvoiceEnabled?: boolean; // <-- Add this
      isCombo?: boolean; // <-- Add this
    };
    token?: string;
    refreshToken?: string;
    mainDealerRefId?: string; // <-- Add this
    userType?: string; // <-- Add this
    userData?: any; // <-- Add this to fix the error
  }
}

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email Address", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      try {
        const response = await axios.post(
          process.env.BASE_API_URL + "auth/login",
          {
            email: credentials?.email,
            password: credentials?.password,
          },
          {
            timeout: 10000, // 10 second timeout
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = response.data;
        console.log("logged user data:", data);
        if (response.status !== 200 || !data.user) {
          return null;
        }

        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          token: data.tokens?.access?.token,
          refreshToken: data.tokens?.refresh?.token,
          mainDealerRefId: data.user?.mainDealerRef?.id,
          userType: data.user.userType,
          tokenExpires: new Date(data.tokens?.access?.expires).getTime(),
          backendUser: data.user, // <-- Add this line
        };
      } catch (error: any) {
        console.error("Login error details:", {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
        });
        return null;
      }
    },
  }),
];

async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await axios.post(
      process.env.BASE_API_URL + "auth/refresh-tokens",
      {
        refreshToken,
      }
    );

    const data = response.data;
    return {
      token: data.tokens.access.token,
      refreshToken: data.tokens.refresh.token,
      tokenExpires: new Date(data.tokens.access.expires).getTime(),
    };
  } catch (error) {
    return null;
  }
}

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  }
  return { id: provider.id, name: provider.name };
});

// auth.ts - Updated to completely exclude permissions from JWT
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = user.token;
        token.refreshToken = user.refreshToken;
        token.mainDealerRefId = user.mainDealerRefId;
        token.userType = user.userType;
        token.tokenExpires = user.tokenExpires;

        // **FIX: Extract permissions and exclude from JWT token**
        const { permissions, ...userWithoutPermissions } = user.backendUser;
        token.userData = userWithoutPermissions; // Don't store permissions in JWT
      }

      const tokenExpires = token.tokenExpires as number;
      if (tokenExpires && Date.now() < tokenExpires) {
        return token;
      }

      if (token.refreshToken) {
        const refreshedTokens = await refreshAccessToken(
          token.refreshToken as string
        );
        if (refreshedTokens) {
          token.token = refreshedTokens.token;
          token.refreshToken = refreshedTokens.refreshToken;
          token.tokenExpires = refreshedTokens.tokenExpires;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.token && typeof token.token === "string") {
        session.token = token.token;
        session.refreshToken = token.refreshToken as string;
        session.mainDealerRefId = token.mainDealerRefId as string;
        session.userType = token.userType as string;

        const userData = token.userData as any;

        // **FIX: Only store user data without permissions**
        session.user = {
          ...session.user,
          id: userData?.id,
          name: userData?.name,
          email: userData?.email,
          userType: userData?.userType,
          mainDealerRef: userData?.mainDealerRef,
          isInvoiceEnabled: userData?.isInvoiceEnabled,
          isCombo: userData?.isCombo,
          // **No permissions stored in session**
        };
      }
      return session;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isPublicPage = nextUrl.pathname.startsWith("/public");
      if (isPublicPage || isLoggedIn) {
        return true;
      }
      return false;
    },
  },
});
