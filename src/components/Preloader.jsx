import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { siteConfig } from '../data';

const greetings = [
  'Hello',
  'నమస్తే',
  'नमस्ते',
  'Hola',
  'Bonjour',
  'Ciao',
  'こんにちは',
  'Hi',
];

export function Preloader({ onComplete }) {
  const overlayRef = useRef(null);
  const counterRef = useRef(null);
  const progressRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    if (!overlayRef.current) return;

    const ctx = gsap.context(() => {
      // Greeting cycle
      const greetingInterval = setInterval(() => {
        setGreetingIndex((prev) => (prev + 1) % greetings.length);
      }, 260);

      // Counter animation
      const counterObj = { value: 0 };
      gsap.to(counterObj, {
        value: 100,
        duration: 2.5,
        ease: 'power2.out',
        onUpdate: () => {
          const val = Math.round(counterObj.value);
          setProgress(val);
          if (counterRef.current) {
            counterRef.current.textContent = val.toString().padStart(3, '0');
          }
          if (progressRef.current) {
            progressRef.current.style.width = `${val}%`;
          }
        },
        onComplete: () => {
          clearInterval(greetingInterval);
          // Fade up items
          gsap.to('.preloader__content > *', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            onComplete: () => {
              // Wipe up
              gsap.to(overlayRef.current, {
                clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                duration: 1.1,
                ease: 'power3.inOut',
                onComplete: () => {
                  onComplete();
                },
              });
            },
          });
        },
      });

      return () => {
        clearInterval(greetingInterval);
      };
    }, overlayRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="preloader"
      style={{
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        background: 'radial-gradient(ellipse at center, #232326 0%, #111112 100%)',
      }}
    >
      <div className="preloader__content" style={{ opacity: 0, y: 30 }}>
        <p className="preloader__greeting font-serif" style={{ fontStyle: 'italic', fontSize: 'clamp(24px, 4vw, 48px)', color: 'var(--silver)', marginBottom: '24px', minHeight: '60px' }}>
          {greetings[greetingIndex]}
        </p>
        <div className="preloader__counter font-display" ref={counterRef} style={{ fontSize: 'clamp(80px, 15vw, 200px)', lineHeight: 1, color: 'var(--ivory)', marginBottom: '16px' }}>
          000
        </div>
        <div className="preloader__name font-mono" style={{ fontSize: 'clamp(14px, 2vw, 20px)', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--mist)', marginBottom: '4px' }}>
          {siteConfig.fullName.toUpperCase()}
        </div>
        <div className="preloader__tagline font-mono" style={{ fontSize: 'clamp(12px, 1.5vw, 16px)', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--ash)' }}>
          Portfolio {new Date().getFullYear()}
        </div>
        <div className="preloader__progress" style={{ width: '100%', maxWidth: '400px', height: '1px', background: 'var(--lines)', marginTop: '32px', overflow: 'hidden' }}>
          <div ref={progressRef} style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, var(--ivory) 0%, #5a5854 100%)', transition: 'width 0.1s linear' }} />
        </div>
      </div>
    </div>
  );
}