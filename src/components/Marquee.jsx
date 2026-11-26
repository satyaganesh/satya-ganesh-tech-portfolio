import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { marqueeItems } from '../data';

gsap.registerPlugin(ScrollTrigger);

export function Marquee() {
  const containerRef = useRef(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Repeat items to fill width multiple times
    const repeated = [];
    for (let i = 0; i < 20; i++) {
      marqueeItems.forEach((item, idx) => {
        repeated.push({ ...item, id: `${i}-${idx}`, index: idx });
      });
    }
    setItems(repeated);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const track = containerRef.current.querySelector('.marquee__track');
      if (!track) return;

      // Constant animation
      gsap.to(track, {
        xPercent: -50,
        duration: 30,
        ease: 'none',
        repeat: -1,
      });

      // Scroll-linked speed and skew
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
        onUpdate: (self) => {
          const velocity = self.getVelocity() * 0.01;
          gsap.to(track, {
            timeScale: 1 + Math.abs(velocity) * 2,
            skewX: gsap.utils.clamp(-15, 15, velocity * 5),
            duration: 0.3,
            ease: 'power2.out',
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="marquee" className="marquee" style={{
      background: 'var(--graphite)',
      overflow: 'hidden',
      padding: '24px 0',
    }}>
      <div ref={containerRef} className="marquee__container" style={{ position: 'relative' }}>
        <div className="marquee__track" style={{
          display: 'flex',
          gap: '60px',
          whiteSpace: 'nowrap',
          willChange: 'transform',
        }}>
          {items.map((item) => (
            <span
              key={item.id}
              className="marquee__item"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: 'clamp(18px, 2.5vw, 32px)',
                fontFamily: item.index % 2 === 0 ? "'Anton', sans-serif" : "'Instrument Serif', serif",
                fontStyle: item.index % 2 === 0 ? 'normal' : 'italic',
                fontWeight: item.index % 2 === 0 ? 400 : 400,
                textTransform: item.index % 2 === 0 ? 'uppercase' : 'none',
                letterSpacing: item.index % 2 === 0 ? '0.02em' : 'normal',
                color: item.index % 2 === 0 ? 'transparent' : 'var(--ivory)',
                WebkitTextStroke: item.index % 2 === 0 ? '1px var(--ivory)' : 'none',
                '-webkit-text-stroke': item.index % 2 === 0 ? '1px var(--ivory)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {item.index % 2 === 0 ? (
                <>
                  {item.text} {'\u2726'}
                </>
              ) : (
                <>
                  {item.text} {'\u2726'}
                </>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}