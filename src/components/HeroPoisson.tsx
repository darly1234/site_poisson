import { useState, useEffect } from "react";

const API_BASE = "https://individual.poisson.com.br/api/public";
const TAGS = ["Novo", "Destaque", "Recente", "Popular", "Em Alta"];

const CARD_PALETTES = [
  { bg: "#0c2340", ink: "#5ec4b0", rule: "#2a7a6a" },
  { bg: "#1a1a3e", ink: "#7eb8f0", rule: "#4a78b0" },
  { bg: "#1c3024", ink: "#8ad4a0", rule: "#4a8a60" },
  { bg: "#2a1838", ink: "#c49cee", rule: "#7a5aaa" },
  { bg: "#302010", ink: "#e0a850", rule: "#a07030" },
];

const cardPositions = [
  { transform: "translate(-50%, -50%) translateZ(40px) rotate(-2deg)", filter: "brightness(1)", opacity: 1 },
  { transform: "translate(-50%, -43%) translateZ(0) rotate(3deg)", filter: "brightness(0.85)", opacity: 1 },
  { transform: "translate(-50%, -37%) translateZ(-30px) rotate(-3.5deg)", filter: "brightness(0.7)", opacity: 1 },
  { transform: "translate(-50%, -33%) translateZ(-58px) rotate(4deg)", filter: "brightness(0.55)", opacity: 1 },
  { transform: "translate(-50%, -29%) translateZ(-82px) rotate(-2.5deg)", filter: "brightness(0.4)", opacity: 0.7 },
];

const leavingStyle = {
  transform: "translate(60%, -50%) translateZ(120px) rotate(14deg) scale(0.92)",
  opacity: 0,
  filter: "brightness(1.1)",
};

type Book = {
  id: string;
  title: string;
  author: string;
  year: string;
  area: string;
  blurb: string;
  edition: string;
  cover: string | null;
  tag: string;
  pal: { bg: string; ink: string; rule: string };
};

function parseAutores(raw: string | null | undefined): string {
  if (!raw) return "Editora Poisson";
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0) {
      const first = arr[0];
      const name = typeof first === "string" ? first : (first?.nome ?? first?.name ?? String(first));
      return arr.length === 1 ? name : `${name} et al.`;
    }
  } catch { /**/ }
  return String(raw).split(",")[0].trim();
}

function coverUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("/")) return `https://individual.poisson.com.br${raw}`;
  return raw;
}

function BookCard({ book }: { book: Book }) {
  if (book.cover) {
    return (
      <div style={{
        position: "absolute", inset: 0, borderRadius: "6px", overflow: "hidden",
        boxShadow: "0 28px 56px rgba(0,0,0,0.55), 0 10px 28px rgba(0,0,0,0.35)",
      }}>
        <img src={book.cover} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{
          position: "absolute", left: 0, top: 0, width: "10px", height: "100%",
          background: "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)",
          zIndex: 5,
        }} />
      </div>
    );
  }
  return (
    <div className="p4-card-art">
      <div className="p4-card-frame">
        <div className="p4-card-frame-line p4-card-frame-line--top" />
        <div className="p4-card-frame-line p4-card-frame-line--bottom" />
        <div className="p4-card-top">
          <div className="p4-card-tag">{book.area}</div>
          <div className="p4-card-mark">
            <svg viewBox="0 0 44 44" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="0.6">
              <circle cx="22" cy="22" r="19" /><circle cx="22" cy="22" r="10" />
              <line x1="22" y1="3" x2="22" y2="13" /><line x1="22" y1="31" x2="22" y2="41" />
              <line x1="3" y1="22" x2="13" y2="22" /><line x1="31" y1="22" x2="41" y2="22" />
              <circle cx="22" cy="22" r="2.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </div>
        <div className="p4-card-title">{book.title}</div>
        <div className="p4-card-subtitle">{book.edition}</div>
        <div className="p4-card-rule" />
        <div className="p4-card-foot">
          <div className="p4-card-author">{book.author}</div>
          <div className="p4-card-year">{book.year}</div>
        </div>
      </div>
    </div>
  );
}

