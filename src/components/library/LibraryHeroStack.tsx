import { useState, useEffect } from "react";

const API_BASE = "https://individual.poisson.com.br/api/public";
const TAGS = ["Novo", "Destaque", "Recente", "Popular", "Em Alta"];
const PALETTES = [
  { bg: "#0c2340", ink: "#5ec4b0", rule: "#2a7a6a" },
  { bg: "#1a1a3e", ink: "#7eb8f0", rule: "#4a78b0" },
  { bg: "#1c3024", ink: "#8ad4a0", rule: "#4a8a60" },
  { bg: "#2a1838", ink: "#c49cee", rule: "#7a5aaa" },
  { bg: "#302010", ink: "#e0a850", rule: "#a07030" },
];

const POSITIONS = [
  { transform: "translate(-50%,-50%) translateZ(40px) rotate(-2deg)", filter: "brightness(1)", opacity: 1 },
  { transform: "translate(-50%,-43%) translateZ(0) rotate(3deg)", filter: "brightness(0.85)", opacity: 1 },
  { transform: "translate(-50%,-37%) translateZ(-30px) rotate(-3.5deg)", filter: "brightness(0.7)", opacity: 1 },
  { transform: "translate(-50%,-33%) translateZ(-58px) rotate(4deg)", filter: "brightness(0.55)", opacity: 1 },
  { transform: "translate(-50%,-29%) translateZ(-82px) rotate(-2.5deg)", filter: "brightness(0.4)", opacity: 0.7 },
];
const LEAVING = { transform: "translate(60%,-50%) translateZ(120px) rotate(14deg) scale(0.92)", opacity: 0, filter: "brightness(1.1)" };

type Book = { id: string; title: string; author: string; year: string; area: string; cover: string | null; tag: string; pal: typeof PALETTES[0] };

function parseAutor(raw: string | null): string {
  if (!raw) return "Editora Poisson";
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0) {
      const n = arr[0];
      const name = typeof n === "string" ? n : (n?.nome ?? n?.name ?? String(n));
      return arr.length === 1 ? name : `${name} et al.`;
    }
  } catch { /**/ }
  return String(raw).split(",")[0].trim();
}

function toUrl(raw: string | null): string | null {
  if (!raw) return null;
  return raw.startsWith("/") ? `https://individual.poisson.com.br${raw}` : raw;
}

function Card({ book }: { book: Book }) {
  if (book.cover) {
    return (
      <div style={{ position: "absolute", inset: 0, borderRadius: 6, overflow: "hidden", boxShadow: "0 16px 32px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2)" }}>
        <img src={book.cover} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 8, height: "100%", background: "linear-gradient(90deg,rgba(0,0,0,0.2),transparent)", zIndex: 5 }} />
      </div>
    );
  }
  return (
    <div className="lhs-art">
      <div className="lhs-frame">
        <div className="lhs-line lhs-line--top" /><div className="lhs-line lhs-line--bot" />
        <span className="lhs-tag">{book.area}</span>
        <div className="lhs-title">{book.title}</div>
        <div className="lhs-rule" />
        <div className="lhs-foot">
          <span className="lhs-author">{book.author}</span>
          <span className="lhs-year">{book.year}</span>
        </div>
      </div>
    </div>
  );
}

