import Image from "next/image";
import Link from "next/link";
import { S, SC, T, asset, imgSize } from "@/lib/content";
import { ImagingExplorer, type Mode } from "@/components/ImagingExplorer";
import { Workflow, type Step } from "@/components/Workflow";
import { Testimonials } from "@/components/Testimonials";

const dim = (p: string) => { const [w, h] = imgSize(p) ?? [1200, 800]; return { w, h }; };

export default function Home() {
  const device = asset("Cutout_Two_Sides");
  const portal = asset("Laptop_and_Device_1_-_2026_UI");
  const iso = asset("iso_orange");
  const photoA = asset("IMG_7178"), photoB = asset("IMG_7386");

  /* ── Imaging explorer: labels are the four modalities named in the original sentence ── */
  const sentence = S("Capture tissue oximetry, temperature, wound measurement");
  const crops: Mode[] = [
    { id: "oxi", label: "Tissue oximetry", crop: { x: 56, y: 29, z: 3 }, official: true, alt: "Detail of the MIMOSA Pro web portal showing images labelled Oximetry Image." },
    { id: "temp", label: "Temperature", crop: { x: 56, y: 45, z: 3 }, official: true, alt: "Detail of the MIMOSA Pro web portal showing images labelled Thermal Image." },
    { id: "wound", label: "Wound measurement", official: false, alt: "The MIMOSA Pro device next to a laptop showing the web portal." },
    { id: "hdr", label: "HDR digital image", official: false, alt: "The MIMOSA Pro device next to a laptop showing the web portal." },
  ];
  crops.forEach((m) => { if (!sentence.toLowerCase().includes(m.label.toLowerCase())) throw new Error("mode label not in source sentence: " + m.label); });

  const steps: Step[] = [
    { n: 1, title: `${S("Step 1:")} ${S("Connect the MIMOSA Pro App")}`, body: S("Open the App up on your MIMOSA Pro device"), img: asset("Step_1.webp"), ...dim(asset("Step_1.webp")) },
    { n: 2, title: `${S("Step 2:")} ${S("Capture patient image")}`, body: S("You now have the option to take images of yourself"), img: asset("step_2.webp"), ...dim(asset("step_2.webp")) },
    { n: 3, title: `${S("Step 3:")} ${S("Immediately review those images")}`, body: S("Review patient images immediately on our app"), img: asset("Review_Image"), ...dim(asset("Review_Image")) },
    { n: 4, title: `${S("Step 4:")} ${S("Submit for reimbursement")}`, body: S("Submit your images for reimbursement"), img: asset("step_4.webp"), ...dim(asset("step_4.webp")) },
  ];

  const q = (prefix: string, name: string) => ({ text: S(prefix), name: T(name), role: "" });
  const quotes = [
    { text: S("“The MIMOSA Pro offers real-time"), name: T("Dr. Matthew Regulski"), role: T("Medical Director - The Wound Institute of Ocean County") },
    { text: S('"Having a portable device'), name: T("Keith Harding"), role: T("Senior Clinical Research Director, A*STAR Singapore") },
    { text: S('"MIMOSA will revolutionize'), name: T("Nat Rave"), role: T("Chiropodist (Acute Care & Private Practice), Toronto") },
    { text: S('"Multispectral and hyperspectral'), name: T("David Armstrong"), role: T("Professor of Surgery, Keck School of Medicine, USC, California, USA") },
  ];
  void q;

  const uses = [
    { name: "Wound Care", href: "/uses/wound-care", body: SC("Most patients with diabetic foot ulcers (DFUs) and poorly healing") },
    { name: "Post-Op", href: "/uses/post-op", body: SC("Assessing tissue health status can help eliminate flap failures") },
    { name: "Peripheral Vascular Disease", href: "/uses/peripheral-vascular-disease", body: SC("Diabetes and Peripheral Vascular Disease (PVD) continue to be a growing epidemic globally, universally") },
    { name: "Burns", href: "/uses/burns", body: SC("Surgical burn treatment depends on accurate estimation of burn depth") },
    { name: "Pediatrics", href: "/uses/paediatrics", body: SC("Low cardiac output syndrome (LCOS)") },
  ].map((u) => ({ ...u, name: T(u.name) }));

  const settings = [
    { kicker: "Group Practices", name: "Group Practices", title: S("Expertise at your fingertips"), body: SC("Obtain expert wound assessment"), href: "/care-settings/group-practices-clinics" },
    { kicker: "Hospitals", name: "Hospitals", title: S("Bedside Tissue Assessment"), body: SC("Bedside tissue assessment in all corners of the hospital"), href: "/care-settings/hospitals" },
    { kicker: "REMOTE Care", name: "Home Care", title: S("Remote Tissue Assessment"), body: SC("Provide expert tissue health assessment"), href: "/care-settings/home-care" },
    { kicker: "EMERGENCY SETTINGS", name: "In the Field", title: S("Risk Triaging"), body: SC("Bedside tissue assessment in all corners of the world"), href: "/care-settings/in-the-field" },
  ];

  const features = [
    { h: T("Multispectral Imaging"), p: SC("MIMOSA Pro detects tissue oximetry & temperature") },
    { h: T("Incredible Insights"), p: SC("MIMOSA Pro provides remote monitoring") },
    { h: T("Seeing Under the Skin"), p: SC("MIMOSA Pro can see things that humans can’t") },
    { h: T("Remote Web Portal"), p: SC("Our secure cloud-based platform enables communication") },
  ];

  const papers = [
    { t: S("State-of-the-Art Review of Current Technology in Pressure Injury"), h: "https://journals.lww.com/aswcjournal/fulltext/9900/state_of_the_art_review_of_current_technology_in.127.aspx" },
    { t: S("Advancing Chronic Wound Care With Near-Infrared Spectroscopy Imaging"), h: "https://www.hmpgloballearningnetwork.com/site/wounds/literature-review/advancing-chronic-wound-care-near-infrared-spectroscopy-imaging" },
    { t: S("Efficacy of minimally invasive vascular interventions"), h: "https://www.sciencedirect.com/science/article/pii/S2949912725000339" },
    { t: S("Diabetes Watch - The Role of Near-Infrared Spectroscopy"), h: "https://www.hmpgloballearningnetwork.com/site/podiatry/role-near-infrared-spectroscopy-nirs-treating-hard-heal-dfus" },
  ];

  const resources = [
    { name: "MIMOSA Community / Our Blog & Latest News", body: SC("Read about the amazing physicians"), href: "/blog" },
    { name: "MIMOSA Learning+ / In the Press", body: SC("Read about how our disruptive tech"), href: "/resources/in-the-press" },
    { name: "Ask The Experts...", body: SC("Support materials published in peer-reviewed journals and publications."), href: "/resources/ask-the-experts" },
    { name: "Publications", body: SC("Support materials published in peer-reviewed journals and publications."), href: "/resources/publications" },
    { name: "Case Studies", body: SC("Individual case studies supporting the use of MIMOSA Pro"), href: "/resources/case-studies" },
    { name: "Posters & Infographics", body: SC("Poster presentations and infographics supporting"), href: "/resources/posters" },
    { name: "Video & Audio Media", body: SC("Interactive media, such as WEBINARS"), href: "/resources/video-audio-media" },
    { name: "E-Books & Whitepapers", body: SC("Explore our e-book and white paper publications."), href: "/resources/e-books" },
    { name: "Reimbursement Resources", body: SC("Explore options for reimbursement using MIMOSA Pro."), href: "/resources/reimbursement" },
  ];

  return (
    <>
      {/* 1 — HERO: visible */}
      <section className="relative overflow-hidden">
        <div className="wrap grid12 items-center pt-10 pb-16 lg:pt-20 lg:pb-24">
          <div className="col-span-4 sm:col-span-6 lg:col-span-7">
            <h1 className="t-display reveal">
              {T("Making the invisible")}
              <br />
              <span className="text-accentink">{T("visible")}</span>
            </h1>
            <p className="t-h3 mt-8 max-w-[22ch] !font-normal text-ink">{T("Tissue imaging insights in the palm of your hand!")}</p>
            <p className="measure mt-6 text-ink2">{S("Discover MIMOSA's proactive tissue intelligence platform")}</p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/demo" className="btn btn-primary">{T("Demo Our Pocket-sized Imaging Device")}</Link>
              <Image src={iso} alt="ISO 13485:2016 Quality Certified" width={dim(iso).w} height={dim(iso).h} className="h-14 w-auto" />
            </div>
          </div>
          <div className="col-span-4 mt-12 sm:col-span-6 lg:col-span-5 lg:mt-0">
            <Image src={device} alt="MIMOSA Pro Device" width={dim(device).w} height={dim(device).h} priority fetchPriority="high" sizes="(min-width:1024px) 40vw, 70vw" className="mx-auto h-auto w-full max-w-[560px]" />
          </div>
        </div>
        <div className="spectrum-rule" aria-hidden="true" />
      </section>

      {/* 2 — INVISIBLE: the problem, on the dark "near-infrared" field */}
      <section className="on-dark bg-navy text-white">
        <div className="wrap section grid12 items-center">
          <div className="col-span-4 sm:col-span-6 lg:col-span-6">
            <p className="t-h2 !font-normal">{S("Traditional healthcare imaging has become inaccessible")}</p>
            <Link href="/demo" className="btn btn-primary mt-10">{T("Get a Demo")}</Link>
          </div>
          <div className="col-span-4 sm:col-span-6 lg:col-span-6">
            <Image src={portal} alt="MIMOSA Pro Web Portal displaying images" width={dim(portal).w} height={dim(portal).h} sizes="(min-width:1024px) 50vw, 100vw" className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* 3 — INTRO + applications */}
      <section className="wrap section">
        <div className="grid12">
          <div className="col-span-4 sm:col-span-6 lg:col-span-5">
            <p className="t-label text-accentink">{T("Introducing MIMOSA Pro")}</p>
            <h2 className="t-h2 mt-4">{T("Imaging insights at your fingertips")}</h2>
          </div>
          <div className="col-span-4 sm:col-span-6 lg:col-span-6 lg:col-start-7">
            <p className="text-[1.15em] leading-relaxed">{S("MIMOSA Pro is a pocket-sized imaging device")}</p>
          </div>
        </div>
        <div className="mt-20">
          <h2 className="t-label text-ink2">{T("Uses & Applications")}</h2>
          <p className="mt-2 text-ink2">{T("Applications in:")}</p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {uses.map((u) => (
              <li key={u.name}>
                <Link href={u.href} className="group grid12 items-start py-8 hover:bg-surface">
                  <span className="t-h3 col-span-4 sm:col-span-6 lg:col-span-4">{u.name}</span>
                  <span className="col-span-4 text-ink2 sm:col-span-6 lg:col-span-7">{u.body}</span>
                  <span aria-hidden="true" className="hidden text-2xl transition-transform group-hover:translate-x-1 lg:block">→</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/uses/much-more" className="grid12 items-center py-8 hover:bg-surface">
                <span className="t-h3 col-span-4 sm:col-span-6 lg:col-span-4">{T("+ More")}</span>
                <span className="col-span-4 text-ink2 sm:col-span-6 lg:col-span-7">{SC("Applications for MIMOSA Pro are growing")}</span>
              </Link>
            </li>
          </ul>
          <p className="mt-6"><Link href="/reimbursement" className="btn btn-dark">{T("Reimbursement Info")}</Link></p>
        </div>
      </section>

      {/* 4 — VISIBLE / INVISIBLE: imaging explorer */}
      <section className="border-y border-line bg-surface">
        <div className="wrap section">
          <ImagingExplorer src={portal} w={dim(portal).w} h={dim(portal).h} heading={T("4 INSIGHTS in 1 CAPTURE")} sentence={sentence} intro={S("MIMOSA Pro captures tissue oximetry and temperature leveraging")} modes={crops} />
        </div>
      </section>

      {/* 5 — Science + features */}
      <section className="wrap section">
        <p className="t-label text-accentink">{T("The Science Behind It...")}</p>
        <div className="grid12 mt-8 items-start">
          <div className="col-span-4 sm:col-span-6 lg:col-span-5">
            <h2 className="t-h2">{T("Reflectance-Based Tech")}</h2>
            <p className="measure mt-6 text-ink2">{SC("MIMOSA Pro is a non-contact near-infrared (NIR), reflectance-based technology which determines")}</p>
          </div>
          <div className="col-span-4 sm:col-span-6 lg:col-span-5 lg:col-start-8">
            <h3 className="t-h3">{T("12ft-Tall Machines Transformed into the Palm of Your Hand...")}</h3>
            <p className="measure mt-6 text-ink2">{SC("While this imaging tech isn't entirely new")}</p>
            <p className="mt-8"><Link href="/mimosa-pro" className="btn btn-dark">{T("Learn More")}</Link></p>
          </div>
        </div>
        <div className="mt-24">
          <h2 className="t-label text-ink2">{T("Features & Functionality")}</h2>
          <p className="measure mt-2 text-ink2">{SC("Learn more about our handheld imaging device")}</p>
          <dl className="mt-6 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div key={f.h} className="bg-surface p-8">
                <span className="t-label text-accentink" aria-hidden="true">0{i + 1}</span>
                <dt className="t-h4 mt-3">{f.h}</dt>
                <dd className="mt-3 text-[15px] text-ink2">{f.p}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 6 — photography band */}
      <section aria-label="MIMOSA Pro in clinical use" className="wrap pb-16">
        <div className="grid12 items-end">
          <Image src={photoA} alt="A clinician showing a patient an image on the MIMOSA Pro device" width={dim(photoA).w} height={dim(photoA).h} sizes="(min-width:1024px) 30vw, 90vw" className="col-span-4 h-[480px] w-full rounded-md object-cover sm:col-span-3 lg:col-span-4" />
          <Image src={photoB} alt="A clinician and patient during a MIMOSA Pro assessment" width={dim(photoB).w} height={dim(photoB).h} sizes="(min-width:1024px) 60vw, 90vw" className="col-span-4 h-[480px] w-full rounded-md object-cover sm:col-span-3 lg:col-span-8" />
        </div>
      </section>

      {/* 7 — testimonials */}
      <section className="wrap pb-24">
        <Testimonials quotes={quotes} />
      </section>

      {/* 8 — workflow */}
      <section className="on-dark bg-navy text-white">
        <div className="wrap section">
          <Workflow heading={T("How it works in 4 easy steps...")} eyebrow={T("Your New Powerhouse Workflow:")} steps={steps} />
        </div>
      </section>

      {/* 9 — care settings */}
      <section className="wrap section">
        <h2 className="t-label text-ink2">{T("Care Settings")}</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {settings.map((s) => (
            <li key={s.href} className="rounded-md border border-line bg-surface p-8">
              <p className="t-label text-accentink">{T(s.kicker)}</p>
              <h3 className="t-h3 mt-3"><span className="text-ink2">{T(s.name)}</span> {s.title}</h3>
              <p className="mt-4 text-ink2">{s.body}</p>
              <Link href={s.href} className="btn btn-ghost mt-8">{T("LEARN MORE")}<span className="sr-only"> about {s.name}</span></Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 10 — evidence + resources + experts */}
      <section className="border-t border-line bg-surface">
        <div className="wrap section">
          <h2 className="t-h2">{T("THE OUTCOMES speak for themselves...")}</h2>
          <ul className="mt-12 divide-y divide-line border-y border-line">
            {papers.map((p) => (
              <li key={p.h}><a href={p.h} className="group flex items-center justify-between gap-6 py-6 hover:text-accentink"><span className="t-h4 !font-medium">{p.t}</span><span aria-hidden="true">↗</span></a></li>
            ))}
          </ul>
          <p className="mt-6"><Link href="/resources/publications" className="btn btn-dark">{T("Publications")}</Link></p>

          <div className="mt-24 grid12">
            <h2 className="t-label col-span-4 text-ink2 sm:col-span-6 lg:col-span-12">{T("Resources")}</h2>
            <ul className="col-span-4 grid gap-6 sm:col-span-6 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-3">
              {resources.map((r) => (
                <li key={r.href + r.name}><Link href={r.href} className="block h-full rounded-md border border-line bg-canvas p-6 hover:border-ink"><span className="t-h4">{r.name}</span><span className="mt-3 block text-[15px] text-ink2">{r.body}</span></Link></li>
              ))}
            </ul>
          </div>

          <div className="mt-24">
            <h2 className="t-label text-ink2">{T("Ask An Expert...")}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Link href="/resources/ask-the-experts" className="rounded-md border border-line bg-canvas p-8 hover:border-ink"><span className="t-label text-accentink">{T("DR DAVID ARMSTRONG")}</span><span className="t-h3 mt-3 block">{T("Why is vascular assessment important in the management of the diabetic foot?")}</span><span className="mt-6 block font-semibold underline underline-offset-4">{T("Read the answer")}</span></Link>
              <Link href="/resources/ask-the-experts" className="rounded-md border border-line bg-canvas p-8 hover:border-ink"><span className="t-label text-accentink">{T("Dr. Karen Cross")}</span><span className="t-h3 mt-3 block">{T("As a surgeon why is a convenient way to measure tissue perfusion important to clinicians?")}</span><span className="mt-6 block font-semibold underline underline-offset-4">{T("Read the answer")}</span></Link>
            </div>
            <p className="mt-6"><Link href="/resources/ask-the-experts" className="underline underline-offset-4">{T("see our full panel of experts...")}</Link></p>
          </div>
        </div>
      </section>

      {/* 11 — closing CTA */}
      <section className="on-dark bg-navy text-white">
        <div className="wrap section grid12 items-center">
          <div className="col-span-4 sm:col-span-6 lg:col-span-8">
            <h2 className="t-h1">{T("Prioritize Your Patients. Bring Efficiency Back To Your Practice.")}</h2>
            <p className="measure mt-6 text-white/80">{S("This pocket-sized device can be used by any healthcare professional")}</p>
          </div>
          <div className="col-span-4 sm:col-span-6 lg:col-span-4 lg:justify-self-end"><Link href="/demo" className="btn btn-primary">{T("Schedule a Demo")}</Link></div>
        </div>
      </section>

      {/* 12 — about hub */}
      <section className="wrap section">
        <h2 className="t-label text-ink2">{T("About Us")}</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Our Organization", SC("Learn about our organization and vision"), "/about-us"],
            ["The Team", SC("Meet the Team Behind MIMOSA"), "/meet-the-team"],
            ["Careers", SC("Day dream about becoming a superhero?"), "/careers"],
            ["For Investors", SC("Learn more about MIMOSA, our growth, and our future!"), "/for-investors"],
          ].map(([n, b, h]) => (
            <li key={h}><Link href={h} className="block h-full rounded-md border border-line bg-surface p-6 hover:border-ink"><span className="t-h4">{T(n)}</span><span className="mt-3 block text-[15px] text-ink2">{b}</span></Link></li>
          ))}
        </ul>
        <p className="mt-10"><Link href="/contact-us" className="btn btn-dark">{T("Contact Us")}</Link> <span className="ml-3 text-ink2">{T("Do you have any questions? Let's Chat!")}</span></p>
      </section>
    </>
  );
}
