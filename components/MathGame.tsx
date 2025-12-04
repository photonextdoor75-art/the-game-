
import React, { useState, useRef, useEffect } from 'react';
import { Gamepad2, Calculator, ArrowLeft, Check, X, RefreshCw } from 'lucide-react';

interface MathGameProps {
    onWin: (tokens: number, xp: number) => void;
    onClose?: () => void;
}

type MathMode = 'ADD' | 'SUB' | 'MUL' | 'DIV';

const MathGame: React.FC<MathGameProps> = ({ onWin, onClose }) => {
    const [mode, setMode] = useState<MathMode | null>(null);
    const [problem, setProblem] = useState<{a: number, b: number, op: string, res: number} | null>(null);
    const [feedback, setFeedback] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
    
    // User Input (The Wheel Values)
    const [tens, setTens] = useState(0);
    const [units, setUnits] = useState(0);

    // --- GAME LOGIC ---
    const generateProblem = (selectedMode: MathMode) => {
        let a = 0, b = 0, res = 0, op = '+';
        
        switch(selectedMode) {
            case 'ADD': // CP/CE1: Sum < 50
                a = Math.floor(Math.random() * 30) + 1;
                b = Math.floor(Math.random() * 20) + 1;
                res = a + b;
                op = '+';
                break;
            case 'SUB': // CE1: Positive result
                a = Math.floor(Math.random() * 30) + 10;
                b = Math.floor(Math.random() * a);
                res = a - b;
                op = '-';
                break;
            case 'MUL': // CE1/CE2: Tables 2 to 9
                a = Math.floor(Math.random() * 8) + 2;
                b = Math.floor(Math.random() * 9) + 1;
                res = a * b;
                op = '×';
                break;
            case 'DIV': // CM1: Simple division
                b = Math.floor(Math.random() * 8) + 2;
                res = Math.floor(Math.random() * 9) + 1;
                a = b * res; // Ensure integer result
                op = '÷';
                break;
        }

        setProblem({ a, b, op, res });
        setTens(0);
        setUnits(0);
        setFeedback('IDLE');
    };

    const startGame = (m: MathMode) => {
        setMode(m);
        generateProblem(m);
    };

    const checkAnswer = () => {
        if (!problem) return;
        const userAnswer = (tens * 10) + units;
        
        if (userAnswer === problem.res) {
            setFeedback('CORRECT');
            // Rewards based on difficulty
            let rewardTokens = 5;
            let rewardXp = 25;
            
            if (mode === 'SUB') { rewardTokens = 10; rewardXp = 35; }
            if (mode === 'MUL') { rewardTokens = 20; rewardXp = 50; }
            if (mode === 'DIV') { rewardTokens = 30; rewardXp = 75; }

            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            
            setTimeout(() => {
                onWin(rewardTokens, rewardXp);
                generateProblem(mode!); // Next problem
            }, 1000);
        } else {
            setFeedback('WRONG');
            if (navigator.vibrate) navigator.vibrate(200);
            setTimeout(() => setFeedback('IDLE'), 800);
        }
    };

    // --- RENDER MENU ---
    if (!mode) {
        return (
            <div className="flex flex-col h-full p-4 animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="font-title text-3xl text-brawl-yellow text-stroke-1 mb-2">SALLE D'ARCADE</h2>
                    <p className="text-gray-400 text-sm font-body">Choisis ton défi mathématique !</p>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-grow content-center">
                    <GameCard 
                        title="ADDITION" 
                        subtitle="Niveau Facile"
                        icon="➕" 
                        color="bg-brawl-green" 
                        onClick={() => startGame('ADD')} 
                        reward="5 PTS"
                    />
                    <GameCard 
                        title="SOUSTRACTION" 
                        subtitle="Niveau Moyen"
                        icon="➖" 
                        color="bg-brawl-blue" 
                        onClick={() => startGame('SUB')} 
                        reward="10 PTS"
                    />
                    <GameCard 
                        title="MULTIPLICATION" 
                        subtitle="Niveau Difficile"
                        icon="✖️" 
                        color="bg-brawl-purple" 
                        onClick={() => startGame('MUL')} 
                        reward="20 PTS"
                    />
                    <GameCard 
                        title="DIVISION" 
                        subtitle="Niveau Expert"
                        icon="➗" 
                        color="bg-brawl-red" 
                        onClick={() => startGame('DIV')} 
                        reward="30 PTS"
                    />
                </div>
            </div>
        );
    }

    // --- RENDER GAME ---
    return (
        <div className="flex flex-col h-full relative animate-fade-in bg-black/20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#1e1629] border-b border-white/10">
                <button onClick={() => setMode(null)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                    <ArrowLeft size={24} />
                </button>
                <div className="font-title text-xl text-gray-200">DÉFI MATHS</div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Problem Display */}
            <div className="flex-grow flex flex-col items-center justify-center p-6 gap-8">
                
                {/* The Equation */}
                <div className="flex items-center gap-4 text-5xl font-title text-white drop-shadow-xl bg-black/40 px-8 py-6 rounded-2xl border-2 border-white/10">
                    <span className="text-brawl-blue">{problem?.a}</span>
                    <span className="text-gray-400">{problem?.op}</span>
                    <span className="text-brawl-purple">{problem?.b}</span>
                    <span className="text-gray-400">=</span>
                    <span className="text-brawl-yellow">?</span>
                </div>

                {/* THE WHEEL PICKER (Roulotte) */}
                <div className="flex gap-2 p-4 bg-[#1e1629] rounded-2xl border-4 border-[#3d2e4f] shadow-2xl relative">
                    {/* Visual Indicator for selection line */}
                    <div className="absolute top-1/2 left-0 w-full h-12 -mt-6 bg-white/5 border-y border-brawl-yellow/50 pointer-events-none z-10"></div>

                    <WheelColumn value={tens} onChange={setTens} label="DIZAINES" />
                    <WheelColumn value={units} onChange={setUnits} label="UNITÉS" />
                </div>

                {/* Feedback Message */}
                <div className="h-8 flex items-center justify-center">
                    {feedback === 'CORRECT' && <span className="text-brawl-green font-title text-2xl animate-pop">BRAVO ! +XP</span>}
                    {feedback === 'WRONG' && <span className="text-red-500 font-title text-2xl animate-shake">ESSAIE ENCORE !</span>}
                </div>

                {/* Submit Button */}
                <button 
                    onClick={checkAnswer}
                    className={`
                        w-full max-w-xs py-4 rounded-xl font-title text-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all
                        ${feedback === 'CORRECT' ? 'bg-brawl-green border-green-800 text-black' : 'bg-brawl-yellow border-yellow-800 text-black'}
                    `}
                >
                    {feedback === 'CORRECT' ? <Check className="mx-auto" size={32}/> : 'VALIDER'}
                </button>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const GameCard: React.FC<{title: string, subtitle: string, icon: string, color: string, reward: string, onClick: () => void}> = ({ title, subtitle, icon, color, reward, onClick }) => (
    <button 
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-b-4 border-black/20 shadow-lg active:scale-95 transition-transform overflow-hidden group ${color}`}
    >
        <div className="text-5xl mb-2 drop-shadow-md group-hover:scale-110 transition-transform">{icon}</div>
        <div className="font-title text-xl text-white text-stroke-1 leading-none mb-1">{title}</div>
        <div className="text-xs font-bold text-black/60 uppercase">{subtitle}</div>
        
        <div className="absolute top-2 right-2 bg-black/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {reward}
        </div>
    </button>
);

const WheelColumn: React.FC<{value: number, onChange: (n: number) => void, label: string}> = ({ value, onChange, label }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemHeight = 48; // Must match CSS height of number item

    // Handle scroll to update value
    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollTop = scrollRef.current.scrollTop;
            const index = Math.round(scrollTop / itemHeight);
            // Clamp between 0 and 9
            if(index >= 0 && index <= 9 && index !== value) {
                onChange(index);
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-widest">{label}</div>
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="w-20 h-36 overflow-y-scroll no-scrollbar snap-y snap-mandatory bg-black/40 rounded-lg relative"
            >
                {/* Padding to center first/last item */}
                <div style={{ height: itemHeight * 1.5 - (itemHeight/2) }} className="w-full"></div>
                
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <div 
                        key={num} 
                        className={`
                            h-12 flex items-center justify-center snap-center font-title text-3xl transition-all
                            ${num === value ? 'text-white scale-125' : 'text-gray-600 scale-90'}
                        `}
                    >
                        {num}
                    </div>
                ))}

                <div style={{ height: itemHeight * 1.5 - (itemHeight/2) }} className="w-full"></div>
            </div>
        </div>
    );
};

export default MathGame;
