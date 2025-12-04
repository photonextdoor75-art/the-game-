
import React from 'react';
import { Calculator, BookOpen } from 'lucide-react';

interface GameHubProps {
    onSelectGame: (game: 'MATH' | 'READ') => void;
}

const GameHub: React.FC<GameHubProps> = ({ onSelectGame }) => {
    return (
        <div className="flex flex-col h-full animate-fade-in p-4">
            <div className="text-center mb-8 mt-4">
                <h2 className="font-title text-4xl text-brawl-yellow text-stroke-1 mb-2 drop-shadow-md">SALLE D'ARCADE</h2>
                <p className="text-gray-400 text-sm font-body bg-black/40 inline-block px-3 py-1 rounded-full border border-white/10">
                    Choisis ton mini-jeu pour gagner des points !
                </p>
            </div>

            <div className="flex flex-col gap-6 flex-grow justify-center pb-20">
                
                {/* MATHS CARD */}
                <button 
                    onClick={() => onSelectGame('MATH')}
                    className="group relative h-40 w-full bg-gradient-to-r from-brawl-blue to-blue-600 rounded-2xl border-4 border-brawl-dark shadow-xl overflow-hidden active:scale-95 transition-transform"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="flex items-center justify-between px-6 h-full relative z-10">
                        <div className="text-left">
                            <div className="text-3xl font-title text-white text-stroke-1 drop-shadow-md mb-1">DÉFI MATHS</div>
                            <div className="text-blue-200 text-xs font-bold uppercase tracking-widest bg-black/20 px-2 py-1 rounded inline-block">Calcul Mental</div>
                        </div>
                        <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center border-4 border-white/10 group-hover:scale-110 transition-transform">
                            <Calculator size={48} className="text-white drop-shadow-md" />
                        </div>
                    </div>
                </button>

                {/* READING CARD */}
                <button 
                    onClick={() => onSelectGame('READ')}
                    className="group relative h-40 w-full bg-gradient-to-r from-brawl-purple to-purple-800 rounded-2xl border-4 border-brawl-dark shadow-xl overflow-hidden active:scale-95 transition-transform"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="flex items-center justify-between px-6 h-full relative z-10">
                        <div className="text-left">
                            <div className="text-3xl font-title text-white text-stroke-1 drop-shadow-md mb-1">DOJO LECTURE</div>
                            <div className="text-purple-200 text-xs font-bold uppercase tracking-widest bg-black/20 px-2 py-1 rounded inline-block">Syllabes & Mots</div>
                        </div>
                        <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center border-4 border-white/10 group-hover:scale-110 transition-transform">
                            <BookOpen size={48} className="text-white drop-shadow-md" />
                        </div>
                    </div>
                </button>

            </div>
        </div>
    );
};

export default GameHub;
