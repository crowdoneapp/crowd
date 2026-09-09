// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import api from "../../api/axios"; 
// import SuccessModal from "./SuccessModal";
// import MessageModal from "./MessageModal";
// import { useAuth } from "../../context/AuthContext";
// import { Wallet, Zap, Users, Trophy, Layers, ArrowRightLeft, X, Eye, EyeOff, CheckCircle2, ShieldCheck, Activity } from "lucide-react";

// const CreditToWalletModal = ({ userId, onClose, onSuccess }) => {
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
  
//   // 🔥 NAYA PLAN: Sabhi 6 incomes
//   const [balances, setBalances] = useState({
//     walletBalance: 0,
//     direct: 0, 
//     level: 0,
//     reward: 0,
//     pool: 0,
//     getPass: 0,
//     upgradeBounceBack: 0
//   });
  
//   const [credits, setCredits] = useState({
//     direct: "",
//     level: "",
//     reward: "",
//     pool: "",
//     getPass: "",
//     upgradeBounceBack: ""
//   });
  
//   const [transactionPassword, setTransactionPassword] = useState("");
  
//   const [successModalOpen, setSuccessModalOpen] = useState(false);
//   const [successData, setSuccessData] = useState({ userId: "", amount: 0 });
//   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

//   const { user: loggedInUser } = useAuth();
//   const token = localStorage.getItem("token");
  
//   // Roles
//   const isLeader = loggedInUser?.role === "leader" || loggedInUser?.role === "superleader";
//   const isSetupUser = loggedInUser?.role === "setup" || loggedInUser?.role === "super_setup";

//   const showMessage = (title, message, type = "error") =>
//     setMessageModal({ open: true, title, message, type });

//   const fetchData = useCallback(async () => {
//     try {
//       const res = await api.get(`/wallet/withdrawable/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (res.data) {
//         setBalances({
//           walletBalance: Number(res.data.walletBalance) || 0,
//           direct: Number(res.data.direct) || 0, 
//           level: Number(res.data.level) || 0,
//           reward: Number(res.data.reward) || 0,
//           pool: Number(res.data.pool) || 0,
//           getPass: Number(res.data.getPass) || 0,
//           upgradeBounceBack: Number(res.data.upgradeBounceBack) || 0
//         });
//       }
//     } catch (err) {
//       console.error("Fetch Error:", err);
//     }
//   }, [userId, token]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const totalAvailableToWithdraw = 
//     balances.direct + balances.level + balances.reward + balances.pool + balances.getPass + balances.upgradeBounceBack;

//   const hasMainIncome = totalAvailableToWithdraw > 0;

//   // 🔥 TOTAL ENTERED AMOUNT CALCULATION 🔥
//   const totalEnteredAmount = useMemo(() => {
//     let sum = 0;
//     Object.values(credits).forEach(val => {
//       sum += Number(val) || 0;
//     });
//     return sum;
//   }, [credits]);

//   const handleInputChange = useCallback((e, source) => {
//     const value = e.target.value;
//     if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
//       setCredits((prev) => ({ ...prev, [source]: value }));
//     }
//   }, []);

//   const handleCredit = async () => {
//     try {
//       if (isLeader || isSetupUser) {
//          return showMessage("Action Denied", "System roles cannot credit funds to the wallet directly from here.");
//       }

//       let items = [];
//       let totalRequested = 0;

//       const checkAndPush = (sourceName, inputVal, availableBal, displayName) => {
//           const amt = Number(inputVal);
//           if (amt > 0) {
//               if (amt > availableBal) throw new Error(`Insufficient yield in ${displayName}.`);
//               items.push({ source: sourceName, amount: amt });
//               totalRequested += amt;
//           }
//       };

//       checkAndPush("direct", credits.direct, balances.direct, "Direct Reward");
//       checkAndPush("level", credits.level, balances.level, "Level Yield");
//       checkAndPush("reward", credits.reward, balances.reward, "Team Bonus");
//       checkAndPush("pool", credits.pool, balances.pool, "Crowd Donation");
//       checkAndPush("getPass", credits.getPass, balances.getPass, "Fast Track Pass");
//       checkAndPush("upgradeBounceBack", credits.upgradeBounceBack, balances.upgradeBounceBack, "Account Roll-up");

//       if (totalRequested === 0) return showMessage("Invalid Request", "Enter an amount to credit.");
//       if (totalRequested < 10) return showMessage("Limit Error", `Minimum credit amount is $10. You entered $${totalRequested}.`);
//       if (totalRequested % 10 !== 0) return showMessage("Invalid Format", `Amount must be in multiples of $10. Your total is $${totalRequested}.`);
//       if (!transactionPassword.trim()) return showMessage("Security Alert", "Enter your Secure Tx-PIN.");

