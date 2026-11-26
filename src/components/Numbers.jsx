import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { numbersText, codingPlatforms } from '../data';

gsap.registerPlugin(ScrollTrigger);

export function Numbers() {
  const sectionRef = useRef(null);
  const wordsRef = useRef([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Split text into words
      const text = numbersText;
      const words = text.split(/(\s+)/).filter(w => w.length > 0);
      
      words.forEach((word, i) => {
        const isValue = word.startsWith('[') && word.endsWith(']');
        const el = document.querySelector(`.numbers__word-${i}`);
        if (!el) return;

        gsap.fromTo(el,
          { color: '#3b3a3e' },
          {
            color: 'var(--ivory)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );

        if (isValue) {
          const value = word.slice(1, -1);
          const counter = { val: 0 };
          const target = parseFloat(value.replace(/[^\d.]/g, '')) || 0;
          const suffix = value.replace(/[\d.]/g, '');
          
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            onEnter: () => {
              gsap.to(counter, {
                val: target,
                duration: 1.5,
                ease: 'power2.out',
                onUpdate: () => {
                  el.textContent = Math.round(counter.val) + suffix;
                  el.style.background = 'linear-gradient(135deg, var(--ivory) 0%, var(--mist) 100%)';
                  el.style.color = 'var(--ink)';
                  el.style.padding = '2px 8px';
                  el.style.borderRadius = '100px';
                  el.style.fontFamily = "'JetBrains Mono', monospace";
                  el.style.fontSize = '0.85em';
                },
              });
            },
            once: true,
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Parse text into words with indices
  const words = numbersText.split(/(\s+)/).filter(w => w.length > 0);

  return (
    <section ref={sectionRef} id="numbers" className="numbers" style={{
      minHeight: '100vh',
      padding: '120px var(--side-padding)',
      background: 'linear-gradient(180deg, #111113 0%, #18181b 100%)',
      position: 'relative',
    }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
          <p className="eyebrow">03 — In numbers</p>
          <p style={{ fontSize: 'clamp(14px, 1.5vw, 20px)', color: 'var(--ash)', maxWidth: '300px' }}>
            One sentence, read it slowly
          </p>
        </div>

        <p className="numbers__paragraph" style={{
          fontFamily: "'Inter Variable', sans-serif",
          fontWeight: 500,
          fontSize: 'clamp(34px, 4.6vw, 84px)',
          lineHeight: 1.3,
          letterSpacing: '-0.035em',
          color: '#3b3a3e',
        }}>
          {words.map((word, i) => (
            <span key={i} className={`numbers__word-${i}`} style={{ 
              display: 'inline-block', 
              marginRight: word.match(/\s/) ? '0' : '0.25em' 
            }}>
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}