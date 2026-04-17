import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface LandingProps {
  onStart: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

function createParticle(id: number, side: 'left' | 'right' | 'random'): Particle {
  const isRed = Math.random() > 0.5;
  const xBase = side === 'left' ? Math.random() * 30 : side === 'right' ? 70 + Math.random() * 30 : Math.random() * 100;

  return {
    id,
    x: xBase,
    y: -5 - Math.random() * 20,
    size: 3 + Math.random() * 6,
    color: isRed
      ? `rgba(${180 + Math.random() * 60}, ${20 + Math.random() * 40}, ${30 + Math.random() * 30}, ${0.5 + Math.random() * 0.4})`
      : `rgba(${200 + Math.random() * 55}, ${170 + Math.random() * 50}, ${60 + Math.random() * 40}, ${0.4 + Math.random() * 0.4})`,
    speed: 0.15 + Math.random() * 0.3,
    drift: (Math.random() - 0.5) * 0.4,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 2,
    opacity: 0.4 + Math.random() * 0.5,
  };
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      const side = i % 3 === 0 ? 'left' : i % 3 === 1 ? 'right' : 'random';
      const p = createParticle(i, side);
      p.y = Math.random() * 100;
      particlesRef.current.push(p);
    }

    let nextId = 60;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.08) {
        const side = Math.random() < 0.4 ? 'left' : Math.random() < 0.7 ? 'right' : 'random';
        particlesRef.current.push(createParticle(nextId++, side));
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.y += p.speed;
        p.x += p.drift + Math.sin(p.y * 0.02) * 0.15;
        p.rotation += p.rotationSpeed;

        if (p.y > 105) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        const px = (p.x / 100) * canvas.width;
        const py = (p.y / 100) * canvas.height;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.5, p.size * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

export function Landing({ onStart }: LandingProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Force autoplay with multiple strategies
  const forcePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) return;
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    // Strategy 1: immediate attempt
    forcePlay();
    // Strategy 2: delayed attempt
    const t1 = setTimeout(forcePlay, 300);
    const t2 = setTimeout(forcePlay, 1000);
    // Strategy 3: on any user interaction anywhere on the page
    const handler = () => forcePlay();
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('keydown', handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('mousemove', handler, { once: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('mousemove', handler);
    };
  }, [forcePlay]);

  const handleStart = () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
          audio.pause();
          clearInterval(fadeOut);
        }
      }, 80);
    }
    onStart();
  };

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center select-none cursor-default"
      style={{ zIndex: 9999 }}
    >
      {/* Audio — autoplay + muted fallback to bypass browser restrictions */}
      <audio ref={audioRef} src="/theme.mp3" loop preload="auto" autoPlay />

      {/* Dark smoky background */}
      <div className="absolute inset-0 bg-gradient-radial from-[#0a0a0f] via-[#05050a] to-black" />

      {/* Subtle smoke wisps */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-ink-flow"
          style={{ background: 'radial-gradient(circle, rgba(40,35,50,0.6) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-ink-flow"
          style={{ background: 'radial-gradient(circle, rgba(30,25,40,0.5) 0%, transparent 70%)', animationDelay: '3s' }}
        />
      </div>

      {/* Falling leaves */}
      <ParticleCanvas />

      {/* Title content */}
      <div className="relative flex flex-col items-center" style={{ zIndex: 2 }}>

        {/* "OBSCURE" — small caps above */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 2, delay: 0.3 }}
          className="tracking-[0.5em] uppercase font-display text-xs"
          style={{ color: '#b0a68e' }}
        >
          Obscure
        </motion.p>

        {/* "The Last Market" */}
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 2, delay: 0.6 }}
          className="tracking-[0.35em] uppercase font-display text-[11px] mt-1"
          style={{ color: '#8a8070' }}
        >
          The Last Market
        </motion.p>

        {/* "EXPEDITION" — large, wide, bold serif, matching game style */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.8 }}
          className="font-display uppercase leading-[0.85] mt-4"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 6rem)',
            fontWeight: 300,
            letterSpacing: '0.08em',
            color: '#ddd0b3',
            textShadow: '0 2px 30px rgba(201, 169, 89, 0.1)',
          }}
        >
          Expedition
        </motion.h1>

        {/* "33" — massive gold gradient, tightly coupled below */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5, delay: 1.2 }}
          className="relative mt-[-0.1em]"
        >
          {/* Thin gold separator line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 2 }}
            className="h-px bg-gradient-to-r from-transparent via-[#c9a959]/40 to-transparent mb-1 mx-auto"
            style={{ width: '110%', marginLeft: '-5%' }}
          />
          <span
            className="font-display block text-center"
            style={{
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#c9a959',
              textShadow: '0 4px 25px rgba(201, 169, 89, 0.2)',
            }}
          >
            33
          </span>
        </motion.div>

      </div>

      {/* "Start Expedition" — fixed to bottom area, outside the title block */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 3 }}
        onClick={handleStart}
        className="absolute bottom-[12%] bg-transparent border-none outline-none cursor-pointer"
        style={{ zIndex: 3 }}
      >
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="font-display text-base tracking-[0.3em] uppercase"
          style={{ color: '#a89f8f' }}
        >
          Start Expedition
        </motion.span>
      </motion.button>

      {/* Vignettes */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" style={{ zIndex: 1 }} />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" style={{ zIndex: 1 }} />
    </div>
  );
}
