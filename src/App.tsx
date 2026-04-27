import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Sparkles, 
  CreditCard, 
  Layout, 
  X, 
  RefreshCw,
  Zap,
  Info,
  Layers,
  LogIn,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { CanvasControl, ShapeProps } from './components/Canvas';
import { PlanSubscription } from './components/PlanSubscription';
import { Collection } from './components/Collection';
import { DirectorMode } from './components/Director';
import { cn } from './lib/utils';
import confetti from 'canvas-confetti';
import { auth, signIn, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

type View = 'canvas' | 'pricing' | 'about' | 'collection' | 'gallery' | 'director';

export default function App() {
  const [view, setView] = useState<View>('canvas');
  const [foolAdvice, setFoolAdvice] = useState<string[]>([]);
  const [isLoadingAdvice, setLoadingAdvice] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentCanvas, setCurrentCanvas] = useState<{ id?: string, name: string, shapes: ShapeProps[] } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  const handleSave = async (shapes: ShapeProps[]) => {
    if (!user) {
      const u = await signIn();
      if (!u) return;
    }

    setIsSaving(true);
    try {
      if (currentCanvas?.id) {
        const canvasRef = doc(db, 'canvases', currentCanvas.id);
        await updateDoc(canvasRef, {
          shapes: JSON.stringify(shapes),
          updatedAt: serverTimestamp()
        });
        setCurrentCanvas({ ...currentCanvas, shapes });
      } else {
        const name = prompt('Name your masterpiece:', 'Untitled Cyber Art') || 'Untitled';
        const docRef = await addDoc(collection(db, 'canvases'), {
          name,
          shapes: JSON.stringify(shapes),
          ownerId: auth.currentUser?.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setCurrentCanvas({ id: docRef.id, name, shapes });
      }
      confetti({ particleCount: 100, spread: 50, origin: { y: 0.8 } });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'canvases');
    } finally {
      setIsSaving(false);
    }
  };

  const onEdit = (canvas: any) => {
    setCurrentCanvas({
      id: canvas.id,
      name: canvas.name,
      shapes: JSON.parse(canvas.shapes)
    });
    setView('canvas');
  };

  const onRemix = (canvas: any) => {
    setCurrentCanvas({
      name: `${canvas.name} (Remix)`,
      shapes: JSON.parse(canvas.shapes)
    });
    setView('canvas');
    confetti({ particleCount: 50, colors: ['#00D1FF'] });
  };

  const getFoolAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const res = await fetch('/api/fool-function', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: "A cyberpunk neo-brutalist masterpiece" })
      });
      const data = await res.json();
      setFoolAdvice(data);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF1D1D', '#FFB800', '#00D1FF', '#00C950', '#FF00D6']
      });
    } catch (e) {
      console.error(e);
      setFoolAdvice(["CORE OVERLOAD.", "CYBER SILENCE.", "GLITCH DETECTED."]);
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <div className="h-screen bg-pop-yellow text-black font-sans overflow-hidden flex flex-col border-8 border-black">
      {/* Header Navigation */}
      <header className="h-20 border-b-4 border-black bg-white flex items-center justify-between px-8 shadow-brutal z-30">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white p-2 border-2 border-black rotate-[-2deg] shadow-brutal-sm">
            <h1 className="text-2xl font-black italic tracking-tighter">CYBER ART</h1>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-pop-green px-2 py-1 border-2 border-black shadow-brutal-sm">v2.0_CORE</span>
        </div>
        
        <nav className="hidden md:flex gap-6 font-black uppercase text-xs">
          <button onClick={() => setView('canvas')} className={cn("hover:underline decoration-4 decoration-pop-pink transition-all", view === 'canvas' && "underline")}>Studio</button>
          <button onClick={() => setView('director')} className={cn("hover:underline decoration-4 decoration-pop-cyan transition-all", view === 'director' && "underline text-pop-cyan")}>Director</button>
          <button onClick={() => setView('gallery')} className={cn("hover:underline decoration-4 decoration-pop-green transition-all", view === 'gallery' && "underline")}>Gallery</button>
          <button onClick={() => setView('collection')} className={cn("hover:underline decoration-4 decoration-pop-cyan transition-all", view === 'collection' && "underline")}>Collection</button>
          <button onClick={() => setView('pricing')} className={cn("hover:underline decoration-4 decoration-pop-yellow transition-all", view === 'pricing' && "underline")}>Vault</button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={getFoolAdvice}
            disabled={isLoadingAdvice}
            className="bg-pop-pink border-2 border-black px-4 py-1 shadow-brutal-sm hover:translate-y-0.5 hover:shadow-none active:shadow-none font-black text-xs text-white disabled:opacity-50"
          >
            {isLoadingAdvice ? <RefreshCw className="animate-spin" size={14} /> : "THE FOOL"}
          </button>

          {user ? (
            <div className="flex items-center gap-2 border-2 border-black bg-white p-1 pr-3 brutal-shadow-sm h-10">
              <img referrerPolicy="no-referrer" src={user.photoURL || ""} alt="" className="w-7 h-7 border-2 border-black shrink-0" />
              <button onClick={() => signOut(auth)} className="text-[10px] font-black uppercase hover:text-pop-pink">LOGOUT</button>
            </div>
          ) : (
            <button onClick={signIn} className="brutal-btn bg-pop-cyan">SIGN IN</button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Tools */}
        <aside className="w-20 border-r-4 border-black bg-pop-cyan flex flex-col items-center py-6 gap-6 z-20">
          <button 
            onClick={() => { setView('canvas'); setCurrentCanvas(null); }}
            className={cn("w-12 h-12 bg-white border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-pop-yellow transition-all", view === 'canvas' && "bg-pop-yellow -translate-y-0.5 shadow-none")}
          >
             <Layout size={20} />
          </button>
          <button 
             onClick={() => setView('gallery')}
             className={cn("w-12 h-12 bg-white border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-pop-yellow transition-all", view === 'gallery' && "bg-pop-yellow -translate-y-0.5 shadow-none")}
          >
             <ImageIcon size={20} />
          </button>
          <button 
             onClick={() => setView('collection')}
             className={cn("w-12 h-12 bg-white border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-pop-yellow transition-all", view === 'collection' && "bg-pop-yellow -translate-y-0.5 shadow-none")}
          >
             <Layers size={20} />
          </button>
          <button 
             onClick={() => setView('director')}
             className={cn("w-12 h-12 bg-white border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-pop-yellow transition-all", view === 'director' && "bg-pop-yellow -translate-y-0.5 shadow-none")}
          >
             <Film size={20} />
          </button>
          <button 
             onClick={() => setView('pricing')}
             className={cn("w-12 h-12 bg-white border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-pop-yellow transition-all", view === 'pricing' && "bg-pop-yellow -translate-y-0.5 shadow-none")}
          >
             <CreditCard size={20} />
          </button>
          
          <div className="mt-auto mb-4 text-center">
             <div className="w-10 h-10 bg-black text-white flex items-center justify-center brutal-border brutal-shadow-sm">
                <span className="text-xl font-black italic">!</span>
             </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 relative overflow-auto bg-white p-8">
          <AnimatePresence mode="wait">
            {view === 'canvas' && (
              <motion.div
                key="canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <CanvasControl 
                  initialShapes={currentCanvas?.shapes} 
                  onSave={handleSave}
                  isSaving={isSaving}
                />
              </motion.div>
            )}

            {view === 'director' && (
              <motion.div
                key="director"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full"
              >
                <DirectorMode />
              </motion.div>
            )}

            {view === 'collection' && user && (
              <motion.div
                key="collection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Collection userId={user.uid} onEdit={onEdit} onRemix={onRemix} />
              </motion.div>
            )}

            {view === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="brutal-border brutal-shadow-lg p-6 bg-white space-y-4">
                    <div className={cn("h-48 border-2 border-black", i % 3 === 0 ? "bg-pop-pink" : i % 3 === 1 ? "bg-pop-cyan" : "bg-pop-green")}>
                      <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                    </div>
                    <h3 className="font-black italic">HALLUCINATION_#{i + 101}</h3>
                    <button onClick={() => setView('canvas')} className="brutal-btn w-full">REMIX_DATA</button>
                  </div>
                ))}
              </motion.div>
            )}

            {view === 'pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
              >
                <PlanSubscription />
              </motion.div>
            )}

            {view === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto py-12"
              >
                <div className="text-center mb-12">
                  <h2 className="text-6xl font-display font-black tracking-tighter mb-4 italic">CYBER ART CORE</h2>
                  <p className="text-lg text-[#495057] leading-relaxed">
                    The ultimate creative engine for digital drifters. Process pixels, glitch reality, and export for the multiverse.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12 text-left">
                  <div className="brutal-border p-6 bg-white brutal-shadow">
                    <h3 className="font-black uppercase text-sm mb-4 border-b-2 border-black pb-2">Technical Support</h3>
                    <p className="text-xs font-bold text-gray-500 mb-4">Direct uplink to the central curator for bug reports and logic sync.</p>
                    <a href="mailto:ellanovashenko@gmail.com" className="text-sm font-black text-pop-pink underline decoration-2">ellanovashenko@gmail.com</a>
                  </div>
                  <div className="brutal-border p-6 bg-black text-white brutal-shadow">
                    <h3 className="font-black uppercase text-sm mb-4 border-b-2 border-pop-cyan pb-2">Community Vault</h3>
                    <p className="text-xs font-bold text-gray-400 mb-4">Access shared assets, glitch packs, and brutalist presets.</p>
                    <button className="brutal-btn bg-pop-cyan text-black w-full text-[10px]">ACCESS_VAULT</button>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <TechBadge label="Konva 9.3" />
                  <TechBadge label="Firebase AI" />
                  <TechBadge label="Vite v6" />
                  <TechBadge label="Tailwind v4" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar - Properties & Fool Advice */}
        <aside className="hidden lg:flex w-72 border-l-4 border-black bg-white flex-col z-20">
          <div className="p-4 border-b-4 border-black bg-pop-yellow">
            <h3 className="font-black uppercase italic text-lg flex items-center gap-2">
              <Zap size={20} fill="currentColor" />
              CYBER STATUS
            </h3>
          </div>
          
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#888]">THE FOOL'S LOGIC</label>
              <div className="space-y-3">
                {foolAdvice.length > 0 ? (
                  foolAdvice.map((advice, i) => (
                    <motion.div 
                      key={i}
                      initial={{ rotate: -2, scale: 0.9, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "p-3 border-2 border-black brutal-shadow-sm font-black text-[10px] uppercase italic",
                        i === 0 ? "bg-pop-pink text-white" : i === 1 ? "bg-pop-cyan text-black" : "bg-pop-green text-black"
                      )}
                    >
                      {advice}
                    </motion.div>
                  ))
                ) : (
                  <div className="p-4 border-2 border-black border-dashed text-center text-[10px] font-bold text-gray-400">
                    SUMMON THE FOOL TO SYNC LOGIC
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <div className="p-4 bg-black text-white brutal-border brutal-shadow-lg relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="font-black italic text-pop-yellow mb-1 tracking-tighter">UPGRADE TO PRO</h4>
                  <p className="text-[9px] font-bold uppercase opacity-80 leading-tight mb-4">Unlock 3D rendering & AI Print presets</p>
                  <button onClick={() => setView('pricing')} className="w-full bg-white text-black border-2 border-black py-2 font-black uppercase text-[10px] shadow-brutal-sm hover:translate-y-0.5 hover:shadow-none active:translate-y-1">UPGRADE_NOW</button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-pop-pink rounded-full blur-[40px] opacity-30 group-hover:opacity-60 transition-all duration-700" />
              </div>
            </div>
          </div>

          <div className="p-4 border-t-4 border-black bg-black text-white">
            <div className="flex justify-between items-center text-[9px] font-bold uppercase italic tracking-widest">
              <span>{currentCanvas?.name || "UNNAMED_CORE"}</span>
              <span className="text-pop-cyan">v2.0_SYNC</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Banner */}
      <footer className="h-10 bg-white border-t-4 border-black flex items-center px-4 gap-8 z-30 overflow-hidden">
        <div className="flex gap-6 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pop-green border border-black animate-pulse shadow-[0_0_8px_#00FF00]"></div>
            <span className="text-[9px] font-black uppercase">Core Status: Stable</span>
          </div>
          <span className="text-[9px] font-black uppercase text-pop-pink">|</span>
          <div className="flex items-center gap-2 text-pop-cyan">
             <span className="text-[9px] font-black uppercase">Konva.js Engine: Live</span>
          </div>
          <span className="text-[9px] font-black uppercase text-pop-pink">|</span>
          <span className="text-[9px] font-black uppercase italic">"Design is a behavior, not a department."</span>
        </div>
      </footer>
    </div>
  );
}

function TechBadge({ label }: { label: string }) {
  return (
    <span className="px-4 py-2 bg-white brutal-border text-[10px] font-black uppercase tracking-widest text-black brutal-shadow-sm">
      {label}
    </span>
  );
}
