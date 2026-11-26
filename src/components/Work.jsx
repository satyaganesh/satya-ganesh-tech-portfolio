import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, workVisuals, siteConfig } from '../data';

gsap.registerPlugin(ScrollTrigger);

export function Work() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const progressRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Browser window tilt animation
      gsap.fromTo('.work__browser',
        { rotationX: 15, y: 100, opacity: 0 },
        {
          rotationX: 0, y: 0, opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.work__browser',
            start: 'top 80%',
          },
        }
      );

      // Tab content fade in
      gsap.fromTo('.work__tab-content',
        { opacity: 0, filter: 'blur(8px)', y: 30 },
        {
          opacity: 1, filter: 'blur(0)', y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.work__tabs',
            start: 'top 85%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Auto-advance tabs
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % projects.length);
      progressRef.current = 0;
    }, 8000);

    // Progress animation
    const start = Date.now();
    const animateProgress = () => {
      progressRef.current = ((Date.now() - start) / 8000) * 100;
      if (progressRef.current < 100 && isPlaying) {
        requestAnimationFrame(animateProgress);
      }
    };
    animateProgress();

    return () => clearTimeout(timerRef.current);
  }, [activeIndex, isPlaying]);

  const handleTabClick = (index) => {
    setActiveIndex(index);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 5000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handleTabClick((activeIndex - 1 + projects.length) % projects.length);
    } else if (e.key === 'ArrowRight') {
      handleTabClick((activeIndex + 1) % projects.length);
    } else if (e.key === ' ') {
      e.preventDefault();
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]);

  const project = projects[activeIndex];
  const visual = workVisuals[activeIndex % workVisuals.length];

  return (
    <section ref={sectionRef} id="work" className="work" style={{
      minHeight: '100vh',
      padding: '120px var(--side-padding)',
      background: 'radial-gradient(ellipse at center, #fbfaf7 0%, #ebe7e0 100%)',
      position: 'relative',
    }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '48px' }}>
          <p className="eyebrow" style={{ color: 'var(--ink)' }}>04 — Selected work</p>
          <h2 style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(48px, 6vw, 96px)',
            lineHeight: 0.95,
            color: 'var(--ink)',
            textTransform: 'uppercase',
            fontWeight: 400,
          }}>
            Things I've built
            <br />
            <span className="font-serif" style={{ fontStyle: 'italic', fontSize: '0.9em', color: 'var(--accent)' }}>
              that perform
            </span>
          </h2>
        </div>

        <div className="work__browser" style={{
          maxWidth: '1320px',
          margin: '0 auto',
          background: 'var(--pearl)',
          borderRadius: '16px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px var(--lines)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Browser chrome */}
          <div className="work__chrome" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'var(--mist)',
            borderBottom: '1px solid var(--lines)',
          }}>
            <div className="work__traffic-lights" style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28ca42' }} />
            </div>
            <div className="work__address-bar" style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'var(--pearl)',
              borderRadius: '8px',
              border: '1px solid var(--lines)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: 'var(--ash)',
            }}>
              <span>{siteConfig.github.replace('https://', '')}/</span>
              <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{project.shortTitle.toLowerCase().replace(/\s+/g, '-')}</span>
              <span className={`work__play-pause ${isPlaying ? '' : 'paused'}`} 
                onClick={() => setIsPlaying(!isPlaying)}
                style={{ padding: '4px 10px', background: 'var(--accent)', color: 'var(--ink)', borderRadius: '6px', fontSize: '10px', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </span>
            </div>
            {/* Progress line */}
            <div className="work__progress-container" style={{ width: '200px', height: '2px', background: 'var(--lines)', borderRadius: '1px', overflow: 'hidden' }}>
              <div className="work__progress" style={{
                width: `${progressRef.current}%`,
                height: '100%',
                background: 'var(--accent)',
                transition: 'width 0.1s linear',
              }} />
            </div>
          </div>

          {/* Tab content */}
          <div className="work__tabs" style={{ padding: '32px', display: 'grid', gridTemplateColumns: '280px 1fr 400px', gap: '32px', alignItems: 'start' }}>
            {/* Left sidebar - Stack */}
            <div className="work__sidebar">
              <p className="font-mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ash)', marginBottom: '16px' }}>Stack</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {project.tech.map((t) => (
                  <span key={t} className="pill pill-smoke" style={{ fontSize: '10px' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Middle - Details */}
            <div className="work__details">
              <p className="font-mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: '12px' }}>
                {project.category}
              </p>
              <h3 style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: 'clamp(32px, 4vw, 56px)',
                lineHeight: 0.95,
                color: 'var(--ink)',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                {project.title}
                <br />
                <span className="font-serif" style={{ fontStyle: 'italic', fontSize: '0.75em', color: 'var(--accent)' }}>
                  {project.shortTitle}
                </span>
              </h3>
              <p style={{ color: 'var(--smoke)', lineHeight: 1.7, marginBottom: '24px', fontSize: 'clamp(15px, 1.5vw, 18px)' }}>
                {project.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="pill pill-charcoal">
                  Open repository
                </a>
                <span className="font-mono" style={{ fontSize: '12px', color: 'var(--ash)' }}>
                  {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="work__visual" style={{
              background: 'var(--ink)',
              borderRadius: '12px',
              aspectRatio: '4/3',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ash)' }}>
                {visual.type === 'scan' && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: '24px', color: 'var(--accent)', marginBottom: '16px' }}>SCANNING...</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: 'var(--silver)' }}>document_analysis.ts:42</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#ff6b6b', marginTop: '8px' }}>⚠ HIGH: Unvalidated input</div>
                    <div style={{ marginTop: '24px', fontFamily: "'Anton', sans-serif", fontSize: '48px', color: 'var(--ivory)' }}>SCORE: 87%</div>
                  </div>
                )}
                {visual.type === 'heatmap' && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(8, 1fr)', 
                    gap: '4px', 
                    padding: '16px',
                  }}>
                    {Array.from({ length: 32 }, (_, i) => (
                      <div key={i} style={{
                        aspectRatio: 1,
                        background: `rgba(168,164,158,${0.1 + Math.random() * 0.4})`,
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                      }} />
                    ))}
                  </div>
                )}
                {visual.type === 'orbit' && (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {[0, 1, 2].map((ring) => (
                      <div key={ring} style={{
                        position: 'absolute',
                        width: `${120 + ring * 60}px`,
                        height: `${120 + ring * 60}px`,
                        border: '1px dashed var(--lines)',
                        borderRadius: '50%',
                        animation: `orbit ${20 + ring * 5}s linear infinite`,
                      }} />
                    ))}
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      background: 'radial-gradient(circle at 30% 30%, var(--accent) 0%, var(--ink) 70%)',
                      boxShadow: '0 0 40px rgba(201,169,110,0.4)',
                      position: 'relative', zIndex: 10,
                    }} />
                    {project.tech.slice(0, 6).map((t, i) => (
                      <div key={t} style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateX(100px) rotate(-${i * 60}deg)`,
                        animation: `orbit ${15 + i * 2}s linear infinite reverse`,
                      }}>
                        <span className="pill pill-ivory-gradient" style={{ fontSize: '9px', whiteSpace: 'nowrap' }}>{t}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}