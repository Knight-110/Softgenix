import { useEffect, useRef } from "react";

const TransitionStrip = () => {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) el.classList.add("scale-x-100");
        });
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const phrases = ["STRATEGY", "DESIGN", "ENGINEERING", "AI", "GROWTH", "CONTENT", "BRAND", "RESULTS"];

  return (
    <section aria-hidden className="relative py-20 overflow-hidden">
      <div
        ref={lineRef}
        className="container origin-left scale-x-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="hairline" />
      </div>

      <div className="mt-12 flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
        <div className="flex shrink-0 animate-marquee gap-12 whitespace-nowrap pr-12">
          {[...phrases, ...phrases, ...phrases].map((phrase, i) => (
            <span key={i} className="font-display text-4xl md:text-6xl font-bold text-foreground/10 tracking-tight">
              {phrase}
              <span className="text-foreground/40"> · </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransitionStrip;