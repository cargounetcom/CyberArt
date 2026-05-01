import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Transformer, Text, Image as KonvaImage, Group, Line } from 'react-konva';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, MousePointer2, Type, Circle as CircleIcon, Square, Save, RefreshCw, Wand2, Fullscreen, Image as ImageIcon, Palette, Sparkles, Upload, PenTool, Cpu, Monitor, Download, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import useImage from 'use-image';
import { GoogleGenAI } from "@google/genai";
import confetti from 'canvas-confetti';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ShapeProps {
  id: string;
  type: 'rect' | 'circle' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  rotation: number;
  text?: string;
  imageSource?: string;
  depth?: number;
  tilt?: number; // angle in degrees for perspective shift
  isColoringPage?: boolean;
  is4K?: boolean;
}

const URLLoadedImage = ({ shape, isSelected, onSelect, onChange, viewMode }: { 
  shape: ShapeProps, 
  isSelected: boolean, 
  onSelect: () => void, 
  onChange: (newAttrs: any) => void,
  viewMode: '2d' | '3d'
}) => {
  const [img, status] = useImage(shape.imageSource || '', 'anonymous');
  const shapeRef = React.useRef<any>(null);
  const trRef = React.useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const getExtrusionOffsets = (depth: number = 0, tilt: number = 45) => {
    const rad = (tilt * Math.PI) / 180;
    return {
      dx: Math.cos(rad) * depth,
      dy: Math.sin(rad) * depth
    };
  };

  const w = shape.width || 200;
  const h = shape.height || 200;
  const { dx, dy } = getExtrusionOffsets(shape.depth, shape.tilt);

  if (status === 'failed') {
    return (
      <Group x={shape.x} y={shape.y} onClick={onSelect} onTap={onSelect} draggable={viewMode === '2d'}>
        <Rect 
          width={w} 
          height={h} 
          fill="#f3f4f6" 
          stroke="red" 
          strokeDash={[5, 5]} 
        />
        <Text 
          text="IMAGE_LOAD_FAILED" 
          fontSize={10} 
          fontStyle="bold" 
          fill="red" 
          align="center" 
          verticalAlign="middle"
          width={w}
          height={h}
        />
      </Group>
    );
  }

  if (status === 'loading') {
    return (
      <Group x={shape.x} y={shape.y}>
        <Rect 
          width={w} 
          height={h} 
          fill="#f3f4f6" 
          opacity={0.5} 
        />
        <Text 
          text="LOADING_CORE..." 
          fontSize={10} 
          fontStyle="bold" 
          fill="black" 
          align="center" 
          verticalAlign="middle"
          width={w}
          height={h}
        />
      </Group>
    );
  }

  return (
    <Group 
      x={shape.x} 
      y={shape.y} 
      draggable={viewMode === '2d'}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    >
      {shape.depth && shape.depth > 0 && (
        <Group opacity={0.6}>
          {/* Top side */}
          <Line points={[0, 0, dx, dy, dx + w, dy, w, 0]} closed fill="black" opacity={0.2} />
          {/* Left side */}
          <Line points={[0, 0, dx, dy, dx, dy + h, 0, h]} closed fill="black" opacity={0.4} />
          {/* Right side */}
          <Line points={[w, 0, dx + w, dy, dx + w, dy + h, w, h]} closed fill="black" opacity={0.15} />
          {/* Bottom side */}
          <Line points={[0, h, dx, dy + h, dx + w, dy + h, w, h]} closed fill="black" opacity={0.5} />
        </Group>
      )}
      <KonvaImage
        image={img}
        id={shape.id}
        width={w}
        height={h}
        ref={shapeRef}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {shape.is4K && (
        <Group x={w - 25} y={5}>
           <Rect width={20} height={10} fill="#00FF00" stroke="black" strokeWidth={1} />
           <Text text="4K" fontSize={6} fontStyle="bold" x={6} y={2.5} fill="black" />
        </Group>
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Group>
  );
};

const COLORS = [
  '#FF1D1D', // Vibrant Red
  '#FFB800', // Yellow/Gold
  '#00D1FF', // Pop Blue
  '#00C950', // Pop Green
  '#FF00D6', // Pink
  '#1A1A1A', // Nordic Black
  '#F4F4F9', // Nordic White
];

interface CanvasControlProps {
  initialShapes?: ShapeProps[];
  onSave?: (shapes: ShapeProps[]) => void;
  isSaving?: boolean;
  importTemplate?: { imageUrl: string, title: string, author: string, suggestedStyle?: string } | null;
  onClearTemplate?: () => void;
}

export function CanvasControl({ initialShapes, onSave, isSaving, importTemplate, onClearTemplate }: CanvasControlProps) {
  const [shapes, setShapes] = useState<ShapeProps[]>([]);
  const [selectedId, selectShape] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    if (importTemplate && containerSize.width > 0) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = importTemplate.imageUrl;
      img.onload = () => {
        const stageW = containerSize.width;
        const stageH = containerSize.height;
        
        let width = Math.min(stageW * 0.8, 400);
        let height = width * (img.height / img.width);
        
        if (height > stageH * 0.8) {
          height = stageH * 0.8;
          width = height * (img.width / img.height);
        }

        const x = (stageW / 2) - (width / 2);
        const y = (stageH / 2) - (height / 2);

        const newShape: ShapeProps = {
          id: `import-${Date.now()}`,
          type: 'image',
          x,
          y,
          width,
          height,
          imageSource: importTemplate.imageUrl,
          fill: '#ffffff',
          rotation: 0
        };
        setShapes(prev => [...prev, newShape]);
        
        // Auto-configure AI tools for the imported asset
        if (importTemplate.suggestedStyle) {
          setAiStyle(importTemplate.suggestedStyle);
        }
        setAiPrompt(`${importTemplate.title} in the style of ${importTemplate.author}`);
        
        onClearTemplate?.();
        confetti({ 
          particleCount: 100, 
          spread: 70, 
          origin: { y: 0.6 },
          colors: ['#FFD700', '#00D1FF', '#FF00D6']
        });
      };
    }
  }, [importTemplate, containerSize]);
  const [aspectRatio, setAspectRatio] = useState<'square' | 'a4' | 'poster' | 'tiktok' | 'video' | 'banner'>('square');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAssisting, setIsAssisting] = useState(false);
  const [is4KRendering, setIs4KRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [selectedFill, setSelectedFill] = useState(COLORS[0]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        let width = containerRef.current.offsetWidth - 64; // Padding
        let height = width;
        
        if (aspectRatio === 'a4') {
          height = width * 1.414;
        } else if (aspectRatio === 'poster') {
          height = width * 1.5;
        } else if (aspectRatio === 'tiktok') {
          height = width * 1.777;
        } else if (aspectRatio === 'video') {
          height = width * 0.5625;
        } else if (aspectRatio === 'banner') {
          height = width * 0.333;
        }

        const maxH = containerRef.current.offsetHeight - 64;
        if (height > maxH) {
          height = maxH;
          if (aspectRatio === 'a4') {
            width = height / 1.414;
          } else if (aspectRatio === 'poster') {
            width = height / 1.5;
          } else if (aspectRatio === 'tiktok') {
            width = height / 1.777;
          } else if (aspectRatio === 'video') {
            width = height / 0.5625;
          } else if (aspectRatio === 'banner') {
            width = height / 0.333;
          } else {
            width = height;
          }
        }

        setContainerSize({ width, height });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [aspectRatio]);

  useEffect(() => {
    if (initialShapes && initialShapes.length > 0) {
      setShapes(initialShapes);
    }
  }, [initialShapes]);

  const addShape = (type: ShapeProps['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newShape: ShapeProps = {
      id,
      type,
      x: containerSize.width / 2 - 50,
      y: containerSize.height / 2 - 50,
      fill: selectedFill,
      rotation: 0,
      ...(type === 'rect' && { width: 100, height: 100, depth: 0, tilt: 45 }),
      ...(type === 'circle' && { radius: 50, depth: 0, tilt: 45 }),
      ...(type === 'text' && { text: 'POP ART', width: 200, depth: 0, tilt: 45 }),
      ...(type === 'image' && { width: 200, height: 200, depth: 0, tilt: 45 }),
    };
    setShapes([...shapes, newShape]);
    selectShape(id);
  };

  const [aiStyle, setAiStyle] = useState('CYBER_BRUTALISM');

  const STYLES = [
    { id: 'CYBER_BRUTALISM', label: 'CYBER' },
    { id: 'GHOSTLY_GOTHIC', label: 'GHOST' },
    { id: 'NORDIC_FROST', label: 'NORDIC' },
    { id: 'PUNK_ANARCHY', label: 'PUNK' },
    { id: 'ABSTRACTIONISM', label: 'ABSTR' },
    { id: 'TAIWING_FLUID', label: 'TAIWING' },
    { id: 'IMPRESSIONISM', label: 'IMPRESS' },
    { id: 'SURREALISM', label: 'SURREAL' },
    { id: 'COLORING_PAGE', label: 'COLOR' },
    { id: 'ANIME_AVATAR', label: 'ANIME' },
    { id: 'POINTILLISM', label: 'POINT' },
    { id: 'MEME_GEN', label: 'MEME' },
    { id: 'COMIC_BOOK', label: 'COMIC' },
  ];

  const [canvasBg, setCanvasBg] = useState('#ffffff');

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const id = `upload-${Date.now()}`;
      const newShape: ShapeProps = {
        id,
        type: 'image',
        x: 100,
        y: 100,
        width: 300,
        height: 300,
        fill: 'transparent',
        rotation: 0,
        imageSource: url,
        depth: 0,
        tilt: 45
      };
      setShapes([...shapes, newShape]);
      selectShape(id);
    };
    reader.readAsDataURL(file);
  };

  const handleNeuralAssist = async () => {
    if (!aiPrompt.trim()) return;
    setIsAssisting(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Refine this art prompt for a high-end neural art engine. Keep it concise but add artistic depth, lighting details, and technical complexity. Original prompt: "${aiPrompt}"`,
        config: {
          systemInstruction: "You are an expert prompt engineer for neural art generators. Your output should be a single, enhanced prompt string without commentary.",
        }
      });
      const text = response.text || "";
      if (text) {
        setAiPrompt(text.replace(/^"|"$/g, '').trim());
        confetti({ particleCount: 30, colors: ['#FF00D6'], spread: 30 });
      }
    } catch (error) {
      console.error("Neural Assist Error:", error);
    } finally {
      setIsAssisting(false);
    }
  };

  const handle4KRender = async () => {
    if (!selectedId) return;
    setIs4KRendering(true);
    setRenderProgress(0);
    
    // Simulated high-fidelity computation
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIs4KRendering(false);
          updateShape(selectedId, { is4K: true });
          confetti({ particleCount: 150, spread: 70, colors: ['#00FF00', '#FFFFFF'] });
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const generateAIImage = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const styleContext = {
        CYBER_BRUTALISM: "Neo-brutalist tech art, vibrant neon, grid textures.",
        GHOSTLY_GOTHIC: "Haunting gothic atmosphere, ghostly figures, dark lace, Victorian horror, ethereal smoke.",
        NORDIC_FROST: "Nordic minimalism, icy blues, snowy landscapes, runic symbols, cold light.",
        PUNK_ANARCHY: "Punk rock collage, zine aesthetic, high contrast, gritty textures, safety pins and leather.",
        ABSTRACTIONISM: "Abstract expressionism, focal points, geometric chaos, textured brushwork, bold colors.",
        TAIWING_FLUID: "Abstract flowing composition in Taiwing style, soft watercolor gradients, ethereal liquid shapes, smooth transitions between pastel turquoise and deep violet tones, aesthetic fluid art, minimalist.",
        IMPRESSIONISM: "Impressionist oil painting style, visible brushstrokes, emphasis on light and its changing qualities, ordinary subject matter, movement as a crucial element, vibrant colors.",
        SURREALISM: "Surrealist masterpiece, dreamlike scenes, symbolic imagery, illogical juxtapositions, bizarre subconscious elements, Dali-inspired melting shapes.",
        COLORING_PAGE: "Clean black and white line art coloring page, no shading, no gray, bold outlines, white background, high contrast, coloring book style.",
        ANIME_AVATAR: "High resolution anime character bust, vibrant cel shading, expressive eyes, sleek lineart, modern anime aesthetic, high quality illustration, white background.",
        POINTILLISM: "Pointillism painting style, composed of small distinct dots of color, masterwork, impressionist technique, vibrant stippling, Georges Seurat style.",
        MEME_GEN: "Classic internet meme style, high contrast image, bold white Impact font text with black outline at the top and bottom, humorous situation, viral aesthetic.",
        COMIC_BOOK: "Vintage comic book style, bold ink lines, Ben-Day dots, dramatic shadows, action-packed composition, speech bubbles, classic superhero aesthetic."
      }[aiStyle as keyof typeof styleContext];

      const res = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `STYLE: ${styleContext}. SUBJECT: ${aiPrompt}. Format for high-quality printing.` })
      });
      const data = await res.json();
      const refinedPrompt = data.refinedPrompt || aiPrompt;
      
      const seed = Math.floor(Math.random() * 1000000);
      
      // Determine dimensions based on aspect ratio
      const dims = {
        square: { w: 1024, h: 1024 },
        a4: { w: 724, h: 1024 },
        poster: { w: 680, h: 1024 },
        tiktok: { w: 576, h: 1024 },
        video: { w: 1024, h: 576 },
        banner: { w: 1024, h: 256 }
      }[aspectRatio] || { w: 1024, h: 1024 };

      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(refinedPrompt)}?width=${dims.w}&height=${dims.h}&seed=${seed}&nologo=true`;
      
      const id = `ai-${Date.now()}`;
      const newShape: ShapeProps = {
        id,
        type: 'image',
        x: containerSize.width / 2 - 150,
        y: containerSize.height / 2 - 150,
        width: 300,
        height: 300 * (dims.h / dims.w),
        fill: 'transparent',
        rotation: 0,
        imageSource: imageUrl,
        depth: 0,
        tilt: 45,
        isColoringPage: aiStyle === 'COLORING_PAGE'
      };

      setShapes([...shapes, newShape]);
      selectShape(id);
      setAiPrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCanvas = (scale: number = 1) => {
    if (!stageRef.current) return;
    
    // Select the stage and ensure everything is visible
    const stage = stageRef.current;
    
    // Create a temporary link and trigger the download
    try {
      // Use toBlob for better quality and memory handling on some browsers
      stage.toBlob({
        callback: (blob: Blob | null) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `cyberart-export-${scale}x-${Date.now()}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        },
        pixelRatio: scale,
        mimeType: 'image/png',
        quality: 1,
      });
    } catch (err) {
      // Fallback to toDataURL if toBlob fails
      const uri = stage.toDataURL({ pixelRatio: scale });
      const link = document.createElement('a');
      link.download = `cyberart-export-${scale}x-${Date.now()}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const updateShape = (id: string, attrs: Partial<ShapeProps>) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...attrs } : s));
  };

  const selectedShape = shapes.find(s => s.id === selectedId);

  useEffect(() => {
    if (selectedShape) {
      setSelectedFill(selectedShape.fill);
    }
  }, [selectedId, selectedShape]);

  const getExtrusionOffsets = (depth: number = 0, tilt: number = 45) => {
    const rad = (tilt * Math.PI) / 180;
    return {
      dx: Math.cos(rad) * depth,
      dy: Math.sin(rad) * depth
    };
  };

  const deleteSelected = () => {
    if (selectedId) {
      setShapes(shapes.filter((s) => s.id !== selectedId));
      selectShape(null);
    }
  };

  const handleTransformEnd = (e: any) => {
    const node = e.target;
    const id = node.id();
    const updated = shapes.map((s) => {
      if (s.id === id) {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        return {
          ...s,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          width: Math.max(5, (s.width || node.width()) * scaleX),
          height: Math.max(5, (s.height || node.height()) * scaleY),
          radius: Math.max(5, (s.radius || node.width() / 2) * scaleX),
        };
      }
      return s;
    });
    setShapes(updated);
  };

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white brutal-border brutal-shadow-lg overflow-hidden relative">
      {/* 3D Overlay Warning */}
      {viewMode === '3d' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-pop-pink border-2 border-black px-4 py-1 brutal-shadow text-white font-black text-xs uppercase italic animate-pulse">
          3D Preview Mode Active
        </div>
      )}

      {/* Toolbar */}
      <div className="p-4 bg-pop-cyan border-b-4 border-black flex items-center justify-between gap-4 z-20 overflow-x-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => addShape('rect')}
            className="w-10 h-10 bg-white border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-pop-yellow transition-all active:translate-y-0.5 active:shadow-none"
            title="Add Square"
          >
            <Square size={20} />
          </button>
          <button
            onClick={() => addShape('circle')}
            className="w-10 h-10 bg-white border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-pop-yellow transition-all active:translate-y-0.5 active:shadow-none"
            title="Add Circle"
          >
            <CircleIcon size={20} />
          </button>
          <button
            onClick={() => addShape('text')}
            className="w-10 h-10 bg-white border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-pop-yellow transition-all active:translate-y-0.5 active:shadow-none"
            title="Add Text"
          >
            <Type size={20} />
          </button>

          <label className="w-10 h-10 bg-white border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-pop-pink hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer">
            <input type="file" className="hidden" onChange={onFileUpload} accept="image/*" />
            <Upload size={20} />
          </label>

          <div className="flex items-center gap-1 bg-white p-1 brutal-border brutal-shadow-sm ml-2">
            {COLORS.map(c => (
              <button 
                key={c}
                onClick={() => {
                  setSelectedFill(c);
                  if (selectedId) updateShape(selectedId, { fill: c });
                }}
                className={cn(
                  "w-6 h-6 border border-black transition-all hover:scale-110",
                  selectedFill === c ? "border-2 scale-110" : "opacity-80"
                )}
                style={{ backgroundColor: c }}
                title={`Color: ${c}`}
              />
            ))}
            <div className="relative w-6 h-6 border border-black brutal-shadow-sm overflow-hidden flex items-center justify-center bg-white group hover:scale-110 transition-transform">
              <Palette size={12} className="absolute pointer-events-none z-10" />
              <input 
                type="color" 
                value={selectedFill} 
                onChange={(e) => {
                  const color = e.target.value;
                  setSelectedFill(color);
                  if (selectedId) updateShape(selectedId, { fill: color });
                }}
                className="w-12 h-12 absolute -top-3 -left-3 cursor-pointer opacity-0"
                title="Custom Color"
              />
              <div style={{ backgroundColor: selectedFill }} className="w-full h-full" />
            </div>
          </div>
          
          <div className="flex flex-col gap-1 border-l-2 border-black pl-4 ml-2">
            <span className="text-[8px] font-black uppercase opacity-50 mb-1">Canvas_BG</span>
            <div className="relative w-10 h-10 border-2 border-black brutal-border-sm brutal-shadow-sm overflow-hidden flex items-center justify-center bg-white group hover:scale-110 transition-transform">
              <Monitor size={16} className="absolute pointer-events-none z-10" />
              <input 
                type="color" 
                value={canvasBg} 
                onChange={(e) => setCanvasBg(e.target.value)}
                className="w-16 h-16 absolute -top-3 -left-3 cursor-pointer opacity-0"
                title="Stage Background"
              />
              <div style={{ backgroundColor: canvasBg }} className="w-full h-full" />
            </div>
          </div>
          
          <div className="flex flex-col gap-1 border-l-2 border-black pl-4 ml-2">
            <div className="flex gap-1">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setAiStyle(s.id)}
                  className={cn(
                    "px-2 py-1 text-[8px] font-black uppercase brutal-border-sm transition-all",
                    aiStyle === s.id ? "bg-black text-white" : "bg-white hover:bg-gray-100"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <input 
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="GENERATE_MAGIC..."
                  className="bg-white border-2 border-black px-3 py-2 text-[10px] font-black uppercase placeholder:opacity-30 outline-none w-48 brutal-shadow-sm focus:bg-pop-yellow transition-colors pr-8"
                  onKeyDown={(e) => e.key === 'Enter' && generateAIImage()}
                />
                <button
                  onClick={handleNeuralAssist}
                  disabled={isAssisting || !aiPrompt}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-pop-pink hover:scale-110 active:scale-95 transition-all disabled:opacity-30"
                  title="Neural Prompt Assistant"
                >
                  {isAssisting ? <RefreshCw size={12} className="animate-spin" /> : <Cpu size={14} />}
                </button>
              </div>
              <button
                onClick={generateAIImage}
                disabled={isGenerating || !aiPrompt}
                className="w-10 h-10 bg-pop-green border-2 border-black brutal-shadow-sm flex items-center justify-center hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
                title="Generate AI Masterpiece"
              >
                {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white brutal-border brutal-shadow-sm p-1">
            <button onClick={() => downloadCanvas(1)} className="px-2 py-1 text-[8px] font-black uppercase hover:bg-pop-pink">1x</button>
            <button onClick={() => downloadCanvas(2)} className="px-2 py-1 text-[8px] font-black uppercase hover:bg-pop-pink">2x</button>
            <button onClick={() => downloadCanvas(4)} className="px-2 py-1 text-[8px] font-black uppercase hover:bg-pop-pink">4x</button>
          </div>
          <button 
            onClick={() => downloadCanvas(2)}
            className="brutal-btn bg-pop-cyan flex items-center gap-2"
          >
            <Fullscreen size={20} />
            PRINT/EXPORT
          </button>

          {selectedId && (
            <button
               onClick={handle4KRender}
               disabled={is4KRendering}
               className={cn(
                 "brutal-btn flex items-center gap-2 transition-all overflow-hidden relative",
                 is4KRendering ? "bg-black text-white" : "bg-pop-yellow"
               )}
            >
               {is4KRendering && (
                 <motion.div 
                   className="absolute bottom-0 left-0 h-1 bg-pop-green"
                   initial={{ width: 0 }}
                   animate={{ width: `${renderProgress}%` }}
                 />
               )}
               <Monitor size={20} />
               {is4KRendering ? `RENDERING_${renderProgress}%` : 'RENDER_4K'}
            </button>
          )}

          <div className="flex items-center gap-1 border-2 border-black bg-white p-1 brutal-shadow-sm">
            <button 
              onClick={() => setViewMode('2d')}
              className={cn("px-2 py-1 text-[10px] font-black uppercase transition-colors", viewMode === '2d' ? "bg-black text-white" : "hover:bg-pop-yellow")}
            >
              2D
            </button>
            <button 
              onClick={() => setViewMode('3d')}
              className={cn("px-2 py-1 text-[10px] font-black uppercase transition-colors", viewMode === '3d' ? "bg-black text-white" : "hover:bg-pop-yellow")}
            >
              3D
            </button>
          </div>

          <select 
            value={aspectRatio}
            onChange={(e: any) => setAspectRatio(e.target.value)}
            className="bg-white border-2 border-black font-black uppercase text-xs px-2 py-1 brutal-shadow-sm outline-none cursor-pointer"
          >
            <option value="square">1:1 Square (Insta)</option>
            <option value="a4">A4 Print (Doc)</option>
            <option value="poster">2:3 Poster (Print)</option>
            <option value="tiktok">9:16 Vertical (TikTok)</option>
            <option value="video">16:9 Cinematic (YouTube)</option>
            <option value="banner">3:1 Header (Ads)</option>
          </select>

          {onSave && (
            <button
              onClick={() => onSave(shapes)}
              disabled={isSaving}
              className="bg-pop-pink border-2 border-black px-4 py-2 brutal-shadow-sm text-white font-black text-xs hover:translate-y-0.5 hover:shadow-none active:translate-y-1 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
              SAVE
            </button>
          )}

          <AnimatePresence mode="wait">
            {selectedId && selectedShape && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 border-l-2 border-black pl-4 overflow-hidden"
              >
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase opacity-50 leading-none mb-1">Depth</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={selectedShape.depth || 0} 
                    onChange={(e) => updateShape(selectedId, { depth: parseInt(e.target.value) })}
                    className="w-16 h-2 accent-black cursor-pointer bg-white brutal-border"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase opacity-50 leading-none mb-1">Tilt</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    value={selectedShape.tilt || 45} 
                    onChange={(e) => updateShape(selectedId, { tilt: parseInt(e.target.value) })}
                    className="w-16 h-2 accent-black cursor-pointer bg-white brutal-border"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedId && (
              <div className="flex items-center gap-2">
                {selectedShape?.type === 'image' && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedShape.imageSource || '';
                      link.download = `cyberart-asset-${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-10 h-10 bg-pop-green text-black border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-pop-pink transition-all active:translate-y-0.5 active:shadow-none"
                    title="Download Asset"
                  >
                    <Download size={20} />
                  </motion.button>
                )}
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={deleteSelected}
                  className="w-10 h-10 bg-red-500 text-white border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-red-600 transition-all active:translate-y-0.5 active:shadow-none"
                >
                  <Trash2 size={20} />
                </motion.button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="flex-1 relative overflow-auto bg-gray-200 p-8 flex justify-center items-start">
        <motion.div 
          animate={{
            rotateX: viewMode === '3d' ? 45 : 0,
            rotateZ: viewMode === '3d' ? -15 : 0,
            y: viewMode === '3d' ? 50 : 0,
            boxShadow: viewMode === '3d' ? "15px 15px 0 0 rgba(0,0,0,0.5)" : "8px 8px 0 0 rgba(0,0,0,1)"
          }}
          transition={{ duration: 0.6, type: "spring" }}
          style={{ width: containerSize.width, height: containerSize.height }}
          className="border-4 border-black relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '12px 12px', backgroundColor: canvasBg }}></div>
          <Stage
            width={containerSize.width}
            height={containerSize.height}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            ref={stageRef}
          >
            <Layer>
              {/* Background Plate for Exports */}
              <Rect 
                width={containerSize.width} 
                height={containerSize.height} 
                fill={canvasBg} 
                listening={false} 
              />
              {shapes.map((shape) => {
                const isSelected = shape.id === selectedId;
                const props = {
                  key: shape.id,
                  id: shape.id,
                  x: shape.x,
                  y: shape.y,
                  fill: shape.fill,
                  draggable: viewMode === '2d',
                  onClick: () => viewMode === '2d' && selectShape(shape.id),
                  onTap: () => viewMode === '2d' && selectShape(shape.id),
                  onDragEnd: (e: any) => {
                    setShapes(shapes.map(s => s.id === shape.id ? { ...s, x: e.target.x(), y: e.target.y() } : s));
                  },
                  onTransformEnd: handleTransformEnd,
                  rotation: shape.rotation,
                  stroke: 'black',
                  strokeWidth: 2,
                };

                if (shape.type === 'image') {
                  return (
                    <URLLoadedImage
                      key={shape.id}
                      shape={shape}
                      isSelected={isSelected}
                      onSelect={() => viewMode === '2d' && selectShape(shape.id)}
                      viewMode={viewMode}
                      onChange={(newAttrs) => {
                        setShapes(shapes.map(s => s.id === shape.id ? { ...s, ...newAttrs } : s));
                      }}
                    />
                  );
                }

                if (shape.type === 'rect') {
                  const { dx, dy } = getExtrusionOffsets(shape.depth, shape.tilt);
                  const w = shape.width || 100;
                  const h = shape.height || 100;

                  return (
                    <Group key={shape.id} x={shape.x} y={shape.y} rotation={shape.rotation} draggable={viewMode === '2d'}
                      onClick={() => viewMode === '2d' && selectShape(shape.id)}
                      onTap={() => viewMode === '2d' && selectShape(shape.id)}
                      onDragEnd={(e) => updateShape(shape.id, { x: e.target.x(), y: e.target.y() })}
                    >
                      {shape.depth && shape.depth > 0 && (
                        <>
                          {/* Back Face */}
                          <Rect x={dx} y={dy} width={w} height={h} fill="black" opacity={0.3} />
                          {/* Top side */}
                          <Line points={[0, 0, dx, dy, dx + w, dy, w, 0]} closed fill="black" opacity={0.2} />
                          {/* Left side */}
                          <Line points={[0, 0, dx, dy, dx, dy + h, 0, h]} closed fill="black" opacity={0.4} />
                          {/* Right side */}
                          <Line points={[w, 0, dx + w, dy, dx + w, dy + h, w, h]} closed fill="black" opacity={0.15} />
                          {/* Bottom side */}
                          <Line points={[0, h, dx, dy + h, dx + w, dy + h, w, h]} closed fill="black" opacity={0.5} />
                        </>
                      )}
                      <Rect 
                        id={shape.id}
                        width={w} 
                        height={h} 
                        fill={shape.fill} 
                        stroke="black" 
                        strokeWidth={2}
                      />
                      {shape.is4K && (
                        <Group x={w - 25} y={5}>
                           <Rect width={20} height={10} fill="#00FF00" stroke="black" strokeWidth={1} />
                           <Text text="4K" fontSize={6} fontStyle="bold" x={6} y={2.5} fill="black" />
                        </Group>
                      )}
                      {isSelected && (
                        <Transformer
                          anchorSize={6}
                          borderDash={[6, 2]}
                          rotateEnabled={true}
                          onTransformEnd={(e) => {
                            const node = e.target;
                            const scaleX = node.scaleX();
                            const scaleY = node.scaleY();
                            node.scaleX(1);
                            node.scaleY(1);
                            updateShape(shape.id, {
                              width: Math.max(5, w * scaleX),
                              height: Math.max(5, h * scaleY),
                              rotation: node.rotation()
                            });
                          }}
                          ref={(node) => {
                            if (isSelected && node) {
                              const stage = node.getStage();
                              const selectedNode = stage?.findOne(`#${shape.id}`);
                              if (selectedNode) {
                                node.nodes([selectedNode]);
                                node.getLayer()?.batchDraw();
                              }
                            }
                          }}
                        />
                      )}
                    </Group>
                  );
                }

                if (shape.type === 'circle') {
                  const { dx, dy } = getExtrusionOffsets(shape.depth, shape.tilt);
                  const r = shape.radius || 50;

                  return (
                    <Group key={shape.id} x={shape.x} y={shape.y} rotation={shape.rotation} draggable={viewMode === '2d'}
                      onClick={() => viewMode === '2d' && selectShape(shape.id)}
                      onTap={() => viewMode === '2d' && selectShape(shape.id)}
                      onDragEnd={(e) => updateShape(shape.id, { x: e.target.x(), y: e.target.y() })}
                    >
                      {shape.depth && shape.depth > 0 && Array.from({ length: 5 }).map((_, i) => (
                        <Circle 
                          key={i}
                          x={(dx / 5) * (i + 1)} 
                          y={(dy / 5) * (i + 1)} 
                          radius={r} 
                          fill="black" 
                          opacity={0.1} 
                        />
                      ))}
                      <Circle 
                        id={shape.id}
                        radius={r} 
                        fill={shape.fill} 
                        stroke="black" 
                        strokeWidth={2} 
                      />
                      {shape.is4K && (
                        <Group x={r/2} y={-r/2}>
                           <Rect width={20} height={10} fill="#00FF00" stroke="black" strokeWidth={1} />
                           <Text text="4K" fontSize={6} fontStyle="bold" x={6} y={2.5} fill="black" />
                        </Group>
                      )}
                      {isSelected && (
                        <Transformer
                          anchorSize={6}
                          borderDash={[6, 2]}
                          onTransformEnd={(e) => {
                            const node = e.target;
                            const scaleX = node.scaleX();
                            node.scaleX(1);
                            node.scaleY(1);
                            updateShape(shape.id, {
                              radius: Math.max(5, r * scaleX)
                            });
                          }}
                          ref={(node) => {
                            if (isSelected && node) {
                              const stage = node.getStage();
                              const selectedNode = stage?.findOne(`#${shape.id}`);
                              if (selectedNode) {
                                node.nodes([selectedNode]);
                                node.getLayer()?.batchDraw();
                              }
                            }
                          }}
                        />
                      )}
                    </Group>
                  );
                }
            if (shape.type === 'text') {
              return (
                <React.Fragment key={shape.id}>
                  <Text 
                    {...props} 
                    text={shape.text} 
                    fontSize={24} 
                    fontFamily="'Space Grotesk', sans-serif" 
                    fontStyle="bold" 
                  />
                  {isSelected && (
                   <Transformer
                      rotateEnabled={true}
                      enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                      ref={(node) => {
                        if (isSelected && node) {
                          const stage = node.getStage();
                          const selectedNode = stage?.findOne(`#${shape.id}`);
                          if (selectedNode) {
                            node.nodes([selectedNode]);
                            node.getLayer()?.batchDraw();
                          }
                        }
                      }}
                    />
                  )}
                </React.Fragment>
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
        </motion.div>
      </div>
    </div>
  );
}
