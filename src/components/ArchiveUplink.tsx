import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Globe, Download, Sparkles, Filter, RefreshCw, Layers, ExternalLink } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ArchiveItem {
  id: string;
  title: string;
  author: string;
  year: string;
  institution: string;
  thumbnail: string;
  category: 'RENAISSANCE' | 'BAROQUE' | 'MODERN' | 'SURREAL';
}

const MOCK_ARCHIVE_RESULTS: ArchiveItem[] = [
  {
    id: 'arc-1',
    title: 'THE_GARDEN_OF_EARTHLY_DELIGHTS',
    author: 'HIERONYMUS_BOSCH',
    year: '1500',
    institution: 'PRADO_MUSEUM',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg/1280px-The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg',
    category: 'RENAISSANCE'
  },
  {
    id: 'arc-2',
    title: 'THE_NIGHT_WATCH',
    author: 'REMBRANDT',
    year: '1642',
    institution: 'RIJKSMUSEUM',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg',
    category: 'BAROQUE'
  },
  {
    id: 'arc-3',
    title: 'STARRY_NIGHT',
    author: 'VINCENT_VAN_GOGH',
    year: '1889',
    institution: 'MOMA',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    category: 'MODERN'
  }
];

export function ArchiveUplink({ onImport }: { onImport: (item: ArchiveItem) => void }) {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ArchiveItem[]>(MOCK_ARCHIVE_RESULTS);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 min-h-screen pb-20">
      {/* Search Header */}
      <div className="brutal-border bg-black text-white p-12 brutal-shadow-lg flex flex-col md:flex-row gap-8 items-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="flex-1 space-y-6">
           <div className="flex items-center gap-3">
              <Globe className="text-pop-cyan animate-pulse" size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest text-pop-cyan">UPLINK_STATUS: SYNCHRONIZED</span>
           </div>
           <h2 className="leading-none mb-4">Archives_Discovery</h2>
           <div className="relative group max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-hover:text-pop-yellow transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="SEARCH_GOOG_ARTS_CULTURE_DB..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-12 py-5 bg-white text-black brutal-border font-black text-lg italic uppercase outline-none focus:bg-pop-yellow transition-colors"
              />
              <button 
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 brutal-btn-sm bg-black text-white px-6 h-10 hover:bg-pop-pink"
              >
                {isSearching ? <RefreshCw className="animate-spin" size={16} /> : 'QUERY'}
              </button>
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 border-b-4 border-black pb-4">
         {['ALL_ARCHIVES', 'RENAISSANCE', 'BAROQUE', 'MODERN', 'SURREAL'].map(cat => (
           <button key={cat} className="px-4 py-1 text-[10px] font-black uppercase brutal-border-sm hover:bg-pop-cyan transition-colors">
              {cat}
           </button>
         ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {results.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="brutal-border bg-white p-6 brutal-shadow-sm group-hover:brutal-shadow transition-all flex flex-col h-full gap-4">
                 <div className="aspect-square brutal-border bg-gray-100 overflow-hidden relative">
                    <img src={item.thumbnail} className="w-full h-full object-cover" alt={item.title} />
                    <div className="absolute top-2 left-2 flex gap-2">
                       <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase brutal-border-sm">{item.category}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm p-4 text-center">
                       <div className="space-y-4">
                          <p className="text-white text-[10px] font-bold uppercase leading-tight italic">
                             High-fidelity archive scan from the {item.institution}. Ready for neural extraction.
                          </p>
                          <button 
                            onClick={() => onImport(item)}
                            className="brutal-btn bg-pop-green text-black flex items-center gap-2 text-xs"
                          >
                             <Download size={16} />
                             IMPORT_TO_STUDIO
                          </button>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex-1 flex flex-col gap-1">
                    <p className="text-[10px] font-black uppercase opacity-40">{item.institution} / {item.year}</p>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none group-hover:text-pop-cyan transition-colors truncate">{item.title}</h3>
                    <p className="text-xs font-black italic uppercase opacity-60">@{item.author}</p>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-black/10">
                    <div className="flex items-center gap-2 text-pop-pink">
                       <Layers size={14} />
                       <span className="text-[9px] font-black uppercase italic">Neural_Layers_Ready</span>
                    </div>
                    <ExternalLink size={14} className="opacity-20" />
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Insights */}
      <div className="brutal-border p-10 bg-gray-100">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-pop-pink">
                  <Sparkles size={20} />
                  <h4 className="text-xl font-black italic">Neural_Archive_Protocol</h4>
               </div>
               <p className="text-sm font-bold uppercase leading-relaxed opacity-60">
                  The Archive Discovery tool uses authorized neural uplinks to bypass physical curation limits. Imported assets are converted into high-fidelity "Ghost Nodes" that can be manipulated within the ArtRemix Studio environment without compromising original integrity.
               </p>
            </div>
            <div className="flex items-center justify-center">
               <div className="text-center p-8 bg-white brutal-border w-full">
                  <h5 className="text-3xl font-black italic tracking-tighter leading-none mb-2 underline decoration-pop-cyan decoration-4">LINKED_NODES: 3.4M</h5>
                  <p className="text-[10px] font-black uppercase opacity-40 italic">Syncing across 48 international institutions.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
