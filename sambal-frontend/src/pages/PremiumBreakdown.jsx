import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calculator, ArrowRight, ShieldCheck, TrendingUp, TrendingDown, MapPin } from 'lucide-react';

export default function PremiumBreakdown() {
  const location = useLocation();
  const navigate = useNavigate();
  const { riskResult, formData } = location.state || {};

  if (!riskResult || !formData) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
          <p className="text-slate-500 font-medium text-lg">No risk data found.</p>
          <Button onClick={() => navigate('/onboarding')} className="bg-primary-900 text-white rounded-xl">Restart Onboarding</Button>
        </div>
      </Layout>
    );
  }

  // Base Math logic
  const baseRate = 18.00;
  
  // Use the actual backend zone multiplier
  const zoneMultiplier = riskResult.zone_multiplier || 1.20;
  
  const seasonalFactor = 1.18; // Mock for Monsoon
  const coverageTier = 1.85; // Mock for Standard
  
  // Final calculation
  const weeklyPremium = (baseRate * zoneMultiplier * seasonalFactor * coverageTier).toFixed(2);
  const diffZone1 = (weeklyPremium - (baseRate * 1.0 * seasonalFactor * coverageTier)).toFixed(2);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full px-4 pt-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary-900 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-emerald-500/20 animate-pulse" />
             <Calculator className="w-10 h-10 text-emerald-400 relative z-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Premium Breakdown</h1>
          <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">See exactly how SAMBAL's AI calculates your custom weekly premium</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Physical Receipt Metaphor */}
          <div className="relative mx-auto w-full max-w-md bg-[#fcf8f2] shadow-2xl overflow-hidden">
            {/* Top ZigZag simulation using repeating linear gradient or simple border-t dashed */}
            <div className="absolute top-0 left-0 right-0 h-2 flex">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="flex-1 border-t-4 border-dashed border-slate-200"></div>
              ))}
            </div>

            {/* Stamp Metaphor */}
            <div className="absolute top-12 right-4 rotate-12 border-4 border-emerald-500/60 text-emerald-600/60 font-black px-3 py-1 text-2xl tracking-widest rounded-md uppercase pointer-events-none select-none">
              Verified
            </div>

            <div className="p-8 pt-12 pb-12 font-mono text-slate-800 flex flex-col gap-4">
              <div className="text-center mb-6 border-b-2 border-dashed border-slate-300 pb-6">
                <h2 className="text-xl font-bold uppercase tracking-widest">SAMBAL Intelligence</h2>
                <p className="text-xs text-slate-500 mt-1 uppercase">Automated Premium Ledger</p>
                <p className="text-xs text-slate-500 mt-1">CITY: {formData.city.toUpperCase()}</p>
                <p className="text-xs text-slate-500">PLATFORM: {formData.platform.toUpperCase()}</p>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>BASE RATE</span>
                <span>₹{baseRate.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>ZONE {riskResult.risk_zone} MULTIPLIER</span>
                <span>× {zoneMultiplier.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>SEASONAL FACTOR</span>
                <span>× {seasonalFactor.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm mb-4">
                <span>COVERAGE TIER (STD)</span>
                <span>× {coverageTier.toFixed(2)}</span>
              </div>

              <div className="border-t-2 border-dashed border-slate-300 pt-6 mt-2 flex justify-between items-center bg-[#fcf8f2]">
                <span className="font-bold text-lg uppercase tracking-wider">Weekly Premium</span>
                <span className="font-bold text-2xl">₹{Math.round(weeklyPremium)}.00</span>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-[10px] text-slate-400 uppercase">* Risk adjusted purely via parametric logic.</p>
                <p className="text-[10px] text-slate-400 uppercase mt-1">TX: SMB-{(Math.random()*100000).toFixed(0)}-{new Date().getUTCHours()}</p>
              </div>
            </div>

            {/* Bottom ZigZag */}
            <div className="absolute bottom-0 left-0 right-0 h-2 flex">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="flex-1 border-b-4 border-dashed border-slate-200"></div>
              ))}
            </div>
          </div>

          <div className="bg-primary-50 p-6 rounded-2xl border-2 border-primary-100 flex gap-4 max-w-md mx-auto mt-8">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
               <TrendingDown className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-primary-900 text-sm">SAMBAL AI Note</h3>
              <p className="text-slate-700 text-sm mt-1 leading-snug font-medium">
                Risk Zone {riskResult.risk_zone} applies because {formData.city} has historically high disruption frequency. If you worked in a safer Zone 1, your premium would be <span className="font-bold">₹{Math.round(weeklyPremium - diffZone1)}.00</span> — <span className="font-bold">₹{Math.round(diffZone1)} less per week.</span>
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <Button 
              className="w-full h-16 text-lg font-black bg-slate-900 text-white rounded-2xl hover:bg-slate-800 hover:scale-[1.02] shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              onClick={() => navigate('/plans', { state: { riskResult, formData } })}
            >
              Continue to Plans <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
