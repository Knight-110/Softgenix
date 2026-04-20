import { useScrollProgress } from "@/hooks/useScrollProgress";

const ScrollProgress = () => {
  const p = useScrollProgress();
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
      <div
        className="h-full bg-gradient-brand shadow-glow origin-left"
        style={{ transform: `scaleX(${p})`, transition: "transform 80ms linear" }}
      />
    </div>
  );
};

export default ScrollProgress;
