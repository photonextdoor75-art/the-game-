
import React, { useState, useRef, useEffect } from 'react';
import { Gamepad2, Calculator, ArrowLeft, Check, X, Box, Triangle, Circle, Shapes } from 'lucide-react';

interface MathGameProps {
    onWin: (tokens: number, xp: number) => void;
    onClose?: () => void;
}

type MathMode = 'ADD' | 'SUB' | 'MUL' | 'DIV';
type GameSection = 'MENU' | 'CALC' | 'GEO';
type GeoMode = 'MENU' | 'ANATOMY' | 'GALLERY';

const MathGame: React.FC<MathGameProps> = ({ onWin, onClose }) => {
    const [section, setSection] = useState<GameSection>('MENU');

    // --- CALC STATES ---
    const [calcMode, setCalcMode] = useState<MathMode | null>(null);
    const [problem, setProblem] = useState<{a: number, b: number, op: string, res: number} | null>(null);
    const [feedback, setFeedback] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
    const [tens, setTens] = useState(0);
    const [units, setUnits] = useState(0);

    // --- GEO STATES ---
    const [geoMode, setGeoMode] = useState<GeoMode>('MENU');
    const [anatomyFocus, setAnatomyFocus] = useState<'NONE' | 'FACES' | 'EDGES' | 'VERTICES'>('NONE');
    const [galleryShape, setGalleryShape] = useState<string>('CUBE');

    // --- CALC LOGIC ---
    const generateProblem = (selectedMode: MathMode) => {
        let a = 0, b = 0, res = 0, op = '+';
        switch(selectedMode) {
            case 'ADD': a = Math.floor(Math.random()*30)+1; b = Math.floor(Math.random()*20)+1; res=a+b; op='+'; break;
            case 'SUB': a = Math.floor(Math.random()*30)+10; b = Math.floor(Math.random()*a); res=a-b; op='-'; break;
            case 'MUL': a = Math.floor(Math.random()*8)+2; b = Math.floor(Math.random()*9)+1; res=a*b; op='×'; break;
            case 'DIV': b = Math.floor(Math.random()*8)+2; res=Math.floor(Math.random()*9)+1; a=b*res; op='÷'; break;
        }
        setProblem({ a, b, op, res });
        setTens(0); setUnits(0); setFeedback('IDLE');
    };

    const startCalc = (m: MathMode) => {
        setCalcMode(m);
        generateProblem(m);
        setSection('CALC');
    };

    const checkCalc = () => {
        if (!problem) return;
        const userAnswer = (tens * 10) + units;
        if (userAnswer === problem.res) {
            setFeedback('CORRECT');
            const rewardTokens = calcMode === 'ADD' ? 5 : calcMode === 'SUB' ? 10 : calcMode === 'MUL' ? 20 : 30;
            const rewardXp = rewardTokens * 2.5;
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            setTimeout(() => { onWin(rewardTokens, rewardXp); generateProblem(calcMode!); }, 1000);
        } else {
            setFeedback('WRONG');
            if (navigator.vibrate) navigator.vibrate(200);
            setTimeout(() => setFeedback('IDLE'), 800);
        }
    };

    // --- RENDERERS ---

    // 1. MAIN MENU
    if (section === 'MENU') {
        return (
            <div className="flex flex-col h-full p-4 animate-fade-in relative bg-[#120c18]">
                <div className="flex items-center justify-between mb-8">
                     <button onClick={onClose} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 active:scale-95"><ArrowLeft size={24} /></button>
                     <h2 className="font-title text-3xl text-white text-stroke-1">MATHS HUB</h2>
                     <div className="w-10"></div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <button onClick={() => setSection('CALC')} className="bg-brawl-blue p-6 rounded-2xl border-b-8 border-blue-800 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-between group">
                        <div className="text-left">
                            <div className="text-4xl font-title text-white text-stroke-1 mb-1">CALCUL</div>
                            <div className="text-blue-100 font-bold uppercase text-sm">Mental & Opérations</div>
                        </div>
                        <Calculator size={64} className="text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                    </button>

                    <button onClick={() => { setSection('GEO'); setGeoMode('MENU'); }} className="bg-brawl-purple p-6 rounded-2xl border-b-8 border-purple-900 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-between group">
                        <div className="text-left">
                            <div className="text-4xl font-title text-white text-stroke-1 mb-1">GÉOMÉTRIE</div>
                            <div className="text-purple-100 font-bold uppercase text-sm">Formes 3D & Espace</div>
                        </div>
                        <Box size={64} className="text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        );
    }

    // 2. CALCULATION GAME
    if (section === 'CALC') {
        if (!calcMode) {
             return (
                <div className="flex flex-col h-full p-4 animate-fade-in">
                    <div className="flex items-center mb-8"><button onClick={() => setSection('MENU')} className="p-2 bg-white/10 rounded-lg"><ArrowLeft size={24} /></button><h2 className="ml-4 font-title text-2xl text-brawl-blue">CHOIX DU CALCUL</h2></div>
                    <div className="grid grid-cols-2 gap-4">
                        <GameCard title="ADDITION" subtitle="Niveau 1" icon="➕" color="bg-brawl-green" onClick={() => startCalc('ADD')} reward="5 PTS"/>
                        <GameCard title="SOUSTRACTION" subtitle="Niveau 2" icon="➖" color="bg-brawl-blue" onClick={() => startCalc('SUB')} reward="10 PTS"/>
                        <GameCard title="MULTIPLICATION" subtitle="Niveau 3" icon="✖️" color="bg-brawl-purple" onClick={() => startCalc('MUL')} reward="20 PTS"/>
                        <GameCard title="DIVISION" subtitle="Expert" icon="➗" color="bg-brawl-red" onClick={() => startCalc('DIV')} reward="30 PTS"/>
                    </div>
                </div>
             );
        }
        return (
            <div className="flex flex-col h-full bg-black/20 animate-fade-in">
                <div className="flex items-center justify-between p-4 bg-[#1e1629] border-b border-white/10">
                    <button onClick={() => setCalcMode(null)} className="p-2 bg-white/10 rounded-lg"><ArrowLeft size={24} /></button>
                    <div className="font-title text-xl text-gray-200">DÉFI MATHS</div>
                    <div className="w-10"></div>
                </div>
                <div className="flex-grow flex flex-col items-center justify-center p-6 gap-8">
                    <div className="flex items-center gap-4 text-5xl font-title text-white drop-shadow-xl bg-black/40 px-8 py-6 rounded-2xl border-2 border-white/10">
                        <span className="text-brawl-blue">{problem?.a}</span><span className="text-gray-400">{problem?.op}</span><span className="text-brawl-purple">{problem?.b}</span><span className="text-gray-400">=</span><span className="text-brawl-yellow">?</span>
                    </div>
                    <div className="flex gap-2 p-4 bg-[#1e1629] rounded-2xl border-4 border-[#3d2e4f] shadow-2xl relative">
                        <div className="absolute top-1/2 left-0 w-full h-12 -mt-6 bg-white/5 border-y border-brawl-yellow/50 pointer-events-none z-10"></div>
                        <WheelColumn value={tens} onChange={setTens} label="DIZAINES" />
                        <WheelColumn value={units} onChange={setUnits} label="UNITÉS" />
                    </div>
                    <div className="h-8 flex items-center justify-center">{feedback === 'CORRECT' && <span className="text-brawl-green font-title text-2xl animate-pop">BRAVO !</span>}{feedback === 'WRONG' && <span className="text-red-500 font-title text-2xl animate-shake">OUPS !</span>}</div>
                    <button onClick={checkCalc} className={`w-full max-w-xs py-4 rounded-xl font-title text-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all ${feedback === 'CORRECT' ? 'bg-brawl-green border-green-800 text-black' : 'bg-brawl-yellow border-yellow-800 text-black'}`}>{feedback === 'CORRECT' ? <Check className="mx-auto"/> : 'VALIDER'}</button>
                </div>
            </div>
        );
    }

    // 3. GEOMETRY GAME
    return (
        <GeometrySection 
            mode={geoMode} 
            setMode={setGeoMode} 
            onBack={() => setSection('MENU')}
            focus={anatomyFocus}
            setFocus={setAnatomyFocus}
            shape={galleryShape}
            setShape={setGalleryShape}
        />
    );
};

// --- GEOMETRY SUB-COMPONENTS ---

const GeometrySection: React.FC<{
    mode: GeoMode, setMode: (m: GeoMode) => void, onBack: () => void,
    focus: any, setFocus: any, shape: string, setShape: any
}> = ({ mode, setMode, onBack, focus, setFocus, shape, setShape }) => {

    // --- GEO MENU ---
    if (mode === 'MENU') {
        return (
            <div className="flex flex-col h-full p-4 animate-fade-in bg-brawl-dark">
                <div className="flex items-center mb-8"><button onClick={onBack} className="p-2 bg-white/10 rounded-lg"><ArrowLeft size={24} /></button><h2 className="ml-4 font-title text-2xl text-brawl-purple">GÉOMÉTRIE</h2></div>
                <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => setMode('ANATOMY')} className="group relative h-48 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl border-4 border-white/10 overflow-hidden active:scale-95 transition-all shadow-lg">
                        <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box size={120} /></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <h3 className="text-3xl font-title text-white text-stroke-2">LE LABO DU CUBE</h3>
                            <p className="bg-black/30 px-3 py-1 rounded-full text-xs font-bold mt-2 border border-white/20">Faces • Arêtes • Sommets</p>
                        </div>
                    </button>
                    <button onClick={() => setMode('GALLERY')} className="group relative h-48 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl border-4 border-white/10 overflow-hidden active:scale-95 transition-all shadow-lg">
                        <div className="absolute inset-0 flex items-center justify-center opacity-20"><Shapes size={120} /></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <h3 className="text-3xl font-title text-white text-stroke-2">GALERIE 3D</h3>
                            <p className="bg-black/30 px-3 py-1 rounded-full text-xs font-bold mt-2 border border-white/20">Découvrir les volumes</p>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // --- ANATOMY MODE ---
    if (mode === 'ANATOMY') {
        return (
            <div className="flex flex-col h-full relative overflow-hidden bg-[#1a1220]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 z-20">
                    <button onClick={() => setMode('MENU')} className="p-2 bg-white/10 rounded-lg"><ArrowLeft size={24} /></button>
                    <h2 className="font-title text-2xl text-orange-500">LABO DU CUBE</h2>
                    <div className="w-10"></div>
                </div>

                {/* 3D Viewport */}
                <div className="flex-grow flex items-center justify-center perspective-container">
                    <div className="scene">
                        <div className={`shape-3d cube ${focus}`}>
                            {/* Faces */}
                            <div className="face front">1</div>
                            <div className="face back">2</div>
                            <div className="face right">3</div>
                            <div className="face left">4</div>
                            <div className="face top">5</div>
                            <div className="face bottom">6</div>
                            
                            {/* Vertices (Shown conditionally via CSS) */}
                            {[...Array(8)].map((_, i) => <div key={i} className={`vertex v${i}`}></div>)}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 bg-brawl-panel border-t border-white/10 z-20">
                    <p className="text-center text-gray-400 text-sm mb-4">Clique pour illuminer une partie !</p>
                    <div className="flex gap-2">
                        <button onClick={() => setFocus('FACES')} className={`flex-1 py-3 rounded-xl font-title text-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all ${focus === 'FACES' ? 'bg-brawl-blue border-blue-800 text-white' : 'bg-gray-700 border-gray-900 text-gray-300'}`}>
                            6 FACES
                        </button>
                        <button onClick={() => setFocus('EDGES')} className={`flex-1 py-3 rounded-xl font-title text-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all ${focus === 'EDGES' ? 'bg-brawl-yellow border-yellow-600 text-black' : 'bg-gray-700 border-gray-900 text-gray-300'}`}>
                            12 ARÊTES
                        </button>
                        <button onClick={() => setFocus('VERTICES')} className={`flex-1 py-3 rounded-xl font-title text-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all ${focus === 'VERTICES' ? 'bg-brawl-red border-red-800 text-white' : 'bg-gray-700 border-gray-900 text-gray-300'}`}>
                            8 SOMMETS
                        </button>
                    </div>
                    <div className="mt-4 text-center h-12 flex items-center justify-center bg-black/40 rounded-lg border border-white/5">
                        {focus === 'NONE' && <span className="text-gray-500">Observe le cube tourner...</span>}
                        {focus === 'FACES' && <span className="text-brawl-blue font-bold animate-pop">Les côtés plats du cube (carrés)</span>}
                        {focus === 'EDGES' && <span className="text-brawl-yellow font-bold animate-pop">Les lignes où 2 faces se touchent</span>}
                        {focus === 'VERTICES' && <span className="text-brawl-red font-bold animate-pop">Les pointes (coins) du cube</span>}
                    </div>
                </div>
                
                <Style3D />
            </div>
        );
    }

    // --- GALLERY MODE ---
    const shapes = [
        { id: 'CUBE', name: 'CUBE', desc: '6 Faces Carrées', icon: Box },
        { id: 'PAVE', name: 'PAVÉ', desc: 'Prisme Rectangulaire', icon: Box },
        { id: 'PYRAMID', name: 'PYRAMIDE', desc: '5 Faces (4 Triangles)', icon: Triangle },
        { id: 'CYLINDER', name: 'CYLINDRE', desc: '2 Cercles, 1 Face Courbe', icon: Circle },
        { id: 'CONE', name: 'CÔNE', desc: '1 Cercle, 1 Sommet', icon: Triangle },
        { id: 'SPHERE', name: 'SPHÈRE', desc: '1 Seule Face Courbe', icon: Circle },
    ];

    const CylinderFaces = () => {
        const faces = [];
        const count = 12;
        for(let i=0; i<count; i++) {
            const rot = i * (360/count);
            // Radius 38 to ensure overlap/seal with 80px caps
            faces.push(
                <div key={i} className="cyl-face" style={{transform: `rotateY(${rot}deg) translateZ(38px)`}}></div>
            );
        }
        return <>{faces}</>;
    };

    const ConeFaces = () => {
        const faces = [];
        const count = 12;
        // Apothem for R=40, N=12 is approx 38.6px. We use 39px to push to edge.
        // We lean them in (rotateX) to meet at apex.
        for(let i=0; i<count; i++) {
            const rot = i * (360/count);
            faces.push(
                <div key={i} className="cone-face" style={{transform: `rotateY(${rot}deg) translateZ(39px) rotateX(20deg)`}}></div>
            );
        }
        return <>{faces}</>;
    };

    return (
        <div className="flex flex-col h-full relative overflow-hidden bg-[#0f172a]">
             <div className="flex items-center justify-between p-4 z-20 bg-black/20 backdrop-blur-sm">
                <button onClick={() => setMode('MENU')} className="p-2 bg-white/10 rounded-lg"><ArrowLeft size={24} /></button>
                <h2 className="font-title text-2xl text-emerald-400">GALERIE 3D</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex-grow flex items-center justify-center perspective-container">
                <div className="scene">
                    {shape === 'CUBE' && (
                        <div className="shape-3d cube gallery-item">
                             <div className="face front"></div><div className="face back"></div><div className="face right"></div><div className="face left"></div><div className="face top"></div><div className="face bottom"></div>
                        </div>
                    )}
                    {shape === 'PAVE' && (
                        <div className="shape-3d pave gallery-item">
                             <div className="face front"></div><div className="face back"></div><div className="face right"></div><div className="face left"></div><div className="face top"></div><div className="face bottom"></div>
                        </div>
                    )}
                    {shape === 'PYRAMID' && (
                        <div className="shape-3d pyramid gallery-item">
                            <div className="base"></div>
                            <div className="pyr-face one"></div>
                            <div className="pyr-face two"></div>
                            <div className="pyr-face three"></div>
                            <div className="pyr-face four"></div>
                        </div>
                    )}
                    {shape === 'CYLINDER' && (
                        <div className="shape-3d cylinder gallery-item">
                            <div className="top-cap"></div>
                            <div className="bottom-cap"></div>
                            <CylinderFaces />
                        </div>
                    )}
                    {shape === 'CONE' && (
                        <div className="shape-3d cone gallery-item">
                            <div className="base"></div>
                            <ConeFaces />
                        </div>
                    )}
                    {shape === 'SPHERE' && (
                        <div className="shape-3d sphere gallery-item">
                            <div className="core"></div>
                            <div className="ring r1"></div>
                            <div className="ring r2"></div>
                            <div className="ring r3"></div>
                            <div className="ring r4"></div>
                            <div className="ring r5"></div>
                            <div className="ring r6"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Selector */}
            <div className="p-4 z-20">
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {shapes.map(s => (
                        <button 
                            key={s.id} 
                            onClick={() => setShape(s.id)}
                            className={`flex-shrink-0 w-28 p-3 rounded-xl border-2 transition-all flex flex-col items-center ${shape === s.id ? 'bg-emerald-600 border-white scale-105 shadow-lg' : 'bg-white/5 border-transparent opacity-60'}`}
                        >
                            <s.icon size={32} className="mb-2" />
                            <span className="font-title text-sm">{s.name}</span>
                        </button>
                    ))}
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-white/10 text-center animate-fade-in">
                    <h3 className="text-xl font-title text-emerald-400 mb-1">{shapes.find(s=>s.id===shape)?.name}</h3>
                    <p className="text-gray-300 text-sm">{shapes.find(s=>s.id===shape)?.desc}</p>
                </div>
            </div>
            <Style3D />
        </div>
    );
};

// --- CSS IN JS FOR 3D ENGINE ---
const Style3D = () => (
    <style>{`
        .perspective-container {
            perspective: 1000px;
            overflow: hidden;
        }
        .scene {
            width: 100px;
            height: 100px;
            position: relative;
            transform-style: preserve-3d;
            animation: spin 10s infinite linear;
        }
        @keyframes spin {
            0% { transform: rotateX(-15deg) rotateY(0deg); }
            100% { transform: rotateX(-15deg) rotateY(360deg); }
        }

        /* Generic 3D Container */
        .shape-3d {
            width: 100px;
            height: 100px;
            position: absolute;
            top: 0; left: 0;
            transform-style: preserve-3d;
        }
        .gallery-item {
             top: 20px; 
             left: 0;
        }

        /* --- CUBE --- */
        .cube .face {
            position: absolute;
            width: 100px;
            height: 100px;
            background: rgba(0, 145, 255, 0.1);
            border: 2px solid rgba(0, 145, 255, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Lilita One';
            font-size: 30px;
            color: rgba(255,255,255,0.2);
            box-sizing: border-box;
        }
        .cube .front  { transform: translateZ(50px); }
        .cube .back   { transform: rotateY(180deg) translateZ(50px); }
        .cube .right  { transform: rotateY(90deg) translateZ(50px); }
        .cube .left   { transform: rotateY(-90deg) translateZ(50px); }
        .cube .top    { transform: rotateX(90deg) translateZ(50px); }
        .cube .bottom { transform: rotateX(-90deg) translateZ(50px); }

        /* --- PAVE (CUBOID) --- */
        .pave .face {
            position: absolute;
            background: rgba(16, 185, 129, 0.2);
            border: 2px solid #10b981;
            box-sizing: border-box;
        }
        /* Dimensions: Front/Back 100x150, Left/Right 60x150, Top/Bottom 100x60 */
        .pave .front, .pave .back { width: 100px; height: 150px; top: -25px; } /* Centered Y: (100-150)/2 = -25 */
        .pave .front { transform: translateZ(30px); }
        .pave .back { transform: rotateY(180deg) translateZ(30px); }
        
        .pave .right, .pave .left { width: 60px; height: 150px; left: 20px; top: -25px; } /* Center X: (100-60)/2=20, Y:-25 */
        .pave .right { transform: rotateY(90deg) translateZ(50px); }
        .pave .left { transform: rotateY(-90deg) translateZ(50px); }
        
        .pave .top, .pave .bottom { width: 100px; height: 60px; top: 20px; } /* Center Y: (100-60)/2=20 */
        .pave .top { transform: rotateX(90deg) translateZ(75px); }
        .pave .bottom { transform: rotateX(-90deg) translateZ(75px); }


        /* --- PYRAMID --- */
        /* Square Base 100x100 */
        .pyramid .base {
            position: absolute; width: 100px; height: 100px;
            background: rgba(255,165,0,0.2);
            border: 2px solid orange;
            transform: rotateX(90deg) translateZ(50px); /* Floor */
        }
        .pyramid .pyr-face {
            position: absolute;
            width: 100px;
            height: 100px; /* Approx height */
            background: linear-gradient(to top, rgba(255,165,0,0.4), transparent);
            border-bottom: 2px solid orange;
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            transform-origin: bottom center;
            top: -50px; /* Align bottom to center, then adjust via Z */
        }
        /* Rotate faces to meet at top. Base radius 50. */
        .pyramid .one   { transform: translateZ(50px) rotateX(30deg); }
        .pyramid .two   { transform: rotateY(90deg) translateZ(50px) rotateX(30deg); }
        .pyramid .three { transform: rotateY(180deg) translateZ(50px) rotateX(30deg); }
        .pyramid .four  { transform: rotateY(-90deg) translateZ(50px) rotateX(30deg); }


        /* --- CYLINDER --- */
        .cylinder .top-cap, .cylinder .bottom-cap {
            position: absolute; width: 80px; height: 80px; border-radius: 50%;
            background: rgba(0,255,255,0.4); border: 2px solid cyan;
            left: 10px; /* Center in 100px: (100-80)/2 = 10 */
        }
        .cylinder .top-cap { transform: rotateX(90deg) translateZ(60px); }
        .cylinder .bottom-cap { transform: rotateX(90deg) translateZ(-60px); }
        
        .cylinder .cyl-face {
            position: absolute;
            width: 23px; /* Slightly overlapping 21.4px to seal */
            height: 120px;
            background: rgba(0,255,255,0.15);
            border-left: 1px solid rgba(0,255,255,0.2);
            border-right: 1px solid rgba(0,255,255,0.2);
            left: 38.5px; /* (100-23)/2 */
            top: -10px; /* (100-120)/2 */
        }

        /* --- CONE --- */
        .cone .base {
            position: absolute; width: 80px; height: 80px; border-radius: 50%;
            background: rgba(255,0,255,0.3); border: 2px solid magenta;
            left: 10px;
            /* Rotate -90 to face bottom, translated Z+50 to be at bottom of cube */
            transform: rotateX(-90deg) translateZ(50px);
        }
        .cone .cone-face {
            position: absolute;
            width: 25px; 
            height: 100px;
            background: linear-gradient(to top, rgba(255,0,255,0.1), transparent);
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            transform-origin: bottom center;
            left: 37.5px;
            top: -50px; /* Start at top to center */
        }

        /* --- SPHERE (Hologram Energy Orb) --- */
        .sphere .core {
            position: absolute;
            width: 40px; height: 40px;
            background: radial-gradient(circle at 30% 30%, #fff, #00ffaa, #004433);
            border-radius: 50%;
            box-shadow: 0 0 30px #00ffaa, 0 0 10px #fff;
            top: 30px; left: 30px; /* Center in 100x100: (100-40)/2 = 30 */
            animation: pulse 2s infinite ease-in-out;
        }
        @keyframes pulse {
            0% { transform: scale(0.9); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.8; }
        }
        
        .sphere .ring {
            position: absolute; width: 100px; height: 100px;
            border-radius: 50%;
            border: 1px solid rgba(0,255,170, 0.6);
            box-shadow: 0 0 8px rgba(0,255,170, 0.4);
            background: transparent;
        }
        /* Multiple rings for dense wireframe effect */
        .sphere .r1 { transform: rotateY(0deg); }
        .sphere .r2 { transform: rotateY(60deg); }
        .sphere .r3 { transform: rotateY(120deg); }
        .sphere .r4 { transform: rotateX(90deg); }
        .sphere .r5 { transform: rotateX(45deg); }
        .sphere .r6 { transform: rotateX(-45deg); }


        /* --- ANATOMY OVERRIDES --- */
        .cube.FACES .face { background: rgba(0, 145, 255, 0.6); border-color: white; }
        .cube.EDGES .face { background: rgba(0,0,0,0.8); border: 4px solid #ffc400; box-shadow: 0 0 10px #ffc400; }
        .cube.VERTICES .face { background: rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.1); }
        
        .vertex {
            position: absolute; width: 16px; height: 16px;
            background: #ff4040; border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 10px red;
            display: none;
        }
        .cube.VERTICES .vertex { display: block; }
        .v0 { top: 0; left: 0; transform: translate3d(-2px, -2px, 50px); }
        .v1 { top: 0; right: 0; transform: translate3d(2px, -2px, 50px); }
        .v2 { bottom: 0; left: 0; transform: translate3d(-2px, 2px, 50px); }
        .v3 { bottom: 0; right: 0; transform: translate3d(2px, 2px, 50px); }
        .v4 { top: 0; left: 0; transform: translate3d(-2px, -2px, -50px); }
        .v5 { top: 0; right: 0; transform: translate3d(2px, -2px, -50px); }
        .v6 { bottom: 0; left: 0; transform: translate3d(-2px, 2px, -50px); }
        .v7 { bottom: 0; right: 0; transform: translate3d(2px, 2px, -50px); }

    `}</style>
);

// --- HELPER ---
const GameCard: React.FC<{title: string, subtitle: string, icon: string, color: string, reward: string, onClick: () => void}> = ({ title, subtitle, icon, color, reward, onClick }) => (
    <button onClick={onClick} className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-b-4 border-black/20 shadow-lg active:scale-95 transition-transform overflow-hidden group ${color}`}>
        <div className="text-5xl mb-2 drop-shadow-md group-hover:scale-110 transition-transform">{icon}</div>
        <div className="font-title text-xl text-white text-stroke-1 leading-none mb-1">{title}</div>
        <div className="text-xs font-bold text-black/60 uppercase">{subtitle}</div>
        <div className="absolute top-2 right-2 bg-black/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{reward}</div>
    </button>
);

const WheelColumn: React.FC<{value: number, onChange: (n: number) => void, label: string}> = ({ value, onChange, label }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemHeight = 48; 
    const handleScroll = () => {
        if (scrollRef.current) {
            const index = Math.round(scrollRef.current.scrollTop / itemHeight);
            if(index >= 0 && index <= 9 && index !== value) onChange(index);
        }
    };
    return (
        <div className="flex flex-col items-center">
            <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-widest">{label}</div>
            <div ref={scrollRef} onScroll={handleScroll} className="w-20 h-36 overflow-y-scroll no-scrollbar snap-y snap-mandatory bg-black/40 rounded-lg relative">
                <div style={{ height: itemHeight * 1.5 - (itemHeight/2) }} className="w-full"></div>
                {[0,1,2,3,4,5,6,7,8,9].map(num => <div key={num} className={`h-12 flex items-center justify-center snap-center font-title text-3xl transition-all ${num === value ? 'text-white scale-125' : 'text-gray-600 scale-90'}`}>{num}</div>)}
                <div style={{ height: itemHeight * 1.5 - (itemHeight/2) }} className="w-full"></div>
            </div>
        </div>
    );
};

export default MathGame;
