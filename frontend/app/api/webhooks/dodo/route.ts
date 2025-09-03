import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { addCredits, isProcessed, markProcessed } from "@/lib/server/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ detail: "DODO_WEBHOOK_SECRET not configured" }, { status: 500 });

  const raw = await req.text();
  const headers = Object.fromEntries((req.headers as any).entries?.() || []);

  try {
    const webhook = new Webhook(secret);
    webhook.verify(raw, {
      "webhook-id": headers["webhook-id"] || "",
      "webhook-signature": headers["webhook-signature"] || "",
      "webhook-timestamp": headers["webhook-timestamp"] || "",
    });
  } catch (e: any) {
    return NextResponse.json({ detail: "Invalid signature" }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    return NextResponse.json({ detail: "Invalid JSON payload" }, { status: 400 });
  }

  const event_id = payload.id || payload.event_id || "";
  const event_type = payload.type || payload.event || "";
  const data = payload.data || {};

  if (event_id && isProcessed(event_id)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const customer = data.customer || {};
  const email = (customer.email || data.email || "").trim();
  const plan_name = data.plan || data.product?.name || data.price?.name || data.line_item?.name || "";

  const creditsForPlan = (name: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("pro")) return 10;
    if (n.includes("free")) return 1;
    const amount = data.amount || data.price?.amount;
    if (["1500", "15", "15.00"].includes(String(amount))) return 10;
    return 0;
  };

  let granted = 0;
  try {
    if (["payment.completed", "checkout.completed"].includes(event_type)) {
      if (email) {
        granted = creditsForPlan(plan_name);
        if (granted > 0) addCredits(email, granted);
      }
    } else if (["subscription.activated", "subscription.renewed"].includes(event_type)) {
      if (email) {
        const base = creditsForPlan(plan_name);
        if (base > 0) addCredits(email, base);
      }
    }
  } finally {
    if (event_id) markProcessed(event_id);
  }

  console.log("[Dodo] Webhook received:", event_type, "plan=", plan_name, "email=", email, "granted=", granted);
  return NextResponse.json({ ok: true, granted });
}
