
import React, { useState, useEffect, useRef } from 'react';
import { AppState, StatKey, QuestFrequency, CAT_COLORS, CAT_ICONS, ShopItem, SeasonType } from './types';
import { INITIAL_STATE, AVATARS, KIDS_QUESTS, TEEN_QUESTS, WEEKLY_QUESTS, MONTHLY_QUESTS, DAILY_GIFT_POOL, SHOP_ITEMS, getCurrentSeason } from './constants';
import RadarChart from './components/RadarChart';
import StarBackground from './components/StarBackground';

// Firebase
import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// Icons
import { Swords, BarChart3, Gift, Plus, X, Lock, Minus, Plus as PlusIcon, Check, Calendar, Clock, Skull, Trophy } from 'lucide-react';

type ViewName = 'quests' | 'stats' | 'rewards';
type QuestTab = 'DAILY' | 'SEASON';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [currentView, setCurrentView] = useState<ViewName>('quests');
  const [questTab, setQuestTab] = useState<QuestTab>('DAILY');
  const [currentSeason, setCurrentSeason] = useState<SeasonType>('RENTREE');
  
  // --- ONBOARDING STATE ---
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [tempProfile, setTempProfile] = useState<{age: number, gender: 'M'|'F'|'O', avatar: string, customSport: string}>({
      age: 10, gender: 'M', avatar: '😎', customSport: ''
  });

  // UI States
  const [inputOpen, setInputOpen] = useState(false);
  
  // Add Quest Form State
  const [newTaskTxt, setNewTaskTxt] = useState('');
  const [newTaskCat, setNewTaskCat] = useState<StatKey>('PRJ');
  const [newTaskXp, setNewTaskXp] = useState<number>(25);
  const [newTaskTokens, setNewTaskTokens] = useState<number>(10);
  const [newTaskMinLevel, setNewTaskMinLevel] = useState<number>(1);
  const [newTaskFreq, setNewTaskFreq] = useState<QuestFrequency>('DAILY');
  const [newTaskMaxProgress, setNewTaskMaxProgress] = useState<number>(1);
  
  // Rewards States
  const [isShaking, setIsShaking] = useState(false);
  const [rewardModal, setRewardModal] = useState<{txt: string, sub?: string, icon?: string, color: string} | null>(null);

  // Sync States
  const [user, setUser] = useState<User | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const isRemoteUpdate = useRef(false);
  
  // Connection Test
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Init Season
  useEffect(() => {
      setCurrentSeason(getCurrentSeason());
  }, []);

  // --- FIREBASE SYNC ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userDocRef = doc(db, 'users', u.uid);
        const unsubSnap = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            isRemoteUpdate.current = true;
            const data = snap.data() as AppState;
            setState(prev => ({ ...INITIAL_STATE, ...data }));
            setDbReady(true);
          } else {
            setDoc(userDocRef, INITIAL_STATE).then(() => setDbReady(true));
          }
        });
        return () => unsubSnap();
      } else {
        signInAnonymously(auth).catch(console.error);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !dbReady) return;
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    
    const timeout = setTimeout(() => {
        setDoc(doc(db, 'users', user.uid), state).catch(console.error);
    }, 500);
    return () => clearTimeout(timeout);
  }, [state, user, dbReady]);

  // --- ONBOARDING LOGIC ---
  const finishOnboarding = () => {
      let initialQuests = tempProfile.age < 14 ? [...KIDS_QUESTS] : [...TEEN_QUESTS];
      
      // Add Sport Quest
      if(tempProfile.customSport && tempProfile.age < 14) {
          initialQuests.push({
              txt: `Séance ${tempProfile.customSport}`,
              cat: "PHY", xp: 50, tokens: 10, minLevel: 1, frequency: 'DAILY', maxProgress: 1
          });
      }

      // Add Season Quests
      initialQuests = [...initialQuests, ...WEEKLY_QUESTS, ...MONTHLY_QUESTS];

      const finalQuests = initialQuests.map((q, idx) => ({ 
          ...q, 
          id: Date.now() + idx, 
          done: false,
          progress: 0,
          maxProgress: q.maxProgress || 1 
      }));

      setState(prev => ({
          ...prev,
          onboardingComplete: true,
          age: tempProfile.age,
          gender: tempProfile.gender,
          avatar: tempProfile.avatar,
          customSport: tempProfile.customSport,
          quests: finalQuests
      }));
  };

  // --- GAMEPLAY ACTIONS ---

  const advanceQuest = (id: number) => {
    const q = state.quests.find(x => x.id === id);
    if(!q || q.done) return;

    if(state.level < (q.minLevel || 0)) {
        alert(`Niveau ${q.minLevel} requis !`);
        return;
    }

    setState(prev => {
        const questIdx = prev.quests.findIndex(x => x.id === id);
        const quest = prev.quests[questIdx];
        const newProgress = quest.progress + 1;
        const isFinished = newProgress >= quest.maxProgress;

        // Clone quests
        const newQuests = [...prev.quests];
        newQuests[questIdx] = { ...quest, progress: newProgress, done: isFinished };

        let newState = { ...prev, quests: newQuests };

        if (isFinished) {
            // Rewards
            newState.xp += quest.xp;
            newState.tokens += quest.tokens;
            newState.tasksDoneTotal += 1;
            
            // Stats Boost
            if(newState.stats[quest.cat]) {
                newState.stats[quest.cat].val = Math.min(100, newState.stats[quest.cat].val + 5);
            }

            // School / Growth Stats Smart Logic
            const txt = quest.txt.toLowerCase();
            if(quest.cat === 'ECO') {
                if(txt.match(/math|calcul|chiffre/)) newState.schoolStats.MAT.val = Math.min(100, newState.schoolStats.MAT.val + 5);
                else if (txt.match(/lire|lecture|livre/)) newState.schoolStats.LEC.val = Math.min(100, newState.schoolStats.LEC.val + 5);
                else if (txt.match(/ecri|copie|dictee/)) newState.schoolStats.ECR.val = Math.min(100, newState.schoolStats.ECR.val + 5);
                else newState.schoolStats.COM.val = Math.min(100, newState.schoolStats.COM.val + 2);
            }
            if(quest.cat === 'SOC' || (quest.cat === 'FAM' && txt.match(/aide|gentil/))) {
                 newState.schoolStats.COM.val = Math.min(100, newState.schoolStats.COM.val + 5);
            }
            if(quest.cat === 'PHY' && txt.match(/sport|ballon|courir/)) {
                newState.schoolStats.SPO.val = Math.min(100, newState.schoolStats.SPO.val + 5);
            }

            // Level Up
            if(newState.xp >= newState.level * 100 * 1.5) {
                newState.level += 1;
            }
        }

        return newState;
    });
  };

  const openInputModal = () => {
      setNewTaskTxt('');
      setNewTaskXp(25);
      setNewTaskTokens(10);
      setNewTaskFreq(questTab === 'SEASON' ? 'WEEKLY' : 'DAILY');
      setNewTaskMaxProgress(1);
      setInputOpen(true);
  };

  const addTask = () => {
    if(!newTaskTxt.trim()) return;
    const newQuest = {
        id: Date.now(),
        txt: newTaskTxt,
        cat: newTaskCat, 
        xp: newTaskXp,
        tokens: newTaskTokens,
        minLevel: newTaskMinLevel,
        frequency: newTaskFreq,
        progress: 0,
        maxProgress: newTaskMaxProgress,
        done: false
    };
    setState(prev => ({ ...prev, quests: [...prev.quests, newQuest] }));
    setInputOpen(false);
  };

  const deleteQuest = (id: number) => {
     setState(prev => ({...prev, quests: prev.quests.filter(q => q.id !== id)}));
  };

  // --- SHOP ACTIONS ---

  const claimDailyGift = () => {
      const today = new Date().toISOString().split('T')[0];
      if(state.lastDailyClaim === today) return;

      setIsShaking(true);
      setTimeout(() => {
          setIsShaking(false);
          // Pick Reward
          const roll = Math.random();
          let cumulative = 0;
          let selected = DAILY_GIFT_POOL[0];
          for(let r of DAILY_GIFT_POOL) {
              cumulative += (r.prob || 0);
              if(roll <= cumulative) { selected = r; break; }
          }
          
          setState(prev => ({
              ...prev,
              lastDailyClaim: today,
              xp: prev.xp + (selected.val || 0)
          }));
          setRewardModal({ txt: selected.txt, sub: "Cadeau Quotidien", color: selected.color, icon: "🎁" });
      }, 800);
  };

  const buyItem = (item: ShopItem) => {
      if(state.tokens >= item.cost) {
          if(confirm(`Acheter "${item.txt}" pour ${item.cost} points ?`)) {
              setState(prev => ({
                  ...prev,
                  tokens: prev.tokens - item.cost
              }));
              setRewardModal({ txt: item.txt, sub: "Récompense Débloquée !", color: item.color, icon: item.icon });
          }
      } else {
          alert("Pas assez de points ! Fais des quêtes !");
      }
  };

  // --- RENDER HELPERS ---
  
  // Filter quests
  const dailyQuests = state.quests.filter(q => q.frequency === 'DAILY');
  const seasonQuests = state.quests.filter(q => q.frequency !== 'DAILY');
  const currentQuests = questTab === 'DAILY' ? dailyQuests : seasonQuests;

  const canClaimDaily = state.lastDailyClaim !== new Date().toISOString().split('T')[0];

  // --- ONBOARDING RENDER ---
  if (!state.onboardingComplete) {
      return (
        <div className="flex flex-col h-[100dvh] w-full bg-black relative overflow-hidden font-body text-white items-center justify-center p-6">
            <StarBackground season={currentSeason} />
            <div className="relative z-10 w-full max-w-md bg-[#1e1629] border-2 border-[#3d2e4f] rounded-2xl p-6">
                <h1 className="text-3xl font-title text-center text-brawl-yellow text-stroke-1 mb-8">INITIATION</h1>
                
                {onboardingStep === 1 && (
                    <div className="flex flex-col gap-6 items-center">
                        <label className="text-gray-400 font-bold uppercase">Âge</label>
                        <div className="flex items-center gap-6">
                            <button onClick={() => setTempProfile(p => ({...p, age: Math.max(5, p.age - 1)}))} className="w-16 h-16 bg-brawl-red rounded-xl text-3xl font-title border-b-4 border-red-800">-</button>
                            <div className="text-6xl font-title w-24 text-center">{tempProfile.age}</div>
                            <button onClick={() => setTempProfile(p => ({...p, age: Math.min(99, p.age + 1)}))} className="w-16 h-16 bg-brawl-green rounded-xl text-3xl font-title border-b-4 border-green-800">+</button>
                        </div>
                        <button onClick={() => setOnboardingStep(2)} className="mt-8 w-full bg-brawl-blue py-4 rounded-xl font-title text-xl border-b-4 border-blue-700">SUIVANT</button>
                    </div>
                )}
                
                {onboardingStep === 2 && (
                    <div className="flex flex-col gap-6 items-center">
                        <label className="text-gray-400 font-bold uppercase">Avatar</label>
                        <div className="grid grid-cols-4 gap-2 w-full max-h-[300px] overflow-y-auto">
                            {AVATARS.map(ava => (
                                <button key={ava} onClick={() => setTempProfile(p => ({...p, avatar: ava}))} className={`text-3xl p-2 rounded-xl border-2 ${tempProfile.avatar === ava ? 'bg-brawl-yellow border-white' : 'bg-[#2a223a] border-transparent'}`}>{ava}</button>
                            ))}
                        </div>
                        <button onClick={finishOnboarding} className="mt-8 w-full bg-brawl-green py-4 rounded-xl font-title text-xl border-b-4 border-green-800">C'EST PARTI !</button>
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- MAIN APP RENDER ---
  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto bg-black relative overflow-hidden font-body select-none">
      <StarBackground season={currentSeason} />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between p-3 bg-brawl-panel/90 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-brawl-blue to-blue-700 rounded-lg border-2 border-white flex items-center justify-center text-2xl shadow-lg">
                {state.avatar}
            </div>
            <div className="flex flex-col leading-tight">
                <span className="font-title text-lg text-brawl-yellow text-stroke-1">LVL {state.level}</span>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                   <div className="bg-black/40 px-2 py-0.5 rounded border border-white/10">🏆 {Math.floor(state.xp)}</div>
                   <div className="bg-black/40 px-2 py-0.5 rounded border border-white/10 text-brawl-green">⚡ {state.streak}j</div>
                </div>
            </div>
        </div>
        
        {/* WALLET */}
        <div className="bg-black/60 px-3 py-1 rounded-full border border-brawl-purple/50 flex items-center gap-2 shadow-lg">
            <span className="text-brawl-purple text-lg drop-shadow-md">🟣</span>
            <span className="font-title text-xl text-white">{state.tokens}</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow overflow-y-auto p-3 relative z-10 scrollbar-hide pb-24">
        
        {/* VIEW: QUESTS */}
        {currentView === 'quests' && (
            <div className="animate-fade-in">
                {/* TABS */}
                <div className="flex p-1 bg-[#1e1629] rounded-xl mb-4 border border-white/10">
                    <button 
                        onClick={() => setQuestTab('DAILY')}
                        className={`flex-1 py-2 font-title text-sm rounded-lg transition-all ${questTab === 'DAILY' ? 'bg-brawl-yellow text-black shadow-lg' : 'text-gray-500'}`}
                    >
                        JOURNALIÈRES
                    </button>
                    <button 
                        onClick={() => setQuestTab('SEASON')}
                        className={`flex-1 py-2 font-title text-sm rounded-lg transition-all ${questTab === 'SEASON' ? 'bg-brawl-purple text-white shadow-lg' : 'text-gray-500'}`}
                    >
                        DE SAISON
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {currentQuests.length === 0 ? (
                        <div className="text-center text-white/30 font-tech py-10">Aucune quête active.</div>
                    ) : (
                        currentQuests.map(q => {
                            const isLocked = state.level < (q.minLevel || 0);
                            const isDaily = q.frequency === 'DAILY';
                            
                            // Visual Theme based on type
                            const cardBg = isDaily ? 'bg-gradient-to-r from-[#2a223a] to-[#332a45]' : 'bg-gradient-to-r from-blue-900/80 to-purple-900/80';
                            const borderColor = isDaily ? 'border-[#3d2e4f]' : 'border-brawl-blue';
                            
                            return (
                                <div 
                                    key={q.id}
                                    onClick={() => advanceQuest(q.id)}
                                    className={`
                                        relative rounded-xl p-1 overflow-hidden group active:scale-98 transition-transform
                                        ${isLocked ? 'grayscale opacity-60 pointer-events-none' : ''}
                                    `}
                                >
                                    {/* Card Container */}
                                    <div className={`relative z-10 ${cardBg} border-2 ${borderColor} rounded-lg p-3 flex flex-col gap-2 shadow-lg`}>
                                        
                                        {/* Header: Icon + Title */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-10 h-10 rounded-md flex items-center justify-center text-xl border-2
                                                    ${isDaily ? 'bg-black/30 border-white/10' : 'bg-black/30 border-brawl-blue/30'}
                                                `}>
                                                    {isLocked ? <Lock size={16} /> : CAT_ICONS[q.cat]}
                                                </div>
                                                <div>
                                                    <div className="font-title text-white text-stroke-1 leading-tight">{q.txt}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex gap-2">
                                                        <span style={{color: CAT_COLORS[q.cat]}}>{state.stats[q.cat].name}</span>
                                                        {q.frequency !== 'DAILY' && <span className="text-brawl-blue">{q.frequency}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Rewards */}
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1 bg-black/40 px-1.5 rounded text-[10px] font-bold text-brawl-yellow border border-yellow-500/30">
                                                    <span>+{q.xp} XP</span>
                                                </div>
                                                <div className="flex items-center gap-1 bg-black/40 px-1.5 rounded text-[10px] font-bold text-brawl-purple border border-purple-500/30 mt-1">
                                                    <span>+{q.tokens} pts</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar (Brawl Style) */}
                                        <div className="relative h-6 bg-black/50 rounded-md border border-white/10 overflow-hidden mt-1">
                                            <div 
                                                className={`absolute top-0 left-0 h-full transition-all duration-300 ${q.done ? 'bg-brawl-green' : 'bg-brawl-yellow'}`}
                                                style={{ width: `${(q.progress / q.maxProgress) * 100}%` }}
                                            >
                                                {/* Striped pattern overlay */}
                                                <div className="w-full h-full opacity-20 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')]"></div>
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-black text-white drop-shadow-md font-tech tracking-widest">
                                                <span>PROGRESSION</span>
                                                <span>{q.progress} / {q.maxProgress}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Delete Btn */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteQuest(q.id); }}
                                        className="absolute top-0 right-0 p-2 text-red-500 opacity-0 group-hover:opacity-100 z-20"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        )}

        {/* VIEW: SHOP */}
        {currentView === 'rewards' && (
            <div className="animate-fade-in pb-20">
                <div className="text-center font-title text-2xl text-white mb-6 text-stroke-1">BOUTIQUE</div>

                {/* 1. DAILY GIFT */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Clock size={16} className="text-brawl-green"/>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cadeau Quotidien</span>
                    </div>
                    
                    <div 
                        onClick={canClaimDaily ? claimDailyGift : undefined}
                        className={`
                            relative bg-[#2a223a] border-2 border-[#3d2e4f] rounded-xl p-4 flex items-center justify-between
                            ${canClaimDaily ? 'cursor-pointer hover:border-brawl-green active:scale-98' : 'opacity-50 grayscale'}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 bg-[url('https://em-content.zobj.net/source/microsoft-teams/337/package_1f4e6.png')] bg-contain bg-no-repeat bg-center ${isShaking ? 'animate-shake' : ''}`}></div>
                            <div>
                                <div className="font-title text-xl text-white">BOÎTE GRATUITE</div>
                                <div className="text-xs text-gray-400">{canClaimDaily ? 'Touchez pour ouvrir !' : 'Revenez demain'}</div>
                            </div>
                        </div>
                        {canClaimDaily && <div className="bg-brawl-green text-black font-bold px-3 py-1 rounded text-xs animate-pulse">NOUVEAU</div>}
                    </div>
                </div>

                {/* 2. TOKEN EXCHANGE */}
                <div>
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Trophy size={16} className="text-brawl-purple"/>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Échange de Points</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {SHOP_ITEMS.map(item => {
                            const canAfford = state.tokens >= item.cost;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => buyItem(item)}
                                    className={`
                                        flex flex-col items-center p-3 rounded-xl border-2 transition-all relative overflow-hidden
                                        ${canAfford 
                                            ? 'bg-[#2a223a] border-[#3d2e4f] active:scale-95' 
                                            : 'bg-[#1a1422] border-transparent opacity-60 cursor-not-allowed'}
                                    `}
                                >
                                    {/* Icon */}
                                    <div className="text-4xl mb-2 drop-shadow-lg">{item.icon}</div>
                                    
                                    {/* Name */}
                                    <div className="font-title text-sm text-center leading-none mb-3 h-8 flex items-center justify-center">{item.txt}</div>
                                    
                                    {/* Price Tag */}
                                    <div className={`
                                        w-full py-1 rounded text-xs font-bold flex items-center justify-center gap-1
                                        ${canAfford ? 'bg-brawl-purple text-white' : 'bg-gray-700 text-gray-400'}
                                    `}>
                                        <span>{item.cost}</span>
                                        <span className="text-[10px]">PTS</span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: STATS */}
        {currentView === 'stats' && (
            <div className="animate-fade-in flex flex-col items-center">
                <RadarChart stats={state.stats} />
                {state.age < 14 && <div className="mt-8"><RadarChart stats={state.schoolStats} color="#00e5ff" /></div>}
                
                <div className="grid grid-cols-2 gap-4 w-full mt-8">
                    <div className="bg-[#2a223a] p-4 rounded-xl text-center border-b-4 border-brawl-blue">
                        <div className="text-2xl font-title">{state.tasksDoneTotal}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase">Total Tâches</div>
                    </div>
                    <div className="bg-[#2a223a] p-4 rounded-xl text-center border-b-4 border-brawl-green">
                        <div className="text-2xl font-title">{state.level}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase">Niveau Actuel</div>
                    </div>
                </div>
            </div>
        )}

      </main>

      {/* NEW QUEST MODAL */}
      {inputOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#1e1629] border-2 border-[#3d2e4f] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                  <div className="bg-[#2a223a] p-4 border-b border-[#3d2e4f] flex justify-between items-center">
                      <h3 className="font-title text-white">CRÉER {questTab === 'SEASON' ? 'UNE SAISON' : 'UNE QUÊTE'}</h3>
                      <button onClick={() => setInputOpen(false)}><X size={24} className="text-gray-400"/></button>
                  </div>
                  <div className="p-4 flex flex-col gap-4">
                      <input 
                        className="bg-[#120c18] border-2 border-[#3d2e4f] rounded-xl p-3 text-white font-title outline-none focus:border-brawl-blue"
                        placeholder="Titre..."
                        value={newTaskTxt}
                        onChange={e => setNewTaskTxt(e.target.value)}
                      />
                      
                      {/* Category Grid */}
                      <div className="grid grid-cols-4 gap-2">
                          {(Object.keys(CAT_COLORS) as StatKey[]).map(cat => (
                              <button key={cat} onClick={() => setNewTaskCat(cat)} className={`p-2 rounded-lg border text-xl ${newTaskCat===cat ? 'bg-white/10 border-white' : 'border-transparent'}`}>{CAT_ICONS[cat]}</button>
                          ))}
                      </div>

                      {/* Reward Sliders */}
                      <div className="bg-[#120c18] p-3 rounded-xl border border-white/5">
                          <label className="text-xs font-bold text-gray-500 mb-1 block">RÉCOMPENSES</label>
                          <div className="flex gap-2 mb-2">
                             <span className="text-brawl-yellow font-bold text-sm w-12">XP</span>
                             <input type="range" min="10" max="500" step="10" value={newTaskXp} onChange={e=>setNewTaskXp(Number(e.target.value))} className="flex-1 accent-brawl-yellow"/>
                             <span className="text-white font-mono text-sm">{newTaskXp}</span>
                          </div>
                          <div className="flex gap-2">
                             <span className="text-brawl-purple font-bold text-sm w-12">PTS</span>
                             <input type="range" min="5" max="100" step="5" value={newTaskTokens} onChange={e=>setNewTaskTokens(Number(e.target.value))} className="flex-1 accent-brawl-purple"/>
                             <span className="text-white font-mono text-sm">{newTaskTokens}</span>
                          </div>
                      </div>

                      {/* Config: Frequency & Max Progress */}
                      <div className="flex gap-3">
                          <div className="flex-1">
                              <label className="text-xs font-bold text-gray-500 mb-1 block">RÉPÉTITION</label>
                              <select 
                                value={newTaskFreq} 
                                onChange={(e) => setNewTaskFreq(e.target.value as any)}
                                className="w-full bg-[#120c18] text-white p-2 rounded-lg border border-[#3d2e4f] text-sm font-bold"
                              >
                                  <option value="DAILY">Quotidien</option>
                                  <option value="WEEKLY">Hebdo</option>
                                  <option value="MONTHLY">Mensuel</option>
                              </select>
                          </div>
                          <div className="flex-1">
                              <label className="text-xs font-bold text-gray-500 mb-1 block">CIBLE (FOIS)</label>
                              <div className="flex items-center bg-[#120c18] rounded-lg border border-[#3d2e4f] overflow-hidden">
                                  <button onClick={()=>setNewTaskMaxProgress(Math.max(1, newTaskMaxProgress-1))} className="px-3 py-2 bg-white/5">-</button>
                                  <div className="flex-1 text-center font-mono text-white">{newTaskMaxProgress}</div>
                                  <button onClick={()=>setNewTaskMaxProgress(Math.min(20, newTaskMaxProgress+1))} className="px-3 py-2 bg-white/5">+</button>
                              </div>
                          </div>
                      </div>

                      <button onClick={addTask} className="bg-brawl-yellow text-black font-title text-lg py-3 rounded-xl border-b-4 border-yellow-700 mt-2">VALIDER</button>
                  </div>
              </div>
          </div>
      )}

      {/* REWARD POPUP */}
      {rewardModal && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur animate-fade-in" onClick={() => setRewardModal(null)}>
              <div className="text-6xl mb-4 animate-pop">{rewardModal.icon}</div>
              <div className="text-2xl font-title text-white text-stroke-1 text-center mb-1">{rewardModal.txt}</div>
              <div className="text-sm font-bold uppercase tracking-widest mb-8" style={{color: rewardModal.color}}>{rewardModal.sub}</div>
              <div className="text-gray-500 text-xs animate-pulse">Toucher pour fermer</div>
          </div>
      )}

      {/* FAB */}
      {currentView === 'quests' && (
          <button 
            onClick={openInputModal}
            className="absolute bottom-24 right-4 w-14 h-14 bg-brawl-yellow rounded-xl border-b-4 border-yellow-700 flex items-center justify-center text-black shadow-xl hover:scale-105 active:border-b-0 active:translate-y-1 z-40"
          >
              <Plus size={32} strokeWidth={3} />
          </button>
      )}

      {/* BOTTOM NAV */}
      <nav className="relative z-20 bg-[#1e1629] border-t-2 border-white/10 h-[80px] flex pb-2 shadow-2xl">
          <NavBtn active={currentView === 'quests'} onClick={() => setCurrentView('quests')} icon={<Swords size={26} />} label="QUÊTES" />
          <NavBtn active={currentView === 'rewards'} onClick={() => setCurrentView('rewards')} icon={<Gift size={26} />} label="BOUTIQUE" />
          <NavBtn active={currentView === 'stats'} onClick={() => setCurrentView('stats')} icon={<BarChart3 size={26} />} label="STATS" />
      </nav>

    </div>
  );
};

const NavBtn: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({active, onClick, icon, label}) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center relative transition-colors ${active ? 'text-brawl-yellow' : 'text-gray-500'}`}
    >
        {active && <div className="absolute top-0 w-12 h-1 bg-brawl-yellow shadow-[0_0_10px_#ffc400] rounded-b-full" />}
        <div className={`mb-1 ${active ? 'scale-110 drop-shadow-[0_0_5px_rgba(255,196,0,0.5)]' : ''}`}>{icon}</div>
        <div className="font-title text-[10px] tracking-widest">{label}</div>
    </button>
);

export default App;