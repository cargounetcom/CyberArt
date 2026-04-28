import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ghost, Snowflake, Zap, Skull, Box, Share2, Download, Search, Filter, Layers, History, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Work {
  id: string;
  title: string;
  author?: string;
  year?: string;
  style: string;
  color: string;
  prompt: string;
  imageUrl: string;
  originalUrl?: string;
  category: 'NEURAL' | 'REMIX' | 'FREE';
  match?: number;
}

const LIBRARY_WORKS: Work[] = [
  {
    id: 'free-1',
    title: 'SYSTEM_CALIBRATION_01',
    style: 'NEURAL_FREE',
    color: '#00D1FF',
    prompt: 'Free calibration image, abstract geometric patterns, blue and white pulse',
    imageUrl: 'https://pollinations.ai/p/calibration%20image%20abstract%20geometric%20patterns%20blue%20and%20white%20pulse?width=1024&height=1024&seed=1&nologo=true',
    category: 'FREE'
  },
  {
    id: 'free-2',
    title: 'SYSTEM_CALIBRATION_02',
    style: 'NEURAL_FREE',
    color: '#FF00FF',
    prompt: 'Free calibration image, pink fluid waves, soft highlights',
    imageUrl: 'https://pollinations.ai/p/calibration%20image%20pink%20fluid%20waves%20soft%20highlights?width=1024&height=1024&seed=2&nologo=true',
    category: 'FREE'
  },
  {
    id: 'remix-low-3',
    title: 'GLITCH_CALIBRATION_3',
    author: 'SYSTEM_GEN',
    year: '2026',
    style: 'RAW_NEURAL',
    color: '#000000',
    prompt: 'Low fidelity neural glitch, abstract noise, system calibration 03',
    imageUrl: 'https://pollinations.ai/p/low%20fidelity%20neural%20glitch%20abstract%20noise%20system%203?width=1024&height=1024&seed=3&nologo=true',
    category: 'NEURAL',
    match: 3
  },
  {
    id: 'remix-venus',
    title: 'VENUS_GLASS_CORE',
    author: 'SANDRO_BOTTICELLI',
    year: '1485 / 2026',
    style: 'RENAISSANCE_FLUID',
    color: '#FF9999',
    prompt: 'The Birth of Venus remix, soft watercolor gradients, ethereal liquid shells, Taiwing style flowing hair, pastel aesthetic',
    imageUrl: 'https://pollinations.ai/p/The%20Birth%20of%20Venus%20remix%20soft%20watercolor%20gradients%20ethereal%20liquid%20shells%20Taiwing%20style%20hair?width=1024&height=1024&seed=777&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project.jpg',
    category: 'REMIX',
    match: 99
  },
  {
    id: 'remix-earring',
    title: 'PEARL_GLITCH_ID',
    author: 'JOHANNES_VERMEER',
    year: '1665 / 2026',
    style: 'BAROQUE_CYBER',
    color: '#3B82F6',
    prompt: 'Girl with a Pearl Earring remix, holographic skin, glowing pearl circuit, deep velvet shadow, cinematic focus',
    imageUrl: 'https://pollinations.ai/p/Girl%20with%20a%20Pearl%20Earring%20remix%20holographic%20skin%20glowing%20pearl%20circuit%20deep%20velvet%20shadow?width=1024&height=1024&seed=222&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Johannes_Vermeer_%281632-1675%29_-_The_Girl_With_The_Pearl_Earring_%281665%29.jpg/800px-Johannes_Vermeer_%281632-1675%29_-_The_Girl_With_The_Pearl_Earring_%281665%29.jpg',
    category: 'REMIX',
    match: 98
  },
  {
    id: 'remix-kiss',
    title: 'GOLD_CIRCUIT_KISS',
    author: 'GUSTAV_KLIMT',
    year: '1907 / 2026',
    style: 'ART_NOUVEAU_PUNK',
    color: '#EAB308',
    prompt: 'The Kiss by Klimt remix, gold circuit patterns, geometric texture, cyberpunk romance, glowing amber light',
    imageUrl: 'https://pollinations.ai/p/The%20Kiss%20by%20Klimt%20remix%20gold%20circuit%20patterns%20geometric%20texture%20cyberpunk%20romance?width=1024&height=1024&seed=333&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/The_Kiss_-_Gustav_Klimt_-_Google_Art_Project.jpg/800px-The_Kiss_-_Gustav_Klimt_-_Google_Art_Project.jpg',
    category: 'REMIX',
    match: 97
  },
  {
    id: 'remix-meninas',
    title: 'INFANTA_MIRROR_MOD',
    author: 'DIEGO_VELAZQUEZ',
    year: '1656 / 2026',
    style: 'BAROQUE_BRUTALISM',
    color: '#71717A',
    prompt: 'Las Meninas remix, mirror reflections, brutalist room architecture, oil textures, dramatic chiaroscuro',
    imageUrl: 'https://pollinations.ai/p/Las%20Meninas%20remix%20mirror%20reflections%20brutalist%20room%20architecture%20oil%20textures?width=1024&height=1024&seed=555&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg/1280px-Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg',
    category: 'REMIX',
    match: 95
  },
  {
    id: 'remix-impressionism',
    title: 'NEW_YORK_SNOW_REMIX',
    author: 'CHILDE_HASSAM',
    year: '1900 / 2026',
    style: 'AMERICAN_IMPRESSIONISM',
    color: '#CBD5E1',
    prompt: 'American Impressionist snowy street, soft oil brushstrokes, hazy blue light, glowing windows',
    imageUrl: 'https://pollinations.ai/p/American%20Impressionist%20snowy%20street%20soft%20oil%20brushstrokes%20hazy%20blue%20light%20glowing%20windows?width=1024&height=1024&seed=88&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Childe_Hassam_-_Late_Afternoon%2C_New_York%2C_Winter%2C_1900.jpg/800px-Childe_Hassam_-_Late_Afternoon%2C_New_York%2C_Winter%2C_1900.jpg',
    category: 'REMIX',
    match: 98
  },
  {
    id: 'remix-futurism',
    title: 'SPEEDING_LOCOMOTIVE',
    author: 'UMBERTO_BOCCIONI',
    year: '1911 / 2026',
    style: 'FUTURISM',
    color: '#EF4444',
    prompt: 'Futurist movement art, dynamic motion lines, overlapping geometric shapes, industrial fragments, velocity',
    imageUrl: 'https://pollinations.ai/p/Futurist%20movement%20art%20dynamic%20motion%20lines%20overlapping%20geometric%20shapes%20industrial%20fragments%20velocity?width=1024&height=1024&seed=11&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Boccioni_-_The_Forces_of_a_Street.jpg/800px-Boccioni_-_The_Forces_of_a_Street.jpg',
    category: 'REMIX',
    match: 97
  },
  {
    id: 'remix-pollock',
    title: 'NEURAL_DRIP_LOGIC',
    author: 'JACKSON_POLLOCK',
    year: '1950 / 2026',
    style: 'ABSTRACT_EXPRESSIONISM',
    color: '#111827',
    prompt: 'Abstract expressionism drip painting, chaotic splatters, deep texture, layered obsidian and gold, neural network pattern',
    imageUrl: 'https://pollinations.ai/p/Abstract%20expressionism%20drip%20painting%20chaotic%20splatters%20deep%20texture%20layered%20obsidian%20and%20gold?width=1024&height=1024&seed=77&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Autumn_Rhythm.jpg/1280px-Autumn_Rhythm.jpg',
    category: 'REMIX',
    match: 99
  },
  {
    id: 'remix-rembrandt',
    title: 'THE_NIGHT_GLITCH',
    author: 'REMBRANDT',
    year: '1642 / 2026',
    style: 'BAROQUE_NEURAL',
    color: '#451a03',
    prompt: 'The Night Watch remix, dramatic chiaroscuro, glowing golden armor, volumetric neural energy, cinematic baroque lighting',
    imageUrl: 'https://pollinations.ai/p/The%20Night%20Watch%20remix%20dramatic%20chiaroscuro%20glowing%20golden%20armor%20volumetric%20neural%20energy?width=1024&height=1024&seed=999&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg',
    category: 'REMIX',
    match: 96
  },
  {
    id: 'remix-delacroix',
    title: 'LIBERTY_LEADING_v2',
    author: 'EUGENE_DELACROIX',
    year: '1830 / 2026',
    style: 'ROMANTIC_CYBER',
    color: '#991b1b',
    prompt: 'Liberty Leading the People remix, cyberpunk revolution, holographic flags, smoky neon battlefield, oil paint textures',
    imageUrl: 'https://pollinations.ai/p/Liberty%20Leading%20the%20People%20remix%20cyberpunk%20revolution%20holographic%20flags%20smoky%20neon%20battlefield?width=1024&height=1024&seed=888&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/800px-Eug%C3%A8ne_Delacroix_-_Le_28_juillet._La_Libert%C3%A9_guidant_le_peuple.jpg',
    category: 'REMIX',
    match: 97
  },
  {
    id: 'remix-bosch',
    title: 'GARDEN_OF_NEURAL_DELIGHTS',
    author: 'HIERONYMUS_BOSCH',
    year: '1500 / 2026',
    style: 'SURREAL_DATASCAPE',
    color: '#166534',
    prompt: 'Garden of Earthly Delights remix, psychedelic detail, bio-mechanical hybrids, digital datascape, infinite detail zoom',
    imageUrl: 'https://pollinations.ai/p/Garden%20of%20Earthly%20Delights%20remix%20psychedelic%20detail%20bio-mechanical%20hybrids%20digital%20datascape?width=1024&height=1024&seed=666&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg/1280px-The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg',
    category: 'REMIX',
    match: 94
  },
  {
    id: 'remix-picasso',
    title: 'CUBIST_WAR_ECHO',
    author: 'PABLO_PICASSO',
    year: '1937 / 2026',
    style: 'CUBIST_GLITCH',
    color: '#525252',
    prompt: 'Guernica remix, monochrome cubism, glitch distortion, skeletal neon highlights, sharp geometric pain',
    imageUrl: 'https://pollinations.ai/p/Guernica%20remix%20monochrome%20cubism%20glitch%20distortion%20skeletal%20neon%20highlights?width=1024&height=1024&seed=444&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/PicassoGuernica.jpg/1280px-PicassoGuernica.jpg',
    category: 'REMIX',
    match: 98
  },
  {
    id: 'remix-wood',
    title: 'NEO_GOTHIC_COUPLE',
    author: 'GRANT_WOOD',
    year: '1930 / 2026',
    style: 'RURAL_BRUTALISM',
    color: '#d4d4d8',
    prompt: 'American Gothic remix, cyber-rural aesthetic, glowing pitchfork, visor implants on farmer, wood texture glitch',
    imageUrl: 'https://pollinations.ai/p/American%20Gothic%20remix%20cyber-rural%20aesthetic%20glowing%20pitchfork%20visor%20implants?width=1024&height=1024&seed=111&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/800px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg',
    category: 'REMIX',
    match: 95
  },
  {
    id: 'ghostly-1',
    title: 'THE_ETHEREAL_VOID',
    style: 'GHOSTLY',
    color: '#E0E0E0',
    prompt: 'Haunting gothic atmosphere, ghostly figures, dark lace, Victorian horror, ethereal smoke',
    imageUrl: 'https://pollinations.ai/p/Haunting%20gothic%20atmosphere%2C%20ghostly%20figures%2C%20dark%20lace%2C%20Victorian%20horror%2C%20ethereal%20smoke?width=1024&height=1024&nologo=true',
    category: 'NEURAL'
  },
  {
    id: 'remix-starry',
    title: 'STARRY_NIGHT_REMIX',
    author: 'VINCENT_VAN_GOGH',
    year: '1889 / 2026',
    style: 'NEO_IMPRESSIONISM',
    color: '#1E3A8A',
    prompt: 'Starry Night by Van Gogh, but with flowing taiwing style gradients, glass textures, cinematic lighting',
    imageUrl: 'https://pollinations.ai/p/Starry%20Night%20by%20Van%20Gogh%2C%20but%20with%20flowing%20taiwing%20style%20gradients%2C%20glass%20textures%2C%20cinematic%20lighting?width=1024&height=1024&seed=42&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    category: 'REMIX',
    match: 97
  },
  {
    id: 'remix-mona',
    title: 'CYBER_LISA_MOD',
    author: 'LEONARDO_DA_VINCI',
    year: '1503 / 2026',
    style: 'CYBER_BRUTALISM',
    color: '#4B5563',
    prompt: 'Mona Lisa remix, glitch art, cybernetic implants, neon green accents, rainy street reflection',
    imageUrl: 'https://pollinations.ai/p/Mona%20Lisa%20remix%2C%20glitch%20art%2C%20cybernetic%20implants%2C%20neon%20green%20accents%2C%20rainy%20street%20reflection?width=1024&height=1024&seed=12&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    category: 'REMIX',
    match: 98
  },
  {
    id: 'nordic-1',
    title: 'FROST_RUNE_09',
    style: 'NORDIC',
    color: '#A5F3FC',
    prompt: 'Nordic minimalism, icy blues, snowy landscapes, runic symbols, cold light',
    imageUrl: 'https://pollinations.ai/p/Nordic%20minimalism%2C%20icy%20blues%2C%20snowy%20landscapes%2C%20runic%20symbols%2C%20cold%20light?width=1024&height=1024&nologo=true',
    category: 'NEURAL'
  },
  {
    id: 'remix-wave',
    title: 'GREAT_WAVE_GOTHIC',
    author: 'KATSUSHIKA_HOKUSAI',
    year: '1831 / 2026',
    style: 'GOTHIC_PUNK',
    color: '#000000',
    prompt: 'The Great Wave off Kanagawa by Hokusai, gothic horror style, skeletal waves, dark stormy ink',
    imageUrl: 'https://pollinations.ai/p/The%20Great%20Wave%20off%20Kanagawa%20by%20Hokusai%2C%20gothic%20horror%20style%2C%20skeletal%20waves%2C%20dark%20stormy%20ink?width=1024&height=1024&seed=99&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Great_Wave_off_Kanagawa2.jpg/1280px-Great_Wave_off_Kanagawa2.jpg',
    category: 'REMIX',
    match: 94
  },
  {
    id: 'remix-scream',
    title: 'NEON_SCREAM_v4',
    author: 'EDVARD_MUNCH',
    year: '1893 / 2026',
    style: 'EXPRESSIONISM',
    color: '#F97316',
    prompt: 'The Scream by Edvard Munch, neon vaporwave colors, glitch trails, distorted sunset art',
    imageUrl: 'https://pollinations.ai/p/The%20Scream%20remix%20neon%20vaporwave%20colors%20glitch%20trails%20distorted%20sunset?width=1024&height=1024&seed=55&nologo=true',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Scream.jpg/800px-The_Scream.jpg',
    category: 'REMIX',
    match: 96
  },
  {
    id: 'abstract-1',
    title: 'GEOMETRIC_CHAOS',
    style: 'ABSTRACTION',
    color: '#FFDE03',
    prompt: 'Abstract expressionism, focal points, geometric chaos, textured brushwork, bold colors',
    imageUrl: 'https://pollinations.ai/p/Abstract%20expressionism%2C%20focal%20points%2C%20geometric%20chaos%2C%20textured%20brushwork%2C%20bold%20colors?width=1024&height=1024&nologo=true',
    category: 'NEURAL'
  }
];

