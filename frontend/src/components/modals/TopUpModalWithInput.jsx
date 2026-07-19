import React, { useState, useEffect } from "react";
import api from "../../api/axios"; 
import SuccessModal from "./SuccessModal";
import MessageModal from "./MessageModal";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2, ShieldAlert, Rocket, X,RefreshCcw , ArrowUpCircle, Wallet, Lock, UserCheck, Crown, Check, AlertOctagon, Info, Cpu } from "lucide-react"; 

const PACKAGES = [30, 100, 300, 500, 1000];

const TopUpModal = ({ onClose, onTopUpSuccess }) => {
  const { user: loggedInUser, token, login } = useAuth();
  const [userId, setUserId] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  
  const [walletBalance, setWalletBalance] = useState(null);
  const [transactionPassword, setTransactionPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const isPromoUser = loggedInUser?.role === "promo";
  const isLeaderUser = loggedInUser?.role === "leader" || loggedInUser?.role === "superleader";
  const isSetupUser = loggedInUser?.role === "setup" || loggedInUser?.role === "super_setup";

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState({ userId: "", name: "", amount: 0 });
  const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

  const showMessage = (title, message, type = "info") => setMessageModal({ open: true, title, message, type });

  // 1. Fetch Balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!loggedInUser?.userId || !token) return;
      try {
        const res = await api.get(`/user/${loggedInUser.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWalletBalance(res.data.user.walletBalance || 0);
      } catch (err) {
        console.error(err);
        setWalletBalance(0);
      }
    };
    fetchBalance();
  }, [loggedInUser?.userId, token]);

  // 2. Fetch User Info
  const fetchUser = async (idToFetch, showManualError = false) => {
    if (isPromoUser) return; 
    
    if (!idToFetch || idToFetch.toString().trim() === "") {
      setUserInfo(null);
      return;
    }
    try {
      const res = await api.get(`/user/${idToFetch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.user) {
        setUserInfo(res.data.user);
      } else {
        setUserInfo(null);
        if (showManualError) showMessage("Sync Failed", "ID details not found in the blockchain network.", "error");
      }
    } catch (err) {
      setUserInfo(null);
      if (showManualError) {
        const errorMsg = err.response?.data?.message || "UserID not found";
        showMessage("Sync Failed", errorMsg, "error");
      }
    }
  };

  useEffect(() => {
    if (isPromoUser) return;
    const delayDebounceFn = setTimeout(() => {
      if (userId && userId.trim() !== "") fetchUser(userId, false);
      else setUserInfo(null);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [userId, token, isPromoUser]);

  const currentHighestPkg = userInfo?.highestPackage || userInfo?.topUpAmount || 0;

  // NEXT Package Logic
  const getNextPackage = (highest) => {
    if (!highest || highest === 0) return 30;
    if (highest === 30) return 100;
    if (highest === 100) return 300;
    if (highest === 300) return 500;
    if (highest === 500) return 1000;
    return null; 
  };

  const nextAmount = isPromoUser ? 30 : (userInfo ? getNextPackage(currentHighestPkg) : 30);
  const isMaxedOut = userInfo && nextAmount === null;
  const isFirstTopup = userInfo && currentHighestPkg === 0;

  // 3. Handle Top Up
  const handleTopUp = async () => {
    if (!transactionPassword) return showMessage("Security Alert", "Please enter your Tx-PIN to authorize this contract.", "error");
    if (isMaxedOut) return showMessage("Apex Tier", "This UserID already achieved the maximum $1000 Apex Tier.", "info");
    
    setLoading(true);

    try {
      if (isPromoUser) {
        const res = await api.post(`/user/promo-dummy-topup`, { amount: 30, transactionPassword }, { headers: { Authorization: `Bearer ${token}` } });
        setSuccessData({ userId: res.data.generatedId, name: res.data.name, amount: 30 });
        setSuccessModalOpen(true);
        if (onTopUpSuccess) onTopUpSuccess();
        setTransactionPassword("");
      } else {
        if (!userInfo) { setLoading(false); return showMessage("Validation Required", "Please sync the target User ID first.", "error"); }
        if (walletBalance < nextAmount) { setLoading(false); return showMessage("Insufficient Liquidity", `Contract requires $${nextAmount}, but your Asset Vault holds $${walletBalance}`, "error"); }

        let endpoint = `/user/topup/${Number(userId)}`;
        if (isLeaderUser) endpoint = `/user/leader-topup/${Number(userId)}`;
        if (isSetupUser && loggedInUser?.role === 'setup') endpoint = `/user/setup-topup/${Number(userId)}`;
        if (isSetupUser && loggedInUser?.role === 'super_setup') endpoint = `/user/supersetup-topup/${Number(userId)}`;
        
        await api.put(endpoint, { amount: nextAmount, transactionPassword }, { headers: { Authorization: `Bearer ${token}` } });

        setSuccessData({ userId: userInfo.userId, name: userInfo.name, amount: nextAmount });
        setSuccessModalOpen(true);

        const refreshedRes = await api.get(`/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        const refreshedUser = refreshedRes.data.user;

        if (Number(userId) === loggedInUser.userId) {
          login(refreshedUser, token);
          setWalletBalance(refreshedUser.walletBalance);
        } else {
          setUserInfo(refreshedUser);
        }

        if (onTopUpSuccess) onTopUpSuccess();
        setTransactionPassword("");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Smart contract failed to execute due to network divergence.";
      showMessage("Contract Execution Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-4 overflow-hidden font-sans animate-in fade-in duration-300">
      
      {/* 🟢 Premium Glassmorphism Modal Container */}
      <div className="bg-[#0f172a]/80 backdrop-blur-2xl w-full max-w-[440px] flex flex-col rounded-[32px] border border-cyan-500/20 shadow-[0_0_50px_-12px_rgba(34,211,238,0.3)] overflow-hidden relative animate-in zoom-in-95 duration-300 max-h-[95vh]">
        
        {/* 🟢 Glow Effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none"></div>

        {/* 🟢 Header */}
        <div className="bg-black/20 border-b border-white/5 p-5 flex justify-between items-center relative z-10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.2)] border bg-gradient-to-br ${isFirstTopup || !userInfo ? 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400' : 'from-indigo-500/10 to-purple-500/10 border-indigo-500/30 text-indigo-400'}`}>
               {isFirstTopup || !userInfo ? <Rocket size={22} strokeWidth={2.5} /> : <Cpu size={22} strokeWidth={2.5} />}
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                {isFirstTopup || !userInfo ? 'Initialize User' : 'Elevate Tier user'} 
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-bold">Secure Blockchain Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all border border-white/10 hover:border-rose-500/30 shadow-sm cursor-pointer active:scale-95 group">
             <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* 🟢 Content Body */}
        <div className="p-5 md:p-6 space-y-5 relative z-10 bg-transparent overflow-y-auto custom-scroll">
          
          {/* User Input Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
               <UserCheck size={14} className="text-cyan-500"/> Target  (User ID)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                {isPromoUser ? (
                  <div className="w-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl px-4 py-3.5 font-bold flex items-center justify-center gap-2 shadow-inner text-sm">
                    <ShieldAlert size={18} /> Auto-Allocation Active
                  </div>
                ) : (
                  <>
                    <input 
                      type="number" 
                      placeholder="Enter Target ID"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className={`w-full bg-black/40 text-cyan-100 rounded-xl px-4 py-3.5 outline-none transition-all placeholder-slate-600 font-mono font-black shadow-inner border ${
                          userInfo ? 'border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10' : 'border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 hover:border-white/20'
                      }`}
                    />
                    {userInfo && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 bg-emerald-500/10 rounded-full p-0.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 size={18} strokeWidth={3} />
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {!isPromoUser && !userInfo && (
                <button onClick={() => fetchUser(userId, true)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 hover:text-cyan-300 px-5 rounded-xl font-black uppercase tracking-widest transition-all shadow-sm text-[10px] active:scale-95 shrink-0 flex items-center gap-1.5 hover:border-cyan-500/30">
                  <RefreshCcw size={12} /> Sync
                </button>
              )}
            </div>
          </div>

          {/* Fetched User Info Area */}
          {!isPromoUser && (
            <div className="min-h-[56px] transition-all duration-300">
              {userInfo ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    
                    {/* User Profile Card */}
                    <div className={`border rounded-2xl p-4 flex justify-between items-center shadow-inner ${isMaxedOut ? 'bg-amber-500/10 border-amber-500/30' : 'bg-black/40 border-white/10'}`}>
                      <div>
                        <div className="text-white font-black text-sm uppercase tracking-wide">{userInfo.name}</div>
                        <div className="text-[10px] font-mono font-bold text-slate-500 mt-1 uppercase tracking-widest">ID: {userInfo.userId}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-1">Active UserID</div>
                         <div className="text-cyan-300 font-black text-[13px] font-mono bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20 inline-block shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                           ${currentHighestPkg}
                         </div>
                      </div>
                    </div>

                    {/* 🔥 Visual Package Tracker */}
                    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl shadow-inner">
                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Smart Contract Progression</h4>
                        <div className="flex items-center justify-between gap-1">
                            {PACKAGES.map((pkg, idx) => {
                                const isCompleted = currentHighestPkg >= pkg;
                                const isNext = nextAmount === pkg;
                                const isLocked = !isCompleted && !isNext;

                                return (
                                    <div key={pkg} className="flex flex-col items-center gap-1.5 relative flex-1">
                                        {/* Connector Line */}
                                        {idx !== 0 && (
                                            <div className={`absolute top-[14px] left-[-50%] w-full h-[2px] -z-10 ${isCompleted ? 'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-white/10'}`}></div>
                                        )}
                                        
                                         <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] border-2 transition-all duration-300 shadow-sm
                                            ${isCompleted ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : ''}
                                            ${isNext ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10 ring-4 ring-indigo-500/20 scale-110 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : ''}
                                            ${isLocked ? 'border-white/10 text-slate-600 bg-black/40' : ''}
                                        `}>
                                            {isCompleted ? <Check size={14} strokeWidth={3} /> : (isLocked ? <Lock size={10} /> : <span className="font-black">${pkg}</span>)}
                                        </div>
                                        <span className={`text-[9px] font-black font-mono ${isNext ? 'text-indigo-300 drop-shadow-[0_0_5px_rgba(99,102,241,0.8)]' : 'text-slate-500'}`}>
                                            ${pkg}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 🔥 2 Directs Requirement Notification */}
                    {!isFirstTopup && !isMaxedOut && (
                        <div className="flex items-start gap-3 text-slate-300 bg-sky-500/10 px-3.5 py-3 rounded-2xl border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                           <Info size={18} className="text-sky-400 shrink-0 mt-0.5" />
                           <p className="text-[10px] font-bold leading-relaxed text-sky-100/80">
                               <span className="font-black text-sky-400 tracking-widest uppercase text-[9px] block mb-0.5">Requirement Protocol</span> 
                               Elevation requires <span className="text-sky-300 font-black">2 Active Direct UderID</span> on your current tier (${currentHighestPkg}) or higher.
                           </p>
                        </div>
                    )}

                    {/* 🔥 UPGRADE BOUNCE BACK WARNING */}
                    {!isMaxedOut && !isFirstTopup && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex items-start gap-3 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                            <AlertOctagon className="text-amber-400 shrink-0 w-6 h-6" strokeWidth={2} />
                            <div>
                               <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">User Roll-Up Warning</p>
                               <p className="text-amber-200/70 text-[10px] font-bold leading-relaxed">
                                   If a sub-user elevates to <span className="font-black text-amber-300">${nextAmount}</span> before you do, the reward hash bypasses your wallet and <span className="font-black text-rose-400 underline">rolls up</span> to the qualified Super-userID.
                               </p>
                            </div>
                        </div>
                    )}

                </div>
              ) : (
                userId.length > 0 && <div className="text-[10px] font-black text-cyan-400/70 uppercase tracking-widest px-2 pt-2 animate-pulse flex items-center justify-center gap-2 h-full"><Rocket size={14}/> Fetching UserID Hash...</div>
              )}
            </div>
          )}

          {/* Balance Preview */}
          <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-4 shadow-inner">
             <div className="flex items-center gap-2 text-slate-400">
                 <Wallet size={16} className="text-emerald-400" />
                 <span className="text-[10px] uppercase tracking-widest font-black text-white">Asset Vault</span>
             </div>
             <div className="text-lg font-black text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
               {walletBalance !== null ? `$${(Math.floor(Number(walletBalance) * 100) / 100).toFixed(2)}` : "..."}
             </div>
          </div>

        </div>

        {/* 🟢 Footer (Payment Action) */}
        <div className="bg-black/20 border-t border-white/5 p-5 md:p-6 shrink-0 z-20">
          <div className="space-y-4">
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                   <Lock size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="password"
                  placeholder="Secure Tx-PIN"
                  value={transactionPassword}
                  onChange={(e) => setTransactionPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white font-black rounded-xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all placeholder-slate-600 font-mono tracking-widest shadow-inner text-sm"
                />
             </div>
             
             <button 
               onClick={handleTopUp} 
               disabled={loading || isMaxedOut || (!isPromoUser && !userInfo)}
               className={`
                 w-full py-4.5 rounded-xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group
                 ${loading || isMaxedOut || (!isPromoUser && !userInfo) 
                    ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' 
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95'}
               `}
             >
               {!(loading || isMaxedOut || (!isPromoUser && !userInfo)) && (
                   <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-700 ease-out skew-x-12 hidden group-hover:block"></div>
               )}
               
               {loading ? "VALIDATING HASH..." : (
                 <span className="relative z-10 flex items-center gap-2">
                   {isMaxedOut ? "APEX TIER ACHIEVED" : (isFirstTopup || !userInfo ? "EXECUTE INITIALIZATION" : "AUTHORIZE CONTRACT UPGRADE")}
                   {!isMaxedOut && <span className={(!isPromoUser && !userInfo) ? "text-slate-600" : "text-cyan-100"}>(${nextAmount})</span>}
                 </span>
               )}
             </button>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => { setSuccessModalOpen(false); onClose(); }}
        type="topup"
        userId={successData.userId}
        userName={successData.name} 
        amount={successData.amount}
        reward={0}
      />
      <MessageModal
        isOpen={messageModal.open}
        onClose={() => setMessageModal({ ...messageModal, open: false })}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
    </div>
  );
};

export default TopUpModal;