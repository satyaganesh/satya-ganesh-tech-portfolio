import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteConfig, aboutChapters, FRAMES, codingPlatforms } from '../data';

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [currentRotcFrame, setCurrentRotcFrame] = useState(0);
  const frameImages = useRef([]);
  const currentChapter = useRef(0);

  useEffect(() => {
    const loadFrames = async () => {
      const { SEQ } = FRAMES;
      try {
        for (let i = 0; i < SEQ.rotc; i++) {
          const path = `/frames/hd/rotc_${i.toString().padStart(3, '0')}.webp`;
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
        console.error('Failed to load rotc frames:', e);
        setFramesLoaded(true);
      }
    };
    loadFrames();
  }, []);

  // Scroll-triggered rotation
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.16,
        onUpdate: (self) => {
          const progress = self.progress;
          const targetFrame = Math.round(progress * 0.9 * (FRAMES.SEQ.rotc - 1));
          setCurrentRotcFrame(targetFrame);
          
          // Update chapter
          const chapterIndex = Math.min(Math.floor(progress * 4), 3);
          if (chapterIndex !== currentChapter.current) {
            currentChapter.current = chapterIndex;
            // Trigger chapter change animation
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Render rotc frame on canvas
  useEffect(() => {
    if (!framesLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = frameImages.current[currentRotcFrame];
    
    if (!img) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!ctx || !canvasRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw centered, full height with horizontal fade mask
      const aspect = img.width / img.height;
      const drawHeight = canvas.height;
      const drawWidth = drawHeight * aspect;
      const x = (canvas.width - drawWidth) / 2;
      
      // Draw with horizontal gradient mask (fade edges)
      ctx.save();
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.15, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.85, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      
      ctx.drawImage(img, x, 0, drawWidth, drawHeight);
      
      // Blend last frame into frame 0 at the end
      if (currentRotcFrame === FRAMES.SEQ.rotc - 1) {
        const firstFrame = frameImages.current[0];
        if (firstFrame) {
          ctx.globalAlpha = 0.1;
          ctx.drawImage(firstFrame, x, 0, drawWidth, drawHeight);
          ctx.globalAlpha = 1;
        }
      }
      ctx.restore();
    };

    render();
    return () => window.removeEventListener('resize', resize);
  }, [framesLoaded, currentRotcFrame]);

  const chapter = aboutChapters[currentChapter.current];

  return (
    <section ref={sectionRef} id="about" className="about" style={{
      height: '520vh',
      position: 'relative',
      background: 'var(--ivory)', // BG color from videos
      overflow: 'hidden',
    }}>
      {/* Sticky character canvas */}
      <div style={{ position: 'sticky', top: 0, height: '100svh', zIndex: 1 }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          aria-hidden="true"
        />
      </div>

      {/* Content grid */}
      <div className="container" style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr clamp(300px, 40vh, 400px) 1fr',
        alignItems: 'center',
      }}>
        {/* Left column - right aligned */}
        <div className="about__left" style={{ textAlign: 'right', paddingRight: '40px' }}>
          <p className="eyebrow" style={{ marginBottom: '24px' }}>{chapter.num} — {chapter.label}</p>
          <h2 className="section-title" style={{ color: 'var(--ink)' }}>
            {chapter.heading}
            <br />
            <span className="italic section-title__italic" style={{ fontSize: '0.92em', color: '#8a867f', whiteSpace: 'nowrap' }}>
              {chapter.subheading}
            </span>
          </h2>
          <div className="about__pills" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', marginTop: '32px' }}>
            <span className="pill pill-outline" style={{ fontSize: '11px' }}>{siteConfig.role}</span>
            <span className="pill pill-outline" style={{ fontSize: '11px' }}>K6, TypeScript, Grafana, Kubernetes</span>
            <span className="pill pill-outline" style={{ fontSize: '11px' }}>Class of {siteConfig.graduationYear}</span>
            <span className="pill pill-outline" style={{ fontSize: '11px' }}>{codingPlatforms.totalProblems || '500+'} problems solved</span>
          </div>
        </div>

        {/* Middle - character space (empty, character is in canvas) */}
        <div className="about__middle" />

        {/* Right column - left aligned */}
        <div className="about__right" style={{ paddingLeft: '40px' }}>
          <p className="about__sentence" style={{
            fontSize: 'clamp(19px, 1.7vw, 30px)',
            color: '#3a3835',
            maxWidth: '22ch',
            lineHeight: 1.6,
          }}>
            I build performance testing frameworks that scale.
          </p>
          <div className="about__dashes" style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="about__dash" style={{
                width: '40px', height: '3px', background: 'var(--lines)', borderRadius: '2px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%', width: '25%',
                  background: 'var(--accent)', animation: `dashFill 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes dashFill {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(300%); }
        }
      `}</style>
    </section>
  );
}