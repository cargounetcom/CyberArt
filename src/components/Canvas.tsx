import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Transformer, Text, Image as KonvaImage, Group, Line } from 'react-konva';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, MousePointer2, Type, Circle as CircleIcon, Square, Save, RefreshCw, Wand2, Fullscreen, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import useImage from 'use-image';

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
}

const URLLoadedImage = ({ shape, isSelected, onSelect, onChange, viewMode }: { 
  shape: ShapeProps, 
  isSelected: boolean, 
  onSelect: () => void, 
  onChange: (newAttrs: any) => void,
  viewMode: '2d' | '3d'
}) => {
  const [img] = useImage(shape.imageSource || '');
  const shapeRef = React.useRef<any>(null);
  const trRef = React.useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={img}
        id={shape.id}
        x={shape.x}
        y={shape.y}
        width={shape.width || 200}
        height={shape.height || 200}
        draggable={viewMode === '2d'}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
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
    </React.Fragment>
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
}

export function CanvasControl({ initialShapes, onSave, isSaving }: CanvasControlProps) {
  const [shapes, setShapes] = useState<ShapeProps[]>([]);
  const [selectedId, selectShape] = useState<string | null>(null);
  const stageRef = useRef<any>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState<'square' | 'a4' | 'poster' | 'tiktok' | 'video' | 'banner'>('square');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
    setShapes(initialShapes || []);
  }, [initialShapes]);

  const addShape = (type: ShapeProps['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newShape: ShapeProps = {
      id,
      type,
      x: containerSize.width / 2 - 50,
      y: containerSize.height / 2 - 50,
      fill: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: 0,
      ...(type === 'rect' && { width: 100, height: 100, depth: 0, tilt: 45 }),
      ...(type === 'circle' && { radius: 50, depth: 0, tilt: 45 }),
      ...(type === 'text' && { text: 'POP ART', width: 200, depth: 0, tilt: 45 }),
      ...(type === 'image' && { width: 200, height: 200, depth: 0, tilt: 45 }),
    };
    setShapes([...shapes, newShape]);
    selectShape(id);
  };

  const generateAIImage = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      const refinedPrompt = data.refinedPrompt || aiPrompt;

      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(refinedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
      
      const id = `ai-${Date.now()}`;
      const newShape: ShapeProps = {
        id,
        type: 'image',
        x: containerSize.width / 2 - 150,
        y: containerSize.height / 2 - 150,
        width: 300,
        height: 300,
        fill: 'transparent',
        rotation: 0,
        imageSource: imageUrl
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

  const updateShape = (id: string, attrs: Partial<ShapeProps>) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...attrs } : s));
  };

  const selectedShape = shapes.find(s => s.id === selectedId);

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
          
          <div className="flex items-center gap-2 border-l-2 border-black pl-4 ml-2">
            <input 
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="GENERATE_PROMPT..."
              className="bg-white border-2 border-black px-3 py-2 text-[10px] font-black uppercase placeholder:opacity-30 outline-none w-48 brutal-shadow-sm focus:bg-pop-yellow transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && generateAIImage()}
            />
            <button
              onClick={generateAIImage}
              disabled={isGenerating || !aiPrompt}
              className="w-10 h-10 bg-pop-green border-2 border-black brutal-shadow-sm flex items-center justify-center hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
              title="Generate AI Masterpiece"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
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
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={deleteSelected}
                className="w-10 h-10 bg-red-500 text-white border-2 border-black brutal-shadow-sm flex items-center justify-center hover:bg-red-600 transition-all active:translate-y-0.5 active:shadow-none"
              >
                <Trash2 size={20} />
              </motion.button>
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
          className="bg-white border-4 border-black relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
          <Stage
            width={containerSize.width}
            height={containerSize.height}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            ref={stageRef}
          >
            <Layer>
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
