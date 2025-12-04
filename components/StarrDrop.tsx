
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface StarrDropProps {
    type: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'; // Base type
    rewardText: string;
    subText?: string;
    icon?: string;
    onClose: () => void;
}

const RARITY_CONFIG = {
    COMMON: { color: '#54b734', label: 'COMMUN' },
    RARE: { color: '#0091ff', label: 'RARE' },
    EPIC: { color: '#b038fa', label: 'ÉPIQUE' },
    LEGENDARY: { color: '#ffc400', label: 'LÉGENDAIRE' }
};

const StarrDrop: React.FC<StarrDropProps> = ({ type, rewardText, subText, icon, onClose }) => {
    const [clicks, setClicks] = useState(0);
    const [currentRarity, setCurrentRarity] = useState<'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('RARE'); // Start at Rare usually visually
    const [isRevealed, setIsRevealed] = useState(false);
    const [animState, setAnimState] = useState('');

    // Pre-calculate the final sequence to ensure we end up at the requested type or better visuals
    // For this UI, we will simulate the "Upgrade" effect.
    // If the reward is Legendary, we start Rare -> Epic -> Legendary.

    const handleClick = () => {
        if (isRevealed) {
            onClose();
            return;
        }

        if (navigator.vibrate) navigator.vibrate(50);
        
        // ANIMATION SEQUENCE
        setAnimState('clicked');
        setTimeout(() => setAnimState(''), 150);

        if (clicks < 2) {
            // First few clicks: Just shake/animate
            setClicks(c => c + 1);
            
            // Simulation of upgrade
            if (clicks === 0 && (type === 'EPIC' || type === 'LEGENDARY')) {
                 setTimeout(() => setCurrentRarity('EPIC'), 200);
            }
            if (clicks === 1 && type === 'LEGENDARY') {
                 setTimeout(() => setCurrentRarity('LEGENDARY'), 200);
            }

        } else {
            // Final Click: EXPLODE
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            setIsRevealed(true);
        }
    };

    const config = RARITY_CONFIG[isRevealed ? type : currentRarity];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={handleClick}>
            
            {/* BACKGROUND RAYS */}
            {isRevealed && (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                    <div className="w-[200vw] h-[200vw] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.1)_20deg,transparent_40deg,rgba(255,255,255,0.1)_60deg,transparent_80deg,rgba(255,255,255,0.1)_100deg,transparent_120deg,rgba(255,255,255,0.1)_140deg,transparent_160deg,rgba(255,255,255,0.1)_180deg,transparent_200deg,rgba(255,255,255,0.1)_220deg,transparent_240deg,rgba(255,255,255,0.1)_260deg,transparent_280deg,rgba(255,255,255,0.1)_300deg,transparent_320deg,rgba(255,255,255,0.1)_340deg)] animate-[spin_10s_linear_infinite]" style={{ color: config.color }}></div>
                </div>
            )}

            {/* CONTENT */}
            <div className={`relative flex flex-col items-center justify-center transition-all duration-300 ${animState === 'clicked' ? 'scale-90' : 'scale-100'}`}>
                
                {!isRevealed ? (
                    // THE STAR
                    <div className="relative cursor-pointer">
                        <div 
                            className="w-64 h-64 flex items-center justify-center transition-colors duration-300"
                        >
                             <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]" style={{ filter: `drop-shadow(0 0 20px ${config.color})` }}>
                                <path 
                                    fill={config.color} 
                                    d="M256 0L330 160L512 180L380 300L420 480L256 390L92 480L132 300L0 180L182 160L256 0Z"
                                    className="origin-center transition-all"
                                />
                                {/* Face */}
                                <g transform="translate(180, 200) scale(0.6)">
                                    <path d="M50 0 L100 100 L0 100 Z" fill="black" transform="rotate(180 50 50)" />
                                    <path d="M200 0 L250 100 L150 100 Z" fill="black" transform="rotate(180 200 50)" />
                                </g>
                             </svg>
                        </div>
                        <div className="absolute top-full w-full text-center mt-8">
                            <p className="font-title text-3xl text-white animate-pulse">TAP ! ({3 - clicks})</p>
                        </div>
                    </div>
                ) : (
                    // THE REWARD
                    <div className="flex flex-col items-center animate-pop">
                         <div className="text-8xl mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] animate-bounce">
                             {icon || '🎁'}
                         </div>
                         <h2 className="font-title text-4xl text-white text-center text-stroke-2 mb-2" style={{ textShadow: `0 0 20px ${config.color}` }}>
                             {rewardText}
                         </h2>
                         {subText && (
                             <div className="bg-white/10 px-4 py-2 rounded-xl text-xl font-bold text-white/90 border border-white/20">
                                 {subText}
                             </div>
                         )}
                         <div className="mt-12 text-gray-400 animate-pulse text-sm">
                             Toucher pour fermer
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StarrDrop;
