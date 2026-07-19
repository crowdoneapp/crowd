import React, { useState, useEffect } from "react";
import api from "../../api/axios"; 
import SuccessModal from "./SuccessModal";
import MessageModal from "./MessageModal";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2, ShieldAlert, Rocket, X, ArrowUpCircle, Wallet, Lock, UserCheck, Crown, Check, AlertOctagon, Info } from "lucide-react"; 

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
        if (showManualError) showMessage("Verification Failed", "Account details not found in the system.", "error");
      }
    } catch (err) {
      setUserInfo(null);
      if (showManualError) {
        const errorMsg = err.response?.data?.message || "Account not found";
        showMessage("Verification Failed", errorMsg, "error");
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

  // 🔥 FIX: Added fallback to topUpAmount to handle cases where highestPackage is missing in API response
  const currentHighestPkg = userInfo?.highestPackage || userInfo?.topUpAmount || 0;

  // 🔥 NEXT Package Logic
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
    if (!transactionPassword) return showMessage("Security Alert", "Please enter your Security PIN to authorize this transaction.", "error");
    if (isMaxedOut) return showMessage("Apex Tier", "This account has already achieved the maximum $1000 Apex Tier.", "info");
    
    setLoading(true);

    try {
      if (isPromoUser) {
        const res = await api.post(`/user/promo-dummy-topup`, { amount: 30, transactionPassword }, { headers: { Authorization: `Bearer ${token}` } });
        setSuccessData({ userId: res.data.generatedId, name: res.data.name, amount: 30 });
        setSuccessModalOpen(true);
        if (onTopUpSuccess) onTopUpSuccess();
        setTransactionPassword("");
      } else {
        if (!userInfo) { setLoading(false); return showMessage("Verification Required", "Please verify the recipient account ID first.", "error"); }
        if (walletBalance < nextAmount) { setLoading(false); return showMessage("Insufficient Funds", `Requires $${nextAmount}, but your Vault only has $${walletBalance}`, "error"); }

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
      const msg = err.response?.data?.message || "Transaction failed to process due to a network error.";
      showMessage("Transaction Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-hidden font-sans animate-in fade-in duration-300">
      
      <div className="bg-white/95 backdrop-blur-3xl w-full max-w-[440px] flex flex-col rounded-[32px] border border-white/50 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.4)] overflow-hidden relative animate-in zoom-in-95 duration-300 max-h-[95vh]">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>

        {/* Header */}
        <div className="bg-slate-50/50 border-b border-slate-100 p-5 flex justify-between items-center relative z-10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] border bg-white ${isFirstTopup || !userInfo ? 'border-blue-100 text-blue-600' : 'border-indigo-100 text-indigo-600'}`}>
               {isFirstTopup || !userInfo ? <Rocket size={22} strokeWidth={2.5} /> : <ArrowUpCircle size={22} strokeWidth={2.5} />}
            </div>
            <div>
              <h1 className="text-xl font-black text-[#0b1c3c] tracking-tight">
                {isFirstTopup || !userInfo ? 'Initialize Tier' : 'Elevate Tier'} 
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-bold">Secure Upgrade Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all border border-slate-200 hover:border-rose-200 shadow-sm cursor-pointer active:scale-95">
             <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 md:p-6 space-y-5 relative z-10 bg-transparent overflow-y-auto custom-scroll">
          
          {/* User Input Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#0b1c3c] uppercase tracking-widest ml-1 flex items-center gap-1.5">
               <UserCheck size={14} className="text-blue-500"/> Recipient Account ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                {isPromoUser ? (
                  <div className="w-full bg-blue-50/50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3.5 font-bold flex items-center justify-center gap-2 shadow-sm text-sm">
                    <ShieldAlert size={18} /> Auto-Allocation Active
                  </div>
                ) : (
                  <>
                    <input 
                      type="number" 
                      placeholder="Enter Account ID"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className={`w-full bg-slate-50 text-[#0b1c3c] rounded-xl px-4 py-3.5 outline-none transition-all placeholder-slate-400 font-mono font-black shadow-inner border ${
                          userInfo ? 'border-emerald-300 focus:ring-4 focus:ring-emerald-50' : 'border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 hover:border-slate-300'
                      }`}
                    />
                    {userInfo && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 bg-emerald-50 rounded-full p-0.5">
                        <CheckCircle2 size={18} strokeWidth={3} />
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {!isPromoUser && !userInfo && (
                <button onClick={() => fetchUser(userId, true)} className="bg-[#0b1c3c] hover:bg-blue-800 text-white px-5 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(11,28,60,0.2)] text-[10px] active:scale-95 shrink-0">
                  Verify
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
                    <div className={`border rounded-2xl p-4 flex justify-between items-center shadow-[0_4px_15px_rgba(0,0,0,0.02)] ${isMaxedOut ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'}`}>
                      <div>
                        <div className="text-[#0b1c3c] font-black text-sm uppercase tracking-wide">{userInfo.name}</div>
                        <div className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {userInfo.userId}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-1">Current Tier</div>
                         <div className="text-blue-700 font-black text-[13px] font-mono bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 inline-block shadow-sm">
                           ${currentHighestPkg}
                         </div>
                      </div>
                    </div>

                    {/* 🔥 Visual Package Tracker */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Step-by-Step Progression</h4>
                        <div className="flex items-center justify-between gap-1">
                            {PACKAGES.map((pkg, idx) => {
                                const isCompleted = currentHighestPkg >= pkg;
                                const isNext = nextAmount === pkg;
                                const isLocked = !isCompleted && !isNext;

                                return (
                                    <div key={pkg} className="flex flex-col items-center gap-1.5 relative flex-1">
                                        {/* Connector Line */}
                                        {idx !== 0 && (
                                            <div className={`absolute top-[14px] left-[-50%] w-full h-[2px] -z-10 ${isCompleted ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                                        )}
                                        
                                        {/* Node */}
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] border-2 transition-all duration-300 shadow-sm bg-white
                                            ${isCompleted ? 'border-emerald-500 text-emerald-500' : ''}
                                            ${isNext ? 'border-blue-500 text-blue-600 ring-4 ring-blue-100 scale-110' : ''}
                                            ${isLocked ? 'border-slate-200 text-slate-300' : ''}
                                        `}>
                                            {isCompleted ? <Check size={14} strokeWidth={3} /> : (isLocked ? <Lock size={10} /> : <span className="font-black">${pkg}</span>)}
                                        </div>
                                        <span className={`text-[8px] font-black font-mono ${isNext ? 'text-blue-600' : 'text-slate-400'}`}>
                                            ${pkg}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 🔥 2 Directs Requirement Notification */}
                    {!isFirstTopup && !isMaxedOut && (
                        <div className="flex items-start gap-2 text-slate-500 bg-sky-50/50 px-3 py-2.5 rounded-xl border border-sky-100 shadow-inner">
                           <Info size={16} className="text-sky-500 shrink-0 mt-0.5" />
                           <p className="text-[10px] font-bold leading-relaxed text-slate-600">
                               <span className="font-black text-sky-800 tracking-widest uppercase text-[9px]">Requirement:</span> Upgrade requires <span className="text-sky-600 font-black">2 Active Directs</span> on your current tier (${currentHighestPkg}) or higher.
                           </p>
                        </div>
                    )}

                    {/* 🔥 UPGRADE BOUNCE BACK WARNING */}
                    {!isMaxedOut && !isFirstTopup && (
                        <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-3 shadow-inner">
                            <AlertOctagon className="text-amber-500 shrink-0 w-6 h-6" strokeWidth={2} />
                            <div>
                               <p className="text-amber-800 text-[10px] font-black uppercase tracking-widest mb-1">Upgrade Bounce Back Warning</p>
                               <p className="text-amber-700/80 text-[10px] font-bold leading-relaxed">
                                   If your direct member upgrades to <span className="font-black text-amber-900">${nextAmount}</span> before you do, you will <span className="font-black text-rose-600 underline">NOT</span> receive the Direct/Upgrade Income. It will bounce back to the qualified Super Upline.
                               </p>
                            </div>
                        </div>
                    )}

                </div>
              ) : (
                userId.length > 0 && <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 pt-2 animate-pulse flex items-center justify-center gap-2 h-full"><Rocket size={14}/> Authenticating Node Data...</div>
              )}
            </div>
          )}

          {/* Balance Preview */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3.5 shadow-sm">
             <div className="flex items-center gap-2 text-slate-500">
                 <Wallet size={16} className="text-emerald-500" />
                 <span className="text-[10px] uppercase tracking-widest font-black text-[#0b1c3c]">Available Vault</span>
             </div>
             <div className="text-lg font-black text-emerald-600 font-mono tracking-tight">
               {walletBalance !== null ? `$${(Math.floor(Number(walletBalance) * 100) / 100).toFixed(2)}` : "..."}
             </div>
          </div>

        </div>

        {/* Footer (Payment Action) */}
        <div className="bg-white border-t border-slate-100 p-5 md:p-6 shrink-0 z-20">
          <div className="space-y-4">
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                   <Lock size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="password"
                  placeholder="Security PIN (Tx)"
                  value={transactionPassword}
                  onChange={(e) => setTransactionPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-[#0b1c3c] font-black rounded-xl pl-12 pr-4 py-3.5 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder-slate-400 font-mono tracking-widest shadow-inner text-sm"
                />
             </div>
             
             <button 
               onClick={handleTopUp} 
               disabled={loading || isMaxedOut || (!isPromoUser && !userInfo)}
               className={`
                 w-full py-4 rounded-xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300
                 ${loading || isMaxedOut || (!isPromoUser && !userInfo) 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_10px_30px_-10px_rgba(37,99,235,0.7)] hover:-translate-y-0.5 active:scale-95'}
               `}
             >
               {loading ? "AUTHENTICATING..." : (
                 <>
                   {isMaxedOut ? "APEX TIER ACHIEVED" : (isFirstTopup || !userInfo ? "CONFIRM INITIALIZATION" : "AUTHORIZE UPGRADE")}
                   {!isMaxedOut && <span className={(!isPromoUser && !userInfo) ? "text-slate-400" : "text-blue-200"}>(${nextAmount})</span>}
                 </>
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