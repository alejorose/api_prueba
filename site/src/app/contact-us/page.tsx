import type { Metadata } from "next";
import { T, S, pages } from "@/lib/content";
import { ApiForm, type Field } from "@/components/ApiForm";

export const metadata: Metadata = { title: "Contact Us" };

export default function Contact() {
  const lines = pages["contact-us"].filter((b) => b.t === "a" || b.t === "p" || /^h/.test(b.t)).map((b) => b.x);
  const fields: Field[] = [
    { name: "firstName", label: T("First Name"), required: true, half: true },
    { name: "lastName", label: T("Last Name"), required: true, half: true },
    { name: "email", label: T("Your Email"), type: "email", required: true },
    { name: "message", label: T("Your Message"), type: "textarea", required: true },
  ];
  const contact = lines.filter((l) => /@|\d{3}-\d{3}-\d{4}/.test(l));
  return (
    <section className="wrap section">
      <div className="grid12">
        <div className="col-span-4 sm:col-span-6 lg:col-span-5">
          <p className="t-label text-accentink">{T("Let's chat")}</p>
          <h1 className="t-h1 mt-4">{T("Contact Us")}</h1>
          <p className="measure mt-6 text-ink2">{S("Imaging Insights & Equitable Health Care")}</p>
          <ul className="mt-8 space-y-2">{contact.map((c) => (<li key={c}>{c.includes("@") ? <a className="underline underline-offset-4" href={`mailto:${c}`}>{c}</a> : c}</li>))}</ul>
        </div>
        <div className="col-span-4 sm:col-span-6 lg:col-span-6 lg:col-start-7">
          <ApiForm endpoint="/api/form" form="contact" fields={fields} submit={"Submit"} ok={T("Thank you! Your submission has been received!")} err={T("Oops! Something went wrong while submitting the form.")} />
        </div>
      </div>
    </section>
  );
}
