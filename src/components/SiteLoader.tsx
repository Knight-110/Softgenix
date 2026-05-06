import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LoaderEnergyCanvas from "@/components/effects/LoaderEnergyCanvas";

type SiteLoaderProps = {
  onComplete: () => void;
};

const BOOT_MESSAGES = [
  "INITIALIZING SOFTGENIX CORE",
  "LOADING INTERFACE SYSTEMS",
  "SYNCING AI MODULES",
  "PREPARING DIGITAL EXPERIENCE",
];

const MESSAGE_THRESHOLDS = [0, 28, 52, 76];
const DURATION_MS = 2925;
const EXPLOSION_LEAD_MS = 320;
const EXIT_DURATION_MS = 820;
const REDUCED_MOTION_DURATION_MS = 800;
const FAILSAFE_MS = 3600;

const PROGRESS_STOPS = [
  { at: 0, value: 0 },
  { at: 0.1, value: 7 },
  { at: 0.21, value: 19 },
  { at: 0.33, value: 34 },
  { at: 0.48, value: 57 },
  { at: 0.62, value: 68 },
  { at: 0.76, value: 84 },
  { at: 0.89, value: 93 },
  { at: 0.96, value: 98 },
  { at: 1, value: 100 },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const lerp = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const interpolateProgress = (elapsed: number) => {
  const normalized = clamp(elapsed / DURATION_MS, 0, 1);

  for (let index = 0; index < PROGRESS_STOPS.length - 1; index += 1) {
    const current = PROGRESS_STOPS[index];
    const next = PROGRESS_STOPS[index + 1];

    if (normalized >= current.at && normalized <= next.at) {
      const segmentProgress = (normalized - current.at) / (next.at - current.at || 1);
      const eased = easeInOutCubic(segmentProgress);
      const base = lerp(current.value, next.value, eased);
      const jitterStrength = base < 96 ? (1 - normalized) * 1.8 : 0;
      const jitter =
        (Math.sin(elapsed / 110) * 0.7 + Math.sin(elapsed / 47) * 0.35) * jitterStrength;

      return clamp(base + jitter, current.value, next.value);
    }
  }

  return 100;
};

const SiteLoader = ({ onComplete }: SiteLoaderProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [bootMessageIndex, setBootMessageIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const completionRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);

  const status = useMemo(() => BOOT_MESSAGES[bootMessageIndex] ?? BOOT_MESSAGES[0], [bootMessageIndex]);

  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = window.setTimeout(() => {
        setProgress(100);
        setBootMessageIndex(BOOT_MESSAGES.length - 1);
        setIsExiting(true);
      }, REDUCED_MOTION_DURATION_MS - EXIT_DURATION_MS / 2);

      return () => {
        window.clearTimeout(timer);
      };
    }

    let rafId = 0;
    const startedAt = performance.now();

    const tick = (time: number) => {
      const elapsed = time - startedAt;
      const nextProgress = interpolateProgress(elapsed);

      setProgress((current) => (nextProgress > current ? nextProgress : current));

      const nextMessageIndex = MESSAGE_THRESHOLDS.reduce((active, threshold, index) => {
        if (nextProgress >= threshold) {
          return index;
        }
        return active;
      }, 0);

      setBootMessageIndex(nextMessageIndex);

      if (elapsed >= DURATION_MS) {
        setProgress(100);
        setBootMessageIndex(BOOT_MESSAGES.length - 1);
        exitTimerRef.current = window.setTimeout(() => {
          setIsExiting(true);
        }, EXPLOSION_LEAD_MS);
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isExiting) {
      return;
    }

    setShowFlash(true);
    const completeTimer = window.setTimeout(() => {
      if (!completionRef.current) {
        completionRef.current = true;
        onComplete();
      }
    }, EXIT_DURATION_MS);

    return () => {
      window.clearTimeout(completeTimer);
    };
  }, [isExiting, onComplete]);

  useEffect(() => {
    const failsafeTimer = window.setTimeout(() => {
      if (completionRef.current) {
        return;
      }

      completionRef.current = true;
      onComplete();
    }, prefersReducedMotion ? REDUCED_MOTION_DURATION_MS + 600 : FAILSAFE_MS);

    return () => {
      window.clearTimeout(failsafeTimer);
    };
  }, [onComplete, prefersReducedMotion]);

  return (
    <motion.div
      aria-label="Loading Softgenix experience"
      className="fixed inset-0 z-[120] overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      animate={
        isExiting
          ? {
              opacity: 0,
              clipPath: "inset(0% 0% 100% 0%)",
              scale: 1.015,
              transition: {
                duration: EXIT_DURATION_MS / 1000,
                ease: [0.76, 0, 0.24, 1],
              },
            }
          : {
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
            }
      }
    >
      <div className="absolute inset-0 bg-[#020409]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_45%),radial-gradient(circle_at_50%_50%,rgba(217,70,239,0.08),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.085) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(circle at center, black 32%, transparent 88%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 32%, transparent 88%)",
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-[0.085] mix-blend-screen"
        animate={prefersReducedMotion ? undefined : { opacity: [0.07, 0.11, 0.075] }}
        transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.75) 0.5px, transparent 0.75px), radial-gradient(circle at 70% 40%, rgba(255,255,255,0.55) 0.5px, transparent 0.8px), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.65) 0.5px, transparent 0.8px)",
          backgroundSize: "160px 160px, 220px 220px, 280px 280px",
        }}
      />

      {!prefersReducedMotion ? (
        <LoaderEnergyCanvas progress={progress} isExiting={isExiting} />
      ) : null}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-3xl">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <motion.div
              className="mb-4 rounded-full border border-white/10 bg-white/[0.035] px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.42em] text-cyan-100/60 backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              AI CORE BOOT
            </motion.div>

            <motion.div
              className="relative"
              animate={
                isExiting
                  ? {
                      scale: [1, 1.04, 0.98],
                      filter: [
                        "drop-shadow(0 0 22px rgba(34,211,238,0.28))",
                        "drop-shadow(0 0 42px rgba(34,211,238,0.75))",
                        "drop-shadow(0 0 12px rgba(217,70,239,0.18))",
                      ],
                    }
                  : {
                      scale: progress >= 90 ? [1, 1.012, 1] : 1,
                    }
              }
              transition={{
                duration: isExiting ? 0.55 : 1.8,
                repeat: isExiting ? 0 : Infinity,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),rgba(56,189,248,0.06),transparent_72%)] blur-2xl" />
              <motion.h1
                className="font-display relative text-[clamp(2.6rem,8vw,6.8rem)] font-semibold uppercase tracking-[0.5em] text-white"
                animate={{
                  opacity: progress >= 90 ? 1 : 0.86,
                }}
                transition={{ duration: 0.45 }}
              >
                <span className="mr-[-0.5em] bg-[linear-gradient(120deg,#f5fbff_0%,#9fe8ff_34%,#38bdf8_56%,#8b5cf6_100%)] bg-clip-text text-transparent">
                  SOFTGENIX
                </span>
              </motion.h1>
            </motion.div>

            <div className="mt-6 h-px w-full max-w-md overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full origin-left bg-[linear-gradient(90deg,rgba(34,211,238,0.85),rgba(56,189,248,1),rgba(139,92,246,0.92),rgba(217,70,239,0.7))] shadow-[0_0_18px_rgba(34,211,238,0.42),0_0_32px_rgba(139,92,246,0.22)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 flex w-full max-w-md items-start justify-between gap-4 text-left">
              <AnimatePresence mode="wait">
                <motion.p
                  key={status}
                  className="text-[11px] uppercase tracking-[0.34em] text-white/72"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {status}
                </motion.p>
              </AnimatePresence>

              <motion.div
                className="min-w-[70px] text-right text-xs uppercase tracking-[0.42em] text-cyan-100/75"
                animate={progress >= 99 ? { opacity: [0.7, 1, 0.8] } : { opacity: 1 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              >
                {Math.round(progress)}
                <span className="ml-1 text-white/45">%</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFlash ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),rgba(56,189,248,0.14),transparent_48%)]"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.92, 1.04, 1.12] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default SiteLoader;
