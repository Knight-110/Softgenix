import { useEffect, useRef } from "react";
import * as THREE from "three";

type GridScanProps = {
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  scanColor?: string;
  scanOpacity?: number;
  enablePost?: boolean;
  bloomIntensity?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;
  className?: string;
};

const GridScan = ({
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = "#2F293A",
  gridScale = 0.1,
  scanColor = "#06bffd",
  scanOpacity = 0.45,
  enablePost = true,
  bloomIntensity = 0.65,
  chromaticAberration = 0.002,
  noiseIntensity = 0.01,
  className,
}: GridScanProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    let disposed = false;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x05030a, 8, 42);

    const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 80);
    camera.position.set(0, 0, 0.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const tunnel = new THREE.Group();
    scene.add(tunnel);

    const lineColor = new THREE.Color(linesColor);
    const glowColor = new THREE.Color(scanColor);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.95,
    });

    const scanMaterial = new THREE.LineBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: scanOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: enablePost ? 0.08 * bloomIntensity : 0.03,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const width = 11.5;
    const height = 5.8;
    const depth = 38;
    const step = Math.max(0.85, gridScale * 12);

    const gridPoints: THREE.Vector3[] = [];

    const addSegment = (a: THREE.Vector3, b: THREE.Vector3) => {
      gridPoints.push(a, b);
    };

    // Floor and ceiling depth lines
    for (let x = -width; x <= width + 0.001; x += step) {
      addSegment(new THREE.Vector3(x, -height, 0), new THREE.Vector3(x, -height, -depth));
      addSegment(new THREE.Vector3(x, height, 0), new THREE.Vector3(x, height, -depth));
    }

    // Left and right wall depth lines
    for (let y = -height; y <= height + 0.001; y += step) {
      addSegment(new THREE.Vector3(-width, y, 0), new THREE.Vector3(-width, y, -depth));
      addSegment(new THREE.Vector3(width, y, 0), new THREE.Vector3(width, y, -depth));
    }

    // Rectangle rings through the tunnel
    for (let z = 0; z >= -depth; z -= step * 1.35) {
      addSegment(new THREE.Vector3(-width, -height, z), new THREE.Vector3(width, -height, z));
      addSegment(new THREE.Vector3(width, -height, z), new THREE.Vector3(width, height, z));
      addSegment(new THREE.Vector3(width, height, z), new THREE.Vector3(-width, height, z));
      addSegment(new THREE.Vector3(-width, height, z), new THREE.Vector3(-width, -height, z));
    }

    const gridGeometry = new THREE.BufferGeometry().setFromPoints(gridPoints);
    const gridLines = new THREE.LineSegments(gridGeometry, lineMaterial);
    tunnel.add(gridLines);

    const scanRingGeometry = new THREE.BufferGeometry();
    const scanRing = new THREE.LineSegments(scanRingGeometry, scanMaterial);
    tunnel.add(scanRing);

    const glowBoxGeometry = new THREE.BoxGeometry(width * 2, height * 2, depth);
    const glowBox = new THREE.Mesh(glowBoxGeometry, glowMaterial);
    glowBox.position.z = -depth / 2;
    tunnel.add(glowBox);

    const mouse = new THREE.Vector2(0, 0);
    const smoothMouse = new THREE.Vector2(0, 0);

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.y = -(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    };

    const resize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);

      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    resize();

    const updateScanRing = (z: number) => {
      const p: THREE.Vector3[] = [];

      const add = (a: THREE.Vector3, b: THREE.Vector3) => {
        p.push(a, b);
      };

      add(new THREE.Vector3(-width, -height, z), new THREE.Vector3(width, -height, z));
      add(new THREE.Vector3(width, -height, z), new THREE.Vector3(width, height, z));
      add(new THREE.Vector3(width, height, z), new THREE.Vector3(-width, height, z));
      add(new THREE.Vector3(-width, height, z), new THREE.Vector3(-width, -height, z));

      scanRingGeometry.setFromPoints(p);
    };

    const animate = (time: number) => {
      if (disposed) return;

      const t = time * 0.001;
      smoothMouse.lerp(mouse, 0.055);

      camera.position.x = smoothMouse.x * sensitivity * 1.9;
      camera.position.y = smoothMouse.y * sensitivity * 1.05;
      camera.lookAt(
        smoothMouse.x * sensitivity * 3.2,
        smoothMouse.y * sensitivity * 1.8,
        -18
      );

      tunnel.rotation.z = smoothMouse.x * 0.035;
      tunnel.rotation.x = -smoothMouse.y * 0.025;

      const scanZ = -((t * 5.6) % depth);
      updateScanRing(scanZ);

      scanMaterial.opacity =
        scanOpacity * (0.65 + Math.sin(t * 4.2) * 0.22);

      lineMaterial.opacity =
        0.76 + Math.sin(t * 0.9) * 0.07;

      if (enablePost) {
        glowMaterial.opacity =
          0.075 * bloomIntensity + Math.sin(t * 1.4) * 0.015;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);

      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);

      scene.traverse((object) => {
        const obj = object as THREE.Object3D & {
          geometry?: THREE.BufferGeometry;
          material?: THREE.Material | THREE.Material[];
        };

        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    sensitivity,
    lineThickness,
    linesColor,
    gridScale,
    scanColor,
    scanOpacity,
    enablePost,
    bloomIntensity,
    chromaticAberration,
    noiseIntensity,
  ]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={className ?? "h-full w-full"}
    />
  );
};

export default GridScan;