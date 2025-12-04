
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Check, Sparkles } from 'lucide-react';
import { READING_WORDS, DISTRACTORS } from '../constants';

interface ReadingGameProps {
    onWin: (tokens: number, xp: number) => void;
    onClose: () => void;
}

const ReadingGame: React.FC<ReadingGameProps> = ({ onWin, onClose }) => {
    const [word, setWord] = useState<typeof READING_WORDS[0] | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [userSelection, setUserSelection] = useState<string[]>([]);
    const [status, setStatus] = useState<'PLAYING' | 'SUCCESS' | 'ERROR'>('PLAYING');

    useEffect(() => {
        startNewRound();
    }, []);

    const startNewRound = () => {
        const randomWord = READING_WORDS[Math.floor(Math.random() * READING_WORDS.length)];
        setWord(randomWord);
        setUserSelection([]);
        setStatus('PLAYING');

        // Mix correct syllables with distractors
        const needed = [...randomWord.syllables];
        const dists = [...DISTRACTORS].sort(() => 0.5 - Math.random()).slice(0, 8 - needed.length);
        const pool = [...needed, ...dists].sort(() => 0.5 - Math.random());
        setOptions(pool);
    };

    const speak = (text: string) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'fr-FR';
        u.rate = 0.8;
        window.speechSynthesis.speak(u);
    };

    const handleSyllableClick = (syl: string) => {
        if(!word || status === 'SUCCESS') return;
        
        speak(syl);

        const nextIdx = userSelection.length;
        if(word.syllables[nextIdx] === syl) {
            const newSel = [...userSelection, syl];
            setUserSelection(newSel);
            
            if(newSel.length === word.syllables.length) {
                setStatus('SUCCESS');
                speak("Bravo ! " + word.text);
                if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
                setTimeout(() => {
                    onWin(15, 30); // 15 tokens, 30 xp
                    startNewRound();
                }, 2000);
            }
        } else {
            setStatus('ERROR');
            if(navigator.vibrate) navigator.vibrate(200);
            setTimeout(() => setStatus('PLAYING'), 500);
        }
    };

    if(!word) return null;

    return (
        <div className="flex flex-col h-full bg-black/40 animate-fade-in relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#1e1629] border-b border-white/10">
                <button onClick={onClose} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 active:scale-95">
                    <ArrowLeft size={24} />
                </button>
                <div className="font-title text-xl text-brawl-purple">DOJO LECTURE</div>
                <div className="w-10"></div>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-4 gap-6">
                
                {/* IMAGE CARD */}
                <button 
                    onClick={() => speak(word.text)}
                    className="w-48 h-48 bg-white rounded-3xl flex items-center justify-center text-8xl shadow-[0_0_30px_rgba(176,56,250,0.4)] border-4 border-brawl-purple relative active:scale-95 transition-transform"
                >
                    {word.image}
                    <div className="absolute bottom-2 right-2 bg-brawl-purple text-white rounded-full p-2">
                        <Volume2 size={20} />
                    </div>
                </button>

                {/* SLOTS */}
                <div className="flex gap-2 min-h-[60px]">
                    {word.syllables.map((s, i) => (
                        <div 
                            key={i} 
                            className={`
                                w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-title border-2 transition-all
                                ${userSelection[i] 
                                    ? 'bg-brawl-green border-green-400 text-black shadow-[0_4px_0_#2e7d32] translate-y-0' 
                                    : 'bg-black/40 border-dashed border-gray-600 text-gray-600'}
                            `}
                        >
                            {userSelection[i] || '?'}
                        </div>
                    ))}
                </div>

                {/* KEYBOARD */}
                <div className={`grid grid-cols-4 gap-3 w-full max-w-sm mt-4 ${status === 'ERROR' ? 'animate-shake' : ''}`}>
                    {options.map((syl, i) => (
                        <button
                            key={i}
                            onClick={() => handleSyllableClick(syl)}
                            className="h-14 bg-[#2a223a] border-b-4 border-[#1a1422] rounded-xl font-title text-xl text-white hover:bg-[#332a45] active:border-b-0 active:translate-y-1 transition-all shadow-lg"
                        >
                            {syl}
                        </button>
                    ))}
                </div>

                {/* FEEDBACK */}
                <div className="h-8 flex items-center justify-center">
                    {status === 'SUCCESS' && (
                        <div className="flex items-center gap-2 text-brawl-green font-title text-2xl animate-pop">
                            <Sparkles /> SUPER !
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ReadingGame;
