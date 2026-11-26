import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { journeyMilestones } from '../data';

gsap.registerPlugin(ScrollTrigger);

export function Journey() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          const index = Math.round(progress * (journeyMilestones.length - 1));
          setActiveIndex(Math.min(Math.max(index, 0), journeyMilestones.length - 1));
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const radius = 600; // Will be clamped by CSS

  return (
    <section ref={sectionRef} id="journey" className="journey" style={{
      minHeight: `calc(100vh + ${journeyMilestones.length * 60}vh)`,
      background: 'var(--ink)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ paddingTop: '100px', marginBottom: '60px' }}>
          <p className="eyebrow">06 — Journey</p>
          <h2 style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(48px, 6vw, 96px)',
            lineHeight: 0.95,
            color: 'var(--ivory)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            The road
            <br />
            <span className="font-serif" style={{ fontStyle: 'italic', color: 'var(--accent)' }}>
              so far
            </span>
          </h2>
        </div>

        {/* 3D Carousel */}
        <div className="journey__carousel" style={{
          flex: 1,
          position: 'relative',
          perspective: '1000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="journey__ring" style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: `rotateY(${activeIndex * -30}deg)`,
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {journeyMilestones.map((milestone, i) => {
              const angle = i * 30;
              const isActive = i === activeIndex;
              return (
                <div
                  key={milestone.year}
                  className="journey__card"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(clamp(560px, 58vw, 900px))`,
                    transformStyle: 'preserve-3d',
                    width: 'clamp(280px, 35vw, 420px)',
                    opacity: isActive ? 1 : 0.4,
                    filter: isActive ? 'none' : 'grayscale(100%)',
                    transition: 'opacity 0.5s, filter 0.5s',
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  <div className="journey__card-inner" style={{
                    background: isActive ? 'var(--ivory)' : 'rgba(28,28,31,0.8)',
                    border: '1px solid var(--lines)',
                    borderRadius: '16px',
                    padding: '32px',
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center',
                    color: isActive ? 'var(--ink)' : 'var(--mist)',
                  }}>
                    <p className="font-display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', marginBottom: '12px', textTransform: 'uppercase' }}>
                      {milestone.year}
                    </p>
                    <h3 className="font-serif" style={{ fontStyle: 'italic', fontSize: 'clamp(20px, 2.5vw, 28px)', marginBottom: '8px' }}>
                      {milestone.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: isActive ? 'var(--ash)' : 'var(--silver)', marginBottom: '16px' }}>
                      {milestone.place}
                    </p>
                    <span className="pill pill-outline" style={{ fontSize: '10px' }}>
                      {milestone.meta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Caption */}
        <div style={{ textAlign: 'center', padding: '40px 0 100px' }}>
          <p className="font-mono" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ash)' }}>
            Stop {String(activeIndex + 1).padStart(2, '0')} of {String(journeyMilestones.length).padStart(2, '0')}
          </p>
        </div>
      </div>
    </section>
  );
}