import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BookshelfScene } from "./BookshelfScene";
import { motion, useScroll, useTransform } from "framer-motion";
import { useI18n, I18nProvider } from "@/lib/i18n/I18nProvider";
import { type LibraryBook } from "@/lib/library/data";
import { fetchLibrary } from "@/lib/library/api";
import { BookCover } from "@/components/library/BookCover";
import { BookModal } from "@/components/library/BookModal";
import { ScrambleHeading } from "@/components/library/ScrambleHeading";

const PAGE_SIZE = 15;

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(err: unknown) {
    return { error: String(err) };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "8rem 1.5rem", textAlign: "center", background: "#fff", color: "#111", minHeight: "400px" }}>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#dc2626", marginBottom: "1rem" }}>Erro ao renderizar</p>
          <pre style={{ fontSize: "0.75rem", color: "#555", whiteSpace: "pre-wrap", wordBreak: "break-all", maxWidth: "600px", margin: "0 auto", textAlign: "left", background: "#f5f5f5", padding: "1rem", borderRadius: "0.5rem" }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Biblioteca() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <BibliotecaPage />
      </I18nProvider>
    </ErrorBoundary>
  );
}

function BibliotecaPage() {
  const { t } = useI18n();
  const [rawQuery, setRawQuery] = useState("");
  const [apiQuery, setApiQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<"recent" | "az" | "popular">("recent");
  const [active, setActive] = useState<LibraryBook | null>(null);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const deepLinkHandled = useRef(false);

  // Debounce search → reset page to 1 when query changes
  useEffect(() => {
    const id = setTimeout(() => {
      setApiQuery(rawQuery.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [rawQuery]);

  // Fetch on page, search, category, or sort change
  useEffect(() => {
    setLoading(true);
    fetchLibrary({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      search: apiQuery || undefined,
      category: category !== "favorites" ? category : undefined,
      sort,
    })
      .then(res => {
        setBooks(res.data);
        setTotalBooks(res.total);
        setFetchError(null);
        // Deep link: ?id=I-0123 → abre modal automaticamente (apenas uma vez)
        if (!deepLinkHandled.current) {
          const urlId = new URLSearchParams(window.location.search).get("id");
          if (urlId) {
            deepLinkHandled.current = true;
            fetchLibrary({ limit: 9999 }).then(all => {
              const target = all.data.find(b => b.id === urlId);
              if (target) setActive(target);
            });
          }
        }
      })
      .catch(err => { console.error("Library fetch error:", err); setFetchError(String(err)); })
      .finally(() => setLoading(false));
  }, [page, apiQuery, category, sort]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("library-favorites");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("library-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string | number) => {
    const idStr = String(id);
    setFavorites(prev =>
      prev.includes(idStr) ? prev.filter(f => f !== idStr) : [...prev, idStr]
    );
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  // Favorites filter only (category + sort handled server-side by fetchLibrary)
  const results = useMemo(() => {
    if (category === "favorites") return books.filter(b => favorites.includes(String(b.id)));
    return books;
  }, [books, category, favorites]);

  const totalPages = Math.max(1, Math.ceil(totalBooks / PAGE_SIZE));

  const goTo = useCallback((p: number) => {
    setPage(Math.min(totalPages, Math.max(1, p)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [totalPages]);

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative pt-16 pb-8 px-6 overflow-hidden">
        {/* Nuvem 3D de livros */}
        <div className="pointer-events-none absolute inset-0 z-0" style={{ height: "100%" }}>
          <BookshelfScene />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-[background] duration-300"
          style={{ background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, oklch(0.85 0.18 200 / 0.18), transparent 55%)` }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative mx-auto max-w-6xl">
          <ScrambleHeading
            words={["Biblioteca Virtual"]}
            className="mt-3 font-display text-[clamp(2rem,6vw,4.5rem)] leading-[1.1] tracking-tight text-balance"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 max-w-xl text-base text-muted-foreground text-pretty"
          >
            {t("lib.sub")}
          </motion.p>



          {/* SEARCH BAR */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 relative"
          >
            <div className="border-animated rounded-full glass overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-muted-foreground shrink-0" aria-hidden>
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M20 20L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={rawQuery}
                  onChange={(e) => setRawQuery(e.target.value)}
                  placeholder={t("lib.search.placeholder")}
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground/70"
                />
                <kbd className="hidden md:inline-flex items-center font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground border border-border rounded px-2 py-1">
                  /
                </kbd>
              </div>
            </div>

            {/* sort + counter + view mode */}
            <div className="mt-3 flex items-center justify-between font-mono text-xs tracking-[0.25em] uppercase text-muted-foreground flex-wrap gap-y-2">
              <span className="flex items-center gap-2">
                {(loading || apiQuery) && (
                  <>
                    <span className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-yellow-500 animate-pulse" : "bg-orange-500 animate-pulse"}`} />
                    <span>
                      {loading ? "Carregando..." : `${String(totalBooks).padStart(4, "0")} · ${t("lib.results.count")}`}
                    </span>
                  </>
                )}
              </span>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-3">
                  {(["recent", "az", "popular"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => { setSort(s); setPage(1); }}
                      className={`transition-colors ${sort === s ? "text-foreground" : "hover:text-foreground/60"}`}
                    >
                      {s === "recent" ? "Recente" : s === "az" ? "A–Z" : "Popular"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* GRID */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="py-32 text-center">
              <div className="inline-block w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
              <p className="mt-4 text-muted-foreground font-mono text-sm tracking-widest uppercase">Carregando biblioteca...</p>
            </div>
          ) : fetchError ? (
            <div className="py-32 text-center">
              <p className="font-display text-3xl md:text-4xl tracking-tight">Erro ao carregar</p>
              <p className="mt-3 text-muted-foreground text-sm font-mono">{fetchError}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-32 text-center">
              <p className="font-display text-3xl md:text-4xl tracking-tight">{t("lib.empty.title")}</p>
              <p className="mt-3 text-muted-foreground">{t("lib.empty.sub")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-6 gap-y-12">
              {results.map((book, i) => (
                <BookCover
                  key={book.id}
                  book={book}
                  index={i}
                  onOpen={setActive}
                  isFavorited={favorites.includes(String(book.id))}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {!loading && !fetchError && totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-4">
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border font-mono text-sm tracking-wider uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:border-foreground/40 hover:bg-foreground/5"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Anterior
              </button>

              <span className="font-mono text-sm tracking-[0.2em] text-muted-foreground select-none">
                {String(page).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
              </span>

              <button
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border font-mono text-sm tracking-wider uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:border-foreground/40 hover:bg-foreground/5"
              >
                Próxima
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      <BookModal book={active} allBooks={books} onClose={() => setActive(null)} onSelectBook={setActive} />
    </>
  );
}
