import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { motion } from 'motion/react';
import { Trash2, Edit3, Layers, RefreshCw, ShoppingCart, Check, FileText, Truck } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import { generateCertificate } from '../lib/certificate';

interface CanvasData {
  id: string;
  name: string;
  shapes: string;
  ownerId: string;
  createdAt: any;
}

interface CollectionProps {
  userId: string;
  onEdit: (canvas: CanvasData) => void;
  onRemix: (canvas: CanvasData) => void;
  onEvolutionRemix: (image: string, prompt: string) => void;
  onMint: (canvas: CanvasData) => void;
}

export function Collection({ userId, onEdit, onRemix, onEvolutionRemix, onMint }: CollectionProps) {
  const [canvases, setCanvases] = useState<CanvasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShipping, setIsShipping] = useState<string | null>(null);

  const [listedIds, setListedIds] = useState<Set<string>>(new Set());

  const handleShipToPrint = async (canvas: CanvasData) => {
    setIsShipping(canvas.id);
    try {
      const response = await fetch('/api/printful/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: {
            name: "Brutal Art Fan",
            address1: "123 Cyber Way",
            city: "Neo Tokyo"
          },
          items: [{ name: `Brutal Canvas: ${canvas.name}`, quantity: 1 }]
        })
      });
      alert("SHIPMENT_PROTOCOL_INITIATED: Your art has been sent to Printful production.");
      confetti({ particleCount: 150, spread: 80 });
    } catch (e) {
      alert("SHIPMENT_ERROR: Production line failure.");
    } finally {
      setIsShipping(null);
    }
  };

  const handleList = (id: string) => {
    setListedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    confetti({ particleCount: 100, colors: ['#FF00D6', '#00D1FF'], origin: { y: 0.7 } });
  };

  const fetchCanvases = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'canvases'),
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CanvasData[];
      setCanvases(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'canvases');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('ERASE_DATA?')) {
      try {
        await deleteDoc(doc(db, 'canvases', id));
        setCanvases(canvases.filter(c => c.id !== id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `canvases/${id}`);
      }
    }
  };

  useEffect(() => {
    fetchCanvases();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-black" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between border-b-4 border-black pb-4">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Secure_Vault</h2>
        <button 
          onClick={fetchCanvases}
          className="brutal-btn bg-pop-yellow text-[10px]"
        >
          RE_SYNC
        </button>
      </div>

      {canvases.length === 0 ? (
        <div className="text-center py-24 brutal-border bg-white brutal-shadow">
          <Layers className="mx-auto text-black mb-4 opacity-20" size={64} />
          <p className="font-black italic uppercase italic">NO_DATA_FOUND</p>
          <p className="text-[10px] uppercase font-bold mt-2">Initialize your first core in Studio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {canvases.map((canvas) => (
            <motion.div
              key={canvas.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white brutal-border brutal-shadow hover:brutal-shadow-lg transition-all group"
            >
              <div className="h-40 bg-gray-100 border-b-2 border-black flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                 <Layers className="text-black group-hover:scale-110 transition-transform" size={48} />
              </div>
              <div className="p-6">
                <h3 className="font-black italic uppercase text-lg mb-6 truncate border-b-2 border-black border-dashed pb-2">{canvas.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <button
                      onClick={() => onEdit(canvas)}
                      className="w-10 h-10 brutal-border bg-pop-cyan flex items-center justify-center brutal-shadow-sm hover:translate-y-0.5 hover:shadow-none"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => onRemix(canvas)}
                      className="brutal-btn bg-pop-pink text-white text-[10px]"
                    >
                      REMIX
                    </button>
                    <button
                      onClick={() => onEvolutionRemix('', canvas.name)}
                      className="brutal-btn bg-pop-green text-black text-[10px]"
                    >
                      EVOLVE
                    </button>
                    <button
                      onClick={() => handleList(canvas.id)}
                      disabled={listedIds.has(canvas.id)}
                      className={cn(
                        "brutal-btn text-[10px]",
                        listedIds.has(canvas.id) ? "bg-pop-green text-black" : "bg-black text-white hover:bg-pop-yellow hover:text-black"
                      )}
                    >
                      {listedIds.has(canvas.id) ? <Check size={14}/> : <ShoppingCart size={14}/>}
                      {listedIds.has(canvas.id) ? 'LISTED' : 'LIST'}
                    </button>
                    <button
                      onClick={() => onMint(canvas)}
                      className="brutal-btn bg-pop-cyan text-black text-[10px]"
                    >
                      MINT_NFT
                    </button>
                    <button
                      onClick={() => handleShipToPrint(canvas)}
                      disabled={isShipping === canvas.id}
                      className="brutal-btn bg-pop-yellow text-black text-[10px] flex items-center gap-1"
                    >
                      {isShipping === canvas.id ? <RefreshCw size={12} className="animate-spin" /> : <Truck size={12} />}
                      SHIP_PRINT
                    </button>
                    <button
                      onClick={() => generateCertificate({
                        id: canvas.id,
                        title: canvas.name,
                        author: 'CURRENT_COLLECTOR',
                        date: new Date(canvas.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()
                      })}
                      className="brutal-btn bg-white text-[10px] flex items-center gap-1"
                      title="Download Provenance"
                    >
                      <FileText size={14}/>
                      CERT
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(canvas.id)}
                    className="w-10 h-10 brutal-border bg-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
