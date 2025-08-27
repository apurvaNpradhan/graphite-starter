// "use server";
import { trpcClient } from "@/utils/trpc";
import { authClient } from "./auth-client";
import { headers } from "next/headers";

const getServerSession = async () => {
   try {
      const res = await trpcClient.getSession.query();
      return {
         res,
      };
   } catch (err) {
      console.log("Error in getting session: ", err);

      return null;
   }
};

export default getServerSession;
