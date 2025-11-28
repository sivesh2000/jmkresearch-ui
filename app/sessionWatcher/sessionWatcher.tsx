"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function SessionWatcher() {
  const { status } = useSession({ required: false });
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (
      status === "unauthenticated" &&
      pathname !== "/auth/signin" &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      toast.error("Session expired please login again");
      router.replace("/auth/signin");
    }

    // Reset redirect flag when authenticated
    if (status === "authenticated") {
      hasRedirected.current = false;
    }
  }, [status, pathname, router]);

  return null;
}
