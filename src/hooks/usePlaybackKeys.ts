import { useEffect, useRef } from 'react';

interface Handlers {
  onToggle: () => void;
  onForward: () => void;
  onBack: () => void;
}

/** Space = play/pause, ←/→ = step back/forward. */
export function usePlaybackKeys(handlers: Handlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') {
        if (tag === 'BUTTON') return; // the button handles it itself
        e.preventDefault();
        ref.current.onToggle();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        ref.current.onForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        ref.current.onBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
