import type { Metadata } from "next";
import { T } from "@/lib/content";
import { ApiForm, type Field } from "@/components/ApiForm";

export const metadata: Metadata = { title: "Schedule a Demo" };

export default function Demo() {
  const fields: Field[] = [
    { name: "email", label: T("Email"), type: "email", required: true },
    { name: "firstName", label: T("First name"), required: true, half: true },
    { name: "lastName", label: T("Last name"), required: true, half: true },
    { name: "company", label: T("Company name") },
    { name: "role", label: T("I am a:"), placeholder: "I am a: Physician, Wound Care Specialist, Health Care Admin..." /* source: input placeholder attribute */ },
    { name: "questions", label: T("Do you have any specific questions you'd like to address in your demo?"), type: "textarea" },
  ];
  return (
    <section className="wrap section">
      <div className="grid12">
        <div className="col-span-4 sm:col-span-6 lg:col-span-5">
          <p className="t-label text-accentink">{T("See How It Works")}</p>
          <h1 className="t-h1 mt-4">{T("Schedule a Demo")}</h1>
          <p className="measure mt-6 text-ink2">{T("Please use this form to schedule a demo of MIMOSA Pro.")}</p>
        </div>
        <div className="col-span-4 sm:col-span-6 lg:col-span-6 lg:col-start-7">
          <ApiForm endpoint="/api/form" form="demo" fields={fields} submit={T("Submit")} ok={T("Thank you! Your demo request has been received!")} err={T("Oops! Something went wrong while submitting the form.")} />
        </div>
      </div>
    </section>
  );
}
