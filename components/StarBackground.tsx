
import React, { useEffect, useRef } from 'react';

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    const resize = () => {
        if(canvas) {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
    };
    window.addEventListener('resize', resize);

    class Star {
        x: number = 0;
        y: number = 0;
        size: number = 0;
        vy: number = 0;
        rotation: number = 0;
        rotSpeed: number = 0;
        opacity: number = 0;
        fadeDir: number = 0;
        color: string = '';

        constructor() {
            this.reset(true);
        }

        reset(init = false) {
            this.x = Math.random() * w;
            this.y = init ? Math.random() * h : h + 10;
            this.size = Math.random() * 8 + 3; 
            this.vy = -Math.random() * 0.5 - 0.2; 
            this.rotation = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 2;
            this.opacity = Math.random();
            this.fadeDir = Math.random() > 0.5 ? 0.01 : -0.01;
            this.color = `hsl(${45 + Math.random()*10}, 100%, ${70 + Math.random()*30}%)`; // GOLDISH
        }

        update() {
            this.y += this.vy;
            this.rotation += this.rotSpeed;
            this.opacity += this.fadeDir;
            
            if (this.opacity > 1 || this.opacity < 0.2) this.fadeDir *= -1;
            if (this.y < -20) this.reset();
        }

        draw() {
            if(!ctx) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            
            // Draw Star Shape
            this.drawStarShape(ctx, 0, 0, 5, this.size, this.size/2);
            
            ctx.restore();
        }

        drawStarShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            let step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius)
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y)
                rot += step

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y)
                rot += step
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.fill();
        }
    }

    const stars: Star[] = [];
    for (let i = 0; i < 35; i++) stars.push(new Star());

    let animationId: number;
    const loop = () => {
        ctx.clearRect(0, 0, w, h);
        
        // Background Gradient
        const gradient = ctx.createRadialGradient(w/2, h*0.4, 0, w/2, h*0.4, w);
        gradient.addColorStop(0, '#2b1145');
        gradient.addColorStop(0.8, '#05020a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,w,h);

        stars.forEach(s => { s.update(); s.draw(); });
        animationId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationId);
    }
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

export default StarBackground;
