/**
 * BookshelfSceneCSS.tsx
 * Livros 3D com CSS transforms + rAF. Capas reais da API.
 * Movimento individual por livro com parallax de profundidade.
 */
import { useEffect, useRef, useMemo, useState } from "react";

const API_URL = "https://individual.poisson.com.br/api/public/livros/all";

const PALETTE = [
  { from: "#5ed4ff", to: "#7a3bff", spine: "#2d0f7a" },
  { from: "#ffb072", to: "#ff3d8a", spine: "#991040" },
  { from: "#9bf0c8", to: "#1a8c6a", spine: "#0a4035" },
  { from: "#c78bff", to: "#3a1f7a", spine: "#1a0a50" },
  { from: "#ffe27a", to: "#ff8c00", spine: "#7a4400" },
  { from: "#7ad7ff", to: "#2563eb", spine: "#0a2a7a" },
];

const BW = 128;
const BH = 188;
const BD = 20;

function makeCoverDataUrl(index: number): string {
  const { from, to } = PALETTE[index % PALETTE.length];
  const c = document.createElement("canvas");
  c.width = BW; c.height = BH;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, BW, BH);
  grad.addColorStop(0, from); grad.addColorStop(1, to);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, BW, BH);
  ctx.globalAlpha = 0.06;
  for (let n = 0; n < 400; n++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
    ctx.fillRect(Math.random() * BW, Math.random() * BH, 1, 1);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(6, BH * 0.67, BW - 12, 2);
  ctx.fillStyle = "#fff";
  ctx.font = `700 ${Math.round(BW * 0.22)}px serif`;
  ctx.fillText(`Vol. ${String(index + 1).padStart(2, "0")}`, 7, BH * 0.77);
  ctx.font = `500 ${Math.round(BW * 0.12)}px sans-serif`;
  ctx.fillText("POISSON", 7, BH * 0.87);
  ctx.font = `400 ${Math.round(BW * 0.09)}px monospace`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText("978-65-XXXX", 7, BH * 0.95);
  return c.toDataURL();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type BookData = {
  id: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  baseRx: number;
  baseRy: number;
  baseRz: number;
  opacity: number;
  palette: typeof PALETTE[0];
  floatAmp: number;
  floatFreq: number;
  floatPhase: number;
  floatPhaseX: number;
  parallax: number;
};

function buildBooks(vw: number, vh: number): BookData[] {
  const COUNT = 140;
  const rng = (s: number) => { const x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
  const MAX_Z = 700;
  return Array.from({ length: COUNT }, (_, i) => {
    const t = i / COUNT;
    const z = -t * MAX_Z;
    const depth = 1 - t;
    const spreadX = Math.min(vw * 1.3, 1100);
    const spreadY = vh * 0.8;
    return {
      id: i,
      baseX: (rng(i + 1) - 0.5) * spreadX,
      baseY: (rng(i + 7) - 0.45) * spreadY,
      baseZ: z,
      baseRx: (rng(i + 3) - 0.5) * 24,
      baseRy: (rng(i + 5) - 0.5) * 55,
      baseRz: (rng(i + 11) - 0.5) * 12,
      opacity: Math.max(0.08, 1 - t * 0.88),
      palette: PALETTE[i % PALETTE.length],
      floatAmp: 9 + rng(i + 13) * 18,
      floatFreq: 0.35 + rng(i + 17) * 0.75,
      floatPhase: rng(i + 19) * Math.PI * 2,
      floatPhaseX: rng(i + 23) * Math.PI * 2,
      parallax: 0.25 + depth * 0.75,
    };
  });
}

function Book3D({
  book, coverUrl, bookRef,
}: {
  book: BookData;
  coverUrl: string;
  bookRef: (el: HTMLDivElement | null) => void;
}) {
  const { palette } = book;
  const pages = "#f4ecd8";
  return (
    <div
      ref={bookRef}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: BW,
        height: BH,
        marginLeft: -BW / 2,
        marginTop: -BH / 2,
        transformStyle: "preserve-3d",
        transform: `translate3d(${book.baseX}px,${book.baseY}px,${book.baseZ}px) rotateX(${book.baseRx}deg) rotateY(${book.baseRy}deg) rotateZ(${book.baseRz}deg)`,
        opacity: book.opacity,
        pointerEvents: "none",
        willChange: "transform",
      }}
    >
      {/* Capa frontal */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${coverUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: palette.from,
        transform: `translateZ(${BD / 2}px)`,
        borderRadius: "0 2px 2px 0",
        boxShadow: "inset -4px 0 8px rgba(0,0,0,0.25)",
      }} />
      {/* Capa traseira */}
      <div style={{
        position: "absolute", width: BW, height: BH,
        background: palette.spine,
        transform: `translateZ(${-BD / 2}px) rotateY(180deg)`,
        borderRadius: "0 2px 2px 0",
      }} />
      {/* Lombada */}
      <div style={{
        position: "absolute", width: BD, height: BH,
        background: `linear-gradient(to bottom, ${palette.from}, ${palette.spine})`,
        left: -BD / 2, top: 0,
        transform: `rotateY(-90deg) translateZ(${-BD / 2}px)`,
        transformOrigin: "right center",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        <span style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 7, fontFamily: "sans-serif", fontWeight: 700,
          letterSpacing: "0.15em", writingMode: "vertical-rl",
          textTransform: "uppercase", whiteSpace: "nowrap",
        }}>POISSON</span>
      </div>
      {/* Lateral direita */}
      <div style={{
        position: "absolute", width: BD, height: BH,
        background: palette.spine,
        right: -BD / 2, top: 0,
        transform: `rotateY(90deg) translateZ(${-BD / 2}px)`,
        transformOrigin: "left center",
      }} />
      {/* Topo */}
      <div style={{
        position: "absolute", width: BW, height: BD,
        background: pages, top: -BD / 2, left: 0,
        transform: `rotateX(90deg) translateZ(${-BD / 2}px)`,
        transformOrigin: "center bottom",
      }} />
      {/* Base */}
      <div style={{
        position: "absolute", width: BW, height: BD,
        background: pages, bottom: -BD / 2, left: 0,
        transform: `rotateX(-90deg) translateZ(${-BD / 2}px)`,
        transformOrigin: "center top",
      }} />
    </div>
  );
}