export default function HeroPoisson() {
  const [books, setBooks] = useState<Book[]>([]);
  const [order, setOrder] = useState([0, 1, 2, 3, 4]);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/livros/all`)
      .then(r => r.json())
      .then((all: any[]) => {
        const withCovers = all.filter(b => b.capa);
        const source = withCovers.length >= 5 ? withCovers : all;
        const picks = source.slice(0, 5);
        const mapped: Book[] = picks.map((b: any, i: number) => ({
          id: b.id,
          title: b.titulo ?? "Sem título",
          author: parseAutores(b.autores),
          year: b.ano ?? String(new Date().getFullYear()),
          area: b.area ?? "Multidisciplinar",
          blurb: (b.resumo ?? "").replace(/&nbsp;/g, " ").replace(/<[^>]+>/g, "").trim().substring(0, 180) || "Publicação científica em acesso aberto.",
          edition: b.edicao ?? "1ª edição",
          cover: coverUrl(b.capa),
          tag: TAGS[i % TAGS.length],
          pal: CARD_PALETTES[i % CARD_PALETTES.length],
        }));
        setBooks(mapped);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (books.length < 2) return;
    let id: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setLeaving(true);
      id = setTimeout(() => {
        setOrder(prev => [...prev.slice(1), prev[0]]);
        setLeaving(false);
        id = setTimeout(cycle, 3400);
      }, 900);
    };
    id = setTimeout(cycle, 2800);
    return () => clearTimeout(id);
  }, [books]);

  if (books.length === 0) {
    return <div style={{ width: "100%", height: "100vh", background: "#05111e" }} />;
  }

  const top = books[order[0]];
  const count = books.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

        .p4-hero {
          position: relative; width: 100%; height: 100vh; min-height: 680px;
          background: #05111e; color: #e0eaf4; overflow: hidden;
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'DM Sans', sans-serif;
        }
        .p4-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 65% 55% at 72% 48%, rgba(30,110,130,0.20), transparent 70%),
            radial-gradient(ellipse 55% 70% at 22% 55%, rgba(20,60,120,0.18), transparent 70%),
            linear-gradient(165deg, #081c30 0%, #030d18 100%);
        }
        .p4-grain {
          position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0.06;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 128px 128px;
        }
        .p4-glow {
          position: absolute; right: 18%; top: 28%;
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(60,190,170,0.07), transparent 65%);
          z-index: 1; pointer-events: none;
        }

        /* ── LEFT: static page title ── */
        .p4-text {
          position: relative; z-index: 10;
          padding-left: clamp(24px, 6vw, 88px);
          flex: 0 0 auto;
          width: clamp(280px, 44vw, 560px);
          padding-top: clamp(60px, 8vh, 100px);
        }
        .p4-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.30em; text-transform: uppercase;
          color: #3ec4a8; margin-bottom: 24px;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px;
          border: 1px solid rgba(62,196,168,0.35); border-radius: 999px;
        }
        .p4-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #3ec4a8; animation: p4pulse 2s infinite;
        }
        @keyframes p4pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .p4-page-title {
          font-family: 'DM Serif Display', serif; font-weight: 400;
          font-size: clamp(3rem, 6.5vw, 5.5rem);
          line-height: 0.95; letter-spacing: -0.03em; color: #f0f6fc;
          margin: 0 0 20px;
        }
        .p4-page-title span { display: block; color: #3ec4a8; }

        .p4-page-desc {
          font-weight: 300; font-size: 15px; line-height: 1.65;
          color: #7a9cb8; margin: 0 0 32px; max-width: 400px;
        }
        .p4-ctas { display: flex; gap: 14px; align-items: center; margin-bottom: 36px; flex-wrap: wrap; }
        .p4-primary {
          font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          background: #3ec4a8; color: #05111e;
          padding: 14px 24px; border: none; border-radius: 999px;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: background 200ms, transform 200ms; text-decoration: none;
        }
        .p4-primary:hover { background: #60e0c4; transform: translateX(2px); }
        .p4-ghost {
          font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
          background: transparent; color: #90b8d0;
          border: 1px solid rgba(144,184,208,0.30);
          cursor: pointer; padding: 13px 20px; border-radius: 999px;
          transition: background 200ms, color 200ms; text-decoration: none;
        }
        .p4-ghost:hover { background: rgba(200,220,240,0.08); color: #e0eaf4; }
        .p4-progress { display: flex; align-items: center; gap: 7px; }
        .p4-dot {
          width: 22px; height: 2px; background: rgba(200,220,240,0.12);
          border-radius: 1px; transition: background 400ms, width 400ms;
        }
        .p4-dot.is-active { background: #3ec4a8; width: 38px; }
        .p4-progress-label {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.18em; color: #4a7a90; margin-left: 10px;
        }

        /* ── RIGHT: book stack + info ── */
        .p4-right {
          position: relative; z-index: 5;
          flex: 0 0 auto;
          padding-right: clamp(24px, 6vw, 88px);
          display: flex; flex-direction: column; align-items: center;
          gap: 20px;
          padding-top: clamp(60px, 8vh, 100px);
        }

        /* Card stage */
        .p4-stage {
          position: relative;
          width: clamp(200px, 26vw, 360px);
          height: clamp(240px, 34vw, 460px);
          perspective: 2400px; perspective-origin: 50% 50%;
        }
        .p4-stack { position: absolute; inset: 0; transform-style: preserve-3d; }
        .p4-stage-shadow {
          position: absolute; left: 10%; right: 10%; bottom: -8px; height: 36px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.65), transparent 70%);
          filter: blur(6px); pointer-events: none;
        }
        .p4-card {
          position: absolute; top: 50%; left: 50%;
          width: clamp(160px, 20vw, 280px);
          height: clamp(230px, 30vw, 400px);
          transform-origin: 50% 100%;
          transition: transform 900ms cubic-bezier(.34,.08,.30,1),
                      opacity 900ms cubic-bezier(.34,.08,.30,1),
                      filter 900ms ease;
          will-change: transform;
        }

        /* Book info below the stack */
        .p4-book-info {
          text-align: center;
          width: clamp(200px, 26vw, 360px);
          transition: opacity 550ms cubic-bezier(.2,.7,.3,1), transform 550ms cubic-bezier(.2,.7,.3,1);
        }
        .p4-book-info.is-changing { opacity: 0; transform: translateY(10px); }

        .p4-book-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
          color: #3ec4a8; display: inline-flex; align-items: center; gap: 6px;
          margin-bottom: 10px;
        }
        .p4-book-badge-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #3ec4a8;
        }
        .p4-book-area {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.20em; text-transform: uppercase;
          color: #5a9ab8; margin-bottom: 8px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .p4-book-title-text {
          font-family: 'DM Serif Display', serif; font-weight: 400;
          font-size: clamp(1rem, 1.8vw, 1.5rem);
          line-height: 1.15; color: #f0f6fc;
          margin-bottom: 8px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .p4-book-meta {
          font-size: 12px; color: #6a8ea8;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .p4-book-meta-sep { opacity: 0.4; }
        .p4-book-meta-author { color: #90afc8; font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }

        /* Card art (fallback, no cover) */
        .p4-card-art {
          position: absolute; inset: 0; border-radius: 6px;
          background:
            radial-gradient(ellipse at 28% 18%, rgba(255,255,255,0.08), transparent 55%),
            linear-gradient(145deg, var(--c-bg) 0%, color-mix(in oklab, var(--c-bg) 65%, black) 100%);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.05),
            inset 0 0 40px rgba(0,0,0,0.25),
            0 28px 56px rgba(0,0,0,0.55),
            0 10px 28px rgba(0,0,0,0.35);
          color: var(--c-ink);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .p4-card-frame {
          position: relative; width: 82%; height: 85%;
          border: 1px solid color-mix(in oklab, var(--c-ink) 50%, transparent);
          padding: 18px 14px;
          display: flex; flex-direction: column;
          justify-content: space-between; align-items: center;
        }
        .p4-card-frame-line {
          position: absolute; left: 8px; right: 8px; height: 1px;
          background: color-mix(in oklab, var(--c-ink) 35%, transparent);
        }
        .p4-card-frame-line--top { top: 4px; }
        .p4-card-frame-line--bottom { bottom: 4px; }
        .p4-card-top { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .p4-card-tag {
          font-family: 'JetBrains Mono', monospace; font-size: 7px;
          letter-spacing: 0.25em; text-transform: uppercase;
          color: var(--c-rule); opacity: 0.9;
          max-width: 130px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .p4-card-mark { color: var(--c-ink); opacity: 0.8; }
        .p4-card-title {
          font-family: 'DM Serif Display', serif; font-weight: 400;
          font-size: 22px; line-height: 1.1; letter-spacing: 0.01em;
          text-align: center; color: var(--c-ink);
          display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
        }
        .p4-card-subtitle {
          font-size: 11px; font-weight: 300; letter-spacing: 0.06em;
          text-align: center; color: var(--c-ink); opacity: 0.7; margin-top: -2px;
        }
        .p4-card-rule { width: 30px; height: 1px; background: var(--c-ink); opacity: 0.5; }
        .p4-card-foot { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; }
        .p4-card-author {
          font-style: italic; font-size: 11px; color: var(--c-ink); opacity: 0.85;
          max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .p4-card-year {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--c-rule); opacity: 0.7;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .p4-hero { flex-direction: column; justify-content: flex-end; align-items: flex-start; }
          .p4-text { width: 100%; padding: 0 24px 28px; padding-top: 0; }
          .p4-page-desc { display: none; }
          .p4-right {
            position: absolute; top: 0; left: 0; right: 0;
            padding: 0; flex-direction: row; justify-content: center;
            height: 60vh; align-items: flex-end; gap: 0;
          }
          .p4-stage { width: 100%; height: 100%; }
          .p4-book-info { display: none; }
        }
      `}</style>

      <div className="p4-hero">
        <div className="p4-bg" />
        <div className="p4-grain" />
        <div className="p4-glow" />

        {/* LEFT — static title */}
        <div className="p4-text">
          <div className="p4-eyebrow">
            <span className="p4-eyebrow-dot" />
            Editora Poisson
          </div>
          <h1 className="p4-page-title">
            Biblioteca<span>Virtual</span>
          </h1>
          <p className="p4-page-desc">
            Mais de 1.200 títulos científicos em acesso aberto — com ISBN, DOI e ficha catalográfica. Pesquise, leia e cite gratuitamente.
          </p>
          <div className="p4-ctas">
            <a href="/biblioteca" className="p4-primary">Ver Biblioteca <span>→</span></a>
            <a href="/chamadas-abertas" className="p4-ghost">Publicar Pesquisa</a>
          </div>
          <div className="p4-progress">
            {books.map((_, i) => (
              <span key={i} className={`p4-dot ${order[0] === i ? "is-active" : ""}`} />
            ))}
            <span className="p4-progress-label">
              {(order[0] + 1).toString().padStart(2, "0")} / {count.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* RIGHT — book stack + info below */}
        <div className="p4-right">
          <div className="p4-stage">
            <div className="p4-stack">
              {order.map((bookIdx, position) => {
                if (bookIdx >= books.length) return null;
                const book = books[bookIdx];
                const isTop = position === 0;
                const pos = isTop && leaving ? leavingStyle : cardPositions[Math.min(position, cardPositions.length - 1)];
                return (
                  <div
                    key={bookIdx}
                    className="p4-card"
                    style={{
                      "--c-bg": book.pal.bg,
                      "--c-ink": book.pal.ink,
                      "--c-rule": book.pal.rule,
                      zIndex: 10 - position,
                      transform: pos.transform,
                      filter: pos.filter,
                      opacity: pos.opacity,
                    } as React.CSSProperties}
                  >
                    <BookCard book={book} />
                  </div>
                );
              })}
            </div>
            <div className="p4-stage-shadow" />
          </div>

          {/* Book info below the stack */}
          <div className={`p4-book-info ${leaving ? "is-changing" : ""}`}>
            <div className="p4-book-badge">
              <span className="p4-book-badge-dot" />
              {top.tag}
            </div>
            <div className="p4-book-area">{top.area}</div>
            <div className="p4-book-title-text">{top.title}</div>
            <div className="p4-book-meta">
              <span className="p4-book-meta-author">{top.author}</span>
              <span className="p4-book-meta-sep">·</span>
              <span>{top.year}</span>
              <span className="p4-book-meta-sep">·</span>
              <span>Acesso gratuito</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
