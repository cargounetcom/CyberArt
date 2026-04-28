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
  Plus
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { auth } from '../lib/firebase';

interface ApiKey {
  id: string;
  key: string;
  created: string;
  status: 'active' | 'revoked';
  usage: number;
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'api' | 'docs'>('overview');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'refused'>('idle');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', key: 'ca_live_9k2j...fLsk', created: '2026-04-20', status: 'active', usage: 1240 },
  ]);

  const user = auth.currentUser;

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
        <div className="xl:w-64 flex xl:flex-col gap-2">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity size={18}/>} label="Status_Overview" />
          <TabButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={<Key size={18}/>} label="API_Control" />
          <TabButton active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} icon={<Code2 size={18}/>} label="Dev_Specs" />
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
                        <span className="px-2 py-0.5 bg-pop-yellow text-[10px] font-black brutal-border-sm">NEURAL_PRO</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-gray-400">Total_Generations</span>
                        <span className="text-xs font-black italic underline decoration-pop-pink decoration-2">4,291_UNITS</span>
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

const aiThemes = ["NEON_GOTHIC", "VOID_ABSTRACTION", "FROZEN_NODES", "SYBASE_PUNK", "CHROME_GHOST"];
