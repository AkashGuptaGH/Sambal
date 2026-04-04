import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import Home from './pages/Home'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Claims from './pages/Claims'
import Admin from './pages/Admin'
import SambalAI from './pages/SambalAI'
import Plans from './pages/Plans'
import HowItWorks from './pages/HowItWorks'
import PremiumBreakdown from './pages/PremiumBreakdown'
import Policy from './pages/Policy'

import { ProtectedRoute } from './components/layout/ProtectedRoute';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/claims/form" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
        <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute reqRole="admin"><Admin /></ProtectedRoute>} />
        <Route path="/sambal-ai" element={<SambalAI />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/premium-breakdown" element={<ProtectedRoute><PremiumBreakdown /></ProtectedRoute>} />
        <Route path="/policy" element={<ProtectedRoute><Policy /></ProtectedRoute>} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  )
}

export default App
