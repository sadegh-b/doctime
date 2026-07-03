// مسیر: src/components/AnimatedBackground.tsx
import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    const update = () => {
      const blobs = container.querySelectorAll<HTMLDivElement>(".blob");
      blobs.forEach((blob, index) => {
        const speed = 0.02 + index * 0.01;
        const x = (mouseX * speed) % (screen.width * 0.1);
        const y = (mouseY * speed) % (screen.height * 0.1);
        blob.style.transform = `translate(${x}px, ${y}px)`;
      });
      animationId = requestAnimationFrame(update);
    };
    animationId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Blob 1 - بنفش */}
      <div
        className="blob absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-3xl opacity-70"
      />
      {/* Blob 2 - آبی */}
      <div
        className="blob absolute top-1/3 -right-20 w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-3xl opacity-70"
      />
      {/* Blob 3 - سبز/آبی */}
      <div
        className="blob absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-teal-400/15 blur-3xl opacity-60"
      />
    </div>
  );
}
