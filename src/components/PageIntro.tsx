type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

const PageIntro = ({ eyebrow, title, description }: PageIntroProps) => {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[18%] h-40 w-40 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute right-[12%] top-[26%] h-56 w-56 rounded-full bg-white/6 blur-3xl" />
      </div>

      <div className="container">
        <div className="reveal max-w-4xl rounded-[2rem] border border-white/10 bg-black/70 px-6 py-12 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.95)] backdrop-blur-md md:px-10 md:py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            {eyebrow}
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.02] text-white md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PageIntro;