export function BookshelfSceneCSS() {
  const [apiCovers, setApiCovers] = useState<string[]>([]);
  const mouse = useRef({ rawX: 0, rawY: 0, x: 0, y: 0 });
  const raf = useRef<number>(0);
  const bookRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startTime = useRef(performance.now());

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then((data: Array<{ capa?: string; cover?: string }>) => {
        const urls = data.map(b => b.capa || b.cover || "").filter(Boolean);
        setApiCovers(shuffle(urls));
      })
      .catch(() => {});
  }, []);

  const { books, proceduralCovers } = useMemo(() => {
    if (typeof window === "undefined") return { books: [], proceduralCovers: [] };
    const bs = buildBooks(window.innerWidth, window.innerHeight);
    const cv = bs.map(b => makeCoverDataUrl(b.id));
    return { books: bs, proceduralCovers: cv };
  }, []);

  const displayCovers = useMemo(() => {
    if (apiCovers.length === 0) return proceduralCovers;
    return books.map((_, i) => apiCovers[i % apiCovers.length]);
  }, [books, proceduralCovers, apiCovers]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.rawX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.rawY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const loop = (now: number) => {
      const t = (now - startTime.current) * 0.001;
      const k = 0.055;
      mouse.current.x += (mouse.current.rawX - mouse.current.x) * k;
      mouse.current.y += (mouse.current.rawY - mouse.current.y) * k;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      books.forEach((b, i) => {
        const el = bookRefs.current[i];
        if (!el) return;
        const pf = b.parallax;
        const fy = Math.sin(t * b.floatFreq + b.floatPhase) * b.floatAmp;
        const fx = Math.cos(t * b.floatFreq * 0.65 + b.floatPhaseX) * b.floatAmp * 0.35;
        const x = b.baseX + mx * pf * 45 + fx;
        const y = b.baseY - my * pf * 32 + fy;
        const rx = b.baseRx - my * pf * 20 + Math.sin(t * 0.72 + i * 0.42) * 7;
        const ry = b.baseRy + mx * pf * 32 + Math.cos(t * 0.55 + i * 0.63) * 9;
        const rz = b.baseRz + Math.sin(t * 0.28 + i * 1.07) * 2.5;
        el.style.transform = `translate3d(${x}px,${y}px,${b.baseZ}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
      });

      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [books]);

  return (
    <div style={{
      position: "absolute", inset: 0,
      perspective: "1100px",
      perspectiveOrigin: "50% 44%",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        transformStyle: "preserve-3d",
      }}>
        {books.map((book, i) => (
          <Book3D
            key={book.id}
            book={book}
            coverUrl={displayCovers[i] ?? proceduralCovers[i] ?? ""}
            bookRef={el => { bookRefs.current[i] = el; }}
          />
        ))}
      </div>

      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 20%, #0a0710 82%)",
      }} />
    </div>
  );
}
