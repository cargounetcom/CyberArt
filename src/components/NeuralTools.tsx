import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ghost, Sparkles, MessageSquare, Image as ImageIcon, Layout, Send, RefreshCw, Download, Layers, Cat } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { generateMemeCaptions, generateComicScript, ComicScript } from '../services/geminiService';

export function NeuralTools() {
  const [activeTool, setActiveTool] = useState<'meme' | 'comic' | 'catgpt'>('meme');
  
  // Meme State
  const [memeSubject, setMemeSubject] = useState('');
  const [captions, setCaptions] = useState<string[]>([]);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState('');
  const [memeUrl, setMemeUrl] = useState('');
  const [isGeneratingMeme, setIsGeneratingMeme] = useState(false);

  // Comic State
  const [comicTopic, setComicTopic] = useState('');
  const [comicScript, setComicScript] = useState<ComicScript | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [panelImages, setPanelImages] = useState<string[]>([]);
  const [isGeneratingPanels, setIsGeneratingPanels] = useState(false);

  // CatGPT State
  const [catQuery, setCatQuery] = useState('');
  const [catImage, setCatImage] = useState('');
  const [isGeneratingCat, setIsGeneratingCat] = useState(false);

  const handleGenerateCaptions = async () => {
    if (!memeSubject.trim()) return;
    setIsGeneratingCaptions(true);
    try {
      const results = await generateMemeCaptions(memeSubject);
      setCaptions(results);
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  const handleGenerateMeme = async () => {
    if (!selectedCaption) return;
    setIsGeneratingMeme(true);
    try {
      const seed = Math.floor(Math.random() * 1000000);
      const url = `https://pollinations.ai/p/classic%20internet%20meme%20style%20image%20for%20${encodeURIComponent(memeSubject)}%20with%20bold%20white%20impact%20font%20text%20reading%20"${encodeURIComponent(selectedCaption)}"?width=1024&height=1024&seed=${seed}&nologo=true`;
      setMemeUrl(url);
    } finally {
      setIsGeneratingMeme(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!comicTopic.trim()) return;
    setIsGeneratingScript(true);
    setPanelImages([]);
    try {
      const script = await generateComicScript(comicTopic);
      setComicScript(script);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGeneratePanels = async () => {
    if (!comicScript) return;
    setIsGeneratingPanels(true);
    try {
      const images = comicScript.panels.map(panel => {
        const seed = Math.floor(Math.random() * 1000000);
        return `https://pollinations.ai/p/comic%20book%20panel%20style%20${encodeURIComponent(panel.visualDescription)}?width=512&height=512&seed=${seed}&nologo=true`;
      });
      setPanelImages(images);
    } finally {
      setIsGeneratingPanels(false);
    }
  };

  const handleCatGPT = async () => {
     if (!catQuery.trim()) return;
     setIsGeneratingCat(true);
     try {
       const seed = Math.floor(Math.random() * 1000000);
       const url = `https://pollinations.ai/p/cat%20${encodeURIComponent(catQuery)}%20hyper%20detailed%20style?width=1024&height=1024&seed=${seed}&nologo=true`;
       setCatImage(url);
     } finally {
       setIsGeneratingCat(false);
     }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="brutal-border bg-pop-pink p-12 brutal-shadow-lg text-white">
        <div className="flex items-center gap-4 mb-4">
           <Ghost size={48} className="animate-pulse" />
           <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Neural_Creative_Tools</h2>
        </div>
        <p className="max-w-2xl text-sm font-black uppercase tracking-widest opacity-80 leading-relaxed italic">
          Advanced generative modules for cultural production. Script, sketch, and deploy digital heritage panels.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-2">
         {[
           { id: 'meme', label: 'MEME_ENGINE', icon: <MessageSquare size={18} /> },
           { id: 'comic', label: 'COMIC_STORYBOARD', icon: <Layout size={18} /> },
           { id: 'catgpt', label: 'CAT_GPT_VISUALS', icon: <Cat size={18} /> }
         ].map(tool => (
           <button
             key={tool.id}
             onClick={() => setActiveTool(tool.id as any)}
             className={cn(
               "brutal-btn flex items-center gap-2 px-8 py-4 whitespace-nowrap",
               activeTool === tool.id ? "bg-black text-white" : "bg-white hover:bg-pop-yellow"
             )}
           >
             {tool.icon}
             {tool.label}
           </button>
         ))}
      </div>

      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
           {activeTool === 'meme' && (
             <motion.div
               key="meme"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-8"
             >
                <div className="space-y-6">
                   <div className="brutal-border bg-white p-8 brutal-shadow-sm space-y-4">
                      <h3 className="text-2xl font-black italic border-b-2 border-black pb-2 uppercase">Subject_Input</h3>
                      <div className="flex gap-3">
                         <input 
                           type="text"
                           value={memeSubject}
                           onChange={(e) => setMemeSubject(e.target.value)}
                           placeholder="ENTERING_SUBJECT (e.g. JavaScript debugging)..."
                           className="flex-1 brutal-border border-2 px-4 py-3 text-sm font-black uppercase outline-none focus:bg-pop-yellow transition-colors"
                         />
                         <button 
                           onClick={handleGenerateCaptions}
                           disabled={isGeneratingCaptions || !memeSubject}
                           className="brutal-btn bg-pop-cyan disabled:opacity-50"
                         >
                            {isGeneratingCaptions ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                         </button>
                      </div>

                      <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase opacity-50">GEMINI_SUGGESTED_CAPTIONS</p>
                         <div className="space-y-2">
                            {captions.map((cap, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedCaption(cap)}
                                className={cn(
                                  "w-full text-left p-3 brutal-border-sm text-xs font-bold uppercase transition-all",
                                  selectedCaption === cap ? "bg-black text-white" : "bg-gray-100 hover:bg-pop-pink hover:text-white"
                                )}
                              >
                                {cap}
                              </button>
                            ))}
                         </div>
                      </div>

                      {selectedCaption && (
                        <button 
                          onClick={handleGenerateMeme}
                          disabled={isGeneratingMeme}
                          className="w-full brutal-btn bg-pop-green py-5 font-black italic flex items-center justify-center gap-3"
                        >
                           {isGeneratingMeme ? <RefreshCw className="animate-spin" /> : <ImageIcon />}
                           GENERATE_MEME_IMAGE
                        </button>
                      )}
                   </div>
                </div>

                <div className="flex flex-col items-center justify-center brutal-border bg-gray-100 relative group min-h-[400px]">
                   {memeUrl ? (
                     <div className="w-full h-full p-8 flex flex-col items-center">
                        <div className="brutal-border bg-white p-2 brutal-shadow-sm relative max-w-md w-full">
                           <img src={memeUrl} className="w-full aspect-square object-cover" alt="Meme Output" />
                           <div className="absolute top-4 left-4 right-4 text-center">
                              <p className="text-white font-black uppercase text-2xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)] tracking-tighter"></p>
                           </div>
                        </div>
                        <div className="mt-8 flex gap-4">
                           <a 
                             href={memeUrl}
                             download="meme.png"
                             target="_blank"
                             rel="noopener noreferrer"
                             className="brutal-btn bg-black text-white px-8 py-3"
                           >
                              DOWNLOAD
                           </a>
                        </div>
                     </div>
                   ) : (
                     <div className="text-center space-y-4 py-20 px-8">
                        <MessageSquare size={64} className="mx-auto opacity-20" />
                        <p className="text-xs font-black uppercase opacity-50 italic">MEME_PREVIEW_PENDING_GENERATION</p>
                     </div>
                   )}
                </div>
             </motion.div>
           )}

           {activeTool === 'comic' && (
             <motion.div
               key="comic"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-8"
             >
                <div className="brutal-border bg-white p-8 brutal-shadow-sm flex flex-col md:flex-row gap-6 items-end">
                   <div className="flex-1 space-y-2">
                      <p className="text-[10px] font-black uppercase opacity-50 italic">STORYBOARD_TOPIC</p>
                      <input 
                        type="text"
                        value={comicTopic}
                        onChange={(e) => setComicTopic(e.target.value)}
                        placeholder="ENTER_EPIC_TALE (e.g. The first cat on Mars)..."
                        className="w-full brutal-border border-2 px-6 py-4 text-lg font-black uppercase outline-none focus:bg-pop-yellow transition-colors"
                      />
                   </div>
                   <button 
                     onClick={handleGenerateScript}
                     disabled={isGeneratingScript || !comicTopic}
                     className="brutal-btn bg-pop-cyan py-4 px-10 font-black italic flex items-center gap-3 disabled:opacity-50"
                   >
                     {isGeneratingScript ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                     GENERATE_SCRIPT
                   </button>
                </div>

                {comicScript && (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                     {comicScript.panels.map((panel, idx) => (
                       <div key={idx} className="brutal-border bg-white flex flex-col min-h-[400px]">
                          <div className="p-4 bg-black text-white flex justify-between items-center">
                             <span className="text-xs font-black">PANEL_{panel.panelNumber}</span>
                             <Layers size={14} />
                          </div>
                          
                          <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden min-h-[250px]">
                             {panelImages[idx] ? (
                               <img src={panelImages[idx]} className="w-full h-full object-cover brutal-border-sm" alt={`Panel ${idx + 1}`} />
                             ) : (
                               <div className="text-center opacity-20">
                                  <ImageIcon size={48} className="mx-auto" />
                                  <p className="text-[8px] font-black uppercase mt-2">Render_Pending</p>
                               </div>
                             )}
                          </div>

                          <div className="p-6 space-y-4 border-t-2 border-black bg-pop-cyan/5">
                             <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase opacity-50">CAPTION</p>
                                <p className="text-[10px] font-bold leading-tight uppercase">{panel.caption}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase text-pop-pink italic">DIALOGUE</p>
                                <p className="text-[11px] font-black italic leading-tight uppercase leading-relaxed">"{panel.dialogue}"</p>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
                )}

                {comicScript && (
                   <div className="flex justify-center">
                      <button 
                        onClick={handleGeneratePanels}
                        disabled={isGeneratingPanels}
                        className="brutal-btn bg-pop-pink text-white px-12 py-5 text-xl font-black italic flex items-center gap-4 hover:bg-black transition-all"
                      >
                        {isGeneratingPanels ? <RefreshCw className="animate-spin" /> : <Send />}
                        VISUALIZE_ALL_PANELS
                      </button>
                   </div>
                )}
             </motion.div>
           )}

           {activeTool === 'catgpt' && (
             <motion.div
                key="catgpt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
             >
                <div className="brutal-border bg-white p-8 brutal-shadow-sm space-y-6">
                   <div className="flex items-center gap-3 text-pop-cyan">
                      <Cat size={32} />
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">CAT_GPT_INTEGRATION</h3>
                   </div>
                   <p className="text-xs font-bold uppercase leading-relaxed opacity-70">
                      Accessing the decentralized CatGPT visual network. Enter a scenario and let the feline spirits manifest via neural pollination.
                   </p>
                   
                   <div className="space-y-4">
                      <textarea 
                        value={catQuery}
                        onChange={(e) => setCatQuery(e.target.value)}
                        placeholder="CAT_SCENARIO (e.g. eating pizza in a cyberpunk alleyway)..."
                        className="w-full brutal-border border-2 p-6 h-40 text-sm font-black uppercase outline-none focus:bg-pop-yellow transition-colors resize-none"
                      />
                      <button 
                        onClick={handleCatGPT}
                        disabled={isGeneratingCat || !catQuery}
                        className="w-full brutal-btn bg-pop-cyan py-5 text-xl font-black italic flex items-center justify-center gap-4 disabled:opacity-50"
                      >
                         {isGeneratingCat ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                         INJECT_CAT_GHOST
                      </button>
                   </div>
                </div>

                <div className="brutal-border bg-black brutal-shadow-lg flex items-center justify-center overflow-hidden min-h-[500px]">
                   {catImage ? (
                      <div className="w-full h-full p-8 flex flex-col items-center gap-6">
                         <div className="brutal-border bg-white p-2 brutal-shadow-lg max-w-md w-full animate-in zoom-in slide-in-from-bottom duration-500">
                            <img src={catImage} className="w-full aspect-square object-cover" alt="Cat Output" />
                         </div>
                         <a 
                           href={catImage}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="brutal-btn bg-pop-cyan text-black px-10 py-3"
                         >
                            EXTRACT_HQ_ASSET
                         </a>
                      </div>
                   ) : (
                      <div className="text-center space-y-4 p-20 opacity-30">
                         <Cat size={80} className="mx-auto text-white" />
                         <p className="text-xs font-black uppercase text-white italic">WAITING_FOR_FELINE_UPLINK...</p>
                      </div>
                   )}
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </div>
  );
}
