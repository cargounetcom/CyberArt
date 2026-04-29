import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Activity, 
  Key, 
  Cpu, 
  Database, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Code2, 
  ShieldCheck,
  ExternalLink,
  Copy,
  Plus,
  Download,
  Sparkles
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { auth } from '../lib/firebase';
import confetti from 'canvas-confetti';

interface ApiKey {
  id: string;
  key: string;
  created: string;
  status: 'active' | 'revoked';
  usage: number;
}

export function Dashboard({ initialTab = 'overview' }: { initialTab?: 'overview' | 'api' | 'docs' | 'license' | 'downloads' | 'profit' | 'sync' | 'trends' | 'nft' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'refused'>('idle');
  const [trendReport, setTrendReport] = useState<any>(null);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<'idle' | 'minting' | 'success'>('idle');
  const [selectedChain, setSelectedChain] = useState<'polygon' | 'solana'>('polygon');

  useEffect(() => {
    if (activeTab === 'trends' && !trendReport) {
      fetchTrends();
    }
  }, [activeTab]);

  const fetchTrends = async () => {
    setIsLoadingTrends(true);
    try {
      const { generateTrendReport } = await import('../services/geminiService');
      const report = await generateTrendReport();
      setTrendReport(report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTrends(false);
    }
  };
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', key: 'ca_live_9k2j...fLsk', created: '2026-04-20', status: 'active', usage: 1240 },
  ]);

  const user = auth.currentUser;

  const handleMintNft = async () => {
    setIsMinting(true);
    setMintStatus('minting');
    // Simulate complex blockchain transaction
    await new Promise(r => setTimeout(r, 3000));
    setMintStatus('success');
    setIsMinting(false);
    confetti({ particleCount: 150, spread: 70, colors: selectedChain === 'polygon' ? ['#8247E5', '#FFFFFF'] : ['#14F195', '#9945FF'] });
  };

  const handleFreeDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback if fetch fails
      window.open(url, '_blank');
    }
  };

  const runConnectionTest = async () => {
    setTestStatus('testing');
    // Simulate real network handshake
    await new Promise(r => setTimeout(r, 1500));
    setTestStatus(Math.random() > 0.1 ? 'success' : 'refused');
  };

  const generateKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      key: `ca_temp_${Math.random().toString(36).substring(7)}`,
      created: new Date().toISOString().split('T')[0],
      status: 'active',
      usage: 0
    };
    setApiKeys([newKey, ...apiKeys]);
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-pop-pink p-1 brutal-border-sm">
                <Terminal size={20} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-2 py-0.5">CYBERART_v1_LITE</span>
          </div>
          <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">Module_Dashboard</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-2">Neural Engine Management & API Integration Hub</p>
        </div>
        
        <div className="flex gap-4">
           <div className="brutal-border bg-white px-6 py-3 brutal-shadow-sm flex flex-col">
              <span className="text-[8px] font-black opacity-50 uppercase">Network_Load</span>
              <div className="flex items-center gap-2">
                 <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={cn("w-1.5 h-3 brutal-border-sm", i < 3 ? "bg-pop-green" : "bg-gray-200")} />
                    ))}
                 </div>
                 <span className="text-xs font-black">42%_STABLE</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="xl:w-64 flex xl:flex-wrap xl:flex-col gap-2">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity size={18}/>} label="Status_Overview" />
          <TabButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={<Key size={18}/>} label="API_Control" />
          <TabButton active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} icon={<Code2 size={18}/>} label="Dev_Specs" />
          <TabButton active={activeTab === 'license'} onClick={() => setActiveTab('license')} icon={<ShieldCheck size={18}/>} label="Legal_License" />
          <TabButton active={activeTab === 'downloads'} onClick={() => setActiveTab('downloads')} icon={<Download size={18}/>} label="System_Asset_Downloads" />
          <TabButton active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} icon={<Sparkles size={18} className="text-pop-yellow"/>} label="Neural_Trend_Engine" />
          <TabButton active={activeTab === 'nft'} onClick={() => setActiveTab('nft')} icon={<Zap size={18} className="text-pop-cyan"/>} label="NFT_Minting_Vault" />
          <TabButton active={activeTab === 'profit'} onClick={() => setActiveTab('profit')} icon={<Activity size={18}/>} label="Wealth_Metrics" />
          <TabButton active={activeTab === 'sync'} onClick={() => setActiveTab('sync')} icon={<RefreshCw size={18}/>} label="Archives_Sync" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Account Summary */}
                  <div className="brutal-border p-6 bg-white brutal-shadow-lg">
                    <h3 className="text-xl font-black italic mb-6 border-b-2 border-black pb-2">SESSION_IDENTITY</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-gray-400">User_Key</span>
                        <span className="text-xs font-black truncate max-w-[200px]">{user?.email || 'ANON_CLIENT'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-gray-400">Access_Tier</span>
                        <div className="flex gap-1">
                           <span className="px-2 py-0.5 bg-pop-pink text-[10px] font-black brutal-border-sm text-white">COMMERCIAL</span>
                           <span className="px-2 py-0.5 bg-pop-yellow text-[10px] font-black brutal-border-sm">INDIVIDUAL</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-gray-400">Image_Credits</span>
                        <span className="text-xs font-black italic underline decoration-pop-pink decoration-2">100 / 100_TOTAL</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-black/10">
                        <span className="text-[10px] font-black uppercase text-pop-cyan">GIFT_COINS</span>
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 bg-pop-cyan rounded-full brutal-border-sm" />
                           <span className="text-sm font-black tracking-tighter">25_COINS</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Test */}
                  <div className="brutal-border p-6 bg-black text-white brutal-shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-20">
                      <Cpu size={48} />
                    </div>
                    <h3 className="text-xl font-black italic mb-6 border-b-2 border-white/20 pb-2">NEURAL_PING</h3>
                    <div className="space-y-6 relative z-10">
                      <div className="h-12 bg-white/5 brutal-border-sm border-white/20 flex items-center px-4 justify-between">
                         <div className="flex items-center gap-3">
                            {testStatus === 'testing' ? <RefreshCw className="animate-spin text-pop-yellow" size={16} /> : testStatus === 'success' ? <CheckCircle2 className="text-pop-green" size={16} /> : <Zap size={16} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {testStatus === 'idle' && 'SYSTEM_READY'}
                                {testStatus === 'testing' && 'ESTABLISHING_HANDSHAKE...'}
                                {testStatus === 'success' && 'CONNECTION_ESTABLISHED'}
                                {testStatus === 'refused' && 'PACKET_LOSS_DETECTED'}
                            </span>
                         </div>
                         {testStatus === 'success' && <span className="text-[10px] font-black text-pop-green">24ms</span>}
                      </div>
                      <button 
                         onClick={runConnectionTest}
                         disabled={testStatus === 'testing'}
                         className="brutal-btn w-full bg-pop-cyan text-black hover:bg-white transition-colors"
                      >
                         EXECUTE_CONNECTION_TEST
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Activity */}
                <div className="brutal-border p-6 bg-white brutal-shadow-lg">
                   <h3 className="text-xl font-black italic mb-6 flex items-center gap-2">
                      <Database size={20} />
                      RECENT_NEURAL_LOGS
                   </h3>
                   <div className="space-y-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-black last:border-0 hover:bg-gray-50 px-2 transition-colors">
                           <div className="w-2 h-2 rounded-full bg-pop-green animate-pulse" />
                           <span className="text-[10px] font-black font-mono">0x{Math.random().toString(16).substring(2, 10).toUpperCase()}</span>
                           <span className="text-[10px] uppercase font-bold flex-1">GENERATE_IMAGE_SUCCESS: {aiThemes[i % aiThemes.length]}</span>
                           <span className="text-[10px] font-black opacity-40">2M_AGO</span>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'trends' && (
              <motion.div
                key="trends"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="brutal-border p-8 bg-black text-white brutal-shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-pop-cyan blur-[100px] opacity-10" />
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-2 text-pop-yellow">
                         <Sparkles size={24} />
                         <span className="text-xs font-black uppercase tracking-widest">GEMINI_NEURAL_SIGHT_v4</span>
                      </div>
                      <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">Neural_Trend_Forecast</h2>
                      <p className="max-w-2xl text-sm font-bold uppercase opacity-80 leading-relaxed">
                         Real-time market analysis synthesized from global marketplace flows, curator activity, and museum donation cycles.
                      </p>
                      <button 
                        onClick={fetchTrends}
                        disabled={isLoadingTrends}
                        className="brutal-btn bg-white text-black px-8 py-3 flex items-center gap-2"
                      >
                         <RefreshCw className={cn(isLoadingTrends && "animate-spin")} size={18} />
                         RESCAN_MARKET
                      </button>
                   </div>
                </div>

                {isLoadingTrends ? (
                  <div className="h-64 flex flex-col items-center justify-center brutal-border border-dashed border-black">
                     <RefreshCw className="animate-spin text-black mb-4" size={48} />
                     <p className="text-xs font-black uppercase opacity-50 italic">SYNTHESIZING_GHOST_SIGNALS...</p>
                  </div>
                ) : trendReport ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="brutal-border p-8 bg-white brutal-shadow-sm space-y-6">
                         <h3 className="text-xl font-black italic border-b-2 border-black pb-2 uppercase">Hot_Style_Nodes</h3>
                         <div className="flex flex-wrap gap-3">
                            {trendReport.hotStyles.map((style: string) => (
                              <div key={style} className="px-4 py-2 bg-pop-pink text-white brutal-border-sm text-xs font-black italic">
                                 {style}
                              </div>
                            ))}
                         </div>
                         <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-pop-cyan">Market_Sentiment</p>
                            <p className="text-2xl font-black italic tracking-tighter leading-none">{trendReport.marketSentiment}</p>
                         </div>
                      </div>

                      <div className="brutal-border p-8 bg-pop-cyan brutal-shadow-sm space-y-6">
                         <h3 className="text-xl font-black italic border-b-2 border-black pb-2 uppercase">Regional_Sync_Insights</h3>
                         <div className="space-y-4">
                            {trendReport.regionalTrends.map((region: any) => (
                              <div key={region.region} className="p-4 bg-white/20 brutal-border-sm border-white">
                                 <p className="text-[10px] font-black uppercase text-black/50">{region.region}</p>
                                 <p className="text-sm font-black italic text-black">{region.styles.join(' + ')}</p>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="md:col-span-2 brutal-border p-8 bg-gray-100 italic">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-black text-white flex items-center justify-center brutal-border">
                               <Cpu size={20} />
                            </div>
                            <h4 className="font-black uppercase">AI_ADVISORY_UPLINK</h4>
                         </div>
                         <p className="text-sm font-bold uppercase leading-loose opacity-70">
                            "{trendReport.aiAnalysis}"
                         </p>
                      </div>
                   </div>
                ) : null}
              </motion.div>
            )}

            {activeTab === 'nft' && (
              <motion.div
                key="nft"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="brutal-border p-8 bg-black text-white brutal-shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-pop-pink blur-[100px] opacity-20" />
                   <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                     <div className="space-y-6">
                        <div className="flex items-center gap-2 text-pop-cyan">
                           <ShieldCheck size={24} />
                           <span className="text-xs font-black uppercase tracking-widest">LAYER_2_SOVEREIGNTY_PROTOCOL</span>
                        </div>
                        <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">Neural_Asset_Vault</h2>
                        <p className="max-w-md text-sm font-bold uppercase leading-relaxed opacity-70">
                           Transform your neural generation into a permanent cryptographic asset. Select your chain and execute the minting sequence.
                        </p>
                        
                        <div className="flex gap-4">
                           <button 
                             onClick={() => setSelectedChain('polygon')}
                             className={cn(
                               "brutal-border px-6 py-3 flex flex-col items-center gap-2 transition-all",
                               selectedChain === 'polygon' ? "bg-white text-black translate-x-1 translate-y-1 shadow-none" : "bg-black text-white hover:bg-gray-900 brutal-shadow-sm"
                             )}
                           >
                              <div className="w-6 h-6 bg-[#8247E5] rounded-full" />
                              <span className="text-[10px] font-black italic">POLYGON_POS</span>
                           </button>
                           <button 
                             onClick={() => setSelectedChain('solana')}
                             className={cn(
                               "brutal-border px-6 py-3 flex flex-col items-center gap-2 transition-all",
                               selectedChain === 'solana' ? "bg-white text-black translate-x-1 translate-y-1 shadow-none" : "bg-black text-white hover:bg-gray-900 brutal-shadow-sm"
                             )}
                           >
                              <div className="w-6 h-6 bg-gradient-to-tr from-[#14F195] to-[#9945FF] rounded-full" />
                              <span className="text-[10px] font-black italic">SOLANA_CORE</span>
                           </button>
                        </div>
                     </div>

                     <div className="brutal-border bg-white p-8 space-y-6">
                        <div className="aspect-square bg-gray-100 brutal-border overflow-hidden relative group">
                           <img src="https://pollinations.ai/p/abstract%20digital%20sculpture%20vibrant%20colors%20floating%20in%20void?width=512&height=512&seed=42&nologo=true" className="w-full h-full object-cover" alt="Preview NFT" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">LAST_LOCAL_SAVE</span>
                           </div>
                        </div>
                        
                        {mintStatus === 'success' ? (
                          <div className="bg-pop-green p-4 brutal-border-sm text-black flex items-center gap-3 animate-in fade-in zoom-in">
                             <CheckCircle2 size={24} />
                             <div>
                                <p className="text-xs font-black uppercase">MINTING_COMPLETE</p>
                                <p className="text-[8px] font-black opacity-50 uppercase leading-none mt-1">Transaction: 0x{Math.random().toString(16).substring(2, 20).toUpperCase()}</p>
                             </div>
                          </div>
                        ) : (
                          <button 
                            disabled={isMinting}
                            onClick={handleMintNft}
                            className={cn(
                              "w-full py-4 brutal-border text-lg font-black italic uppercase transition-all shadow-none",
                              isMinting ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-pop-pink text-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none"
                            )}
                          >
                             {isMinting ? (
                               <span className="flex items-center justify-center gap-2">
                                  <RefreshCw className="animate-spin" size={20} />
                                  SEQUENCING...
                               </span>
                             ) : (
                               `MINT_ON_${selectedChain.toUpperCase()}`
                             )}
                          </button>
                        )}
                        
                        <p className="text-[9px] font-black uppercase text-center opacity-30 mt-4 leading-tight">
                        * MINTING REQUIRES 0.05 ETH / 1.5 SOL IN SYNC_FEES. ALL GAS IS AUTOMATICALLY OPTIMIZED BY THE NEURAL ENGINE.
                        </p>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="brutal-border p-6 bg-white space-y-2">
                      <h4 className="text-sm font-black uppercase italic border-b border-black pb-1 mb-2">Smart_Contract_v4</h4>
                      <p className="text-[9px] font-bold uppercase leading-relaxed opacity-60">
                         ARTREMIX-SOVEREIGN-721 Standard. Includes royalty protection for original neural seeds and secondary marketplace splits.
                      </p>
                   </div>
                   <div className="brutal-border p-6 bg-white space-y-2">
                      <h4 className="text-sm font-black uppercase italic border-b border-black pb-1 mb-2">Metadata_Sync</h4>
                      <p className="text-[9px] font-bold uppercase leading-relaxed opacity-60">
                         All metadata is stored via IPFS/Filecoin persistent nodes. Neural genealogy is permanently etched into the global ledger.
                      </p>
                   </div>
                   <div className="brutal-border p-6 bg-white space-y-2">
                      <h4 className="text-sm font-black uppercase italic border-b border-black pb-1 mb-2">Social_Uplink</h4>
                      <p className="text-[9px] font-bold uppercase leading-relaxed opacity-60">
                         Auto-share to OpenSea, MagicEden, and ArtRemix Social upon completion. Integrated provenance verification.
                      </p>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profit' && (
              <motion.div
                key="profit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Chart Placeholder */}
                  <div className="lg:col-span-2 brutal-border p-8 bg-white brutal-shadow-sm flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b-2 border-black pb-4">
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter">PROJECTED_NEURAL_REVENUE</h3>
                       <div className="flex gap-2">
                          <span className="bg-pop-green px-2 py-0.5 text-[9px] font-black uppercase">+42%_PROFIT</span>
                       </div>
                    </div>
                    <div className="h-48 flex items-end gap-2 border-l-2 border-b-2 border-black p-4 bg-gray-50">
                       {[60, 45, 80, 55, 90, 70, 100, 85].map((h, i) => (
                         <div key={i} className="flex-1 bg-black brutal-border-sm hover:bg-pop-pink transition-colors" style={{ height: `${h}%` }} />
                       ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                       <div className="p-4 bg-gray-100 brutal-border-sm">
                          <p className="text-[10px] font-black uppercase opacity-50">Monthly_Recur</p>
                          <p className="text-xl font-black">€42,500</p>
                       </div>
                       <div className="p-4 bg-gray-100 brutal-border-sm">
                          <p className="text-[10px] font-black uppercase opacity-50">Credit_Sales</p>
                          <p className="text-xl font-black">€12,900</p>
                       </div>
                       <div className="p-4 bg-gray-100 brutal-border-sm border-pop-cyan border-2">
                          <p className="text-[10px] font-black uppercase text-pop-cyan">API_Royalties</p>
                          <p className="text-xl font-black italic">€8,210</p>
                       </div>
                    </div>
                  </div>

                  {/* Neuro Shop UI */}
                  <div className="brutal-border p-8 bg-pop-pink brutal-shadow-sm text-white flex flex-col gap-6">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">NEURO_TOP_UP</h3>
                    <p className="text-xs font-bold uppercase leading-relaxed">
                       Inject fresh coins into your neural stream.
                    </p>
                    
                    <div className="space-y-3">
                       <button className="w-full brutal-btn-sm bg-white text-black flex justify-between px-4 py-3 items-center group">
                          <span className="font-black text-sm">50_COINS</span>
                          <span className="bg-black text-white px-2 py-1 text-[10px] group-hover:bg-pop-cyan transition-colors">€15.00</span>
                       </button>
                       <button className="w-full brutal-btn-sm bg-black text-white flex justify-between px-4 py-3 items-center group">
                          <span className="font-black text-sm italic">200_COINS</span>
                          <span className="bg-white text-black px-2 py-1 text-[10px] group-hover:bg-pop-yellow transition-colors">€50.00</span>
                       </button>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/20">
                       <p className="text-[10px] font-black uppercase opacity-70">Commercial_Rate: 1_Coin = 0.25€</p>
                       <p className="text-[10px] font-black uppercase text-white mt-1 underline decoration-2">Auto_Refill: DISABLED</p>
                    </div>
                  </div>
                </div>

                <div className="brutal-border p-8 bg-white brutal-shadow-sm">
                   <h4 className="text-xl font-black italic mb-6 border-b-2 border-black pb-2">Profit_Architecture_Specs</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <p className="text-xs font-black uppercase text-pop-cyan">01 / Marketplace_Dynamics (25%)</p>
                         <p className="text-[10px] font-bold uppercase opacity-70 leading-relaxed">
                            Every standard sale generates a 20% commission for your wallet, with an additional 5% automatically routed to museum archival funds for future neural scans.
                         </p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-xs font-black uppercase text-pop-pink">02 / Neural_Auction_Stream (35%)</p>
                         <p className="text-[10px] font-bold uppercase opacity-70 leading-relaxed">
                            High-stakes auctions yield a premium 30% wallet commission. The 5% museum donation remains constant to ensure ethical data sourcing.
                         </p>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sync' && (
              <motion.div
                key="sync"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="brutal-border p-8 bg-white brutal-shadow-lg">
                   <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter">External_Data_Connectors</h2>
                      <span className="bg-pop-pink px-4 py-1 text-[10px] font-black brutal-border-sm text-white">EXTERNAL_UPLINK_READY</span>
                   </div>

                   <div className="space-y-6">
                      <div className="brutal-border p-6 bg-gray-100 flex items-center justify-between group hover:bg-black hover:text-white transition-all cursor-pointer">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white brutal-border flex items-center justify-center">
                               <ExternalLink size={32} className="text-black group-hover:text-pop-cyan transition-colors" />
                            </div>
                            <div>
                               <h4 className="text-xl font-black italic leading-none">Google_Arts_&_Culture</h4>
                               <p className="text-[10px] font-bold uppercase opacity-50 mt-2">Accessing ArtRemix Library Archives</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <p className="text-[10px] font-black uppercase">Last_Sync: 0x01_A</p>
                               <p className="text-[8px] font-bold text-pop-green">CONNECTED</p>
                            </div>
                            <button className="brutal-btn-sm bg-pop-green text-black group-hover:bg-white">REFRESH_SYNC</button>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="brutal-border p-6 bg-white">
                            <h5 className="text-xs font-black uppercase border-b border-black pb-2 mb-4 italic">Available_Archives</h5>
                            <div className="space-y-2">
                               <div className="flex justify-between text-[10px] font-bold opacity-70">
                                  <span>MET_MUSEUM_OBJ</span>
                                  <span className="text-pop-green">ACTIVE</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold opacity-70">
                                  <span>RIJKS_COLLECTION</span>
                                  <span className="text-pop-cyan">PENDING</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold opacity-70">
                                  <span>UFIZZI_GALLERY</span>
                                  <span className="text-pop-pink">ENCRYPTED</span>
                                </div>
                            </div>
                         </div>
                         <div className="brutal-border p-6 bg-black text-white">
                            <h5 className="text-xs font-black uppercase border-b border-white/20 pb-2 mb-4 italic">Neural_Scraping_Target</h5>
                            <p className="text-[9px] uppercase leading-relaxed opacity-60">
                               Auto-scanning library endpoints for historical metadata to feed the neural ghost. All data ingestion is governed by CYBERART_LICENSE_v1.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'api' && (
              <motion.div
                key="api"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                 <div className="bg-pop-yellow brutal-border p-6 brutal-shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                       <ShieldCheck className="text-black" />
                       <h3 className="text-2xl font-black italic uppercase">Key_Management</h3>
                    </div>
                    <p className="text-xs font-bold uppercase max-w-2xl leading-relaxed">
                       Your API keys carry the weight of the neural engine. Use them wisely in external CYBERART applications. NEVER expose your live secret keys in client-side code.
                    </p>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <h4 className="text-xs font-black uppercase text-gray-500">Active_Secrets</h4>
                       <button 
                        onClick={generateKey}
                        className="brutal-btn-sm bg-black text-white hover:bg-pop-pink"
                       >
                          <Plus size={14} className="inline mr-2" />
                          GENERATE_NEW_SECRET
                       </button>
                    </div>

                    <div className="brutal-border bg-white divide-y-2 divide-black">
                       {apiKeys.map(key => (
                         <div key={key.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="space-y-1">
                               <div className="flex items-center gap-3">
                                  <span className="font-mono text-sm font-black tracking-tight">{key.key}</span>
                                  <button className="text-gray-400 hover:text-black transition-colors"><Copy size={14} /></button>
                               </div>
                               <div className="flex gap-3 text-[8px] font-black uppercase opacity-50">
                                  <span>CREATED: {key.created}</span>
                                  <span>USAGE: {key.usage.toLocaleString()} UNITS</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className={cn(
                                 "text-[10px] font-black uppercase px-2 py-0.5 brutal-border-sm",
                                 key.status === 'active' ? "bg-pop-green" : "bg-red-500"
                               )}>
                                 {key.status}
                               </span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'docs' && (
              <motion.div
                key="docs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="brutal-border p-8 bg-white brutal-shadow-lg prose-styles">
                  <div className="header mb-8 pb-4 border-b-4 border-black">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">CYBERART_API_SPECS</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#666]">Build upon the neural core with our REST interface</p>
                  </div>

                  <section className="space-y-6">
                    <div className="endpoint p-4 bg-gray-100 brutal-border-sm">
                       <div className="flex items-center gap-3 mb-2">
                          <span className="bg-pop-cyan text-[10px] font-black px-2 py-0.5 brutal-border-sm uppercase">GET</span>
                          <code className="text-xs font-black">/api/v1/remix/masterpiece</code>
                       </div>
                       <p className="text-[10px] font-bold uppercase opacity-70">Fetch authorized masterpieces from the synchronized archives.</p>
                    </div>

                    <div className="endpoint p-4 bg-gray-100 brutal-border-sm">
                       <div className="flex items-center gap-3 mb-2">
                          <span className="bg-pop-green text-[10px] font-black px-2 py-0.5 brutal-border-sm uppercase">POST</span>
                          <code className="text-xs font-black">/api/v1/generate</code>
                       </div>
                       <p className="text-[10px] font-bold uppercase opacity-70">Initialize a new neural generation sequence.</p>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-xs font-black uppercase underline decoration-pop-cyan">HEADERS</h4>
                       <div className="bg-black text-white p-4 font-mono text-[10px] brutal-border-sm overflow-x-auto">
                          {`{
  "X-CyberArt-Key": "your_ca_secret_key",
  "Content-Type": "application/json"
}`}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-xs font-black uppercase underline decoration-pop-pink">BODY_PARAMETERS</h4>
                       <table className="w-full text-left text-[10px] border-collapse">
                          <thead>
                             <tr className="border-b-2 border-black font-black uppercase">
                                <th className="py-2">PARAM</th>
                                <th className="py-2">TYPE</th>
                                <th className="py-2">DESC</th>
                             </tr>
                          </thead>
                          <tbody className="font-bold uppercase opacity-80">
                             <tr className="border-b border-gray-200">
                                <td className="py-3">prompt</td>
                                <td className="text-pop-pink">string</td>
                                <td>The core subject for the neural engine</td>
                             </tr>
                             <tr className="border-b border-gray-200">
                                <td className="py-3">style</td>
                                <td className="text-pop-cyan">string</td>
                                <td>[CYBER, GHOST, NORDIC, PUNK, ABSTR]</td>
                             </tr>
                             <tr className="border-b border-gray-200">
                                <td className="py-3">dimensions</td>
                                <td className="text-pop-green">object</td>
                                <td>{`{ width: px, height: px }`}</td>
                             </tr>
                          </tbody>
                       </table>
                    </div>

                    <div className="bg-pop-cyan/10 border-l-4 border-pop-cyan p-4">
                       <p className="text-[10px] font-black italic uppercase leading-relaxed">
                          "Complexity is the final barrier. The CYBERART API removes it, allowing direct access to the ghost in the machine."
                       </p>
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === 'license' && (
               <motion.div
                key="license"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="brutal-border p-10 bg-white brutal-shadow-lg max-w-4xl">
                   <div className="flex items-center justify-between mb-10 border-b-4 border-black pb-4">
                      <h2 className="text-4xl font-black italic uppercase tracking-tighter">CYBERART_LICENSE_v1</h2>
                      <span className="bg-pop-green px-4 py-1 text-xs font-black brutal-border-sm">VALID_IDENTITY_PROTECTED</span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                         <h3 className="text-xl font-black text-pop-pink underline underline-offset-4 tracking-tighter">INDIVIDUAL_LICENSE</h3>
                         <p className="text-xs font-bold leading-relaxed uppercase opacity-80">
                            Granted to single neural pilots. Allows for personal use, non-commercial redistribution, and individual portfolio display.
                         </p>
                         <ul className="text-[10px] font-black space-y-2 opacity-60">
                            <li>• 10 NEURAL_UNITS / MO</li>
                            <li>• PERSONAL_PORTFOLIO_ONLY</li>
                            <li>• NO_RELIANCE_FOR_PROFIT</li>
                            <li>• 5_GIFT_COINS_INIT</li>
                         </ul>
                      </div>

                      <div className="space-y-6">
                         <h3 className="text-xl font-black text-pop-cyan underline underline-offset-4 tracking-tighter">COMMERCIAL_STUDIO</h3>
                         <p className="text-xs font-bold leading-relaxed uppercase opacity-80">
                            Granted to registered design firms and teams. Allows for client delivery, commercial marketing, and for-profit usage of neural outputs.
                         </p>
                         <ul className="text-[10px] font-black space-y-2 opacity-60">
                            <li>• 100 NEURAL_UNITS / MO</li>
                            <li>• ROYALTY_FREE_REPRODUCTION</li>
                            <li>• TEAM_MAIN_FRAME_ACCESS</li>
                            <li>• 20_GIFT_COINS_BONUS</li>
                         </ul>
                      </div>
                   </div>

                   <div className="mt-12 pt-8 border-t-2 border-black italic">
                      <p className="text-[9px] font-medium opacity-50 uppercase leading-loose">
                         "BY UTILIZING THE CYBERART ENGINE, THE LICENSEE ACKNOWLEDGES THE CO-AUTHORSHIP OF THE NEURAL GHOST. ALL OUTPUTS ARE TRACEABLE VIA BLOCKCHAIN_ID."
                      </p>
                      <div className="mt-6 flex justify-between items-end">
                         <div className="text-[10px] font-black uppercase">
                            <p>Author: CyberArt_AI_Nodes</p>
                            <p>Verifier: {user?.email || 'ANON_CLIENT'}</p>
                         </div>
                         <button 
                           onClick={() => window.print()}
                           className="brutal-btn-sm bg-black text-white hover:bg-pop-pink flex items-center gap-2"
                         >
                            <Download size={14} />
                            PRINT_LICENSE_PDF
                         </button>
                      </div>
                   </div>
                </div>
               </motion.div>
            )}

            {activeTab === 'downloads' && (
              <motion.div
                key="downloads"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="brutal-border p-6 bg-white brutal-shadow-sm flex flex-col gap-4">
                     <div className="aspect-video bg-gray-100 brutal-border overflow-hidden">
                        <img src="https://pollinations.ai/p/calibration%20image%20abstract%20geometric%20patterns%20blue%20and%20white%20pulse?width=512&height=512&seed=1&nologo=true" className="w-full h-full object-cover" alt="Asset 1" />
                     </div>
                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-[8px] font-black uppercase opacity-50">ASSET_ID: SYS_CAL_01</p>
                           <h4 className="text-lg font-black uppercase tracking-tighter italic">Calibration_Node_01</h4>
                        </div>
                        <div className="flex gap-2">
                           <a 
                             href="https://pollinations.ai/p/calibration%20image%20abstract%20geometric%20patterns%20blue%20and%20white%20pulse?width=1024&height=1024&seed=1&nologo=true"
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-10 h-10 bg-white brutal-border flex items-center justify-center hover:bg-pop-pink transition-colors"
                             title="Preview HQ"
                           >
                             <ExternalLink size={18} />
                           </a>
                           <button 
                             onClick={() => handleFreeDownload('https://pollinations.ai/p/calibration%20image%20abstract%20geometric%20patterns%20blue%20and%20white%20pulse?width=1024&height=1024&seed=1&nologo=true', 'sys_cal_01')}
                             className="brutal-btn-sm bg-pop-cyan flex items-center gap-2"
                           >
                              <Download size={14} />
                              SAVE
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="brutal-border p-6 bg-white brutal-shadow-sm flex flex-col gap-4">
                     <div className="aspect-video bg-gray-100 brutal-border overflow-hidden">
                        <img src="https://pollinations.ai/p/calibration%20image%20pink%20fluid%20waves%20soft%20highlights?width=512&height=512&seed=2&nologo=true" className="w-full h-full object-cover" alt="Asset 2" />
                     </div>
                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-[8px] font-black uppercase opacity-50">ASSET_ID: SYS_CAL_02</p>
                           <h4 className="text-lg font-black uppercase tracking-tighter italic">Calibration_Node_02</h4>
                        </div>
                        <div className="flex gap-2">
                           <a 
                             href="https://pollinations.ai/p/calibration%20image%20pink%20fluid%20waves%20soft%20highlights?width=1024&height=1024&seed=2&nologo=true"
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-10 h-10 bg-white brutal-border flex items-center justify-center hover:bg-pop-pink transition-colors"
                             title="Preview HQ"
                           >
                             <ExternalLink size={18} />
                           </a>
                           <button 
                             onClick={() => handleFreeDownload('https://pollinations.ai/p/calibration%20image%20pink%20fluid%20waves%20soft%20highlights?width=1024&height=1024&seed=2&nologo=true', 'sys_cal_02')}
                             className="brutal-btn-sm bg-pop-pink flex items-center gap-2"
                           >
                              <Download size={14} />
                              SAVE
                           </button>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="brutal-border p-8 bg-black text-white">
                  <p className="text-xs font-bold uppercase opacity-70 mb-4 tracking-widest">System_Integrity_Check</p>
                  <p className="text-[10px] uppercase leading-relaxed mb-6">
                    Use these sample neural artifacts to test your local print pipeline or calibrate your 4K display. These assets are public domain under the CYBERART_v1 initiative.
                  </p>
                  <div className="flex gap-2">
                     <div className="px-3 py-1 border border-white/30 text-[9px] font-black uppercase italic">PNG_FORMAT</div>
                     <div className="px-3 py-1 border border-white/30 text-[9px] font-black uppercase italic">1024x1024_RES</div>
                     <div className="px-3 py-1 border border-white/30 text-[9px] font-black uppercase italic">NO_POINT_COST</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 brutal-border transition-all text-xs font-black uppercase",
      active 
        ? "bg-black text-white brutal-shadow-sm -translate-y-0.5 xl:-translate-x-1" 
        : "bg-white hover:bg-gray-100"
    )}
  >
    {icon}
    <span className="hidden xl:inline">{label}</span>
  </button>
);

const aiThemes = ["NEON_GOTHIC", "VOID_ABSTRACTION", "FROZEN_NODES", "SYBASE_PUNK", "CHROME_GHOST", "ANIME_GHOST"];
