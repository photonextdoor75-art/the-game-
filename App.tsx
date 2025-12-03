
import React, { useState, useEffect, useRef } from 'react';
import { AppState, StatKey, CAT_COLORS, CAT_ICONS } from './types';
import { INITIAL_STATE, AVATARS, KIDS_QUESTS, TEEN_QUESTS, KIDS_REWARDS, TEEN_REWARDS } from './constants';
import RadarChart from './components/RadarChart';
import StarBackground from './components/StarBackground';

// Firebase
import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// Icons
import { Swords, BarChart3, Gift, Plus, X, Loader2, CheckCircle2, AlertCircle, Wifi, WifiOff, Lock, Minus, Plus as PlusIcon, ArrowRight, User as UserIcon } from 'lucide-react';

type ViewName = 'quests' | 'stats' | 'rewards';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [currentView, setCurrentView] = useState<ViewName>('quests');
  
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
  const [newTaskMinLevel, setNewTaskMinLevel] = useState<number>(1);
  
  // Filter State
  const [filter, setFilter] = useState<StatKey | 'ALL'>('ALL');
  
  // Box Opening States
  const [isShaking, setIsShaking] = useState(false);
  const [reward, setReward] = useState<{txt: string, rar: string, color: string} | null>(null);

  // Sync States
  const [user, setUser] = useState<User | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const isRemoteUpdate = useRef(false);
  
  // Connection Test State
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // --- FIREBASE SYNC ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setErrorMessage(""); 
        const userDocRef = doc(db, 'users', u.uid);
        const unsubSnap = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            isRemoteUpdate.current = true;
            const data = snap.data() as AppState;
            // Merge logic to keep local session fluid but update from server
            setState(prev => ({ ...INITIAL_STATE, ...data }));
            setDbReady(true);
          } else {
            // New user, stick to INITIAL_STATE (onboardingComplete: false)
            setDoc(userDocRef, INITIAL_STATE).then(() => setDbReady(true));
          }
        }, (error) => {
            console.error("Snapshot error:", error);
            if(error.code.includes('permission-denied')) {
                setErrorMessage("Erreur DB: Permission refusée.");
                setConnectionStatus('error');
            }
        });
        return () => unsubSnap();
      } else {
        signInAnonymously(auth).catch((error) => {
            console.error("Auth Error:", error);
            setErrorMessage(`Erreur Auth: ${error.code}`);
            setConnectionStatus('error');
        });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !dbReady) return;
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    
    // Auto-save debounced
    const timeout = setTimeout(() => {
        setDoc(doc(db, 'users', user.uid), state).catch(console.error);
    }, 500);
    return () => clearTimeout(timeout);
  }, [state, user, dbReady]);

  // --- ONBOARDING LOGIC ---
  const finishOnboarding = () => {
      // 1. Determine Quests based on Age
      let initialQuests = [];
      if (tempProfile.age < 14) {
          initialQuests = [...KIDS_QUESTS];
          // Add custom sport if provided
          if(tempProfile.customSport) {
              initialQuests.push({
                  txt: `Séance ${tempProfile.customSport}`,
                  cat: "PHY" as StatKey,
                  xp: 50,
                  minLevel: 1
              });
          }
      } else {
          initialQuests = [...TEEN_QUESTS];
      }

      // Add IDs
      const finalQuests = initialQuests.map((q, idx) => ({ ...q, id: Date.now() + idx, done: false }));

      // 2. Update State
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

  const toggleQuest = (id: number) => {
    const q = state.quests.find(x => x.id === id);
    if(!q) return;

    // Check Level Lock
    const isLocked = state.level < (q.minLevel || 0);
    if(isLocked) {
        alert(`Niveau ${q.minLevel} requis pour cette quête !`);
        return;
    }

    setState(prev => {
        const isCompleting = !q.done;
        const statKey = q.cat;
        
        let newState = { ...prev };
        newState.quests = prev.quests.map(qk => qk.id === id ? { ...qk, done: isCompleting } : qk);

        if (isCompleting) {
            newState.xp += q.xp;
            newState.tasksDoneTotal += 1;
            newState.tasksSinceLastBox += 1;
            newState.stats[statKey].val = Math.min(100, newState.stats[statKey].val + 5);

            // SPECIAL SCHOOL LOGIC
            if(statKey === 'ECO') {
                const txt = q.txt.toLowerCase();
                if(txt.includes('math') || txt.includes('calcul') || txt.includes('chiffre')) {
                    newState.schoolStats.MAT.val = Math.min(100, newState.schoolStats.MAT.val + 5);
                } else if (txt.includes('lire') || txt.includes('lecture') || txt.includes('livre')) {
                    newState.schoolStats.LEC.val = Math.min(100, newState.schoolStats.LEC.val + 5);
                } else if (txt.includes('ecri') || txt.includes('copie') || txt.includes('dictee')) {
                    newState.schoolStats.ECR.val = Math.min(100, newState.schoolStats.ECR.val + 5);
                } else if (txt.includes('sport') || txt.includes('gym')) {
                    newState.schoolStats.SPO.val = Math.min(100, newState.schoolStats.SPO.val + 5);
                } else {
                    // Default to Behavior if generic school task
                    newState.schoolStats.COM.val = Math.min(100, newState.schoolStats.COM.val + 2);
                }
            }
            // If main sport category, also boost school sport
            if(statKey === 'PHY') {
                newState.schoolStats.SPO.val = Math.min(100, newState.schoolStats.SPO.val + 3);
            }

            // Box Logic
            if(newState.tasksSinceLastBox >= 5) {
                newState.boxes += 1;
                newState.tasksSinceLastBox = 0;
            }
        } else {
            newState.xp = Math.max(0, newState.xp - q.xp);
            newState.tasksDoneTotal = Math.max(0, newState.tasksDoneTotal - 1);
            newState.tasksSinceLastBox = Math.max(0, newState.tasksSinceLastBox - 1);
            newState.stats[statKey].val = Math.max(0, newState.stats[statKey].val - 5);
        }

        // Level Up logic
        const xpForNext = newState.level * 100 * 1.5;
        if(newState.xp >= xpForNext) {
            newState.level += 1;
        }

        return newState;
    });
  };

  const openInputModal = () => {
      if (filter !== 'ALL') setNewTaskCat(filter);
      setNewTaskTxt('');
      setNewTaskXp(25);
      setNewTaskMinLevel(state.level); // Default to current level
      setInputOpen(true);
  };

  const addTask = () => {
    if(!newTaskTxt.trim()) return;
    const newQuest = {
        id: Date.now(),
        txt: newTaskTxt,
        cat: newTaskCat, 
        xp: newTaskXp,
        minLevel: newTaskMinLevel,
        done: false
    };
    setState(prev => ({ ...prev, quests: [...prev.quests, newQuest] }));
    setInputOpen(false);
  };

  const deleteQuest = (id: number) => {
     setState(prev => ({...prev, quests: prev.quests.filter(q => q.id !== id)}));
  };

  const openBox = () => {
      if(state.boxes <= 0) return;
      setIsShaking(true);
      setTimeout(() => {
          setIsShaking(false);
          
          // Select Reward List based on Age
          const rewardsList = state.age < 14 ? KIDS_REWARDS : TEEN_REWARDS;
          
          // Weighted Random
          const roll = Math.random();
          let cumulativeProb = 0;
          let selected = rewardsList[0];
          
          for(let r of rewardsList) {
             // If we don't have explicit probs in this structure yet, we map from earlier code
             // But let's assume TEEN_REWARDS has probs. 
             // If probs are missing, we fallback to simple random
             cumulativeProb += (r as any).prob || 0;
             if(roll <= cumulativeProb) {
                 selected = r;
                 break;
             }
          }
          // If loop finishes without selection (floating point errors), pick last
          if(!selected) selected = rewardsList[rewardsList.length - 1];

          setReward(selected);
          setState(prev => ({
              ...prev,
              boxes: prev.boxes - 1,
              xp: prev.xp + selected.val
          }));
      }, 600);
  };

  const closeReward = () => setReward(null);

  const testFirebaseConnection = async () => {
      if (connectionStatus === 'loading') return;
      setConnectionStatus('loading');
      setErrorMessage('');
      
      if (!user) {
          setErrorMessage("❌ Non authentifié.");
          setConnectionStatus('error');
          return;
      }

      try {
          await setDoc(doc(db, "debug_connections", user.uid + "_" + Date.now()), {
              status: "connected",
              timestamp: new Date().toISOString()
          });
          setConnectionStatus('success');
          setTimeout(() => setConnectionStatus('idle'), 3000);
      } catch (e: any) {
          setErrorMessage("❌ Erreur DB (Check Rules)");
          setConnectionStatus('error');
      }
  };

  // --- RENDER HELPERS ---
  const visibleQuests = state.quests.filter(q => filter === 'ALL' || q.cat === filter);

  // --- ONBOARDING RENDER ---
  if (!state.onboardingComplete) {
      return (
        <div className="flex flex-col h-[100dvh] w-full bg-black relative overflow-hidden font-body text-white items-center justify-center p-6">
            <StarBackground />
            
            <div className="relative z-10 w-full max-w-md bg-[#1e1629] border-2 border-[#3d2e4f] rounded-2xl shadow-2xl p-6 animate-pop">
                <h1 className="text-3xl font-title text-center text-brawl-yellow text-stroke-1 mb-8">
                    CRÉATION DU HÉROS
                </h1>

                {/* STEP 1: AGE */}
                {onboardingStep === 1 && (
                    <div className="flex flex-col gap-6 items-center animate-fade-in">
                        <label className="text-gray-400 font-bold uppercase tracking-widest">Quel âge as-tu ?</label>
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setTempProfile(p => ({...p, age: Math.max(5, p.age - 1)}))}
                                className="w-16 h-16 bg-brawl-red rounded-xl text-3xl font-title border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
                            >-</button>
                            <div className="text-6xl font-title w-24 text-center">{tempProfile.age}</div>
                            <button 
                                onClick={() => setTempProfile(p => ({...p, age: Math.min(99, p.age + 1)}))}
                                className="w-16 h-16 bg-brawl-green rounded-xl text-3xl font-title border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
                            >+</button>
                        </div>
                        <button 
                            onClick={() => setOnboardingStep(2)}
                            className="mt-8 w-full bg-brawl-blue py-4 rounded-xl font-title text-xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1"
                        >
                            SUIVANT
                        </button>
                    </div>
                )}

                {/* STEP 2: GENDER */}
                {onboardingStep === 2 && (
                    <div className="flex flex-col gap-6 items-center animate-fade-in">
                        <label className="text-gray-400 font-bold uppercase tracking-widest">Ton Personnage</label>
                        <div className="flex gap-4 w-full">
                            <button 
                                onClick={() => setTempProfile(p => ({...p, gender: 'M'}))}
                                className={`flex-1 py-8 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${tempProfile.gender === 'M' ? 'bg-blue-900/50 border-brawl-blue' : 'bg-[#2a223a] border-transparent opacity-60'}`}
                            >
                                <span className="text-4xl">👦</span>
                                <span className="font-title">GARÇON</span>
                            </button>
                            <button 
                                onClick={() => setTempProfile(p => ({...p, gender: 'F'}))}
                                className={`flex-1 py-8 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${tempProfile.gender === 'F' ? 'bg-pink-900/50 border-pink-500' : 'bg-[#2a223a] border-transparent opacity-60'}`}
                            >
                                <span className="text-4xl">👧</span>
                                <span className="font-title">FILLE</span>
                            </button>
                        </div>
                        <button 
                            onClick={() => setOnboardingStep(tempProfile.age < 14 ? 3 : 4)}
                            className="mt-8 w-full bg-brawl-blue py-4 rounded-xl font-title text-xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1"
                        >
                            SUIVANT
                        </button>
                    </div>
                )}

                {/* STEP 3: CUSTOM ACTIVITY (KIDS ONLY) */}
                {onboardingStep === 3 && (
                    <div className="flex flex-col gap-6 items-center animate-fade-in">
                        <label className="text-gray-400 font-bold uppercase tracking-widest text-center">Ton sport ou activité préféré ?</label>
                        <p className="text-xs text-center text-gray-500 -mt-4">(Judo, Handball, Danse, Dessin...)</p>
                        
                        <input 
                            type="text" 
                            value={tempProfile.customSport}
                            onChange={(e) => setTempProfile(p => ({...p, customSport: e.target.value}))}
                            placeholder="Ex: Judo"
                            className="w-full bg-[#120c18] border-2 border-[#3d2e4f] rounded-xl p-4 text-white font-title text-center text-2xl outline-none focus:border-brawl-yellow"
                        />

                        <button 
                            onClick={() => setOnboardingStep(4)}
                            className="mt-8 w-full bg-brawl-blue py-4 rounded-xl font-title text-xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1"
                        >
                            SUIVANT
                        </button>
                    </div>
                )}

                {/* STEP 4: AVATAR */}
                {onboardingStep === 4 && (
                    <div className="flex flex-col gap-6 items-center animate-fade-in">
                        <label className="text-gray-400 font-bold uppercase tracking-widest">Choisis ton Avatar</label>
                        <div className="grid grid-cols-4 gap-2 w-full max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
                            {AVATARS.map(ava => (
                                <button
                                    key={ava}
                                    onClick={() => setTempProfile(p => ({...p, avatar: ava}))}
                                    className={`
                                        aspect-square text-3xl flex items-center justify-center rounded-xl transition-all
                                        ${tempProfile.avatar === ava 
                                            ? 'bg-brawl-yellow border-2 border-white scale-105 shadow-lg' 
                                            : 'bg-[#2a223a] border border-transparent hover:bg-[#332a45]'}
                                    `}
                                >
                                    {ava}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={finishOnboarding}
                            className="mt-4 w-full bg-brawl-green text-black py-4 rounded-xl font-title text-xl border-b-8 border-green-800 active:border-b-0 active:translate-y-2 animate-pulse"
                        >
                            C'EST PARTI !
                        </button>
                    </div>
                )}

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {[1,2,3,4].map(step => {
                        if (step === 3 && tempProfile.age >= 14) return null; // Skip step 3 dot for teens
                        return (
                            <div key={step} className={`w-2 h-2 rounded-full ${onboardingStep === step ? 'bg-white' : 'bg-gray-700'}`} />
                        )
                    })}
                </div>
            </div>
        </div>
      )
  }

  // --- MAIN APP RENDER ---
  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto bg-black relative overflow-hidden font-body">
      
      {/* BACKGROUND */}
      <StarBackground />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between p-4 bg-brawl-panel/80 backdrop-blur-sm border-b-2 border-white/10">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#333] border-2 border-white rounded-full overflow-hidden relative shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                <div className="w-full h-full bg-gradient-to-br from-brawl-blue to-blue-700 flex items-center justify-center text-2xl">
                    {state.avatar}
                </div>
            </div>
            <div className="flex flex-col">
                <span className="font-title text-xl text-brawl-yellow tracking-wide text-stroke-1">LVL {state.level}</span>
                <div className="bg-black/50 px-2 py-0.5 rounded-full text-xs font-tech font-bold text-white border border-white/20 flex items-center gap-1">
                    <span className="text-brawl-yellow">🏆</span> {Math.floor(state.xp)} XP
                </div>
            </div>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">BOXES</span>
            <div className="font-title text-xl text-white flex items-center gap-1">
                {state.boxes} <span className="text-2xl drop-shadow-md">📦</span>
            </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow overflow-y-auto p-4 relative z-10 scrollbar-hide">
        
        {/* VIEW: QUESTS */}
        {currentView === 'quests' && (
            <div className="animate-fade-in pb-20">
                <h2 className="font-title text-white text-2xl mb-4 tracking-wide text-stroke-1 text-center">MISSIONS</h2>
                
                {/* FILTERS */}
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2 px-1">
                    <FilterBtn label="TOUT" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
                    {(Object.keys(CAT_COLORS) as StatKey[]).map(cat => (
                         <FilterBtn key={cat} label={state.stats[cat].name} color={CAT_COLORS[cat]} active={filter === cat} onClick={() => setFilter(cat)} />
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    {visibleQuests.length === 0 ? (
                        <div className="text-center text-white/50 font-tech mt-10 p-10 border-2 border-dashed border-white/10 rounded-xl">
                            Aucune mission disponible.
                        </div>
                    ) : (
                        visibleQuests.map(q => {
                            const isLocked = state.level < (q.minLevel || 0);
                            return (
                                <div 
                                    key={q.id}
                                    onClick={() => toggleQuest(q.id)}
                                    className={`
                                        relative rounded-xl p-3 flex items-center justify-between
                                        border-l-4 transition-all cursor-pointer group select-none
                                        ${isLocked 
                                            ? 'bg-gray-800/80 border-gray-600 grayscale opacity-70' 
                                            : 'bg-[#2a223a] border-[#3d2e4f] shadow-lg active:scale-98'
                                        }
                                    `}
                                    style={{ borderLeftColor: isLocked ? '#666' : CAT_COLORS[q.cat] }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-11 h-11 rounded-lg flex items-center justify-center text-xl border-2
                                            ${isLocked ? 'bg-gray-700 border-gray-500' : 'bg-[#151020] border-white/10'}
                                        `}>
                                            {isLocked ? <Lock size={18} className="text-gray-400"/> : CAT_ICONS[q.cat]}
                                        </div>
                                        <div>
                                            <div className="font-title text-lg leading-none mb-1 text-white text-stroke-1">{q.txt}</div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                                                <span style={{color: isLocked ? '#999' : CAT_COLORS[q.cat]}}>{state.stats[q.cat].name}</span> 
                                                <span className="text-brawl-yellow flex items-center gap-0.5">
                                                    +{q.xp} 🏆
                                                </span>
                                                {q.minLevel && q.minLevel > 1 && (
                                                    <span className={`px-1.5 rounded text-[9px] border ${isLocked ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-white/10 border-white/20 text-white'}`}>
                                                        LVL {q.minLevel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Checkbox / Status */}
                                    <div className={`
                                        w-7 h-7 border-2 rounded flex items-center justify-center ml-2
                                        ${q.done ? 'bg-brawl-green border-brawl-green' : 'border-[#555] bg-black/30'}
                                    `}>
                                        {q.done && <CheckCircle2 size={18} className="text-white" strokeWidth={4} />}
                                    </div>
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteQuest(q.id); }}
                                        className="absolute -top-2 -right-2 bg-brawl-red text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs border border-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        )}

        {/* VIEW: STATS */}
        {currentView === 'stats' && (
            <div className="animate-fade-in flex flex-col items-center pb-20">
                <h2 className="font-title text-center text-2xl mb-4 text-stroke-1 w-full">PERFORMANCE</h2>
                
                {/* Stat Counters */}
                <div className="grid grid-cols-2 gap-3 mb-6 w-full">
                    <div className="bg-[#2a223a] border-l-4 border-brawl-blue rounded-r-xl p-4 text-center shadow-lg">
                        <div className="font-title text-3xl text-white text-stroke-1">{state.tasksDoneTotal}</div>
                        <div className="font-tech text-gray-400 text-xs uppercase tracking-wider font-bold">Tâches Finies</div>
                    </div>
                    <div className="bg-[#2a223a] border-l-4 border-brawl-red rounded-r-xl p-4 text-center shadow-lg">
                        <div className="font-title text-3xl text-brawl-red text-stroke-1 flex items-center justify-center gap-1">
                            🔥 {state.streak}
                        </div>
                        <div className="font-tech text-gray-400 text-xs uppercase tracking-wider font-bold">Série (Jours)</div>
                    </div>
                </div>

                {/* Main Chart */}
                <div className="relative w-full max-w-[320px] aspect-square mb-8">
                    <RadarChart stats={state.stats} />
                </div>

                {/* SCHOOL CHART FOR KIDS */}
                {state.age < 14 && (
                    <div className="w-full flex flex-col items-center animate-fade-in border-t-2 border-white/10 pt-6">
                         <h2 className="font-title text-center text-xl mb-4 text-[#00e5ff] text-stroke-1 w-full">PERFORMANCE SCOLAIRE</h2>
                         <div className="relative w-full max-w-[280px] aspect-square">
                             <RadarChart stats={state.schoolStats} color="#00e5ff" bgOpacity={0.3} />
                         </div>
                    </div>
                )}

                {/* Info Profile */}
                <div className="mt-8 text-center text-gray-500 text-xs font-tech">
                    {state.age} ans • {state.customSport ? `Pratique: ${state.customSport}` : 'Aucun sport spécifié'}
                </div>

                {/* TEST BUTTON */}
                <button onClick={testFirebaseConnection} className="mt-8 text-xs text-white/30 hover:text-white underline font-tech">
                    Check Connection Status
                </button>
                {connectionStatus === 'error' && <div className="text-red-500 text-xs mt-2">{errorMessage}</div>}
            </div>
        )}

        {/* VIEW: REWARDS */}
        {currentView === 'rewards' && (
            <div className="animate-fade-in h-full flex flex-col items-center justify-center pb-20">
                {!reward ? (
                    <>
                        <h2 className="font-title text-3xl mb-8 text-stroke-1 tracking-wider drop-shadow-lg">MEGA BOX</h2>
                        <div 
                            onClick={openBox}
                            className={`
                                w-48 h-48 bg-[url('https://em-content.zobj.net/source/microsoft-teams/337/package_1f4e6.png')] 
                                bg-contain bg-no-repeat bg-center cursor-pointer transition-transform
                                drop-shadow-[0_0_30px_rgba(255,196,0,0.4)]
                                hover:scale-105 active:scale-95
                                ${isShaking ? 'animate-shake' : ''}
                                ${state.boxes === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                            `}
                        />
                        <div className="mt-8 text-center text-gray-400 font-tech font-bold bg-black/40 px-4 py-2 rounded-lg backdrop-blur">
                            {state.boxes > 0 
                                ? <span className="text-brawl-yellow animate-pulse">TAPE POUR OUVRIR !</span> 
                                : `Progression: ${state.tasksSinceLastBox} / 5 tâches`
                            }
                        </div>
                    </>
                ) : (
                    <div className="animate-pop flex flex-col items-center text-center w-full px-8">
                        <div className="text-xl font-bold mb-2 font-tech text-gray-300">TU AS OBTENU</div>
                        <div className="font-title text-5xl text-brawl-yellow text-stroke-2 mb-2 drop-shadow-[0_0_15px_rgba(255,196,0,0.5)]">{reward.txt}</div>
                        <div className="font-tech font-black text-2xl mb-12 tracking-widest" style={{color: reward.color}}>{reward.rar}</div>
                        
                        <button 
                            onClick={closeReward}
                            className="w-full bg-brawl-blue text-white font-title text-xl px-8 py-4 rounded-xl border-b-8 border-blue-700 active:border-b-0 active:translate-y-2 transition-all shadow-xl"
                        >
                            RÉCUPÉRER
                        </button>
                    </div>
                )}
            </div>
        )}
      </main>

      {/* NEW QUEST MODAL */}
      {inputOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#1e1629] border-2 border-[#3d2e4f] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-pop flex flex-col">
                  
                  {/* Modal Header */}
                  <div className="bg-[#2a223a] p-4 border-b-2 border-[#3d2e4f] flex justify-between items-center sticky top-0 z-10">
                      <h3 className="font-title text-xl text-white text-stroke-1 tracking-wide">NOUVELLE MISSION</h3>
                      <button onClick={() => setInputOpen(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                  </div>

                  <div className="p-5 flex flex-col gap-6">
                      
                      {/* 1. TITLE */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Titre de la mission</label>
                          <input 
                            autoFocus
                            type="text" 
                            value={newTaskTxt}
                            onChange={e => setNewTaskTxt(e.target.value)}
                            className="w-full bg-[#120c18] border-2 border-[#3d2e4f] rounded-xl p-4 text-white font-title text-lg outline-none focus:border-brawl-blue placeholder-gray-700 transition-colors"
                            placeholder="Ex: 50 Pompes..."
                          />
                      </div>

                      {/* 2. CATEGORY GRID */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Domaine</label>
                          <div className="grid grid-cols-3 gap-2">
                              {(Object.keys(CAT_COLORS) as StatKey[]).map(cat => (
                                  <button
                                    key={cat}
                                    onClick={() => setNewTaskCat(cat)}
                                    className={`
                                        flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                                        ${newTaskCat === cat 
                                            ? 'bg-[#3b2e52] border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                                            : 'bg-[#2a223a] border-[#3d2e4f] opacity-70 hover:opacity-100'}
                                    `}
                                  >
                                      <div className="text-2xl mb-1">{CAT_ICONS[cat]}</div>
                                      <div className="font-tech font-bold text-xs uppercase" style={{color: newTaskCat === cat ? 'white' : '#888'}}>
                                          {state.stats[cat].name}
                                      </div>
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* 3. XP / DIFFICULTY */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Difficulté & Récompense</label>
                        <div className="flex gap-2">
                            {[10, 25, 50, 100].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setNewTaskXp(val)}
                                    className={`
                                        flex-1 py-3 rounded-xl border-b-4 font-title text-sm transition-all
                                        ${newTaskXp === val 
                                            ? 'bg-[#332a45] border-brawl-yellow text-brawl-yellow translate-y-0' 
                                            : 'bg-[#2a223a] border-[#3d2e4f] text-gray-500 active:translate-y-1 active:border-b-0'}
                                    `}
                                >
                                    +{val}<br/><span className="text-[10px] font-sans opacity-60">XP</span>
                                </button>
                            ))}
                        </div>
                      </div>

                      {/* 4. REQUIRED LEVEL */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Niveau Requis</label>
                          <div className="flex items-center gap-4 bg-[#2a223a] p-2 rounded-xl border-2 border-[#3d2e4f]">
                              <button 
                                onClick={() => setNewTaskMinLevel(Math.max(1, newTaskMinLevel - 1))}
                                className="w-12 h-12 bg-brawl-red rounded-lg border-b-4 border-red-800 flex items-center justify-center text-white active:border-b-0 active:translate-y-1"
                              >
                                  <Minus size={20} strokeWidth={4} />
                              </button>
                              <div className="flex-1 text-center">
                                  <div className="text-gray-400 text-xs font-tech uppercase">LVL</div>
                                  <div className="font-title text-3xl text-white">{newTaskMinLevel}</div>
                              </div>
                              <button 
                                onClick={() => setNewTaskMinLevel(newTaskMinLevel + 1)}
                                className="w-12 h-12 bg-brawl-green rounded-lg border-b-4 border-green-800 flex items-center justify-center text-white active:border-b-0 active:translate-y-1"
                              >
                                  <PlusIcon size={20} strokeWidth={4} />
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-5 pt-0 mt-auto">
                      <button 
                        onClick={addTask} 
                        className="w-full bg-brawl-yellow text-black font-title text-xl py-4 rounded-xl border-b-8 border-yellow-600 hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all shadow-[0_5px_20px_rgba(255,196,0,0.3)]"
                      >
                          CRÉER LA MISSION
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* FAB */}
      {currentView === 'quests' && !inputOpen && (
          <button 
            onClick={openInputModal}
            className="absolute bottom-24 right-6 w-16 h-16 bg-brawl-yellow rounded-2xl border-b-4 border-yellow-700 flex items-center justify-center text-black shadow-xl hover:scale-105 active:scale-95 active:border-b-0 active:translate-y-1 transition-all z-40"
          >
              <Plus size={36} strokeWidth={4} />
          </button>
      )}

      {/* BOTTOM NAV */}
      <nav className="relative z-20 bg-[#1e1629] border-t-2 border-white/10 h-[80px] flex pb-2 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <NavBtn 
            active={currentView === 'quests'} 
            onClick={() => setCurrentView('quests')} 
            icon={<Swords size={28} strokeWidth={2.5} />} 
            label="BATTLE" 
          />
          <NavBtn 
            active={currentView === 'stats'} 
            onClick={() => setCurrentView('stats')} 
            icon={<BarChart3 size={28} strokeWidth={2.5} />} 
            label="STATS" 
          />
          <NavBtn 
            active={currentView === 'rewards'} 
            onClick={() => setCurrentView('rewards')} 
            icon={<Gift size={28} strokeWidth={2.5} />} 
            label="SHOP"
            badge={state.boxes}
          />
      </nav>

    </div>
  );
};

// Sub-component for Nav
const NavBtn: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: number}> = ({active, onClick, icon, label, badge}) => (
    <button 
        onClick={onClick}
        className={`
            flex-1 flex flex-col items-center justify-center relative group
            transition-all duration-200
            ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
        `}
    >
        {/* Active Indicator Top */}
        {active && <div className="absolute top-0 w-16 h-1 bg-brawl-yellow shadow-[0_0_10px_#ffc400] rounded-b-full" />}
        
        <div className={`mb-1 transition-transform ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`}>{icon}</div>
        <div className="font-title text-xs tracking-wider">{label}</div>
        
        {badge !== undefined && badge > 0 && (
            <div className="absolute top-3 right-8 md:right-12 bg-brawl-red text-white text-[10px] font-bold px-1.5 rounded border border-white animate-bounce shadow-lg">
                {badge}
            </div>
        )}
    </button>
);

// Filter Button Component
const FilterBtn: React.FC<{label: string, active: boolean, onClick: () => void, color?: string}> = ({label, active, onClick, color}) => (
    <button
        onClick={onClick}
        className={`
            flex-shrink-0 px-4 py-2 rounded-lg font-title text-sm tracking-wide border-2 transition-all
            ${active 
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] -translate-y-0.5' 
                : 'bg-[#2a223a] text-gray-400 border-[#3d2e4f] hover:bg-[#332a45]'}
        `}
        style={active && color ? { color: color, borderColor: 'white' } : {}}
    >
        {label}
    </button>
);

export default App;
