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
    const draw = () => {
      context.clearRect(0, 0, width, height);
      motes.forEach((mote, index) => {
        const y = ((mote.y + (reduceMotion ? 0 : frame * mote.speed)) % 1) * height;
        const pulse = reduceMotion ? 1 : 0.78 + Math.sin(frame * 0.008 + index) * 0.22;
        context.beginPath();
        context.fillStyle = `rgba(238, 223, 190, ${mote.a * pulse})`;
        context.arc(mote.x * width, y, mote.r, 0, Math.PI * 2);
        context.fill();
      });
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
