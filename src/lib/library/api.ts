import type { LibraryBook } from "./data";

export const API_BASE = "https://individual.poisson.com.br/api/public";

const PALETTES: [string, string][] = [
  ["oklch(0.55 0.22 280)", "oklch(0.78 0.18 200)"],
  ["oklch(0.5 0.2 30)", "oklch(0.82 0.16 70)"],
  ["oklch(0.45 0.25 140)", "oklch(0.75 0.18 100)"],
  ["oklch(0.6 0.2 310)", "oklch(0.82 0.15 250)"],
  ["oklch(0.5 0.2 190)", "oklch(0.8 0.15 150)"],
  ["oklch(0.52 0.22 40)", "oklch(0.78 0.18 80)"],
  ["oklch(0.48 0.2 260)", "oklch(0.76 0.16 220)"],
  ["oklch(0.55 0.18 160)", "oklch(0.8 0.14 120)"],
];

function hashId(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function parseAutores(raw: string | null | undefined): string {
  if (!raw) return "Editora Poisson";
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0) {
      const first = arr[0];
      const name = typeof first === "string" ? first : (first?.nome ?? first?.name ?? first?.autor ?? String(first));
      return arr.length === 1 ? name : `${name} et al.`;
    }
  } catch {
    // not JSON, use as-is
  }
  return String(raw).split(",")[0].trim();
}

function areaToCategory(area: string | null): string {
  if (!area) return "essay";
  const a = area.toLowerCase();
  if (a.includes("saúde") || a.includes("biológi") || a.includes("agrár")) return "science";
  if (a.includes("engenharia") || a.includes("exatas") || a.includes("tecnologia")) return "science";
  if (a.includes("letras") || a.includes("linguísti") || a.includes("literatura")) return "literature";
  if (a.includes("filosof") || a.includes("humanas")) return "philosophy";
  return "essay";
}

interface ApiBookLight {
  id: string;
  titulo: string | null;
  autores: string | null;
  isbn: string | null;
  doi: string | null;
  area: string | null;
  resumo: string | null;
  paginas: string | null;
  ano: string | null;
  edicao: string | null;
  tipo: string;
  capa: string | null;
}

interface ApiBookFull extends ApiBookLight {
  descricao: string | null;
  url: string | null;
  chapters: null | unknown[];
  artigos?: unknown[];
}

function mapApiBook(raw: ApiBookLight): LibraryBook {
  const seed = hashId(raw.id);
  const year = parseInt(raw.ano ?? "") || new Date().getFullYear();
  return {
    id: raw.id,
    title: raw.titulo ?? "Sem título",
    author: parseAutores(raw.autores),
    year: year > 2030 ? year - 2000 : year,
    pages: parseInt(raw.paginas ?? "") || 0,
    category: areaToCategory(raw.area) as any,
    palette: PALETTES[seed % PALETTES.length],
    spine: raw.id,
    excerpt: (raw.resumo ?? "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().substring(0, 220),
    popularity: 70 + (seed % 30),
    cover: raw.capa ?? undefined,
    isbn: raw.isbn ?? undefined,
    doi: raw.doi ?? undefined,
    organizer: parseAutores(raw.autores),
    description: raw.resumo ?? undefined,
    edition: raw.edicao ?? "1ª edição",
    language: "Português",
    format: "PDF · Acesso aberto",
  };
}

// ─── Module-level cache & Retry Utility ────────────────────────────────────────────────────

async function fetchWithRetry(url: string, retries = 5, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        console.warn(`[API] Rate limit/Error ${res.status} on ${url}. Retrying in ${delay}ms (attempt ${i + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
        continue;
      }
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[API] Network error on ${url}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries.`);
}

let _cache: ApiBookLight[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

async function loadAll(): Promise<ApiBookLight[]> {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL) return _cache;
  const res = await fetchWithRetry(`${API_BASE}/livros/all`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  _cache = await res.json();
  _cacheTime = now;
  return _cache!;
}

// ─── Public API ────────────────────────────────────────────────────────────

export interface FetchLibraryOptions {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
  sort?: "recent" | "az" | "popular";
}

export interface FetchLibraryResult {
  total: number;
  limit: number;
  offset: number;
  data: LibraryBook[];
}

export async function fetchLibrary(options?: FetchLibraryOptions): Promise<FetchLibraryResult> {
  const all = await loadAll();
  const q = (options?.search ?? "").toLowerCase().trim();
  const cat = options?.category;
  const sort = options?.sort ?? "recent";

  let filtered = q
    ? all.filter(b =>
        (b.titulo ?? "").toLowerCase().includes(q) ||
        (b.autores ?? "").toLowerCase().includes(q) ||
        (b.isbn ?? "").includes(q)
      )
    : [...all];

  if (cat && cat !== "all" && cat !== "favorites") {
    filtered = filtered.filter(b => areaToCategory(b.area) === cat);
  }

  if (sort === "az") {
    filtered = filtered.sort((a, b) => (a.titulo ?? "").localeCompare(b.titulo ?? ""));
  } else if (sort === "popular") {
    filtered = filtered.sort((a, b) => (hashId(b.id) % 30) - (hashId(a.id) % 30));
  } else {
    // "recent" — ano decrescente; anos futuros (erros de dados) vão para o fim;
    // empate desfeito pela parte numérica do ID (ex: "I-0444" → 444)
    const currentYear = new Date().getFullYear();
    const numId = (id: string) => parseInt(id.replace(/\D/g, "")) || 0;
    filtered = filtered.sort((a, b) => {
      const ya = parseInt(a.ano ?? "0") || 0;
      const yb = parseInt(b.ano ?? "0") || 0;
      const ea = ya > currentYear ? -1 : ya;
      const eb = yb > currentYear ? -1 : yb;
      if (eb !== ea) return eb - ea;
      return numId(b.id) - numId(a.id);
    });
  }

  const limit = options?.limit ?? 15;
  const offset = options?.offset ?? 0;

  return {
    total: filtered.length,
    limit,
    offset,
    data: filtered.slice(offset, offset + limit).map(mapApiBook),
  };
}

export async function fetchBook(id: string): Promise<{ descHtml?: string; chapters?: unknown[]; url?: string } | null> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/livros/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const raw: ApiBookFull = await res.json();
    return {
      descHtml: raw.descricao ?? undefined,
      chapters: Array.isArray(raw.chapters) && raw.chapters.length > 0 ? raw.chapters : (Array.isArray(raw.artigos) ? raw.artigos : undefined),
      url: raw.url ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function fetchAreas(): Promise<{ area: string; total: string }[]> {
  const res = await fetch(`${API_BASE}/areas`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchChamadas() {
  const res = await fetch(`${API_BASE}/chamadas`);
  if (!res.ok) return [];
  return res.json();
}
