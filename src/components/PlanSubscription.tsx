import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

const PLANS = [
  {
    name: 'Cyberspace Init',
    price: '$0',
    description: 'Perfect for digital drifters.',
    features: ['3 Saved Canvases', 'Basic Neon Shapes', 'Standard Cyber Suggestions'],
    accent: '#1A1A1A',
  },
  {
    name: 'Artisan Glitch',
    price: '$12',
    description: 'For dedicated digital explorers.',
    features: ['Unlimited Canvases', 'Glitch Textures', 'Priority "Fool" Logic', 'Export to SVG'],
    popular: true,
    accent: '#00D1FF',
  },
  {
    name: 'Mainframe Master',
    price: '$29',
    description: 'Enterprise grade cyber-art mastery.',
    features: ['Collaborative Rooms', 'Custom Neon Palettes', 'API Access', '24/7 Tech Support'],
    accent: '#FF1D1D',
  }
];

export function PlanSubscription() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-6xl font-black italic tracking-tighter text-black mb-4 uppercase">Vault Access</h2>
        <div className="inline-block bg-pop-pink text-white px-4 py-1 brutal-border brutal-shadow-sm rotate-1">
          <p className="text-xs font-bold uppercase tracking-widest leading-loose">Choose your cyber level</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative bg-white brutal-border p-8 transition-all duration-300",
              plan.popular ? "bg-pop-yellow brutal-shadow-lg scale-105 z-10" : "brutal-shadow hover:brutal-shadow-lg"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-black rounded-none uppercase tracking-widest border-l-2 border-b-2 border-black">
                STABLE_SYNC
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black italic mb-2 tracking-tighter uppercase">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-black">{plan.price}</span>
                <span className="text-black text-xs font-extrabold uppercase">/mo</span>
              </div>
              <p className="mt-4 text-black text-xs font-bold uppercase leading-tight opacity-70">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center gap-3 text-xs font-black uppercase tracking-tight">
                  <div className="w-4 h-4 brutal-border bg-white flex items-center justify-center shrink-0">
                    <Check size={10} strokeWidth={4} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className="brutal-btn w-full py-4 text-center bg-black text-white hover:bg-pop-pink hover:text-white"
            >
              INITIALIZE_SYNC
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
