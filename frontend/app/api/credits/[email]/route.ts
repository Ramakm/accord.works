import { NextResponse } from "next/server";
import { getCredits } from "@/lib/server/store";

export const runtime = "nodejs";

export async function GET(_req: Request, context: { params: { email: string } }) {
  const email = decodeURIComponent(context.params.email || "");
  const credits = getCredits(email);
  return NextResponse.json({ email: email.toLowerCase(), credits });
}
