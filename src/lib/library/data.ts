export type LibraryCategory = string;

export interface BookChapter {
  number: number;
  title: string;
  authors: string;
  doi: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  year: number;
  pages: number;
  category: LibraryCategory;
  /** Two oklch tones used to build a generated cover gradient */
  palette: [string, string];
  /** Optional real cover image (used when present, falls back to the gradient) */
  cover?: string;
  /** A short, type-set spine label */
  spine: string;
  /** Excerpt for the modal */
  excerpt: string;
  /** Pseudo popularity score */
  popularity: number;
  /** Optional rich metadata for the premium modal */
  isbn?: string;
  doi?: string;
  organizer?: string;
  description?: string;    // resumo completo (abstract) → aba Descrição
  descHtml?: string;       // HTML do sumário (wp_description) → aba Sumário
  chapters?: BookChapter[];
  edition?: string;
  language?: string;
  doi_registered_at?: string;
  allAuthors?: string[];
}

/**
 * Editorial dataset — generated covers (no external assets) so the page
 * stays fast and visually cohesive with the V3 dark/neon system.
 */
export const LIBRARY: LibraryBook[] = [
  {
    id: "p-001",
    title: "A forma do tempo",
    author: "Helena Vasques",
    year: 2024,
    pages: 312,
    category: "essay",
    palette: ["oklch(0.55 0.22 280)", "oklch(0.78 0.18 200)"],
    spine: "POISSON · 001",
    excerpt:
      "Um ensaio sobre como narrativas longas se dobram sobre si mesmas — e como o leitor se torna parte da arquitetura.",
    popularity: 94,
    isbn: "978-65-5866-657-8",
    doi: "10.36229/978-65-5866-657-8",
    organizer: "José Henrique Porto Silveira",
    description:
      "Este livro reúne ensaios selecionados sobre a percepção contemporânea do tempo narrativo, abordando temas como ritmo, duração, repetição e a arquitetura interna de obras longas. Os capítulos exploram a relação entre leitor e estrutura, a efetividade de pausas dramáticas e a importância do silêncio na construção de sentido. Além disso, o livro apresenta propostas de leitura crítica para os próximos dez anos.",
    chapters: [
      {
        number: 1,
        title: "A dobra do parágrafo: tempo e arquitetura no ensaio longo",
        authors: "Helena Vasques, Marina Couto",
        doi: "10.36229/978-65-5866-657-8.CAP.01",
      },
      {
        number: 2,
        title: "Ritmo, repetição e a memória do leitor",
        authors: "Otávio Mendes, Clara Benedetti",
        doi: "10.36229/978-65-5866-657-8.CAP.02",
      },
      {
        number: 3,
        title: "Topologias da pausa: silêncios produtivos",
        authors: "Aiko Tanaka, Tomás Reis",
        doi: "10.36229/978-65-5866-657-8.CAP.03",
      },
      {
        number: 4,
        title: "O leitor como arquiteto: hipóteses sobre presença",
        authors: "Inês Albuquerque, Bruno Aldaz",
        doi: "10.36229/978-65-5866-657-8.CAP.04",
      },
      {
        number: 5,
        title: "Cosmologias menores da leitura demorada",
        authors: "Ravi Krishnan, Yara Nakamura",
        doi: "10.36229/978-65-5866-657-8.CAP.05",
      },
      {
        number: 6,
        title: "Materiais para uma vertigem editorial",
        authors: "Eitan Halevy, Lia Ferraz",
        doi: "10.36229/978-65-5866-657-8.CAP.06",
      },
      {
        number: 7,
        title: "Notas sobre o silêncio no ensaio brasileiro",
        authors: "Sofia Lemos, Pedro Vidal",
        doi: "10.36229/978-65-5866-657-8.CAP.07",
      },
      {
        number: 8,
        title: "A geometria do leitor — método e erro",
        authors: "Coletivo Poisson",
        doi: "10.36229/978-65-5866-657-8.CAP.08",
      },
    ],
    edition: "1ª edição",
    language: "Português",
    format: "PDF / ePub · Acesso aberto",
  },
  {
    id: "p-002",
    title: "Cartas de um futuro recente",
    author: "Otávio Mendes",
    year: 2025,
    pages: 248,
    category: "literature",
    palette: ["oklch(0.5 0.2 30)", "oklch(0.82 0.16 70)"],
    spine: "POISSON · 002",
    excerpt:
      "Trinta e duas cartas escritas a partir de 2031, endereçadas a um presente que ainda hesita.",
    popularity: 88,
  },
  {
    id: "p-003",
    title: "Topologia do invisível",
    author: "Dra. Aiko Tanaka",
    year: 2023,
    pages: 412,
    category: "science",
    palette: ["oklch(0.45 0.22 240)", "oklch(0.85 0.18 200)"],
    spine: "POISSON · 003",
    excerpt:
      "Geometria diferencial aplicada a sistemas dinâmicos não-observáveis. Capítulo introdutório aberto.",
    popularity: 71,
  },
  {
    id: "p-004",
    title: "O que resta depois",
    author: "Marina Couto",
    year: 2022,
    pages: 184,
    category: "poetry",
    palette: ["oklch(0.4 0.18 320)", "oklch(0.78 0.16 340)"],
    spine: "POISSON · 004",
    excerpt: "Cinquenta poemas curtos sobre ausência, repetição e a beleza do que sobra.",
    popularity: 82,
  },
  {
    id: "p-005",
    title: "Manifesto do pensamento lento",
    author: "Bruno Aldaz",
    year: 2024,
    pages: 96,
    category: "philosophy",
    palette: ["oklch(0.3 0.05 250)", "oklch(0.82 0.16 70)"],
    spine: "POISSON · 005",
    excerpt:
      "Um pequeno tratado contra a urgência. Em defesa do parágrafo longo e da pausa antes da resposta.",
    popularity: 96,
  },
  {
    id: "p-006",
    title: "Arquitetura das marés",
    author: "Sofia Lemos",
    year: 2021,
    pages: 356,
    category: "literature",
    palette: ["oklch(0.45 0.18 200)", "oklch(0.78 0.18 160)"],
    spine: "POISSON · 006",
    excerpt: "Romance fluvial em três partes, ambientado no delta do Paraíba.",
    popularity: 65,
  },
  {
    id: "p-007",
    title: "Cosmologias menores",
    author: "Ravi Krishnan",
    year: 2025,
    pages: 280,
    category: "science",
    palette: ["oklch(0.4 0.2 290)", "oklch(0.7 0.2 320)"],
    spine: "POISSON · 007",
    excerpt: "Modelos alternativos para universos de baixa densidade — para leitores curiosos.",
    popularity: 78,
  },
  {
    id: "p-008",
    title: "Notas sobre o silêncio",
    author: "Clara Benedetti",
    year: 2020,
    pages: 144,
    category: "essay",
    palette: ["oklch(0.25 0.02 250)", "oklch(0.85 0.18 200)"],
    spine: "POISSON · 008",
    excerpt: "Ensaio fragmentário sobre as várias formas de não dizer.",
    popularity: 73,
  },
  {
    id: "p-009",
    title: "Hipóteses para depois do fim",
    author: "Dr. Eitan Halevy",
    year: 2024,
    pages: 392,
    category: "philosophy",
    palette: ["oklch(0.5 0.22 30)", "oklch(0.7 0.2 50)"],
    spine: "POISSON · 009",
    excerpt: "Um livro de filosofia política para o século que ainda não nomeamos.",
    popularity: 90,
  },
  {
    id: "p-010",
    title: "Estação dos pássaros breves",
    author: "Yara Nakamura",
    year: 2023,
    pages: 132,
    category: "poetry",
    palette: ["oklch(0.55 0.16 150)", "oklch(0.82 0.16 90)"],
    spine: "POISSON · 010",
    excerpt: "Haicais e prosa-poética sobre a migração dos andorinhões.",
    popularity: 68,
  },
  {
    id: "p-011",
    title: "Algoritmos do desejo",
    author: "Pedro Vidal",
    year: 2025,
    pages: 224,
    category: "essay",
    palette: ["oklch(0.45 0.22 320)", "oklch(0.85 0.18 200)"],
    spine: "POISSON · 011",
    excerpt: "Crítica cultural sobre como sistemas de recomendação reescrevem o gosto.",
    popularity: 92,
  },
  {
    id: "p-012",
    title: "A geometria do leitor",
    author: "Inês Albuquerque",
    year: 2022,
    pages: 268,
    category: "literature",
    palette: ["oklch(0.35 0.1 270)", "oklch(0.8 0.18 200)"],
    spine: "POISSON · 012",
    excerpt: "Romance epistolar entre uma editora e um leitor anônimo.",
    popularity: 76,
  },
  {
    id: "p-013",
    title: "Materiais para uma vertigem",
    author: "Tomás Reis",
    year: 2024,
    pages: 196,
    category: "philosophy",
    palette: ["oklch(0.3 0.08 250)", "oklch(0.7 0.2 320)"],
    spine: "POISSON · 013",
    excerpt: "Notas filosóficas sobre o vertigem como método de conhecimento.",
    popularity: 81,
  },
  {
    id: "p-014",
    title: "Caderno de campo — Pantanal",
    author: "Dra. Beatriz Ohara",
    year: 2023,
    pages: 348,
    category: "science",
    palette: ["oklch(0.5 0.16 130)", "oklch(0.78 0.16 90)"],
    spine: "POISSON · 014",
    excerpt: "Quinze anos de observação de aves migratórias e suas rotas em mutação.",
    popularity: 70,
  },
  {
    id: "p-015",
    title: "Pequenas teorias do crepúsculo",
    author: "Lia Ferraz",
    year: 2021,
    pages: 168,
    category: "poetry",
    palette: ["oklch(0.45 0.18 30)", "oklch(0.78 0.18 350)"],
    spine: "POISSON · 015",
    excerpt: "Poemas longos sobre as horas que não cabem na agenda.",
    popularity: 64,
  },
  {
    id: "p-016",
    title: "Atlas das ideias possíveis",
    author: "Coletivo Poisson",
    year: 2026,
    pages: 512,
    category: "essay",
    palette: ["oklch(0.4 0.2 200)", "oklch(0.7 0.2 320)"],
    spine: "POISSON · 016",
    excerpt:
      "Um atlas curado por dezenove autores — mapas, ensaios e diagramas para os próximos dez anos.",
    popularity: 99,
  },
  {
    id: "p-017",
    title: "Diário de um observador comum",
    author: "Eduardo Sant'Anna",
    year: 2020,
    pages: 220,
    category: "literature",
    palette: ["oklch(0.3 0.04 250)", "oklch(0.78 0.16 70)"],
    spine: "POISSON · 017",
    excerpt: "Crônicas de um homem que decide registrar tudo o que percebe num inverno.",
    popularity: 60,
  },
  {
    id: "p-018",
    title: "O método e o erro",
    author: "Dra. Inês Pavlova",
    year: 2025,
    pages: 304,
    category: "science",
    palette: ["oklch(0.4 0.18 280)", "oklch(0.85 0.18 200)"],
    spine: "POISSON · 018",
    excerpt: "Ensaio sobre epistemologia experimental e o papel produtivo do erro.",
    popularity: 85,
  },
];

