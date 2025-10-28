"use client";

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@/server/api/root";

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: "/api/trpc",
    }),
  ],
});
