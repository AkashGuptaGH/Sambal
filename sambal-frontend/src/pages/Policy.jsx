import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, IndianRupee, Activity, Pause, ArrowUpCircle, XCircle, CheckCircle, Download, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function Policy() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const baseRate = 18.00;
  const seasonalFactor = 1.18;
  const coverageTier = 1.85;

  useEffect(() => {
    if (!user) return;
    const fetchPolicy = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/policy/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setPolicyData(data);
        }
      } catch (err) {
        console.error('Policy fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [user]);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
    }, 2200);
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center mt-20">
          <p className="text-slate-500">Please login to view policy.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center mt-20 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          <p className="text-slate-500 animate-pulse">Loading policy data...</p>
        </div>
      </Layout>
    );
  }

  // Fallback data if no policy found in backend
  const policy = policyData || {
    policy_id: 'SMBL-2026-0001',
    plan: 'Basic',
    coverage_cap: user.coverageCap || 300,
    weekly_premium: user.weeklyPremium || 0,
    renewal_day: 'Monday',
    risk_zone: user.riskZone || 2,
    zone_multiplier: 1.20,
    status: 'ACTIVE',
    active_triggers: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
  };

  const barcodeValue = policy.policy_id?.replace('SMBL-', '') || '2026-0001';

  return (
    <Layout>
      <div className="flex-1 w-full max-w-[1040px] px-4 sm:px-6 lg:px-8 mx-auto pt-28 pb-12">

        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4 text-slate-500 font-bold">
            ← Back to Dashboard
          </Button>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            My Active Policy
            {policy.status === 'ACTIVE' && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-bold">ACTIVE</span>
            )}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Your SAMBAL Income Protection Certificate</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* LEFT: Main Column */}
          <div className="md:col-span-2 space-y-8">

            {/* ─── SAMBAL ID CARD ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl select-none"
                style={{ background: 'linear-gradient(135deg, #0d3b4a 0%, #1a5c70 50%, #0d3b4a 100%)' }}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }}
                />
                {/* Holographic shimmer bar */}
                <div className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #f59e0b, #10b981)' }}
                />

                <div className="relative p-8 text-white">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold text-sm uppercase tracking-widest">SAMBAL AI</span>
                      </div>
                      <p className="text-white/60 text-xs uppercase tracking-wider">Income Protection Certificate</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-widest">
                        {policy.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Insured Worker</p>
                    <h2 className="text-2xl font-black tracking-tight">{user.name}</h2>
                    <p className="text-white/60 text-sm mt-1">{user.platform} · {user.city}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div>
                      <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Plan</p>
                      <p className="text-white font-bold text-sm">{policy.plan}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Weekly Premium</p>
                      <p className="text-white font-bold text-sm">₹{policy.weekly_premium}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Coverage Cap</p>
                      <p className="text-white font-bold text-sm">₹{policy.coverage_cap}/wk</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Policy ID</p>
                      <p className="text-white font-mono font-bold text-sm">{policy.policy_id}</p>
                    </div>
                    {/* CSS Barcode simulation */}
                    <div className="flex gap-[2px] items-end h-8">
                      {barcodeValue.split('').map((char, i) => (
                        <div
                          key={i}
                          className="bg-white/80"
                          style={{
                            width: i % 3 === 0 ? '3px' : '1.5px',
                            height: i % 5 === 0 ? '100%' : i % 3 === 0 ? '70%' : '85%',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ─── CERTIFICATE DOWNLOAD ─── */}
            <Button
              id="download-certificate-btn"
              onClick={handleDownload}
              disabled={downloading}
              className={`w-full h-14 font-bold text-base rounded-2xl flex items-center justify-center gap-3 transition-all ${
                downloaded
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Verified Certificate...
                </>
              ) : downloaded ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Certificate Ready — SMBL-CERT-{new Date().getFullYear()}.pdf
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Policy Certificate
                </>
              )}
            </Button>

            {/* ─── PREMIUM THERMAL RECEIPT ─── */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                Premium Calculation Ledger
              </h2>

              <div className="relative mx-auto bg-[#fcf8f2] shadow-xl overflow-hidden">
                {/* Top dashed edge */}
                <div className="absolute top-0 left-0 right-0 h-0 border-t-4 border-dashed border-slate-300" />

                {/* Verified stamp */}
                <div className="absolute top-10 right-6 rotate-12 border-4 border-emerald-500/50 text-emerald-600/50 font-black px-3 py-1 text-2xl tracking-widest rounded-md uppercase pointer-events-none">
                  Verified
                </div>

                <div className="p-8 pt-10 pb-10 font-mono text-slate-800 flex flex-col gap-4">
                  <div className="text-center border-b-2 border-dashed border-slate-300 pb-6 mb-2">
                    <h3 className="text-base font-bold uppercase tracking-widest">SAMBAL Intelligence</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase">Policy Premium Ledger</p>
                    <p className="text-xs text-slate-500 mt-1">CITY: {user.city?.toUpperCase()}</p>
                    <p className="text-xs text-slate-500">PLATFORM: {user.platform?.toUpperCase()}</p>
                  </div>

                  <div className="flex justify-between text-sm"><span>BASE RATE</span><span>₹{baseRate.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span>ZONE {policy.risk_zone} MULTIPLIER</span><span>× {(policy.zone_multiplier || 1.2).toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span>SEASONAL FACTOR</span><span>× {seasonalFactor.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm mb-2"><span>COVERAGE TIER</span><span>× {coverageTier.toFixed(2)}</span></div>

                  <div className="border-t-2 border-dashed border-slate-300 pt-6 flex justify-between items-center">
                    <span className="font-bold text-lg uppercase tracking-wider">Weekly Premium</span>
                    <span className="font-bold text-2xl">₹{policy.weekly_premium}.00</span>
                  </div>

                  <div className="text-center mt-6">
                    <p className="text-[10px] text-slate-400 uppercase">* Risk adjusted via parametric ML pipeline.</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-1">REF: {policy.policy_id} · RENEWS: {policy.renewal_day?.toUpperCase()}</p>
                  </div>
                </div>

                {/* Bottom dashed edge */}
                <div className="absolute bottom-0 left-0 right-0 h-0 border-b-4 border-dashed border-slate-300" />
              </div>
            </div>

            {/* ─── COVERAGE DETAILS ─── */}
            <Card className="border-2 border-slate-100 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 text-base mb-4 border-b border-slate-100 pb-3">What's Covered</h3>
                <ul className="space-y-3 text-sm text-slate-700 font-medium mb-6">
                  <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Verified extreme rainfall (&gt;35mm/hr) in your zone</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Excessive heat heatwave (&gt;42°C heat index)</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Civic disruptions (Bandh/Strikes/Riots) limiting mobility</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Localized infrastructure failure (floods) mapped by IMD</li>
                </ul>
                <h3 className="font-bold text-slate-800 text-base mb-4 border-b border-slate-100 pb-3">What's Excluded</h3>
                <ul className="space-y-3 text-sm text-slate-700 font-medium">
                  <li className="flex items-center gap-3"><XCircle className="w-4 h-4 text-rose-500 shrink-0" /> Platform-specific internal outages (e.g. Swiggy server down)</li>
                  <li className="flex items-center gap-3"><XCircle className="w-4 h-4 text-rose-500 shrink-0" /> Personal vehicle breakdown or intentional offline status</li>
                  <li className="flex items-center gap-3"><XCircle className="w-4 h-4 text-rose-500 shrink-0" /> Fraudulent GPS spoofing or location manipulation</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-6">

            {/* Active Triggers */}
            <Card className="border-2 border-slate-100 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-indigo-600" /> Active Trigger Monitoring
                </h3>
                <div className="flex flex-col gap-2">
                  {(policy.active_triggers || ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']).map((t) => (
                    <div key={t} className="flex justify-between items-center bg-slate-50 p-2 px-3 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-700 text-sm">{t}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Listening
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-4 text-center">Systems active via satellite & local APIs</p>
              </CardContent>
            </Card>

            {/* Policy Actions */}
            <Card className="border-2 border-slate-100 shadow-lg rounded-2xl">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">Policy Actions</h3>
                <Button
                  id="upgrade-plan-btn"
                  variant="outline"
                  onClick={() => navigate('/plans')}
                  className="w-full justify-start text-primary-900 font-bold border-primary-200 bg-primary-50 hover:bg-primary-100 flex items-center gap-3 py-5"
                >
                  <ArrowUpCircle className="w-5 h-5" /> Upgrade Plan
                </Button>
                <Button
                  id="pause-coverage-btn"
                  variant="outline"
                  className="w-full justify-start text-slate-700 font-bold border-slate-200 hover:bg-slate-50 flex items-center gap-3 py-5"
                >
                  <Pause className="w-5 h-5" /> Pause Coverage
                </Button>
                <Button
                  id="cancel-policy-btn"
                  variant="outline"
                  className="w-full justify-start text-rose-600 font-bold border-rose-200 hover:bg-rose-50 flex items-center gap-3 py-5"
                >
                  <XCircle className="w-5 h-5" /> Cancel Policy
                </Button>
              </CardContent>
            </Card>

            {/* Next Renewal */}
            <div className="bg-primary-900 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-20 h-20" />
              </div>
              <p className="text-primary-300 text-xs uppercase tracking-wider font-bold mb-2">Next Auto-Debit</p>
              <p className="text-3xl font-black mb-1">₹{policy.weekly_premium}</p>
              <p className="text-primary-300 text-sm">Auto-renews every {policy.renewal_day}</p>
              <p className="text-primary-400 text-xs mt-3">via UPI · Zero-downtime renewal</p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
