import { useEffect, useRef } from 'react';

export function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let animation = 0;
    let nextCometAt = performance.now() + 3500 + Math.random() * 6500;
    const comet = {
      active: false,
      startedAt: 0,
      duration: 1800,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      trail: 0.18,
      opacity: 0.35,
      width: 0.8,
    };
    const motes = Array.from({ length: 150 }, (_, index) => ({
      x: ((index * 73) % 997) / 997,
      y: ((index * 199) % 991) / 991,
      r: 0.25 + ((index * 17) % 11) / 15,
      a: 0.08 + ((index * 31) % 17) / 80,
      speed: 0.000025 + (index % 7) * 0.000005,
    }));
    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      motes.forEach((mote, index) => {
        const y = ((mote.y + (reduceMotion ? 0 : frame * mote.speed)) % 1) * height;
        const pulse = reduceMotion ? 1 : 0.78 + Math.sin(frame * 0.008 + index) * 0.22;
        context.beginPath();
        context.fillStyle = `rgba(238, 223, 190, ${mote.a * pulse})`;
        context.arc(mote.x * width, y, mote.r, 0, Math.PI * 2);
        context.fill();
      });
      if (!reduceMotion && !comet.active && time >= nextCometAt) {
        const angles = [0, Math.PI, Math.PI / 2, -Math.PI / 2, Math.PI / 4, -Math.PI / 4, Math.PI * 0.72, -Math.PI * 0.72, Math.PI * 0.12, -Math.PI * 0.12];
        const angle = angles[Math.floor(Math.random() * angles.length)] + (Math.random() - 0.5) * 0.18;
        const distance = Math.hypot(width, height) * (0.28 + Math.random() * 0.72);
        const centerX = width * (0.12 + Math.random() * 0.76);
        const centerY = height * (0.12 + Math.random() * 0.76);
        const travelX = Math.cos(angle) * distance;
        const travelY = Math.sin(angle) * distance;
        comet.active = true;
        comet.startedAt = time;
        comet.duration = 1200 + Math.random() * 1500;
        comet.startX = centerX - travelX / 2;
        comet.startY = centerY - travelY / 2;
        comet.endX = centerX + travelX / 2;
        comet.endY = centerY + travelY / 2;
        comet.trail = 0.08 + Math.random() * 0.2;
        comet.opacity = 0.18 + Math.random() * 0.3;
        comet.width = 0.45 + Math.random() * 0.85;
      }
      if (!reduceMotion && comet.active) {
        const progress = (time - comet.startedAt) / comet.duration;
        if (progress >= 1) {
          comet.active = false;
          nextCometAt = time + 14000 + Math.random() * 18000;
        } else {
          const eased = progress * progress * (3 - 2 * progress);
          const fade = Math.min(1, progress / 0.12) * Math.min(1, (1 - progress) / 0.22);
          const headX = comet.startX + (comet.endX - comet.startX) * eased;
          const headY = comet.startY + (comet.endY - comet.startY) * eased;
          const tailProgress = Math.max(0, eased - comet.trail);
          const tailX = comet.startX + (comet.endX - comet.startX) * tailProgress;
          const tailY = comet.startY + (comet.endY - comet.startY) * tailProgress;
          const gradient = context.createLinearGradient(tailX, tailY, headX, headY);
          gradient.addColorStop(0, 'rgba(228, 218, 194, 0)');
          gradient.addColorStop(0.72, `rgba(228, 218, 194, ${comet.opacity * fade * 0.42})`);
          gradient.addColorStop(1, `rgba(246, 238, 219, ${comet.opacity * fade})`);
          context.save();
          context.strokeStyle = gradient;
          context.lineWidth = comet.width;
          context.shadowColor = 'rgba(228, 218, 194, .42)';
          context.shadowBlur = 8;
          context.beginPath();
          context.moveTo(tailX, tailY);
          context.lineTo(headX, headY);
          context.stroke();
          context.fillStyle = `rgba(250, 242, 224, ${comet.opacity * fade * 0.9})`;
          context.beginPath();
          context.arc(headX, headY, 0.7 + comet.width * 0.6, 0, Math.PI * 2);
          context.fill();
          context.restore();
        }
      }
      frame += 1;
      if (!reduceMotion) animation = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas className="ambient-field" ref={canvasRef} aria-hidden="true" />;
}
