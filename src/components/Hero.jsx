import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '../hooks/useGSAP';
import { siteConfig, FRAMES } from '../data';

gsap.registerPlugin(ScrollTrigger);

const WAVE_MESSAGES = [
  "Hi, I'm Satya!",
  'Hi there!',
  'Hello!',
  'नमस्ते!',
  'Hey, welcome!',
  'Hi again!',
];

export function Hero() {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const lenis = useLenis();
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [useSD, setUseSD] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [characterState, setCharacterState] = useState('wave'); // wave, turn, runStart, run, turnBack, idle
  const [targetX, setTargetX] = useState(0.5); // 0-1 normalized
  const [currentX, setCurrentX] = useState(0.5);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const [waveMessage, setWaveMessage] = useState(WAVE_MESSAGES[0]);
  const [showWaveBubble, setShowWaveBubble] = useState(true);
  const [bubbleSide, setBubbleSide] = useState('right');
  const lastPointerX = useRef(0);
  const lastFrameTime = useRef(0);
  const animationId = useRef(null);
  const idleTimer = useRef(null);
  const frameImages = useRef({ hd: [], sd: [] });
  const currentFrameData = useRef(null);

  // Load frames
  useEffect(() => {
    const loadFrames = async () => {
      const { SEQ, RUN, ROT } = FRAMES;
      const isSD = useSD;

      try {
        // Load run frames
        for (let i = 0; i < SEQ.run; i++) {
          const path = `/frames/${isSD ? 'sd' : 'hd'}/run_${i.toString().padStart(3, '0')}.webp`;
          const img = new Image();
          img.src = path;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          frameImages.current.hd.push(img);
        }

        // Load wave frames
        for (let i = 0; i < SEQ.wave; i++) {
          const path = `/frames/${isSD ? 'sd' : 'hd'}/wave_${i.toString().padStart(3, '0')}.webp`;
          const img = new Image();
          img.src = path;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          frameImages.current.hd.push(img);
        }

        // Load rot frames
        for (let i = 0; i < SEQ.rot; i++) {
          const path = `/frames/${isSD ? 'sd' : 'hd'}/rot_${i.toString().padStart(3, '0')}.webp`;
          const img = new Image();
          img.src = path;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          frameImages.current.hd.push(img);
        }

        setFramesLoaded(true);
      } catch (e) {
        console.error('Failed to load frames:', e);
        setFramesLoaded(true); // Continue anyway
      }
    };

    const checkViewport = () => {
      const minSide = Math.min(window.innerWidth, window.innerHeight);
      setUseSD(minSide < 700);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    loadFrames();

    return () => window.removeEventListener('resize', checkViewport);
  }, [useSD]);

  // Animation loop
  useEffect(() => {
    if (!framesLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const render = (time) => {
      if (!ctx || !canvasRef.current) return;

      const { RUN, ROT } = FRAMES;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw contact shadow
      drawContactShadow(ctx, canvasWidth, canvasHeight);

      // Draw character frame
      drawCharacterFrame(ctx, canvasWidth, canvasHeight, time);

      animationId.current = requestAnimationFrame(render);
    };

    animationId.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationId.current);
  }, [framesLoaded, characterState, currentX, direction]);

  const drawContactShadow = (ctx, w, h) => {
    const charHeight = h * 0.72;
    const shadowY = h * 0.88;
    const shadowWidth = w * 0.3;
    ctx.save();
    ctx.translate(w * currentX, shadowY);
    ctx.scale(direction, 1);
    ctx.beginPath();
    ctx.ellipse(0, 0, shadowWidth / 2, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.filter = 'blur(12px)';
    ctx.fill();
    ctx.restore();
  };

  const drawCharacterFrame = (ctx, w, h, time) => {
    const { RUN, ROT } = FRAMES;
    let frameIndex = 0;
    let frameSet = 'run';

    // Determine which frame to draw based on state
    switch (characterState) {
      case 'wave':
        frameIndex = Math.floor((time / 1000) * 26) % SEQ.wave;
        frameSet = 'wave';
        break;
      case 'turn':
        // Turning from front to side profile
        break;
      case 'runStart':
        // Run start frames
        break;
      case 'run':
        // Running loop
        const speed = 1; // Will calculate based on velocity
        frameIndex = RUN.loopFrom + Math.floor((time / 1000) * 24 * speed) % RUN.loopLen;
        frameSet = 'run';
        break;
      case 'turnBack':
        break;
      default:
        frameIndex = RUN.stand;
        frameSet = 'run';
    }

    // Draw frame (simplified - in real implementation would use frameImages)
    ctx.save();
    ctx.translate(w * currentX, h * 0.88);
    ctx.scale(direction * 0.72, 0.72); // 72% of hero height
    // Placeholder: draw a simple shape for now
    ctx.fillStyle = 'var(--accent)';
    ctx.fillRect(-50, -200, 100, 200);
    ctx.restore();
  };

  // Handle pointer movement
  useEffect(() => {
    const handlePointerMove = (e) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / rect.width;
      lastPointerX.current = x;
      setTargetX(Math.max(0.1, Math.min(0.9, x)));
    };

    const handleTouchMove = (e) => {
      if (e.touches[0]) {
        const rect = heroRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.touches[0].clientX - rect.left) / rect.width;
        lastPointerX.current = x;
        setTargetX(Math.max(0.1, Math.min(0.9, x)));
      }
    };

    heroRef.current?.addEventListener('mousemove', handlePointerMove);
    heroRef.current?.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      heroRef.current?.removeEventListener('mousemove', handlePointerMove);
      heroRef.current?.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Character behavior logic
  useEffect(() => {
    if (!framesLoaded) return;

    const { RUN } = FRAMES;
    const distance = Math.abs(targetX - currentX) * window.innerWidth;
    const threshold = 50;

    if (distance > threshold) {
      // Need to move
      const newDirection = targetX > currentX ? 1 : -1;

      if (newDirection !== direction) {
        // Flip direction
        setCharacterState('turn');
        setDirection(newDirection);
        // After turn, play run start
        setTimeout(() => {
          setCharacterState('runStart');
          setTimeout(() => {
            setCharacterState('run');
          }, 300);
        }, 260);
      } else if (characterState === 'wave' || characterState === 'idle') {
        // Start moving
        setCharacterState('runStart');
        setTimeout(() => {
          setCharacterState('run');
        }, 300);
      }

      // Animate position
      gsap.to(currentX, {
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () => setCurrentX(currentX),
      });
    } else if (distance <= 14) {
      // Close enough - stop and wave
      if (characterState === 'run') {
        setCharacterState('turnBack');
        setTimeout(() => {
          setCharacterState('wave');
          setShowWaveBubble(true);
          // Cycle wave message
          const nextMsg = WAVE_MESSAGES[(WAVE_MESSAGES.indexOf(waveMessage) + 1) % WAVE_MESSAGES.length];
          setWaveMessage(nextMsg);
          setBubbleSide(targetX < 0.5 ? 'right' : 'left');
        }, 280);
      }
    }

    // Idle timer
    if (characterState === 'wave') {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setShowWaveBubble(false);
        setCharacterState('idle');
        setTimeout(() => {
          setShowWaveBubble(true);
          setWaveMessage(WAVE_MESSAGES[0]);
        }, 1000);
      }, 6500);
    }

    return () => clearTimeout(idleTimer.current);
  }, [targetX, currentX, characterState, direction, framesLoaded, waveMessage]);

  // Intro animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero__name-letter', { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.05, ease: 'power3.out' });
      gsap.fromTo('.hero__character', { scale: 0.9, filter: 'blur(8px)', opacity: 0 }, { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 1.5, ease: 'power3.out', delay: 0.3 });
      gsap.fromTo('.hero__floor-line', { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.inOut', delay: 0.5, transformOrigin: 'center' });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} id="hero" className="hero" style={{ height: '100svh', position: 'relative', overflow: 'hidden' }}>
      <div className="hero__bg" style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, var(--pearl) 0%, var(--ivory) 100%)',
        zIndex: 0,
      }}>
        {/* Drifting blobs */}
        <div className="hero__blob" style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'var(--accent)',
          opacity: 0.08,
          filter: 'blur(120px)',
          animation: 'drift 20s ease-in-out infinite',
        }} />
        <div className="hero__blob" style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'var(--silver)',
          opacity: 0.06,
          filter: 'blur(100px)',
          animation: 'drift 25s ease-in-out infinite reverse',
        }} />
      </div>

      {/* Huge name behind everything */}
      <div className="hero__name-bg font-display" style={{
        position: 'absolute',
        top: '13vh',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 'clamp(150px, 27vw, 520px)',
        lineHeight: 0.8,
        color: 'transparent',
        background: 'linear-gradient(180deg, rgba(28,27,25,0.11) 0%, rgba(28,27,25,0) 100%)',
        backgroundClip: 'text',
        '-webkit-background-clip': 'text',
        whiteSpace: 'nowrap',
        zIndex: 1,
        pointerEvents: 'none',
      }}>
        {siteConfig.firstName.toUpperCase()}
      </div>

      <div className="hero__content" style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Side notes at 46% height */}
        <div className="hero__side-notes" style={{
          position: 'absolute',
          top: '46%',
          left: 'var(--side-padding)',
          right: 'var(--side-padding)',
          display: 'flex',
          justifyContent: 'space-between',
          zIndex: 5,
          pointerEvents: 'none',
        }}>
          <div className="hero__side-note" style={{ maxWidth: '300px' }}>
            <p className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ash)', marginBottom: '4px' }}>
              Portfolio — {new Date().getFullYear()}
            </p>
            <p style={{ fontSize: 'clamp(16px, 2vw, 24px)', color: 'var(--ivory)', marginBottom: '4px' }}>
              {siteConfig.role}
            </p>
            <p className="font-serif" style={{ fontStyle: 'italic', fontSize: 'clamp(14px, 1.8vw, 20px)', color: 'var(--silver)' }}>
              crafting products that move.
            </p>
          </div>
          <div className="hero__side-note" style={{ maxWidth: '300px', textAlign: 'right' }}>
            <p className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ash)', marginBottom: '4px' }}>
              Currently
            </p>
            <p style={{ fontSize: 'clamp(16px, 2vw, 24px)', color: 'var(--ivory)', marginBottom: '4px' }}>
              {siteConfig.role}
            </p>
            <p className="font-serif" style={{ fontStyle: 'italic', fontSize: 'clamp(14px, 1.8vw, 20px)', color: 'var(--silver)' }}>
              {siteConfig.company || 'Simpplr'}
            </p>
          </div>
        </div>

        {/* Floor line */}
        <div className="hero__floor-line" style={{
          position: 'absolute',
          bottom: 'clamp(118px, 17vh, 170px)',
          left: 0,
          right: 0,
          height: '1px',
          background: 'var(--lines)',
          transformOrigin: 'center',
          transform: 'scaleX(0)',
          zIndex: 5,
        }} />

        {/* Bottom content */}
        <div className="hero__bottom" style={{
          position: 'absolute',
          bottom: 'clamp(140px, 20vh, 200px)',
          left: 'var(--side-padding)',
          right: 'var(--side-padding)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 10,
        }}>
          <div className="hero__name">
            <span className="font-display" style={{ fontSize: 'clamp(32px, 4vw, 64px)', color: 'var(--ivory)' }}>
              {siteConfig.firstName}
            </span>
            <span className="font-serif" style={{ fontStyle: 'italic', fontSize: 'clamp(24px, 3vw, 48px)', color: 'var(--silver)', marginLeft: '8px' }}>
              {siteConfig.fullName.split(' ').slice(1).join(' ')}
            </span>
          </div>
          <p style={{ fontSize: 'clamp(16px, 2vw, 22px)', color: 'var(--mist)', maxWidth: '600px' }}>
            {siteConfig.summary}
          </p>
          <div className="hero__actions" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="#work" className="btn-primary">See my work</a>
            <a href="#contact" className="btn-secondary">Get in touch</a>
          </div>
        </div>
      </div>

      {/* Character canvas */}
      <canvas
        ref={canvasRef}
        className="hero__character"
        style={{
          position: 'absolute',
          bottom: 'clamp(118px, 17vh, 170px)',
          left: '50%',
          transform: 'translateX(-50%)',
          height: '72%',
          maxHeight: '860px',
          width: 'auto',
          maxWidth: '600px',
          zIndex: 8,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

{/* Wave bubble */}
      <>
        {showWaveBubble && characterState === 'wave' && (
          <div className="hero__wave-bubble" style={{
            position: 'absolute',
            bottom: 'clamp(200px, 25vh, 300px)',
            [bubbleSide === 'left' ? 'left' : 'right']: 'clamp(20px, 5vw, 80px)',
            padding: '12px 20px',
            background: 'var(--charcoal)',
            borderRadius: '12px',
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(14px, 1.8vw, 18px)',
            color: 'var(--ivory)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            opacity: 0,
            transform: `translateY(14px) ${bubbleSide === 'left' ? 'translateX(-20px)' : 'translateX(20px)'} blur(8px)`,
            transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)',
            zIndex: 15,
            whiteSpace: 'nowrap',
          }}
          onAnimationEnd={() => {}}
        >
          {waveMessage}
        </div>
        )}

      </>
    </section>
  );
}