import { useEffect, useRef } from 'react';

export function useScrollReveal() {
  const ref = useRef(null);
  const isRevealed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isRevealed.current) {
      el.classList.add('revealed');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          isRevealed.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  });

  return ref;
}
