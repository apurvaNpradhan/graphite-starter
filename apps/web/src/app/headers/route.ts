// app/api/headers/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
   const headersList = headers();
   return NextResponse.json(headersList);
}
