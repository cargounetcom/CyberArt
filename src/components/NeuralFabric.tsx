import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shirt, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Camera,
  Layers,
  Wand2,
  Lock,
  ChevronRight,
  Info,
  Zap,
  Trash2,
  Image as ImageIcon,
  Palette
} from 'lucide-react';
import { cn } from '../lib/utils';
import { analyzeAsset, changeOutfitPrompt } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function NeuralFabric() {
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [newOutfitStyle, setNewOutfitStyle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [history, setHistory] = useState<{url: string, style: string}[]>([]);
  
  const user = auth.currentUser;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPersonImage(url);
      setResultImage(null);
      setDescription('');
    }
  };

  const handleAnalyzeAndChange = async () => {
    if (!personImage || !newOutfitStyle) return;

    setIsGenerating(true);
    try {
      let currentDesc = description;
      
      // Step 1: Analyze if no description exists
      if (!currentDesc) {
        setIsAnalyzing(true);
        currentDesc = await analyzeAsset(personImage);
        setDescription(currentDesc);
        setIsAnalyzing(false);
      }

      // Step 2: Gemini generates the new outfit prompt
      const finalPrompt = await changeOutfitPrompt(currentDesc, newOutfitStyle);
      
      // Step 3: Generate the image
      const seed = Math.floor(Math.random() * 8888888);
      const url = `https://pollinations.ai/p/${encodeURIComponent(finalPrompt + ", cinematic lighting, 8k, realistic fabrics, futuristic fashion photography")}?width=1024&height=1024&seed=${seed}&nologo=true`;
      
      // Preload
      const img = new Image();
      img.src = url;
      await new Promise(r => img.onload = r);

      setResultImage(url);
      setHistory(prev => [{url, style: newOutfitStyle}, ...prev].slice(0, 5));
    } catch (error) {
      console.error("Fabric Resynthesis Failed", error);
    } finally {
      setIsGenerating(false);
      setIsAnalyzing(false);
    }
  };

  const saveToVault = async () => {
    if (!resultImage || !user) return;
    try {
      await addDoc(collection(db, 'locker'), {
        title: `Outfitted_${newOutfitStyle.substring(0, 20)}`,
        category: 'FABRIC_TRANSFORM',
        content: resultImage,
        ownerId: user.uid,
        accessTier: 'private',
        createdAt: serverTimestamp()
      });
      alert("FASHION_ASSET_SECURED");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'locker');
    }
  };

  const PRESETS = [
    'Military Cybernetic Exoskeleton',
    'Neon-Latex Streetwear',
    'Brutalist Chrome Armor',
    'Holographic Kimono',
    'Techwear Monk Robes',
    'Liquid Metal Evening Gown'
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full gap-8 pb-12">
      {/* Sidebar Controls */}
      <aside className="w-full lg:w-96 flex flex-col gap-6">
        <div className="brutal-border bg-white p-6 brutal-shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-black pb-4">
             <Shirt className="text-pop-cyan" fill="currentColor" />
             <h2 className="text-2xl font-black italic uppercase italic">FABRIC_NODE</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#888]">Person_Reference</label>
              <div className="relative brutal-border aspect-square bg-gray-50 overflow-hidden group">
                {personImage ? (
                  <>
                    <img src={personImage} className="w-full h-full object-cover" alt="Source" />
                    <button 
                      onClick={() => setPersonImage(null)}
                      className="absolute top-2 right-2 p-2 bg-black text-white brutal-border-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-pop-cyan/5 transition-colors">
                    <Camera size={32} className="opacity-20 mb-2" />
                    <span className="text-xs font-black uppercase opacity-40">Upload_Source_Identity</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-pop-pink">Target_Outfit_Style</label>
              <div className="relative">
                <Palette className="absolute left-3 top-3 opacity-30" size={16} />
                <input 
                  value={newOutfitStyle}
                  onChange={(e) => setNewOutfitStyle(e.target.value)}
                  placeholder="Describe the new gear..."
                  className="w-full pl-10 pr-4 py-3 brutal-border-sm text-xs font-bold outline-none focus:bg-pop-pink/5"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
               {PRESETS.map(p => (
                 <button
                   key={p}
                   onClick={() => setNewOutfitStyle(p)}
                   className={cn(
                     "px-2 py-1 brutal-border-sm text-[8px] font-black uppercase transition-all",
                     newOutfitStyle === p ? "bg-pop-pink text-white" : "bg-gray-100 hover:bg-pop-cyan"
                   )}
                 >
                   {p}
                 </button>
               ))}
            </div>
          </div>

          <button 
            onClick={handleAnalyzeAndChange}
            disabled={isGenerating || !personImage || !newOutfitStyle}
            className="w-full brutal-btn bg-black text-white py-5 text-lg font-black flex items-center justify-center gap-3 disabled:opacity-50"
          >
             {isGenerating ? <RefreshCw className="animate-spin text-pop-cyan" /> : <Zap className="text-pop-yellow" />}
             {isAnalyzing ? "ANALYZING_FABRIC..." : isGenerating ? "TRANSFORMING..." : "RESYNTHESIZE_FABRIC"}
          </button>
        </div>

        <div className="brutal-border bg-pop-yellow p-6 brutal-shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <Info size={16} />
              <span className="text-[10px] font-black uppercase italic">Neural_Protocol</span>
           </div>
           <p className="text-[10px] font-bold leading-relaxed italic opacity-80">
             The Fabric Resynthesizer preserves facial nodes while shifting atomic clothing structures. Best results with clear, full-body reference images.
           </p>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col gap-6">
        <div className="flex-1 brutal-border bg-white flex items-center justify-center relative overflow-hidden min-h-[600px] brutal-shadow-lg">
           <AnimatePresence mode="wait">
             {isGenerating ? (
               <motion.div 
                 key="loading"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="flex flex-col items-center gap-4 z-10"
               >
                  <RefreshCw className="animate-spin text-black" size={48} />
                  <p className="text-xs font-black uppercase italic tracking-widest bg-pop-pink text-white px-4 py-1">Atomic_Fabric_Shifting...</p>
               </motion.div>
             ) : resultImage ? (
               <motion.div 
                 key="image"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="w-full h-full p-4 flex flex-col"
               >
                  <div className="flex-1 relative group bg-white brutal-border brutal-shadow-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={resultImage} 
                      className="max-w-full max-h-full object-contain" 
                      alt="Fabric Evolution" 
                    />
                    <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-[10px] font-black uppercase italic">
                      NEURAL_FIT_v4.0
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-4 items-center">
                    <button 
                      onClick={saveToVault}
                      className="flex-1 brutal-btn bg-pop-green flex items-center justify-center gap-2"
                    >
                       <Lock size={16} />
                       SECURE_ASSET_IN_VAULT
                    </button>
                    <a 
                      href={resultImage} 
                      download 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-3 brutal-border-sm bg-black text-white hover:bg-pop-pink transition-all"
                    >
                      <Download size={20} />
                    </a>
                  </div>
               </motion.div>
             ) : (
               <div className="text-center space-y-4">
                  <Shirt size={120} className="mx-auto opacity-10" />
                  <p className="text-xl font-black uppercase italic opacity-20">Awaiting_Neural_TryOn</p>
               </div>
             )}
           </AnimatePresence>

           {/* Stylized Scanline */}
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]" />
        </div>

        {/* Style History */}
        <div className="h-32 brutal-border bg-black p-4 flex gap-4 overflow-x-auto">
           {history.length > 0 ? (
             history.map((h, i) => (
               <button
                 key={i}
                 onClick={() => setResultImage(h.url)}
                 className={cn(
                   "h-full Aspect-square brutal-border-sm overflow-hidden shrink-0 transition-transform relative group",
                   resultImage === h.url ? "ring-4 ring-pop-cyan -translate-y-1" : "hover:scale-105"
                 )}
               >
                 <img src={h.url} className="w-full h-full object-cover" alt={`History ${i}`} />
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-end p-1 transition-opacity">
                    <span className="text-[6px] font-black uppercase text-white truncate">{h.style}</span>
                 </div>
               </button>
             ))
           ) : (
             <div className="w-full h-full border-2 border-dashed border-white/20 flex items-center justify-center">
                <p className="text-[10px] font-black uppercase text-white opacity-30 italic">No_Fabric_History</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
