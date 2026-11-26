import { useContext, createContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

const LenisContext = createContext(null);

export function LenisProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 5),
      smooth: true,
      smoothTouch: false,
    });

    lenisRef.current = lenis;
    lenis.stop(); // Stopped until preloader ends

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const id = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}

export function useLenis() {
  const lenis = useContext(LenisContext);
  return lenis;
}

export function useGSAP(callback, dependencies = []) {
  const ctxRef = useRef(null);

  useEffect(() => {
    ctxRef.current = gsap.context(callback);
    return () => ctxRef.current?.revert();
  }, dependencies);
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mediaQuery.matches);
    const handler = () => setReduced(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reduced;
}