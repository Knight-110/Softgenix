type FluidColor = { r: number; g: number; b: number };

type FluidConfigOverride = {
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE: number;
  CURL: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
  SHADING: boolean;
  COLORFUL: boolean;
  PAUSED: boolean;
  BLOOM: boolean;
  BLOOM_INTENSITY: number;
  BLOOM_THRESHOLD: number;
  SUNRAYS: boolean;
  SUNRAYS_WEIGHT: number;
  BACK_COLOR: FluidColor;
  TRANSPARENT: boolean;
};

declare global {
  interface Window {
    __FLUID_CONFIG_OVERRIDE__?: Partial<FluidConfigOverride>;
    __FLUID_SIM_DESTROY__?: () => void;
    __FLUID_SIM_CONFIG__?: { PAUSED?: boolean };
  }
}

const FLUID_SCRIPT_ID = "softgenix-fluid-engine";
const FLUID_CANVAS_ID = "fluid-canvas";

let activeContainer: HTMLElement | null = null;

function isLikelyMobileOrLowEnd() {
  const touchCapable = navigator.maxTouchPoints > 0;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowCoreCount = (navigator.hardwareConcurrency ?? 8) <= 4;
  return touchCapable || coarsePointer || lowCoreCount;
}

function getConfigOverride(): Partial<FluidConfigOverride> {
  const mobile = isLikelyMobileOrLowEnd();

return {
  SIM_RESOLUTION: mobile ? 128 : 128,
  DYE_RESOLUTION: mobile ? 512 : 1024,

  DENSITY_DISSIPATION: 4.0,
  VELOCITY_DISSIPATION: 0.13,
  PRESSURE: 0,
  CURL: mobile ? 12 : 14,

  SPLAT_RADIUS: mobile ? 0.24 : 0.33,
  SPLAT_FORCE: mobile ? 1600 : 2000,

  SHADING: false,
  COLORFUL: true,
  PAUSED: false,

  BLOOM: false,
  BLOOM_INTENSITY: 0.8,
  BLOOM_THRESHOLD: 0.6,

  SUNRAYS: false,
  SUNRAYS_WEIGHT: 0,

  BACK_COLOR: { r: 0, g: 0, b: 0 },
  TRANSPARENT: false,
};
}

function ensureCanvas(container: HTMLElement) {
  let canvas = container.querySelector<HTMLCanvasElement>(`#${FLUID_CANVAS_ID}`);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = FLUID_CANVAS_ID;
    canvas.className = "fluid-canvas";
    container.appendChild(canvas);
  }
  return canvas;
}

function removeFluidScriptTag() {
  const existingScript = document.getElementById(FLUID_SCRIPT_ID);
  if (existingScript) existingScript.remove();
}

function loadFluidScript() {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = FLUID_SCRIPT_ID;
    script.src = "/fluid/fluid.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load fluid runtime"));
    document.body.appendChild(script);
  });
}

function supportsWebGL() {
  const testCanvas = document.createElement("canvas");
  const gl2 = testCanvas.getContext("webgl2");
  const gl1 =
    testCanvas.getContext("webgl") ||
    testCanvas.getContext("experimental-webgl");
  return Boolean(gl2 || gl1);
}

export async function initFluidCursor(container: HTMLElement) {
  if (!supportsWebGL()) {
    return { ok: false as const };
  }

  destroyFluidCursor();

  activeContainer = container;
  ensureCanvas(container);
  window.__FLUID_CONFIG_OVERRIDE__ = getConfigOverride();

  removeFluidScriptTag();
  await loadFluidScript();

  return { ok: true as const };
}

export function destroyFluidCursor() {
  window.__FLUID_SIM_DESTROY__?.();
  window.__FLUID_SIM_DESTROY__ = undefined;
  window.__FLUID_SIM_CONFIG__ = undefined;

  if (activeContainer) {
    const canvas = activeContainer.querySelector(`#${FLUID_CANVAS_ID}`);
    if (canvas) canvas.remove();
    activeContainer = null;
    return;
  }

  const canvas = document.getElementById(FLUID_CANVAS_ID);
  if (canvas) canvas.remove();
}
