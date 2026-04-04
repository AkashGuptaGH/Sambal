import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, IndianRupee, MapPin, Calendar, CloudLightning, Wind, ThermometerSun, AlertTriangle, CheckCircle, Activity, Box, Sparkles } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack/Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Dashboard() {
  const { user } = useStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-primary-900 rounded-2xl animate-spin-slow mb-6 flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="text-slate-500 font-bold animate-pulse">Syncing Secure Session...</p>
      </div>
    );
  }
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);

  // Map user's city to coordinates for the zone map
  const CITY_COORDS = {
    "Mumbai": [19.0760, 72.8777], "Delhi": [28.6139, 77.2090],
    "Bangalore": [12.9716, 77.5946], "Bengaluru": [12.9716, 77.5946],
    "Chennai": [13.0827, 80.2707], "Hyderabad": [17.3850, 78.4867],
    "Kolkata": [22.5726, 88.3639], "Pune": [18.5204, 73.8567],
    "Ahmedabad": [23.0225, 72.5714], "Jaipur": [26.9124, 75.7873],
    "Gurugram": [28.4595, 77.0266], "Noida": [28.5355, 77.3910],
    "Demo: Storm Zone": [15.2993, 74.1240], // Goa coastline for demo
    "Other (Unsupported City)": [19.0760, 72.8777] // Fallback to Mumbai
  };
  const position = CITY_COORDS[user.city] || [19.0760, 72.8777]; // default Mumbai

  useEffect(() => {
    if (!user) return;

    // Fetch live weather
    const fetchWeather = async () => {
      const cityToFetch = (!user.city || user.city === 'Select City') ? 'Mumbai' : user.city;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/weather/${cityToFetch}`);
        if (res.ok) {
          const data = await res.json();
          setWeather(data);

          // Fetch forecast 
          const triggerRes = await fetch("http://127.0.0.1:8000/api/trigger/classify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              city: user.city,
              platform: user.platform,
              rain_mm: data.rain_mm || 0,
              heat_index_c: data.heat_index_c || 30,
              strike_severity: 0.1,
              hour_of_day: (new Date().getHours() + 24) % 24, // Tomorrow same time
              persona: user.persona,
              zone_match: true
            })
          });
          if (triggerRes.ok) {
            const tData = await triggerRes.json();
            setForecast(tData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch weather/forecast", err);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000); // 5 mins
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  // Next Monday calculation
  const getNextMonday = () => {
    const d = new Date();
    d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const daysUntilMonday = () => {
    const d = new Date();
    const nextMon = new Date(d);
    nextMon.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
    return Math.max(1, Math.ceil((nextMon - d) / (1000 * 60 * 60 * 24)));
  };

  const getTriggerStatus = () => {
    if (!weather) return { active: false, msg: "Checking conditions...", type: "none" };
    if (weather.rain_mm > 35) return { active: true, msg: "⚡ T1 TRIGGER ACTIVE — Claim may auto-initiate", type: "rain" };
    if (weather.heat_index_c > 44) return { active: true, msg: "🌡️ T2 TRIGGER ACTIVE", type: "heat" };
    return { active: false, msg: "✅ No active triggers currently", type: "safe" };
  };

  const status = getTriggerStatus();

  const getHeaderStyling = () => {
    if (status.type === 'rain') {
      return {
         wrapper: "bg-gradient-to-b from-slate-900 via-slate-800 to-[var(--bg)]",
         title: "text-white",
         subtitle: "text-slate-300"
      };
    }
    if (status.type === 'heat') {
      return {
         wrapper: "bg-gradient-to-b from-orange-600 via-amber-500 to-[var(--bg)]",
         title: "text-white",
         subtitle: "text-amber-100"
      };
    }
    return {
       wrapper: "bg-transparent",
       title: "text-slate-900",
       subtitle: "text-slate-500"
    };
  };

  const theme = getHeaderStyling();

  return (
    <Layout>
      <div className="flex-1 w-full relative">
        
        {/* Dynamic Weather Ambient Overlay */}
        <div className={`absolute top-0 left-0 right-0 h-[400px] z-0 transition-colors duration-1000 pointer-events-none ${theme.wrapper}`}>
             {status.type === 'rain' && (
               <div className="absolute inset-0 opacity-20 animate-pulse bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQwIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] bg-repeat" style={{ backgroundSize: '20px 40px' }} />
             )}
             {status.type === 'heat' && (
               <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/40 to-amber-300/40 opacity-50 blur-3xl animate-pulse" />
             )}
        </div>

        <div className="max-w-[1440px] px-4 sm:px-6 lg:px-12 mx-auto pt-28 pb-12 relative z-10">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className={`text-3xl font-bold tracking-tight transition-colors duration-500 ${theme.title}`}>Dashboard</h1>
                <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${status.active ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'}`}>
                  {status.active ? '🔴 ZONE AT RISK' : '🟡 ZONE SAFE'}
                </span>
              </div>
              <p className={`transition-colors duration-500 ${theme.subtitle}`}>Welcome back, {user?.name || 'Worker'} ({user?.platform || 'Delivery'} - {user?.city || 'Select City'})</p>
            </div>
            <Button 
               variant={status.type !== 'safe' ? 'secondary' : 'primary'}
               className={status.type !== 'safe' ? "bg-white text-slate-900 hover:bg-slate-100 shadow-xl" : ""} 
               onClick={() => navigate('/claims/form')}>
               File a Claim
            </Button>
          </div>

          {/* URGENT TRIGGER BANNER */}
          <AnimatePresence>
            {status.active && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-red-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-red-600/20 border border-red-500">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-xl animate-pulse">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-lg leading-none">DISRUPTION DETECTED IN YOUR ZONE</p>
                      <p className="text-red-100 text-xs mt-1 font-medium italic">Parametric model confirms {status.type === 'rain' ? 'Excessive Rainfall' : 'Extreme Heat'} threshold breached.</p>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="bg-white text-red-600 hover:bg-red-50 font-black px-6 border-0"
                    onClick={() => navigate('/claims/form')}
                  >
                    CONTINUE TO PAYOUT
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Active Coverage
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold">₹{user.coverageCap}</span>
                  <span className="text-xs text-slate-500">/ week</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">ACTIVE</span>
                  <span className="text-xs text-slate-500">Renews {getNextMonday()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-indigo-500" /> Earnings Protected
                </p>
                <h3 className="text-2xl font-bold mt-2">₹2,400</h3>
                <p className="text-xs text-slate-500 mt-1">Total since joining</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" /> Risk Zone
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-2xl font-bold">Zone {user.riskZone}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">1.20x</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Multiplier applied to premium</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> This Week
                </p>
                <h3 className="text-2xl font-bold mt-2">{daysUntilMonday()} Days</h3>
                <p className="text-xs text-slate-500 mt-1">Remaining until renewal</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Claim Eligibility Card (Appears during trigger) */}
            <AnimatePresence>
              {status.active && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-rose-100">
                        <div className="p-6 flex-1">
                          <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-4">Payout Eligibility</h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900">₹{Math.round((user?.dailyAvgEarning || 0) * 0.8)}</span>
                            <span className="text-sm font-bold text-slate-500 italic">Pre-approved</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-2 font-medium">As per your Standard Plan (80% of daily average)</p>
                        </div>
                        <div className="p-6 flex-1 bg-rose-50/30">
                          <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-4">Requirement</h3>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                              <ShieldCheck className="w-5 h-5 text-rose-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 leading-snug">Just verify your shift disruption to initiate instant transfer.</span>
                          </div>
                          <Button className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-lg shadow-rose-600/20" onClick={() => navigate('/claims/form')}>
                            Initialize Payout Flow
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Weather & Status */}
            <Card className="overflow-hidden">
              <div className={`h-1.5 w-full ${status.active ? (status.type === 'rain' ? 'bg-red-500' : 'bg-orange-500') : 'bg-emerald-500'}`} />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CloudLightning className="w-5 h-5 text-indigo-600" />
                      Live Network Conditions
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Real-time parameters for your active zone ({user?.zone || 'Detected Zone'})</p>
                  </div>
                  {weather && (
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${status.active ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {status.msg}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-2">Last updated: {weather.fetched_at?.split(' ')[1] || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-center p-2">
                    <CloudLightning className={`w-6 h-6 mx-auto mb-2 ${weather?.rain_mm > 35 ? 'text-red-500' : 'text-blue-500'}`} />
                    <span className="block text-xl font-bold">{weather?.rain_mm || 0}<span className="text-xs text-slate-500 font-normal ml-1">mm</span></span>
                    <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Rainfall</span>
                  </div>
                  <div className="text-center p-2 border-l border-slate-200">
                    <ThermometerSun className={`w-6 h-6 mx-auto mb-2 ${weather?.heat_index_c > 42 ? 'text-orange-500' : 'text-rose-400'}`} />
                    <span className="block text-xl font-bold">{weather?.heat_index_c || '--'}<span className="text-xs text-slate-500 font-normal ml-1">°C</span></span>
                    <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Heat Index</span>
                  </div>
                  <div className="text-center p-2 border-l border-slate-200">
                    <Wind className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                    <span className="block text-xl font-bold">{weather?.wind_kmh || '--'}<span className="text-xs text-slate-500 font-normal ml-1">km/h</span></span>
                    <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Wind Speed</span>
                  </div>
                  <div className="text-center p-2 border-l border-slate-200">
                    <Activity className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <span className="block text-xl font-bold">{weather?.aqi || 120}</span>
                    <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">AQI</span>
                  </div>
                </div>

                {/* Live Weather Radar (Next 3 Hours) */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <CloudLightning className="w-4 h-4 text-slate-400" /> Live Weather Radar
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {[1, 2, 3].map(h => {
                      const hour = (new Date().getHours() + h) % 24;
                      const timeStr = `${hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)} ${hour >= 12 ? 'PM' : 'AM'}`;
                      const isTrigger = weather?.rain_mm > 15 && h === 3; // mock a trigger in 3 hrs if rain is active
                      return (
                        <div key={h} className={`flex-1 rounded-xl p-3 text-center border ${isTrigger ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-slate-50/50 border-slate-100'}`}>
                          <span className="block text-xs font-bold text-slate-500 mb-2">{timeStr}</span>
                          {isTrigger ? <CloudLightning className="w-6 h-6 mx-auto mb-2 text-red-500" /> : <ThermometerSun className="w-6 h-6 mx-auto mb-2 text-amber-500" />}
                          <span className={`block font-bold ${isTrigger ? 'text-red-700' : 'text-slate-900'}`}>{weather?.rain_mm ? Math.round(weather.rain_mm + (h*8)) : 0}mm</span>
                        </div>
                      )
                    })}
                  </div>
                  {weather?.rain_mm > 0 && (
                    <p className="text-xs font-medium text-amber-700 mt-4 flex items-center gap-2 bg-amber-50/80 p-3 rounded-lg border border-amber-100">
                      <AlertTriangle className="w-4 h-4" /> Trigger likely soon based on radar trajectory — Stay protected!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Live Map */}
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Registered Coverage Zone</span>
                  <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">5km Radius</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[350px] w-full relative z-0">
                  <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Circle
                      center={position}
                      pathOptions={{ color: status.active ? '#ef4444' : '#10b981', fillColor: status.active ? '#ef4444' : '#10b981', fillOpacity: 0.2 }}
                      radius={5000}
                    />
                    <Marker position={position}>
                      <Popup>
                        Your registered hub: Velachery, Chennai
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </CardContent>
            </Card>

            {/* Claims History */}
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent Claims</CardTitle>
                <Button variant="ghost" className="text-xs" onClick={() => navigate('/claims')}>View All</Button>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Trigger Event</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {user?.recentClaims && user.recentClaims.length > 0 ? (
                      user.recentClaims.map((claim, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">{claim.date}</td>
                          <td className="px-6 py-4 font-medium">{claim.event}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">₹{claim.amount}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              claim.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {claim.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                          No recent claims found. You are fully protected!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Policy Details */}
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                  <Box className="w-4 h-4 text-primary-600" /> Policy Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500">Policy ID</span>
                  <span className="font-mono font-medium text-slate-900">SMBL-2026-0001</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500">Plan</span>
                  <span className="font-medium text-slate-900">Standard</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500">Weekly Premium</span>
                  <span className="font-bold text-slate-900">₹{user?.weeklyPremium || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500">Payout Rate</span>
                  <span className="font-medium text-slate-900">80% of daily avg (₹{user?.dailyAvgEarning || 0})</span>
                </div>
                <div className="pb-3 border-b border-slate-100">
                  <span className="text-slate-500 block mb-2">Triggers Covered</span>
                  <div className="flex flex-wrap gap-1">
                    {["T1", "T2", "T3", "T4", "T5", "T6"].map(t => (
                      <span key={t} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Renewal</span>
                  <span className="text-slate-900 text-xs font-medium bg-slate-100 px-2 py-1 rounded flex items-center"><CheckCircle className="w-3 h-3 text-emerald-500 mr-1" /> Auto-Debit (UPI)</span>
                </div>
                <Button className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white" onClick={() => navigate('/policy')}>
                  Manage Policy
                </Button>
              </CardContent>
            </Card>

            {/* Earnings Impact (ROI) */}
            <Card className="bg-slate-900 text-white overflow-hidden relative shadow-xl border-slate-800">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <IndianRupee className="w-32 h-32" />
              </div>
              <CardContent className="p-6 relative z-10">
                <h3 className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest uppercase flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Earnings Impact
                </h3>
                <div className="flex justify-between items-end border-b border-slate-700/50 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Without SAMBAL</p>
                    <p className="text-xl font-bold text-rose-400 line-through opacity-80">-₹{Math.round((user?.totalPayouts || 0) * 1.5)}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Lost to disruptions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-400 font-medium mb-1 flex items-center justify-end gap-1"><ShieldCheck className="w-3 h-3" /> With SAMBAL</p>
                    <p className="text-4xl font-extrabold text-white">+₹{user?.totalPayouts || 0}</p>
                    <p className="text-[10px] text-emerald-500 font-bold mt-1 tracking-wide">NET PROTECTED</p>
                  </div>
                </div>
                
                {/* Visual Earnings Trend Bar */}
                <div className="mb-6">
                  <div className="flex items-end gap-1 h-12">
                    {(user?.earningsHistory || []).map((d, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-t-sm transition-all duration-1000 ${d.rain ? 'bg-rose-400' : 'bg-emerald-400/40'}`} 
                        style={{ height: `${(d.earning / 1200) * 100}%` }}
                        title={`${d.day}: ₹${d.earning}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 px-0.5">
                    {['M','T','W','T','F','S','S'].map(d => <span key={d} className="text-[8px] text-slate-600 font-bold">{d}</span>)}
                  </div>
                </div>

                <div className="bg-slate-800/80 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300 leading-relaxed">You're in the <strong className="text-white">top 15%</strong> of protected earners in {user?.city || 'India'}.</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Disruption Forecast */}
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent-500" /> AI Forecast</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tomorrow</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {forecast ? (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Disruption Risk</span>
                        <span className={`text-sm font-bold ${forecast.confidence_score > 0.6 ? 'text-red-500' : (forecast.confidence_score > 0.3 ? 'text-orange-500' : 'text-emerald-500')}`}>
                          {forecast.confidence_score > 0.6 ? 'HIGH' : (forecast.confidence_score > 0.3 ? 'MEDIUM' : 'LOW')}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${forecast.confidence_score > 0.6 ? 'bg-red-500' : (forecast.confidence_score > 0.3 ? 'bg-orange-500' : 'bg-emerald-500')}`}
                          style={{ width: `${forecast.confidence_score * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2 text-right">Confidence: {(forecast.confidence_score * 100).toFixed(1)}%</p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-4">
                      <p className="text-xs text-slate-500 mb-1">Estimated payout if triggered</p>
                      <p className="text-xl font-bold text-slate-900">₹{forecast.estimated_payout_inr || 0}</p>
                    </div>

                    <p className="text-xs text-slate-600 italic bg-accent-50 text-accent-900 px-3 py-2 rounded-md">
                      &quot;{forecast.ai_reasoning}&quot;
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-6 animate-pulse">Running SAMBAL predictive models...</p>
                )}
              </CardContent>
            </Card>

            {/* Assistance */}
            <Card className="bg-primary-900 text-white border-0 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-24 h-24" />
              </div>
              <CardContent className="p-6 relative z-10">
                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                <p className="text-sm text-primary-200 mb-4">Our support team is available 24/7 for active claim assistance.</p>
                <Button variant="secondary" className="w-full bg-white text-primary-900 hover:bg-slate-50 border-0">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
}
