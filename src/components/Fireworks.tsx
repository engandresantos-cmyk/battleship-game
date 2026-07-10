import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const COLORS = ["#ff5252", "#ffd740", "#69f0ae", "#40c4ff", "#e040fb", "#ffffff"];
const MAX_BURSTS = 6;

export function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    let particles: Particle[] = [];
    let running = true;
    let rafId = 0;
    let lastBurst = 0;
    let burstCount = 0;

    function burst(x: number, y: number) {
      const count = 40 + Math.floor(Math.random() * 20);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = 2 + Math.random() * 3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color,
        });
      }
    }

    function frame(time: number) {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, width, height);

      if (time - lastBurst > 650 && burstCount < MAX_BURSTS) {
        burst(width * (0.2 + Math.random() * 0.6), height * (0.15 + Math.random() * 0.35));
        lastBurst = time;
        burstCount++;
      }

      particles.forEach((p) => {
        p.vy += 0.03;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.012;
      });
      particles = particles.filter((p) => p.life > 0);

      for (const p of particles) {
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (burstCount < MAX_BURSTS || particles.length > 0) {
        rafId = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden="true" />;
}
