import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Timeline } from '../components/ui/Timeline';
import { Button } from '../components/ui/Button';
import { CheckCircle2, XCircle, AlertTriangle, ChevronLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function Claims() {
  const [activeStep, setActiveStep] = useState(0);
  const [claimResult, setClaimResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useStore();

  useEffect(() => {
    let timer;
    if (activeStep === 0) {
      // Step 0: Check Triggers
      const checkTriggers = async () => {
        try {
           const triggerRes = await fetch(`http://127.0.0.1:8000/api/triggers/active/${user?.city || 'Chennai'}/${user?.persona || 'food_delivery'}`);
           const triggerData = await triggerRes.json();
           
           if (!triggerData.triggers || triggerData.triggers.length === 0) {
              // No triggers active -> Fake a T1 for the demo if user clicks "File Claim"
              timer = setTimeout(() => setActiveStep(1), 1500);
           } else {
              // Trigger active, proceed
              timer = setTimeout(() => setActiveStep(1), 1500);
           }
        } catch (err) {
           setError(err.message);
        }
      };
      
      checkTriggers();
    } else if (activeStep === 1) {
      // Step 1: Hit API
      const fetchClaim = async () => {
        try {
          // Fetch the latest weather for the city to get dynamic parameters (wind, aqi)
          const cityToFetch = user?.city || 'Chennai';
          const weatherRes = await fetch(`http://127.0.0.1:8000/api/weather/${cityToFetch}`);
          const w = await weatherRes.json();

          const res = await fetch("http://127.0.0.1:8000/api/claims/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              worker_id: user?.id || "W-10442",
              trigger_id: "T1",
              rain_mm: w.rain_mm || 55,
              heat_c: w.heat_index_c || 32,
              strike_severity: 0,
              gps_lat: 13.08,
              gps_lon: 80.27,
              platform_earnings_drop: 0.8,
              wind_kmh: w.wind_kmh || 15,
              aqi: w.aqi || 120
            })
          });
          if (!res.ok) throw new Error("Failed to submit claim");
          const data = await res.json();
          setClaimResult(data);
          setActiveStep(2);
        } catch (err) {
          setError(err.message);
        }
      };
      
      // Delay slightly for effect
      timer = setTimeout(fetchClaim, 2000);
    } else if (activeStep === 2 && claimResult) {
      // Step 2 -> Step 3
      timer = setTimeout(() => setActiveStep(3), 2000);
    } else if (activeStep === 3 && claimResult) {
      // Step 3 -> Step 4
      timer = setTimeout(() => setActiveStep(4), 1500);
    }
    return () => clearTimeout(timer);
  }, [activeStep, claimResult, user]);

  const getSteps = () => {
    const base = [
      { title: "Claim Initiated", description: "Connecting to SAMBAL Network", aiValidation: false },
      { title: "Parametric Trigger Analysis", description: claimResult ? "Trigger module complete." : "Evaluating weather conditions and trigger thresholds...", aiValidation: true },
      { title: "Fraud & Anomaly Check", description: claimResult ? `Fraud risk assessed as ${claimResult.fraud_level}.` : "Running Isolation Forest rules...", aiValidation: true }
    ];

    if (!claimResult) return base;

    if (claimResult.status === "Auto-Approved") {
      base.push({ title: "Claim Approved", description: `Policy terms met. Initiating instant payout of ₹${claimResult.estimated_payout}.`, aiValidation: false });
      base.push({ title: "Payout Successful", description: `Money transferred to UPI ID. Receipt: ${claimResult.claim_id}`, aiValidation: false });
    } else if (claimResult.status === "Under Review") {
      base.push({ title: "Manual Review Required", description: `Fraud risk flagged as ${claimResult.fraud_level}. Sent to Admin for review.`, aiValidation: false });
    } else {
      base.push({ title: "Claim Rejected", description: "Conditions did not meet payout thresholds.", aiValidation: false });
    }

    return base;
  };

  const STEPS = getSteps();
  const isComplete = claimResult && activeStep >= STEPS.length - 1;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full px-4 pt-28 pb-12">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-6 -ml-4 text-slate-500 hover:text-primary-900">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Button>

        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Claim Processing</h1>
                <p className="text-slate-500">Our AI is currently assessing the weather disruption in your zone.</p>
              </div>
              <Card>
                <CardContent className="p-8">
                  {error ? (
                    <div className="text-center py-6">
                      <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-900">System Error</h3>
                      <p className="text-sm text-slate-500 mt-2">{error}</p>
                    </div>
                  ) : (
                    <Timeline steps={STEPS} activeStepIndex={activeStep} />
                  )}
                  {claimResult && activeStep < STEPS.length - 1 && (
                     <div className="mt-8 pt-4 border-t border-slate-100">
                        <p className="text-xs font-mono text-slate-400">Processing ID: {claimResult.claim_id}</p>
                        <p className="text-xs text-slate-400 mt-1 italic">&quot;{claimResult.ai_reasoning}&quot;</p>
                     </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mt-8"
            >
              <Card className={`text-center overflow-hidden border-0 ${claimResult.status === 'Auto-Approved' ? 'bg-gradient-to-br from-white to-emerald-50' : (claimResult.status === 'Rejected' ? 'bg-gradient-to-br from-white to-red-50' : 'bg-gradient-to-br from-white to-orange-50')}`}>
                <CardContent className="p-10 flex flex-col items-center">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ delay: 0.2, type: 'spring' }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm ${claimResult.status === 'Auto-Approved' ? 'bg-emerald-100 text-emerald-600' : (claimResult.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600')}`}
                  >
                    {claimResult.status === "Auto-Approved" ? <CheckCircle2 className="w-10 h-10" /> : (claimResult.status === "Rejected" ? <XCircle className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10"/>)}
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold text-slate-900 mb-2"
                  >
                    {claimResult.status === "Auto-Approved" ? "Claim Successful" : (claimResult.status === "Rejected" ? "Claim Rejected" : "Manual Review Required")}
                  </motion.h2>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-slate-600 mb-8 max-w-sm space-y-3"
                  >
                    {claimResult.status === "Auto-Approved" ? (
                      <p>Your automated payout of <span className="font-bold text-emerald-600">₹{claimResult.estimated_payout}</span> has been transferred to your registered UPI.</p>
                    ) : (claimResult.status === "Under Review" ? (
                      <p>This claim requires manual review by an admin. You will be notified within 24 hours.</p>
                    ) : (
                      <p>Currently, the disruption does not qualify for a payout according to the parametric rules.</p>
                    ))}
                    <div className="bg-white/60 p-3 rounded-lg text-xs italic border border-slate-100 shadow-sm text-left">
                       <strong>AI Reasoning:</strong> {claimResult.ai_reasoning}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col w-full gap-3"
                  >
                    <Button onClick={() => navigate('/dashboard')} fullWidth>
                      Return to Dashboard
                    </Button>
                    {claimResult.status === "Auto-Approved" && (
                      <Button variant="outline" fullWidth>
                         <Download className="w-4 h-4 mr-2" /> Download Receipt
                      </Button>
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
