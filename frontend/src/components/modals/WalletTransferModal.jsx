import React, { useEffect, useState } from "react";
import api from "../../api/axios"; 
import { useAuth } from "../../context/AuthContext"; 
import SuccessModal from "./SuccessModal";
import MessageModal from "./MessageModal";
import { Send, User, Lock, Wallet, ArrowRightLeft, X, XCircle, CheckCircle2, ShieldCheck, Activity } from "lucide-react";

const WalletTransferModal = ({ onClose }) => {
  // --- STATE ---
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [senderBalance, setSenderBalance] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false); 

  const { user: loggedInUser, token } = useAuth();
  const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

  // ✅ ROLE CHECK
  const isLeaderUser = loggedInUser?.role === "leader";
  const isPromoUser = loggedInUser?.role === "promo"; // 🔥 Promo User check

  const showMessage = (title, message, type = "error") => 
    setMessageModal({ open: true, title, message, type });

  // --- LOGIC: Fetch Sender Balance ---
  useEffect(() => {
    if (!loggedInUser?.userId || !token) return;
    const fetchSenderBalance = async () => {
      try {
        const res = await api.get(`/user/${loggedInUser.userId}?t=${new Date().getTime()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSenderBalance(res.data.user.walletBalance || 0);
      } catch (err) { 
        setSenderBalance(0); 
        console.error(err); 
      }
    };
    fetchSenderBalance();
  }, [loggedInUser?.userId, token]);

  // --- LOGIC: Fetch Recipient Name (For Normal Users) ---
  const fetchUserName = async (idToFetch) => {
    if (isPromoUser) return; // Promo walo ko fetch nahi karna

    const trimmedId = (idToFetch || userId).trim();
    if (!trimmedId) {
        setUserName("");
        return;
    }
    try {
      const res = await api.get(`/user/${trimmedId}?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserName(res.data.user?.name || "User not found");
    } catch { 
      setUserName("User not found"); 
    }
  };

  // --- LOGIC: Handle Transfer ---
  const handleTransfer = async () => {
    const amt = Number(amount);

    // Common Checks
    if (!transactionPassword) return showMessage("Security Alert", "Enter your Tx-PIN to authorize this transfer.", "error");

    // 🔥 PROMO USER VALIDATION
    if (isPromoUser) {
      if (amt < 10 || amt > 1000) {
        return showMessage("Invalid Amount", "Promo transfer amount must be between $10 and $1000.", "error");
      }
    } 
    // 🛡️ NORMAL/LEADER USER VALIDATION
    else {
      const trimmedId = userId.trim();
      if (!trimmedId || amt <= 0 || !userName || userName === "User not found")
        return showMessage("Validation Error", "Provide a valid recipient ID and amount.", "error");
      if (trimmedId === String(loggedInUser.userId))
        return showMessage("Action Denied", "You cannot transfer assets to yourself.", "error");
      if (amt > senderBalance) 
        return showMessage("Insufficient Funds", `Your available balance is $${(Math.floor(Number(senderBalance) * 100) / 100).toFixed(2)}`, "error");
    }

    setLoading(true);
    try {
      // 🔥 DYNAMIC ENDPOINT LOGIC
      let endpoint = "/wallet/transfer";
      let payload = { fromUserId: loggedInUser.userId, toUserId: userId.trim(), amount: amt, transactionPassword };

      if (isPromoUser) {
        endpoint = "/wallet/promo-transfer"; 
        payload = { amount: amt, transactionPassword }; 
      } else if (isLeaderUser) {
        endpoint = "/wallet/leader-transfer";
      }

      const res = await api.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
      
      if (isPromoUser) {
        setUserId(res.data.generatedId);
        setUserName(res.data.name);
      }

      setSuccessOpen(true);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Transfer failed due to a network or contract error.";
      showMessage("Transfer Failed", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    setUserId("");
    setUserName("");
    setAmount("");
    setTransactionPassword("");
    onClose();
  };

  return (
    <>
      {!successOpen && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[1000] flex justify-center items-center p-4 overflow-hidden animate-in fade-in duration-300">
          
          <style>{`
            input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            input[type=number] { -moz-appearance: textfield; }
            .custom-scroll::-webkit-scrollbar { width: 4px; }
            .custom-scroll::-webkit-scrollbar-track { background: transparent; }
            .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.3); border-radius: 10px; }
            .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.6); }
          `}</style>

          {/* 🟢 Premium Glassmorphism Modal Container */}
          <div className="bg-[#0f172a]/80 backdrop-blur-2xl mt-8 w-full max-w-md rounded-[32px] border border-cyan-500/20 shadow-[0_0_50px_-12px_rgba(34,211,238,0.3)] flex flex-col max-h-[90vh] relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* 🟢 Ambient Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/20 blur-[60px] pointer-events-none rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 blur-[60px] pointer-events-none rounded-full"></div>

            {/* 🟢 Header */}
            <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between items-center relative z-10 shrink-0">
               <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 rounded-2xl border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                      <Send size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-white font-black text-lg tracking-tight">P2P Asset Transfer</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Secure Internal Gateway</p>
                  </div>
               </div>
               <button onClick={onClose} className="bg-white/5 hover:bg-rose-500/20 p-2 rounded-full transition-all border border-white/10 hover:border-rose-500/30 shadow-sm cursor-pointer active:scale-95 group">
                  <X size={18} className="text-slate-400 group-hover:text-rose-400" strokeWidth={2.5} />
               </button>
            </div>

            {/* 🟢 Body */}
            <div className="p-5 md:p-6 overflow-y-auto custom-scroll flex-1 space-y-5 relative z-10 bg-transparent">

               {/* Balance Card */}
               <div className="bg-black/40 border border-white/10 p-4.5 rounded-2xl flex justify-between items-center shadow-inner transition-all hover:border-cyan-500/30 group">
                 <div>
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                       <Wallet size={14} className="group-hover:text-cyan-300 transition-colors" /> Available Asset Balance
                    </div>
                    <div className="text-2xl font-black text-white font-mono drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                      {senderBalance !== null ? `$${(Math.floor(Number(senderBalance) * 100) / 100).toFixed(2)}` : "..."}
                    </div>
                 </div>
               </div>

               {/* Inputs Section */}
               <div className="space-y-4">
                 
                 {/* Recipient User ID */}
                 <div>
                   <label className="block text-[10px] font-black text-cyan-400 mb-1.5 ml-1 uppercase tracking-widest">Target Account ID</label>
                   <div className="relative group">
                     {isPromoUser ? (
                        <div className="w-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl px-4 py-3.5 font-bold flex items-center justify-center gap-2 shadow-inner text-sm">
                          <ShieldCheck size={18} /> Protocol Will Auto-Allocate Recipient
                        </div>
                     ) : (
                        <>
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                          </div>
                          <input 
                            type="number" 
                            placeholder="Enter Account ID" 
                            value={userId} 
                            onChange={e => {
                              setUserId(e.target.value);
                              if(e.target.value.length >= 6) fetchUserName(e.target.value);
                            }} 
                            onBlur={() => fetchUserName()}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-cyan-100 text-sm focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 focus:outline-none transition-all font-mono font-black tracking-wider shadow-inner placeholder-slate-600"
                          />
                        </>
                     )}
                   </div>
                 </div>

                 {/* Recipient Name Verification Result */}
                 {!isPromoUser && userName && (
                    <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 shadow-inner transition-all duration-300 ${userName === 'User not found' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.1)]' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'}`}>
                        {userName === 'User not found' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {userName === 'User not found' ? 'Unidentified Account' : `Verified: ${userName}`}
                        </span>
                    </div>
                 )}

                 {/* Amount Field */}
                 <div>
                   <label className="block text-[10px] font-black text-cyan-400 mb-1.5 ml-1 uppercase tracking-widest">Transfer Amount ($)</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <span className="text-slate-500 group-focus-within:text-cyan-400 font-black text-lg transition-colors">$</span>
                     </div>
                     <input 
                       type="number" 
                       placeholder={isPromoUser ? "10 - 1000" : "0.00"} 
                       value={amount} 
                       onChange={e => setAmount(e.target.value)}
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white text-sm md:text-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 focus:outline-none transition-all font-black shadow-inner placeholder-slate-600"
                     />
                     {!isPromoUser && (
                       <button 
                           onClick={() => setAmount(senderBalance)}
                           disabled={!senderBalance}
                           className="absolute right-3 top-3.5 bg-white/5 hover:bg-white/10 text-cyan-400 text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors border border-white/10 disabled:opacity-30 disabled:hover:bg-white/5 cursor-pointer active:scale-95"
                       >MAX</button>
                     )}
                   </div>
                 </div>

                 {/* Transaction Password */}
                 <div>
                   <label className="block text-[10px] font-black text-cyan-400 mb-1.5 ml-1 uppercase tracking-widest">Secure Tx-PIN</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                     </div>
                     <input 
                       type="password" 
                       placeholder="Enter Transaction PIN" 
                       value={transactionPassword} 
                       autoComplete="new-password"
                       onChange={e => setTransactionPassword(e.target.value)}
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 focus:outline-none transition-all font-mono font-black tracking-widest shadow-inner placeholder-slate-600 text-sm"
                     />
                   </div>
                 </div>

               </div>
            </div>

            {/* 🟢 Footer */}
            <div className="p-5 border-t border-white/5 bg-black/20 flex gap-3 relative z-10 shrink-0">
               <button 
                  onClick={onClose} 
                  className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest transition-colors border border-white/10 shadow-sm active:scale-95"
               >
                 Abort
               </button>
               <button 
                 onClick={handleTransfer} 
                 disabled={loading}
                 className={`flex-1 py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 relative overflow-hidden group shadow-[0_0_15px_rgba(34,211,238,0.2)]
                    ${loading ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] active:scale-95'}`}
               >
                 {!(loading) && (
                     <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-700 ease-out skew-x-12 hidden group-hover:block"></div>
                 )}
                 {loading ? <><Activity size={16} className="animate-pulse" /> PROCESSING...</> : <>EXECUTE TRANSFER <ArrowRightLeft size={16} strokeWidth={2.5} className="relative z-10" /></>}
               </button>
            </div>

          </div>
        </div>
      )}

      <SuccessModal 
        isOpen={successOpen} 
        onClose={handleSuccessClose} 
        type="transfer" 
        userId={userId}
        userName={userName} 
        amount={amount} 
        zIndex={10000}
      />

      <MessageModal
        isOpen={messageModal.open}
        onClose={() => setMessageModal({ ...messageModal, open: false })}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        zIndex={11000}
      />
    </>
  );
};

export default WalletTransferModal;