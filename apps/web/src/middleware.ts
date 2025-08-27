import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
   const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
      headers: {
         cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
      },
   });

   if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
   }

   return NextResponse.next();
}

export const config = {
   matcher: ["/", "/dashboard/:path*"],
};
