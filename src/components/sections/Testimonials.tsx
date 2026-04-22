import { Quote } from "lucide-react";

const quotes = [
  {
    q: "Softgenix shipped a product that genuinely felt like Apple-level polish. Conversion is up 3.2x since launch.",
    a: "Priya Menon",
    r: "Founder, Lumen Finance",
  },
  {
    q: "They became an extension of our team in a week. Direct WhatsApp access with the founders is a game changer.",
    a: "Daniel Park",
    r: "CTO, Nova Retail",
  },
  {
    q: "Our WhatsApp AI bot now handles 70% of support. Setup was painless and ROI was visible inside a month.",
    a: "Rohit Sharma",
    r: "COO, Atlas Logistics",
  },
];

const Testimonials = () => {
  return (
    <section className="relative py-28 md:py-36">
      <div className="container">
        <div className="max-w-3xl reveal">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.3em] uppercase text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/80" /> Testimonials
          </span>
          <h2 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-[1.05]">
            Founders who chose us
            <br />
            <span className="text-foreground">said this.</span>
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-5">
          {quotes.map((quote, i) => (
            <figure
              key={quote.a}
              className="reveal relative p-7 rounded-2xl glass magnetic-glow flex flex-col"
              data-delay={(i * 100).toString()}
            >
              <Quote className="h-6 w-6 text-foreground/80" />
              <blockquote className="mt-5 text-foreground/90 leading-relaxed text-[15px]">"{quote.q}"</blockquote>
              <figcaption className="mt-8 pt-6 border-t border-border/60">
                <div className="font-display font-semibold">{quote.a}</div>
                <div className="text-xs text-secondary-foreground mt-0.5">{quote.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;