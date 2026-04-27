import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import FluidParticleScene from "@/components/effects/FluidParticleScene";
import { openWhatsApp } from "@/lib/whatsapp";

interface WhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const DEFAULT_MESSAGE = "Hi Softgenix, I'd like to discuss a project.";

const WhatsAppModal = ({ open, onOpenChange, message = DEFAULT_MESSAGE }: WhatsAppModalProps) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  const handleWhatsAppClick = () => {
    openWhatsApp(message);
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="whatsapp-modal-title"
          className="fixed inset-0 z-[90] overflow-hidden"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(5px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="absolute inset-0 bg-[#01050f]"
            initial={{ opacity: 0.74 }}
            animate={{ opacity: 0.92 }}
            exit={{ opacity: 0.7 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />

          <FluidParticleScene />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(120,210,255,0.18),transparent_34%),radial-gradient(circle_at_50%_88%,rgba(75,176,255,0.16),transparent_40%),linear-gradient(180deg,rgba(1,4,12,0.52)_0%,rgba(1,7,16,0.24)_42%,rgba(0,2,8,0.78)_100%)]" />

          <motion.button
            type="button"
            className="absolute right-5 top-5 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/24 bg-black/50 text-white/90 backdrop-blur-md transition-all hover:border-white/44 hover:bg-black/72 hover:text-white"
            onClick={(event) => {
              event.stopPropagation();
              onOpenChange(false);
            }}
            initial={{ opacity: 0, y: -12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.94 }}
            transition={{ duration: 0.28, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Close Let's Talk experience"
          >
            <X className="h-4 w-4" />
          </motion.button>

          <div
            className="relative z-20 flex min-h-full items-center justify-center px-6 py-16 md:py-20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto w-full max-w-[960px] text-center md:-translate-y-[7vh]">
              <motion.p
                className="font-display text-[11px] uppercase tracking-[0.34em] text-white/70"
                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              >
                LET&apos;S TALK
              </motion.p>

              <motion.h2
                id="whatsapp-modal-title"
                className="mt-5 font-display text-4xl leading-[1.04] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl"
                initial={{ opacity: 0, y: 26, scale: 0.98, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 18, scale: 0.985, filter: "blur(8px)" }}
                transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1], delay: 0.13 }}
              >
                Let&apos;s build something your users will remember.
              </motion.h2>

              <motion.p
                className="mx-auto mt-6 max-w-[720px] text-base text-white/78 sm:text-lg md:text-xl"
                initial={{ opacity: 0, y: 16, filter: "blur(7px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
              >
                Share your idea on WhatsApp and we&apos;ll respond with a focused execution plan.
              </motion.p>

              <motion.div
                className="mt-10"
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.985 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              >
                <Button
                  variant="hero"
                  size="xl"
                  onClick={handleWhatsAppClick}
                  className="min-w-[238px] rounded-full border border-[#8dd6ff]/50 bg-gradient-to-b from-[#2fb7ff] to-[#1796ff] text-white shadow-[0_26px_65px_-36px_rgba(53,175,255,0.95)] hover:from-[#57c7ff] hover:to-[#269fff]"
                >
                  Chat on WhatsApp
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppModal;
