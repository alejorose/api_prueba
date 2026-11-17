import { NextResponse } from "next/server";

/** Form relay. It NEVER pretends to succeed: without FORM_ENDPOINT_<FORM> configured it returns 501.
 *  Original site posts the demo form to HubSpot (form GUID ebb552d3-…). Set the env var to a URL that accepts JSON. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ detail: "Invalid request." }, { status: 400 });
  if (body.website) return NextResponse.json({ ok: true }); // honeypot
  const form = String(body.form ?? "");
  const email = String(body.email ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ detail: "A valid email address is required." }, { status: 422 });
  const target = process.env[`FORM_ENDPOINT_${form.toUpperCase()}`];
  if (!target) return NextResponse.json({ detail: "This proposal build has no form backend connected yet (set FORM_ENDPOINT_" + form.toUpperCase() + ")." }, { status: 501 });
  const { website: _w, ...payload } = body; void _w;
  const r = await fetch(target, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
  if (!r || !r.ok) return NextResponse.json({ detail: "The form service rejected the submission." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
