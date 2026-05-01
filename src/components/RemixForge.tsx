import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Layers, 
  Image as ImageIcon,
  ChevronRight,
  Maximize2,
  Trash2,
  Plus,
  Wand2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { remixPrompt, analyzeAsset } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface RemixForgeProps {
  initialImage?: string;
  initialPrompt?: string;
  onImportToStudio?: (item: { imageUrl: string, title: string, suggestedStyle?: string }) => void;
}

export function RemixForge({ initialImage = '', initialPrompt = '', onImportToStudio }: RemixForgeProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [remixInstruction, setRemixInstruction] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvolution, setIsEvolution] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:5'>('1:1');
  const [style, setStyle] = useState('Cyberpunk');
  
  const [results, setResults] = useState<{ url: string, prompt: string, timestamp: number }[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(initialImage || null);
  
  const user = auth.currentUser;

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialImage) {
      setPreviewUrl(initialImage);
      setActiveImage(initialImage);
    }
  }, [initialPrompt, initialImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setActiveImage(url);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt && !remixInstruction && !previewUrl) return;

    setIsGenerating(true);
    try {
      let baseDescription = prompt;
      
      // If we have an image but no prompt, analyze the image first
      if (previewUrl && !prompt) {
        setIsEvolution(true);
        baseDescription = await analyzeAsset(previewUrl);
        setPrompt(baseDescription);
      }

      let finalPrompt = baseDescription;
      
      if (remixInstruction) {
        finalPrompt = await remixPrompt(baseDescription || "Empty Seed", remixInstruction);
        setPrompt(finalPrompt);
        setRemixInstruction('');
      }

      const seed = Math.floor(Math.random() * 9999999);
      const styleFocus = `, in ${style} aesthetic, cinematic lighting, 8k, futuristic textures, brutalist composition`;
      
      // Determine dimensions
      let width = 1024;
      let height = 1024;
      if (aspectRatio === '16:9') { width = 1280; height = 720; }
      else if (aspectRatio === '4:5') { width = 800; height = 1000; }

      const url = `https://pollinations.ai/p/${encodeURIComponent(finalPrompt + styleFocus)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
      
      // Pre-fetching image to avoid flicker
      const img = new Image();
      img.src = url;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if error
      });

      const newResult = { url, prompt: finalPrompt, timestamp: Date.now() };
      setResults(prev => [newResult, ...prev].slice(0, 10));
      setActiveImage(url);
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToLocker = async (url: string, p: string) => {
    if (!user) {
      alert("PLEASE_CONNECT_FOR_VAULT_DEPOSIT");
      return;
    }
    try {
      await addDoc(collection(db, 'locker'), {
        title: p.substring(0, 30) + '...',
        category: 'NEURAL_RENDER',
        content: url, // Storing URL as content for render types
        ownerId: user.uid,
        accessTier: 'private',
        createdAt: serverTimestamp()
      });
      alert("ASSET_SECURED_IN_VAULT");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'locker');
    }
  };

  const STYLES = ['Cyberpunk', 'Neo-Brutalist', 'Vaporwave', 'Ghibli', 'Synthwave', 'Dark Fantasy', 'Minimalist', 'Anime'];
  const RATIOS = [
    { label: '1:1', value: '1:1', icon: <div className="w-3 h-3 border-2 border-current" /> },
    { label: '16:9', value: '16:9', icon: <div className="w-5 h-3 border-2 border-current" /> },
    { label: '4:5', value: '4:5', icon: <div className="w-3 h-4 border-2 border-current" /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full gap-8 pb-12">
      {/* Control Panel */}
      <aside className="w-full lg:w-96 flex flex-col gap-6">
        <div className="brutal-border bg-white p-6 brutal-shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-black pb-4">
             <Zap className="text-pop-yellow" fill="currentColor" />
             <h2 className="text-2xl font-black italic uppercase italic">REMIX_FORGE</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#888]">NEURAL_SEED_IMAGE</label>
              <div className="flex gap-2">
                <div className="flex-1 relative brutal-border-sm bg-gray-50 h-24 overflow-hidden group">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Seed" />
                      <button 
                        onClick={() => { setPreviewUrl(null); setImageFile(null); }}
                        className="absolute top-1 right-1 bg-black text-white p-1 brutal-border-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <Trash2 size={12} />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-pop-yellow/10 transition-colors">
                      <ImageIcon className="opacity-30 mb-1" size={24} />
                      <span className="text-[8px] font-black uppercase opacity-40">UPLOAD_IMG</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                <div className="w-24 brutal-border-sm bg-black text-white p-3 flex flex-col items-center justify-center text-center gap-1">
                   <Lock size={16} className="text-pop-cyan" />
                   <span className="text-[7px] font-black uppercase">ENCRYPTED_SEED</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#888]">NEURAL_PROMPT</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision..."
                className="w-full h-32 brutal-border p-4 text-xs font-bold focus:bg-pop-yellow/5 outline-none resize-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-pop-pink">EVOLVE_INSTRUCTION (REMIX)</label>
              <div className="relative">
                <Wand2 className="absolute left-3 top-3 opacity-30" size={16} />
                <input 
                  value={remixInstruction}
                  onChange={(e) => setRemixInstruction(e.target.value)}
                  placeholder="e.g. Make it more neon & rainy"
                  className="w-full pl-10 pr-4 py-3 brutal-border-sm text-xs font-bold outline-none focus:bg-pop-pink/5"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t-2 border-black/5">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#888]">ASPECT_RATIO</label>
                <div className="grid grid-cols-3 gap-2">
                  {RATIOS.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setAspectRatio(r.value as any)}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 brutal-border-sm text-[10px] font-black transition-all",
                        aspectRatio === r.value ? "bg-black text-white" : "bg-gray-50 hover:bg-pop-yellow"
                      )}
                    >
                      {r.icon}
                      {r.label}
                    </button>
                  ))}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#888]">VISUAL_STYLE</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(s => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={cn(
                        "px-3 py-1.5 brutal-border-sm text-[9px] font-black uppercase transition-all",
                        style === s ? "bg-pop-pink text-white" : "bg-gray-100 hover:bg-pop-cyan"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <button 
            onClick={() => handleGenerate()}
            disabled={isGenerating || (!prompt && !remixInstruction)}
            className="w-full brutal-btn bg-pop-green py-5 text-lg font-black flex items-center justify-center gap-3 disabled:opacity-50"
          >
             {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
             {remixInstruction ? "EVOLVE_NEURAL_SEED" : "GENERATE_ASSET"}
          </button>
        </div>

        <div className="brutal-border bg-black text-white p-6 brutal-shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <Lock className="text-pop-pink" size={16} />
              <span className="text-[10px] font-black uppercase italic text-pop-pink">Secure_Neural_Node</span>
           </div>
           <p className="text-[10px] font-bold opacity-60 leading-relaxed italic">
             All generations are processed via decentralized neural clusters. Use "REMIX" to evolve existing patterns into hyper-detailed artifacts.
           </p>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col gap-6">
        <div className="flex-1 brutal-border bg-gray-100 flex items-center justify-center relative overflow-hidden min-h-[500px]">
           <AnimatePresence mode="wait">
             {isGenerating ? (
               <motion.div 
                 key="loading"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="flex flex-col items-center gap-4 z-10"
               >
                  <RefreshCw className="animate-spin text-pop-pink" size={48} />
                  <p className="text-xs font-black uppercase italic tracking-widest">MANIFESTING_PIXELS...</p>
               </motion.div>
             ) : activeImage ? (
               <motion.div 
                 key="image"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="w-full h-full p-4 flex flex-col"
               >
                  <div className="flex-1 relative group bg-white brutal-border brutal-shadow-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={activeImage} 
                      className="max-w-full max-h-full object-contain" 
                      alt="Evolution Output" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                       <button 
                         onClick={() => setActiveImage(activeImage)}
                         className="brutal-btn bg-white text-black text-xs font-black p-3"
                       >
                          <Maximize2 size={16} />
                       </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-4 items-center justify-between">
                     <div className="flex gap-4">
                        <button 
                          onClick={() => saveToLocker(activeImage, prompt)}
                          className="brutal-btn bg-pop-cyan flex items-center gap-2"
                        >
                           <Lock size={16} />
                           SAVE_TO_VAULT
                        </button>
                        <button 
                           onClick={() => onImportToStudio?.({ 
                            imageUrl: activeImage, 
                            title: prompt, 
                            suggestedStyle: style 
                          })}
                           className="brutal-btn bg-pop-yellow flex items-center gap-2"
                        >
                           <Layers size={16} />
                           IMPORT_TO_STUDIO
                        </button>
                     </div>
                     <div className="flex gap-2">
                        <a 
                          href={activeImage} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-3 brutal-border-sm bg-gray-200 hover:bg-black hover:text-white transition-all"
                        >
                          <Download size={18} />
                        </a>
                     </div>
                  </div>
               </motion.div>
             ) : (
               <div className="text-center space-y-4 opacity-20">
                  <ImageIcon size={120} className="mx-auto" />
                  <p className="text-xl font-black uppercase italic">Neural_Awaiting_Input</p>
               </div>
             )}
           </AnimatePresence>

           {/* Glitch Overlay */}
           <div className="absolute top-0 left-0 w-full h-[2px] bg-pop-pink/20 animate-glitch-line pointer-events-none" />
           <div className="absolute top-0 right-0 w-[1px] h-full bg-pop-cyan/20 animate-glitch-line-v pointer-events-none" />
        </div>

        {/* Results Bar */}
        <div className="h-32 brutal-border bg-white p-4 flex gap-4 overflow-x-auto">
           {results.length > 0 ? (
             results.map((res, i) => (
               <button
                 key={res.timestamp}
                 onClick={() => {
                   setActiveImage(res.url);
                   setPrompt(res.prompt);
                 }}
                 className={cn(
                   "h-full Aspect-square brutal-border-sm overflow-hidden shrink-0 transition-transform active:scale-95",
                   activeImage === res.url ? "ring-4 ring-pop-pink border-pop-pink -translate-y-1" : "hover:scale-105"
                 )}
               >
                 <img src={res.url} className="w-full h-full object-cover" alt={`History ${i}`} />
               </button>
             ))
           ) : (
             <div className="w-full h-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                <p className="text-[10px] font-black uppercase opacity-30 italic">No_Evolution_History</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
