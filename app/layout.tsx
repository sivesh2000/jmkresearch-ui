import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./global.css";
import { auth } from "../auth";
import theme from "../theme";
import { AppProviders } from "./redux/Providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OptimizedLayout from "./components/OptimizedLayout";
import { Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";
export const metadata = {
  title: "Nyom",
  description: "",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" data-toolpad-color-scheme="light" suppressHydrationWarning>
      <body>
        <AppProviders session={session}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <OptimizedLayout session={session} theme={theme}>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover
                limit={3}
              />
              <Suspense
                fallback={
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="200px"
                  >
                    <CircularProgress />
                  </Box>
                }
              >
                {props.children}
              </Suspense>
            </OptimizedLayout>
          </AppRouterCacheProvider>
        </AppProviders>
      </body>
    </html>
  );
}
