"use client";
import { useState } from "react";

export type Field = { name: string; label: string; type?: "text" | "email" | "textarea"; required?: boolean; placeholder?: string; half?: boolean };
type State = "idle" | "sending" | "ok" | "error";

export function ApiForm({ endpoint, form, fields, submit, ok, err }: { endpoint: string; form: string; fields: Field[]; submit: string; ok: string; err: string }) {
  const [state, setState] = useState<State>("idle");
  const [detail, setDetail] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ form, ...Object.fromEntries(fd) }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) setState("ok"); else { setDetail(j.detail ?? ""); setState("error"); }
    } catch { setDetail("Network error."); setState("error"); }
  }
  if (state === "ok") return <p role="status" className="rounded-md border border-line bg-surface p-8 t-h4">{ok}</p>;
  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate={false}>
      {fields.map((f) => (
        <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
          <label htmlFor={`f-${f.name}`} className="block text-[15px] font-medium">{f.label}{f.required && <span aria-hidden="true"> *</span>}</label>
          {f.type === "textarea" ? (
            <textarea id={`f-${f.name}`} name={f.name} rows={5} required={f.required} placeholder={f.placeholder} className="mt-2 w-full rounded-md border border-ink/30 bg-surface p-3" />
          ) : (
            <input id={`f-${f.name}`} name={f.name} type={f.type ?? "text"} required={f.required} placeholder={f.placeholder} autoComplete={f.name === "email" ? "email" : f.name === "firstName" ? "given-name" : f.name === "lastName" ? "family-name" : f.name === "company" ? "organization" : undefined} className="mt-2 h-12 w-full rounded-md border border-ink/30 bg-surface px-3" />
          )}
        </div>
      ))}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary" aria-busy={state === "sending"} disabled={state === "sending"}>{state === "sending" ? "Please wait..." : submit}</button>
      </div>
      {state === "error" && (
        <div role="alert" className="sm:col-span-2 rounded-md border border-accentink/40 bg-surface p-4">
          <p className="font-medium">{err}</p>
          {detail && <p className="mt-1 text-[15px] text-ink2">{detail}</p>}
        </div>
      )}
    </form>
  );
}
