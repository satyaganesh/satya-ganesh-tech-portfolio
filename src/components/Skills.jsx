import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Matter from 'matter-js';
import { skills } from '../data';

gsap.registerPlugin(ScrollTrigger);

const allSkills = Object.entries(skills).flatMap(([category, skillList]) =>
  skillList.map(skill => ({ name: skill, category }))
);

const categoryColors = {
  Languages: 'linear-gradient(135deg, #c9a96e 0%, #b8965e 100%)',
  Frontend: 'linear-gradient(135deg, #a8a49e 0%, #96928c 100%)',
  Backend: 'linear-gradient(135deg, #cfcac2 0%, #bdb9b1 100%)',
  Databases: 'linear-gradient(135deg, #efebe4 0%, #dddcd5 100%)',
  Tools: 'linear-gradient(135deg, #f7f5f1 0%, #e5e3dc 100%)',
  Core: 'linear-gradient(135deg, #c9a96e 0%, #b8965e 100%)',
};

export function Skills() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [engine, setEngine] = useState(null);
  const [bodies, setBodies] = useState([]);
  const [pitBounds, setPitBounds] = useState({ width: 0, height: 0 });

  const filters = ['All', ...Object.keys(skills), 'Shake all'];

  // Initialize Matter.js
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    const eng = Matter.Engine.create();
    eng.gravity.y = 1.1;
    eng.gravity.x = 0;
    eng.timing.timeScale = 1;

    // Create renderer
    const render = Matter.Render.create({
      canvas,
      engine: eng,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
      },
    });

    // Pit boundaries
    const wallThickness = 50;
    const pitRadius = Math.min(width, height) * 0.4;
    const centerX = width / 2;
    const centerY = height / 2 + 50;

    // Circular pit walls using multiple segments
    const wallCount = 24;
    const walls = [];
    for (let i = 0; i < wallCount; i++) {
      const angle = (i / wallCount) * Math.PI * 2;
      const nextAngle = ((i + 1) / wallCount) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle) * pitRadius;
      const y1 = centerY + Math.sin(angle) * pitRadius;
      const x2 = centerX + Math.cos(nextAngle) * pitRadius;
      const y2 = centerY + Math.sin(nextAngle) * pitRadius;
      
      const wall = Matter.Bodies.rectangle(
        (x1 + x2) / 2,
        (y1 + y2) / 2,
        Math.hypot(x2 - x1, y2 - y1),
        wallThickness,
        {
          isStatic: true,
          angle: (angle + nextAngle) / 2,
          render: { fillStyle: 'transparent', strokeStyle: 'transparent' },
        }
      );
      walls.push(wall);
    }

    // Bottom of pit
    const bottom = Matter.Bodies.rectangle(centerX, centerY + pitRadius + wallThickness/2, pitRadius * 2, wallThickness, {
      isStatic: true,
      render: { fillStyle: 'transparent' },
      restitution: 0.45,
    });

    Matter.World.add(eng.world, [...walls, bottom]);

    // Create skill pills as bodies
    const skillBodies = allSkills.map((skill, i) => {
      const radius = 60 + skill.name.length * 4;
      const body = Matter.Bodies.circle(
        centerX + (Math.random() - 0.5) * 100,
        centerY - pitRadius - 100 - i * 30,
        radius,
        {
          restitution: 0.45,
          friction: 0.3,
          frictionAir: 0.02,
          density: 0.001,
          render: {
            fillStyle: categoryColors[skill.category] || categoryColors.Tools,
            strokeStyle: 'var(--ivory)',
            lineWidth: 2,
          },
          plugin: {
            skillName: skill.name,
            category: skill.category,
          },
        }
      );
      return { body, skill };
    });

    Matter.World.add(eng.world, skillBodies.map(b => b.body));

    setEngine(eng);
    setBodies(skillBodies);
    setPitBounds({ width, height, centerX, centerY, pitRadius });

    Matter.Render.run(render);
    Matter.Runner.run(eng);

    return () => {
      Matter.Render.stop(render);
      Matter.World.clear(eng.world, false);
      Matter.Engine.clear(eng);
    };
  }, []);

  // Add skills to pit when section visible
  useEffect(() => {
    if (!sectionRef.current || !engine) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        onEnter: () => {
          // Skills already fall in naturally due to gravity
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [engine]);

  // Mouse interaction
  useEffect(() => {
    if (!engine || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let mouseConstraint = null;

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Check if clicking on a body
      const bodies = Matter.Composite.allBodies(engine.world);
      const body = Matter.Query.point(bodies, { x: mouseX, y: mouseY })[0];
      
      if (body && !body.isStatic) {
        mouseConstraint = Matter.MouseConstraint.create(engine, {
          mouse: Matter.Mouse.create(canvas),
          constraint: {
            stiffness: 0.2,
            render: { visible: false },
          },
        });
        Matter.World.add(engine.world, mouseConstraint);
      }
    };

    const handleMouseUp = () => {
      if (mouseConstraint) {
        Matter.World.remove(engine.world, mouseConstraint);
        mouseConstraint = null;
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (mouseConstraint) {
        Matter.World.remove(engine.world, mouseConstraint);
      }
    };
  }, [engine]);

  // Filter handling
  useEffect(() => {
    if (!engine) return;

    const bodies = Matter.Composite.allBodies(engine.world);
    
    bodies.forEach(body => {
      if (body.plugin?.skillName) {
        const matches = activeFilter === 'All' || 
          activeFilter === 'Shake all' || 
          body.plugin.category === activeFilter;
        
        if (matches) {
          body.render.fillStyle = categoryColors[body.plugin.category] || categoryColors.Tools;
          body.render.strokeStyle = 'var(--accent)';
          body.render.lineWidth = 3;
          
          if (activeFilter === 'Shake all') {
            Matter.Body.applyForce(body, body.position, {
              x: (Math.random() - 0.5) * 0.02,
              y: -0.01 - Math.random() * 0.02,
            });
          }
        } else {
          body.render.fillStyle = 'var(--slate)';
          body.render.strokeStyle = 'var(--lines)';
          body.render.lineWidth = 1;
        }
      }
    });
  }, [activeFilter, engine]);

  // Render loop for custom drawing
  useEffect(() => {
    if (!engine || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const render = () => {
      if (!ctx || !canvasRef.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw "STACK" text faintly in background
      ctx.save();
      ctx.font = 'bold 200px Anton, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(168,164,158,0.03)';
      ctx.fillText('STACK', canvas.width / 2, canvas.height / 2 + 50);
      ctx.restore();

      // Draw bodies with labels
      const bodies = Matter.Composite.allBodies(engine.world);
      bodies.forEach(body => {
        if (body.isStatic || !body.plugin?.skillName) return;

        const pos = body.position;
        const radius = body.circleRadius || 40;

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(body.angle);

        // Draw pill shape
        const pillWidth = radius * 2 + 20;
        const pillHeight = radius * 1.2;
        
        ctx.beginPath();
        ctx.roundRect(-pillWidth/2, -pillHeight/2, pillWidth, pillHeight, pillHeight/2);
        
        // Gradient fill
        const grad = ctx.createLinearGradient(-pillWidth/2, -pillHeight/2, pillWidth/2, pillHeight/2);
        const catColor = categoryColors[body.plugin.category] || categoryColors.Tools;
        // Parse gradient colors (simplified)
        grad.addColorStop(0, catColor.includes('#c9a96e') ? '#c9a96e' : '#a8a49e');
        grad.addColorStop(1, catColor.includes('#b8965e') ? '#b8965e' : '#96928c');
        ctx.fillStyle = grad;
        ctx.fill();

        // Outline
        ctx.strokeStyle = body.render.strokeStyle || 'var(--ivory)';
        ctx.lineWidth = body.render.lineWidth || 2;
        ctx.stroke();

        // Text
        ctx.fillStyle = body.plugin.category === 'Tools' || body.plugin.category === 'Databases' ? 'var(--ink)' : 'var(--ink)';
        ctx.font = 'bold 14px Anton, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(body.plugin.skillName.toUpperCase(), 0, 2);

        ctx.restore();
      });

      requestAnimationFrame(render);
    };

    render();
  }, [engine]);

  return (
    <section ref={sectionRef} id="skills" className="skills" style={{
      minHeight: '100vh',
      padding: '120px var(--side-padding)',
      background: 'var(--charcoal)',
      position: 'relative',
    }}>
      <div className="container" style={{ maxWidth: '1200px', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p className="eyebrow">05 — Toolbox</p>
          <h2 style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(48px, 6vw, 96px)',
            lineHeight: 0.95,
            color: 'var(--ivory)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Grab a skill,
            <br />
            <span className="font-serif" style={{ fontStyle: 'italic', color: 'var(--accent)' }}>
              throw it around.
            </span>
          </h2>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '48px' }}>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`pill ${activeFilter === filter ? 'pill-accent' : 'pill-outline'}`}
              style={{ fontSize: '11px' }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Physics pit */}
        <div style={{ position: 'relative', height: '60vh', minHeight: '400px', borderRadius: '24px', overflow: 'hidden', background: 'var(--ink)' }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
            aria-label="Interactive skills visualization"
          />
        </div>
      </div>
    </section>
  );
}