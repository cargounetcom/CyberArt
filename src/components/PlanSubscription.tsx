import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

const PLANS = [
  {
    id: 'free',
    name: 'Free_Entry_Protocol',
    price: '0€',
    description: '5 Neural Images per month. Start your journey.',
    features: ['5_IMAGE_CREDITS', 'Community Workspace', 'No Cards Required', 'Basic Sync'],
    accent: '#00FF00',
  },
  {
    id: 'api',
    name: 'Neural_API_Access',
    price: '5€',
    description: 'Dedicated API uplink for external integrations.',
    features: ['REST_API_ENDPOINTS', '1_API_KEY_SYNC', '100_CALLS_MO', 'BASIC_WEBHOOKS'],
    accent: '#00FFD1',
  },
  {
    id: 'individual',
    name: 'Individual_License',
    price: '10€',
    description: '1 License for 10 Neural Images.',
    features: ['10_IMAGE_CREDITS', '5_GIFT_COINS_BONUS', 'Individual Usage', 'Standard Support'],
    accent: '#FF00FF',
  },
  {
    id: 'commercial',
    name: 'Commercial_Studio',
    price: '100€',
    description: '1 License for 100 Neural Images.',
    features: ['100_IMAGE_CREDITS', '20_GIFT_COINS_BONUS', 'Commercial Usage License', 'Design Studio & Teams Access', 'API Management'],
    popular: true,
    accent: '#00D1FF',
  },
  {
    id: 'academic',
    name: 'Academic_Hub',
    price: 'STUDENT',
    description: 'Special tier for Schools & Universities.',
    features: ['Bulk Student Accounts', 'Multi-User Workspace', 'Neural Education Tools', 'University Portal Connect'],
    accent: '#FFDE03',
  }
];

export function PlanSubscription() {
  const handleSubscribe = async (plan: any) => {
    if (plan.id === 'free') {
      alert('FREE_TIER_ACTIVATED: Protocol initialized with no card required.');
      return;
    }
    
    if (plan.id === 'academic') {
      window.location.href = `mailto:ellanovachenko@gmail.com?subject=Academic License Inquiry - CYBERART&body=Hello, I am interested in the Academic Hub plan for my institution...`;
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: plan.id,
          successUrl: window.location.origin + '/dashboard?payment=success',
          cancelUrl: window.location.origin + '/plans?payment=cancel'
        }),
      });
      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('STRIPE_CONNECTION_ERROR: Failed to initialize payment protocol.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-6xl font-black italic tracking-tighter text-black mb-4 uppercase">Vault Access</h2>
        <div className="inline-block bg-pop-pink text-white px-4 py-1 brutal-border brutal-shadow-sm rotate-1">
          <p className="text-xs font-bold uppercase tracking-widest leading-loose">Choose your cyber level</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
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
              <h3 className="text-xl font-black italic mb-2 tracking-tighter uppercase">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-black">{plan.price}</span>
                {plan.id !== 'academic' && <span className="text-black text-xs font-extrabold uppercase">/mo</span>}
              </div>
              <p className="mt-4 text-black text-[10px] font-bold uppercase leading-tight opacity-70">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tight">
                  <div className="w-4 h-4 brutal-border bg-white flex items-center justify-center shrink-0">
                    <Check size={10} strokeWidth={4} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              className={cn(
                "brutal-btn w-full py-4 text-center bg-pop-pink text-white transition-colors text-xs font-black uppercase tracking-widest hover:bg-black",
              )}
            >
              {plan.id === 'academic' ? 'VERIFY_ACADEMIC_ID' : plan.id === 'free' ? 'ACTIVATE_FREE_PROTOCOL' : 'INITIALIZE_SYNC'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
