
import React, { useEffect, useRef } from 'react';
import { StatDef } from '../types';

interface RadarChartProps {
    stats: Record<string, StatDef>;
    color?: string;
    bgOpacity?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ stats, color = "#0091ff", bgOpacity = 0.5 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = 100;

        // Clear
        ctx.clearRect(0, 0, w, h);

        const keys = Object.keys(stats);
        const total = keys.length;
        const angleSlice = (Math.PI * 2) / total;

        // Draw Web (Background)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; // Lighter for dark bg
        ctx.lineWidth = 1;
        for (let r = 20; r <= radius; r += 20) {
            ctx.beginPath();
            for (let i = 0; i < total; i++) {
                const angle = i * angleSlice - Math.PI / 2;
                ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Draw Axes & Labels
        for (let i = 0; i < total; i++) {
            const angle = i * angleSlice - Math.PI / 2;
            
            // Axis Line
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.stroke();
            
            // Labels
            const labelName = stats[keys[i]].name;
            const labelRadius = radius + 25;
            ctx.fillStyle = "#aaa";
            ctx.font = "bold 12px 'Rajdhani', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(labelName, cx + labelRadius * Math.cos(angle), cy + labelRadius * Math.sin(angle) + 4);
        }

        // Draw Data Polymer
        ctx.beginPath();
        keys.forEach((key, i) => {
            const val = stats[key].val;
            const r = (Math.min(val, 100) / 100) * radius;
            const angle = i * angleSlice - Math.PI / 2;
            if (i === 0) ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
            else ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        });
        ctx.closePath();
        
        // Fill Area
        // Parse hex color to rgba for opacity
        let r=0, g=145, b=255;
        if(color.startsWith('#')) {
             const bigint = parseInt(color.slice(1), 16);
             r = (bigint >> 16) & 255;
             g = (bigint >> 8) & 255;
             b = bigint & 255;
        }
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${bgOpacity})`;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw Dots
        keys.forEach((key, i) => {
            const val = stats[key].val;
            const r = (Math.min(val, 100) / 100) * radius;
            const angle = i * angleSlice - Math.PI / 2;
            ctx.beginPath();
            ctx.arc(cx + r * Math.cos(angle), cy + r * Math.sin(angle), 5, 0, Math.PI * 2);
            ctx.fillStyle = "#ffc400"; // Brawl Yellow
            ctx.fill();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1;
            ctx.stroke();
        });

    }, [stats, color, bgOpacity]);

    return (
        <div className="w-full aspect-square flex items-center justify-center">
            <canvas ref={canvasRef} width={300} height={300} className="max-w-full max-h-full drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]" />
        </div>
    );
};

export default RadarChart;