//       setLoading(true);

//       const payload = { userId, transactionPassword, items };

//       const res = await api.post("/wallet/credit-to-wallet", payload, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (res.data.success) {
//         setSuccessData({ userId, amount: totalRequested });
//         setSuccessModalOpen(true);
//         setCredits({ direct: "", level: "", reward: "", pool: "", getPass: "", upgradeBounceBack: "" }); 
//         setTransactionPassword("");
//         await fetchData();
//         if (onSuccess) onSuccess({ userId, walletBalance: res.data.walletBalance });
//       } else {
//         showMessage("Contract Error", res.data.message || "Failed to execute credit protocol.");
//       }

//     } catch (err) {
//       console.error("Catch Error:", err);
//       const errorMessage = err.response?.data?.message || err.message || "Error processing internal asset transfer";
//       showMessage("Error", errorMessage);
//     } finally {
//       setLoading(false); 
//     }
//   };

//   // 🔥 Helper function for UI consistency
//   const renderInputRow = (label, icon, iconColor, balance, stateKey) => (
//     <div className="bg-black/40 p-3 rounded-2xl border border-white/5 shadow-inner transition-all hover:border-cyan-500/30">
//         <div className="flex justify-between items-center mb-2.5 px-1">
//             <h3 className="text-slate-300 text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
//                 {icon} {label}
//             </h3>
//         </div>
//         <div className="flex flex-row gap-2 items-stretch">
//             <div className="w-[35%] bg-white/5 p-2 rounded-xl border border-white/10 shadow-sm flex flex-col justify-center items-center">
//                 <span className={`text-[14px] font-black font-mono ${iconColor}`}>${Number(balance).toFixed(2)}</span>
//             </div>
//             <div className="w-[65%] flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner group focus-within:border-cyan-500/50">
//                 <span className={`${iconColor} font-bold text-sm pl-3`}>$</span>
//                 <input 
//                     type="number" 
//                     placeholder="0.00" 
//                     autoComplete="off"
//                     data-lpignore="true"
//                     className="flex-1 bg-transparent border-none text-white text-[14px] font-black font-mono outline-none w-full placeholder-slate-600 py-1.5 px-2 disabled:opacity-50"
//                     value={credits[stateKey] || ""} 
//                     onChange={e => handleInputChange(e, stateKey)} 
//                     disabled={isLeader || isSetupUser} 
//                 />
//             </div>
//         </div>
//     </div>
//   );

//   return (
//     <>
//       <style>{`
//         input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
//         input[type=number] { -moz-appearance: textfield; }
//         .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(34,211,238,0.3) transparent; }
//         .custom-scroll::-webkit-scrollbar { width: 4px; }
//         .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 10px; }
//       `}</style>

//       {successModalOpen && (
//         <SuccessModal isOpen={successModalOpen} onClose={() => { setSuccessModalOpen(false); onClose(); }} type="credit" userId={successData.userId} amount={successData.amount} zIndex={10000} />
//       )}

//       {messageModal.open && (
//          <MessageModal isOpen={messageModal.open} onClose={() => setMessageModal({ ...messageModal, open: false })} title={messageModal.title} message={messageModal.message} type={messageModal.type} zIndex={11000} />
//       )}

//       {!successModalOpen && (
//         <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[1000] flex justify-center items-center p-4">
          
//           <div className="bg-[#0f172a]/80 backdrop-blur-2xl w-full max-w-[480px] rounded-[24px] border border-cyan-500/20 shadow-[0_0_50px_-12px_rgba(34,211,238,0.3)] flex flex-col max-h-[85vh] relative overflow-hidden animate-in zoom-in-95 duration-300">
            
//             <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/20 blur-[60px] pointer-events-none rounded-full"></div>
//             <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 blur-[60px] pointer-events-none rounded-full"></div>

//             {/* 🟢 Header */}
//             <div className="px-5 py-4 border-b border-white/5 bg-black/20 flex justify-between items-center z-10 shrink-0">
//               <h2 className="text-[12px] md:text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 m-0">
//                 <div className="bg-cyan-500/10 p-1.5 rounded-lg border border-cyan-500/20">
//                   <ArrowRightLeft size={16} className="text-cyan-400" /> 
//                 </div>
//                 Internal Asset Transfer
//               </h2>
//               <button onClick={onClose} className="group bg-white/5 hover:bg-rose-500/20 p-2 rounded-full transition-all border border-white/10 hover:border-rose-500/30 shadow-sm cursor-pointer active:scale-95">
//                  <X size={16} className="text-slate-400 group-hover:text-rose-400" />
//               </button>
//             </div>

