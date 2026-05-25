import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

const PALETTE = [
  ["#5ed4ff", "#7a3bff"], ["#ffb072", "#ff3d8a"], ["#9bf0c8", "#1a8c6a"],
  ["#c78bff", "#3a1f7a"], ["#ffe27a", "#b06a00"], ["#7ad7ff", "#0a3a6e"],
] as const;

function makeCoverTexture(i: number) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 768;
  const ctx = c.getContext("2d")!;
  const [a, b] = PALETTE[i % PALETTE.length];
  const grad = ctx.createLinearGradient(0, 0, 512, 768);
  grad.addColorStop(0, a); grad.addColorStop(1, b);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 768);
  ctx.globalAlpha = 0.08;
  for (let n = 0; n < 1200; n++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
    ctx.fillRect(Math.random() * 512, Math.random() * 768, 1, 1);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(28, 520, 456, 4);
  ctx.fillStyle = "#fff";
  ctx.font = "600 38px serif";
  ctx.fillText(`Vol. ${String(i + 1).padStart(2, "0")}`, 32, 580);
  ctx.font = "500 22px sans-serif";
  ctx.fillText("EDITORA POISSON", 32, 620);
  ctx.font = "400 16px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("ISBN · 978-65-XXXX", 32, 720);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}

type BookProps = {
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
  scrollRef: React.MutableRefObject<number>;
};

function BookMesh({ position, rotation, index, scrollRef, tex, spineColor }:
  Omit<BookProps, "textureUrl"> & { tex: THREE.Texture; spineColor: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ pointer, clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.z = position[2] + scrollRef.current * 22;
    ref.current.rotation.x = rotation[0] + pointer.y * 0.15 + Math.sin(t * 0.7 + index) * 0.08;
    ref.current.rotation.y = rotation[1] + pointer.x * 0.28 + Math.cos(t * 0.55 + index) * 0.08;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={1.0}>
      <mesh ref={ref} position={position} rotation={rotation} castShadow>
        <boxGeometry args={[1.1, 1.6, 0.18]} />
        <meshStandardMaterial attach="material-0" color="#f4ecd8" roughness={0.95} />
        <meshStandardMaterial attach="material-1" color={spineColor} roughness={0.55} metalness={0.1} />
        <meshStandardMaterial attach="material-2" color="#f1e9d3" roughness={0.95} />
        <meshStandardMaterial attach="material-3" color="#f1e9d3" roughness={0.95} />
        <meshStandardMaterial attach="material-4" map={tex} roughness={0.35} metalness={0.15} />
        <meshStandardMaterial attach="material-5" color={spineColor} roughness={0.6} metalness={0.1} />
      </mesh>
    </Float>
  );
}

function ProceduralBook(props: Omit<BookProps, "textureUrl">) {
  const tex = useMemo(() => makeCoverTexture(props.index), [props.index]);
  const spine = PALETTE[props.index % PALETTE.length][1];
  return <BookMesh {...props} tex={tex} spineColor={spine} />;
}

function Book(props: Omit<BookProps, "textureUrl">) {
  return <ProceduralBook {...props} />;
}

function Field({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const { viewport } = useThree();
  const books = useMemo(() => {
    const arr: { p: [number, number, number]; r: [number, number, number]; i: number }[] = [];
    const rng = (seed: number) => { const x = Math.sin(seed * 9999) * 10000; return x - Math.floor(x); };
    const COUNT = 90, MAX_DEPTH = 14;
    for (let i = 0; i < COUNT; i++) {
      const z = -(i / COUNT) * MAX_DEPTH - 0.4;
      const spread = Math.max(viewport.width * 1.9, 18);
      const row = (i % 5) - 1;
      const col = (Math.floor(i / 5) % 9) - 4;
      const jx = (rng(i + 1) - 0.5) * spread * 0.55;
      const jy = (rng(i + 7) - 0.35) * 4.2;
      arr.push({
        p: [col * (spread / 10) + jx, row * 1.7 + jy + 0.6, z],
        r: [(rng(i + 3) - 0.5) * 0.45, (rng(i + 5) - 0.5) * 1.0, (rng(i + 11) - 0.5) * 0.22],
        i,
      });
    }
    return arr;
  }, [viewport.width]);

  return (
    <FollowCursorGroup>
      {books.map((b, idx) => (
        <Book key={idx} position={b.p} rotation={b.r} index={b.i} scrollRef={scrollRef} />
      ))}
    </FollowCursorGroup>
  );
}

function FollowCursorGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const ndc = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ndc.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ndc.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const px = ndc.current.x, py = ndc.current.y;
    const tx = px * 2.2, ty = py * 1.4;
    const k = 1 - Math.pow(0.001, delta);
    ref.current.position.x += (tx - ref.current.position.x) * k;
    ref.current.position.y += (ty - ref.current.position.y) * k;
    ref.current.rotation.y += (px * 0.25 - ref.current.rotation.y) * k;
    ref.current.rotation.x += (-py * 0.18 - ref.current.rotation.x) * k;
  });
  return <group ref={ref}>{children}</group>;
}

export function BookshelfScene({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 62 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      frameloop="always"
      performance={{ min: 0.5 }}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <fog attach="fog" args={["#0a0710", 6, 32]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 6]} intensity={1.4} />
      <directionalLight position={[-6, -3, -2]} intensity={0.5} color="#9bd6ff" />
      <pointLight position={[0, 0, 4]} intensity={1.2} color="#c78bff" />
      <Field scrollRef={scrollRef} />
    </Canvas>
  );
}
