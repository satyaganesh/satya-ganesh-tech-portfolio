import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteConfig } from '../data';
import { useLenis } from '../hooks/useGSAP';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Numbers', href: '#numbers' },
  { label: 'Work', href: '#work' },
  { label: 'Skills', href: '#skills' },
  { label: 'Journey', href: '#journey' },
  { label: 'Contact', href: '#contact' },
];

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const lenis = useLenis();

  const scrollTo = (href) => {
    const target = document.querySelector(href);
    if (target && lenis) {
      lenis.scrollTo(target, { offset: 0, immediate: false });
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!navRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.nav__link', { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
      gsap.fromTo('.nav__brand', { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '<');
      gsap.fromTo('.nav__cta', { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '<0.1');
    }, navRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <nav ref={navRef} className="nav" role="navigation" aria-label="Main navigation">
      <div className="nav__inner">
        <div className="nav__brand">
          <span className="font-display" style={{ fontSize: 'clamp(18px, 2.5vw, 28px)' }}>
            {siteConfig.firstName.charAt(0)}{siteConfig.fullName.split(' ')[1]?.charAt(0)}
          </span>
          <span className="nav__copyright" style={{ fontSize: '10px', marginLeft: '4px', color: 'var(--ash)' }}>©</span>
        </div>

        <div className="nav__links" style={{ display: 'flex', gap: 'clamp(16px, 3vw, 40px)' }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="nav__link"
              style={{
                fontFamily: "'Inter Variable', sans-serif",
                fontSize: '13px',
                color: '#4a4844',
                textTransform: 'none',
                letterSpacing: 'normal',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
            >
              <span style={{ display: 'inline-block', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                {link.label}
              </span>
            </a>
          ))}
        </div>

        <div className="nav__cta">
          <a href={`mailto:${siteConfig.email}`} className="nav__pill pill pill-charcoal" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span className="nav__pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            Open to work
          </a>
        </div>

        <button
          className="nav__burger"
          style={{
            display: 'none',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid var(--lines)',
            background: 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span style={{ width: '20px', height: '2px', background: 'var(--ivory)', display: 'block', position: 'relative' }} />
        </button>
      </div>

      {isMenuOpen && (
        <div className="nav__mobile-menu" style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--ink)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: 'var(--side-padding)',
        }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-display"
              style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--ivory)' }}
              onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
            >
              {link.label}
            </a>
          ))}
          <a href={`mailto:${siteConfig.email}`} className="pill pill-charcoal" style={{ marginTop: '24px' }}>
            Open to work
          </a>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
        @media (max-width: 1100px) {
          .nav__links { display: none !important; }
          .nav__cta { display: none !important; }
          .nav__burger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}