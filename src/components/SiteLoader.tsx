import { useEffect, useMemo, useState } from "react";
import { animate, motion } from "framer-motion";
import logo from "@/assets/softgenix-logo.jpeg";

type SiteLoaderProps = {
  onComplete: () => void;
};

const LOADER_DURATION_MS = 2100;

const particlePositions = [
  { x: "16%", y: "24%" },
  { x: "24%", y: "70%" },
  { x: "36%", y: "38%" },
  { x: "58%", y: "22%" },
  { x: "66%", y: "76%" },
  { x: "79%", y: "42%" },
  { x: "86%", y: "64%" },
];

const SiteLoader = ({ onComplete }: SiteLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const statusText = useMemo(
    () => (progress < 45 ? "Initializing Softgenix" : "Loading digital experience"),
    [progress],
  );

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 1.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => setProgress(Math.round(value)),
    });

    const timer = window.setTimeout(() => {
      onComplete();
    }, LOADER_DURATION_MS);

    return () => {
      controls.stop();
      window.clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(70%_58%_at_50%_12%,hsl(199_89%_48%/0.22),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(40%_45%_at_86%_20%,hsl(188_85%_53%/0.12),transparent_74%)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(hsl(200 70% 52% / 0.09) 1px, transparent 1px), linear-gradient(90deg, hsl(200 70% 52% / 0.09) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 50% 35%, #000 26%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 35%, #000 26%, transparent 78%)",
        }}
      />

      {particlePositions.map((particle, index) => (
        <motion.span
          key={`${particle.x}-${particle.y}`}
          className="absolute h-1 w-1 rounded-full bg-cyan/55"
          style={{ left: particle.x, top: particle.y }}
          animate={{ y: [0, -8, 0], opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 2.6 + index * 0.18, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="relative mx-auto mb-7 h-40 w-40">
            <motion.div
              className="absolute inset-0 rounded-full border border-cyan/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-[12px] rounded-full border border-sky-400/15"
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-[26px] overflow-hidden rounded-2xl border border-white/12 bg-black/60 p-2 backdrop-blur-sm">
              <img src={logo} alt="Softgenix logo" className="h-full w-full rounded-xl object-cover" />
              <motion.div
                className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-cyan/35 to-transparent"
                animate={{ y: [-34, 74] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>

          <motion.p
            className="text-[11px] uppercase tracking-[0.34em] text-cyan/80"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            {statusText}
          </motion.p>

          <div className="mt-4 rounded-full border border-white/10 bg-white/[0.03] p-1">
            <motion.div
              className="h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 text-xs tracking-[0.2em] text-white/72">{progress}%</div>
        </div>
      </div>
    </motion.div>
  );
};

export default SiteLoader;
