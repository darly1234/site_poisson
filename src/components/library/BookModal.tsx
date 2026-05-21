import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { enrichBook, relatedBooks, type LibraryBook } from "@/lib/library/data";
import { fetchBook, API_BASE } from "@/lib/library/api";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { RelatedFan } from "@/components/library/RelatedFan";
import { BookOpen, BookmarkPlus, Download } from "lucide-react";

function titleFontSize(title: string): string {
  const len = title.length;
  if (len <= 40) return "clamp(2.25rem,5vw,4rem)";
  if (len <= 70) return "clamp(1.75rem,3.5vw,3rem)";
  if (len <= 110) return "clamp(1.25rem,2.5vw,2.25rem)";
  return "clamp(1rem,2vw,1.75rem)";
}

function renderSumario(html: string): string {
  const lines = html
    .replace(/\\r\\n|\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    // Empty <p></p> or <p> </p> → blank separator
    .replace(/<p[^>]*>\s*<\/p>/gi, "\n\n")
    // </p> + existing blank line + <p> → preserve blank separator
    .replace(/<\/p>\n\n+<p[^>]*>/gi, "\n\n")
    // Other </p><p> boundaries → single line break
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    // Strip remaining open/close p tags
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "")
    .split("\n")
    .map(line => line.trim());

  const collapsed: string[] = [];
  let lastWasEmpty = true;
  for (const line of lines) {
    if (line.length === 0) {
      if (!lastWasEmpty) collapsed.push("");
      lastWasEmpty = true;
    } else {
      collapsed.push(line);
      lastWasEmpty = false;
    }
  }
  while (collapsed.length > 0 && collapsed[collapsed.length - 1] === "") collapsed.pop();

  return collapsed
    .map((line, i) => {
      if (line === "") return `<div style="height:1em"></div>`;
      const text = line.replace(/<[^>]+>/g, "").trim();
      const isChapter = /^cap[ií]tulo\s*\d+/i.test(text);
      const prevIsSpacer = i > 0 && collapsed[i - 1] === "";
      const topMargin = isChapter && i > 0 && !prevIsSpacer ? "1em" : "0";
      return `<p style="margin:${topMargin} 0 0 0;line-height:1.6">${line}</p>`;
    })
    .join("");
}

interface BookModalProps {
  book: LibraryBook | null;
  onClose: () => void;
  onSelectBook?: (b: LibraryBook) => void;
  allBooks?: LibraryBook[];
}

