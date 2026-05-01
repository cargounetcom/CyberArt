import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  Trash2, 
  User, 
  ShieldAlert, 
  Search, 
  Calendar, 
  Tag, 
  Database,
  ExternalLink,
  Plus,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { generateNeuralSeed } from '../services/geminiService';

interface LockerItem {
  id: string;
  title: string;
  category: string;
  content: string;
  ownerId: string;
  accessTier: 'private' | 'restricted' | 'encrypted';
  createdAt: any;
}

export function DigitalLocker({ isAdminView = false, onEvolutionRemix }: { isAdminView?: boolean, onEvolutionRemix?: (image: string, prompt: string) => void }) {
  const [items, setItems] = useState<LockerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const user = auth.currentUser;

  const isAdmin = user?.email === 'ellanovashenko@gmail.com';

  useEffect(() => {
    if (!user) return;

    let q;
    if (isAdminView && isAdmin) {
      q = collection(db, 'locker');
    } else {
      q = query(collection(db, 'locker'), where('ownerId', '==', user.uid));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lockerItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LockerItem[];
      setItems(lockerItems);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'locker');
    });

    return () => unsubscribe();
  }, [user, isAdminView, isAdmin]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to purge this neural asset from the locker?')) return;
    try {
      await deleteDoc(doc(db, 'locker', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `locker/${id}`);
    }
  };

  const handleAddSample = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const neuralContent = await generateNeuralSeed();
      await addDoc(collection(db, 'locker'), {
        title: `Neural_Asset_${Math.random().toString(36).substring(7).toUpperCase()}`,
        category: 'NEURAL_SEED',
        content: neuralContent,
        ownerId: user.uid,
        accessTier: 'private',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'locker');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-black pb-6 bg-white p-6 brutal-shadow-sm brutal-border">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("p-2 brutal-border-sm", isAdminView ? "bg-pop-pink" : "bg-pop-pink")}>
               {isAdminView ? <ShieldAlert className="text-white" size={24} /> : <Lock className="text-black" size={24} />}
            </div>
            <span className="text-xs font-extra-black uppercase tracking-widest bg-black text-white px-2 py-1">
              {isAdminView ? 'ADMIN_LOCKER_PROTOCOL' : 'USER_PRIVATE_VAULT'}
            </span>
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            {isAdminView ? 'Global_Asset_Purge' : 'Digital_Locker'}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-2">
            Secure neural asset isolation & persistent storage module.
          </p>
        </div>

        {!isAdminView && (
          <button 
            onClick={handleAddSample}
            className="brutal-btn bg-pop-yellow text-black flex items-center gap-2"
          >
            <Plus size={20} />
            SECURE_NEW_ASSET
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
           <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-hover:text-pop-pink transition-colors" />
           <input 
             type="text"
             placeholder="SEARCH_VAULT_IDENTIFIER..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-12 pr-4 py-4 bg-white brutal-border font-black text-xs uppercase italic focus:bg-pop-pink/5 transition-colors"
           />
        </div>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-6 py-4 bg-white brutal-border font-black text-xs uppercase italic appearance-none cursor-pointer hover:bg-gray-50"
        >
          <option value="all">ALL_CATEGORIES</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center brutal-border border-dashed border-black">
             <Database className="animate-pulse mb-4" size={48} />
             <p className="text-xs font-black uppercase italic">DECRYPTING_VAULT_LAYERS...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="brutal-border bg-white p-6 brutal-shadow-lg group hover:-translate-y-1 transition-transform relative overflow-hidden"
            >
              {/* Status Indicator */}
              <div className="absolute top-0 right-0 w-2 h-full bg-pop-pink group-hover:bg-pop-pink transition-colors" />

              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-100 brutal-border-sm group-hover:bg-pop-yellow transition-colors">
                   <Tag size={18} />
                </div>
                <div className="flex gap-2">
                   {onEvolutionRemix && (
                     <button 
                       onClick={() => onEvolutionRemix(item.content.startsWith('http') ? item.content : '', item.title)}
                       className="p-2 hover:bg-pop-green text-black brutal-border-sm transition-colors"
                       title="Remix in the Forge"
                     >
                        <RefreshCw size={14} />
                     </button>
                   )}
                   <button className="p-2 hover:bg-pop-cyan brutal-border-sm transition-colors">
                      <ExternalLink size={14} />
                   </button>
                   <button 
                     onClick={() => handleDelete(item.id)}
                     className="p-2 hover:bg-pop-pink hover:text-white brutal-border-sm transition-colors"
                   >
                      <Trash2 size={14} />
                   </button>
                </div>
              </div>

              <h4 className="text-xl font-black italic uppercase leading-none mb-2 group-hover:text-pop-pink transition-colors">{item.title}</h4>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest">{item.category}</p>

              <div className="bg-black text-[10px] font-mono p-4 text-pop-green brutal-border-sm overflow-hidden mb-6">
                 {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-black/10">
                 <div className="flex items-center gap-2">
                    <Calendar size={12} className="opacity-40" />
                    <span className="text-[8px] font-black uppercase opacity-40">
                      {item.createdAt?.toDate().toLocaleDateString() || 'RECENT'}
                    </span>
                 </div>
                 <div className="flex items-center gap-1">
                    <Unlock size={10} className="text-pop-green" />
                    <span className="text-[8px] font-black uppercase text-pop-green tracking-widest">{item.accessTier}</span>
                 </div>
              </div>

              {isAdminView && (
                <div className="mt-4 pt-4 border-t-2 border-black/5 flex items-center gap-2">
                   <User size={12} className="text-pop-pink" />
                   <span className="text-[9px] font-black uppercase">OWNER_ID: {item.ownerId.substring(0, 8)}...</span>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center brutal-border border-dashed border-black">
             <Lock className="opacity-10 mb-4" size={48} />
             <p className="text-xs font-black uppercase italic opacity-30">NO_ASSETS_SECURED_IN_VAULT</p>
          </div>
        )}
      </div>

      {/* Security Banner */}
      <div className="brutal-border p-6 bg-black text-white brutal-shadow-sm flex items-center gap-6 overflow-hidden relative">
         <div className="absolute top-0 bottom-0 left-0 w-1 bg-pop-pink animate-pulse" />
         <div className="shrink-0">
            <Lock size={32} className="text-pop-pink" />
         </div>
         <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">ARTCYBER_SECURITY_CORE</p>
            <p className="text-xs font-bold leading-relaxed opacity-60">
               All assets in the Digital Locker are isolated via 256-bit neural encryption. Admin access is limited to structural maintenance and authorized purge protocols for illicit patterns.
            </p>
         </div>
      </div>
    </div>
  );
}
