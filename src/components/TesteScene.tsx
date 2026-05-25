import { useState, useEffect, Component } from "react";
import type { ReactNode } from "react";
import BookshelfSceneR3F from "./BookshelfSceneR3F";
import { BookshelfSceneCSS } from "./BookshelfSceneCSS";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

class WebGLErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { crashed: boolean }> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { crashed: false };
  }
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() {
    if (this.state.crashed) return null;
    return this.props.children;
  }
}

export default function TesteScene() {
  const [mode, setMode] = useState<"loading" | "webgl" | "css">("loading");

  useEffect(() => {
    setMode(detectWebGL() ? "webgl" : "css");
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0710", position: "fixed", inset: 0 }}>
      {mode === "loading" && null}
      {mode === "css" && <BookshelfSceneCSS />}
      {mode === "webgl" && (
        <WebGLErrorBoundary onError={() => setMode("css")}>
          <BookshelfSceneR3F />
        </WebGLErrorBoundary>
      )}
    </div>
  );
}
