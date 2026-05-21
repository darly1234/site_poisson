import { useEffect, useState } from 'react';

export function usePointerFine() {
  const [isFine, setIsFine] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine)');
    setIsFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsFine(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isFine;
}
