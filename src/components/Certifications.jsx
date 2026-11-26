import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { certifications } from '../data';

gsap.registerPlugin(ScrollTrigger);

const cardStyles = [
  { bg: 'var(--charcoal)', border: '1px solid var(--lines)', color: 'var(--ivory)' },
  { bg: 'var(--pearl)', border: '1px solid var(--lines)', color: 'var(--ink)' },
  { bg: 'var(--smoke)', border: '1px solid var(--lines)', color: 'var(--ivory)' },
  { bg: 'var(--graphite)', border: '1px solid var(--lines)', color: 'var(--ivory)' },
];

export function Certifications() {
  const sectionRef = useRef(null);
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Pin section
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=140%',
        pin: true,
        pinSpacing: true,
        onEnter: () => setExploded(true),
        onLeaveBack: () => setExploded(false),
      });

      // Animate cards from pile to grid
      const cards = gsap.utils.toArray('.cert__card');
      gsap.fromTo(cards,
        {
          x: (i) => (Math.random() - 0.5) * 400,
          y: (i) => (Math.random() - 0.5) * 400,
          rotation: (i) => (Math.random() - 0.5) * 60,
          scale: 0.62,
          opacity: 0,
        },
        {
          x: 0, y: 0, rotation: 0, scale: 1, opacity: 1,
          duration: 1.2,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Fade count
      gsap.to('.cert__count', {
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="certifications" className="certifications" style={{
      minHeight: '100vh',
      padding: '120px var(--side-padding)',
      background: 'radial-gradient(ellipse at center, #fdfcfa 0%, #ece8e1 100%)',
      position: 'relative',
    }}>
      <div className="container" style={{ maxWidth: '1200px', position: 'relative', zIndex: 10 }}>
        <div style={{ marginBottom: '48px' }}>
          <p className="eyebrow" style={{ color: 'var(--ink)' }}>07 — Certifications</p>
          <h2 style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(48px, 6vw, 96px)',
            lineHeight: 0.95,
            color: 'var(--ink)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            Paper
            <br />
            <span className="font-serif" style={{ fontStyle: 'italic', color: 'var(--accent)' }}>
              trail
            </span>
          </h2>
        </div>

        {/* Grid */}
        <div className="cert__grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
        }}>
          {certifications.map((cert, i) => {
            const style = cardStyles[i % cardStyles.length];
            const initials = cert.issuer.split(' ').map(w => w[0]).join('').toUpperCase();
            return (
              <div
                key={cert.name}
                className="cert__card"
                style={{
                  ...style,
                  borderRadius: '16px',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Monogram */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontFamily: "'Anton', sans-serif",
                  fontSize: 'clamp(80px, 15vw, 160px)',
                  color: style.color === 'var(--ink)' ? 'rgba(14,14,15,0.04)' : 'rgba(239,235,228,0.04)',
                  lineHeight: 1,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}>
                  {initials}
                </div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <span className="font-mono" style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: 'var(--accent)',
                    marginBottom: '8px',
                    alignSelf: 'flex-start',
                  }}>
                    Certificate
                  </span>
                  <span className="font-display" style={{
                    fontSize: '24px',
                    color: 'var(--accent)',
                    marginBottom: '16px',
                  }}>
                    #{String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif" style={{
                    fontStyle: 'italic',
                    fontSize: 'clamp(18px, 2vw, 24px)',
                    lineHeight: 1.3,
                    color: style.color,
                    marginBottom: '12px',
                    flex: 1,
                  }}>
                    {cert.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: style.color === 'var(--ink)' ? 'var(--ash)' : 'var(--smoke)' }}>
                    {cert.issuer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Centered count */}
        <div className="cert__count" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Anton', sans-serif",
          fontSize: 'clamp(60px, 10vw, 120px)',
          color: 'var(--lines)',
          pointerEvents: 'none',
          zIndex: 5,
          transition: 'opacity 0.8s',
        }}>
          {certifications.length}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .cert__grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .cert__grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}