export const CATEGORY_KEYS: { value: string; labelKey: string }[] = [
  { value: "all", labelKey: "lib.filter.all" },
  { value: "science", labelKey: "lib.filter.science" },
  { value: "literature", labelKey: "lib.filter.literature" },
  { value: "essay", labelKey: "lib.filter.essay" },
  { value: "philosophy", labelKey: "lib.filter.philosophy" },
  { value: "favorites", labelKey: "lib.filter.favorites" },
];

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const POOL_AUTHORS = [
  "Helena Vasques",
  "Otávio Mendes",
  "Aiko Tanaka",
  "Marina Couto",
  "Bruno Aldaz",
  "Sofia Lemos",
  "Ravi Krishnan",
  "Clara Benedetti",
  "Eitan Halevy",
  "Yara Nakamura",
  "Pedro Vidal",
  "Inês Albuquerque",
  "Tomás Reis",
  "Beatriz Ohara",
  "Lia Ferraz",
];

const POOL_TOPICS: Record<LibraryCategory, string[]> = {
  science: [
    "Modelagem de sistemas dinâmicos não-lineares",
    "Análise comparativa de métodos experimentais",
    "Aplicações em campo: estudo de caso",
    "Caracterização físico-química e implicações",
    "Métricas, incerteza e validação de dados",
    "Perspectivas para a próxima década",
  ],
  philosophy: [
    "Premissas, método e horizonte conceitual",
    "Crítica das categorias herdadas",
    "O sujeito e a forma do tempo",
    "Ética, política e responsabilidade",
    "Diálogos com a tradição contemporânea",
    "Notas para uma síntese provisória",
  ],
  literature: [
    "Abertura: a voz e o lugar",
    "Personagens e arquitetura emocional",
    "Tempo, memória e estrutura narrativa",
    "O coro: vozes secundárias",
    "Reviravolta e desenlace",
    "Coda: o que permanece",
  ],
  essay: [
    "Hipótese inicial e contexto",
    "Genealogia do problema",
    "Análise crítica e contraposições",
    "Estudos de caso ilustrativos",
    "Síntese: tese e implicações",
    "Conclusão e horizontes abertos",
  ],
  poetry: [
    "Primeira sequência — luz",
    "Segunda sequência — silêncio",
    "Intermezzo — notas marginais",
    "Terceira sequência — repetição",
    "Quarta sequência — partida",
    "Coda — o que sobra",
  ],
};

