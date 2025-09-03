import { NextResponse } from "next/server";
import { getModel, extractJson } from "@/lib/server/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const contract_text: string = body?.contract_text || "";
    if (!contract_text) {
      return NextResponse.json({ detail: "No contract text provided" }, { status: 400 });
    }

    const model = getModel();
    const prompt = `You are a legal AI assistant specializing in contract analysis.\nAlways return STRICT valid JSON with the exact schema below.\n\nAnalyze the following contract and provide a comprehensive analysis in JSON format.\n\nContract Text:\n${contract_text.slice(0, 12000)}\n\nReturn exactly this JSON structure:\n{\n  "summary": "Brief 3-4 bullet point summary (use - bullets separated by newlines)",\n  "key_clauses": [\n    {\n      "type": "Payment Terms",\n      "content": "extracted clause text",\n      "importance": "high|medium|low"\n    }\n  ],\n  "risks": [\n    {\n      "risk_type": "Financial Risk",\n      "description": "description of the risk",\n      "severity": "high|medium|low",\n      "clause_reference": "relevant clause"\n    }\n  ],\n  "risk_score": 0\n}\n\nNotes:\n- Focus on payment terms, deadlines, termination, liability/indemnity, IP, confidentiality, dispute resolution, force majeure.\n- risk_score is 0–100 (0 very safe, 100 very risky).`;

    const resp = await model.generateContent(prompt);
    const text = resp.response.text() || "{}";
    const parsed = extractJson(text);
    if (parsed) return NextResponse.json(parsed);

    return NextResponse.json({
      summary: "Contract analysis completed, but formatting error occurred.",
      key_clauses: [],
      risks: [{
        risk_type: "Analysis Error",
        description: "Could not parse AI response",
        severity: "low",
        clause_reference: "N/A"
      }],
      risk_score: 50,
    });
  } catch (e: any) {
    return NextResponse.json({ detail: `Analysis failed: ${e?.message || e}` }, { status: 500 });
  }
}
