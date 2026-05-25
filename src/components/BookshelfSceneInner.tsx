import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import * as THREE from "three";

const API_URL = "https://individual.poisson.com.br/api/public/livros/all";

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
  textureUrl?: string;
};

function BookMesh({ position, rotation, index, scrollRef, tex, spineColor }:
  Omit<BookProps, "textureUrl"> & { tex: THREE.Texture; spineColor: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ pointer, clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.z = position[2] + scrollRef.current * 22;
    ref.current.rotation.x = rotation[0] + pointer.y * 0.28 + Math.sin(t * 0.9 + index) * 0.14;
    ref.current.rotation.y = rotation[1] + pointer.x * 0.45 + Math.cos(t * 0.65 + index) * 0.14;
  });
  return (
    <Float speed={2.4} rotationIntensity={0.65} floatIntensity={1.6}>
      <mesh ref={ref} position={position} rotation={rotation} castShadow>
        <boxGeometry args={[1.4, 2.0, 0.22]} />
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

const colorCache = new Map<string, Promise<string>>();
function extractDominantColor(url: string): Promise<string> {
  const cached = colorCache.get(url);
  if (cached) return cached;
  const p = new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = 24, h = 36;
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve("#1a1320");
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        if (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235) continue;
        r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
      }
      if (!n) return resolve("#1a1320");
      r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
      const d = (v: number) => Math.max(0, Math.round(v * 0.78));
      resolve(`rgb(${d(r)}, ${d(g)}, ${d(b)})`);
    };
    img.onerror = () => resolve("#1a1320");
    img.src = url;
  });
  colorCache.set(url, p);
  return p;
}

function RealCoverBook(props: Omit<BookProps, "textureUrl"> & { textureUrl: string }) {
  const loaded = useTexture(props.textureUrl) as THREE.Texture;
  loaded.colorSpace = THREE.SRGBColorSpace; loaded.anisotropy = 8;
  const [spine, setSpine] = useState<string>("#1a1320");
  useEffect(() => {
    extractDominantColor(props.textureUrl).then(setSpine).catch(() => {});
  }, [props.textureUrl]);
  return <BookMesh {...props} tex={loaded} spineColor={spine} />;
}

function Book({ textureUrl, ...rest }: BookProps) {
  if (!textureUrl) return <ProceduralBook {...rest} />;
  return (
    <Suspense fallback={<ProceduralBook {...rest} />}>
      <RealCoverBook {...rest} textureUrl={textureUrl} />
    </Suspense>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Field({ scrollRef, covers }: { scrollRef: React.MutableRefObject<number>; covers: string[] }) {
  const { viewport } = useThree();
  const books = useMemo(() => {
    const arr: { p: [number, number, number]; r: [number, number, number]; i: number; t?: string }[] = [];
    const rng = (seed: number) => { const x = Math.sin(seed * 9999) * 10000; return x - Math.floor(x); };
    const COUNT = 250, MAX_DEPTH = 14;
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
        t: covers.length > 0 ? covers[i % covers.length] : undefined,
      });
    }
    return arr;
  }, [viewport.width, covers]);

  return (
    <FollowCursorGroup>
      {books.map((b, idx) => (
        <Book key={idx} position={b.p} rotation={b.r} index={b.i} scrollRef={scrollRef} textureUrl={b.t} />
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

export function BookshelfSceneInner() {
  const scrollRef = useRef(0);
  const [covers, setCovers] = useState<string[]>([]);

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then((data: Array<{ cover?: string; capa?: string }>) => {
        const urls = data.map(b => b.cover || b.capa || "").filter(Boolean);
        setCovers(shuffle(urls));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 62 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      frameloop="always"
      performance={{ min: 0.5 }}
      style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
    >
      <fog attach="fog" args={["#0a0710", 6, 32]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 6]} intensity={1.4} />
      <directionalLight position={[-6, -3, -2]} intensity={0.5} color="#9bd6ff" />
      <pointLight position={[0, 0, 4]} intensity={1.2} color="#c78bff" />
      <Field scrollRef={scrollRef} covers={covers} />
    </Canvas>
  );
}
