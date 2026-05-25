import React, { useState, useEffect, useMemo } from "react";
import { BookOpen, BookmarkPlus, Download, Link2, Check } from "lucide-react";
import { RelatedFan } from "./RelatedFan";
import { enrichBook, relatedBooks, type LibraryBook } from "@/lib/library/data";
import { fetchBook, API_BASE } from "@/lib/library/api";

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
    .replace(/<p[^>]*>\s*<\/p>/gi, "\n\n")
    .replace(/<\/p>\n\n+<p[^>]*>/gi, "\n\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
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

interface BookPageDetailsProps {
  initialBook: LibraryBook;
  relatedBooks: LibraryBook[];
}

export function BookPageDetails({ initialBook, relatedBooks }: BookPageDetailsProps) {
  const [currentBook] = useState<LibraryBook>(initialBook);
  const [activeTab, setActiveTab] = useState<"descricao" | "sumario">("descricao");
  const [added, setAdded] = useState(false);
  const [fullData, setFullData] = useState<{ descHtml?: string; chapters?: any[]; url?: string } | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const [animationClass, setAnimationClass] = useState("animate-book-spin");
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Initialize/reset states when active book changes (either from props or from related selection)
  useEffect(() => {
    // Read from localStorage for initial favorite status
    const saved = localStorage.getItem("library-favorites");
    const favorites = saved ? JSON.parse(saved) : [];
    setAdded(favorites.includes(String(currentBook.id)));

    // Fetch dynamic details (sumario, chapters, etc.)
    setLoadingFull(true);
    setFullData(null);
    fetchBook(currentBook.id)
      .then((d) => setFullData(d))
      .finally(() => setLoadingFull(false));

    // Reset animation class for new book
    setAnimationClass("animate-book-spin");

    // Set share URL safely on the client
    setShareUrl(window.location.href);
  }, [currentBook.id]);

  const enriched = useMemo(() => enrichBook(currentBook), [currentBook]);

  const meta = [
    { label: "Páginas", value: enriched.pages > 0 ? String(enriched.pages) : "—" },
    { label: "Edição", value: enriched.edition },
    { label: "Idioma", value: enriched.language },
    { label: "Formato", value: "apenas PDF" },
    { label: "ISBN", value: enriched.isbn },
    { label: "DOI", value: enriched.doi },
  ];

  const handleToggleFavorite = () => {
    const saved = localStorage.getItem("library-favorites");
    let favorites = saved ? JSON.parse(saved) : [];
    const idStr = String(currentBook.id);
    if (favorites.includes(idStr)) {
      favorites = favorites.filter((f: string) => f !== idStr);
      setAdded(false);
    } else {
      favorites.push(idStr);
      setAdded(true);
    }
    localStorage.setItem("library-favorites", JSON.stringify(favorites));
  };

  const handleSelectBook = (newBook: LibraryBook) => {
    // Smooth scroll to top of page
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Smooth transition: wait for scroll before navigating
    setTimeout(() => {
      const pathPrefix = window.location.pathname.split('/')[1] || "livro";
      window.location.href = `/${pathPrefix}/${newBook.id}`;
    }, 150);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-deep p-6 md:p-10">
      {/* Decorative neon top bar */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${enriched.palette[0]}, ${enriched.palette[1]}, transparent)`,
        }}
      />

      <span className="font-mono text-xs tracking-[0.35em] uppercase text-orange-500">
        {enriched.spine}
      </span>

      {/* Main layout */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-[minmax(220px,300px)_1fr] gap-10 md:gap-14 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Cover */}
        <div>
          <div 
            className={`book-depth-card book-detail-cover w-full aspect-[2/3] ${animationClass}`} 
            key={currentBook.id}
            onAnimationEnd={() => {
              if (animationClass === "animate-book-spin") {
                setAnimationClass("animate-book-float");
              }
            }}
          >
            {/* Back Cover */}
            <div
              className="book-back-cover absolute inset-0 rounded-md shadow-deep"
              style={{
                background: "#fafafa",
              }}
            />
            
            {/* Pages (Right Side) */}
            <div className="book-pages-side" />

            {/* Spine (Left Side) */}
            <div
              className="book-spine-side"
              style={{
                background: "#f0f0f0",
              }}
            />

            {/* Front Cover */}
            <div
              className={`book-front-cover absolute inset-0 overflow-hidden rounded-md shadow-deep ${enriched.cover ? 'bg-[#111]' : 'bg-muted'}`}
              style={{
                background: enriched.cover ? "transparent" : `linear-gradient(135deg, ${enriched.palette[0]} 0%, ${enriched.palette[1]} 100%)`,
              }}
            >
              {enriched.cover && (
                <img
                  src={enriched.cover ? enriched.cover.replace("w=360", "w=800") : undefined}
                  alt={`Capa do livro ${enriched.title}`}
                  className="h-full w-full object-cover scale-[1.015]"
                  loading="eager"
                />
              )}
              {/* spine crease effect overlay inside front cover */}
              <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/20 via-white/5 to-transparent pointer-events-none" />
            </div>
          </div>
          <p className="mt-3 font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground text-center">
            {enriched.spine}
          </p>
        </div>

        {/* Details */}
        <div>
          <h1
            className="font-display font-black leading-[1.05] tracking-tight text-balance"
            style={{ fontSize: titleFontSize(enriched.title) }}
          >
            {enriched.title}
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            por <span className="text-orange-500">{enriched.author}</span>
          </p>

          <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 max-w-xl">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="font-mono text-xs tracking-[0.25em] uppercase text-orange-500">
                  {m.label}
                </dt>
                <dd className={`mt-1 text-base text-foreground ${m.label === 'DOI' ? 'whitespace-nowrap' : 'break-words'}`}>
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={`https://livros.poisson.com.br/leitor/?doi=${encodeURIComponent(enriched.doi)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-[#161616] text-white hover:bg-black/90 font-medium transition-colors text-sm"
            >
              <BookOpen size={16} />
              Ler Online
            </a>

            <button
              onClick={handleToggleFavorite}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 border border-border text-foreground font-medium hover:bg-muted transition-colors text-sm cursor-pointer ${
                added ? 'text-orange-500 border-orange-500/30 bg-orange-500/5' : ''
              }`}
            >
              <BookmarkPlus size={16} />
              <span>{added ? 'Adicionado à estante' : 'Adicionar à estante'}</span>
            </button>
            
            {enriched.doi && (
              <button
                disabled={loadingFull}
                onClick={() => {
                  if (fullData?.url) {
                    window.location.href = `${API_BASE}/download?url=${encodeURIComponent(fullData.url)}&filename=${encodeURIComponent(enriched.title)}.pdf`;
                  } else if (enriched.doi) {
                    window.open(`https://doi.org/${enriched.doi}`, "_blank");
                  }
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 border border-border text-foreground font-medium hover:bg-muted transition-colors text-sm ${
                  loadingFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <Download size={16} />
                <span>{loadingFull ? "Carregando..." : "Baixar Livro"}</span>
              </button>
            )}
          </div>

          {/* Social Sharing Buttons */}
          <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">
              Compartilhar:
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Confira o livro "${enriched.title}" de ${enriched.author} na Editora Poisson: ` + shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                title="Compartilhar no WhatsApp"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.012 2C6.48 2 2.006 6.474 2.006 12c0 2.21.72 4.256 1.942 5.922L2.006 22l4.256-1.12c1.642.894 3.522 1.402 5.514 1.402 5.532 0 10.006-4.474 10.006-10S17.544 2 12.012 2zm6.276 13.911c-.258.732-1.308 1.344-1.854 1.428-.486.078-1.122.144-3.246-.732-2.712-1.116-4.428-3.876-4.566-4.062-.132-.18-.996-1.326-.996-2.526 0-1.2.624-1.794.846-2.034.228-.24.504-.3.672-.3.168 0 .342.006.492.012.156.006.366-.06.576.444.222.54.762 1.854.828 1.986.066.132.108.288.018.468-.09.18-.132.288-.264.444-.132.156-.276.348-.396.468-.132.132-.27.276-.114.54.156.264.69 1.134 1.482 1.842.66.594 1.296.882 1.584 1.026.288.144.456.12.624-.078.168-.198.726-.846.918-1.134.198-.288.396-.24.672-.138.276.102 1.758.828 2.064.984.306.156.51.228.582.354.072.126.072.732-.186 1.464z"/></svg>
              </a>
              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Confira o livro "${enriched.title}" de ${enriched.author} na Editora Poisson`)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                title="Compartilhar no X"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/10 text-black hover:bg-black hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                title="Compartilhar no LinkedIn"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                title="Compartilhar no Facebook"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
              </a>
              {/* Copy Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                title="Copiar Link"
                className="relative w-9 h-9 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm cursor-pointer"
              >
                {copied ? <Check size={15} /> : <Link2 size={15} />}
                
                {copied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-mono py-1.5 px-2.5 rounded shadow-lg whitespace-nowrap animate-bounce">
                    Copiado!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="mt-16 border-t border-border/60 pt-10">
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

          {/* Tab Content */}
          {activeTab === "descricao" && (
            <div className="animate-in fade-in duration-200">
              {enriched.description ? (
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground" style={{ textAlign: "justify" }}>
                  {enriched.description}
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
              ) : (fullData?.chapters || enriched.chapters)?.length > 0 ? (
                <ol className="divide-y divide-border border-y border-border">
                  {((fullData?.chapters as any[]) || enriched.chapters).map((c: any) => (
                    <li
                      key={c.number}
                      className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-4"
                    >
                      <span className="font-mono text-sm tracking-[0.2em] text-orange-500">
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

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="mt-20 border-t border-border/40 pt-10">
          <span className="font-mono text-sm tracking-[0.3em] uppercase text-muted-foreground">
            Veja também
          </span>
          <div className="mt-6">
            <RelatedFan key={currentBook.id} books={relatedBooks} onSelectBook={handleSelectBook} />
          </div>
        </section>
      )}
    </div>
  );
}