//             {/* 🟢 Body */}
//             <div className="p-4 overflow-y-auto custom-scroll flex-1 flex flex-col gap-4 bg-transparent relative z-10">
              
//               {/* Balance Card */}
//               <div className="bg-black/40 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-inner">
//                  <div className="text-right w-full">
//                     <p className="text-cyan-400/80 text-[10px] font-bold uppercase tracking-widest mb-1">Total Available Yield</p>
//                     <h3 className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] font-mono">${totalAvailableToWithdraw.toFixed(2)}</h3>
//                  </div>
//               </div>

//               {/* MAIN INCOMES */}
//               {(hasMainIncome || isLeader || isSetupUser) && (
//                   <div className="flex flex-col gap-3">
//                     {renderInputRow("Direct Reward", <Zap size={14} className="text-amber-400" />, "text-amber-400", balances.direct, "direct")}
//                     {renderInputRow("Level Yield", <Users size={14} className="text-cyan-400" />, "text-cyan-400", balances.level, "level")}
//                     {renderInputRow("Crowd Donation (Pool)", <Layers size={14} className="text-emerald-400" />, "text-emerald-400", balances.pool, "pool")}
//                     {renderInputRow("Fast Track (Get Pass)", <Trophy size={14} className="text-indigo-400" />, "text-indigo-400", balances.getPass, "getPass")}
//                     {renderInputRow("Account Roll-up", <Zap size={14} className="text-purple-400" />, "text-purple-400", balances.upgradeBounceBack, "upgradeBounceBack")}
//                     {renderInputRow("Team Bonus", <Trophy size={14} className="text-rose-400" />, "text-rose-400", balances.reward, "reward")}
//                   </div>
//               )}

//               {/* 🔥 TOTAL ENTERED AMOUNT BOX 🔥 */}
//               <div className="bg-indigo-500/10 border border-indigo-500/30 p-3.5 rounded-xl flex items-center justify-between mt-2 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
//                  <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest m-0">Gross Transfer Amount</p>
//                  <h3 className="text-lg font-black text-indigo-400 m-0 font-mono">${totalEnteredAmount.toFixed(2)}</h3>
//               </div>

//               {/* 🔥 SECURITY PASSWORD (WITH EYE ICON) 🔥 */}
//               <div className="bg-black/40 p-3 rounded-xl border border-white/5 mt-1 relative shadow-inner">
//                   <label className="text-[9px] text-cyan-400 block mb-1.5 font-bold uppercase tracking-widest ml-1">SECURE TX-PIN</label>
                  
//                   <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0 }}>
//                       <input type="text" name="dummy_username_trap" tabIndex="-1" autoComplete="username" />
//                       <input type="password" name="dummy_password_trap" tabIndex="-1" autoComplete="current-password" />
//                   </div>

//                   <div className="relative">
//                       <input 
//                         type={showPassword ? "text" : "password"} 
//                         autoComplete="new-password"
//                         data-lpignore="true"
//                         placeholder="Enter Transaction PIN" 
//                         className="w-full bg-white/5 border border-white/10 text-white p-3.5 pr-10 rounded-lg outline-none font-mono text-sm transition-all shadow-inner focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 placeholder-slate-600"
//                         value={transactionPassword} 
//                         onChange={e => setTransactionPassword(e.target.value)} 
//                         disabled={isLeader || isSetupUser} 
//                       />
//                       <button 
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
//                       >
//                         {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                       </button>
//                   </div>
//               </div>

//             </div>

//             {/* 🟢 ACTION BUTTONS */}
//             <div className="p-4 border-t border-white/5 bg-black/20 z-10 shrink-0">
//               {isLeader || isSetupUser ? (
//                  <button 
//                    onClick={onClose} 
//                    className="w-full py-3.5 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-slate-400 transition-colors shadow-sm uppercase tracking-wider border border-white/10"
//                  >
//                     Close Interface
//                  </button>
//               ) : (
//                  <div className="flex gap-3">
//                    <button 
//                      onClick={onClose} 
//                      className="w-1/3 py-3.5 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-slate-400 transition-colors shadow-sm uppercase tracking-wider border border-white/10 active:scale-95"
//                    >
//                       Abort
//                    </button>
//                    <button 
//                      onClick={handleCredit} 
//                      disabled={loading} 
//                      className={`w-2/3 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
//                        loading
//                          ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' 
//                          : 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] text-white shadow-lg active:scale-95'
//                      }`}
//                    >
//                      {loading ? <><Activity size={16} className="animate-pulse" /> PROCESSING...</> : "CREDIT TO VAULT"}
//                    </button>
//                  </div>
//               )}
//             </div>

