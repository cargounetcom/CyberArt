import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, Info, Sparkles, MapPin, Eye, ArrowLeft, History } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface MuseumArtifact {
  id: string;
  title: string;
  author: string;
  year: string;
  source: string;
  imageUrl: string;
  donationStatus: 'RESTORING' | 'PRESERVED' | 'DIGITIZING';
  description: string;
  suggestedStyle?: string;
}

const MUSEUM_COLLECTION: MuseumArtifact[] = [
  {
    id: 'm-1',
    title: 'THE_NEURAL_SMILE',
    author: 'DA_VINCI_AI',
    year: '1503 / 2026',
    source: 'LOUVRE_SYNC',
    imageUrl: 'https://pollinations.ai/p/Mona%20Lisa%20hyper%20detailed%20neural%20restoration?width=800&height=1000&seed=44',
    donationStatus: 'PRESERVED',
    description: 'Neural restoration funded via ArtRemix Marketplace commissions. Every pixel recalibrated for 4K display.',
    suggestedStyle: 'IMPRESSIONISM'
  },
  {
    id: 'm-2',
    title: 'GOTHIC_UPLINK',
    author: 'GRANT_WOOD_REMESS',
    year: '1930 / 2026',
    source: 'AIC_UPLINK',
    imageUrl: 'https://pollinations.ai/p/American%20Gothic%20painting%20high%20resolution%20digital%20archive?width=800&height=1000&seed=99',
    donationStatus: 'DIGITIZING',
    description: 'High-fidelity digitization in progress. Funded by the April 2026 collector cycle.',
    suggestedStyle: 'GHOSTLY_GOTHIC'
  },
  {
    id: 'm-3',
    title: 'STARRY_GHOST',
    author: 'VAN_GOGH_NEURAL',
    year: '1889 / 2026',
    source: 'MOMA_SYNC',
    imageUrl: 'https://pollinations.ai/p/Starry%20Night%20neural%20remix%20painting%20swirls%20glowing?width=1000&height=800&seed=11',
    donationStatus: 'RESTORING',
    description: 'Currently undergoing layer-by-layer neural extraction to preserve the brushwork fingerprints for eternity.',
    suggestedStyle: 'POINTILLISM'
  },
  {
    id: 'm-4',
    title: 'CAFE_TERRACE_NEURAL',
    author: 'VAN_GOGH_AI',
    year: '1888 / 2026',
    source: 'KROLLER_SYNC',
    imageUrl: 'https://pollinations.ai/p/Cafe%20Terrace%20at%20Night%20Van%20Gogh%20neural%20restoration%20glowing%20stars?width=800&height=1000&seed=77',
    donationStatus: 'PRESERVED',
    description: 'A study in neural stippling and nocturnal luminescence. The dots are recalculated using Pointillism algorithms.',
    suggestedStyle: 'POINTILLISM'
  },
  {
    id: 'm-5',
    title: 'CYBER_SUNFLOWERS',
    author: 'VAN_GOGH_AI',
    year: '1888 / 2026',
    source: 'NG_SYNC',
    imageUrl: 'https://pollinations.ai/p/Sunflowers%20Van%20Gogh%20painting%20hyper%20detailed%20texture?width=800&height=1000&seed=88',
    donationStatus: 'DIGITIZING',
    description: 'Deconstructing the organic curves of the sunflowers into digital vectors while maintaining the impressionist vibrance.',
    suggestedStyle: 'IMPRESSIONISM'
  }
];

interface MuseumProps {
  onImport?: (artifact: { imageUrl: string, title: string, author: string, suggestedStyle?: string }) => void;
}

