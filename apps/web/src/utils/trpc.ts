import { isServer, QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "../../../server/src/routers";
import { toast } from "sonner";

function makeQueryClient() {
   return new QueryClient({
      queryCache: new QueryCache({
         // onError: (error) => {
         //    toast.error(error.message, {
         //       action: {
         //          label: "retry",
         //          onClick: () => {
         //             queryClient.invalidateQueries();
         //          },
         //       },
         //    });
         // },
      }),
      defaultOptions: {
         queries: {
            staleTime: 60 * 1000,
         },
      },
   });
}
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
   if (isServer) {
      // Server: always make a new query client
      return makeQueryClient();
   } else {
      // Browser: make a new query client if we don't already have one
      // This is very important, so we don't re-make a new client if React
      // suspends during the initial render. This may not be needed if we
      // have a suspense boundary BELOW the creation of the query client
      if (!browserQueryClient) browserQueryClient = makeQueryClient();
      return browserQueryClient;
   }
}
export type browserQueryClient = ReturnType<typeof getQueryClient>;
const trpcClient = createTRPCClient<AppRouter>({
   links: [
      httpBatchLink({
         url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trpc`,
         fetch(url, options) {
            return fetch(url, {
               ...options,
               credentials: "include",
            });
         },
      }),
   ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
   client: trpcClient,
   queryClient: getQueryClient,
});
