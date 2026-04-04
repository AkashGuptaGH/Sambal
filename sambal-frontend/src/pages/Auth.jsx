import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { setUser, setRole } = useStore();

  const handleDemoAdmin = async () => {
    setEmail('admin@sambal.ai');
    setPassword('admin123');
    await processAuth('admin@sambal.ai', 'admin123', true);
  };

  const handleDemoWorker = async () => {
    setEmail('karthik@example.com');
    setPassword('worker123');
    await processAuth('karthik@example.com', 'worker123', true);
  };

  const processAuth = async (authEmail, authPassword, isLoginFlow) => {
    setIsLoading(true);
    setError('');
    
    try {
      const endpoint = isLoginFlow ? "/api/auth/login" : "/api/auth/register";
      const bodyPayload = isLoginFlow 
          ? { email: authEmail, password: authPassword }
          : { name: name || authEmail.split('@')[0], email: authEmail, password: authPassword };

      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Authentication failed");
      }
      
      const userData = await response.json();
      const isAdmin = authEmail.startsWith('admin');
      
      setUser(userData);
      setRole(isAdmin ? 'admin' : 'user');
      
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate(isLoginFlow ? '/dashboard' : '/onboarding');
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    await processAuth(email, password, isLogin);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-900 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SAMBAL</h1>
          <p className="text-slate-500 font-medium">Income protection for continuous earners</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
        >
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
             <button 
                type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isLogin ? 'bg-white shadow text-primary-900' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Login
             </button>
             <button 
                type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isLogin ? 'bg-white shadow text-primary-900' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Sign Up
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                    placeholder="Enter full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-sm font-medium text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')} 
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
               <button 
                type="button" 
                onClick={handleDemoWorker}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-3 rounded-lg border border-slate-200"
               >
                 Demo: Worker
               </button>
               <button 
                type="button" 
                onClick={handleDemoAdmin}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-3 rounded-lg border border-slate-200"
               >
                 Demo: Admin
               </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