export function Museum({ onImport }: MuseumProps) {
  const [selectedArtifact, setSelectedArtifact] = useState<MuseumArtifact | null>(null);

  return (
    <div className="space-y-12 pb-20">
      {/* Museum Hero */}
      <div className="brutal-border bg-pop-cyan p-12 brutal-shadow-lg flex flex-col md:flex-row gap-10 items-center">
        <div className="w-32 h-32 bg-black text-white flex items-center justify-center brutal-border shrink-0">
          <Landmark size={64} />
        </div>
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 text-[10px] font-black uppercase italic">
              <History size={14} className="text-pop-yellow" />
              Archives_Preservation_Fund
           </div>
           <h2 className="leading-none mb-4">Virtual_Museum</h2>
           <p className="max-w-2xl text-xs md:text-sm font-bold uppercase opacity-80 leading-relaxed">
              Every transaction on ArtRemix contributes 1% to the Global Historical Sync. These artifacts represent the heritage we are preserving in the neural cloud.
           </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="brutal-border p-6 bg-white brutal-shadow-sm border-2 border-dashed border-black">
            <p className="text-[10px] font-black uppercase opacity-50">Total_Archives_Synced</p>
            <p className="text-4xl font-black italic">14,291</p>
         </div>
         <div className="brutal-border p-6 bg-black text-white brutal-shadow-sm">
            <p className="text-[10px] font-black uppercase opacity-50">Preservation_Capital</p>
            <p className="text-4xl font-black italic text-pop-green">€489.2K</p>
         </div>
         <div className="brutal-border p-6 bg-pop-pink text-white brutal-shadow-sm">
            <p className="text-[10px] font-black uppercase opacity-50">Neural_Extractions</p>
            <p className="text-4xl font-black italic">892 Items</p>
         </div>
      </div>

      {/* Artifact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {MUSEUM_COLLECTION.map((artifact) => (
            <motion.div
              key={artifact.id}
              layoutId={artifact.id}
              onClick={() => setSelectedArtifact(artifact)}
              className="group cursor-pointer"
            >
              <div className="brutal-border bg-white p-4 brutal-shadow-sm group-hover:brutal-shadow transition-all relative overflow-hidden">
                <div className="aspect-[4/5] bg-gray-100 brutal-border mb-4 overflow-hidden">
                   <img src={artifact.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-grayscale duration-700" alt={artifact.title} />
                </div>
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-tighter opacity-50">{artifact.source}</p>
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">{artifact.title}</h3>
                   </div>
                   <span className={cn(
                      "px-2 py-0.5 text-[8px] font-black uppercase brutal-border-sm",
                      artifact.donationStatus === 'PRESERVED' ? "bg-pop-green" :
                      artifact.donationStatus === 'DIGITIZING' ? "bg-pop-cyan" : "bg-pop-yellow"
                   )}>
                      {artifact.donationStatus}
                   </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detailed Modal Overlay */}
      <AnimatePresence>
        {selectedArtifact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-8"
          >
            <motion.div 
               layoutId={selectedArtifact.id}
               className="bg-white brutal-border max-w-5xl w-full flex flex-col md:flex-row overflow-hidden relative shadow-[20px_20px_0_0_rgba(0,0,0,1)]"
            >
               <button 
                 onClick={() => setSelectedArtifact(null)}
                 className="absolute top-4 right-4 z-10 w-12 h-12 bg-black text-white brutal-border flex items-center justify-center hover:bg-pop-pink transition-colors"
               >
                 <ArrowLeft size={24} />
               </button>

               <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
                  <div className="w-full h-full brutal-border overflow-hidden">
                     <img src={selectedArtifact.imageUrl} className="w-full h-full object-cover" alt={selectedArtifact.title} />
                  </div>
               </div>

               <div className="md:w-1/2 p-12 flex flex-col justify-center">
                  <div className="space-y-6">
                     <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-pop-cyan">{selectedArtifact.source} / {selectedArtifact.year}</p>
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{selectedArtifact.title}</h2>
                        <p className="text-xl font-black italic opacity-50">BY_{selectedArtifact.author}</p>
                     </div>

                     <div className="p-6 bg-gray-100 brutal-border-sm">
                        <div className="flex items-center gap-2 mb-4 text-pop-pink">
                           <Sparkles size={16} />
                           <h4 className="text-xs font-black uppercase">Archive_Insight</h4>
                        </div>
                        <p className="text-sm font-bold uppercase leading-relaxed opacity-70">
                           {selectedArtifact.description}
                        </p>
                     </div>

                     <div className="space-y-4">
                        <button 
                          onClick={() => {
                            onImport?.({
                              imageUrl: selectedArtifact.imageUrl,
                              title: selectedArtifact.title,
                              author: selectedArtifact.author,
                              suggestedStyle: selectedArtifact.suggestedStyle
                            });
                            setSelectedArtifact(null);
                          }}
                          className="w-full brutal-btn bg-pop-yellow text-black flex items-center justify-center gap-3 py-4 font-black italic uppercase"
                        >
                           <Sparkles size={20} />
                           EXTRACT_FOR_NEURAL_REMIX
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                           <a 
                             href={selectedArtifact.imageUrl}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="brutal-btn bg-black text-white flex items-center justify-center gap-2 py-3 no-underline"
                           >
                              <Eye size={18} />
                              VIEW_HQ
                           </a>
                           <button className="brutal-btn bg-pop-green text-black flex items-center justify-center gap-2 py-3">
                              <MapPin size={18} />
                              FIND_ORIGINAL
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
