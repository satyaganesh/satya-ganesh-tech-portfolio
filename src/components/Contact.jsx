import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteConfig, FRAMES } from '../data';

gsap.registerPlugin(ScrollTrigger);

const WAVE_MESSAGES = ['Bye for now!', 'See you soon!', 'Take care!', 'Happy coding!'];

export function Contact() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [waveMessage, setWaveMessage] = useState(WAVE_MESSAGES[0]);
  const frameImages = useRef([]);
  let messageInterval = null;

  useEffect(() => {
    const loadFrames = async () => {
      const { SEQ } = FRAMES;
      try {
        for (let i = 0; i < SEQ.wave; i++) {
          const path = `/frames/hd/wave_${i.toString().padStart(3, '0')}.webp`;
          const img = new Image();
          img.src = path;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          frameImages.current.push(img);
        }
        setFramesLoaded(true);
      } catch (e) {
        console.error('Failed to load wave frames:', e);
        setFramesLoaded(true);
      }
    };
    loadFrames();
  }, []);

  // Wave animation
  useEffect(() => {
    if (!framesLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const render = (time) => {
      if (!ctx || !canvasRef.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const frameIdx = Math.floor((time / 1000) * 26) % frameImages.current.length;
      const img = frameImages.current[frameIdx];
      
      if (img) {
        const aspect = img.width / img.height;
        const drawHeight = canvas.height;
        const drawWidth = drawHeight * aspect;
        const x = (canvas.width - drawWidth) / 2;
        ctx.drawImage(img, x, 0, drawWidth, drawHeight);
      }

      requestAnimationFrame(render);
    };

    render(0);

    // Cycle wave messages
    messageInterval = setInterval(() => {
      setWaveMessage(prev => WAVE_MESSAGES[(WAVE_MESSAGES.indexOf(prev) + 1) % WAVE_MESSAGES.length]);
    }, 3000);

    return () => clearInterval(messageInterval);
  }, [framesLoaded]);

  // Intro animation
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.contact__title',
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
      );
      gsap.fromTo('.contact__tagline',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: 'power3.out' }
      );
      gsap.fromTo('.contact__character',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, delay: 0.4, ease: 'power3.out' }
      );
      gsap.fromTo('.contact__social',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.6, ease: 'power3.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="contact" style={{
      minHeight: '50vh',
      padding: '100px var(--side-padding) 60px',
      background: 'radial-gradient(ellipse at center, #1c1c1f 0%, #0e0e0f 70%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* "LET'S TALK" background text */}
      <div className="contact__bg-text font-display" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(120px, 20vw, 300px)',
        lineHeight: 1,
        fontWeight: 400,
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        background: 'linear-gradient(180deg, rgba(239,235,228,0.15) 0%, transparent 100%)',
        backgroundClip: 'text',
        '-webkit-background-clip': 'text',
        color: 'transparent',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        LET&apos;S TALK
      </div>

      <div className="container" style={{ 
        position: 'relative', 
        zIndex: 10, 
        height: '100%', 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr',
        alignItems: 'end',
        gap: '40px',
      }}>
        {/* Left - "Let's build something that moves." */}
        <div className="contact__tagline" style={{ textAlign: 'left' }}>
          <p style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(40px, 4.4vw, 84px)',
            lineHeight: 1.05,
            color: 'var(--ivory)',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            Let&apos;s build
          </p>
          <p style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(40px, 4.4vw, 84px)',
            lineHeight: 1.05,
            color: 'var(--ivory)',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            something
          </p>
          <p className="font-serif" style={{
            fontStyle: 'italic',
            fontSize: 'clamp(40px, 4.4vw, 84px)',
            lineHeight: 1.05,
            color: 'var(--silver)',
            textTransform: 'none',
          }}>
            that moves.
          </p>
        </div>

        {/* Center - Character */}
        <div className="contact__character" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
          <canvas
            ref={canvasRef}
            style={{
              height: '48vh',
              minHeight: '280px',
              maxHeight: '400px',
              width: 'auto',
              maxWidth: '300px',
            }}
            aria-hidden="true"
          />
          {/* Wave bubble */}
          <div style={{
            position: 'absolute',
            bottom: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            marginLeft: '160px',
            padding: '8px 16px',
            background: 'rgba(28,28,31,0.8)',
            border: '1px solid var(--lines)',
            borderRadius: '100px',
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: '14px',
            color: 'var(--ivory)',
            backdropFilter: 'blur(10px)',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}>
            {waveMessage}
          </div>
        </div>

        {/* Right - Social icons */}
        <div className="contact__social" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', justifyContent: 'flex-end' }}>
          <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="contact__social-btn" aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.305-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" className="contact__social-btn" aria-label="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href={`mailto:${siteConfig.email}`} className="contact__social-btn" aria-label="Email">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        position: 'absolute',
        bottom: '20px',
        left: 'var(--side-padding)',
        right: 'var(--side-padding)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '40px',
        borderTop: '1px solid var(--lines)',
        fontSize: '13px',
        color: 'var(--ash)',
      }}>
        <span>© {new Date().getFullYear()} {siteConfig.fullName}</span>
        <a href="#" className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent)' }}>
          Back to top ↑
        </a>
      </footer>

      <style jsx>{`
        .contact__social-btn {
          width: 44px;
          height: 44px;
          borderRadius: '50%';
          border: '1px solid var(--lines)';
          display: 'flex';
          alignItems: 'center';
          justifyContent: 'center';
          color: 'var(--mist)';
          transition: 'all 0.3s var(--easing)';
        }
        .contact__social-btn:hover {
          borderColor: 'var(--accent)';
          color: 'var(--accent)';
          transform: 'translateY(-2px)';
        }
      `}</style>
    </section>
  );
}