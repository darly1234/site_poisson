import { useRef, useMemo, useEffect, useState, Suspense, Component } from "react";
import type { ReactNode } from "react";

const API_URL = "https://individual.poisson.com.br/api/public/livros/all";

/* ─── Error Boundary ─────────────────────────────────────────── */
class R3FErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: unknown) {
    console.error("[BookshelfScene] R3F crash:", error, info);
  }
  render() {
    if (this.state.error) {
      console.warn("[BookshelfScene] Rendering fallback due to:", this.state.error.message);
      return null;
    }
    return this.props.children;
  }
}

/* ─── Lazy inner scene (isolates all Three.js / R3F imports) ─── */
const InnerScene = () => {
  const [Scene, setScene] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("./BookshelfSceneInner")
      .then((mod) => {
        if (!cancelled) setScene(() => mod.BookshelfSceneInner);
      })
      .catch((err) => {
        console.error("[BookshelfScene] Failed to load inner scene:", err);
      });
    return () => { cancelled = true; };
  }, []);

  if (!Scene) return null;
  return <Scene />;
};

/* ─── Public export ──────────────────────────────────────────── */
export function BookshelfScene() {
  return (
    <R3FErrorBoundary>
      <Suspense fallback={null}>
        <InnerScene />
      </Suspense>
    </R3FErrorBoundary>
  );
}
