import {
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./GridScan.css";

type GridScanProps = {
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  scanColor?: string;
  scanOpacity?: number;
  enablePost?: boolean;
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;
  lineJitter?: number;
  scanGlow?: number;
  scanSoftness?: number;
  scanPhaseTaper?: number;
  scanDuration?: number;
  scanDelay?: number;
  className?: string;
  style?: React.CSSProperties;
};

const vert = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const frag = `
precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uYaw;

uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uNoise;
uniform float uBloomOpacity;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;

varying vec2 vUv;

float smoother01(float a, float b, float x) {
  float t = clamp((x - a) / max(1e-5, b - a), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

  vec3 ro = vec3(0.0, 0.0, -0.95);
  vec3 rd = normalize(vec3(p * vec2(0.99, 0.93), 2.45));

  float cR = cos(uTilt);
  float sR = sin(uTilt);
  rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;

  float cY = cos(uYaw);
  float sY = sin(uYaw);
  rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;

  vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
  rd.xy += skew * rd.z;
  rd = normalize(rd);

  vec3 color = vec3(0.0);
  float minT = 1e20;
  float gridScale = max(1e-5, uGridScale);
  vec2 gridUV = vec2(0.0);
  float hitIsY = 1.0;

  for (int i = 0; i < 4; i++) {
    float isY = float(i < 2);
    float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);

    float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
    float den = isY * rd.y + (1.0 - isY) * rd.x;
    float t = num / den;

    vec3 h = ro + rd * t;
    float tunnelDepth = max(0.0, h.z - ro.z);
    float depthBoost = smoothstep(0.0, 4.1, tunnelDepth);
    h.xy += skew * 0.15 * depthBoost;
    float depthCoord = tunnelDepth * 0.82 + pow(tunnelDepth + 1e-4, 1.0) * 0.12;

    bool use = t > 0.0 && t < minT;
    gridUV = use
      ? (isY > 0.5 ? vec2(h.x, depthCoord) : vec2(depthCoord, h.y)) / gridScale
      : gridUV;
    minT = use ? t : minT;
    hitIsY = use ? isY : hitIsY;
  }

  vec3 hit = ro + rd * minT;
  float dist = length(hit - ro);
  float tunnelDepthHit = max(0.0, hit.z - ro.z);

  float jitterAmt = clamp(uLineJitter, 0.0, 1.0);

  if (jitterAmt > 0.0) {
    vec2 j = vec2(
      sin(gridUV.y * 2.7 + iTime * 1.8),
      cos(gridUV.x * 2.3 - iTime * 1.6)
    ) * (0.15 * jitterAmt);

    gridUV += j;
  }

  float fx = fract(gridUV.x);
  float fy = fract(gridUV.y);

  float ax = min(fx, 1.0 - fx);
  float ay = min(fy, 1.0 - fy);

  float wx = fwidth(gridUV.x);
  float wy = fwidth(gridUV.y);

  float halfPx = max(0.0, uLineThickness) * 0.5;

  float tx = halfPx * wx;
  float ty = halfPx * wy;

  float lineX = 1.0 - smoothstep(tx, tx + wx, ax);
  float lineY = 1.0 - smoothstep(ty, ty + wy, ay);

  float primaryMask = max(lineX, lineY);

  float depthCoordHit = tunnelDepthHit * 0.82 + pow(tunnelDepthHit + 1e-4, 1.0) * 0.12;
  vec2 gridUV2 = (hitIsY > 0.5 ? vec2(hit.x, depthCoordHit) : vec2(depthCoordHit, hit.y)) / gridScale;

  float fx2 = fract(gridUV2.x);
  float fy2 = fract(gridUV2.y);

  float ax2 = min(fx2, 1.0 - fx2);
  float ay2 = min(fy2, 1.0 - fy2);

  float wx2 = fwidth(gridUV2.x);
  float wy2 = fwidth(gridUV2.y);

  float tx2 = halfPx * wx2;
  float ty2 = halfPx * wy2;

  float lineX2 = 1.0 - smoothstep(tx2, tx2 + wx2, ax2);
  float lineY2 = 1.0 - smoothstep(ty2, ty2 + wy2, ay2);

  float altMask = max(lineX2, lineY2);

  float edgeDistX = min(abs(hit.x - (-0.5)), abs(hit.x - 0.5));
  float edgeDistY = min(abs(hit.y - (-0.2)), abs(hit.y - 0.2));
  float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);

  float edgeGate = 1.0 - smoothstep(gridScale * 0.75, gridScale * 3.4, edgeDist);
  altMask *= edgeGate;

  float lineMask = max(primaryMask, altMask);
  float nearFade = smoothstep(0.15, 0.8, dist);
  float depthFade = exp(-dist * 0.23) * (1.0 - smoothstep(5.1, 7.8, tunnelDepthHit));
  float fade = nearFade * depthFade;

  float dur = max(0.05, uScanDuration);
  float del = max(0.0, uScanDelay);

  float cycle = dur + del;
  float tCycle = mod(iTime, cycle);
  float phase = clamp((tCycle - del) / dur, 0.0, 1.0);

  phase = phase < 0.5 ? phase * 2.0 : 1.0 - (phase - 0.5) * 2.0;

  float scanZMax = 5.25;
  float scanZ = mix(ro.z + 0.35, scanZMax, phase);

  float widthScale = max(0.1, uScanGlow);
  float sigma = max(0.001, 0.31 * widthScale * uScanSoftness);
  float sigmaA = sigma * 3.2;

  float dz = abs(hit.z - scanZ);

  float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));
  float auraBand = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA));

  float taper = clamp(uPhaseTaper, 0.0, 0.49);
  float headFade = smoother01(0.0, taper, phase);
  float tailFade = 1.0 - smoother01(1.0 - taper, 1.0, phase);
  float phaseWindow = headFade * tailFade;

  float scanDepthHold = 1.0 - smoothstep(5.4, 8.1, tunnelDepthHit) * 0.08;
  float pulse = lineBand * phaseWindow * scanDepthHold * 1.55 * clamp(uScanOpacity, 0.0, 1.0);
  float aura = auraBand * 0.56 * phaseWindow * scanDepthHold * 1.35 * clamp(uScanOpacity, 0.0, 1.0);

  float centerClean = 1.0 - smoothstep(0.22, 1.05, length(p + skew * 0.18));
  float depthShade = mix(1.0, 0.34, smoothstep(1.6, 6.9, tunnelDepthHit));

  vec3 gridCol = uLinesColor * lineMask * fade * mix(0.88, 1.14, centerClean) * depthShade;
  vec3 scanCol = uScanColor * pulse * mix(1.22, 1.02, smoothstep(3.8, 7.2, tunnelDepthHit));
  vec3 scanAura = uScanColor * aura * mix(1.35, 0.98, smoothstep(3.5, 7.4, tunnelDepthHit));

  color = gridCol + scanCol + scanAura;

  float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898, 78.233))) * 43758.5453123);
  color += (n - 0.5) * uNoise * (0.2 + 0.8 * fade);
  color = clamp(color, 0.0, 1.0);

  float alpha = clamp(max(lineMask * 0.92, pulse + aura * 0.6), 0.0, 1.0);

  float gx = 1.0 - smoothstep(tx * 2.0, tx * 2.0 + wx * 2.0, ax);
  float gy = 1.0 - smoothstep(ty * 2.0, ty * 2.0 + wy * 2.0, ay);
  float halo = max(gx, gy) * fade;

  alpha = max(alpha, halo * clamp(uBloomOpacity, 0.0, 1.0));

  fragColor = vec4(color, alpha);
}

void main() {
  vec4 c;
  mainImage(c, vUv * iResolution.xy);
  gl_FragColor = c;
}
`;

function srgbColor(hex: string) {
  const c = new THREE.Color(hex);
  return c.convertSRGBToLinear();
}

function smoothDampVec2(
  current: THREE.Vector2,
  target: THREE.Vector2,
  velocity: THREE.Vector2,
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
) {
  const out = current.clone();
  smoothTime = Math.max(0.0001, smoothTime);

  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let change = current.clone().sub(target);
  const originalTo = target.clone();

  const maxChange = maxSpeed * smoothTime;
  if (change.length() > maxChange) change.setLength(maxChange);

  target = current.clone().sub(change);

  const temp = velocity.clone().addScaledVector(change, omega).multiplyScalar(deltaTime);

  velocity.sub(temp.clone().multiplyScalar(omega));
  velocity.multiplyScalar(exp);

  out.copy(target.clone().add(change.add(temp).multiplyScalar(exp)));

  const origMinusCurrent = originalTo.clone().sub(current);
  const outMinusOrig = out.clone().sub(originalTo);

  if (origMinusCurrent.dot(outMinusOrig) > 0) {
    out.copy(originalTo);
    velocity.set(0, 0);
  }

  return out;
}

function softenPointerAxis(value: number) {
  const clamped = THREE.MathUtils.clamp(value, -1, 1);
  const magnitude = Math.abs(clamped);
  return Math.sign(clamped) * Math.pow(magnitude, 0.88);
}

const GridScan = ({
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = "#2F293A",
  gridScale = 0.14,
  scanColor = "#06bffd",
  scanOpacity = 0.4,
  enablePost = true,
  bloomIntensity = 1.1,
  bloomThreshold = 0,
  bloomSmoothing = 0,
  chromaticAberration = 0.0065,
  noiseIntensity = 0.04,
  lineJitter = 0,
  scanGlow = 1.1,
  scanSoftness = 1.3,
  scanPhaseTaper = 0.9,
  scanDuration = 2,
  scanDelay = 2,
  className,
  style,
}: GridScanProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const lookTarget = useRef(new THREE.Vector2(0, 0));
  const lookCurrent = useRef(new THREE.Vector2(0, 0));
  const lookVel = useRef(new THREE.Vector2(0, 0));

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomRef = useRef<BloomEffect | null>(null);
  const chromaRef = useRef<ChromaticAberrationEffect | null>(null);
  const rafRef = useRef<number | null>(null);

  const s = THREE.MathUtils.clamp(sensitivity, 0, 1);
  const skewScale = THREE.MathUtils.lerp(0.08, 0.22, s);
  const smoothTime = THREE.MathUtils.lerp(0.42, 0.16, s);
  const yBoost = THREE.MathUtils.lerp(1.24, 1.72, s);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const interactionRoot =
      el.closest("section") ?? el.parentElement ?? el;

    const onMove = (e: MouseEvent) => {
      const rect = interactionRoot.getBoundingClientRect();
      const insideX = e.clientX >= rect.left && e.clientX <= rect.right;
      const insideY = e.clientY >= rect.top && e.clientY <= rect.bottom;

      if (!insideX || !insideY) {
        lookTarget.current.lerp(new THREE.Vector2(0, 0), 0.3);
        return;
      }

      const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ny = -((((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2) - 1);
      const curvedX = softenPointerAxis(nx);
      const curvedY = softenPointerAxis(ny);
      const edgeFalloff = 1.0 - Math.min(0.28, Math.hypot(curvedX, curvedY) * 0.16);

      lookTarget.current.set(curvedX * edgeFalloff, curvedY * edgeFalloff);
    };

    const onLeaveWindow = () => {
      lookTarget.current.set(0, 0);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeaveWindow);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeaveWindow);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0);

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";

    container.appendChild(renderer.domElement);

    const uniforms = {
      iResolution: {
        value: new THREE.Vector3(
          container.clientWidth,
          container.clientHeight,
          renderer.getPixelRatio()
        ),
      },
      iTime: { value: 0 },
      uSkew: { value: new THREE.Vector2(0, 0) },
      uTilt: { value: 0 },
      uYaw: { value: 0 },
      uLineThickness: { value: lineThickness },
      uLinesColor: { value: srgbColor(linesColor) },
      uScanColor: { value: srgbColor(scanColor) },
      uGridScale: { value: gridScale },
      uLineJitter: { value: Math.max(0, Math.min(1, lineJitter)) },
      uScanOpacity: { value: scanOpacity },
      uNoise: { value: noiseIntensity },
      uBloomOpacity: { value: bloomIntensity },
      uScanGlow: { value: scanGlow },
      uScanSoftness: { value: scanSoftness },
      uPhaseTaper: { value: scanPhaseTaper },
      uScanDuration: { value: scanDuration },
      uScanDelay: { value: scanDelay },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    materialRef.current = material;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    if (enablePost) {
      const composer = new EffectComposer(renderer);
      composerRef.current = composer;

      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloom = new BloomEffect({
        intensity: 1,
        luminanceThreshold: bloomThreshold,
        luminanceSmoothing: bloomSmoothing,
      });

      bloom.blendMode.opacity.value = Math.max(0, bloomIntensity);
      bloomRef.current = bloom;

      const chroma = new ChromaticAberrationEffect({
        offset: new THREE.Vector2(chromaticAberration, chromaticAberration),
        radialModulation: true,
        modulationOffset: 0,
      });

      chromaRef.current = chroma;

      const effectPass = new EffectPass(camera, bloom, chroma);
      effectPass.renderToScreen = true;
      composer.addPass(effectPass);
    }

    const onResize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);

      renderer.setSize(w, h);
      material.uniforms.iResolution.value.set(w, h, renderer.getPixelRatio());

      if (composerRef.current) {
        composerRef.current.setSize(w, h);
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;

      lookCurrent.current.copy(
        smoothDampVec2(
          lookCurrent.current,
          lookTarget.current,
          lookVel.current,
          smoothTime,
          Infinity,
          dt
        )
      );

      material.uniforms.uSkew.value.set(
        lookCurrent.current.x * skewScale,
        -lookCurrent.current.y * yBoost * skewScale
      );

      material.uniforms.iTime.value = now / 1000;

      renderer.clear(true, true, true);

      if (composerRef.current) {
        composerRef.current.render(dt);
      } else {
        renderer.render(scene, camera);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      window.removeEventListener("resize", onResize);

      material.dispose();
      quad.geometry.dispose();

      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }

      renderer.dispose();
      renderer.forceContextLoss();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    sensitivity,
    lineThickness,
    linesColor,
    scanColor,
    scanOpacity,
    gridScale,
    lineJitter,
    enablePost,
    noiseIntensity,
    bloomIntensity,
    bloomThreshold,
    bloomSmoothing,
    chromaticAberration,
    scanGlow,
    scanSoftness,
    scanPhaseTaper,
    scanDuration,
    scanDelay,
    smoothTime,
    skewScale,
    yBoost,
  ]);

  return (
    <div
      ref={containerRef}
      className={`gridscan${className ? ` ${className}` : ""}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export default GridScan;
