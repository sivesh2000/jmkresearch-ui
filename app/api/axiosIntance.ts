import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "react-toastify";

const getBaseURL = () => {
  // For client-side requests, use the public URL

  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV === "production") {
      return (
        process.env.NEXT_PUBLIC_BASE_API_URL || "http://52.66.166.61:3000/v1/"
      );
    }

    return "http://52.66.166.61:3000/v1/";
  }

  // For server-side requests, use the private URL

  if (process.env.NODE_ENV === "production") {
    return process.env.BASE_API_URL || "http://172.31.15.172:3000/v1/";
  }

  return "http://172.31.15.172:3000/v1/";
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
});

let cachedSession: any = null;
let sessionExpiry: number = 0;

// ✅ Add request interceptor with session caching
axiosInstance.interceptors.request.use(
  async (config) => {
    // Only fetch session if expired or not cached
    if (!cachedSession || Date.now() > sessionExpiry) {
      const session = await getSession();
      if (session?.token) {
        cachedSession = session;
        // Use actual token expiry or fallback to 10 minutes for better performance
        sessionExpiry = Date.now() + 10 * 60 * 1000;
      }
    }

    if (cachedSession?.token) {
      config.headers["Authorization"] = `Bearer ${cachedSession.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
// ✅ Add response interceptor for 401 and message check
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message = error.response?.data?.message?.toLowerCase?.();
    if (error.response?.status === 401 || message === "please authenticate") {
      // Clear cached session on auth error
      cachedSession = null;
      sessionExpiry = 0;
      await signOut({
        callbackUrl: `/auth/signin?redirect=${encodeURIComponent(
          window.location.pathname
        )}`,
      });
      toast.error("Session expired please login again");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
