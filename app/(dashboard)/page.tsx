"use client";
import * as React from "react";
import Typography from "@mui/material/Typography";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        Welcome {session?.user?.name || "User"}!
      </Typography>
    </PageContainer>
  );
}
