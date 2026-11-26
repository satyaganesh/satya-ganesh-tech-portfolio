import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [cursorState, setCursorState] = useState({ x: 0, y: 0, cursor: 'default', label: '' });
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (prefersReducedMotion || isTouch) {
      if (dotRef.current) dotRef.current.style.display = 'none';
      if (ringRef.current) ringRef.current.style.display = 'none';
      return;
    }

    const updatePosition = () => {
      if (dotRef.current && ringRef.current) {
        gsap.set(dotRef.current, { x: cursorState.x - 3, y: cursorState.y - 3 });
        gsap.to(ringRef.current, {
          x: cursorState.x - (ringRef.current.offsetWidth / 2),
          y: cursorState.y - (ringRef.current.offsetHeight / 2),
          duration: 0.45,
          ease: 'power3.out',
        });
      }
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    const handleMouseMove = (e) => {
      cursorState.x = e.clientX;
      cursorState.y = e.clientY;
      setIsVisible(true);
    };

    const handleMouseEnter = (e) => {
      const target = e.target instanceof Element ? e.target.closest('[data-cursor]') : null;
      if (target) {
        const type = target.dataset.cursor;
        if (type === 'link') {
          setCursorState(prev => ({ ...prev, cursor: 'link' }));
          ringRef.current?.setAttribute('data-cursor', 'link');
        } else if (type === 'drag') {
          setCursorState(prev => ({ ...prev, cursor: 'drag', label: target.dataset.label || 'DRAG' }));
          ringRef.current?.setAttribute('data-cursor', 'drag');
          ringRef.current?.setAttribute('data-label', target.dataset.label || 'DRAG');
        }
      }
    };

    const handleMouseLeave = (e) => {
      const target = e.target instanceof Element ? e.target.closest('[data-cursor]') : null;
      if (target) {
        setCursorState(prev => ({ ...prev, cursor: 'default', label: '' }));
        ringRef.current?.removeAttribute('data-cursor');
        ringRef.current?.removeAttribute('data-label');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    updatePosition();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [cursorState.cursor]);

  if (!isVisible) return null;

  return (
    <div className="custom-cursor" ref={ringRef} data-cursor={cursorState.cursor} data-label={cursorState.label} style={{ display: 'block' }}>
      <div className="custom-cursor__dot" ref={dotRef} />
      <div className="custom-cursor__ring" />
    </div>
  );
}