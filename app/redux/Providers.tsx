"use client";

import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { store } from "./store";
import { memo } from "react";

const AppProviders = memo(function AppProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <Provider store={store}>
      <SessionProvider
        session={session}
        refetchInterval={5 * 60}
        refetchOnWindowFocus={true}
        refetchWhenOffline={false}
      >
        {children}
      </SessionProvider>
    </Provider>
  );
});

export { AppProviders };
