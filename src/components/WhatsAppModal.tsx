import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";

interface WhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const DEFAULT_MESSAGE = "Hi Softgenix, I'd like to discuss a project.";
const HEADLINE_WORDS = ["Let's", "build", "something", "your", "users", "will", "remember."];

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
          className="fixed inset-0 z-[80] overflow-hidden bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => onOpenChange(false)}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(255,255,255,0.06),transparent_26%),radial-gradient(circle_at_16%_14%,rgba(255,255,255,0.04),transparent_30%),radial-gradient(circle_at_85%_82%,rgba(255,255,255,0.05),transparent_28%),linear-gradient(180deg,#040404_0%,#010101_55%,#000_100%)]" />
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_0%,transparent_30%,rgba(255,255,255,0.02)_100%)]" />

          <motion.button
            type="button"
            className="absolute right-5 top-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/22 bg-black text-white/85 transition-all hover:border-white/45 hover:bg-secondary hover:text-white"
            onClick={(event) => {
              event.stopPropagation();
              onOpenChange(false);
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, delay: 0.06 }}
            aria-label="Close WhatsApp modal"
          >
            <X className="h-4 w-4" />
          </motion.button>

          <motion.div
            className="relative z-10 flex min-h-full items-center justify-center px-6 py-16 md:py-20"
            initial={{ opacity: 0, y: 28, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.99 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto max-w-[920px] -translate-y-[8vh] text-center">
              <motion.h2
                id="whatsapp-modal-title"
                className="font-display text-4xl leading-[1.04] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.035,
                      delayChildren: 0.08,
                    },
                  },
                }}
              >
                {HEADLINE_WORDS.map((word) => (
                  <motion.span
                    key={word}
                    className="mr-[0.32em] inline-block bg-gradient-to-b from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent last:mr-0"
                    variants={{
                      hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                      show: {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        transition: {
                          duration: 0.82,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h2>

              <motion.p
                className="mt-6 text-base text-secondary-foreground sm:text-lg md:text-xl"
                initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
              >
                Share your idea on WhatsApp and we will reply with a focused execution plan.
              </motion.p>

              <motion.div
                className="mt-10"
                initial={{ opacity: 0, y: 16, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.985 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.26 }}
              >
                <Button variant="hero" size="xl" className="min-w-[240px]" onClick={handleWhatsAppClick}>
                  Chat on WhatsApp
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppModal;
