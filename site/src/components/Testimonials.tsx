export type Quote = { text: string; name: string; role: string };
export function Testimonials({ quotes }: { quotes: Quote[] }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
      {quotes.map((q) => (
        <li key={q.name} className="bg-surface p-8 lg:p-12">
          <figure>
            <blockquote className="t-h4 !font-normal leading-snug">{q.text}</blockquote>
            <figcaption className="mt-8 border-t border-line pt-4 text-[15px]"><span className="font-semibold">{q.name}</span><br /><span className="text-ink2">{q.role}</span></figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
