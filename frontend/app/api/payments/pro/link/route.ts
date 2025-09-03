import { NextResponse } from "next/server";

function buildStaticCheckoutLink(productId: string, params: Record<string, any>): string {
  const base = (process.env.DODO_CHECKOUT_BASE || "https://checkout.dodopayments.com/buy").replace(/\/$/, "");
  const pid = (productId || "").trim();
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v) !== "") qs.set(k, String(v));
  }
  const query = qs.toString();
  return `${base}/${pid}` + (query ? `?${query}` : "");
}

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const productId = process.env.DODO_PRO_PRODUCT_ID;
  if (!productId) return NextResponse.json({ detail: "DODO_PRO_PRODUCT_ID not configured" }, { status: 500 });

  let redirect_url = url.searchParams.get("redirect_url") || process.env.DODO_RETURN_URL || undefined;
  if (!redirect_url) return NextResponse.json({ detail: "redirect_url is required but not provided" }, { status: 500 });

  const params = {
    quantity: Number(url.searchParams.get("quantity") || 1),
    redirect_url,
    email: url.searchParams.get("email") || undefined,
    firstName: url.searchParams.get("firstName") || undefined,
    lastName: url.searchParams.get("lastName") || undefined,
    disableEmail: url.searchParams.get("disableEmail") || undefined,
    disableFirstName: url.searchParams.get("disableFirstName") || undefined,
    disableLastName: url.searchParams.get("disableLastName") || undefined,
    showDiscounts: url.searchParams.get("showDiscounts") || undefined,
  } as Record<string, any>;

  const link = buildStaticCheckoutLink(productId, params);
  return NextResponse.json({ paymentLink: link });
}
