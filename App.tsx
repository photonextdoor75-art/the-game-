
import React, { useState, useEffect, useRef } from 'react';
import { AppState, StatKey, QuestFrequency, CAT_COLORS, CAT_ICONS, ShopItem, SeasonType, ViewName, AvatarDef, Quest, StatDef } from './types';
import { INITIAL_STATE, AVATAR_LIST, KIDS_QUESTS, TEEN_QUESTS, WEEKLY_QUESTS, MONTHLY_QUESTS, DAILY_GIFT_POOL, SHOP_ITEMS, getCurrentSeason } from './constants';
import RadarChart from './components/RadarChart';
import StarBackground from './components/StarBackground';
import MathGame from './components/MathGame';
import GameHub from './components/GameHub';
import ReadingGame from './components/ReadingGame';
import StarrDrop from './components/StarrDrop';

// Firebase
import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

// Icons
import { Swords, BarChart3, Gift, Plus, X, Lock, Minus, Plus as PlusIcon, Check, Calendar, Clock, Skull, Trophy, UserPlus, LogOut, Gamepad2, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Trash2, Bug, FolderOpen, RefreshCw, Settings, ShieldAlert, AlertTriangle } from 'lucide-react';

type QuestTab = 'DAILY' | 'SEASON';
type AuthStep = 'SELECT' | 'CREATE' | 'PIN' | 'APP' | 'ADMIN_PIN' | 'ADMIN_PANEL';
type GameMode = 'HUB' | 'MATH' | 'READ';

