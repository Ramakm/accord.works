import { NextResponse } from "next/server";
import { getModel, extractJson } from "@/lib/server/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const contract_text: string = body?.contract_text || "";
    const tone: string = body?.tone || "professional";
    const issues: string[] | undefined = body?.issues;

    const toneMap: Record<string, string> = {
      professional: "Use a professional, respectful tone.",
      assertive: "Use a confident, assertive tone while remaining respectful.",
      collaborative: "Use a collaborative, partnership-focused tone.",
      friendly: "Use a friendly and warm but still professional tone.",
      concise: "Be concise and to-the-point while remaining polite.",
    };

    const issuesText = issues?.length ? `Specific issues to address: ${issues.join(", ")}` : "";

    const user = `Based on this contract, draft a negotiation email.\n\nContract excerpt:\n${contract_text.slice(0, 4000)}\n\n${issuesText}\nTone: ${toneMap[tone] || toneMap.professional}\n\nReturn JSON with keys subject and body only.`;

    const model = getModel();
    const resp = await model.generateContent(user);
    const text = resp.response.text() || "{}";
    const parsed = extractJson(text);
    if (parsed) return NextResponse.json({ ...parsed, tone });

    return NextResponse.json({
      subject: `Contract Review and Discussion - ${tone.charAt(0).toUpperCase() + tone.slice(1)} Approach`,
      body: `I've reviewed the contract and would like to discuss some key points. Error in AI generation` ,
      tone,
    });
  } catch (e: any) {
    return NextResponse.json({ detail: `Email generation failed: ${e?.message || e}` }, { status: 500 });
  }
}
