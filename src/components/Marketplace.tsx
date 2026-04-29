import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Heart, Tag, Search, Filter, Sparkles, Trophy, Globe, Lock, MessageSquare, Activity, User, GitBranch } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

import confetti from 'canvas-confetti';
import { GenealogyTree } from './GenealogyTree';

interface Collectible {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  category: string;
  likes: number;
  isSold?: boolean;
  ownerId: string;
  itemType: 'sale' | 'auction';
  currentBid?: number;
  bidCount?: number;
  endsAt?: any;
}

interface LiveEvent {
  id: string;
  type: 'SALE' | 'REMIX' | 'LIKE' | 'MINT';
  message: string;
  timestamp: any;
  userId?: string;
}

function LiveFeed() {
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'live_events'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LiveEvent));
      setEvents(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'live_events');
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="brutal-border bg-white p-6 brutal-shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-2">
        <Activity size={16} className="text-pop-pink" />
        <h3 className="text-sm font-black uppercase italic">LIVE_NEURAL_FEED</h3>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {events.length === 0 && (
            <p className="text-[10px] font-black uppercase opacity-30 text-center py-10 italic">WAITING_FOR_DATA_STREAM...</p>
          )}
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex gap-3 items-start border-l-2 border-pop-cyan pl-3 py-1"
            >
              <div className={cn(
                "w-8 h-8 brutal-border-sm flex items-center justify-center shrink-0",
                event.type === 'SALE' ? "bg-pop-green" : 
                event.type === 'REMIX' ? "bg-pop-cyan" :
                event.type === 'LIKE' ? "bg-pop-pink" : "bg-pop-yellow"
              )}>
                {event.type === 'SALE' ? <ShoppingCart size={12}/> : 
                 event.type === 'REMIX' ? <Sparkles size={12}/> :
                 event.type === 'LIKE' ? <Heart size={12}/> : <Tag size={12}/>}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase leading-tight">{event.message}</p>
                <p className="text-[8px] font-black opacity-30 mt-1 uppercase tracking-tighter">
                  {event.timestamp?.toDate ? event.timestamp.toDate().toLocaleTimeString() : 'RECENT'}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Marketplace() {
  const [items, setItems] = useState<Collectible[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'GENESIS' | 'REMIX' | 'GLITCH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<'buy' | 'auction'>('buy');
  const [loading, setLoading] = useState(true);
  const [showGenealogy, setShowGenealogy] = useState<string | null>(null);

  const mockGenealogy = [
    { id: '1', type: 'ORIGINAL' as const, author: 'DA_VINCI_AI', timestamp: '2026-04-01 09:00', transformation: 'Initial neural seed extraction from historical archives.', seed: '7721-X' },
    { id: '2', type: 'REMIX' as const, author: 'NEO_CYBER', timestamp: '2026-04-12 14:22', transformation: 'Applied brutalist grid decomposition and neon-overlay filters.', seed: '9112-B' },
    { id: '3', type: 'GLITCH' as const, author: 'GHOST_01', timestamp: '2026-04-20 03:45', transformation: 'Vector corruption and chromatic aberration injection.', seed: '0019-Z' }
  ];

  useEffect(() => {
    const q = query(collection(db, 'marketplace'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Collectible));
      setItems(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'marketplace');
    });
    return () => unsubscribe();
  }, []);

  const handleBid = async (itemId: string, currentBid: number) => {
    if (!auth.currentUser) return;
    try {
      const itemRef = doc(db, 'marketplace', itemId);
      const newBid = currentBid + 500;
      await updateDoc(itemRef, {
        currentBid: newBid,
        bidCount: increment(1)
      });
      
      await addDoc(collection(db, 'live_events'), {
        type: 'MINT',
        message: `@${auth.currentUser.email?.split('@')[0]} placed a bid of €${newBid} on Lot #${itemId.slice(-3)}`,
        timestamp: serverTimestamp(),
        userId: auth.currentUser.uid,
        entityId: itemId
      });
      
      confetti({ particleCount: 50, colors: ['#FF00D6'] });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `marketplace/${itemId}`);
    }
  };

  const activeAuction = items.find(i => i.itemType === 'auction') || {
    id: 'auction-777',
    title: 'Liquid_Gold_Memory',
    imageUrl: 'https://pollinations.ai/p/hyper-detailed%20neural%20sculpture%20gold%20liquid%20ethereal?width=800&height=800&seed=777',
    currentBid: 8400,
    bidCount: 12,
    endsAt: null
  } as Collectible;

  const filteredItems = items.filter(item => {
    if (item.itemType !== 'sale') return false;
    const matchesFilter = filter === 'ALL' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col xl:flex-row gap-8 min-h-screen pb-20">
      <div className="flex-1 space-y-10">
        {/* NEW: MARKETPLACE HOME HERO */}
        <div className="brutal-border bg-black text-white p-12 brutal-shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pop-pink blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-6">
             <div className="inline-flex items-center gap-2 bg-pop-green text-black px-4 py-1 text-xs font-black brutal-border-sm uppercase">
                <Trophy size={14} />
                Featured_Artifacts_v2.0
             </div>
             <h1 className="leading-none mb-4">The_Neural<br/>Collector</h1>
             <p className="max-w-xl text-sm md:text-lg font-bold uppercase opacity-80 leading-tight">
                Trade neural masterworks with guaranteed provenance. 1% of every transaction is donated to the Global Museum Archive Sync Initiative.
             </p>
             <div className="flex gap-4">
                <button onClick={() => setActiveSegment('buy')} className={cn("brutal-btn px-8 text-black", activeSegment === 'buy' ? "bg-pop-cyan" : "bg-white")}>BROWSE_GRID</button>
                <button onClick={() => setActiveSegment('auction')} className={cn("brutal-btn px-8 text-black", activeSegment === 'auction' ? "bg-pop-pink" : "bg-white")}>LIVE_AUCTIONS</button>
             </div>
          </div>
        </div>

        {activeSegment === 'auction' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            <div className="brutal-border p-8 bg-pop-pink brutal-shadow-sm flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/3 aspect-square brutal-border overflow-hidden">
                 <img src={activeAuction.imageUrl} className="w-full h-full object-cover" alt="Auction Item" />
              </div>
              <div className="flex-1 space-y-6 text-white">
                 <div>
                    <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase">CURRENT_LOT: #{activeAuction.id.slice(-3)}</span>
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mt-2">{activeAuction.title}</h2>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 p-4 brutal-border-sm">
                       <p className="text-[10px] font-bold opacity-70">CURRENT_BID</p>
                       <p className="text-4xl font-black tracking-tighter italic">€{activeAuction.currentBid?.toLocaleString()}</p>
                    </div>
                    <div className="bg-black/20 p-4 brutal-border-sm text-pop-yellow">
                       <p className="text-[10px] font-bold opacity-70">TIME_LEFT</p>
                       <p className="text-4xl font-black tracking-tighter italic">04:12:09</p>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <button 
                       onClick={() => handleBid(activeAuction.id, activeAuction.currentBid || 0)}
                       className="brutal-btn w-full bg-white text-black text-xl hover:bg-pop-yellow transition-colors"
                    >
                       PLACE_BID (+€500)
                    </button>
                    <p className="text-center text-[9px] font-black uppercase opacity-60">AUCTION_FEE: 31% TOTAL (30% WALLET + 1% MUSEUM)</p>
                 </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b-8 border-black pb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-pop-cyan px-3 py-1 text-xs font-black text-black brutal-border-sm italic">INSTANT_BUY</span>
                  <span className="text-[10px] font-black uppercase opacity-50 tracking-widest">TRANSACTION_FEE: 21% (20% WALLET + 1% MUSEUM)</span>
                </div>
                <h2 className="text-7xl font-black italic tracking-tighter uppercase leading-none">Market_Grid</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                   <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                      <input 
                        type="text" 
                        placeholder="SEARCH_LEDGER..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white brutal-border font-black text-xs uppercase outline-none focus:bg-pop-yellow transition-colors"
                      />
                   </div>
                   <button className="brutal-btn bg-black text-white px-6">
                      <Filter size={18} />
                   </button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {['ALL', 'GENESIS', 'REMIX', 'GLITCH'].map((cat) => (
                     <button
                       key={cat}
                       onClick={() => setFilter(cat as any)}
                       className={cn(
                         "px-4 py-2 text-[10px] font-black uppercase brutal-border-sm transition-all",
                         filter === cat ? "bg-pop-cyan brutal-shadow-sm -translate-y-0.5" : "bg-white hover:bg-gray-100"
                       )}
                     >
                       {cat}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="brutal-border bg-white p-4 brutal-shadow group-hover:brutal-shadow-lg transition-all flex flex-col h-full">
                      {/* Image Container */}
                      <div className="aspect-square bg-gray-100 brutal-border relative overflow-hidden mb-4">
                        <img src={item.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" alt={item.title} />
                        
                        {item.isSold && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                             <div className="bg-pop-pink border-4 border-black px-6 py-2 brutal-shadow-sm -rotate-12">
                                <span className="text-white font-black text-2xl italic tracking-tighter">SOLD_OUT</span>
                             </div>
                          </div>
                        )}

                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                          <button className="bg-white/80 hover:bg-white brutal-border-sm w-10 h-10 flex items-center justify-center transition-colors">
                             <Heart size={18} className="text-pop-pink" fill={item.likes > 500 ? "currentColor" : "none"} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowGenealogy(item.id); }}
                            className="bg-white/80 hover:bg-black hover:text-white brutal-border-sm w-10 h-10 flex items-center justify-center transition-colors"
                            title="View Genealogy"
                          >
                             <GitBranch size={16} />
                          </button>
                        </div>

                        <div className="absolute bottom-2 left-2 flex gap-2">
                           <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase brutal-border-sm">
                              {item.category}
                           </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[9px] font-bold uppercase opacity-50 mb-0.5 tracking-tighter">LEDGER_ID: {item.id}</p>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-pop-cyan transition-colors">{item.title}</h3>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black opacity-30 italic leading-none mb-1 text-right">@AUTHOR</p>
                             <p className="text-xs font-black uppercase italic truncate max-w-[100px]">{item.author}</p>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-black/10 flex items-center justify-between">
                          <div>
                             <p className="text-[10px] font-black uppercase opacity-50">List_Price</p>
                             <div className="flex items-center gap-1">
                                <span className="text-2xl font-black italic tracking-tighter">€{item.price.toLocaleString()}</span>
                                <span className="bg-pop-yellow px-1 py-0.5 text-[8px] font-black border border-black">NET_PAY</span>
                             </div>
                          </div>
                          <button 
                            disabled={item.isSold}
                            className={cn(
                              "brutal-btn-sm h-12 px-6 flex items-center gap-2",
                              item.isSold ? "bg-gray-400 cursor-not-allowed" : "bg-pop-green hover:bg-pop-yellow"
                            )}
                          >
                            {item.isSold ? <Lock size={16}/> : <ShoppingCart size={16}/>}
                            {item.isSold ? 'LOCKED' : 'ACQUIRE'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Stats / Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
           <div className="brutal-border p-6 bg-black text-white brutal-shadow-sm">
              <Trophy className="text-pop-yellow mb-4" size={32} />
              <h4 className="text-3xl font-black italic leading-none">€1.2M+</h4>
              <p className="text-xs font-bold uppercase opacity-50 mt-2">TOTAL_MARKET_CAP</p>
           </div>
           <div className="brutal-border p-6 bg-white brutal-shadow-sm">
              <Globe className="text-pop-cyan mb-4" size={32} />
              <h4 className="text-3xl font-black italic leading-none">148</h4>
              <p className="text-xs font-bold uppercase opacity-50 mt-2">ACTIVE_BROKERS</p>
           </div>
           <div className="brutal-border p-6 bg-white brutal-shadow-sm">
              <Sparkles className="text-pop-pink mb-4" size={32} />
              <h4 className="text-3xl font-black italic leading-none">2,491</h4>
              <p className="text-xs font-bold uppercase opacity-50 mt-2">REMIXES_MINTED</p>
           </div>
           <div className="brutal-border p-6 bg-pop-green brutal-shadow-sm">
              <Tag className="text-black mb-4" size={32} />
              <h4 className="text-3xl font-black italic leading-none">€85.20</h4>
              <p className="text-xs font-black uppercase opacity-70 mt-2">AVG_SALE_PRICE</p>
           </div>
        </div>
      </div>

      {/* Sidebar Live Feed */}
      <div className="w-full xl:w-96 shrink-0 h-[600px] xl:h-auto xl:sticky xl:top-24">
        <LiveFeed />
      </div>

      <AnimatePresence>
        {showGenealogy && (
          <GenealogyTree nodes={mockGenealogy} onClose={() => setShowGenealogy(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
