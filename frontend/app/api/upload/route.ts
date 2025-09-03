import { NextResponse } from "next/server";
import { extractTextFromBuffer } from "@/lib/server/extract";
import { getModel, extractJson } from "@/lib/server/ai";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ detail: "No file provided" }, { status: 400 });

    const filename = (file as any).name || "upload";
    const ext = filename?.split(".").pop()?.toLowerCase() || "";
    const allowed = ["pdf", "docx", "txt"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ detail: `Unsupported file type. Allowed: .pdf, .docx, .txt` }, { status: 400 });
    }

    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);
    const saved_as = `${uuidv4()}.${ext}`; // virtual name only

    const extracted_text = await extractTextFromBuffer(filename, buf);

    let analysis: any;
    try {
      const model = getModel();
      const prompt = `You are a legal AI assistant specializing in contract analysis.\nAlways return STRICT valid JSON with the exact schema below.\n\nAnalyze the following contract and provide a comprehensive analysis in JSON format.\n\nContract Text:\n${extracted_text.slice(0, 12000)}\n\nReturn exactly this JSON structure:\n{\n  "summary": "Brief 3-4 bullet point summary (use - bullets separated by newlines)",\n  "key_clauses": [\n    {\n      "type": "Payment Terms",\n      "content": "extracted clause text",\n      "importance": "high|medium|low"\n    }\n  ],\n  "risks": [\n    {\n      "risk_type": "Financial Risk",\n      "description": "description of the risk",\n      "severity": "high|medium|low",\n      "clause_reference": "relevant clause"\n    }\n  ],\n  "risk_score": 0\n}`;
      const resp = await model.generateContent(prompt);
      const text = resp.response.text() || "{}";
      analysis = extractJson(text) || {
        summary: "Contract analysis completed, but formatting error occurred.",
        key_clauses: [],
        risks: [],
        risk_score: 50,
      };
    } catch (e: any) {
      analysis = {
        summary: `AI analysis failed: ${e?.message || e}`,
        key_clauses: [],
        risks: [],
        risk_score: 50,
      };
    }

    return NextResponse.json({
      message: "Contract uploaded and analyzed successfully",
      filename,
      saved_as,
      size: buf.length,
      extracted_text: extracted_text.length > 1000 ? extracted_text.slice(0, 1000) + "..." : extracted_text,
      analysis,
    });
  } catch (e: any) {
    return NextResponse.json({ detail: `Error processing file: ${e?.message || e}` }, { status: 500 });
  }
}
