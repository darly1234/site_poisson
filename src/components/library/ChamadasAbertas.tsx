import { useEffect, useState } from 'react';
import { fetchChamadas } from '@/lib/library/api';

interface Chamada {
  id: string;
  titulo: string;
  area: string | null;
  descricao: string | null;
  prazo: string | null;
  isbn: string | null;
  capa: string | null;
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch { /**/ }
  return dateStr;
};

export default function ChamadasAbertas() {
  const [chamadas, setChamadas] = useState<Chamada[]>([]);
  const [selected, setSelected] = useState<Chamada | null>(null);

  useEffect(() => {
    fetchChamadas().then(data => setChamadas(data)).catch(() => setChamadas([]));
  }, []);

  if (chamadas.length === 0) return null;

  return (
    <section
      className="bg-[var(--background)] text-[var(--foreground)] py-10 overflow-x-hidden px-6"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="serif text-2xl italic tracking-tight text-left">Chamadas Abertas</h2>
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <div className="border-y border-[var(--foreground)]/10 marquee-container py-2">
          <div className="marquee-track">
            {[...chamadas, ...chamadas, ...chamadas].map((c, i) => (
              <div key={i} className="book-item" onClick={() => setSelected(c)}>
                {c.capa ? (
                  <img src={c.capa} alt={c.titulo ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-end p-2"
                    style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[var(--background)] border border-[var(--foreground)]/10 p-8 rounded-2xl max-w-2xl w-full relative text-[var(--foreground)]"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 opacity-50 hover:opacity-100 text-2xl">
              &times;
            </button>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3">
                <div className="book-item shadow-2xl mx-auto w-full h-[250px]">
                  {selected.capa ? (
                    <img src={selected.capa} alt={selected.titulo ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }} />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="serif text-2xl mt-2 mb-4 leading-tight">{selected.titulo}</h2>
                {selected.descricao && (
                  <p
                    className="opacity-70 text-sm leading-relaxed mb-6 line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: selected.descricao }}
                  />
                )}
                <div className="space-y-3">
                  {selected.prazo && (
                    <div className="flex justify-between border-b border-[var(--foreground)]/10 pb-2">
                      <span className="text-xs font-bold">Prazo de envio</span>
                      <span className="text-xs font-bold text-[#ff5f1f]">{formatDate(selected.prazo)}</span>
                    </div>
                  )}
                  {selected.isbn && (
                    <div className="flex justify-between border-b border-[var(--foreground)]/10 pb-2">
                      <span className="opacity-50 text-xs uppercase">ISBN</span>
                      <span className="text-xs font-mono">{selected.isbn}</span>
                    </div>
                  )}
                </div>
                <a
                  href="https://individual.poisson.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mt-8 py-3 rounded-lg font-bold text-sm text-center transition-all duration-200"
                  style={{ background: "transparent", color: "#f97316", border: "1px solid rgba(249,115,22,0.5)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(249,115,22,0.12)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#f97316"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(249,115,22,0.5)"; }}
                >
                  Ir para Submissão
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