interface UserProfile {
    id: string;
    name: string;
    avatar: string;
    pin: string; 
}

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [authStep, setAuthStep] = useState<AuthStep>('SELECT');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [profilesLoaded, setProfilesLoaded] = useState(false);

  // --- CREATION STATE ---
  const [createStep, setCreateStep] = useState(1);
  const [newProfile, setNewProfile] = useState({
      name: '', age: 10, gender: 'M' as 'M'|'F'|'O', avatar: 'saiyan_sparky', customSport: '', pin: ''
  });

  // --- ADMIN STATE ---
  const [deleteConfirmation, setDeleteConfirmation] = useState<{id: string, name: string} | null>(null);

  // --- GAME STATE ---
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [currentView, setCurrentView] = useState<ViewName>('quests');
  const [gameMode, setGameMode] = useState<GameMode>('HUB');
  const [questTab, setQuestTab] = useState<QuestTab>('DAILY');
  const [currentSeason, setCurrentSeason] = useState<SeasonType>('RENTREE');
  
  // UI States
  const [inputOpen, setInputOpen] = useState(false);
  const [newTaskTxt, setNewTaskTxt] = useState('');
  const [newTaskCat, setNewTaskCat] = useState<StatKey>('PRJ');
  const [newTaskXp, setNewTaskXp] = useState<number>(25);
  const [newTaskTokens, setNewTaskTokens] = useState<number>(10);
  const [newTaskFreq, setNewTaskFreq] = useState<QuestFrequency>('DAILY');

  // Rewards States
  const [isShaking, setIsShaking] = useState(false);
  
  // Notification States (Psychology hook)
  const [hasNewGames, setHasNewGames] = useState(true);

  // Starr Drop State (Replaces simple modal)
  const [starrDrop, setStarrDrop] = useState<{
      active: boolean;
      type: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
      rewardText: string;
      subText?: string;
      icon?: string;
  }>({ active: false, type: 'RARE', rewardText: '' });
  
  // Debug State
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugStatus, setDebugStatus] = useState<{url: string, status: 'loading' | 'success' | 'error' | null}>({ url: '', status: null });

  // Sync States
  const [user, setUser] = useState<User | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const isRemoteUpdate = useRef(false);

  // --- INIT ---
  useEffect(() => {
      setCurrentSeason(getCurrentSeason());
      const unsub = onAuthStateChanged(auth, (u) => {
          if (!u) {
              signInAnonymously(auth).catch(console.error);
          } else {
              setUser(u);
          }
      });

      // Randomly trigger "New Games" notification to re-engage user (Variable Reward Schedule)
      const notifInterval = setInterval(() => {
          if (Math.random() > 0.8) setHasNewGames(true);
      }, 60000); // Check every minute

      return () => {
          unsub();
          clearInterval(notifInterval);
      };
  }, []);

  // --- LOAD PROFILES (Global) ---
  useEffect(() => {
    if(!user) return;
    const unsub = onSnapshot(doc(db, 'global', 'profiles'), (snap) => {
        if(snap.exists()) {
            setProfiles(snap.data().list || []);
        } else {
            setProfiles([]);
            setDoc(doc(db, 'global', 'profiles'), { list: [] });
        }
        setProfilesLoaded(true);
    });
    return () => unsub();
  }, [user]);

  // --- USER DATA SYNC ---
  useEffect(() => {
    if (!user || !activeProfileId || authStep !== 'APP') return;
    const userDocRef = doc(db, 'users', activeProfileId);
    const unsubSnap = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        isRemoteUpdate.current = true;
        setState(snap.data() as AppState);
        setDbReady(true);
      } else {
        setDoc(userDocRef, state).then(() => setDbReady(true));
      }
    });
    return () => unsubSnap();
  }, [user, activeProfileId, authStep]);

  useEffect(() => {
    if (!user || !dbReady || !activeProfileId || authStep !== 'APP') return;
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    const timeout = setTimeout(() => {
        setDoc(doc(db, 'users', activeProfileId), state).catch(console.error);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [state, user, dbReady, activeProfileId]);

  // --- DEBUG FUNCTION ---
  const runImageDiagnostics = () => {
      const testUrl = AVATAR_LIST[0].file; // Test with the first avatar
      setDebugStatus({ url: testUrl, status: 'loading' });
      
      const img = new Image();
      img.onload = () => setDebugStatus({ url: testUrl, status: 'success' });
      img.onerror = () => setDebugStatus({ url: testUrl, status: 'error' });
      img.src = testUrl;
  };

  useEffect(() => {
      if (debugOpen) runImageDiagnostics();
  }, [debugOpen]);

  // --- ACTIONS ---

  const promptDeleteProfile = (id: string, name: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setDeleteConfirmation({ id, name });
  };

  const confirmDeleteProfile = async () => {
      if (!deleteConfirmation) return;
      
      const { id } = deleteConfirmation;
      const oldProfiles = [...profiles];
      
      // 1. Optimistic Update
      const newProfiles = profiles.filter(p => p.id !== id);
      setProfiles(newProfiles);
      setDeleteConfirmation(null); // Close modal

      try {
         // 2. DB Operations
         await setDoc(doc(db, 'global', 'profiles'), { list: newProfiles });
         await deleteDoc(doc(db, 'users', id));
         
         if(activeProfileId === id) {
             setActiveProfileId(null);
         }
      } catch (error) {
         console.error("Delete failed", error);
         alert("Erreur lors de la suppression. Vérifiez votre connexion.");
         setProfiles(oldProfiles); // Rollback
      }
  };

  const handleCreateProfile = async () => {
      if(!newProfile.name || newProfile.pin.length !== 4) return;
      const profileId = Date.now().toString(); 
      
      let initialQuests = newProfile.age < 14 ? [...KIDS_QUESTS] : [...TEEN_QUESTS];
      if(newProfile.customSport && newProfile.age < 14) {
          initialQuests.push({
              txt: `Séance ${newProfile.customSport}`,
              cat: "PHY", xp: 50, tokens: 10, minLevel: 1, frequency: 'DAILY', maxProgress: 1
          });
      }
      initialQuests = [...initialQuests, ...WEEKLY_QUESTS, ...MONTHLY_QUESTS];
      const finalQuests = initialQuests.map((q, idx) => ({ 
          ...q, id: Date.now() + idx, done: false, progress: 0, maxProgress: q.maxProgress || 1 
      }));

      const newState: AppState = {
          ...INITIAL_STATE,
          name: newProfile.name,
          age: newProfile.age,
          gender: newProfile.gender,
          avatar: newProfile.avatar,
          pin: newProfile.pin,
          quests: finalQuests
      };
      
      await setDoc(doc(db, 'users', profileId), newState);
      
      const newProfileSummary: UserProfile = {
          id: profileId,
          name: newProfile.name,
          avatar: newProfile.avatar,
          pin: newProfile.pin
      };
      await setDoc(doc(db, 'global', 'profiles'), {
          list: [...profiles, newProfileSummary]
      });

      setActiveProfileId(profileId);
      setState(newState);
      setAuthStep('APP');
  };

  const handleProfileClick = (p: UserProfile) => {
      setTargetProfile(p);
      setPinInput('');
      setAuthStep('PIN');
  };

  const verifyPin = () => {
      // ADMIN CHECK
      if (authStep === 'ADMIN_PIN') {
          if (pinInput === '1983') {
              setAuthStep('ADMIN_PANEL');
              setPinInput('');
          } else {
              alert("Code Admin Incorrect");
              setPinInput('');
          }
          return;
      }

      // USER CHECK
      if (targetProfile && pinInput === targetProfile.pin) {
          setActiveProfileId(targetProfile.id);
          setAuthStep('APP');
      } else {
          alert("Code incorrect !");
          setPinInput('');
      }
  };

  const handleQuestToggle = (qId: number) => {
    setState(prev => {
        const qIndex = prev.quests.findIndex(q => q.id === qId);
        if (qIndex === -1) return prev;

        const q = prev.quests[qIndex];
        const nowDone = !q.done;
        
        let newXp = prev.xp;
        let newTokens = prev.tokens;
        let newTasksDone = prev.tasksDoneTotal;
        let newSinceBox = prev.tasksSinceLastBox;

        if (nowDone) {
            newXp += q.xp;
            newTokens += q.tokens;
            newTasksDone++;
            newSinceBox++;
        } else {
            newXp = Math.max(0, newXp - q.xp);
            newTokens = Math.max(0, newTokens - q.tokens);
            newTasksDone = Math.max(0, newTasksDone - 1);
            newSinceBox = Math.max(0, newSinceBox - 1);
        }

        // Stats Update
        const newStats = { ...prev.stats };
        if (q.cat in newStats) {
            const stat = newStats[q.cat];
            stat.val = Math.min(stat.max, Math.max(0, stat.val + (nowDone ? 5 : -5)));
        }

        // Level Up Logic
        const xpForNext = prev.level * 1000;
        let newLevel = prev.level;
        if(newXp >= xpForNext) {
            newLevel++;
            newXp -= xpForNext;
            setStarrDrop({
                active: true,
                type: 'LEGENDARY',
                rewardText: "NIVEAU SUPÉRIEUR !",
                subText: `Niveau ${newLevel}`,
                icon: "🆙"
            });
        }

        const newQuests = [...prev.quests];
        newQuests[qIndex] = { ...q, done: nowDone };

        return {
            ...prev,
            quests: newQuests,
            xp: newXp,
            tokens: newTokens,
            level: newLevel,
            tasksDoneTotal: newTasksDone,
            tasksSinceLastBox: newSinceBox,
            stats: newStats
        };
    });
  };

  const addTask = () => {
      if (!newTaskTxt) return;
      const newQuest: Quest = {
          id: Date.now(),
          txt: newTaskTxt,
          cat: newTaskCat,
          xp: newTaskXp,
          tokens: newTaskTokens,
          frequency: newTaskFreq,
          progress: 0,
          maxProgress: 1,
          done: false,
          minLevel: 1
      };
      setState(prev => ({ ...prev, quests: [...prev.quests, newQuest] }));
      setInputOpen(false);
      setNewTaskTxt('');
  };

  const buyItem = (item: ShopItem) => {
      if(state.tokens >= item.cost) {
            setState(prev => ({
                ...prev,
                tokens: prev.tokens - item.cost
            }));

            const rarityMap: Record<'COMMUNE' | 'RARE' | 'EPIQUE' | 'LEGENDAIRE', 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'> = {
                'COMMUNE': 'COMMON',
                'RARE': 'RARE',
                'EPIQUE': 'EPIC',
                'LEGENDAIRE': 'LEGENDARY'
            };
            
            setStarrDrop({
                active: true,
                type: rarityMap[item.rar],
                rewardText: item.txt,
                subText: "ACHAT RÉUSSI",
                icon: item.icon
            });
      } else {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
      }
  };

  const handleGameWin = (tokens: number, xp: number) => {
      setState(prev => {
          const newSchoolStats = { ...prev.schoolStats };
          newSchoolStats.MAT.val = Math.min(100, newSchoolStats.MAT.val + 2);
          newSchoolStats.LEC.val = Math.min(100, newSchoolStats.LEC.val + 2);

          return {
            ...prev,
            tokens: prev.tokens + tokens,
            xp: prev.xp + xp,
            schoolStats: newSchoolStats
          }
      });
      setGameMode('HUB');
      
      setStarrDrop({
          active: true,
          type: tokens > 20 ? 'EPIC' : 'RARE',
          rewardText: "VICTOIRE !",
          subText: `+${tokens} Jetons`,
          icon: "🏆"
      });
  };

  const handleNavClick = (view: ViewName) => {
      setCurrentView(view);
      if (view === 'games') {
          setHasNewGames(false); // Clear notification
      }
  };

  // --- HELPERS ---
  const getAvatarUrl = (id: string) => AVATAR_LIST.find(a => a.id === id)?.file || AVATAR_LIST[0].file;
  
  const filteredQuests = state.quests.filter(q => {
      if (questTab === 'DAILY') return q.frequency === 'DAILY';
      return q.frequency !== 'DAILY';
  });

  const progress = (state.xp / (state.level * 1000)) * 100;

  // --- RENDER ---
  
  // 1. LOADING
  if (!profilesLoaded) {
      return (
          <div className="h-screen flex items-center justify-center bg-brawl-dark text-white">
              <Loader2 className="animate-spin text-brawl-yellow" size={48} />
          </div>
      );
  }

  // 2. PROFILE SELECT
  if (authStep === 'SELECT') {
      return (
          <div className="min-h-screen bg-brawl-dark p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <StarBackground season={currentSeason} />
              
              {/* ADMIN BUTTON */}
              <button 
                onClick={() => { setPinInput(''); setAuthStep('ADMIN_PIN'); }}
                className="absolute top-4 left-4 z-50 p-2 bg-black/40 rounded-full text-gray-500 hover:text-white hover:bg-black/60 transition-colors"
                title="Administration"
              >
                  <Settings size={20} />
              </button>

              {/* DEBUG BUTTON */}
              <button 
                onClick={() => setDebugOpen(true)} 
                className="absolute top-4 right-4 z-50 p-2 bg-black/40 rounded-full text-gray-500 hover:text-brawl-yellow hover:bg-black/60 transition-colors"
                title="Déboguer les images"
              >
                  <Bug size={20} />
              </button>

              <div className="z-10 w-full max-w-md">
                  <h1 className="text-4xl font-title text-center text-brawl-yellow mb-8 text-stroke-2 drop-shadow-lg">QUI JOUE ?</h1>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                      {profiles.map(p => (
                          <div key={p.id} onClick={() => handleProfileClick(p)} className="relative group bg-brawl-panel border-4 border-brawl-purple rounded-2xl p-4 flex flex-col items-center active:scale-95 transition-transform cursor-pointer shadow-lg hover:brightness-110">
                              <img 
                                src={getAvatarUrl(p.avatar)} 
                                alt={p.name} 
                                className="w-24 h-28 rounded-xl bg-black/30 mb-2 border-2 border-white/20 object-cover object-top shadow-md" 
                              />
                              <span className="font-title text-xl text-white truncate w-full text-center">{p.name}</span>
                          </div>
                      ))}
                      
                      <div onClick={() => setAuthStep('CREATE')} className="bg-white/5 border-4 border-dashed border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[160px] active:scale-95 transition-transform cursor-pointer hover:bg-white/10">
                          <Plus size={40} className="text-white/50 mb-2" />
                          <span className="font-title text-white/50">NOUVEAU</span>
                      </div>
                  </div>
              </div>

              {/* DEBUG MODAL */}
              {debugOpen && (
                  <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                      <div className="bg-[#1e1629] border-4 border-brawl-blue rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
                          <div className="flex justify-between items-center mb-6">
                              <h2 className="font-title text-2xl text-brawl-blue flex items-center gap-2"><Bug /> DIAGNOSTIC</h2>
                              <button onClick={() => setDebugOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X size={20}/></button>
                          </div>
                          
                          <div className="space-y-6 font-mono text-sm">
                              {/* TEST RESULT */}
                              <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                                  <h3 className="text-gray-400 font-bold mb-2">TEST D'ACCÈS IMAGE</h3>
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="text-gray-500">URL Ciblée:</span>
                                      <code className="text-brawl-yellow break-all">{debugStatus.url}</code>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Statut:</span>
                                      {debugStatus.status === 'loading' && <span className="text-yellow-500 flex items-center gap-1"><Loader2 size={14} className="animate-spin"/> Test en cours...</span>}
                                      {debugStatus.status === 'success' && <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle2 size={16}/> SUCCESS (Image Trouvée)</span>}
                                      {debugStatus.status === 'error' && <span className="text-red-500 font-bold flex items-center gap-1"><AlertCircle size={16}/> ERROR 404 (Introuvable)</span>}
                                  </div>
                              </div>

                              {/* FOLDER GUIDE */}
                              <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                                  <h3 className="text-gray-400 font-bold mb-2 flex items-center gap-2"><FolderOpen size={16}/> DOSSIER CRÉÉ</h3>
                                  <p className="mb-4 text-gray-300">Le dossier <code>public/avatars</code> a été généré. Déposez vos images (300x350px) à l'intérieur :</p>
                                  
                                  <div className="bg-black p-3 rounded border-l-2 border-gray-600">
                                      <div className="text-gray-500">Racine du projet/</div>
                                      <div className="pl-4 text-brawl-green font-bold">📂 public/</div>
                                      <div className="pl-8 text-brawl-blue font-bold">📂 avatars/</div>
                                      <div className="pl-12 text-white">📄 README.txt</div>
                                      <div className="pl-12 text-white/50 italic">... déposez vos images ici</div>
                                  </div>
                              </div>
                              
                              <div className="text-xs text-center text-gray-500 mt-4">
                                  Une fois les images ajoutées, rechargez cette page.
                              </div>

                              <button onClick={runImageDiagnostics} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-2 border border-white/20">
                                  <RefreshCw size={16} /> Relancer le test
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }
  
  // 3. ADMIN PANEL LIST
  if (authStep === 'ADMIN_PANEL') {
      return (
          <div className="min-h-screen bg-brawl-dark p-6 flex flex-col items-center relative overflow-hidden">
              <StarBackground season={currentSeason} />
              
              <div className="z-10 w-full max-w-md">
                   <div className="flex items-center mb-8">
                       <button onClick={() => setAuthStep('SELECT')} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><ArrowLeft /></button>
                       <h1 className="ml-4 text-3xl font-title text-red-500 flex items-center gap-2"><ShieldAlert /> ADMINISTRATION</h1>
                   </div>

                   <div className="bg-[#1e1629] border-4 border-red-900 rounded-2xl p-4 shadow-2xl">
                       <p className="text-gray-400 mb-4 text-sm bg-black/40 p-3 rounded-lg border border-red-500/30">
                           Zone de danger. La suppression d'un profil est irréversible.
                       </p>

                       {profiles.length === 0 ? (
                           <div className="text-center py-8 text-gray-500">Aucun profil enregistré.</div>
                       ) : (
                           <div className="space-y-3">
                               {profiles.map(p => (
                                   <div key={p.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                                       <div className="flex items-center gap-3">
                                            <img 
                                                src={getAvatarUrl(p.avatar)} 
                                                alt={p.name} 
                                                className="w-12 h-14 rounded-lg object-cover object-top border border-white/10" 
                                            />
                                            <div>
                                                <div className="font-title text-lg leading-none">{p.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">PIN: {p.pin}</div>
                                            </div>
                                       </div>
                                       <button 
                                            onClick={(e) => promptDeleteProfile(p.id, p.name, e)}
                                            className="p-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-red-500/30 active:scale-95"
                                       >
                                           <Trash2 size={20} />
                                       </button>
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>
              </div>

              {/* CONFIRMATION MODAL */}
              {deleteConfirmation && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in">
                      <div className="bg-[#1e1629] border-4 border-red-600 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                          <div className="flex justify-center mb-4 text-red-500">
                              <AlertTriangle size={64} />
                          </div>
                          <h3 className="text-2xl font-title text-center text-white mb-2">SUPPRIMER ?</h3>
                          <p className="text-center text-gray-400 mb-6">
                              Voulez-vous vraiment effacer le profil de <span className="text-white font-bold">{deleteConfirmation.name}</span> ? Cette action est définitive.
                          </p>
                          <div className="flex gap-4">
                              <button 
                                  onClick={() => setDeleteConfirmation(null)}
                                  className="flex-1 py-3 bg-gray-700 rounded-xl font-title text-white hover:bg-gray-600"
                              >
                                  ANNULER
                              </button>
                              <button 
                                  onClick={confirmDeleteProfile}
                                  className="flex-1 py-3 bg-red-600 rounded-xl font-title text-white hover:bg-red-700 shadow-lg"
                              >
                                  OUI, EFFACER
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // 4. CREATE PROFILE
  if (authStep === 'CREATE') {
      return (
          <div className="min-h-screen bg-brawl-dark p-6 flex flex-col relative">
               <StarBackground season={currentSeason} />
               <div className="z-10 w-full max-w-md mx-auto flex-grow flex flex-col">
                   <div className="flex items-center mb-6">
                       <button onClick={() => setAuthStep('SELECT')} className="p-2 bg-white/10 rounded-lg"><ArrowLeft /></button>
                       <h2 className="ml-4 text-2xl font-title text-white">CRÉER PROFIL</h2>
                   </div>

                   {createStep === 1 && (
                       <div className="space-y-6 animate-fade-in">
                           <div>
                               <label className="block text-sm font-bold text-gray-400 mb-1">TON PRÉNOM</label>
                               <input 
                                    type="text" 
                                    value={newProfile.name} 
                                    onChange={e => setNewProfile({...newProfile, name: e.target.value})}
                                    className="w-full bg-brawl-panel border-b-4 border-brawl-purple p-4 text-2xl font-title text-white focus:outline-none focus:border-brawl-yellow rounded-t-lg"
                                    placeholder="Super Héro..."
                               />
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-gray-400 mb-1">TON AGE</label>
                               <div className="flex gap-4 items-center bg-brawl-panel p-4 rounded-xl">
                                    <button onClick={() => setNewProfile({...newProfile, age: Math.max(4, newProfile.age-1)})} className="p-2 bg-white/10 rounded-lg"><Minus /></button>
                                    <span className="text-3xl font-title flex-grow text-center">{newProfile.age} ANS</span>
                                    <button onClick={() => setNewProfile({...newProfile, age: Math.min(18, newProfile.age+1)})} className="p-2 bg-white/10 rounded-lg"><Plus /></button>
                               </div>
                           </div>
                           <button onClick={() => setCreateStep(2)} disabled={!newProfile.name} className="w-full py-4 bg-brawl-green border-b-4 border-green-800 rounded-xl text-xl font-title text-black mt-8 active:translate-y-1 active:border-b-0 disabled:opacity-50">SUIVANT</button>
                       </div>
                   )}

                   {createStep === 2 && (
                       <div className="flex flex-col h-full animate-fade-in">
                           <h3 className="text-center font-title text-xl mb-4">CHOISIS TON AVATAR</h3>
                           
                           {/* DEBUG BUTTON IN CREATE FLOW TOO */}
                           <button 
                                onClick={() => setDebugOpen(true)} 
                                className="mx-auto mb-2 text-xs bg-black/40 px-3 py-1 rounded-full text-gray-500 hover:text-brawl-yellow flex items-center gap-1"
                            >
                                <Bug size={12} /> Problème d'image ?
                            </button>

                           <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[60vh] p-2">
                               {AVATAR_LIST.map(a => (
                                   <button 
                                        key={a.id} 
                                        onClick={() => setNewProfile({...newProfile, avatar: a.id})}
                                        className={`relative p-2 rounded-xl border-4 transition-all ${newProfile.avatar === a.id ? 'border-brawl-yellow bg-white/10 scale-105 shadow-xl z-10' : 'border-transparent hover:bg-white/5'}`}
                                    >
                                       <img src={a.file} alt={a.name} className="w-full h-auto aspect-[6/7] object-cover object-top rounded-lg shadow-sm" />
                                       {newProfile.avatar === a.id && <div className="absolute top-1 right-1 bg-brawl-yellow rounded-full p-1"><Check size={16} className="text-black"/></div>}
                                   </button>
                               ))}
                           </div>
                           <button onClick={() => setCreateStep(3)} className="w-full py-4 bg-brawl-green border-b-4 border-green-800 rounded-xl text-xl font-title text-black mt-auto active:translate-y-1 active:border-b-0">SUIVANT</button>
                       </div>
                   )}

                   {createStep === 3 && (
                       <div className="animate-fade-in space-y-6">
                           <div className="text-center">
                               <img 
                                    src={getAvatarUrl(newProfile.avatar)} 
                                    className="w-40 h-auto aspect-[6/7] rounded-2xl mx-auto border-4 border-brawl-yellow mb-4 object-cover object-top shadow-[0_0_20px_rgba(255,196,0,0.3)]" 
                               />
                               <h3 className="font-title text-3xl text-stroke-1">{newProfile.name}</h3>
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-gray-400 mb-1">CODE SECRET (PIN)</label>
                               <input 
                                    type="tel" 
                                    maxLength={4}
                                    value={newProfile.pin} 
                                    onChange={e => setNewProfile({...newProfile, pin: e.target.value})}
                                    className="w-full bg-brawl-panel border-4 border-white/20 p-4 text-4xl font-title text-center text-white rounded-xl tracking-[1rem]"
                                    placeholder="0000"
                               />
                               <p className="text-xs text-center text-gray-500 mt-2">Pour protéger ton compte</p>
                           </div>
                           <button onClick={handleCreateProfile} disabled={newProfile.pin.length !== 4} className="w-full py-4 bg-brawl-yellow border-b-4 border-yellow-700 rounded-xl text-xl font-title text-black mt-8 active:translate-y-1 active:border-b-0 disabled:opacity-50">C'EST PARTI !</button>
                       </div>
                   )}

                   {/* DEBUG MODAL REUSE */}
                    {debugOpen && (
                        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                            <div className="bg-[#1e1629] border-4 border-brawl-blue rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-title text-2xl text-brawl-blue flex items-center gap-2"><Bug /> DIAGNOSTIC</h2>
                                    <button onClick={() => setDebugOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X size={20}/></button>
                                </div>
                                <div className="space-y-6 font-mono text-sm">
                                    <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                                        <h3 className="text-gray-400 font-bold mb-2">TEST D'ACCÈS IMAGE</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-gray-500">URL Ciblée:</span>
                                            <code className="text-brawl-yellow break-all">{debugStatus.url}</code>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Statut:</span>
                                            {debugStatus.status === 'loading' && <span className="text-yellow-500 flex items-center gap-1"><Loader2 size={14} className="animate-spin"/> Test en cours...</span>}
                                            {debugStatus.status === 'success' && <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle2 size={16}/> SUCCESS</span>}
                                            {debugStatus.status === 'error' && <span className="text-red-500 font-bold flex items-center gap-1"><AlertCircle size={16}/> ERROR 404</span>}
                                        </div>
                                    </div>
                                    <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                                        <h3 className="text-gray-400 font-bold mb-2 flex items-center gap-2"><FolderOpen size={16}/> DOSSIER CRÉÉ</h3>
                                        <p className="mb-4 text-gray-300">Le dossier <code>public/avatars</code> a été généré. Déposez vos images (300x350px) à l'intérieur.</p>
                                        <div className="bg-black p-3 rounded border-l-2 border-gray-600">
                                            <div className="pl-4 text-brawl-green font-bold">📂 public/</div>
                                            <div className="pl-8 text-brawl-blue font-bold">📂 avatars/</div>
                                            <div className="pl-12 text-white/50 italic">... déposez vos images ici</div>
                                        </div>
                                    </div>
                                    <button onClick={runImageDiagnostics} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-2 border border-white/20">
                                        <RefreshCw size={16} /> Relancer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
               </div>
          </div>
      );
  }

  // 5. PIN ENTRY (USER OR ADMIN)
  if (authStep === 'PIN' || authStep === 'ADMIN_PIN') {
      const isAdminMode = authStep === 'ADMIN_PIN';
      return (
          <div className="min-h-screen bg-brawl-dark flex flex-col items-center justify-center p-6 relative">
              <StarBackground season={currentSeason} />
              <div className="z-10 w-full max-w-xs text-center">
                  {!isAdminMode ? (
                      <img 
                        src={getAvatarUrl(targetProfile?.avatar || '')} 
                        className="w-24 h-auto aspect-[6/7] rounded-2xl mx-auto mb-6 border-4 border-brawl-purple object-cover object-top shadow-xl" 
                      />
                  ) : (
                      <div className="w-24 h-24 rounded-full bg-red-900 border-4 border-red-500 mx-auto mb-6 flex items-center justify-center text-red-500">
                          <Settings size={48} />
                      </div>
                  )}
                  
                  <h2 className={`text-3xl font-title mb-8 ${isAdminMode ? 'text-red-500' : 'text-white'}`}>
                      {isAdminMode ? 'CODE ADMIN' : 'CODE SECRET'}
                  </h2>
                  
                  <div className="flex justify-center gap-4 mb-8">
                      {[0,1,2,3].map(i => (
                          <div key={i} className={`w-4 h-4 rounded-full transition-colors ${pinInput.length > i ? (isAdminMode ? 'bg-red-500 shadow-[0_0_10px_#ff0000]' : 'bg-brawl-yellow shadow-[0_0_10px_#ffc400]') : 'bg-white/20'}`}></div>
                      ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                          <button key={n} onClick={() => setPinInput(p => (p + n).slice(0,4))} className="h-16 rounded-xl bg-white/10 font-title text-2xl active:bg-white/30 border-b-4 border-transparent active:border-b-0 active:translate-y-[2px]">{n}</button>
                      ))}
                      <button onClick={() => setAuthStep('SELECT')} className="h-16 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border-b-4 border-transparent active:border-b-0 active:translate-y-[2px]"><X /></button>
                      <button onClick={() => setPinInput(p => (p + 0).slice(0,4))} className="h-16 rounded-xl bg-white/10 font-title text-2xl active:bg-white/30 border-b-4 border-transparent active:border-b-0 active:translate-y-[2px]">0</button>
                      <button onClick={verifyPin} className={`h-16 rounded-xl text-black flex items-center justify-center active:scale-95 border-b-4 active:border-b-0 active:translate-y-[4px] ${isAdminMode ? 'bg-red-500 border-red-800' : 'bg-brawl-green border-green-800'}`}><Check /></button>
                  </div>
              </div>
          </div>
      );
  }

  // 6. GAME VIEWS (Math, Reading)
  if (gameMode !== 'HUB') {
      return (
          <div className="h-screen bg-brawl-dark text-white relative overflow-hidden flex flex-col">
              {gameMode === 'MATH' && <MathGame onWin={handleGameWin} onClose={() => setGameMode('HUB')} />}
              {gameMode === 'READ' && <ReadingGame onWin={handleGameWin} onClose={() => setGameMode('HUB')} />}
          </div>
      );
  }

  // 7. MAIN APP DASHBOARD
  return (
    <div className="relative z-10 flex flex-col h-screen max-w-md mx-auto bg-brawl-dark text-white overflow-hidden shadow-2xl">
      <StarBackground season={currentSeason} />

      {/* HEADER */}
      <header className="flex items-center justify-between p-3 bg-brawl-panel/90 backdrop-blur-md border-b border-white/10 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => setAuthStep('SELECT')}>
            <img 
                src={getAvatarUrl(state.avatar)} 
                alt="Avatar" 
                className="w-12 h-12 rounded-lg border-2 border-white/20 bg-black/50 object-cover object-top" 
            />
            <div className="absolute -bottom-1 -right-1 bg-brawl-yellow text-black text-[10px] font-bold px-1 rounded border border-black shadow-sm">Lv.{state.level}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-title text-lg leading-none tracking-wide text-stroke-1 drop-shadow-sm">{state.name}</span>
            <div className="w-24 h-3 bg-black/50 rounded-full mt-1 relative overflow-hidden border border-white/10">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-brawl-purple to-pink-500 transition-all duration-500" style={{width: `${progress}%`}}></div>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-brawl-yellow/30 ${isShaking ? 'animate-shake text-red-400' : 'text-brawl-yellow'}`}>
          <img src="https://cdn-icons-png.flaticon.com/512/272/272525.png" className="w-5 h-5" alt="Token" />
          <span className="font-title text-xl translate-y-[1px]">{state.tokens}</span>
        </div>
      </header>

      {/* CONTENT AREA */}
      <main className="flex-grow overflow-y-auto no-scrollbar relative z-10 pb-20">
        
        {/* VIEW: QUESTS */}
        {currentView === 'quests' && (
            <div className="p-4 space-y-4">
                <div className="flex p-1 bg-black/30 rounded-xl mb-4">
                    <button onClick={() => setQuestTab('DAILY')} className={`flex-1 py-2 rounded-lg font-title text-sm transition-all ${questTab==='DAILY' ? 'bg-brawl-yellow text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>QUOTIDIEN</button>
                    <button onClick={() => setQuestTab('SEASON')} className={`flex-1 py-2 rounded-lg font-title text-sm transition-all ${questTab==='SEASON' ? 'bg-brawl-purple text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>SAISON</button>
                </div>

                {filteredQuests.map(q => (
                    <div key={q.id} onClick={() => handleQuestToggle(q.id)} className={`relative overflow-hidden rounded-2xl border-l-8 transition-all active:scale-[0.98] ${q.done ? 'bg-gray-800/50 border-gray-600 opacity-60' : 'bg-brawl-panel shadow-lg'}`} style={{ borderLeftColor: q.done ? '#555' : CAT_COLORS[q.cat] }}>
                        <div className="p-4 flex items-center gap-4">
                            <div className="text-3xl">{CAT_ICONS[q.cat]}</div>
                            <div className="flex-grow">
                                <div className={`font-title text-lg leading-tight ${q.done ? 'line-through text-gray-400' : 'text-white'}`}>{q.txt}</div>
                                <div className="flex gap-3 mt-1 text-xs font-bold text-gray-400">
                                    <span className="flex items-center gap-1 text-brawl-purple"><Swords size={12}/> {q.xp} XP</span>
                                    <span className="flex items-center gap-1 text-brawl-yellow"><Gift size={12}/> {q.tokens}</span>
                                </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${q.done ? 'bg-brawl-green border-brawl-green' : 'border-white/20'}`}>
                                {q.done && <Check size={16} className="text-black" />}
                            </div>
                        </div>
                    </div>
                ))}
                
                <button onClick={() => setInputOpen(true)} className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl text-white/40 font-title hover:bg-white/5 flex items-center justify-center gap-2">
                    <PlusIcon /> AJOUTER UNE TÂCHE
                </button>
            </div>
        )}

        {/* VIEW: STATS */}
        {currentView === 'stats' && (
            <div className="p-4 flex flex-col gap-6">
                <div className="bg-brawl-panel/80 p-6 rounded-3xl border border-white/10 shadow-xl">
                    <h2 className="font-title text-center text-2xl text-brawl-blue mb-4">STATS DU HÉROS</h2>
                    <RadarChart stats={state.stats} />
                </div>
                <div className="space-y-3">
                    {(Object.entries(state.schoolStats) as [string, StatDef][]).map(([key, stat]) => (
                        <div key={key} className="bg-black/30 p-3 rounded-xl flex items-center gap-3">
                            <div className="w-10 font-bold text-gray-400 text-xs">{stat.name.slice(0,3)}</div>
                            <div className="flex-grow h-4 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-brawl-green" style={{width: `${stat.val}%`}}></div>
                            </div>
                            <div className="font-title text-sm">{stat.val}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* VIEW: REWARDS */}
        {currentView === 'rewards' && (
            <div className="p-4 grid grid-cols-2 gap-4">
                {SHOP_ITEMS.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => buyItem(item)}
                        disabled={state.tokens < item.cost}
                        className={`relative group flex flex-col items-center p-4 rounded-2xl border-b-4 transition-all active:translate-y-1 active:border-b-0 ${state.tokens >= item.cost ? 'bg-brawl-panel border-black/40 hover:bg-white/5' : 'bg-gray-800/50 border-transparent opacity-50 grayscale'}`}
                    >
                        <div className="text-4xl mb-2 drop-shadow-md group-hover:scale-110 transition-transform">{item.icon}</div>
                        <div className="font-title text-sm text-center leading-tight mb-2 h-8 flex items-center justify-center">{item.txt}</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${state.tokens >= item.cost ? 'bg-brawl-yellow text-black' : 'bg-gray-600 text-gray-400'}`}>
                            {item.cost} <img src="https://cdn-icons-png.flaticon.com/512/272/272525.png" className="w-3 h-3"/>
                        </div>
                    </button>
                ))}
            </div>
        )}

        {/* VIEW: GAMES */}
        {currentView === 'games' && <GameHub onSelectGame={setGameMode} />}

      </main>

      {/* NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 w-full max-w-md mx-auto bg-[#150f1d] border-t border-white/10 p-2 grid grid-cols-4 gap-2 z-30 pb-safe">
          {[
              { id: 'quests', icon: Swords, label: 'QUÊTES' },
              { id: 'stats', icon: BarChart3, label: 'STATS' },
              { id: 'rewards', icon: Gift, label: 'BUTIN' },
              { id: 'games', icon: Gamepad2, label: 'JEUX' }
          ].map(tab => {
              // Notification Logic for Games Tab
              const isGames = tab.id === 'games';
              const showNotif = isGames && hasNewGames;

              return (
                <button 
                    key={tab.id}
                    onClick={() => handleNavClick(tab.id as ViewName)}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all relative ${currentView === tab.id ? 'bg-white/10 text-brawl-yellow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <div className="relative">
                        <tab.icon 
                            size={24} 
                            className={`
                                ${currentView === tab.id ? 'drop-shadow-[0_0_8px_rgba(255,196,0,0.5)]' : ''} 
                                ${showNotif ? 'text-red-500 animate-bounce' : ''}
                            `} 
                        />
                        {showNotif && (
                            <div className="absolute -top-1 -right-1">
                                <span className="absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75 animate-ping"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-black"></span>
                            </div>
                        )}
                    </div>
                    <span className={`text-[10px] font-bold mt-1 ${showNotif ? 'text-red-500' : ''}`}>{tab.label}</span>
                </button>
              );
          })}
      </nav>

      {/* MODALS */}
      {/* 1. Add Task Modal */}
      {inputOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
              <div className="bg-brawl-panel w-full max-w-sm rounded-3xl border-4 border-[#3d2e4f] p-6 shadow-2xl">
                  <h3 className="font-title text-2xl text-center mb-6">NOUVELLE MISSION</h3>
                  <input 
                    autoFocus
                    className="w-full bg-black/40 border-2 border-white/10 rounded-xl p-4 text-white placeholder-gray-500 mb-4 focus:border-brawl-yellow outline-none"
                    placeholder="Titre de la mission..."
                    value={newTaskTxt}
                    onChange={e => setNewTaskTxt(e.target.value)}
                  />
                  <div className="grid grid-cols-4 gap-2 mb-4">
                      {Object.keys(CAT_ICONS).map(k => (
                          <button key={k} onClick={() => setNewTaskCat(k as StatKey)} className={`p-2 rounded-lg text-2xl border-2 transition-all ${newTaskCat === k ? 'bg-white/10 border-brawl-yellow' : 'border-transparent opacity-50'}`}>
                              {CAT_ICONS[k as StatKey]}
                          </button>
                      ))}
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setInputOpen(false)} className="flex-1 py-3 rounded-xl font-title bg-gray-700 text-gray-300">ANNULER</button>
                      <button onClick={addTask} className="flex-1 py-3 rounded-xl font-title bg-brawl-green text-black border-b-4 border-green-800 active:border-b-0 active:translate-y-1">VALIDER</button>
                  </div>
              </div>
          </div>
      )}

      {/* 2. REPLACED SIMPLE REWARD MODAL WITH STARR DROP */}
      {starrDrop.active && (
          <StarrDrop 
              type={starrDrop.type} 
              rewardText={starrDrop.rewardText}
              subText={starrDrop.subText}
              icon={starrDrop.icon}
              onClose={() => setStarrDrop({...starrDrop, active: false})}
          />
      )}

    </div>
  );
};

export default App;