export function BookModal({ book, onClose, onSelectBook, allBooks = [] }: BookModalProps) {
  const { t } = useI18n();
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("descricao");
  const [isZoomed, setIsZoomed] = useState(false);
  const [fullData, setFullData] = useState<{ descHtml?: string; chapters?: unknown[]; url?: string } | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAdded(false);
    setActiveTab("descricao");
    setFullData(null);
    
    let t1: any;
    let t2: any;

    // Smooth scroll to top robust animation sequence
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      
      t1 = setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
      
      t2 = setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }, 250);
    }
    
    if (book) {
      setLoadingFull(true);
      fetchBook(book.id).then(d => setFullData(d)).finally(() => setLoadingFull(false));
    }

    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [book?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!book) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("lovable:scroll-lock", { detail: { locked: true } }));
    return () => {
      document.body.style.overflow = prev;
      window.dispatchEvent(new CustomEvent("lovable:scroll-lock", { detail: { locked: false } }));
    };
  }, [book]);

  const data = useMemo(() => (book ? enrichBook(book) : null), [book]);
  const related = useMemo(() => (book ? relatedBooks(book, 10, allBooks) : []), [book, allBooks]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const meta = data
    ? [
        { label: "Páginas", value: data.pages > 0 ? String(data.pages) : "—" },
        { label: "Edição", value: data.edition },
        { label: "Idioma", value: data.language },
        { label: "Formato", value: "apenas PDF" },
        { label: "ISBN", value: data.isbn },
        { label: "DOI", value: data.doi },
      ]
    : [];

  return createPortal(
    <AnimatePresence>
      {book && data && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-3 md:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/82"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
          />

          {/* Sheet — forçar tema claro independente do toggle */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`book-${data.id}-title`}
            data-lenis-prevent
            className="relative w-full max-w-[1100px] overflow-hidden rounded-[1.5rem] border border-border/50 bg-white shadow-deep touch-pan-y flex max-h-[90vh] flex-col"
            style={{
              '--background': 'oklch(0.98 0.005 95)',
              '--foreground': 'oklch(0.16 0.012 250)',
              '--muted-foreground': 'oklch(0.42 0.014 250)',
              '--muted': 'oklch(0.92 0.012 95)',
              '--border': 'oklch(0.16 0.012 250 / 12%)',
              '--card': 'oklch(0.97 0.008 95)',
              '--card-foreground': 'oklch(0.16 0.012 250)',
            } as React.CSSProperties}
            initial={{ y: 60, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close Button - absolute and on top of everything */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-[999] flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-white text-muted-foreground transition-all duration-200 hover:text-foreground cursor-pointer hover:bg-muted hover:scale-110 active:scale-95 shadow-md"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 3L11 11M11 3L3 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div ref={scrollRef} className="overflow-y-auto overflow-x-hidden flex-1">
            {/* Decorative neon top bar */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${data.palette[0]}, ${data.palette[1]}, transparent)`,
              }}
            />

            {/* ─── CONTENT (biblioteca-2 layout) ─── */}
            <div className="px-6 md:px-10 pt-10 md:pt-12 pb-10">
              <span className="font-mono text-xs tracking-[0.35em] uppercase text-[var(--neon)]">
                {data.spine}
              </span>

              {/* HERO: capa + metadados */}
              <section className="mt-6 grid grid-cols-1 md:grid-cols-[minmax(220px,300px)_1fr] gap-10 md:gap-14 items-start">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <motion.div
                    layoutId={`cover-${data.id}`}
                    onClick={() => setIsZoomed(true)}
                    className="aspect-[2/3] w-full overflow-hidden rounded-md shadow-deep border border-border/40 bg-muted cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${data.palette[0]} 0%, ${data.palette[1]} 100%)`,
                    }}
                  >
                    {data.cover && (
                      <img
                        src={data.cover}
                        alt={`Capa do livro ${data.title}`}
                        className="h-full w-full object-cover"
                        loading="eager"
                      />
                    )}
                  </motion.div>
                  <p className="mt-3 font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground">
                    {data.spine}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h1
                    id={`book-${data.id}-title`}
                    className="font-display leading-[1.05] tracking-tight text-balance"
                    style={{ fontSize: titleFontSize(data.title) }}
                  >
                    {data.title}
                  </h1>
                  <p className="mt-4 text-xl text-muted-foreground">
                    por <span className="text-orange-500">{data.author}</span>
                  </p>

                  <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 max-w-xl">
                    {meta.map((m) => (
                      <div key={m.label}>
                        <dt className="font-mono text-xs tracking-[0.25em] uppercase text-orange-500">
                          {m.label}
                        </dt>
                        <dd className={`mt-1 text-base text-foreground ${m.label === 'DOI' ? 'whitespace-nowrap' : 'break-words'}`}>{m.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-10 flex flex-wrap gap-3">
                    <a
                      href={`https://livros.poisson.com.br/leitor/?doi=${encodeURIComponent(data.doi)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-foreground text-background font-medium hover:opacity-90 transition-opacity text-sm"
                    >
                      <BookOpen className="size-4" />
                      Ler Online
                    </a>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 border border-border text-foreground font-medium hover:bg-muted transition-colors text-sm cursor-pointer"
                      onClick={() => setAdded((v) => !v)}
                      aria-pressed={added}
                    >
                      <BookmarkPlus className="size-4" />
                      {added ? "Adicionado à estante" : "Adicionar à estante"}
                    </button>
                    {data.doi && (
                      <button
                        disabled={loadingFull}
                        onClick={() => {
                          if (fullData?.url) {
                            window.location.href = `${API_BASE}/download?url=${encodeURIComponent(fullData.url)}&filename=${encodeURIComponent(data.title)}.pdf`;
                          } else if (data.doi) {
                            window.open(`https://doi.org/${data.doi}`, "_blank");
                          }
                        }}
                        className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 border border-border text-foreground font-medium hover:bg-muted transition-colors text-sm ${loadingFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <Download className={`size-4 ${loadingFull ? 'animate-pulse' : ''}`} />
                        {loadingFull ? "Carregando..." : "Baixar Livro"}
                      </button>
                    )}
                  </div>
                </motion.div>
              </section>

              {/* TABS: Abstract / Sumário */}
              <section className="mt-16">
                <div className="w-full">
                  <div className="flex border-b border-border/60 mb-6 gap-6">
                    <button
                      onClick={() => setActiveTab("descricao")}
                      className={`pb-2 font-mono text-sm tracking-[0.3em] uppercase transition-all border-b-2 cursor-pointer ${
                        activeTab === "descricao"
                          ? "border-orange-500 text-orange-500 font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Abstract
                    </button>
                    <button
                      onClick={() => setActiveTab("sumario")}
                      className={`pb-2 font-mono text-sm tracking-[0.3em] uppercase transition-all border-b-2 cursor-pointer ${
                        activeTab === "sumario"
                          ? "border-orange-500 text-orange-500 font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Sumário
                    </button>
                  </div>

                  {activeTab === "descricao" && (
                    <div className="animate-in fade-in duration-200">
                      {data.description ? (
                        <p className="text-base md:text-lg leading-relaxed text-muted-foreground text-pretty">
                          {data.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground font-mono">Resumo/Abstract não disponível.</p>
                      )}
                    </div>
                  )}

                  {activeTab === "sumario" && (
                    <div className="animate-in fade-in duration-200">
                      {loadingFull ? (
                        <div className="py-10 flex justify-center">
                          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                        </div>
                      ) : fullData?.descHtml ? (
                        <div
                          className="text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic [&_a]:text-orange-500"
                          dangerouslySetInnerHTML={{
                            __html: renderSumario(fullData.descHtml),
                          }}
                        />
                      ) : (fullData?.chapters || data.chapters)?.length > 0 ? (
                        <ol className="divide-y divide-border/60 border-y border-border/60">
                          {((fullData?.chapters as any[]) || data.chapters).map((c: any) => (
                            <li
                              key={c.number}
                              className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-4"
                            >
                              <span className="font-mono text-sm tracking-[0.2em] text-[var(--neon)]">
                                {String(c.number).padStart(2, "0")}
                              </span>
                              <div>
                                <p className="text-base text-foreground">{c.title}</p>
                                {c.authors && (
                                  <p className="mt-1 text-xs text-muted-foreground">{c.authors}</p>
                                )}
                              </div>
                              {c.doi && (
                                <a
                                  href={`https://doi.org/${c.doi}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"
                                >
                                  DOI
                                </a>
                              )}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm text-muted-foreground font-mono">Sumário detalhado não disponível.</p>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* VEJA TAMBÉM */}
              {related.length > 0 && (
                <section className="mt-20 border-t border-border/40 pt-10">
                  <span className="font-mono text-sm tracking-[0.3em] uppercase text-muted-foreground">
                    {t("lib.modal.related")}
                  </span>
                  <div className="mt-6">
                    <RelatedFan key={book.id} books={related} onSelectBook={onSelectBook} />
                  </div>
                </section>
              )}
            </div>

            </div>
          </motion.div>

          {/* Zoomed Cover Overlay */}
          <AnimatePresence>
            {isZoomed && (
              <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 cursor-pointer"
                onClick={() => setIsZoomed(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  layoutId={`cover-${data.id}`}
                  className="aspect-[2/3] h-[80vh] w-auto max-w-[90vw] overflow-hidden rounded-md shadow-deep border border-border/40 bg-muted"
                  style={{
                    background: `linear-gradient(135deg, ${data.palette[0]} 0%, ${data.palette[1]} 100%)`,
                  }}
                >
                  {data.cover && (
                    <img
                      src={data.cover}
                      alt={`Capa do livro ${data.title}`}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
