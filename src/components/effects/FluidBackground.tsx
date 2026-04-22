import { useEffect, useRef } from "react";
import { destroyFluidCursor, initFluidCursor } from "@/utils/fluidCursor";

const FluidBackground = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    initFluidCursor(container).catch((error) => {
      if (!cancelled) {
        console.warn("Fluid background initialization failed:", error);
      }
    });

    return () => {
      cancelled = true;
      destroyFluidCursor();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="fluid-layer"
      className="fluid-layer"
      aria-hidden="true"
    />
  );
};

export default FluidBackground;
