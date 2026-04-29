import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, Info, Sparkles, MapPin, Eye, ArrowLeft, History, RefreshCw, Library, Search, ShoppingBag, Layers, CheckCircle2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { fetchMetObjects, searchMetObjects, MetObject } from '../services/metService';
import { fetchChicagoObjects, searchChicagoObjects, getChicagoImageUrl, ChicagoObject } from '../services/chicagoService';
import { fetchClevelandObjects, searchClevelandObjects, ClevelandObject } from '../services/clevelandService';
import { fetchEuropeanaObjects, searchEuropeanaObjects, EuropeanaObject } from '../services/europeanaService';

interface MuseumArtifact {
  id: string;
  title: string;
  author: string;
  year: string;
  source: string;
  imageUrl: string;
  donationStatus: 'RESTORING' | 'PRESERVED' | 'DIGITIZING' | 'NEURAL_REMIX' | 'LIVE_UPLINK';
  description: string;
  suggestedStyle?: string;
  externalUrl?: string;
}

type MuseumSourceType = 'MET' | 'CHICAGO' | 'CLEVELAND' | 'EUROPEANA';

interface MuseumProps {
  onImport?: (artifact: { imageUrl: string, title: string, author: string, suggestedStyle?: string }) => void;
}

export function Museum({ onImport }: MuseumProps) {
  const [selectedArtifact, setSelectedArtifact] = useState<MuseumArtifact | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderMaterial, setOrderMaterial] = useState<'PAPER' | 'CANVAS'>('PAPER');
  const [orderSize, setOrderSize] = useState<'small' | 'medium' | 'large' | 'extra_large'>('medium');
  const [isFramed, setIsFramed] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'CONFIG' | 'PAYMENT' | 'PROCESSING'>('CONFIG');
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CARD' | 'CREDITS'>('WALLET');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [apiArtifacts, setApiArtifacts] = useState<MuseumArtifact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<MuseumSourceType>('MET');
  const [searchQuery, setSearchQuery] = useState('');
  const [points, setPoints] = useState(0);
  const [connectedSources, setConnectedSources] = useState<Set<MuseumSourceType>>(new Set(['MET']));

  const COLLECTIONS = [
    'Abstract', 'American', 'Art Deco', 'Cartography', 'Collages', 'Drawings', 
    'Harlem Renaissance', 'Hudson River School', 'Illustrations', 'Impressionism', 
    'Mid Century', 'Modernism', 'Paintings', 'Photography', 'Pop Art', 
    'Post-Impressionism', 'Prints', 'Realism', 'Romanticism', 'Watercolors'
  ];

  const AUTHORS = [
    'Van Gogh', 'Monet', 'Hokusai', 'Rembrandt', 'Degas', 'Cezanne', 'Renoir', 
    'Sargent', 'Homer', 'Bearden', 'Cassatt', 'O\'Keeffe', 'Rivera', 'Kandinsky'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchSource(activeSource, searchQuery);
  };

  useEffect(() => {
    handleFetchSource(activeSource);
    if (!connectedSources.has(activeSource)) {
      setConnectedSources(prev => new Set(prev).add(activeSource));
      setPoints(prev => prev + 5);
    }
  }, [activeSource]);

  const handleFetchSource = async (source: MuseumSourceType, query?: string) => {
    setIsLoading(true);
    try {
      let results: MuseumArtifact[] = [];
      if (source === 'MET') {
        const raw = query ? await searchMetObjects(query, 24) : await fetchMetObjects(12);
        results = raw.map((obj: MetObject) => ({
          id: `met-${obj.objectID}`,
          title: obj.title || 'UNTITLED',
          author: obj.artistDisplayName || 'ANONYMOUS',
          year: obj.objectDate || 'N/A',
          source: 'MET_MUSEUM',
          imageUrl: obj.primaryImageSmall,
          donationStatus: 'LIVE_UPLINK',
          description: `Digital acquisition from The Metropolitan Museum of Art. Department: ${obj.department || 'General'}.`,
          externalUrl: obj.objectURL
        }));
      } else if (source === 'CHICAGO') {
        const raw = query ? await searchChicagoObjects(query, 24) : await fetchChicagoObjects(12);
        results = raw.map((obj: ChicagoObject) => ({
          id: `chi-${obj.id}`,
          title: obj.title || 'UNTITLED',
          author: obj.artist_display || 'ANONYMOUS',
          year: obj.date_display || 'N/A',
          source: 'AIC_CHICAGO',
          imageUrl: getChicagoImageUrl(obj.image_id),
          donationStatus: 'LIVE_UPLINK',
          description: `Archival record from the Art Institute of Chicago. Department: ${obj.department_title || 'Arts'}.`,
          externalUrl: `https://www.artic.edu/artworks/${obj.id}`
        }));
      } else if (source === 'CLEVELAND') {
        const raw = query ? await searchClevelandObjects(query, 24) : await fetchClevelandObjects(12);
        results = raw.map((obj: ClevelandObject) => ({
          id: `cle-${obj.id}`,
          title: obj.title || 'UNTITLED',
          author: obj.creators?.[0]?.description || 'ANONYMOUS',
          year: obj.creation_date || 'N/A',
          source: 'CLEVELAND_ART',
          imageUrl: obj.images?.web?.url,
          donationStatus: 'LIVE_UPLINK',
          description: `Open Access artifact from Cleveland Museum of Art. Department: ${obj.department || 'Curated'}.`,
          externalUrl: `https://www.clevelandart.org/art/${obj.id}`
        }));
      } else if (source === 'EUROPEANA') {
        const raw = query ? await searchEuropeanaObjects(query, 24) : await fetchEuropeanaObjects(12);
        results = raw.map((obj: EuropeanaObject) => ({
          id: `eur-${obj.id}`,
          title: obj.title?.[0] || 'UNTITLED',
          author: obj.dcCreator?.[0] || 'ANONYMOUS',
          year: obj.year?.[0] || 'N/A',
          source: 'EUROPEANA_EU',
          imageUrl: obj.edmPreview?.[0] || '',
          donationStatus: 'LIVE_UPLINK',
          description: `Digital heritage provided by ${obj.dataProvider?.[0] || 'European Institutions'}.`,
          externalUrl: `https://www.europeana.eu/record/${obj.id}`
        }));
      }
      setApiArtifacts(results.filter(r => r.imageUrl));
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const combinedCollection = apiArtifacts;

  return (
    <div className="space-y-12 pb-20">
      {/* Museum Hero */}
      <div className="brutal-border bg-pop-cyan p-12 brutal-shadow-lg flex flex-col lg:flex-row gap-10 items-center">
        <div className="w-32 h-32 bg-black text-white flex items-center justify-center brutal-border shrink-0">
          <Landmark size={64} />
        </div>
        <div className="flex-1 space-y-6">
           <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 text-[10px] font-black uppercase italic">
                 <History size={14} className="text-pop-yellow" />
                 Global_Historical_Sync
              </div>
              <div className="flex items-center gap-4">
                 <div className="hidden sm:flex items-center gap-2 bg-pop-pink/10 border-2 border-pop-pink px-2 py-1">
                    <span className="text-[8px] font-black italic text-pop-pink uppercase tracking-tighter">10%_DONATION_PLEDGE</span>
                    <div className="w-1 h-1 rounded-full bg-pop-pink animate-pulse" />
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black uppercase opacity-60">UPLINK_POINTS</p>
                    <p className="text-xl font-black italic text-pop-green leading-none">{points}_PT</p>
                 </div>
                 <div className="w-24 h-4 bg-gray-200 brutal-border-sm relative overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(connectedSources.size / 5) * 100}%` }}
                      className="absolute inset-y-0 left-0 bg-pop-pink"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black uppercase mix-blend-difference text-white">
                       POLE_STAT: {Math.round((connectedSources.size / 5) * 100)}%
                    </span>
                 </div>
              </div>
           </div>
           <h2 className="leading-none mb-4 italic truncate">UPLINK_MUSEUM_COLLECTION</h2>
           
           <div className="flex flex-wrap gap-3">
              {(['MET', 'CHICAGO', 'CLEVELAND', 'EUROPEANA'] as MuseumSourceType[]).map((src) => (
                <button
                  key={src}
                  onClick={() => setActiveSource(src)}
                  disabled={isLoading}
                  className={cn(
                    "brutal-btn-sm px-4 py-2 text-[10px] font-black uppercase tracking-tighter flex items-center gap-2",
                    activeSource === src ? "bg-black text-white" : "bg-white hover:bg-pop-yellow"
                  )}
                >
                  {isLoading && activeSource === src ? <RefreshCw size={12} className="animate-spin" /> : <Library size={12} />}
                  {src}_UPLINK
                  <span className="text-[8px] bg-pop-green text-black px-1 ml-1">+5_PT</span>
                </button>
              ))}
              <button 
                disabled
                className="brutal-btn-sm px-4 py-2 text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 bg-gray-200 text-gray-400 cursor-not-allowed"
              >
                GOOGLE_ARTS_UPLINK [LOCKED]
              </button>
           </div>
           
           <form onSubmit={handleSearch} className="relative group max-w-xl mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-hover:text-pop-cyan transition-colors" size={20} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH_HISTORICAL_ARCHIVES..."
                className="w-full bg-white brutal-border py-4 pl-12 pr-4 font-black uppercase italic text-sm outline-none focus:bg-pop-yellow transition-colors placeholder:opacity-30"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-1 text-[10px] font-black uppercase brutal-border-sm hover:bg-pop-cyan transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'SYNCING...' : 'SYNC_QUERY'}
              </button>
            </form>
         </div>
      </div>

      {/* Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-4 border-black pb-4">
           <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Current_Selection: {activeSource}</h3>
              {isLoading && <RefreshCw size={24} className="animate-spin text-pop-pink" />}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {combinedCollection.map((artifact) => (
              <motion.div
                key={artifact.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSelectedArtifact(artifact)}
                className="group cursor-pointer"
              >
                <div className="brutal-border bg-white p-4 brutal-shadow-sm group-hover:brutal-shadow transition-all relative overflow-hidden h-full flex flex-col">
                  <div className="aspect-[4/5] bg-gray-100 brutal-border mb-4 overflow-hidden flex items-center justify-center">
                     <img src={artifact.imageUrl} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-110" alt={artifact.title} />
                  </div>
                  <div className="flex flex-col flex-1">
                     <p className="text-[9px] font-black uppercase tracking-tighter opacity-50">{artifact.source}</p>
                     <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-2">{artifact.title}</h3>
                     <div className="mt-auto flex justify-between items-center">
                        <p className="text-[10px] font-bold opacity-60 italic">{artifact.author}</p>
                        <span className={cn(
                           "px-2 py-0.5 text-[8px] font-black uppercase brutal-border-sm",
                           artifact.donationStatus === 'PRESERVED' ? "bg-pop-green" :
                           artifact.donationStatus === 'DIGITIZING' ? "bg-pop-cyan" : "bg-pop-yellow"
                        )}>
                           {artifact.donationStatus}
                        </span>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedArtifact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <motion.div 
               layoutId={selectedArtifact.id}
               className="bg-white brutal-border max-w-6xl w-full flex flex-col md:flex-row overflow-hidden relative shadow-[20px_20px_0_0_rgba(0,0,0,1)] max-h-[90vh]"
            >
               <button 
                 onClick={() => {
                   setSelectedArtifact(null);
                   setIsOrdering(false);
                 }}
                 className="absolute top-4 right-4 z-10 w-10 h-10 bg-black text-white brutal-border flex items-center justify-center hover:bg-pop-pink transition-colors"
               >
                 <ArrowLeft size={20} />
               </button>

               <div className="flex flex-col md:flex-row w-full">
                 {/* Image Panel */}
                 <div className="md:w-1/2 bg-gray-900 flex items-center justify-center p-6 md:p-12 overflow-hidden relative">
                    <button 
                      onClick={() => setIsZoomed(!isZoomed)}
                      className="absolute top-4 left-4 z-10 w-10 h-10 bg-white brutal-border-sm flex items-center justify-center hover:bg-pop-cyan transition-colors"
                      title="Zoom View"
                    >
                      {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                    </button>

                    <motion.div 
                      layout
                      className={cn(
                        "relative w-full aspect-[4/5] brutal-border bg-white transition-all duration-500",
                        isOrdering && orderMaterial === 'CANVAS' ? "p-1 bg-gray-200" : "p-4",
                        isZoomed ? "scale-150 z-20 cursor-move" : "z-10"
                      )}
                    >
                       <img 
                         src={selectedArtifact.imageUrl} 
                         className={cn(
                           "w-full h-full object-contain transition-all duration-500",
                           isOrdering && "shadow-inner"
                         )} 
                         alt={selectedArtifact.title} 
                       />
                       
                       {isOrdering && (
                         <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-30 select-none">
                            {orderMaterial === 'PAPER' ? (
                              <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                            ) : (
                              <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/canvas-fabric.png')]" />
                            )}
                         </div>
                       )}

                       {isOrdering && (
                         <div className="absolute -bottom-10 left-0 w-full text-center">
                            <p className="text-[10px] font-black text-white uppercase italic tracking-widest opacity-40">
                               Preview_Render: {orderSize.toUpperCase()} / {orderMaterial}
                            </p>
                         </div>
                       )}
                    </motion.div>
                 </div>

                 {/* Info/Form Panel */}
                 <div className="md:w-1/2 p-6 md:p-12 flex flex-col bg-white overflow-y-auto max-h-[90vh]">
                    <div className="space-y-8 pb-12">
                       <div className="space-y-2">
                          <p className="text-xs font-black uppercase text-pop-cyan tracking-widest">{selectedArtifact.source} / {selectedArtifact.year}</p>
                          <h2 className={cn(
                            "font-black italic uppercase tracking-tighter leading-none transition-all",
                            isOrdering ? "text-3xl" : "text-5xl"
                          )}>{selectedArtifact.title}</h2>
                          <p className="text-xl font-black italic opacity-50 underline decoration-pop-yellow decoration-4">BY_{selectedArtifact.author}</p>
                       </div>

                       <div className="p-8 bg-gray-50 brutal-border-sm border-l-8 border-l-black">
                          <div className="flex items-center gap-2 mb-4 text-pop-pink">
                             <Sparkles size={16} />
                             <h4 className="text-xs font-black uppercase italic">Neural_Archive_Protocol</h4>
                          </div>
                          <p className="text-sm font-bold uppercase leading-relaxed opacity-70">
                             {selectedArtifact.description}
                          </p>
                       </div>

                       <div className="flex flex-col gap-4">
                          {!isOrdering ? (
                            <>
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
                                className="w-full brutal-btn bg-pop-yellow text-black flex items-center justify-center gap-3 py-5 font-black italic uppercase text-lg group"
                              >
                                 <Sparkles size={24} className="group-hover:animate-spin" />
                                 EXTRACT_FOR_NEURAL_REMIX
                              </button>
                              <button 
                                onClick={() => setIsOrdering(true)}
                                className="w-full brutal-btn bg-pop-cyan text-black flex items-center justify-center gap-3 py-4 font-black italic uppercase text-lg"
                              >
                                 <ShoppingBag size={24} />
                                 REQUEST_PHYSICAL_PRINT
                              </button>
                              <div className="grid grid-cols-2 gap-4">
                                 <button 
                                   onClick={() => setIsZoomed(!isZoomed)}
                                   className={cn(
                                     "brutal-btn flex items-center justify-center gap-2 py-4 font-black text-xs group transition-all",
                                     isZoomed ? "bg-pop-cyan text-black" : "bg-black text-white"
                                   )}
                                 >
                                    {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                                    {isZoomed ? 'EXIT_MAGNIFICATION' : 'ZOOM_EXPLORATION'}
                                 </button>
                                 <button 
                                   onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = selectedArtifact.imageUrl;
                                      link.download = `${selectedArtifact.title.replace(/\s+/g, '_')}_ARCHIVE.jpg`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                   }}
                                   className="brutal-btn bg-pop-green text-black flex items-center justify-center gap-2 py-4 font-black text-xs hover:bg-pop-pink"
                                 >
                                    <Download size={20} />
                                    DOWNLOAD_UPLINK
                                 </button>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-6 pt-6 border-t-8 border-black flex flex-col h-full">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                     <ShoppingBag size={20} className="text-pop-cyan" />
                                     <h3 className="text-xl font-black italic uppercase tracking-tighter">ORDER_MANIFEST_v2.5</h3>
                                  </div>
                                  <button onClick={() => { setIsOrdering(false); setCheckoutStep('CONFIG'); }} className="text-[10px] font-black uppercase underline hover:text-pop-pink">BACK_TO_ARCHIVE</button>
                               </div>

                               <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
                                  {checkoutStep === 'CONFIG' ? (
                                    <>
                                       {/* Selection: Material */}
                                       <div className="space-y-3">
                                          <label className="text-[10px] font-black uppercase text-gray-500 italic block">Step_01: Select_Substrate</label>
                                          <div className="grid grid-cols-2 gap-3">
                                             {(['PAPER', 'CANVAS'] as const).map(mat => (
                                               <button
                                                 key={mat}
                                                 onClick={() => setOrderMaterial(mat)}
                                                 className={cn(
                                                   "brutal-border-sm py-3 px-4 text-xs font-black uppercase transition-all flex items-center justify-between group",
                                                   orderMaterial === mat ? "bg-black text-white" : "bg-white hover:bg-pop-yellow text-black"
                                                 )}
                                               >
                                                 {mat}
                                                 {orderMaterial === mat && <CheckCircle2 size={14} className="text-pop-green" />}
                                               </button>
                                             ))}
                                          </div>
                                       </div>

                                       {/* Selection: Size */}
                                       <div className="space-y-3">
                                          <label className="text-[10px] font-black uppercase text-gray-500 italic block">Step_02: Dimension_Selection</label>
                                          <div className="space-y-3">
                                             {(orderMaterial === 'PAPER' ? [
                                               { id: 'small', label: 'PR01_SMALL', dims: '12 5/8 x 16 in.', price: 30 },
                                               { id: 'medium', label: 'PR02_MEDIUM', dims: '17 3/8 x 22 in.', price: 45 },
                                               { id: 'large', label: 'PR03_LARGE', dims: '23 5/8 x 30 in.', price: 95 },
                                               { id: 'extra_large', label: 'PR04_EXTRA_LARGE', dims: '31 1/2 x 40 in.', price: 125 }
                                             ] : [
                                               { id: 'small', label: 'PR01_SMALL', dims: '12 5/8 x 16 in.', price: 70 },
                                               { id: 'medium', label: 'PR02_MEDIUM', dims: '17 3/8 x 22 in.', price: 100 },
                                               { id: 'large', label: 'PR03_LARGE', dims: '23 5/8 x 30 in.', price: 175 },
                                               { id: 'extra_large', label: 'PR04_EXTRA_LARGE', dims: '31 1/2 x 40 in.', price: 250 }
                                             ]).map(tier => (
                                               <button
                                                 key={tier.id}
                                                 onClick={() => setOrderSize(tier.id as any)}
                                                 className={cn(
                                                   "w-full brutal-border-sm p-4 flex items-center justify-between transition-all group",
                                                   orderSize === tier.id ? "bg-pop-yellow ring-4 ring-black" : "bg-white hover:bg-gray-50"
                                                 )}
                                               >
                                                  <div className="flex items-center gap-4">
                                                     <div className="text-left">
                                                        <p className="text-sm font-black italic mb-0.5">{tier.label}</p>
                                                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{tier.dims}</p>
                                                     </div>
                                                  </div>
                                                  <p className="text-xl font-black tracking-tighter">${tier.price.toFixed(2)}</p>
                                               </button>
                                             ))}
                                          </div>
                                       </div>

                                       {/* Selection: Frame */}
                                       <div className="space-y-3">
                                          <label className="text-[10px] font-black uppercase text-gray-500 italic block">Step_03: Frame_Integration</label>
                                          <button
                                            onClick={() => setIsFramed(!isFramed)}
                                            className={cn(
                                              "w-full brutal-border-sm p-4 flex items-center justify-between transition-all",
                                              isFramed ? "bg-black text-white" : "bg-white hover:bg-gray-50 text-black"
                                            )}
                                          >
                                             <div className="flex items-center gap-3">
                                                <div className={cn(
                                                   "w-5 h-5 brutal-border-sm flex items-center justify-center",
                                                   isFramed ? "bg-pop-pink" : "bg-gray-100"
                                                )}>
                                                   {isFramed && <CheckCircle2 size={12} className="text-white" />}
                                                </div>
                                                <span className="text-xs font-black uppercase">Professional_Gallery_Frame</span>
                                             </div>
                                             <span className="text-xs font-black">+$50.00</span>
                                          </button>
                                       </div>
                                    </>
                                  ) : checkoutStep === 'PAYMENT' ? (
                                    <div className="space-y-6">
                                       <div className="bg-pop-yellow brutal-border p-4">
                                          <label className="text-[10px] font-black uppercase italic mb-1 block">FINAL_REMITTANCE_TOTAL (Inc. 10% ARCHIVE_GRANT)</label>
                                          <p className="text-3xl font-black tracking-tighter text-black">
                                             ${((() => {
                                                const tiers = orderMaterial === 'PAPER' ? [
                                                   { id: 'small', price: 30 }, { id: 'medium', price: 45 }, { id: 'large', price: 95 }, { id: 'extra_large', price: 125 }
                                                ] : [
                                                   { id: 'small', price: 70 }, { id: 'medium', price: 100 }, { id: 'large', price: 175 }, { id: 'extra_large', price: 250 }
                                                ];
                                                const base = tiers.find(t => t.id === orderSize)?.price || 0;
                                                const subtotal = base + (isFramed ? 50 : 0);
                                                return subtotal + (subtotal * 0.1);
                                             })()).toFixed(2)}
                                          </p>
                                       </div>

                                       <div className="space-y-3">
                                          <label className="text-[10px] font-black uppercase text-gray-500 italic block">Step_04: Select_Uplink_Method</label>
                                          {[
                                            { id: 'WALLET', label: 'PAY_WITH_DIGITAL_WALLET', icon: <ShoppingBag size={18} /> },
                                            { id: 'CARD', label: 'SECURE_STRIPE_TERMINAL', icon: <Layers size={18} /> },
                                            { id: 'CREDITS', label: 'USE_PRESERVATION_POINTS', icon: <Sparkles size={18} /> }
                                          ].map(method => (
                                            <div key={method.id} className="space-y-2">
                                              <button
                                                 onClick={() => setPaymentMethod(method.id as any)}
                                                 className={cn(
                                                    "w-full brutal-border-sm p-4 flex items-center gap-3 transition-all",
                                                    paymentMethod === method.id ? "bg-black text-white" : "bg-white hover:bg-gray-50 text-black"
                                                 )}
                                              >
                                                 {method.icon}
                                                 <span className="text-xs font-black uppercase">{method.label}</span>
                                                 {method.id === 'CREDITS' && (
                                                    <span className="ml-auto text-[10px] font-black opacity-60">BAL: {points}</span>
                                                 )}
                                              </button>
                                              
                                              {method.id === 'WALLET' && paymentMethod === 'WALLET' && !isWalletConnected && (
                                                <button 
                                                  onClick={() => setIsWalletConnected(true)}
                                                  className="w-full bg-pop-cyan text-black text-[10px] font-black uppercase py-2 brutal-border-sm hover:translate-x-1 hover:-translate-y-1 transition-transform"
                                                >
                                                  CONNECT_MAY_WALLET
                                                </button>
                                              )}
                                              
                                              {method.id === 'WALLET' && paymentMethod === 'WALLET' && isWalletConnected && (
                                                <div className="flex items-center gap-2 p-2 bg-pop-green/20 brutal-border-sm border-pop-green">
                                                  <div className="w-2 h-2 rounded-full bg-pop-green animate-pulse" />
                                                  <span className="text-[8px] font-black uppercase text-pop-green">WALLET_CONNECTED: 0x71C...4e3A</span>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                       </div>
                                    </div>
                                  ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
                                       <div className="w-16 h-16 brutal-border-sm border-pop-cyan flex items-center justify-center animate-spin">
                                          <RefreshCw size={32} className="text-pop-cyan" />
                                       </div>
                                       <div>
                                          <h4 className="text-xl font-black uppercase italic text-black">UPLINK_SYNCING</h4>
                                          <p className="text-[10px] opacity-60 font-black uppercase tracking-widest">Validating transaction on historical ledger...</p>
                                       </div>
                                    </div>
                                  )}

                                  {/* Summary Logic */}
                                  {checkoutStep !== 'PROCESSING' && (
                                    <div className="p-4 bg-pop-green/10 border-2 border-dashed border-pop-green flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-pop-green text-black flex items-center justify-center brutal-border-sm">
                                             <CheckCircle2 size={20} />
                                          </div>
                                          <div>
                                             <p className="text-[10px] font-black uppercase text-pop-green italic leading-none">PRESERVATION_ALLOCATION (10%)</p>
                                             <p className="text-[8px] font-bold opacity-60 uppercase">Committed to original source preservation</p>
                                         </div>
                                       </div>
                                       <div className="text-right">
                                          <p className="text-xs font-black italic text-pop-green">
                                            + ${((((orderMaterial === 'PAPER' ? [
                                              { id: 'small', price: 30 },
                                              { id: 'medium', price: 45 },
                                              { id: 'large', price: 95 },
                                              { id: 'extra_large', price: 125 }
                                            ] : [
                                              { id: 'small', price: 70 },
                                              { id: 'medium', price: 100 },
                                              { id: 'large', price: 175 },
                                              { id: 'extra_large', price: 250 }
                                            ]).find(t => t.id === orderSize)?.price || 0) + (isFramed ? 50 : 0)) * 0.1).toFixed(2)}
                                          </p>
                                       </div>
                                    </div>
                                  )}
                               </div>

                               {checkoutStep !== 'PROCESSING' && (
                                  <button 
                                    disabled={paymentMethod === 'WALLET' && !isWalletConnected}
                                    className={cn(
                                       "w-full brutal-btn py-5 font-black uppercase italic text-xl flex items-center justify-center gap-3 transition-all",
                                       checkoutStep === 'CONFIG' ? "bg-pop-cyan text-black" : "bg-pop-pink text-white",
                                       (paymentMethod === 'WALLET' && !isWalletConnected) && "opacity-50 grayscale cursor-not-allowed"
                                    )}
                                    onClick={() => {
                                       if (checkoutStep === 'CONFIG') {
                                          setCheckoutStep('PAYMENT');
                                       } else {
                                          if (paymentMethod === 'CREDITS' && points < 500) {
                                             alert('INSUFFICIENT_PRESERVATION_POINTS: Current balance does not meet the 500pt minimum.');
                                             return;
                                          }
                                          setCheckoutStep('PROCESSING');
                                          setTimeout(() => {
                                             alert(`UPLINK_SUCCESSFUL: ${selectedArtifact?.title} archiving protocol completed via ${paymentMethod}.\n\n10% Donation Pledged to Museum Source.`);
                                             setIsOrdering(false);
                                             setSelectedArtifact(null);
                                             setCheckoutStep('CONFIG');
                                             setPoints(p => p + 150);
                                          }, 3000);
                                       }
                                    }}
                                  >
                                     <CheckCircle2 size={24} />
                                     {checkoutStep === 'CONFIG' ? 'NEXT_PHASE' : 'INITIATE_REMITTANCE'}
                                  </button>
                               )}
                            </div>
                          )}
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
