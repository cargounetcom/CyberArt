import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Globe, Download, Sparkles, Filter, RefreshCw, Layers, ExternalLink, Library } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { fetchMetObjects, searchMetObjects, MetObject } from '../services/metService';
import { fetchChicagoObjects, searchChicagoObjects, getChicagoImageUrl, ChicagoObject } from '../services/chicagoService';
import { fetchClevelandObjects, searchClevelandObjects, ClevelandObject } from '../services/clevelandService';
import { fetchEuropeanaObjects, searchEuropeanaObjects, EuropeanaObject } from '../services/europeanaService';
import { fetchTateObjects, searchTateObjects, TateObject } from '../services/tateService';

interface ArchiveItem {
  id: string;
  title: string;
  author: string;
  year: string;
  institution: string;
  thumbnail: string;
  category: string;
  suggestedStyle?: string;
  externalUrl?: string;
}

type ArchiveSourceType = 'MET' | 'CHICAGO' | 'CLEVELAND' | 'EUROPEANA' | 'TATE';

export function ArchiveUplink({ onImport }: { onImport: (item: ArchiveItem) => void }) {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeSource, setActiveSource] = useState<ArchiveSourceType | 'GOOGLE'>('MET');
  const [results, setResults] = useState<ArchiveItem[]>([]);
  const [points, setPoints] = useState(0);
  const [connectedSources, setConnectedSources] = useState<Set<string>>(new Set(['MET']));

  useEffect(() => {
    handleFetchInitial('MET');
  }, []);

  const handleSearch = async (queryOverride?: string) => {
    const query = queryOverride || search;
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      let items: ArchiveItem[] = [];
      
      // Inject Special Virtual SKUs
      const specialSKUs: ArchiveItem[] = [
        {
          id: 'field-journal-tate-1936',
          title: 'Field Journal: Archbold 1936 New Guinea Exp',
          author: 'Tate, G. H. H. (George Henry Hamilton)',
          year: '1936',
          institution: 'ARCHBOLD_EXPEDITIONS',
          thumbnail: 'https://pollinations.ai/p/vintage%20handwritten%20field%20journal%20sketchbook%20open%20on%20a%20wooden%20desk%20magnifying%20glass%20sepia%20scientific%20notes?width=512&height=512&seed=8821&nologo=true',
          category: 'FIELD_ARCHIVE'
        },
        {
          id: 'remix-vangogh-cyber-2',
          title: 'VAN_GOGH_CYBER_SKU_02',
          author: 'VINCENT_VAN_GOGH',
          year: '2026_AI_CORE',
          institution: 'VIRTUAL_MARKET',
          thumbnail: 'https://pollinations.ai/p/Sunflowers%20remix%20neon%20circuitry%20glowing%20petals%20cyberpunk?width=512&height=512&seed=3312&nologo=true',
          category: 'NEURAL_REMIX'
        },
        {
          id: 'remix-vangogh-cyber-3',
          title: 'VAN_GOGH_CYBER_SKU_03',
          author: 'VINCENT_VAN_GOGH',
          year: '2026_AI_CORE',
          institution: 'VIRTUAL_MARKET',
          thumbnail: 'https://pollinations.ai/p/Van%20Gogh%20self-portrait%20remix%20cyber%20implants%20neon%20brushstrokes?width=512&height=512&seed=4412&nologo=true',
          category: 'NEURAL_REMIX'
        }
      ];

      const searchLower = query.toLowerCase();
      const filteredSKUs = specialSKUs.filter(sku => 
        sku.title.toLowerCase().includes(searchLower) || 
        sku.author.toLowerCase().includes(searchLower) ||
        searchLower.includes('cyber') ||
        searchLower.includes('gogh') ||
        searchLower.includes('sku')
      );

      if (activeSource === 'MET') {
        const raw = await searchMetObjects(query, 12);
        items = raw.map(obj => ({
          id: `met-${obj.objectID}`,
          title: obj.title,
          author: obj.artistDisplayName || 'UNKNOWN',
          year: obj.objectDate || 'N/A',
          institution: 'MET_MUSEUM',
          thumbnail: obj.primaryImageSmall,
          category: obj.department || 'GENERAL',
          externalUrl: obj.objectURL
        }));
      } else if (activeSource === 'CHICAGO') {
        const raw = await searchChicagoObjects(query, 12);
        items = raw.map(obj => ({
          id: `chi-${obj.id}`,
          title: obj.title,
          author: obj.artist_display || 'UNKNOWN',
          year: obj.date_display || 'N/A',
          institution: 'AIC_CHICAGO',
          thumbnail: getChicagoImageUrl(obj.image_id),
          category: obj.department_title || 'ARTS',
          externalUrl: `https://www.artic.edu/artworks/${obj.id}`
        }));
      } else if (activeSource === 'CLEVELAND') {
        const raw = await searchClevelandObjects(query, 12);
        items = raw.map(obj => ({
          id: `cle-${obj.id}`,
          title: obj.title,
          author: obj.creators?.[0]?.description || 'UNKNOWN',
          year: obj.creation_date || 'N/A',
          institution: 'CLEVELAND_ART',
          thumbnail: obj.images?.web?.url,
          category: obj.department || 'CURATED',
          externalUrl: `https://www.clevelandart.org/art/${obj.id}`
        }));
      } else if (activeSource === 'EUROPEANA') {
        const raw = await searchEuropeanaObjects(query, 12);
        items = raw.map(obj => ({
          id: `eur-${obj.id}`,
          title: obj.title?.[0] || 'UNTITLED',
          author: obj.dcCreator?.[0] || 'UNKNOWN',
          year: obj.year?.[0] || 'N/A',
          institution: 'EUROPEANA_EU',
          thumbnail: obj.edmPreview?.[0] || obj.edmIsShownBy?.[0] || '',
          category: 'HERITAGE',
          externalUrl: `https://www.europeana.eu/record/${obj.id}`
        }));
      } else if (activeSource === 'TATE') {
        const raw = await searchTateObjects(query, 12);
        items = raw.map(obj => ({
          id: `tate-${obj.id}`,
          title: obj.title?.[0] || 'UNTITLED',
          author: obj.dcCreator?.[0] || 'TATE_COLLECTION',
          year: obj.year?.[0] || 'N/A',
          institution: 'TATE_BRITAIN',
          thumbnail: obj.edmPreview?.[0] || obj.edmIsShownBy?.[0] || '',
          category: 'BRITISH_ARCHIVE',
          externalUrl: `https://www.europeana.eu/record/${obj.id}`
        }));
      }
      setResults([...filteredSKUs, ...items.filter(i => i.thumbnail)]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFetchInitial = async (source: ArchiveSourceType) => {
    setActiveSource(source);
    setIsSearching(true);
    try {
        let items: ArchiveItem[] = [];
        if (source === 'MET') {
            const raw = await fetchMetObjects(12);
            items = raw.map(obj => ({
                id: `met-${obj.objectID}`,
                title: obj.title,
                author: obj.artistDisplayName || 'UNKNOWN',
                year: obj.objectDate || 'N/A',
                institution: 'MET_MUSEUM',
                thumbnail: obj.primaryImageSmall,
                category: obj.department || 'GENERAL',
                externalUrl: obj.objectURL
            }));
        } else if (source === 'CHICAGO') {
            const raw = await fetchChicagoObjects(12);
            items = raw.map(obj => ({
                id: `chi-${obj.id}`,
                title: obj.title,
                author: obj.artist_display || 'UNKNOWN',
                year: obj.date_display || 'N/A',
                institution: 'AIC_CHICAGO',
                thumbnail: getChicagoImageUrl(obj.image_id),
                category: obj.department_title || 'ARTS',
                externalUrl: `https://www.artic.edu/artworks/${obj.id}`
            }));
        } else if (source === 'CLEVELAND') {
            const raw = await fetchClevelandObjects(12);
            items = raw.map(obj => ({
                id: `cle-${obj.id}`,
                title: obj.title,
                author: obj.creators?.[0]?.description || 'UNKNOWN',
                year: obj.creation_date || 'N/A',
                institution: 'CLEVELAND_ART',
                thumbnail: obj.images?.web?.url,
                category: obj.department || 'CURATED',
                externalUrl: `https://www.clevelandart.org/art/${obj.id}`
            }));
        } else if (source === 'EUROPEANA') {
            const raw = await fetchEuropeanaObjects(12);
            items = raw.map(obj => ({
                id: `eur-${obj.id}`,
                title: obj.title?.[0] || 'UNTITLED',
                author: obj.dcCreator?.[0] || 'UNKNOWN',
                year: obj.year?.[0] || 'N/A',
                institution: 'EUROPEANA_EU',
                thumbnail: obj.edmPreview?.[0] || obj.edmIsShownBy?.[0] || '',
                category: 'HERITAGE',
                externalUrl: `https://www.europeana.eu/record/${obj.id}`
            }));
        } else if (source === 'TATE') {
            const raw = await fetchTateObjects(12);
            items = raw.map(obj => ({
                id: `tate-${obj.id}`,
                title: obj.title?.[0] || 'UNTITLED',
                author: obj.dcCreator?.[0] || 'TATE_COLLECTION',
                year: obj.year?.[0] || 'N/A',
                institution: 'TATE_BRITAIN',
                thumbnail: obj.edmPreview?.[0] || obj.edmIsShownBy?.[0] || '',
                category: 'BRITISH_ARCHIVE',
                externalUrl: `https://www.europeana.eu/record/${obj.id}`
            }));
        }
        // ... add Cleveland/Europeana initial if wanted, but search covers it well
        setResults(items.filter(i => i.thumbnail));
    } finally {
        setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-20">
      {/* Search Header */}
      <div className="brutal-border bg-black text-white p-12 brutal-shadow-lg flex flex-col md:flex-row gap-8 items-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="flex-1 space-y-6">
           <div className="flex items-center gap-3">
              <Globe className="text-pop-cyan animate-pulse" size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest text-pop-cyan">GLOBAL_UPLINK: MULTI_MUSEUM_SYNC_ACTIVE</span>
           </div>
           <h2 className="leading-none mb-4 uppercase italic font-display">ArtCyber_Library_Sync</h2>
            <div className="flex flex-wrap gap-4 mb-4">
               {(['MET', 'CHICAGO', 'CLEVELAND', 'EUROPEANA', 'TATE'] as ArchiveSourceType[]).map(src => (
                  <button 
                    key={src}
                    onClick={() => {
                        handleFetchInitial(src);
                        if (!connectedSources.has(src)) {
                            setConnectedSources(prev => new Set(prev).add(src));
                            setPoints(p => p + 5);
                        }
                    }}
                    className={cn(
                        "brutal-btn-sm px-4 py-1 text-[9px] font-black uppercase",
                        activeSource === src ? "bg-pop-green text-black" : "bg-white text-black hover:bg-pop-yellow"
                    )}
                  >
                    {src}_SOURCE <span className="text-[7px] opacity-70 ml-1">+5_PT</span>
                  </button>
               ))}
               <button 
                 disabled
                 className="brutal-btn-sm px-4 py-1 text-[9px] font-black uppercase bg-gray-600 text-gray-400 cursor-not-allowed flex items-center gap-2"
               >
                 GOOGLE_ARTS_SOURCE [LOCKED]
               </button>
            </div>
            <div className="flex items-center gap-4 mb-4">
                <div className="bg-pop-green text-black px-4 py-1 text-[10px] font-black uppercase italic">
                    UPLINK_SCORE: {points}
                </div>
                <div className="flex-1 max-w-xs h-2 bg-gray-800 brutal-border-sm relative">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(connectedSources.size / 5) * 100}%` }}
                        className="absolute inset-y-0 left-0 bg-pop-cyan"
                    />
                </div>
                <span className="text-[8px] font-black uppercase text-pop-cyan">POLE_SIGNAL: {(connectedSources.size / 5) * 100}%</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
               {['Claude Monet', 'Vincent van Gogh', 'Camille Pissarro', 'Impressionism', 'Post-Impressionism', 'Modernism', 'Realism', 'Romanticism', 'European Art'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearch(tag);
                      handleSearch(tag);
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-pop-yellow hover:text-black brutal-border-sm text-[8px] font-black uppercase transition-all"
                  >
                    {tag}
                  </button>
               ))}
            </div>
            <div className="relative group max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-hover:text-pop-yellow transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={`SEARCH_QUERIES_FOR_${activeSource}_NODES...`} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-12 py-5 bg-white text-black brutal-border font-black text-lg italic uppercase outline-none focus:bg-pop-yellow transition-colors"
              />
              <button 
                onClick={() => handleSearch()}
                className="absolute right-2 top-1/2 -translate-y-1/2 brutal-btn-sm bg-black text-white px-6 h-10 hover:bg-pop-pink"
              >
                {isSearching ? <RefreshCw className="animate-spin" size={16} /> : 'CONNECT_POINTS'}
              </button>
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {results.length > 0 ? results.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="brutal-border bg-white p-6 brutal-shadow-sm group-hover:brutal-shadow transition-all flex flex-col h-full gap-4">
                 <div className="aspect-square brutal-border bg-gray-100 overflow-hidden relative">
                    <img src={item.thumbnail} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={item.title} />
                    <div className="absolute top-2 left-2 flex gap-2">
                       <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase brutal-border-sm">{item.category}</span>
                       <span className="bg-pop-cyan text-black px-2 py-0.5 text-[8px] font-black uppercase brutal-border-sm">{item.institution}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm p-4 text-center">
                       <div className="space-y-4">
                          <p className="text-white text-[10px] font-bold uppercase leading-tight italic">
                             SYNCED_ARTIFACT_ID: {item.id}
                          </p>
                          <button 
                            onClick={() => onImport(item)}
                            className="brutal-btn bg-pop-green text-black flex items-center gap-2 text-xs font-black"
                          >
                             <Download size={16} />
                             IMPORT_TO_NEURAL_STUDIO
                          </button>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex-1 flex flex-col gap-1">
                    <p className="text-[10px] font-black uppercase opacity-40">{item.institution} / {item.year}</p>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none group-hover:text-pop-cyan transition-colors truncate">{item.title}</h3>
                    <p className="text-xs font-black italic uppercase opacity-60">@{item.author || 'UNKNOWN'}</p>
                 </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center space-y-4">
               {isSearching ? <RefreshCw className="mx-auto text-pop-pink animate-spin" size={64} /> : <Library className="mx-auto text-black/10" size={64} />}
               <p className="font-black uppercase italic opacity-30">
                  {isSearching ? 'UPLINKING_REMOTE_DATA_POINTS...' : 'NO_COLLECTION_NODES_FOUND_IN_THIS_SECTOR.'}
               </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Stats */}
      <div className="brutal-border p-10 bg-gray-50 border-t-8 border-black">
         <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center">
            <div className="space-y-1">
               <p className="text-[10px] font-black opacity-40 uppercase">MET_NODES</p>
               <p className="text-2xl font-black italic">406,291</p>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black opacity-40 uppercase">CHICAGO_NODES</p>
               <p className="text-2xl font-black italic">121,082</p>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black opacity-40 uppercase">CLEVELAND_NODES</p>
               <p className="text-2xl font-black italic">63,401</p>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black opacity-40 uppercase">EUROPEANA_NODES</p>
               <p className="text-2xl font-black italic text-pop-cyan">58M+</p>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black opacity-40 uppercase">TATE_NODES</p>
               <p className="text-2xl font-black italic text-pop-pink">78K+</p>
            </div>
         </div>
      </div>
    </div>
  );
}
