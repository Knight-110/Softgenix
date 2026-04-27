import { useEffect } from "react";
import { Home, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";

const LetsTalk = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#2837ff] text-white">
      <section className="relative flex min-h-screen flex-col overflow-hidden px-8 py-8 sm:px-12 lg:px-16">
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] flex-col items-center text-center">
          <div className="flex w-full justify-end">
            <Link
              to="/"
              aria-label="Go to homepage"
              className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold uppercase tracking-[0.04em] text-[#1b1d28] shadow-[0_20px_40px_-26px_rgba(0,0,0,0.75)] transition-transform hover:-translate-y-0.5"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.04em] text-white/92 sm:text-[15px]">
            IS YOUR BIG IDEA READY TO GO WILD?
          </p>

          <h1 className="mt-16 font-display text-[clamp(4.8rem,13vw,10.5rem)] leading-[0.88] tracking-[-0.07em] text-white">
            Let&apos;s work
            <br />
            together!
          </h1>

          <div className="mt-auto pb-10 sm:pb-14">
            <Button
              variant="hero"
              size="xl"
              className="h-16 rounded-full border-white/35 bg-white px-10 text-base font-semibold uppercase tracking-[0.04em] text-[#1b1d28] hover:bg-white/95"
              onClick={() => openWhatsApp("Hi Softgenix, I'd like to discuss a new project.")}
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LetsTalk;
