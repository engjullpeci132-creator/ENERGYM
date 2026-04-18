import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Shield, 
  Trash2, 
  RotateCcw, 
  ExternalLink,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  plan?: string;
  consultationPlan?: string;
  expiryDate?: string;
  consultationExpiryDate?: string;
  createdAt?: any;
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const usersData: UserData[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ ...doc.data() as UserData });
      });
      setUsers(usersData);
    } catch (e) {
      console.error("Error fetching users:", e);
      setStatusMsg({ type: 'error', text: "Failed to fetch users. Access denied." });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setStatusMsg({ type: 'success', text: `Password reset email sent to ${email}` });
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || "Failed to send reset email" });
    }
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.displayName?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-gym-black flex flex-col pt-20 md:pt-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full px-4 flex-1 flex flex-col pb-8 overflow-hidden">
        <div className="flex justify-between items-center mb-6 md:mb-12">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={onClose} className="p-2 md:p-4 glass rounded-full hover:text-neon-cyan transition-colors">
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <h1 className="text-2xl md:text-4xl font-display font-bold italic tracking-wider">
              ADMIN <span className="text-neon-cyan">DASHBOARD.</span>
            </h1>
          </div>
          
          <div className="relative hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-neon-cyan transition-colors w-64 md:w-80"
            />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="relative mb-6 sm:hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search members..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-neon-cyan transition-colors w-full"
          />
        </div>

        <AnimatePresence>
          {statusMsg && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${
                statusMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-bold uppercase tracking-widest">{statusMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-hidden glass rounded-t-[2.5rem] md:rounded-[2.5rem] border border-white/10 mb-0 md:mb-8 flex flex-col">
          <div className="p-6 border-bottom border-white/5 bg-white/5 grid grid-cols-12 gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            <div className="col-span-8 xs:col-span-5 md:col-span-3">MEMBER</div>
            <div className="hidden xs:block col-span-4 md:col-span-2">PLAN</div>
            <div className="hidden md:block col-span-2">CONSULTATION</div>
            <div className="hidden lg:block col-span-3">EXPIRY</div>
            <div className="col-span-4 xs:col-span-3 md:col-span-2 text-right">ACTIONS</div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
                <Loader2 className="w-12 h-12 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Accessing secure database...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
                <Users className="w-12 h-12" />
                <span className="text-xs font-bold uppercase tracking-widest">No members found</span>
              </div>
            ) : (
              filteredUsers.map((u, i) => (
                <div key={u.uid} className="p-4 md:p-6 border-b border-white/5 hover:bg-white/5 transition-colors grid grid-cols-12 gap-2 md:gap-4 items-center">
                  <div className="col-span-8 xs:col-span-5 md:col-span-3 flex flex-col min-w-0">
                    <span className="font-bold text-sm truncate text-white">{u.displayName || 'Unnamed Member'}</span>
                    <span className="text-[10px] opacity-40 truncate">{u.email}</span>
                  </div>
                  <div className="hidden xs:block col-span-4 md:col-span-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.plan === 'elite' ? 'bg-neon-cyan text-gym-black' : 
                      u.plan === 'pro' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40'
                    }`}>
                      {u.plan || 'Free'}
                    </span>
                  </div>
                  <div className="hidden md:block col-span-2">
                    {u.consultationPlan ? (
                       <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-1">
                         <Star className="w-3 h-3 fill-current" /> {u.consultationPlan}
                       </span>
                    ) : (
                      <span className="text-[10px] text-white/20 uppercase tracking-widest">None</span>
                    )}
                  </div>
                  <div className="hidden md:block col-span-3 flex flex-col gap-1">
                    {u.expiryDate && (
                      <div className="flex items-center gap-2 text-[10px] text-white/60 font-mono">
                        <Calendar className="w-3 h-3 text-neon-cyan" />
                        PLN: {new Date(u.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </div>
                    )}
                    {u.consultationExpiryDate && (
                       <div className="flex items-center gap-2 text-[10px] text-neon-cyan/60 font-mono">
                         <Calendar className="w-3 h-3" />
                         CON: {new Date(u.consultationExpiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                       </div>
                    )}
                  </div>
                  <div className="col-span-4 md:col-span-2 flex justify-end gap-2">
                    <button 
                      onClick={() => handlePasswordReset(u.email)}
                      title="Send Password Reset"
                      className="p-2 md:p-3 glass rounded-xl hover:text-neon-cyan transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
             <span>{filteredUsers.length} MEMBERS FOUND</span>
             <div className="flex items-center gap-2">
               <Shield className="w-3 h-3 text-neon-cyan" />
               SECURE ADMIN ACCESS ACTIVE
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
