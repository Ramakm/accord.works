import { NextResponse } from "next/server";
import { getModel } from "@/lib/server/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question: string = body?.question || "";
    const contract_text: string = body?.contract_text || "";

    const user = `Answer the question using ONLY the contract text.\nIf the answer is not present, say "The contract does not specify." Do not invent facts.\n\nQuestion: ${question}\n\nContract Text:\n${contract_text.slice(0, 12000)}`;

    const model = getModel();
    const resp = await model.generateContent(user);
    const text = resp.response.text() || "";
    return NextResponse.json({ question, answer: text });
  } catch (e: any) {
    return NextResponse.json({ detail: `Question answering failed: ${e?.message || e}` }, { status: 500 });
  }
}
