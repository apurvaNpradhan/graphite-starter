import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary, QueryClient, useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import HealthCheck from "@/components/healh-check";
export default async function Home() {
   const queryClient = new QueryClient();
   const session = await authClient.getSession({
      fetchOptions: {
         headers: await headers(),
      },
   });
   await Promise.all([
      queryClient.prefetchQuery(trpc.healthCheck.queryOptions()),
      queryClient.prefetchQuery(trpc.listUsers.queryOptions()),
   ]);

   if (!session) {
      redirect("/sign-in");
   }

   return (
      <div className="container mx-auto max-w-3xl px-4 py-2">
         <div className="grid gap-6">
            <HydrationBoundary state={dehydrate(queryClient)}>
               <HealthCheck />
            </HydrationBoundary>
         </div>
      </div>
   );
}
