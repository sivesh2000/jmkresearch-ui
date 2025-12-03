"use client";

import * as React from "react";
import { SignInPage } from "@toolpad/core/SignInPage";
import { providerMap } from "../../../auth";
import Link from "next/link";
import signIn from "./actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function ForgotPasswordLink() {
  return (
    <Link
      href="/auth/signin/forgot-password"
      style={{ textDecoration: "none", color: "#1976d2" }}
    >
      Forgot password?
    </Link>
  );
}

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  React.useEffect(() => {
    if (status === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      // const callbackUrl = "/";
      router.push(callbackUrl);
    }
  }, [status, searchParams, router]);

  return (
    <SignInPage
      providers={providerMap}
      signIn={signIn}
      slots={{
        forgotPasswordLink: ForgotPasswordLink,
      }}
      slotProps={{
        emailField: {
          variant: "standard", // Change input variant
          // size: "medium",      // Change input size
          defaultValue:"admin@jmkresearch.com"
        },
        passwordField: {
          variant: "standard", // Change input variant
          // size: "medium",      // Change input size
          defaultValue:"nyomxAdmin@10#"
        }
      }}
    />
  );
}