export function enrichBook(book: LibraryBook): LibraryBook & Required<Pick<LibraryBook, "isbn" | "doi" | "organizer" | "description" | "chapters" | "edition" | "language" | "format">> {
  const seed = hash(book.id);
  const isbn =
    book.isbn ??
    `978-65-${String(5800 + (seed % 200)).padStart(4, "0")}-${String(seed % 1000).padStart(3, "0")}-${seed % 10}`;
  const doi = book.doi ?? `10.36229/${isbn}`;
  const organizer = book.organizer ?? POOL_AUTHORS[seed % POOL_AUTHORS.length];

  const description = book.description || book.excerpt;

  const chapters: BookChapter[] = book.chapters ?? [];

  return {
    ...book,
    isbn,
    doi,
    organizer,
    description,
    chapters,
    edition: book.edition ?? "1ª edição",
    language: book.language ?? "Português",
    format: book.format ?? "PDF / ePub · Acesso aberto",
  };
}

function categoryLabel(c: LibraryCategory) {
  return c === "science"
    ? "ciência"
    : c === "philosophy"
      ? "filosofia"
      : c === "literature"
        ? "literatura"
        : c === "essay"
          ? "ensaio"
          : "poesia";
}

export function relatedBooks(book: LibraryBook, n = 4, library: LibraryBook[] = LIBRARY): LibraryBook[] {
  const same = library.filter((b) => b.id !== book.id && b.category === book.category);
  const others = library.filter((b) => b.id !== book.id && b.category !== book.category);
  return [...same, ...others].slice(0, n);
}