//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default CreditToWalletModal;

import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios"; 
import SuccessModal from "./SuccessModal";
import MessageModal from "./MessageModal";
import { useAuth } from "../../context/AuthContext";
import { Wallet, Zap, Lock, X, Eye, EyeOff, Activity, Info, RefreshCcw, ArrowRightLeft } from "lucide-react"; 

const CreditToWalletModal = ({ userId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
  const [balances, setBalances] = useState({
    walletBalance: 0, 
    direct: 0, 
    level: 0, 
    roi: 0, 
    isUserToppedUp: false
  });
  
  const [transfer, setTransfer] = useState({ amount: "" });
  
  const [transactionPassword, setTransactionPassword] = useState("");
  
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState({ userId: "", userName: "", amount: 0, source: "" });
  const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

  const { user: loggedInUser, token } = useAuth();
  const isLeader = loggedInUser?.role === "leader" || loggedInUser?.role === "superleader";

  const showMessage = (title, message, type = "error") =>
    setMessageModal({ open: true, title, message, type });

  // 🔹 Fetch Balances from same route
  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/wallet/withdrawable/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data) {
        setBalances({
          walletBalance: Number(res.data.walletBalance) || 0,
          direct: Number(res.data.direct) || 0, 
          level: Number(res.data.level) || 0,
          roi: Number(res.data.roi) || 0,
          isUserToppedUp: res.data.isUserToppedUp || false
        });
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalWorkingBalance = balances.direct + balances.level + balances.roi;
  const transferAmt = Number(transfer.amount) || 0;
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setTransfer({ amount: value });
    }
  };

  // 🔹 Proceed Transfer Logic
  const proceedTransfer = async () => {
    if (isLeader) return showMessage("Action Denied", "System roles cannot perform internal transfers here.");
    if (!balances.isUserToppedUp) return showMessage("Access Denied", "An active package upgrade is required.");
    
    if (transferAmt === 0) return showMessage("Invalid Request", "Enter an amount to transfer.");
    if (transferAmt < 1) return showMessage("Limit Error", "Minimum transfer amount is $1.");
    if (transferAmt > totalWorkingBalance) return showMessage("Insufficient Funds", "Not enough income balance available.");
    if (!transactionPassword.trim()) return showMessage("Security Alert", "Enter your Tx-PIN.");

    // Smart Deduction Logic (Direct -> Level -> ROI)
    let remainingToDeduct = transferAmt;
    let details = { direct: 0, level: 0, roi: 0 };
    let successMessages = [];

    if (balances.direct > 0 && remainingToDeduct > 0) {
        let deduct = Math.min(balances.direct, remainingToDeduct);
        details.direct = deduct;
        remainingToDeduct -= deduct;
        successMessages.push("Direct");
    }
    if (balances.level > 0 && remainingToDeduct > 0) {
        let deduct = Math.min(balances.level, remainingToDeduct);
        details.level = deduct;
        remainingToDeduct -= deduct;
        successMessages.push("Level");
    }
    if (balances.roi > 0 && remainingToDeduct > 0) {
        let deduct = Math.min(balances.roi, remainingToDeduct);
        details.roi = deduct;
        remainingToDeduct -= deduct;
        successMessages.push("ROI");
    }

    try {
      setLoading(true);

      await api.post('/wallet/credit-wallet', {
        amount: transferAmt, 
        transactionPassword, 
        details 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setSuccessData({ 
        userId: userId, 
        userName: loggedInUser?.name || "", 
        amount: transferAmt, 
        source: successMessages.join(" + ") 
      });
      
      setSuccessOpen(true);
      setTransfer({ amount: "" }); 
      setTransactionPassword("");
      await fetchData();

    } catch (err) {
      let errorMsg = err.response?.data?.message || err.message || "Fund transfer failed.";
      showMessage("Transfer Failed", errorMsg);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <>
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(168,85,247,0.3) transparent; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 10px; }
      `}</style>

      {successOpen && (
        <SuccessModal 
           isOpen={successOpen} onClose={() => { setSuccessOpen(false); onClose(); }} 
           type="transfer" userId={successData.userId} userName={successData.userName} 
           amount={successData.amount} source={successData.source} 
        />
      )}

      {messageModal.open && (
         <MessageModal 
            isOpen={messageModal.open} title={messageModal.title} 
            message={<div className="font-sans whitespace-pre-wrap text-[12px] text-center text-slate-300">{messageModal.message}</div>} 
            type={messageModal.type} onClose={() => setMessageModal({ ...messageModal, open: false })} 
         />
      )}

      {!successOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex justify-center items-center p-4 overflow-hidden animate-in fade-in duration-300">
          <div className="bg-[#0a0f1e] w-full max-w-sm rounded-[28px] border border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] flex flex-col max-h-[92vh] relative overflow-hidden animate-in zoom-in-95 duration-300">
            <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all border border-white/10 active:scale-95">
              <X size={16} className="text-slate-300" strokeWidth={2.5} />
            </button>

          <div className="overflow-y-auto custom-scroll flex-1">
          {/* Header Theme - Purple/Fuchsia to differentiate from Withdrawal */}
          <div className="px-6 pt-7 pb-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[60px] pointer-events-none rounded-full"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-fuchsia-500/20 blur-[50px] pointer-events-none rounded-full"></div>
            <div className="relative z-10 text-center">
              <h1 className="text-white text-2xl font-black tracking-tight mb-1">Fund Transfer</h1>
              <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mt-1">Move to Deposit Wallet</p>
            </div>
          </div>

          <div className="px-5 pb-6 space-y-4 relative z-10">
            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-2xl shadow-inner">
                    <p className="text-purple-400/80 text-[9px] font-bold uppercase tracking-widest mb-1 text-center">Available Income</p>
                    <h3 className="text-lg text-center font-black text-white font-mono">${totalWorkingBalance.toFixed(2)}</h3>
                </div>
                {/* <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl shadow-inner">
                    <p className="text-amber-400/80 text-[9px] font-bold uppercase tracking-widest mb-1 text-center">Deposit Wallet</p>
                    <h3 className="text-lg text-center font-black text-amber-400 font-mono">${balances.walletBalance.toFixed(2)}</h3>
                </div> */}
            </div>

            {/* Input Box */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 shadow-inner transition-all group focus-within:border-purple-500/50 hover:border-purple-500/30">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <ArrowRightLeft size={14} className="text-amber-400" /> Enter Amount
                </h3>
              </div>
              <div className="flex items-center bg-black/40 border border-white/5 rounded-xl px-3 py-2 shadow-inner">
                  <span className="text-amber-400 font-black text-sm pr-1">$</span>
                  <input 
                      type="number" placeholder="0.00" 
                      className="w-full bg-transparent border-none text-white text-base font-black font-mono outline-none placeholder-slate-600 disabled:opacity-50"
                      value={transfer.amount} onChange={handleInputChange} disabled={isLeader} 
                  />
                  {!isLeader && (
                      <button onClick={() => setTransfer({ amount: Math.floor(totalWorkingBalance) })} className="text-[9px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 active:scale-95 transition-all ml-2">Max</button>
                  )}
              </div>
            </div>

            {/* Summary */}
            <div className={`border rounded-2xl p-4 transition-all duration-300 ${transferAmt > 0 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10'}`}>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-white/10 pb-2 mb-3 flex items-center gap-1.5">
                    <Info size={12} /> Transfer Summary
                </h4>
                <div className="space-y-2 text-xs font-medium">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Total Requested:</span>
                        <span className="text-white font-mono">${transferAmt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2">
                        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Will be added to Deposit:</span>
                        <span className="text-emerald-400 font-black text-sm font-mono">+ ${transferAmt.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* TXN PIN */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5 mt-2 uppercase tracking-wider">Transaction PIN</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"} placeholder="Enter Secure PIN"
                  value={transactionPassword} onChange={(e) => setTransactionPassword(e.target.value)} disabled={isLeader}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-white focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all font-mono font-bold tracking-widest placeholder-slate-500 text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors focus:outline-none">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={proceedTransfer} 
              disabled={loading || isLeader}
              className={`w-full mt-2 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                loading || isLeader
                  ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
                  : "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-[0_10px_30px_-8px_rgba(168,85,247,0.5)] hover:brightness-110"
              }`}
            >
              {loading ? <><Activity size={18} className="animate-pulse" /> Processing...</> : <><RefreshCcw size={18} strokeWidth={2.5} /> Transfer Now</>}
            </button>
          </div>
        </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreditToWalletModal;