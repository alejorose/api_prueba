import Image from "next/image";
export type Step = { n: number; title: string; body: string; img: string; w: number; h: number };
export function Workflow({ eyebrow, heading, steps }: { eyebrow: string; heading: string; steps: Step[] }) {
  return (
    <div>
      <p className="t-label text-nir">{heading}</p>
      <h2 className="t-h2 mt-4 max-w-[20ch]">{eyebrow}</h2>
      <ol className="mt-16 space-y-20 lg:space-y-28">
        {steps.map((s, i) => (
          <li key={s.n} className="grid12 items-center">
            <div className={`col-span-4 sm:col-span-6 lg:col-span-5 ${i % 2 ? "lg:order-2 lg:col-start-8" : "lg:col-start-1"}`}>
              <span className="t-label text-nir" aria-hidden="true">0{s.n}</span>
              <h3 className="t-h3 mt-3">{s.title}</h3>
              <p className="mt-5 max-w-[56ch] text-white/80">{s.body}</p>
            </div>
            <div className={`col-span-4 sm:col-span-6 lg:col-span-5 ${i % 2 ? "lg:order-1 lg:col-start-2" : "lg:col-start-8"}`}>
              <Image src={s.img} alt="" width={s.w} height={s.h} sizes="(min-width:1024px) 40vw, 90vw" className="mx-auto max-h-[70vh] w-auto rounded-md object-cover" />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
