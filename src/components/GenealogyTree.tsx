import React from 'react';
import { motion } from 'motion/react';
import { GitBranch, User, Sparkles, Hash, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface GenealogyNode {
  id: string;
  type: 'ORIGINAL' | 'REMIX' | 'GLITCH';
  author: string;
  timestamp: string;
  transformation: string;
  seed: string;
}

interface GenealogyTreeProps {
  nodes: GenealogyNode[];
  onClose: () => void;
}

export function GenealogyTree({ nodes, onClose }: GenealogyTreeProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white brutal-border max-w-4xl w-full max-h-[80vh] overflow-y-auto brutal-shadow-lg"
      >
        <div className="p-8 border-b-4 border-black flex justify-between items-center bg-pop-green">
           <div className="flex items-center gap-3">
              <GitBranch size={32} />
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Neural_Ledger_Pedigree</h2>
           </div>
           <button onClick={onClose} className="brutal-btn bg-black text-white px-6">CLOSE_LOG</button>
        </div>

        <div className="p-8 space-y-12 relative">
           {/* Connecting Line */}
           <div className="absolute left-[51px] top-12 bottom-12 w-1 bg-black/10" />

           {nodes.map((node, index) => (
             <motion.div 
               key={node.id}
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: index * 0.1 }}
               className="flex gap-8 relative z-10"
             >
                <div className={cn(
                  "w-20 h-20 shrink-0 brutal-border flex items-center justify-center brutal-shadow-sm",
                  node.type === 'ORIGINAL' ? "bg-pop-yellow" : "bg-white"
                )}>
                   {node.type === 'ORIGINAL' ? <Sparkles size={32} /> : <GitBranch size={32} />}
                </div>

                <div className="flex-1 space-y-4">
                   <div className="flex items-center gap-3">
                      <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">{node.type}</span>
                      <span className="text-[10px] font-black opacity-30 italic">{node.timestamp}</span>
                   </div>
                   
                   <div className="bg-gray-100 brutal-border-sm p-4 relative">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                            <User size={14} className="text-pop-pink" />
                            <p className="text-sm font-black italic uppercase">@{node.author}</p>
                         </div>
                         <div className="flex items-center gap-1 text-pop-cyan">
                            <Hash size={12} />
                            <span className="text-[10px] font-black">{node.seed}</span>
                         </div>
                      </div>
                      <p className="text-xs font-bold uppercase text-black/70 leading-relaxed italic">
                         {node.transformation}
                      </p>
                      
                      {index < nodes.length - 1 && (
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black text-white p-1 rounded-full brutal-border-sm">
                           <ArrowRight size={12} className="rotate-90" />
                        </div>
                      )}
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="p-8 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-between">
           <span>Total_Generations: {nodes.length}</span>
           <span className="text-pop-green">LEDGER_SYNC_VERIFIED</span>
        </div>
      </motion.div>
    </div>
  );
}