export default function LibraryHeroStack() {
  const [books, setBooks] = useState<Book[]>([]);
  const [order, setOrder] = useState([0, 1, 2, 3, 4]);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/livros/all`)
      .then(r => r.json())
      .then((all: any[]) => {
        const src = all.filter(b => b.capa).length >= 5 ? all.filter(b => b.capa) : all;
        setBooks(src.slice(0, 5).map((b: any, i: number) => ({
          id: b.id,
          title: b.titulo ?? "Sem título",
          author: parseAutor(b.autores),
          year: b.ano ?? String(new Date().getFullYear()),
          area: b.area ?? "Multidisciplinar",
          cover: toUrl(b.capa),
          tag: TAGS[i % TAGS.length],
          pal: PALETTES[i % PALETTES.length],
        })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (books.length < 2) return;
    let id: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setLeaving(true);
      id = setTimeout(() => {
        setOrder(p => [...p.slice(1), p[0]]);
        setLeaving(false);
        id = setTimeout(cycle, 3400);
      }, 900);
    };
    id = setTimeout(cycle, 2800);
    return () => clearTimeout(id);
  }, [books]);

  if (books.length === 0) return null;

  const top = books[order[0]];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
        .lhs-wrap { display:flex; flex-direction:column; align-items:center; gap:18px; user-select:none; }
        .lhs-stage {
          position:relative;
          width:clamp(180px,20vw,280px);
          height:clamp(250px,28vw,390px);
          perspective:2200px; perspective-origin:50% 50%;
          flex-shrink:0;
        }
        .lhs-stack { position:absolute; inset:0; transform-style:preserve-3d; }
        .lhs-shadow {
          position:absolute; left:8%; right:8%; bottom:-6px; height:28px;
          background:radial-gradient(ellipse,rgba(0,0,0,0.55),transparent 70%);
          filter:blur(5px); pointer-events:none;
        }
        .lhs-card {
          position:absolute; top:50%; left:50%;
          width:clamp(140px,16vw,220px);
          height:clamp(200px,22vw,310px);
          transform-origin:50% 100%;
          transition:transform 900ms cubic-bezier(.34,.08,.30,1),
                     opacity 900ms cubic-bezier(.34,.08,.30,1),
                     filter 900ms ease;
          will-change:transform;
        }
        .lhs-info {
          text-align:center;
          width:clamp(180px,20vw,280px);
          margin-top:18px;
          transition:opacity 500ms cubic-bezier(.2,.7,.3,1),transform 500ms cubic-bezier(.2,.7,.3,1);
        }
        .lhs-info.leaving { opacity:0; transform:translateY(8px); }
        .lhs-badge {
          font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:.28em;
          text-transform:uppercase; color:#3ec4a8;
          display:inline-flex; align-items:center; gap:5px; margin-bottom:8px;
        }
        .lhs-badge-dot { width:5px; height:5px; border-radius:50%; background:#3ec4a8; }
        .lhs-area {
          font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:.18em;
          text-transform:uppercase; color:#5a9ab8; margin-bottom:6px;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        .lhs-book-title {
          font-family:'DM Serif Display',serif; font-weight:400;
          font-size:clamp(.9rem,1.6vw,1.25rem); line-height:1.15; color:#111111;
          margin-bottom:0;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .lhs-meta { font-size:11px; color:#6a8ea8; display:flex; align-items:center; justify-content:center; gap:7px; flex-wrap:wrap; }
        .lhs-meta-sep { opacity:.35; }
        .lhs-meta-author { color:#90afc8; font-style:italic; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:160px; }
        /* fallback card art */
        .lhs-art {
          position:absolute; inset:0; border-radius:6px;
          background:radial-gradient(ellipse at 28% 18%,rgba(255,255,255,.08),transparent 55%),
                      linear-gradient(145deg,var(--c-bg) 0%,color-mix(in oklab,var(--c-bg) 65%,black) 100%);
          box-shadow:inset 0 0 0 1px rgba(255,255,255,.05),0 24px 48px rgba(0,0,0,.5);
          color:var(--c-ink); display:flex; align-items:center; justify-content:center; overflow:hidden;
        }
        .lhs-frame {
          width:82%; height:85%;
          border:1px solid color-mix(in oklab,var(--c-ink) 50%,transparent);
          padding:16px 12px; display:flex; flex-direction:column;
          justify-content:space-between; align-items:center; position:relative;
        }
        .lhs-line { position:absolute; left:8px; right:8px; height:1px; background:color-mix(in oklab,var(--c-ink) 35%,transparent); }
        .lhs-line--top { top:4px; } .lhs-line--bot { bottom:4px; }
        .lhs-tag { font-family:'JetBrains Mono',monospace; font-size:7px; letter-spacing:.25em; text-transform:uppercase; color:var(--c-rule); opacity:.9; text-align:center; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .lhs-title { font-family:'DM Serif Display',serif; font-size:20px; line-height:1.1; text-align:center; color:var(--c-ink); display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden; }
        .lhs-rule { width:28px; height:1px; background:var(--c-ink); opacity:.5; }
        .lhs-foot { display:flex; flex-direction:column; align-items:center; gap:3px; text-align:center; }
        .lhs-author { font-style:italic; font-size:11px; color:var(--c-ink); opacity:.85; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .lhs-year { font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:.25em; text-transform:uppercase; color:var(--c-rule); opacity:.7; }
      `}</style>

      <div className="lhs-wrap">
        <div className="lhs-stage">
          <div className="lhs-stack">
            {order.map((idx, pos) => {
              if (idx >= books.length) return null;
              const b = books[idx];
              const isTop = pos === 0;
              const s = isTop && leaving ? LEAVING : POSITIONS[Math.min(pos, POSITIONS.length - 1)];
              return (
                <div
                  key={idx}
                  className="lhs-card"
                  style={{ "--c-bg": b.pal.bg, "--c-ink": b.pal.ink, "--c-rule": b.pal.rule, zIndex: 10 - pos, transform: s.transform, filter: s.filter, opacity: s.opacity } as React.CSSProperties}
                >
                  <Card book={b} />
                </div>
              );
            })}
          </div>
          <div className="lhs-shadow" />
        </div>

        <div className={`lhs-info ${leaving ? "leaving" : ""}`}>
          <div className="lhs-book-title">{top.title}</div>
        </div>
      </div>
    </>
  );
}
