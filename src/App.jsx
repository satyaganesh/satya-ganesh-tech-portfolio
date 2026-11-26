import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Preloader } from './components/Preloader';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Numbers } from './components/Numbers';
import { Marquee } from './components/Marquee';
import { Work } from './components/Work';
import { Skills } from './components/Skills';
import { Journey } from './components/Journey';
import { Certifications } from './components/Certifications';
import { Contact } from './components/Contact';
import { CustomCursor } from './components/CustomCursor';
import { FilmGrain } from './components/FilmGrain';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [loaded, setLoaded] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 5), // expo-out
      smooth: true,
      smoothTouch: false,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      gsap.ticker.tick(time / 1000);
      requestAnimationFrame(raf);
    }

    const id = requestAnimationFrame(raf);
    gsap.ticker.add(() => {});

    // Stop Lenis until preloader ends
    lenis.stop();

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      gsap.ticker.remove(() => {});
    };
  }, []);

  const onLoadComplete = () => {
    setLoaded(true);
    // Start Lenis after preloader
    setTimeout(() => {
      setPreloaderDone(true);
      if (lenisRef.current) {
        lenisRef.current.start();
      }
    }, 100);
  };

  return (
    <div className="app">
      <FilmGrain />
      <CustomCursor />
      <Preloader onComplete={onLoadComplete} />
      {loaded && (
        <>
          <Nav />
          <main id="main">
            <Hero />
            <About />
            <Numbers />
            <Marquee />
            <Work />
            <Skills />
            <Journey />
            <Certifications />
            <Contact />
          </main>
        </>
      )}
    </div>
  );
}

export default App;