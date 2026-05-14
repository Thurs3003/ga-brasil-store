import { useEffect, useRef } from 'react';

// Observer singleton — um único observer para toda a página em vez de um por card
let _observer = null;

function getObserver() {
  if (!_observer) {
    _observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            _observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
  }
  return _observer;
}

export function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.classList.contains('revealed')) return;
    const observer = getObserver();
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []); // array vazio: roda só na montagem

  return ref;
}
