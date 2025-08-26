import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { authClient } from "./lib/auth-client";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
   const session = await authClient.getSession({
      fetchOptions: {
         headers: await headers(),
      },
   });

   if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
   }

   return NextResponse.next();
}
export const config = {
   matcher: ["/dashboard"], // Specify the routes the middleware applies to
   runtime: "nodejs",
};
