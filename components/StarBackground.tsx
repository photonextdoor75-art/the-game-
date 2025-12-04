
import React, { useEffect, useRef } from 'react';
import { SEASON_CONFIG } from '../constants';
import { SeasonType } from '../types';

interface StarBackgroundProps {
    season?: SeasonType;
}

const StarBackground: React.FC<StarBackgroundProps> = ({ season = 'RENTREE' }) => {
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

    // Particle Logic
    class Particle {
        x: number = 0;
        y: number = 0;
        size: number = 0;
        vx: number = 0;
        vy: number = 0;
        rotation: number = 0;
        rotSpeed: number = 0;
        opacity: number = 0;
        fadeDir: number = 0;
        color: string = '';
        type: 'STAR' | 'SNOW' | 'LEAF' | 'PETAL' | 'FIREFLY' = 'STAR';

        constructor() {
            this.reset(true);
        }

        reset(init = false) {
            this.x = Math.random() * w;
            this.opacity = Math.random();
            this.fadeDir = Math.random() > 0.5 ? 0.01 : -0.01;

            // Define behavior based on Season
            switch(season) {
                case 'NOEL':
                case 'HIVER':
                    // Snow: Falls down, small sway
                    this.type = 'SNOW';
                    this.y = init ? Math.random() * h : -10;
                    this.size = Math.random() * 3 + 2;
                    this.vy = Math.random() * 1 + 0.5; // Falls down
                    this.vx = (Math.random() - 0.5) * 0.5; // Sway
                    this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
                    break;

                case 'AUTOMNE':
                    // Leaves: Falls down slowly, big sway, rotates
                    this.type = 'LEAF';
                    this.y = init ? Math.random() * h : -10;
                    this.size = Math.random() * 6 + 4;
                    this.vy = Math.random() * 0.8 + 0.2;
                    this.vx = (Math.random() - 0.5) * 1.5;
                    this.rotSpeed = (Math.random() - 0.5) * 2;
                    this.rotation = Math.random() * 360;
                    // Autumn colors: Orange, Brown, Red, Gold
                    const autumnColors = ['#e67e22', '#d35400', '#f1c40f', '#8e44ad', '#c0392b'];
                    this.color = autumnColors[Math.floor(Math.random() * autumnColors.length)];
                    break;

                case 'PRINTEMPS':
                    // Petals: Falls down very slowly, floats
                    this.type = 'PETAL';
                    this.y = init ? Math.random() * h : -10;
                    this.size = Math.random() * 4 + 2;
                    this.vy = Math.random() * 0.5 + 0.2;
                    this.vx = (Math.random() - 0.5) * 1;
                    this.rotSpeed = (Math.random() - 0.5) * 1;
                    this.rotation = Math.random() * 360;
                    this.color = Math.random() > 0.5 ? '#ff9ff3' : '#ffffff'; // Pink or White
                    break;
                
                case 'ETE':
                    // Fireflies: Floats up/around, glows
                    this.type = 'FIREFLY';
                    this.y = init ? Math.random() * h : h + 10;
                    this.size = Math.random() * 3 + 1;
                    this.vy = -Math.random() * 0.5 - 0.1; // Slowly rises
                    this.vx = (Math.random() - 0.5) * 1;
                    this.color = '#f1c40f'; // Yellow glow
                    break;

                case 'RENTREE':
                default:
                    // Stars: Rises slowly (Cosmic feel)
                    this.type = 'STAR';
                    this.y = init ? Math.random() * h : h + 10;
                    this.size = Math.random() * 8 + 3; 
                    this.vy = -Math.random() * 0.5 - 0.2; 
                    this.rotSpeed = (Math.random() - 0.5) * 2;
                    this.rotation = Math.random() * 360;
                    this.color = `hsl(${45 + Math.random()*10}, 100%, ${70 + Math.random()*30}%)`;
                    break;
            }
        }

        update() {
            this.y += this.vy;
            this.x += this.vx;
            this.rotation += this.rotSpeed;
            this.opacity += this.fadeDir;
            
            // Opacity Oscillation
            if (this.opacity > 1 || this.opacity < 0.2) this.fadeDir *= -1;

            // Boundary Checks
            if (this.type === 'SNOW' || this.type === 'LEAF' || this.type === 'PETAL') {
                if (this.y > h + 20) this.reset();
            } else {
                if (this.y < -20) this.reset();
            }
            
            if (this.x < -20) this.x = w + 20;
            if (this.x > w + 20) this.x = -20;
        }

        draw() {
            if(!ctx) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;
            
            if (this.type === 'STAR') {
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.color;
                ctx.fillStyle = this.color;
                this.drawStarShape(ctx, 0, 0, 5, this.size, this.size/2);
            } else if (this.type === 'SNOW' || this.type === 'FIREFLY') {
                ctx.fillStyle = this.color;
                ctx.shadowBlur = this.type === 'FIREFLY' ? 10 : 0;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'LEAF' || this.type === 'PETAL') {
                ctx.fillStyle = this.color;
                // Simple oval for leaf/petal
                ctx.beginPath();
                ctx.ellipse(0, 0, this.size, this.size/2, 0, 0, Math.PI*2);
                ctx.fill();
            }

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

    const particles: Particle[] = [];
    const count = (season === 'NOEL' || season === 'HIVER') ? 80 : 40; // More particles for snow
    for (let i = 0; i < count; i++) particles.push(new Particle());

    let animationId: number;
    const loop = () => {
        ctx.clearRect(0, 0, w, h);
        
        // Background Gradient
        const config = SEASON_CONFIG[season] || SEASON_CONFIG['RENTREE'];
        const gradient = ctx.createRadialGradient(w/2, h*0.4, 0, w/2, h*0.4, w);
        gradient.addColorStop(0, config.bgGradient[0]);
        gradient.addColorStop(0.8, config.bgGradient[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,w,h);

        particles.forEach(s => { s.update(); s.draw(); });
        animationId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationId);
    }
  }, [season]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

export default StarBackground;
