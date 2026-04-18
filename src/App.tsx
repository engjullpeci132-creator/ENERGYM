/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Flame, 
  MapPin, 
  Phone, 
  Instagram, 
  Star, 
  Menu, 
  X, 
  ChevronRight, 
  Users, 
  Timer, 
  Trophy,
  Activity,
  Zap,
  CheckCircle2,
  LogOut,
  User as UserIcon,
  Bell,
  Clock,
  TrendingUp
} from 'lucide-react';
import { auth, signInWithGoogle, logout, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { CreditCard, ShieldCheck, ArrowLeft, Loader2, Landmark, Shield } from 'lucide-react';

// Image Imports - Standard Vite bundling for reliable production assets
import heroImg from './assets/images/hero.jpg';
import weightsImg from './assets/images/weights.jpg';
import cardioImg from './assets/images/cardio.jpg';
import poolImg from './assets/images/pool.jpg';
import yogaImg from './assets/images/yoga.jpg';
import gymFloorImg from './assets/images/gym-floor.jpg';

const AdminPanel = React.lazy(() => import('./components/AdminPanel'));

const CLASSES = [
  { id: 1, name: 'HIIT', icon: <Flame className="w-6 h-6" />, desc: 'High-intensity interval training to torch calories.' },
  { id: 2, name: 'Strength', icon: <Dumbbell className="w-6 h-6" />, desc: 'Build lean muscle with expert guidance.' },
  { id: 3, name: 'Yoga', icon: <Activity className="w-6 h-6" />, desc: 'Improve flexibility and mental clarity.' },
  { id: 4, name: 'Boxing', icon: <Zap className="w-6 h-6" />, desc: 'Unleash your power with explosive movements.' },
];

const PRICING = [
  { id: 'basic', name: 'Basic', price: '29', features: ['Gym Access', 'Locker Room', '1 Class/Month'] },
  { id: 'pro', name: 'Pro', price: '49', features: ['Unlimited Access', 'All Classes', 'Personalized App', '1 Sauna/Week'], popular: true },
  { id: 'elite', name: 'Elite', price: '89', features: ['24/7 Access', 'Unlimited Sauna', '3 PT Sessions', 'Nutritional Plan'] },
];

const TRAINERS = [
  { name: 'Sarah Krasniqi', role: 'Strength & Conditioning', img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Arben Gashi', role: 'HIIT Expert', img: 'https://images.unsplash.com/photo-1567013127542-490d757e51fe?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Elena Hoxha', role: 'Yoga & Mobility', img: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&q=80&w=400&h=500' },
];

const TESTIMONIALS = [
  { text: "ENERGYM changed my life. The vibe is unmatched and the equipment is top-tier.", author: "Lekë P.", role: "Member for 2 years" },
  { text: "Best gym in Prishtina, hands down. 4.8 stars well deserved!", author: "Drita K.", role: "Pro Athlete" },
];

// ENERGYM | High Performance Fitness
// Updated: 2026-04-18
export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [notifExpanded, setNotifExpanded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [gymImages] = useState<Record<string, string>>({
    hero: heroImg,
    about1: weightsImg,
    about2: cardioImg,
    pt: gymFloorImg,
    gal1: poolImg,
    gal2: gymFloorImg,
    gal3: cardioImg,
    trainer1: gymFloorImg,
    trainer2: weightsImg,
    trainer3: yogaImg
  });
  
  const [isRefreshingImages, setIsRefreshingImages] = useState(false);

  // Popular Times Simulation Data
  const popularTimes = [
    { hour: '6am', level: 30 }, { hour: '8am', level: 85 }, { hour: '10am', level: 60 },
    { hour: '12pm', level: 45 }, { hour: '2pm', level: 50 }, { hour: '4pm', level: 75 },
    { hour: '6pm', level: 100 }, { hour: '8pm', level: 90 }, { hour: '10pm', level: 40 },
    { hour: '12am', level: 10 }
  ];

  const CONSULTATION_PLANS = [
    { id: 'trial', name: 'Intro Session', price: '0', features: ['30 Min Assessment', 'Goal Setting', 'Gym Tour'] },
    { id: 'single', name: 'Power Hour', price: '35', features: ['60 Min PT Session', 'Technique Fix', 'Workout Plan'] },
    { id: 'bundle', name: 'Momentum', price: '150', features: ['5 PT Sessions', 'Nutritional Basics', 'Progress Tracking'] },
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docSnap = await getDoc(doc(db, 'users', u.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsub();
  }, []);

  // Prevent background scrolling when overlays are open
  useEffect(() => {
    const isOverlayOpen = showProfile || !!selectedPlan || showConsultation || showAdmin || isMenuOpen || notifExpanded;
    if (isOverlayOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showProfile, selectedPlan, showConsultation, showAdmin, isMenuOpen, notifExpanded]);

  // Local image paths are now static
  useEffect(() => {
    // We keep this empty or remove it because images are now statically defined in state init
  }, []);

  const getDaysRemaining = (expiryStr: string) => {
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isConsultation = CONSULTATION_PLANS.some(p => p.id === selectedPlan.id);
      const userRef = doc(db, 'users', user.uid);
      
      const updateData: any = {};
      if (isConsultation) {
        const consultExpiry = new Date();
        consultExpiry.setDate(consultExpiry.getDate() + 30); // Valid for 30 days
        updateData.consultationPlan = selectedPlan.id;
        updateData.consultationExpiryDate = consultExpiry.toISOString();
      } else {
        const newExpiry = new Date();
        newExpiry.setMonth(newExpiry.getMonth() + 1);
        updateData.plan = selectedPlan.id;
        updateData.expiryDate = newExpiry.toISOString();
        updateData.notified = false;
      }
      
      await updateDoc(userRef, updateData);
      
      setUserData({ ...userData, ...updateData });
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedPlan(null);
      }, 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen selection:bg-neon-cyan selection:text-gym-black font-sans bg-gym-black overflow-hidden text-white">
      {/* Checkout Modal */}
      <AnimatePresence>
        {showProfile && user && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-gym-black/95 backdrop-blur-2xl flex flex-col p-4 md:p-8 overflow-y-auto"
          >
            <div className="max-w-4xl w-full mx-auto my-auto">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-display font-bold italic">MY <span className="text-neon-cyan">PROFILE.</span></h2>
                <button onClick={() => setShowProfile(false)} className="p-4 glass rounded-full hover:text-neon-cyan transition-colors">
                  <X />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="md:col-span-1 glass p-8 rounded-[2.5rem] border border-white/10 text-center">
                  <div className="w-24 h-24 bg-neon-cyan/20 rounded-3xl mx-auto flex items-center justify-center text-neon-cyan mb-6">
                    <UserIcon className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{user.displayName || 'Gym Member'}</h3>
                  <p className="text-sm opacity-50 mb-8">{user.email}</p>
                  <button 
                    onClick={() => {
                       logout();
                       setShowProfile(false);
                    }}
                    className="flex items-center gap-2 px-6 py-2 glass rounded-full text-xs font-bold mx-auto hover:text-neon-cyan transition-colors mb-4"
                  >
                    <LogOut className="w-4 h-4" /> SIGN OUT
                  </button>

                  {user.email === 'lecipeci207@gmail.com' && (
                    <button 
                      onClick={() => {
                        setShowAdmin(true);
                        setShowProfile(false);
                      }}
                      className="flex items-center gap-2 px-6 py-2 bg-neon-cyan text-gym-black rounded-full text-xs font-bold mx-auto hover:bg-white transition-colors"
                    >
                      <Shield className="w-4 h-4" /> ADMIN DASHBOARD
                    </button>
                  )}
                </div>

                {/* Plan Info Card */}
                <div className="md:col-span-2 space-y-8">
                  <div className="glass p-8 rounded-[2.5rem] border border-neon-cyan/20 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp className="w-32 h-32" />
                     </div>
                     
                     <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-neon-cyan mb-6">Active Plan</h4>
                     
                     {userData?.plan ? (
                       <div className="space-y-8">
                          <div className="flex justify-between items-end">
                             <h3 className="text-5xl font-display font-bold uppercase italic">{userData.plan}</h3>
                             <div className="text-right">
                                <span className="block text-sm opacity-50">Member Since</span>
                                <span className="font-bold">2024</span>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-neon-cyan/30 transition-colors group">
                                <span className="block text-[10px] uppercase opacity-50 mb-2 font-bold tracking-widest group-hover:text-neon-cyan group-hover:opacity-100 transition-all">Expires On</span>
                                <span className="text-xl font-bold font-mono text-white/90">
                                  {userData.expiryDate ? new Date(userData.expiryDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  }).toUpperCase() : 'N/A'}
                                </span>
                             </div>
                             <div className="p-6 bg-white/5 rounded-3xl border border-neon-cyan/20 relative">
                                <span className="block text-[10px] uppercase text-neon-cyan mb-2 font-bold tracking-widest">Time Remaining</span>
                                <span className="text-xl font-bold">
                                  {userData.expiryDate ? `${getDaysRemaining(userData.expiryDate)} Days` : 'Lifetime'}
                                </span>
                                <motion.div 
                                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute top-4 right-4 w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_10px_#00E5FF]"
                                />
                             </div>
                          </div>

                          <div className="p-6 glass rounded-3xl border border-white/10">
                             <h5 className="font-bold mb-4 text-sm uppercase tracking-widest">Plan Highlights</h5>
                             <div className="grid grid-cols-2 gap-2 mb-6">
                                {['Full Access', 'All Classes', 'Smart Metrics', '24/7 Support'].map(h => (
                                   <div key={h} className="flex items-center gap-2 text-xs opacity-60">
                                      <div className="w-1 h-1 rounded-full bg-neon-cyan" />
                                      {h}
                                   </div>
                                ))}
                             </div>
                             <button 
                               onClick={() => {
                                 const planToRenew = PRICING.find(p => p.name === userData.plan);
                                 if (planToRenew) {
                                   setSelectedPlan(planToRenew);
                                   setShowProfile(false);
                                 } else {
                                   // Fallback if plan name doesn't match perfectly
                                   scrollTo('pricing');
                                   setShowProfile(false);
                                 }
                               }}
                               className="w-full py-4 bg-neon-cyan text-gym-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                             >
                               <TrendingUp className="w-4 h-4" /> RENEW MEMBERSHIP
                             </button>
                          </div>
                       </div>
                     ) : (
                       <div className="py-12 text-center">
                          <p className="opacity-50 mb-6 italic">No active membership found.</p>
                          <button 
                            onClick={() => {
                              scrollTo('pricing');
                              setShowProfile(false);
                            }}
                            className="px-8 py-3 bg-neon-cyan text-gym-black font-bold rounded-xl"
                          >
                            EXPLORE PLANS
                          </button>
                       </div>
                     )}
                  </div>

                  {/* Consultation Component */}
                  <div className="glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                    <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-neon-cyan mb-6">Hired Consultations</h4>
                    
                    {userData?.consultationPlan ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-display font-bold uppercase italic">
                            {CONSULTATION_PLANS.find(p => p.id === userData.consultationPlan)?.name || 'Consultation Plan'}
                          </h3>
                          <p className="text-[10px] font-mono opacity-60 mt-2 uppercase tracking-widest text-neon-cyan">
                            {userData.consultationExpiryDate ? `EXPIRES: ${new Date(userData.consultationExpiryDate).toLocaleDateString('en-US', {
                               month: 'short',
                               day: 'numeric',
                               year: 'numeric'
                            })}` : 'Currently Scheduled / Active'}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                            <span className="block text-[10px] uppercase opacity-50 mb-1">Status</span>
                            <span className="text-xs font-bold text-neon-cyan">CONFIRMED</span>
                          </div>
                          <button 
                            onClick={() => setShowConsultation(true)}
                            className="px-6 py-4 glass border border-neon-cyan/30 rounded-2xl text-xs font-bold hover:bg-neon-cyan hover:text-gym-black transition-all uppercase tracking-widest"
                          >
                            Upgrade
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between opacity-60">
                         <p className="text-sm italic">You haven't hired a personal consultation yet.</p>
                         <button 
                           onClick={() => {
                             setShowConsultation(true);
                             setShowProfile(false);
                           }}
                           className="text-xs font-bold text-neon-cyan underline underline-offset-4"
                         >
                           BROWSE CONSULTATIONS
                         </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConsultation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-gym-black/90 backdrop-blur-xl flex flex-col p-4 md:p-8 overflow-y-auto"
          >
            <div className="max-w-5xl w-full mx-auto my-auto">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-display font-bold italic">CONSULTATION <span className="text-neon-cyan">PLANS.</span></h2>
                <button onClick={() => setShowConsultation(false)} className="p-4 glass rounded-full hover:text-neon-cyan transition-colors">
                  <X />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {CONSULTATION_PLANS.map((plan) => (
                  <motion.div 
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 glass rounded-[2.5rem] border border-white/10 flex flex-col group hover:border-neon-cyan/50 transition-colors"
                  >
                    <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">€{plan.price}</span>
                      {plan.price !== '0' && <span className="text-xs opacity-50 ml-1">ONE TIME</span>}
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm opacity-60">
                          <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowConsultation(false);
                      }}
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-neon-cyan group-hover:text-gym-black font-bold transition-all uppercase tracking-widest text-sm"
                    >
                      SELECT PLAN
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gym-black flex flex-col p-4 md:p-8 overflow-y-auto"
          >
            <div className="max-w-4xl w-full mx-auto my-auto grid grid-cols-1 md:grid-cols-2 glass p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden">
              <div className="absolute top-0 left-0 p-8">
                 <button onClick={() => setSelectedPlan(null)} className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-all">
                    <ArrowLeft className="w-4 h-4" /> BACK
                 </button>
              </div>

              {/* Order Info */}
              <div className="pt-12 md:pt-0">
                <h2 className="text-4xl font-display font-bold mb-8 italic">CHECKOUT.</h2>
                <div className="border border-white/10 rounded-3xl p-8 mb-8">
                  <span className="text-[10px] uppercase tracking-widest font-black text-neon-cyan mb-2 block">Selected Plan</span>
                  <div className="flex justify-between items-end">
                    <h4 className="text-3xl font-display font-bold uppercase">{selectedPlan.name}</h4>
                    <div className="text-right">
                       <span className="block text-2xl font-bold">€{selectedPlan.price}</span>
                       <span className="text-[10px] opacity-50">/MONTH</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-4">
                   {selectedPlan.features.map((f: string) => (
                      <li key={f} className="flex items-center gap-3 text-sm opacity-60">
                        <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
                        {f}
                      </li>
                   ))}
                </ul>
              </div>

              {/* Payment Section */}
              <div className="md:pl-12 md:border-l border-white/10 mt-12 md:mt-0">
                {paymentSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-20 h-20 bg-neon-cyan/20 rounded-full flex items-center justify-center text-neon-cyan mb-6">
                      <ShieldCheck className="w-12 h-12" />
                    </div>
                    <h3 className="text-3xl font-display font-bold mb-4">PAYMENT SUCCESSFUL!</h3>
                    <p className="opacity-60">Welcome to the {selectedPlan.name} lifestyle.</p>
                  </motion.div>
                ) : (
                  <>
                    <h4 className="text-xl font-bold mb-8">PAYMENT METHOD</h4>
                    <div className="space-y-4 mb-8">
                      <div className="p-4 rounded-2xl border-2 border-neon-cyan bg-neon-cyan/5 flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-4">
                          <CreditCard className="text-neon-cyan" />
                          <span className="font-bold">CREDIT CARD</span>
                        </div>
                        <div className="w-5 h-5 rounded-full border-4 border-neon-cyan" />
                      </div>
                      <div className="p-4 rounded-2xl border border-white/10 glass flex items-center justify-between opacity-40 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                          <Landmark />
                          <span className="font-bold">BANK TRANSFER</span>
                        </div>
                        <div className="w-5 h-5 rounded-full border border-white/20" />
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                       <input type="text" placeholder="Card Number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon-cyan transition-all" defaultValue="**** **** **** 4415" />
                       <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="MM/YY" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon-cyan transition-all" defaultValue="12/26" />
                          <input type="text" placeholder="CVC" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon-cyan transition-all" defaultValue="999" />
                       </div>
                    </div>

                    <button 
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full py-4 bg-neon-cyan text-gym-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl shadow-neon-cyan/20"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" /> : <>SECURE CHECKOUT <ShieldCheck className="w-5 h-5" /></>}
                    </button>
                    <p className="text-[10px] text-center opacity-30 mt-6 uppercase tracking-[0.2em]">encrypted • secure • instant</p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      {/* Admin Panel */}
      <AnimatePresence>
        {showAdmin && (
          <React.Suspense fallback={<div className="fixed inset-0 z-[200] bg-gym-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-neon-cyan" /></div>}>
            <AdminPanel onClose={() => setShowAdmin(false)} />
          </React.Suspense>
        )}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 right-0 z-50 glass transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="text-2xl font-display font-bold tracking-tighter cursor-pointer"
            onClick={() => scrollTo('hero')}
          >
            ENERG<span className="text-neon-cyan">YM.</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['About', 'Classes', 'Pricing', 'Trainers', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="text-sm font-medium opacity-70 hover:opacity-100 hover:text-neon-cyan transition-all"
              >
                {item}
              </button>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 glass rounded-full ring-1 ring-white/10 hover:ring-neon-cyan/50 transition-all cursor-pointer group"
                >
                  <UserIcon className="w-4 h-4 text-neon-cyan group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase truncate max-w-[100px]">{user.displayName?.split(' ')[0]}</span>
                </div>
                <button onClick={logout} className="p-2 hover:text-neon-cyan transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="px-6 py-2 bg-neon-cyan text-gym-black font-bold rounded-full text-sm hover:scale-105 transition-transform"
              >
                SIGN IN
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-gym-black/95 backdrop-blur-xl pt-24 px-6 md:hidden overflow-y-auto"
          >
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
               <Zap className="w-[150%] h-[150%] absolute -top-1/4 -right-1/4 text-neon-cyan rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col gap-6 text-3xl font-display font-bold">
                {user && (
                  <button 
                    onClick={() => {
                      setShowProfile(true);
                      setIsMenuOpen(false);
                    }}
                    className="text-left py-2 border-b border-white/10 text-neon-cyan flex items-center justify-between"
                  >
                    MY PROFILE <UserIcon className="w-6 h-6" />
                  </button>
                )}
                {['About', 'Classes', 'Pricing', 'Trainers', 'Contact'].map((item) => (
                <button 
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase())}
                  className="text-left py-2 border-b border-white/10"
                >
                  {item}
                </button>
              ))}
              <button 
                onClick={() => scrollTo('pricing')}
                className="w-full py-4 mt-4 bg-neon-cyan text-gym-black rounded-2xl"
              >
                START JOURNEY
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expiry Notification */}
      <AnimatePresence>
        {userData?.expiryDate && getDaysRemaining(userData.expiryDate) <= 7 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full"
          >
            <div className="glass border-neon-cyan/50 p-6 rounded-3xl shadow-2xl shadow-neon-cyan/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-neon-cyan/20 rounded-2xl text-neon-cyan">
                  <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">PLAN EXPIRING SOON</h4>
                  <p className="text-sm opacity-70">
                    Your {userData.plan} plan is about to expire in {getDaysRemaining(userData.expiryDate)} days.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => scrollTo('pricing')}
                className="w-full py-3 bg-neon-cyan text-gym-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
              >
                RENEW NOW
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-[100svh] flex items-center px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={gymImages.hero || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1920&h=1080"} 
            className="w-full h-full object-cover opacity-70 transition-opacity duration-1000"
            alt="Gym atmosphere"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gym-black/80 via-gym-black/20 to-gym-black" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center pt-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 w-fit mx-auto lg:mx-0">
              <Star className="w-4 h-4 text-neon-cyan fill-neon-cyan" />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Rated 4.8 by our community</span>
            </div>
            <h1 className="text-4xl xs:text-5xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.9] tracking-tighter mb-8 transition-all">
              UNLOCK YOUR <br />
              <span className="text-stroke">PEAK</span> <br />
              <span className="text-neon-cyan underline decoration-white/20 underline-offset-8">PERFORMANCE.</span>
            </h1>
            <p className="text-sm md:text-xl opacity-70 mb-10 max-w-md mx-auto lg:mx-0">
              High-energy space designed for those who demand excellence. 
              Prishtina's premier destination for fitness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => scrollTo('pricing')}
                className="group px-8 py-4 bg-neon-cyan text-gym-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white active:scale-95 transition-all shadow-xl shadow-neon-cyan/20 text-sm md:text-base"
              >
                START YOUR JOURNEY
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => scrollTo('about')}
                className="px-8 py-4 glass text-white font-bold rounded-2xl hover:bg-white/10 active:scale-95 transition-all text-sm md:text-base"
              >
                EXPLORE SPACE
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:flex justify-end perspective-1000"
          >
            <motion.div 
              animate={{ 
                rotateY: [0, 360],
                rotateX: [0, 10, 0, -10, 0],
              }}
              transition={{ 
                rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
                rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut" }
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-80 h-80 flex items-center justify-center"
            >
              {/* 3D Geometric Illusion */}
              <div className="absolute inset-0 border-4 border-neon-cyan/20 rounded-3xl" style={{ transform: 'translateZ(-50px)' }} />
              <div className="absolute inset-0 border-4 border-neon-cyan rounded-3xl" style={{ transform: 'translateZ(50px)' }} />
              <div className="flex flex-col items-center justify-center gap-4 bg-gym-black p-10 rounded-3xl border border-neon-cyan shadow-2xl shadow-neon-cyan/50">
                <Dumbbell className="w-24 h-24 text-neon-cyan" />
                <div className="text-center">
                  <span className="block text-4xl font-display font-bold">4.8</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-neon-cyan fill-neon-cyan" />)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Popular Times Section - Unique UI */}
      <section className="py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="glass p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-neon-cyan/20 relative overflow-hidden bg-gym-black/40">
            {/* Scanning Animation Lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <motion.div 
                animate={{ y: ['-10%', '110%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-full h-[2px] bg-neon-cyan shadow-[0_0_15px_#00E5FF,0_0_30px_#00E5FF]"
              />
              <motion.div 
                animate={{ y: ['110%', '-10%'] }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="w-full h-[1px] bg-neon-purple shadow-[0_0_10px_#A020F0,0_0_20px_#A020F0]"
              />
              {/* Vertical Data Flow Lines */}
              <div className="absolute inset-0 flex justify-around opacity-30">
                {[...Array(20)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: ['0%', '100%', '0%'], opacity: [0, 1, 0] }}
                    transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                    className="w-[1px] bg-white/10"
                  />
                ))}
              </div>
            </div>

            <div className="absolute -top-10 -right-10 opacity-5">
              <Clock className="w-96 h-96" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6 md:mb-8 text-neon-cyan">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.4em]">Live Activity</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 md:mb-8 italic">GYM PEAK <span className="text-neon-cyan">TRAFFIC.</span></h2>
                <p className="text-base md:text-lg opacity-70 mb-8 md:mb-12">
                  Plan your workout around the crowd. Our real-time data shows you the best times to hit your PR without the wait.
                </p>
                <div className="flex flex-wrap gap-8 md:gap-12 items-center relative">
                  <div className="relative">
                    <span className="block text-3xl md:text-4xl font-display font-bold text-neon-cyan relative z-10">68%</span>
                    <span className="text-[10px] md:text-xs opacity-50 uppercase tracking-widest font-bold">Currently Full</span>
                    {/* Heartbeat pulse line */}
                    <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-neon-cyan/20 overflow-hidden">
                      <motion.div 
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-1/3 h-full bg-neon-cyan shadow-[0_0_10px_#00E5FF]"
                      />
                    </div>
                  </div>
                  <div className="hidden xs:block h-12 w-px bg-white/10" />
                  <div>
                    <span className="block text-3xl md:text-4xl font-display font-bold text-white">4:00 AM</span>
                    <span className="text-[10px] md:text-xs opacity-50 uppercase tracking-widest font-bold">Best time to visit</span>
                  </div>
                </div>
              </div>

              <div className="relative group/chart">
                <div className="relative h-64 flex items-end gap-2 md:gap-3 px-2 md:px-4 overflow-x-auto pb-8 md:pb-4 custom-scrollbar snap-x">
                  {popularTimes.map((t, i) => (
                    <div key={t.hour} className="flex-1 min-w-[32px] md:min-w-[48px] flex flex-col items-center group/bar cursor-help snap-center">
                      <div className="relative w-full h-full flex items-end">
                        <motion.div 
                          initial={{ height: 0 }}
                          whileInView={{ height: `${t.level}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.03, duration: 1, ease: "easeOut" }}
                          className={`w-full rounded-t-lg transition-all duration-500 relative overflow-hidden group-hover/bar:brightness-125 ${
                            t.level > 85 ? 'bg-gradient-to-t from-neon-purple/80 to-neon-purple shadow-[0_0_20px_rgba(160,32,240,0.4)]' : 
                            t.level > 60 ? 'bg-gradient-to-t from-neon-cyan/60 to-neon-cyan' :
                            'bg-white/10 group-hover/bar:bg-white/20'
                          }`}
                        >
                          {/* Inner Scan Line for Active bars */}
                          {t.level > 60 && (
                            <motion.div 
                              animate={{ y: ['0%', '100%'], opacity: [0, 0.5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                              className="absolute inset-0 w-full h-1/2 bg-white/20 blur-sm pointer-events-none"
                            />
                          )}
                        </motion.div>
                        
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20">
                          <div className="bg-white text-gym-black text-[10px] font-bold px-2 py-1 rounded shadow-lg ring-1 ring-white/20">
                            {t.level}% Full
                          </div>
                        </div>
                      </div>
                      <span className={`text-[9px] md:text-[10px] uppercase font-bold tracking-tighter mt-4 transition-all duration-300 ${t.level > 80 ? 'text-neon-purple' : 'opacity-40 group-hover/bar:opacity-100 group-hover/bar:text-neon-cyan'}`}>
                        {t.hour}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Horizontal Indicators */}
                <div className="absolute left-0 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none opacity-5">
                  <div className="w-full h-px bg-white" />
                  <div className="w-full h-px bg-white" />
                  <div className="w-full h-px bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto lg:rounded-[3rem] glass p-8 md:p-12 lg:p-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 hidden sm:block">
            <Zap className="w-48 h-48 md:w-64 md:h-64 text-neon-cyan" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-neon-cyan mb-4">Our DNA</h2>
              <h3 className="text-3xl md:text-5xl font-display font-bold mb-6 md:mb-8 leading-tight">
                Not just a gym. <br className="hidden md:block" />
                A high-energy <br className="hidden md:block" />
                <span className="text-white">community.</span>
              </h3>
              <p className="text-base md:text-lg opacity-70 mb-8 leading-relaxed">
                ENERGYM was born from a simple vision: to create a workspace for the body that matched the intensity of the human spirit. 
                We've combined world-class equipment with a welcoming, high-vibe atmosphere that pushes you to your limits and beyond.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <span className="block text-2xl md:text-3xl font-display font-bold text-neon-cyan">06:00 - 00:00</span>
                  <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-50">Daily Hours</span>
                </div>
                <div>
                  <span className="block text-2xl md:text-3xl font-display font-bold text-neon-cyan">500+</span>
                  <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-50">Active Members</span>
                </div>
              </div>
            </motion.div>
            
              <div className="grid grid-cols-2 gap-3 md:gap-4 h-full">
                <img src={gymImages.about1 || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400&h=500"} className="rounded-2xl md:rounded-3xl w-full aspect-[3/4] object-cover opacity-90 transition-opacity duration-1000 shadow-2xl" alt="Gym detail" referrerPolicy="no-referrer" />
                <img src={gymImages.about2 || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400&h=500"} className="rounded-2xl md:rounded-3xl w-full aspect-[3/4] object-cover mt-6 md:mt-8 opacity-90 transition-opacity duration-1000 shadow-2xl" alt="Person working out" referrerPolicy="no-referrer" />
              </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="classes" className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl xs:text-5xl md:text-7xl font-display font-bold mb-6 italic underline decoration-neon-cyan/20">CLASSES & TRAINING</h2>
            <p className="max-w-xl mx-auto opacity-70 text-sm md:text-base px-4">Diverse sessions designed to challenge every muscle and mindset.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {CLASSES.map((cls) => (
              <motion.div 
                key={cls.id}
                whileHover={{ y: -5 }}
                className="p-6 md:p-8 glass rounded-[2rem] md:rounded-[2.5rem] group hover:border-neon-cyan/50 transition-colors"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-neon-cyan/10 rounded-2xl flex items-center justify-center text-neon-cyan mb-6 group-hover:scale-110 transition-transform">
                  {cls.icon}
                </div>
                <h4 className="text-xl md:text-2xl font-display font-bold mb-4">{cls.name}</h4>
                <p className="opacity-60 text-xs md:text-sm leading-relaxed">{cls.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* PT Section */}
          <div className="mt-8 md:mt-12 bg-neon-cyan/5 rounded-[2rem] md:rounded-[2.5rem] border border-neon-cyan/10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-full md:w-1/3">
              <img src={gymImages.pt || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800&h=800"} className="rounded-2xl md:rounded-3xl shadow-xl shadow-neon-cyan/5 opacity-90 transition-opacity duration-1000" alt="Personal Training" referrerPolicy="no-referrer" />
            </div>
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-4 md:mb-6 flex items-center justify-center md:justify-start gap-3">
                <Users className="text-neon-cyan w-6 h-6 md:w-8 md:h-8" /> 
                PERSONAL TRAINING
              </h3>
              <p className="text-base md:text-lg opacity-70 mb-8 leading-relaxed">
                One-on-one coaching tailored to your specific metabolism, lifestyle, and goals. 
                Our certified trainers provide the accountability and expertise you need to see real results.
              </p>
              <button 
                onClick={() => setShowConsultation(true)}
                className="w-full sm:w-auto px-8 py-4 outline outline-1 outline-neon-cyan/30 rounded-xl text-neon-cyan hover:bg-neon-cyan hover:text-gym-black active:scale-95 transition-all text-sm font-bold uppercase tracking-widest"
              >
                BOOK CONSULTATION
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">JOIN THE <br /><span className="text-neon-cyan">ELITE.</span></h2>
            </div>
            <p className="max-w-sm opacity-60">Transparent pricing. No hidden fees. Just results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING.map((plan) => (
              <div 
                key={plan.id}
                className={`relative p-10 rounded-[3rem] border ${plan.popular ? 'border-neon-cyan bg-neon-cyan/5 scale-105 z-10' : 'border-white/10 glass'} flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-neon-cyan text-gym-black text-[10px] font-black uppercase tracking-widest rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h4 className="text-xl font-bold mb-2 uppercase tracking-widest opacity-80">{plan.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-display font-bold">€{plan.price}</span>
                    <span className="opacity-50">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-12 flex-grow">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm opacity-70">
                      <CheckCircle2 className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.popular ? 'bg-neon-cyan text-gym-black hover:bg-white' : 'glass hover:bg-white/10'}`}>
                  CHOOSE {plan.name.toUpperCase()}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
               <div className="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4 h-[300px] md:h-[500px] w-full">
                  <div className="col-span-1 row-span-2">
                    <img src={gymImages.gal1 || poolImg} className="w-full h-full object-cover rounded-2xl md:rounded-3xl opacity-90 transition-opacity duration-1000 shadow-xl" alt="Gym interior" referrerPolicy="no-referrer" />
                  </div>
                  <div className="col-span-1 row-span-1">
                    <img src={gymImages.gal2 || gymFloorImg} className="w-full h-full object-cover rounded-2xl md:rounded-3xl opacity-90 transition-opacity duration-1000 shadow-xl" alt="Weights" referrerPolicy="no-referrer" />
                  </div>
                  <div className="col-span-1 row-span-1">
                    <img src={gymImages.gal3 || cardioImg} className="w-full h-full object-cover rounded-2xl md:rounded-3xl opacity-90 transition-opacity duration-1000 shadow-xl" alt="Cardio area" referrerPolicy="no-referrer" />
                  </div>
               </div>
           <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 md:mb-8">THE SPACE. <br className="hidden md:block" /><span className="text-neon-cyan">MODERN.</span></h2>
              <p className="text-base md:text-lg opacity-70 mb-8 md:mb-12 italic">
                Equipped with the latest from Hammer Strength, Life Fitness, and Technogym. 
                Designed for optimal flow and motivation.
              </p>
              <div className="flex gap-4 max-w-sm mx-auto lg:mx-0">
                <div className="glass p-4 md:p-6 rounded-2xl md:rounded-3xl flex-1 text-center">
                  <span className="block text-2xl md:text-3xl font-display font-bold text-neon-cyan">800m²</span>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-widest opacity-50">Training Area</span>
                </div>
                <div className="glass p-4 md:p-6 rounded-2xl md:rounded-3xl flex-1 text-center">
                  <span className="block text-2xl md:text-3xl font-display font-bold text-neon-cyan">50+</span>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-widest opacity-50">Specialized Machines</span>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section id="trainers" className="py-16 md:py-24 px-4 md:px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
            <h2 className="text-4xl md:text-6xl font-display font-bold underline decoration-neon-cyan/20 italic">MEET YOUR COACHES</h2>
            <p className="max-w-xs text-sm opacity-50 uppercase tracking-widest">Expert guidance to push your boundaries.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {TRAINERS.map((t, i) => (
              <motion.div 
                key={t.name}
                whileHover={{ y: -10 }}
                className="group relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden aspect-[3/4] shadow-2xl"
              >
                <img 
                  src={gymImages[`trainer${i+1}`] || t.img} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 filter grayscale-[0.2] group-hover:grayscale-0" 
                  alt={t.name} 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gym-black via-gym-black/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <p className="text-neon-cyan text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-1">{t.role}</p>
                  <h4 className="text-xl md:text-2xl font-display font-bold tracking-tight">{t.name}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4 md:px-6 border-y border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="relative p-6">
              <span className="text-7xl md:text-9xl font-display font-bold text-neon-cyan opacity-5 absolute -top-8 md:-top-16 -left-4 md:-left-8">"</span>
              <p className="text-xl md:text-3xl font-display italic leading-relaxed mb-8 relative z-10">
                {t.text}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neon-cyan/20 border border-neon-cyan/30" />
                <div>
                  <p className="font-bold text-sm md:text-base">{t.author}</p>
                  <p className="text-[10px] md:text-xs opacity-50 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Map Section */}
      <section id="contact" className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 md:mb-12 italic">GET IN <span className="text-neon-cyan underline decoration-neon-cyan/20 underline-offset-4">TOUCH.</span></h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6 md:gap-8 mb-12">
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 glass rounded-xl md:rounded-2xl flex items-center justify-center text-neon-cyan shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-sm md:text-base">Visit Us</h4>
                    <p className="opacity-60 text-[10px] md:text-sm">Rr. HEKURUDHAT, Prishtinë 10000</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 glass rounded-xl md:rounded-2xl flex items-center justify-center text-neon-cyan shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-sm md:text-base">Call Us</h4>
                    <p className="opacity-60 text-[10px] md:text-sm tracking-widest">+383 49 414 415</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 glass rounded-xl md:rounded-2xl flex items-center justify-center text-neon-cyan shrink-0">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-sm md:text-base">Instagram</h4>
                    <a href="#" className="text-neon-cyan text-[10px] md:text-sm hover:underline font-bold">@energym_prishtina</a>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-neon-cyan outline-none transition-all text-sm" />
                  <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-neon-cyan outline-none transition-all text-sm" />
                </div>
                <textarea rows={4} placeholder="Your Message" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-neon-cyan outline-none transition-all resize-none text-sm"></textarea>
                <button className="w-full py-4 bg-neon-cyan text-gym-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.01] active:scale-95 transition-all text-sm shadow-lg shadow-neon-cyan/20">
                  SEND MESSAGE
                </button>
              </form>
            </div>

            <div className="relative h-[300px] sm:h-[400px] lg:h-full min-h-[300px] lg:min-h-[500px] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2934.3592862846!2d21.1466093!3d42.6534571!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13549f0004f8e6e5%3A0xe9f7e8e5e5e5e5e5!2sRr.%20Hekurudhat%2C%20Prishtina!5e0!3m2!1sen!2s!4v1713446400000!5m2!1sen!2s" 
                className="absolute inset-0 w-full h-full grayscale invert opacity-60 contrast-125"
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                <div className="glass p-4 md:p-6 rounded-[2rem] flex items-center justify-between border border-white/10 shadow-2xl">
                   <div>
                      <p className="text-[8px] md:text-[10px] uppercase font-bold tracking-widest text-neon-cyan mb-1">Location</p>
                      <p className="text-xs md:text-sm font-bold uppercase tracking-tight">ENERGYM PRISHTINA</p>
                   </div>
                   <button 
                     onClick={() => window.open('https://maps.google.com', '_blank')}
                     className="p-3 bg-neon-cyan text-gym-black rounded-full shadow-lg shadow-neon-cyan/20 hover:scale-110 active:scale-90 transition-transform"
                   >
                      <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-gym-black/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-display font-bold tracking-tighter">
            ENERG<span className="text-neon-cyan">YM.</span>
          </div>
          <p className="text-[10px] md:text-xs opacity-40 uppercase tracking-[0.2em] text-center md:text-left leading-relaxed">
            © {new Date().getFullYear()} ENERGYM PRISHTINA. All rights reserved. <br className="md:hidden" />
            Empowering your peak performance since 2018.
          </p>
          <div className="flex gap-4">
            <button className="w-10 h-10 glass rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 hover:text-neon-cyan transition-all">
              <Instagram className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 glass rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 hover:text-neon-cyan transition-all text-[10px] font-black tracking-widest">
              FB
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
