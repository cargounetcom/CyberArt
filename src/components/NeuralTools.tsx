import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ghost, Sparkles, MessageSquare, Image as ImageIcon, Layout, Send, RefreshCw, Download, Layers, Cat, Wand2, Maximize2, Palette, Mountain, Video } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { 
  generateMemeCaptions, 
  generateComicScript, 
  ComicScript, 
  analyzeAsset, 
  changeBackgroundPrompt, 
  recolorAssetPrompt, 
  upscaleRefinePrompt 
} from '../services/geminiService';

interface NeuralToolsProps {
  onImport?: (item: { imageUrl: string, title: string, suggestedStyle?: string }) => void;
}

export function NeuralTools({ onImport }: NeuralToolsProps) {
  const [activeTool, setActiveTool] = useState<'meme' | 'comic' | 'catgpt' | 'bg' | 'upscale' | 'recolor' | 'video'>('meme');
  
  // Existing States...
  const [memeSubject, setMemeSubject] = useState('');
  const [captions, setCaptions] = useState<string[]>([]);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState('');
  const [memeUrl, setMemeUrl] = useState('');
  const [isAnime, setIsAnime] = useState(false);
  const [isGeneratingMeme, setIsGeneratingMeme] = useState(false);

  const [comicTopic, setComicTopic] = useState('');
  const [comicScript, setComicScript] = useState<ComicScript | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [panelImages, setPanelImages] = useState<string[]>([]);
  const [isGeneratingPanels, setIsGeneratingPanels] = useState(false);

  const [catQuery, setCatQuery] = useState('');
  const [catImage, setCatImage] = useState('');
  const [isGeneratingCat, setIsGeneratingCat] = useState(false);

  // New Tool States
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [description, setDescription] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSourceImage(url);
      setProcessingResult(null);
      setDescription('');
    }
  };

  const handleProcessImage = async (mode: 'bg' | 'recolor' | 'upscale' | 'video') => {
    if (!sourceImage) return;
    setIsProcessing(true);
    try {
      let currentDesc = description;
      if (!currentDesc) {
        currentDesc = await analyzeAsset(sourceImage);
        setDescription(currentDesc);
      }

      let finalPrompt = "";
      if (mode === 'bg') {
        finalPrompt = await changeBackgroundPrompt(currentDesc, inputVal || "Cyberpunk Neon Cityscape");
      } else if (mode === 'recolor' || mode === 'video') {
        finalPrompt = await recolorAssetPrompt(currentDesc, inputVal || "Acid Green and Deep Purple");
      } else if (mode === 'upscale') {
        finalPrompt = await upscaleRefinePrompt(currentDesc);
      }

      const seed = Math.floor(Math.random() * 999999);
      const url = `https://pollinations.ai/p/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
      
      const img = new Image();
      img.src = url;
      await new Promise(r => img.onload = r);
      setProcessingResult(url);
    } catch (error) {
      console.error("Processing Failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateCaptions = async () => {
    if (!memeSubject.trim()) return;
    setIsGeneratingCaptions(true);
    setMemeUrl('');
    setSelectedCaption('');
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
    // Add a tiny delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      const seed = Math.floor(Math.random() * 1000000);
      const styleSuffix = isAnime ? "rendered in high quality anime aesthetic, vibrant colors, clean lines, cinematic anime lighting" : "highly detailed, 8k resolution, cinematic lighting, professional photography style";
      const url = `https://image.pollinations.ai/prompt/meme%20base%20image%20of%20${encodeURIComponent(memeSubject)}%20${encodeURIComponent(styleSuffix)}?width=1024&height=1024&seed=${seed}&nologo=true`;
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
           { id: 'catgpt', label: 'CAT_GPT', icon: <Cat size={18} /> },
           { id: 'bg', label: 'BG_EXCHANGE', icon: <Mountain size={18} /> },
           { id: 'upscale', label: 'NEURAL_UPSCALE', icon: <Maximize2 size={18} /> },
           { id: 'recolor', label: 'IMG_RECOLOR', icon: <Palette size={18} /> },
           { id: 'video', label: 'VIDEO_RECOLOR', icon: <Video size={18} /> }
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
                      <h3 className="text-2xl font-black italic border-b-2 border-black pb-2 uppercase text-pop-pink">Phase_01: Ideation</h3>
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
                        <div className="space-y-4">
                           <div className="flex gap-4">
                              <button 
                                onClick={() => setIsAnime(false)}
                                className={cn(
                                  "flex-1 brutal-border-sm py-2 text-[10px] font-black uppercase italic transition-all",
                                  !isAnime ? "bg-black text-white" : "bg-gray-100"
                                )}
                              >
                                STANDARD_RENDER
                              </button>
                              <button 
                                onClick={() => setIsAnime(true)}
                                className={cn(
                                  "flex-1 brutal-border-sm py-2 text-[10px] font-black uppercase italic transition-all",
                                  isAnime ? "bg-pop-pink text-white" : "bg-gray-100"
                                )}
                              >
                                ANIME_PROTOCOL
                              </button>
                           </div>
                           <button 
                             onClick={handleGenerateMeme}
                             disabled={isGeneratingMeme}
                             className="w-full brutal-btn bg-pop-green py-5 font-black italic flex items-center justify-center gap-3"
                           >
                              {isGeneratingMeme ? <RefreshCw className="animate-spin" /> : <ImageIcon />}
                              GENERATE_NEURAL_BASE
                           </button>
                        </div>
                      )}
                   </div>
                </div>

                <div className="flex flex-col items-center justify-center brutal-border bg-gray-100 relative group min-h-[400px]">
                   {memeUrl ? (
                     <div className="w-full h-full p-8 flex flex-col items-center">
                        <div className="brutal-border bg-white p-2 brutal-shadow-sm relative max-w-md w-full overflow-hidden">
                           <img src={memeUrl} className="w-full aspect-square object-cover" alt="Meme Output" />
                           <div className="absolute top-6 left-4 right-4 text-center">
                              <p className="text-white font-black uppercase text-2xl drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-tighter leading-tight">
                                {selectedCaption}
                              </p>
                           </div>
                           <div className="absolute bottom-6 left-4 right-4 text-center">
                              <p className="text-white font-black uppercase text-2xl drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-tighter leading-tight">
                                {selectedCaption}
                              </p>
                           </div>
                        </div>
                        <div className="mt-8 flex gap-4 w-full justify-center">
                           <a 
                             href={memeUrl}
                             download="meme.png"
                             target="_blank"
                             rel="noopener noreferrer"
                             className="brutal-btn bg-black text-white px-8 py-3"
                           >
                              DOWNLOAD
                           </a>
                           <button 
                             onClick={() => onImport?.({
                               imageUrl: memeUrl,
                               title: selectedCaption,
                               suggestedStyle: 'MEME_ENGINE_V2'
                             })}
                             className="brutal-btn bg-pop-yellow px-8 py-3 font-black flex items-center gap-2"
                           >
                              <Layers size={18} />
                              IMPORT_TO_STUDIO
                           </button>
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
                             <div className="flex flex-col">
                               <span className="text-[10px] font-black leading-none">PANEL_{panel.panelNumber}</span>
                               <span className="text-[8px] font-bold opacity-50">STORY_NODE_{idx}</span>
                             </div>
                             <button
                               onClick={() => onImport?.({
                                 imageUrl: panelImages[idx],
                                 title: `Comic Panel ${panel.panelNumber}: ${panel.caption}`,
                                 suggestedStyle: 'COMIC_STORYBOARD'
                               })}
                               disabled={!panelImages[idx]}
                               className="p-2 hover:bg-pop-pink transition-colors rounded-sm disabled:opacity-30"
                               title="Import this panel to Studio"
                             >
                                <Download size={14} />
                             </button>
                          </div>
                          
                          <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden min-h-[250px]">
                             {panelImages[idx] ? (
                                <div className="relative group w-full h-full">
                                  <img src={panelImages[idx]} className="w-full h-full object-cover brutal-border-sm" alt={`Panel ${idx + 1}`} />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <button 
                                       onClick={() => onImport?.({
                                         imageUrl: panelImages[idx],
                                         title: panel.caption,
                                         suggestedStyle: 'COMIC_STORYBOARD'
                                       })}
                                       className="brutal-btn-sm bg-pop-cyan text-xs font-black"
                                     >
                                        EXTRACT_PANEL
                                     </button>
                                  </div>
                                </div>
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
                                <div className="relative">
                                   <MessageSquare className="absolute -left-1 -top-1 opacity-10" size={32} />
                                   <p className="text-[11px] font-black italic leading-tight uppercase leading-relaxed relative z-10">"{panel.dialogue}"</p>
                                </div>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
                )}

                {comicScript && (
                   <div className="flex justify-center gap-6">
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
                <div className="space-y-6">
                   <div className="brutal-border bg-white p-8 brutal-shadow-sm space-y-6">
                      <div className="flex items-center gap-3 text-pop-cyan">
                         <Cat size={32} />
                         <h3 className="text-3xl font-black italic uppercase tracking-tighter">CAT_GPT_INTEGRATION</h3>
                      </div>
                      <p className="text-xs font-bold uppercase leading-relaxed opacity-70">
                         Accessing the decentralized CatGPT visual network. Enter a scenario and let the feline spirits manifest via neural pollination.
                      </p>
                      
                      <div className="space-y-4">
                         <div className="flex gap-3">
                            <input 
                              type="text"
                              value={catQuery}
                              onChange={(e) => setCatQuery(e.target.value)}
                              placeholder="CAT_SPECIFICATION (e.g. Cyberpunk cat in a spacesuit)..."
                              className="flex-1 brutal-border border-2 px-4 py-3 text-sm font-black uppercase outline-none focus:bg-pop-yellow transition-colors"
                            />
                            <button 
                              onClick={handleCatGPT}
                              disabled={isGeneratingCat || !catQuery}
                              className="brutal-btn bg-pop-cyan disabled:opacity-50"
                            >
                               {isGeneratingCat ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                            </button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {['Cyberpunk', 'Renaissance', 'Synthwave', 'Abstract', 'Ukiyo-e'].map(style => (
                              <button 
                                key={style}
                                onClick={() => setCatQuery(prev => `${prev} in ${style} style`.trim())}
                                className="text-[8px] font-black uppercase px-2 py-1 brutal-border-sm bg-gray-100 hover:bg-pop-yellow"
                              >
                                +{style}
                              </button>
                            ))}
                         </div>
                         <button 
                           onClick={handleCatGPT}
                           disabled={isGeneratingCat || !catQuery}
                           className="w-full brutal-btn bg-pop-cyan py-5 text-xl font-black italic flex items-center justify-center gap-4 disabled:opacity-50 mt-4"
                         >
                            {isGeneratingCat ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                            INJECT_CAT_GHOST
                         </button>
                      </div>
                   </div>
                </div>

                <div className="brutal-border bg-gray-900 brutal-shadow-lg flex items-center justify-center overflow-hidden min-h-[500px]">
                   {catImage ? (
                      <div className="w-full h-full p-8 flex flex-col items-center gap-6">
                         <div className="brutal-border bg-white p-2 brutal-shadow-lg max-w-md w-full animate-in zoom-in slide-in-from-bottom duration-500 relative group">
                            <img src={catImage} className="w-full aspect-square object-cover" alt="Cat Output" />
                            <div className="absolute inset-0 bg-pop-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                               <p className="text-[10px] font-black text-black bg-white px-2 py-1 brutal-border-sm">VALIDATED_BY_CAT_GPT</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <a 
                              href={catImage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="brutal-btn bg-pop-cyan text-black px-10 py-3 font-black"
                            >
                               EXTRACT_HQ_ASSET
                            </a>
                            <button 
                              onClick={() => onImport?.({
                                imageUrl: catImage,
                                title: catQuery,
                                suggestedStyle: 'CAT_GPT_SPEC'
                              })}
                              className="brutal-btn bg-white text-black px-6 py-3 font-black flex items-center gap-2"
                            >
                               <Layers size={18} />
                               IMPORT
                            </button>
                         </div>
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

           {/* New Tools */}
           {(activeTool === 'bg' || activeTool === 'recolor' || activeTool === 'upscale' || activeTool === 'video') && (
             <motion.div
               key={activeTool}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="grid grid-cols-1 lg:grid-cols-2 gap-10"
             >
                <div className="space-y-6">
                   <div className="brutal-border bg-white p-10 brutal-shadow-sm space-y-8">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-black text-white brutal-border-sm">
                            {activeTool === 'bg' && <Mountain size={28} />}
                            {activeTool === 'upscale' && <Maximize2 size={28} />}
                            {activeTool === 'recolor' && <Palette size={28} />}
                            {activeTool === 'video' && <Video size={28} />}
                         </div>
                         <div>
                            <h3 className="text-3xl font-black italic uppercase">
                               {activeTool === 'bg' && 'Background_Exchange'}
                               {activeTool === 'upscale' && 'Neural_Upscaler'}
                               {activeTool === 'recolor' && 'Asset_Recoloring'}
                               {activeTool === 'video' && 'Video_Neural_Recolor'}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">
                               Native Neural Protocol v8.4.2
                            </p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#888]">Source_Neural_Input</label>
                            <div className="relative brutal-border aspect-video bg-gray-50 flex items-center justify-center overflow-hidden group">
                               {sourceImage ? (
                                 <>
                                   <img src={sourceImage} className="w-full h-full object-cover" alt="Source" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <label className="brutal-btn-sm bg-white cursor-pointer">
                                         RESET_UPLINK
                                         <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                      </label>
                                   </div>
                                 </>
                               ) : (
                                 <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-pop-cyan/10 transition-colors">
                                    <ImageIcon size={48} className="opacity-10 mb-2" />
                                    <span className="text-[10px] font-black uppercase opacity-40">Drop_Neural_Packet</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                 </label>
                               )}
                            </div>
                         </div>

                         {activeTool !== 'upscale' && (
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-pop-pink">
                                 {activeTool === 'bg' ? 'Target_Environment' : 'Target_Color_Scheme'}
                              </label>
                              <input 
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                                placeholder={activeTool === 'bg' ? "e.g. Floating neon gardens..." : "e.g. Nuclear sunset orange..."}
                                className="w-full brutal-border border-2 px-4 py-4 text-xs font-black uppercase outline-none focus:bg-pop-yellow transition-all"
                              />
                           </div>
                         )}

                         <button 
                           onClick={() => handleProcessImage(activeTool as any)}
                           disabled={isProcessing || !sourceImage}
                           className="w-full brutal-btn bg-black text-white py-6 text-xl font-black italic flex items-center justify-center gap-4 transition-all hover:bg-pop-cyan hover:text-black disabled:opacity-50"
                         >
                            {isProcessing ? <RefreshCw className="animate-spin text-pop-yellow" /> : <Wand2 />}
                            {isProcessing ? "PROCESSING_NEURAL_STREAM..." : "EXECUTE_TRANSFORMATION"}
                         </button>
                      </div>
                   </div>
                </div>

                <div className="brutal-border bg-gray-50 flex items-center justify-center relative overflow-hidden brutal-shadow-lg min-h-[500px]">
                   {processingResult ? (
                      <div className="w-full h-full p-10 flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                         <div className="brutal-border bg-white p-3 brutal-shadow-xl relative group">
                            <img src={processingResult} className="max-w-full max-h-[60vh] object-contain" alt="Result" />
                            <div className="absolute top-6 left-6 bg-black text-white px-3 py-1 text-[10px] font-black uppercase italic">
                               OUTPUT_VALIDATED
                            </div>
                         </div>
                         
                         <div className="flex gap-4 w-full">
                            <a 
                              href={processingResult} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex-1 brutal-btn bg-black text-white py-4 flex items-center justify-center gap-2"
                            >
                               <Download size={20} />
                               DOWNLOAD_ASSET
                            </a>
                            <button
                              onClick={() => onImport?.({
                                imageUrl: processingResult!,
                                title: activeTool.toUpperCase() + "_NEURAL_ASSET",
                                suggestedStyle: 'NEURAL_FORGE_V8'
                              })}
                              className="flex-1 brutal-btn bg-pop-green py-4 flex items-center justify-center gap-2"
                            >
                               <Layers size={20} />
                               IMPORT_TO_STUDIO
                            </button>
                         </div>
                      </div>
                   ) : (
                      <div className="text-center space-y-4 opacity-10">
                         {activeTool === 'bg' && <Mountain size={140} />}
                         {activeTool === 'upscale' && <Maximize2 size={140} />}
                         {(activeTool === 'recolor' || activeTool === 'video') && <Palette size={140} />}
                         <p className="text-xl font-black uppercase italic">Awaiting_Neural_Sync</p>
                      </div>
                   )}
                   
                   {/* Scanline overlay */}
                   <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]" />
                </div>
             </motion.div>
           )}
         </AnimatePresence>
      </div>
    </div>
  );
}
