import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function extractTextFromBuffer(filename: string, buf: Buffer): Promise<string> {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) {
    const data = await pdf(buf);
    return data.text || "";
  }
  if (lower.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return value || "";
  }
  if (lower.endsWith(".txt")) {
    return buf.toString("utf-8");
  }
  throw new Error(`Unsupported file type: ${filename}`);
}