export function Gallery({ onRemix }: { onRemix: (canvas: any) => void }) {
  const [filter, setFilter] = useState<'ALL' | 'NEURAL' | 'REMIX' | 'FREE'>('ALL');
  const [matchRange, setMatchRange] = useState<number>(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredWorks = LIBRARY_WORKS.filter(w => {
    const categoryMatch = filter === 'ALL' || w.category === filter;
    const scoreMatch = w.match ? w.match >= matchRange : true;
    return categoryMatch && scoreMatch;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b-8 border-black pb-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">ArtRemix_Library</h2>
            <div className="flex items-center gap-4 mt-2">
               <p className="text-xs font-bold uppercase tracking-widest text-[#666]">Historical Masterpieces meets Neural Hallucinations</p>
               <div className="flex items-center gap-2 bg-black text-white px-2 py-0.5 text-[9px] font-black brutal-border-sm">
                  <div className="w-1.5 h-1.5 bg-pop-green rounded-full animate-pulse" />
                  ARTS_CULTURE_SYNC: ACTIVE
               </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
             <CategoryTab active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="VIEW_ALL" />
             <CategoryTab active={filter === 'REMIX'} onClick={() => setFilter('REMIX')} label="ART_REMIX" icon={<History size={12}/>} />
             <CategoryTab active={filter === 'FREE'} onClick={() => setFilter('FREE')} label="FREE_SAMPLES" icon={<Sparkles size={12}/>} />
             <CategoryTab active={filter === 'NEURAL'} onClick={() => setFilter('NEURAL')} label="NEURAL_ONLY" icon={<Layers size={12}/>} />
          </div>
        </div>

        <div className="brutal-border p-6 bg-pop-yellow brutal-shadow-sm flex flex-col gap-3 min-w-[300px]">
           <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-black flex items-center gap-2">
                 <Filter size={12} />
                 REMIX_STRENGTH_MIN
              </span>
              <span className="text-xl font-black italic">{matchRange}%</span>
           </div>
           <input 
             type="range" 
             min="1" 
             max="99" 
             value={matchRange}
             onChange={(e) => setMatchRange(parseInt(e.target.value))}
             className="w-full accent-black h-2 bg-white brutal-border-sm appearance-none cursor-pointer"
           />
           <div className="flex justify-between text-[8px] font-bold opacity-60">
              <span>ALPHA_01%</span>
              <span>ULTRA_99%</span>
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
        <AnimatePresence mode="popLayout">
          {filteredWorks.map((work) => (
            <motion.div 
              key={work.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onMouseEnter={() => setHoveredId(work.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group"
            >
              <div className="brutal-border brutal-shadow-lg bg-white overflow-hidden flex flex-col h-full relative">
                {/* Comparison Aspect */}
                <div className="relative aspect-square border-b-4 border-black bg-gray-100 overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-10 pointer-events-none z-10" 
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '15px 15px' }} 
                  />
                  
                  {/* Remix Image */}
                  <img 
                    src={work.imageUrl} 
                    alt={work.title}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700",
                      work.originalUrl && hoveredId === work.id ? "translate-x-full" : "translate-x-0"
                    )}
                  />

                  {/* Original Image (Hidden behind/side) */}
                  {work.originalUrl && (
                    <div className={cn(
                      "absolute inset-0 transition-transform duration-700",
                      hoveredId === work.id ? "translate-x-0" : "-translate-x-full"
                    )}>
                      <img src={work.originalUrl} className="w-full h-full object-cover grayscale" alt="Original" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-4xl font-black italic uppercase tracking-tighter mix-blend-overlay">ORIGINAL</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Labels */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between z-20 pointer-events-none">
                     <div className="flex flex-col gap-1">
                        <span className={cn(
                          "px-2 py-1 text-[8px] font-black uppercase tracking-widest brutal-border-sm transition-colors",
                          work.category === 'REMIX' ? "bg-pop-pink text-white" : "bg-black text-white"
                        )}>
                           {work.style}
                        </span>
                        {work.originalUrl && (
                          <span className="bg-pop-yellow text-black px-2 py-0.5 text-[7px] font-black uppercase brutal-border-sm">
                            HISTORICAL_REMIX
                          </span>
                        )}
                     </div>
                     <div className="flex gap-2 pointer-events-auto">
                        <button className="w-8 h-8 bg-white brutal-border-sm brutal-shadow-sm flex items-center justify-center hover:bg-pop-cyan transition-colors">
                          <Share2 size={14} />
                        </button>
                     </div>
                  </div>

                  {work.originalUrl && (
                    <div className="absolute bottom-4 left-4 z-20 bg-black text-white p-2 brutal-border-sm text-[8px] font-black uppercase animate-pulse">
                      HOVER_TO_REVEAL_ORIGINAL
                    </div>
                  )}

                  {work.match && (
                    <div className="absolute bottom-4 right-4 z-30 bg-pop-green text-black px-2 py-1 brutal-border-sm text-[10px] font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                      MATCH_{work.match}%
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 gap-4">
                  <div>
                    <h3 className="text-xl font-black italic tracking-tight uppercase">{work.title}</h3>
                    {work.author && (
                      <div className="flex items-center gap-2 mt-1">
                        <History size={12} className="text-pop-pink" />
                        <span className="text-[10px] font-black underline">{work.author}</span>
                        <span className="text-[10px] opacity-40">/ {work.year}</span>
                      </div>
                    )}
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 leading-relaxed line-clamp-2">
                      {work.prompt}
                    </p>
                  </div>

                  <div className="mt-auto space-y-3">
                    <button 
                      onClick={() => onRemix({
                        id: work.id,
                        name: work.title,
                        shapes: JSON.stringify([{
                          id: `remix-${Date.now()}`,
                          type: 'image',
                          x: 50,
                          y: 50,
                          width: 400,
                          height: 400 * (work.category === 'REMIX' ? 1 : 1),
                          fill: 'transparent',
                          rotation: 0,
                          imageSource: work.imageUrl,
                          depth: 30,
                          tilt: 45
                        }])
                      })}
                      className="brutal-btn w-full bg-pop-green flex items-center justify-center gap-2 group/btn"
                    >
                      <Sparkles size={16} className="group-hover/btn:rotate-12 transition-transform" />
                      LOAD_INTO_3D_ENGINE
                    </button>
                    
                    <div className="flex justify-between items-center text-[9px] font-black uppercase opacity-60">
                      <span className="flex items-center gap-1">
                         {work.style.includes('GHOST') && <Ghost size={10} />}
                         {work.style.includes('NORDIC') && <Snowflake size={10} />}
                         {work.style.includes('PUNK') && <Skull size={10} />}
                         {work.style.includes('ABSTRACT') && <Zap size={10} />}
                         ID: {work.id}
                      </span>
                      <span>VAR_SIZE_POINT</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Collective Frame Banner */}
      <div className="brutal-border p-12 bg-black text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black italic mb-4">NEURAL_COLLECTIVE_v1</h2>
          <p className="font-bold opacity-70 mb-8 border-l-4 border-pop-yellow pl-6 uppercase text-xs leading-loose">
            Explore the intersection of history and hallucination. Our ArtRemix module allows you to take any historical asset and apply point-gradiant-glass transformations. Every export is archival grade.
          </p>
          <div className="flex gap-4">
             <button className="brutal-btn bg-white text-black px-8">EXPAND_LIBRARIES</button>
             <button className="brutal-btn border-white bg-transparent text-white px-8">neural_specs.pdf</button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-30 flex flex-wrap gap-1 p-2 overflow-hidden pointer-events-none">
           {[...Array(60)].map((_, i) => (
             <div key={i} className="w-6 h-6 bg-white/20 brutal-border-sm" />
           ))}
        </div>
      </div>
    </div>
  );
}

const CategoryTab = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon?: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={cn(
      "px-4 py-2 brutal-border text-xs font-black uppercase transition-all flex items-center gap-2",
      active ? "bg-black text-white brutal-shadow-sm -translate-y-1" : "bg-white hover:bg-gray-100"
    )}
  >
    {icon}
    {label}
  </button>
);
