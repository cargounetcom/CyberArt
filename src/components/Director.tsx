import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Film, Wand2, Sparkles, RefreshCw, Send, SkipForward } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Scene {
  id: string;
  prompt: string;
  refinedPrompt: string;
  imageUrl: string;
  status: 'empty' | 'generating' | 'ready';
}

export function DirectorMode() {
  const [scenes, setScenes] = useState<Scene[]>([
    { id: '1', prompt: '', refinedPrompt: '', imageUrl: '', status: 'empty' },
    { id: '2', prompt: '', refinedPrompt: '', imageUrl: '', status: 'empty' },
    { id: '3', prompt: '', refinedPrompt: '', imageUrl: '', status: 'empty' },
  ]);
  const [activeScene, setActiveScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateScene = async (index: number) => {
    const scene = scenes[index];
    if (!scene.prompt) return;

    const newScenes = [...scenes];
    newScenes[index].status = 'generating';
    setScenes(newScenes);

    try {
      const res = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `ANIME FILM SCENE: ${scene.prompt}. Focus on Makoto Shinkai style, lighting, and cinematic depth.` })
      });
      const data = await res.json();
      const refined = data.refinedPrompt;

      const seed = Math.floor(Math.random() * 1000000);
      const url = `https://pollinations.ai/p/${encodeURIComponent(refined)}?width=1280&height=720&seed=${seed}&nologo=true`;

      newScenes[index] = {
        ...newScenes[index],
        refinedPrompt: refined,
        imageUrl: url,
        status: 'ready'
      };
      setScenes(newScenes);
    } catch (e) {
      console.error(e);
      newScenes[index].status = 'empty';
      setScenes(newScenes);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8">
      {/* Viewport */}
      <div className="flex-1 brutal-border bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <AnimatePresence mode="wait">
          {scenes[activeScene].status === 'ready' ? (
            <motion.div 
              key={scenes[activeScene].imageUrl}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <img src={scenes[activeScene].imageUrl} className="w-full h-full object-cover" alt="Scene" />
              <div className="absolute bottom-8 left-8 bg-black/80 text-white p-4 brutal-border-sm text-xs font-mono uppercase tracking-widest">
                SCENE_{activeScene + 1} // CAM_01 // AI_RENDER_v1
              </div>
            </motion.div>
          ) : scenes[activeScene].status === 'generating' ? (
            <div className="flex flex-col items-center gap-4 text-white">
              <RefreshCw className="animate-spin" size={48} />
              <p className="font-black uppercase italic tracking-tighter">RENDERING_ANIME_CORE...</p>
            </div>
          ) : (
            <div className="text-white/20 flex flex-col items-center gap-4">
              <Film size={64} />
              <p className="font-black uppercase">NO_CLIP_LOADED</p>
            </div>
          )}
        </AnimatePresence>

        {isPlaying && (
            <div className="absolute top-8 right-8 flex items-center gap-2 bg-red-600 text-white px-3 py-1 animate-pulse font-black text-xs">
                <div className="w-2 h-2 bg-white rounded-full" />
                RECORDING_STREAM
            </div>
        )}
      </div>

      {/* Timeline */}
      <div className="h-48 flex gap-4 overflow-x-auto pb-4">
        {scenes.map((scene, i) => (
          <div 
            key={scene.id}
            onClick={() => setActiveScene(i)}
            className={cn(
              "w-64 shrink-0 brutal-border bg-white p-4 cursor-pointer transition-all flex flex-col gap-2 relative",
              activeScene === i ? "bg-pop-yellow brutal-shadow-lg -translate-y-2" : "hover:bg-gray-50"
            )}
          >
            <div className="flex justify-between items-center text-[10px] font-black uppercase">
              <span>Scene {i + 1}</span>
              <span className={cn(scene.status === 'ready' ? "text-green-600" : "text-gray-400")}>{scene.status}</span>
            </div>
            
            <div className="flex-1 bg-gray-100 brutal-border-sm overflow-hidden flex items-center justify-center">
              {scene.imageUrl ? (
                <img src={scene.imageUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <Sparkles className="text-gray-300" />
              )}
            </div>

            <div className="flex gap-1">
              <input 
                type="text"
                placeholder="Scene prompt..."
                className="flex-1 text-[10px] uppercase font-bold p-1 border border-black outline-none"
                value={scene.prompt}
                onChange={(e) => {
                  const s = [...scenes];
                  s[i].prompt = e.target.value;
                  setScenes(s);
                }}
              />
              <button 
                onClick={(e) => { e.stopPropagation(); generateScene(i); }}
                className="bg-black text-white p-1 hover:bg-pop-pink"
              >
                <Wand2 size={12} />
              </button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={() => setScenes([...scenes, { id: Date.now().toString(), prompt: '', refinedPrompt: '', imageUrl: '', status: 'empty' }])}
          className="w-12 h-full brutal-border bg-white flex items-center justify-center hover:bg-pop-cyan transition-all"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-8 py-4 border-t-4 border-black">
        <button 
            className="brutal-btn bg-pop-pink text-white w-40"
            onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? "STOP_FILM" : "PLAY_SEQUENCER"}
        </button>
        <button className="brutal-btn bg-pop-cyan w-40">EXPORT_ANIME_V1</button>
      </div>
    </div>
  );
}
