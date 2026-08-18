// // // // import React, { useState, useEffect, useCallback, useMemo } from "react";
// // // // import api from "../../api/axios"; 
// // // // import SuccessModal from "./SuccessModal";
// // // // import MessageModal from "./MessageModal";
// // // // import { useAuth } from "../../context/AuthContext";
// // // // import { Wallet, Zap, Users, Lock, Trophy, X, UserCog, Eye, EyeOff, AlertTriangle, CheckCircle2, Layers, ShieldCheck, Activity, ArrowRightLeft } from "lucide-react"; 
// // // // import { Link } from "react-router-dom"; 

// // // // const WithdrawalModal = ({ userId, onClose }) => {
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [showPassword, setShowPassword] = useState(false); 
  
// // // //   const [balances, setBalances] = useState({
// // // //     walletBalance: 0, 
// // // //     direct: 0, 
// // // //     level: 0, 
// // // //     reward: 0, 
// // // //     pool: 0, 
// // // //     getPass: 0, 
// // // //     upgradeBounceBack: 0, 
// // // //     isUserToppedUp: false
// // // //   });
  
// // // //   const [withdrawals, setWithdrawals] = useState({
// // // //     direct: "", 
// // // //     level: "", 
// // // //     reward: "",
// // // //     pool: "", 
// // // //     getPass: "",
// // // //     upgradeBounceBack: ""
// // // //   });
  
// // // //   const [transactionPassword, setTransactionPassword] = useState("");
// // // //   const [walletAddress, setWalletAddress] = useState(""); 
// // // //   const [isAddressMissing, setIsAddressMissing] = useState(false);
  
// // // //   const [confirmData, setConfirmData] = useState(null);
  
// // // //   const [successOpen, setSuccessOpen] = useState(false);
// // // //   const [successData, setSuccessData] = useState({ userId: "", userName: "", amount: 0, source: "" });
// // // //   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

// // // //   const { user: loggedInUser, token } = useAuth();
// // // //   const isPromo = loggedInUser?.role === "promo";
// // // //   const isLeader = loggedInUser?.role === "leader" || loggedInUser?.role === "superleader";
// // // //   const isSetupUser = loggedInUser?.role === "setup" || loggedInUser?.role === "super_setup";

// // // //   const showMessage = (title, message, type = "error") =>
// // // //     setMessageModal({ open: true, title, message, type });

// // // //   const fetchData = useCallback(async () => {
// // // //     try {
// // // //       const res = await api.get(`/wallet/withdrawable/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
// // // //       const profileRes = await api.get(`/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });

// // // //       if (res.data) {
// // // //         setBalances({
// // // //           walletBalance: Number(res.data.walletBalance) || 0,
// // // //           direct: Number(res.data.direct) || 0, 
// // // //           level: Number(res.data.level) || 0,
// // // //           reward: Number(res.data.reward) || 0,
// // // //           pool: Number(res.data.pool) || 0,
// // // //           getPass: Number(res.data.getPass) || 0,
// // // //           upgradeBounceBack: Number(res.data.upgradeBounceBack) || 0,
// // // //           isUserToppedUp: res.data.isUserToppedUp || false
// // // //         });
// // // //       }

// // // //       const u = profileRes.data?.user || profileRes.data;

// // // //       if (u) {
// // // //         const addr = (u.walletAddress || "").trim();
// // // //         setWalletAddress(addr);
// // // //         setIsAddressMissing(!addr);
// // // //       }
// // // //     } catch (err) {
// // // //       console.error("Fetch Error:", err);
// // // //     }
// // // //   }, [userId, token]);

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, [fetchData]);

// // // //   const totalAvailableToWithdraw = 
// // // //     balances.direct + balances.level + balances.reward + balances.pool + balances.getPass + balances.upgradeBounceBack;
  
// // // //   const hasMainIncome = totalAvailableToWithdraw > 0;

// // // //   const totalEnteredAmount = useMemo(() => {
// // // //     let sum = 0;
// // // //     Object.values(withdrawals).forEach(val => {
// // // //       sum += Number(val) || 0;
// // // //     });
// // // //     return sum;
// // // //   }, [withdrawals]);

// // // //   const handleInputChange = (e, source) => {
// // // //     const value = e.target.value;
// // // //     if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
// // // //       setWithdrawals((prev) => ({ ...prev, [source]: value }));
// // // //     }
// // // //   };

// // // //   const proceedWithdrawal = async () => {
// // // //     if (isLeader || isSetupUser) return showMessage("Action Denied", "System roles cannot withdraw funds directly from here.");
// // // //     if (!balances.isUserToppedUp && !isPromo) return showMessage("UserID Inactive", "You must initialize your UserID to withdraw funds.");
// // // //     if (!walletAddress.trim() && isAddressMissing && !isPromo) return showMessage("Address Missing", "Please configure your BEP-20 withdrawal address in your Profile.");

// // // //     let items = [];
// // // //     let totalRequested = 0;
// // // //     let successMessages = [];

// // // //     const checkAndPush = (sourceName, inputVal, availableBal, displayName) => {
// // // //         const amt = Number(inputVal);
// // // //         if (amt > 0) {
// // // //             if (!isPromo && amt > availableBal) throw new Error(`Insufficient funds in ${displayName}.`);
// // // //             items.push({ source: sourceName, amount: amt });
// // // //             totalRequested += amt;
// // // //             successMessages.push(displayName);
// // // //         }
// // // //     };

// // // //     try {
// // // //       checkAndPush("direct", withdrawals.direct, balances.direct, "Direct Earning");
// // // //       checkAndPush("level", withdrawals.level, balances.level, "Level Earning");
// // // //       checkAndPush("pool", withdrawals.pool, balances.pool, "Crowd Donation");
// // // //       checkAndPush("getPass", withdrawals.getPass, balances.getPass, "Get pass Earning");
// // // //       checkAndPush("upgradeBounceBack", withdrawals.upgradeBounceBack, balances.upgradeBounceBack, "Upgrade Bounce Back Earning");

// // // //       if (totalRequested === 0) return showMessage("Invalid Request", "Enter an amount to withdraw.");
// // // //       if (totalRequested % 10 !== 0) return showMessage("Invalid Format", `Withdrawal must be in multiples of $10. Your total is $${totalRequested}.`);
// // // //       if (!isPromo && totalRequested < 10) return showMessage("Limit Error", "Minimum withdrawal threshold is $10.");
// // // //       if (!transactionPassword.trim()) return showMessage("Security Alert", "Enter your Tx-PIN.");

// // // //       setLoading(true);
// // // //       const endpoint = isPromo ? "/wallet/promo-withdraw" : "/wallet/withdraw";

// // // //       const response = await api.post(endpoint, {
// // // //         transactionPassword, items, dryRun: false 
// // // //       }, { headers: { Authorization: `Bearer ${token}` } });
      
// // // //       const finalUserId = (isPromo && response.data.generatedId) ? response.data.generatedId : userId;
// // // //       const finalUserName = isPromo ? (response.data.name || "Test UserID") : (loggedInUser?.name || "");

// // // //       setSuccessData({ 
// // // //         userId: finalUserId, 
// // // //         userName: finalUserName, 
// // // //         amount: totalRequested, 
// // // //         source: [...new Set(successMessages)].join(", ") 
// // // //       });
      
// // // //       setConfirmData(null);
// // // //       setSuccessOpen(true);
// // // //       setWithdrawals({ direct: "", level: "", reward: "", pool: "", getPass: "", upgradeBounceBack: "" }); 
// // // //       setTransactionPassword("");
// // // //       await fetchData();

// // // //     } catch (err) {
// // // //       console.error(err);
// // // //       let errorMsg = err.message || "Withdrawal failed due to a contract error.";
// // // //       if (err.response && err.response.data && err.response.data.message) errorMsg = err.response.data.message;
// // // //       else if (err.response?.status === 403) errorMsg = "Invalid Transaction PIN";
      
// // // //       showMessage("Validation Failed", errorMsg);
// // // //     } finally {
// // // //       setLoading(false); 
// // // //     }
// // // //   };

// // // //   const renderInputRow = (label, icon, iconColor, balance, stateKey) => (
// // // //     <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 shadow-inner hover:border-cyan-500/30 transition-all focus-within:border-cyan-500/50 group">
// // // //       <div className="flex justify-between items-center mb-2">
// // // //         <h3 className="text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
// // // //             {icon} {label}
// // // //         </h3>
// // // //         <span className={`text-[11px] font-mono font-bold ${iconColor}`}>
// // // //            Available: ${Number(balance).toFixed(2)}
// // // //         </span>
// // // //       </div>
// // // //       <div className="flex items-center bg-black/40 border border-white/5 rounded-xl px-3 py-2 shadow-inner">
// // // //           <span className={`${iconColor} font-black text-sm pr-1`}>$</span>
         
// // // //           <input 
// // // //               type="number" 
// // // //               placeholder="0.00" 
// // // //               className="w-full bg-transparent border-none text-white text-base font-black font-mono outline-none placeholder-slate-600 disabled:opacity-50"
// // // //               value={withdrawals[stateKey] || ""} 
// // // //               onChange={e => handleInputChange(e, stateKey)} 
// // // //               disabled={isLeader || isSetupUser} 
// // // //           />
// // // //           {(!isLeader && !isSetupUser) && (
// // // //               <button 
// // // //                 onClick={() => setWithdrawals((prev) => ({ ...prev, [stateKey]: Math.floor(balance) }))}
// // // //                 className="text-[9px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20 active:scale-95 transition-all ml-2"
// // // //               >
// // // //                  Max
// // // //               </button>
// // // //           )}
// // // //       </div>
// // // //     </div>
// // // //   );

// // // //   return (
// // // //     <>
// // // //       <style>{`
// // // //         input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
// // // //         input[type=number] { -moz-appearance: textfield; }
// // // //         .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(34,211,238,0.3) transparent; }
// // // //         .custom-scroll::-webkit-scrollbar { width: 4px; }
// // // //         .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 10px; }
// // // //       `}</style>

// // // //       {successOpen && (
// // // //         <SuccessModal 
// // // //            isOpen={successOpen} 
// // // //            onClose={() => { setSuccessOpen(false); onClose(); }} 
// // // //            type="withdrawal" 
// // // //            userId={successData.userId} 
// // // //            userName={successData.userName} 
// // // //            amount={successData.amount} 
// // // //            source={successData.source} 
// // // //         />
// // // //       )}

// // // //       {messageModal.open && (
// // // //          <MessageModal 
// // // //             isOpen={messageModal.open} 
// // // //             title={messageModal.title} 
// // // //             message={<div className="font-sans whitespace-pre-wrap text-[12px] text-center text-slate-300">{messageModal.message}</div>} 
// // // //             type={messageModal.type} 
// // // //             onClose={() => setMessageModal({ ...messageModal, open: false })} 
// // // //          />
// // // //       )}

// // // //       {!successOpen && (
// // // //         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-4 overflow-hidden animate-in fade-in duration-300">
          
// // // //           <div className="bg-[#0a0f1e] w-full max-w-sm rounded-[28px] border border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] flex flex-col max-h-[92vh] relative overflow-hidden animate-in zoom-in-95 duration-300">
            
// // // //             <button
// // // //               onClick={() => confirmData ? setConfirmData(null) : onClose()}
// // // //               className="absolute top-4 right-4 z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all border border-white/10 active:scale-95"
// // // //             >
// // // //               <X size={16} className="text-slate-300" strokeWidth={2.5} />
// // // //             </button>

// // // //           <div className="overflow-y-auto custom-scroll flex-1">

// // // //   {/* Hero header */}
// // // //   <div className="px-6 pt-7 pb-5 relative overflow-hidden">
// // // //     <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 blur-[60px] pointer-events-none rounded-full"></div>
// // // //     <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/20 blur-[50px] pointer-events-none rounded-full"></div>

// // // //     <div className="relative z-10">
// // // //       <h1 className="text-white text-2xl font-black tracking-tight mb-1">
// // // //         Withdraw Assets
// // // //       </h1>
      
// // // //     </div>
// // // //   </div>

// // // //   {/* 🔥 DIRECT WITHDRAWAL INPUT SCREEN */}
// // // //   <div className="px-5 pb-6 space-y-4 relative z-10">
    
// // // //     {/* Total Yield Box */}
// // // //     <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-inner">
// // // //         <div className="text-right w-full">
// // // //           <p className="text-cyan-400/80 text-[10px] font-bold uppercase tracking-widest mb-1 text-center">Total Available Balance</p>
// // // //           <h3 className="text-3xl text-center font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] font-mono">${totalAvailableToWithdraw.toFixed(2)}</h3>
// // // //         </div>
// // // //     </div>

// // // //     {/* Warning Address Box */}
// // // //     {isAddressMissing && !isPromo ? (
// // // //       <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
// // // //         <p className="text-[11px] text-rose-300 font-bold leading-relaxed mb-3">
// // // //           External Wallet not found! Please update BEP-20 address first.
// // // //         </p>
// // // //         <Link 
// // // //           to="/profile" 
// // // //           onClick={onClose}
// // // //           className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(244,63,94,0.3)] w-full justify-center"
// // // //         >
// // // //           <UserCog size={14} /> Update Your Usdt Bep-20 Address
// // // //         </Link>
// // // //       </div>
// // // //     ) : (
// // // //       <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col shadow-sm">
// // // //         <p className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldCheck size={12}/> Linked BEP-20</p>
// // // //         <p className="text-[11px] font-mono text-emerald-300 font-black truncate">{isPromo ? "Dummy Network Active" : walletAddress}</p>
// // // //       </div>
// // // //     )}

// // // //     {/* MAIN INCOMES */}
// // // //     {(hasMainIncome || isPromo) && (
// // // //         <div className="flex flex-col gap-3">
// // // //           {renderInputRow("Direct Earning", <Zap size={14} className="text-amber-400" />, "text-amber-400", balances.direct, "direct")}
// // // //           {renderInputRow("Level Earning", <Users size={14} className="text-cyan-400" />, "text-cyan-400", balances.level, "level")}
// // // //           {renderInputRow("Crowd Donation", <Layers size={14} className="text-emerald-400" />, "text-emerald-400", balances.pool, "pool")}
// // // //            </div>
// // // //     )}

// // // //     {/* Gross Total Box */}
// // // //     <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between mt-2 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
// // // //         <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest m-0">Total Selection</p>
// // // //         <h3 className="text-xl font-black text-indigo-400 m-0 font-mono">${totalEnteredAmount.toFixed(2)}</h3>
// // // //     </div>

// // // //     {/* Tx PIN */}
// // // //     <div>
// // // //       <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5 mt-2 uppercase tracking-wider">Transaction PIN</label>
// // // //       <div className="relative group">
// // // //         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
// // // //           <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
// // // //         </div>
// // // //         <input
// // // //           type={showPassword ? "text" : "password"}
// // // //           placeholder="Enter Secure PIN"
// // // //           value={transactionPassword}
// // // //           autoComplete="new-password"
// // // //           onChange={(e) => setTransactionPassword(e.target.value)}
// // // //           disabled={isLeader || isSetupUser}
// // // //           className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-white focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all font-mono font-bold tracking-widest placeholder-slate-500 text-sm"
// // // //         />
// // // //         <button 
// // // //           type="button"
// // // //           onClick={() => setShowPassword(!showPassword)}
// // // //           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
// // // //         >
// // // //           {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
// // // //         </button>
// // // //       </div>
// // // //     </div>

// // // //     {/* CTA BUTTON */}
// // // //     <button
// // // //       onClick={proceedWithdrawal} 
// // // //       disabled={loading || (isLeader || isSetupUser)}
// // // //       className={`w-full mt-2 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
// // // //         loading || (isLeader || isSetupUser)
// // // //           ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
// // // //           : "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-[0_10px_30px_-8px_rgba(34,211,238,0.5)] hover:brightness-110"
// // // //       }`}
// // // //     >
// // // //       {loading ? (
// // // //         <>
// // // //           <Activity size={18} className="animate-pulse" /> Processing...
// // // //         </>
// // // //       ) : (
// // // //         <>
// // // //           <Zap size={18} strokeWidth={2.5} /> Withdraw Now
// // // //         </>
// // // //       )}
// // // //     </button>

// // // //   </div>
// // // // </div>
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </>
// // // //   );
// // // // };

// // // // export default WithdrawalModal;

































// // // import React, { useState, useEffect, useCallback, useMemo } from "react";
// // // import api from "../../api/axios"; 
// // // import SuccessModal from "./SuccessModal";
// // // import MessageModal from "./MessageModal";
// // // import { useAuth } from "../../context/AuthContext";
// // // import { Wallet, Zap, Users, Lock, X, UserCog, Eye, EyeOff, ShieldCheck, Activity, Layers, AlertCircle, Info } from "lucide-react"; 
// // // import { Link } from "react-router-dom"; 

// // // const WithdrawalModal = ({ userId, onClose }) => {
// // //   const [loading, setLoading] = useState(false);
// // //   const [showPassword, setShowPassword] = useState(false); 
  
// // //   const [balances, setBalances] = useState({
// // //     walletBalance: 0, // 🔥 50% Deduction ke liye Top-up Wallet
// // //     direct: 0, 
// // //     level: 0, 
// // //     reward: 0, 
// // //     pool: 0, // 🔥 Isme Ab Pool + ROI dono merged aayenge backend se
// // //     getPass: 0, 
// // //     upgradeBounceBack: 0, 
// // //     isUserToppedUp: false
// // //   });
  
// // //   const [withdrawals, setWithdrawals] = useState({
// // //     direct: "", 
// // //     level: "", 
// // //     reward: "",
// // //     pool: "", 
// // //     getPass: "",
// // //     upgradeBounceBack: ""
// // //   });
  
// // //   const [transactionPassword, setTransactionPassword] = useState("");
// // //   const [walletAddress, setWalletAddress] = useState(""); 
// // //   const [isAddressMissing, setIsAddressMissing] = useState(false);
  
// // //   const [confirmData, setConfirmData] = useState(null);
  
// // //   const [successOpen, setSuccessOpen] = useState(false);
// // //   const [successData, setSuccessData] = useState({ userId: "", userName: "", amount: 0, source: "" });
// // //   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

// // //   const { user: loggedInUser, token } = useAuth();
// // //   const isPromo = loggedInUser?.role === "promo";
// // //   const isLeader = loggedInUser?.role === "leader" || loggedInUser?.role === "superleader";
// // //   const isSetupUser = loggedInUser?.role === "setup" || loggedInUser?.role === "super_setup";

// // //   const showMessage = (title, message, type = "error") =>
// // //     setMessageModal({ open: true, title, message, type });

// // //   const fetchData = useCallback(async () => {
// // //     try {
// // //       const res = await api.get(`/wallet/withdrawable/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
// // //       const profileRes = await api.get(`/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });

// // //       if (res.data) {
// // //         setBalances({
// // //           walletBalance: Number(res.data.walletBalance) || 0,
// // //           direct: Number(res.data.direct) || 0, 
// // //           level: Number(res.data.level) || 0,
// // //           reward: Number(res.data.reward) || 0,
// // //           pool: Number(res.data.pool) || 0,
// // //           getPass: Number(res.data.getPass) || 0,
// // //           upgradeBounceBack: Number(res.data.upgradeBounceBack) || 0,
// // //           isUserToppedUp: res.data.isUserToppedUp || false
// // //         });
// // //       }

// // //       const u = profileRes.data?.user || profileRes.data;

// // //       if (u) {
// // //         const addr = (u.walletAddress || "").trim();
// // //         setWalletAddress(addr);
// // //         setIsAddressMissing(!addr);
// // //       }
// // //     } catch (err) {
// // //       console.error("Fetch Error:", err);
// // //     }
// // //   }, [userId, token]);

// // //   useEffect(() => {
// // //     fetchData();
// // //   }, [fetchData]);

// // //   const totalAvailableToWithdraw = 
// // //     balances.direct + balances.level + balances.reward + balances.pool + balances.getPass + balances.upgradeBounceBack;
  
// // //   const hasMainIncome = totalAvailableToWithdraw > 0;

// // //   // 🔥 LIVE CALCULATIONS
// // //   const totalEnteredAmount = useMemo(() => {
// // //     let sum = 0;
// // //     Object.values(withdrawals).forEach(val => {
// // //       sum += Number(val) || 0;
// // //     });
// // //     return sum;
// // //   }, [withdrawals]);

// // //   const requiredDepositWallet = totalEnteredAmount / 2; // 50% Rule
// // //   const hasEnoughDeposit = balances.walletBalance >= requiredDepositWallet;
// // //   const adminFee = totalEnteredAmount * 0.10; // 10% Fee
// // //   const netPayable = totalEnteredAmount - adminFee;
// // //   const weeklyInstallment = netPayable / 10; // 10 Weeks

// // //   const handleInputChange = (e, source) => {
// // //     const value = e.target.value;
// // //     if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
// // //       setWithdrawals((prev) => ({ ...prev, [source]: value }));
// // //     }
// // //   };

// // //   const proceedWithdrawal = async () => {
// // //     if (isLeader || isSetupUser) return showMessage("Action Denied", "System roles cannot withdraw funds directly from here.");
// // //     if (!balances.isUserToppedUp && !isPromo) return showMessage("UserID Inactive", "You must initialize your UserID to withdraw funds.");
// // //     if (!walletAddress.trim() && isAddressMissing && !isPromo) return showMessage("Address Missing", "Please configure your BEP-20 withdrawal address in your Profile.");

// // //     // 🔥 50% Wallet Check on submit
// // //     if (totalEnteredAmount > 0 && !hasEnoughDeposit) {
// // //         return showMessage("Insufficient Deposit Wallet", `You need 50% ($${requiredDepositWallet.toFixed(2)}) in your Top-up wallet to withdraw $${totalEnteredAmount}.`);
// // //     }

// // //     let items = [];
// // //     let totalRequested = 0;
// // //     let successMessages = [];

// // //     const checkAndPush = (sourceName, inputVal, availableBal, displayName) => {
// // //         const amt = Number(inputVal);
// // //         if (amt > 0) {
// // //             if (!isPromo && amt > availableBal) throw new Error(`Insufficient funds in ${displayName}.`);
// // //             items.push({ source: sourceName, amount: amt });
// // //             totalRequested += amt;
// // //             successMessages.push(displayName);
// // //         }
// // //     };

// // //     try {
// // //       checkAndPush("direct", withdrawals.direct, balances.direct, "Direct Earning");
// // //       checkAndPush("level", withdrawals.level, balances.level, "Level Earning");
// // //       checkAndPush("pool", withdrawals.pool, balances.pool, "Crowd Donation");
// // //       checkAndPush("getPass", withdrawals.getPass, balances.getPass, "Get pass Earning");
// // //       checkAndPush("upgradeBounceBack", withdrawals.upgradeBounceBack, balances.upgradeBounceBack, "Upgrade Bounce Back Earning");

// // //       if (totalRequested === 0) return showMessage("Invalid Request", "Enter an amount to withdraw.");
// // //       if (totalRequested % 10 !== 0) return showMessage("Invalid Format", `Withdrawal must be in multiples of $10. Your total is $${totalRequested}.`);
// // //       if (!isPromo && totalRequested < 10) return showMessage("Limit Error", "Minimum withdrawal threshold is $10.");
// // //       if (!transactionPassword.trim()) return showMessage("Security Alert", "Enter your Tx-PIN.");

// // //       setLoading(true);
// // //       const endpoint = isPromo ? "/wallet/promo-withdraw" : "/wallet/withdraw";

// // //       const response = await api.post(endpoint, {
// // //         transactionPassword, items, dryRun: false 
// // //       }, { headers: { Authorization: `Bearer ${token}` } });
      
// // //       const finalUserId = (isPromo && response.data.generatedId) ? response.data.generatedId : userId;
// // //       const finalUserName = isPromo ? (response.data.name || "Test UserID") : (loggedInUser?.name || "");

// // //       setSuccessData({ 
// // //         userId: finalUserId, 
// // //         userName: finalUserName, 
// // //         amount: totalRequested, 
// // //         source: [...new Set(successMessages)].join(", ") 
// // //       });
      
// // //       setConfirmData(null);
// // //       setSuccessOpen(true);
// // //       setWithdrawals({ direct: "", level: "", reward: "", pool: "", getPass: "", upgradeBounceBack: "" }); 
// // //       setTransactionPassword("");
// // //       await fetchData();

// // //     } catch (err) {
// // //       console.error(err);
// // //       let errorMsg = err.message || "Withdrawal failed due to a contract error.";
// // //       if (err.response && err.response.data && err.response.data.message) errorMsg = err.response.data.message;
// // //       else if (err.response?.status === 403) errorMsg = "Invalid Transaction PIN";
      
// // //       showMessage("Validation Failed", errorMsg);
// // //     } finally {
// // //       setLoading(false); 
// // //     }
// // //   };

// // //   const renderInputRow = (label, icon, iconColor, balance, stateKey) => (
// // //     <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 shadow-inner hover:border-cyan-500/30 transition-all focus-within:border-cyan-500/50 group">
// // //       <div className="flex justify-between items-center mb-2">
// // //         <h3 className="text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
// // //             {icon} {label}
// // //         </h3>
// // //         <span className={`text-[11px] font-mono font-bold ${iconColor}`}>
// // //            Available: ${Number(balance).toFixed(2)}
// // //         </span>
// // //       </div>
// // //       <div className="flex items-center bg-black/40 border border-white/5 rounded-xl px-3 py-2 shadow-inner">
// // //           <span className={`${iconColor} font-black text-sm pr-1`}>$</span>
         
// // //           <input 
// // //               type="number" 
// // //               placeholder="0.00" 
// // //               className="w-full bg-transparent border-none text-white text-base font-black font-mono outline-none placeholder-slate-600 disabled:opacity-50"
// // //               value={withdrawals[stateKey] || ""} 
// // //               onChange={e => handleInputChange(e, stateKey)} 
// // //               disabled={isLeader || isSetupUser} 
// // //           />
// // //           {(!isLeader && !isSetupUser) && (
// // //               <button 
// // //                 onClick={() => setWithdrawals((prev) => ({ ...prev, [stateKey]: Math.floor(balance) }))}
// // //                 className="text-[9px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20 active:scale-95 transition-all ml-2"
// // //               >
// // //                  Max
// // //               </button>
// // //           )}
// // //       </div>
// // //     </div>
// // //   );

// // //   return (
// // //     <>
// // //       <style>{`
// // //         input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
// // //         input[type=number] { -moz-appearance: textfield; }
// // //         .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(34,211,238,0.3) transparent; }
// // //         .custom-scroll::-webkit-scrollbar { width: 4px; }
// // //         .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 10px; }
// // //       `}</style>

// // //       {successOpen && (
// // //         <SuccessModal 
// // //            isOpen={successOpen} 
// // //            onClose={() => { setSuccessOpen(false); onClose(); }} 
// // //            type="withdrawal" 
// // //            userId={successData.userId} 
// // //            userName={successData.userName} 
// // //            amount={successData.amount} 
// // //            source={successData.source} 
// // //         />
// // //       )}

// // //       {messageModal.open && (
// // //          <MessageModal 
// // //             isOpen={messageModal.open} 
// // //             title={messageModal.title} 
// // //             message={<div className="font-sans whitespace-pre-wrap text-[12px] text-center text-slate-300">{messageModal.message}</div>} 
// // //             type={messageModal.type} 
// // //             onClose={() => setMessageModal({ ...messageModal, open: false })} 
// // //          />
// // //       )}

// // //       {!successOpen && (
// // //         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-4 overflow-hidden animate-in fade-in duration-300">
          
// // //           <div className="bg-[#0a0f1e] w-full max-w-sm rounded-[28px] border border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] flex flex-col max-h-[92vh] relative overflow-hidden animate-in zoom-in-95 duration-300">
            
// // //             <button
// // //               onClick={() => confirmData ? setConfirmData(null) : onClose()}
// // //               className="absolute top-4 right-4 z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all border border-white/10 active:scale-95"
// // //             >
// // //               <X size={16} className="text-slate-300" strokeWidth={2.5} />
// // //             </button>

// // //           <div className="overflow-y-auto custom-scroll flex-1">

// // //   {/* Hero header */}
// // //   <div className="px-6 pt-7 pb-4 relative overflow-hidden">
// // //     <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 blur-[60px] pointer-events-none rounded-full"></div>
// // //     <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/20 blur-[50px] pointer-events-none rounded-full"></div>

// // //     <div className="relative z-10 text-center">
// // //       <h1 className="text-white text-2xl font-black tracking-tight mb-1">
// // //         Withdraw Assets
// // //       </h1>
// // //       <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mt-1">
// // //         10-Week Distribution Plan
// // //       </p>
// // //     </div>
// // //   </div>

// // //   {/* 🔥 DIRECT WITHDRAWAL INPUT SCREEN */}
// // //   <div className="px-5 pb-6 space-y-4 relative z-10">
    
// // //     {/* Balances Overview */}
// // //     <div className="grid grid-cols-2 gap-3">
// // //         <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-2xl shadow-inner">
// // //             <p className="text-cyan-400/80 text-[9px] font-bold uppercase tracking-widest mb-1 text-center">Earning Balance</p>
// // //             <h3 className="text-lg text-center font-black text-white font-mono">${totalAvailableToWithdraw.toFixed(2)}</h3>
// // //         </div>
// // //         <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl shadow-inner relative overflow-hidden">
// // //             <p className="text-amber-400/80 text-[9px] font-bold uppercase tracking-widest mb-1 text-center">Deposit Wallet</p>
// // //             <h3 className="text-lg text-center font-black text-amber-400 font-mono">${balances.walletBalance.toFixed(2)}</h3>
// // //         </div>
// // //     </div>

// // //     {/* Warning Address Box */}
// // //     {isAddressMissing && !isPromo ? (
// // //       <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
// // //         <p className="text-[11px] text-rose-300 font-bold leading-relaxed mb-3">
// // //           External Wallet not found! Please update BEP-20 address first.
// // //         </p>
// // //         <Link 
// // //           to="/profile" 
// // //           onClick={onClose}
// // //           className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(244,63,94,0.3)] w-full justify-center"
// // //         >
// // //           <UserCog size={14} /> Update Your Usdt Bep-20 Address
// // //         </Link>
// // //       </div>
// // //     ) : (
// // //       <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col shadow-sm">
// // //         <p className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldCheck size={12}/> Linked BEP-20</p>
// // //         <p className="text-[11px] font-mono text-emerald-300 font-black truncate">{isPromo ? "Dummy Network Active" : walletAddress}</p>
// // //       </div>
// // //     )}

// // //     {/* MAIN INCOMES */}
// // //     {(hasMainIncome || isPromo) && (
// // //         <div className="flex flex-col gap-3">
// // //           {renderInputRow("Direct Earning", <Zap size={14} className="text-amber-400" />, "text-amber-400", balances.direct, "direct")}
// // //           {renderInputRow("Level Earning", <Users size={14} className="text-cyan-400" />, "text-cyan-400", balances.level, "level")}
// // //           {renderInputRow("Crowd Donation Earning", <Layers size={14} className="text-emerald-400" />, "text-emerald-400", balances.pool, "pool")}
// // //            </div>
// // //     )}

// // //     {/* 🔥 LIVE CALCULATION & SUMMARY BOX (NEW LOGIC) 🔥 */}
// // //     <div className={`border rounded-2xl p-4 transition-all duration-300 ${totalEnteredAmount > 0 ? (hasEnoughDeposit ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-rose-500/10 border-rose-500/30') : 'bg-white/5 border-white/10'}`}>
        
// // //         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-white/10 pb-2 mb-3 flex items-center gap-1.5">
// // //             <Info size={12} /> Withdrawal Summary
// // //         </h4>

// // //         <div className="space-y-2 text-xs font-medium">
// // //             <div className="flex justify-between">
// // //                 <span className="text-slate-400">Total Requested:</span>
// // //                 <span className="text-white font-mono">${totalEnteredAmount.toFixed(2)}</span>
// // //             </div>
            
// // //             <div className="flex justify-between items-center">
// // //                 <span className="text-slate-400">Top-up Wallet Required (50%):</span>
// // //                 <span className={`font-mono font-bold px-2 py-0.5 rounded ${hasEnoughDeposit || totalEnteredAmount === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400 animate-pulse'}`}>
// // //                     -${requiredDepositWallet.toFixed(2)}
// // //                 </span>
// // //             </div>

// // //             <div className="flex justify-between text-rose-400/80">
              
// // //             </div>
            
// // //             <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
// // //                 <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Net Payable:</span>
// // //                 <span className="text-emerald-400 font-black text-sm font-mono">${netPayable.toFixed(2)}</span>
// // //             </div>

// // //             {totalEnteredAmount > 0 && (
// // //                 <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2.5 mt-3 text-center">
// // //                     <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-1">10-Week Distribution</p>
// // //                     <p className="text-white text-xs font-mono font-bold">10 x ${(weeklyInstallment).toFixed(2)} / week</p>
// // //                 </div>
// // //             )}
// // //         </div>
// // //     </div>

// // //     {/* Warning message if balance is low */}
// // //     {totalEnteredAmount > 0 && !hasEnoughDeposit && (
// // //         <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-medium">
// // //             <AlertCircle size={16} className="shrink-0 mt-0.5" />
// // //             <p>You need at least <strong>${requiredDepositWallet.toFixed(2)}</strong> in your Top-up Wallet to process this withdrawal.</p>
// // //         </div>
// // //     )}

// // //     {/* Tx PIN */}
// // //     <div>
// // //       <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5 mt-2 uppercase tracking-wider">Transaction PIN</label>
// // //       <div className="relative group">
// // //         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
// // //           <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
// // //         </div>
// // //         <input
// // //           type={showPassword ? "text" : "password"}
// // //           placeholder="Enter Secure PIN"
// // //           value={transactionPassword}
// // //           autoComplete="new-password"
// // //           onChange={(e) => setTransactionPassword(e.target.value)}
// // //           disabled={isLeader || isSetupUser}
// // //           className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-white focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all font-mono font-bold tracking-widest placeholder-slate-500 text-sm"
// // //         />
// // //         <button 
// // //           type="button"
// // //           onClick={() => setShowPassword(!showPassword)}
// // //           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
// // //         >
// // //           {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
// // //         </button>
// // //       </div>
// // //     </div>

// // //     {/* CTA BUTTON */}
// // //     <button
// // //       onClick={proceedWithdrawal} 
// // //       disabled={loading || (isLeader || isSetupUser) || (totalEnteredAmount > 0 && !hasEnoughDeposit)}
// // //       className={`w-full mt-2 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
// // //         loading || (isLeader || isSetupUser) || (totalEnteredAmount > 0 && !hasEnoughDeposit)
// // //           ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
// // //           : "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-[0_10px_30px_-8px_rgba(34,211,238,0.5)] hover:brightness-110"
// // //       }`}
// // //     >
// // //       {loading ? (
// // //         <>
// // //           <Activity size={18} className="animate-pulse" /> Processing...
// // //         </>
// // //       ) : (
// // //         <>
// // //           <Zap size={18} strokeWidth={2.5} /> Withdraw Now
// // //         </>
// // //       )}
// // //     </button>

// // //   </div>
// // // </div>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </>
// // //   );
// // // };

// // // export default WithdrawalModal;


// // import React, { useState, useEffect, useCallback, useMemo } from "react";
// // import api from "../../api/axios"; 
// // import SuccessModal from "./SuccessModal";
// // import MessageModal from "./MessageModal";
// // import { useAuth } from "../../context/AuthContext";
// // import { Wallet, Zap, Users, Lock, X, UserCog, Eye, EyeOff, ShieldCheck, Activity, Layers, AlertCircle, Info } from "lucide-react"; 
// // import { Link } from "react-router-dom"; 

// // const WithdrawalModal = ({ userId, onClose }) => {
// //   const [loading, setLoading] = useState(false);
// //   const [showPassword, setShowPassword] = useState(false); 
  
// //   const [balances, setBalances] = useState({
// //     walletBalance: 0, // 🔥 50% Deduction ke liye Top-up Wallet
// //     direct: 0, 
// //     level: 0, 
// //     reward: 0, 
// //     pool: 0, // 🔥 Isme Ab Pool + ROI dono merged aayenge backend se
// //     getPass: 0, 
// //     upgradeBounceBack: 0, 
// //     isUserToppedUp: false
// //   });
  
// //   const [withdrawals, setWithdrawals] = useState({
// //     direct: "", 
// //     level: "", 
// //     reward: "",
// //     pool: "", 
// //     getPass: "",
// //     upgradeBounceBack: ""
// //   });
  
// //   const [transactionPassword, setTransactionPassword] = useState("");
// //   const [walletAddress, setWalletAddress] = useState(""); 
// //   const [isAddressMissing, setIsAddressMissing] = useState(false);
  
// //   const [confirmData, setConfirmData] = useState(null);
  
// //   const [successOpen, setSuccessOpen] = useState(false);
// //   const [successData, setSuccessData] = useState({ userId: "", userName: "", amount: 0, source: "" });
// //   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

// //   const { user: loggedInUser, token } = useAuth();
// //   const isPromo = loggedInUser?.role === "promo";
// //   const isLeader = loggedInUser?.role === "leader" || loggedInUser?.role === "superleader";
// //   const isSetupUser = loggedInUser?.role === "setup" || loggedInUser?.role === "super_setup";

// //   const showMessage = (title, message, type = "error") =>
// //     setMessageModal({ open: true, title, message, type });

// //   const fetchData = useCallback(async () => {
// //     try {
// //       const res = await api.get(`/wallet/withdrawable/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
// //       const profileRes = await api.get(`/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });

// //       if (res.data) {
// //         setBalances({
// //           walletBalance: Number(res.data.walletBalance) || 0,
// //           direct: Number(res.data.direct) || 0, 
// //           level: Number(res.data.level) || 0,
// //           reward: Number(res.data.reward) || 0,
// //           pool: Number(res.data.pool) || 0,
// //           getPass: Number(res.data.getPass) || 0,
// //           upgradeBounceBack: Number(res.data.upgradeBounceBack) || 0,
// //           isUserToppedUp: res.data.isUserToppedUp || false
// //         });
// //       }

// //       const u = profileRes.data?.user || profileRes.data;

// //       if (u) {
// //         const addr = (u.walletAddress || "").trim();
// //         setWalletAddress(addr);
// //         setIsAddressMissing(!addr);
// //       }
// //     } catch (err) {
// //       console.error("Fetch Error:", err);
// //     }
// //   }, [userId, token]);

// //   useEffect(() => {
// //     fetchData();
// //   }, [fetchData]);

// //   const totalAvailableToWithdraw = 
// //     balances.direct + balances.level + balances.reward + balances.pool + balances.getPass + balances.upgradeBounceBack;
  
// //   const hasMainIncome = totalAvailableToWithdraw > 0;

// //   // 🔥 LIVE CALCULATIONS
// //   const totalEnteredAmount = useMemo(() => {
// //     let sum = 0;
// //     Object.values(withdrawals).forEach(val => {
// //       sum += Number(val) || 0;
// //     });
// //     return sum;
// //   }, [withdrawals]);

// //   const requiredDepositWallet = totalEnteredAmount / 2; // 50% Rule
// //   const hasEnoughDeposit = balances.walletBalance >= requiredDepositWallet;
  
// //   // 🔥 UI PAR POORA 100% DIKHANE KE LIYE (10% Fee Hide kar di)
// //   const displayNetPayable = totalEnteredAmount; 
// //   const displayWeeklyInstallment = totalEnteredAmount / 10; 

// //   const handleInputChange = (e, source) => {
// //     const value = e.target.value;
// //     if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
// //       setWithdrawals((prev) => ({ ...prev, [source]: value }));
// //     }
// //   };

// //   const proceedWithdrawal = async () => {
// //     if (isLeader || isSetupUser) return showMessage("Action Denied", "System roles cannot withdraw funds directly from here.");
// //     if (!balances.isUserToppedUp && !isPromo) return showMessage("UserID Inactive", "You must initialize your UserID to withdraw funds.");
// //     if (!walletAddress.trim() && isAddressMissing && !isPromo) return showMessage("Address Missing", "Please configure your BEP-20 withdrawal address in your Profile.");

// //     // 🔥 50% Wallet Check on submit
// //     if (totalEnteredAmount > 0 && !hasEnoughDeposit) {
// //         return showMessage("Insufficient Deposit Wallet", `You need 50% ($${requiredDepositWallet.toFixed(2)}) in your Top-up wallet to withdraw $${totalEnteredAmount}.`);
// //     }

// //     let items = [];
// //     let totalRequested = 0;
// //     let successMessages = [];

// //     const checkAndPush = (sourceName, inputVal, availableBal, displayName) => {
// //         const amt = Number(inputVal);
// //         if (amt > 0) {
// //             if (!isPromo && amt > availableBal) throw new Error(`Insufficient funds in ${displayName}.`);
// //             items.push({ source: sourceName, amount: amt });
// //             totalRequested += amt;
// //             successMessages.push(displayName);
// //         }
// //     };

// //     try {
// //       checkAndPush("direct", withdrawals.direct, balances.direct, "Direct Earning");
// //       checkAndPush("level", withdrawals.level, balances.level, "Level Earning");
// //       checkAndPush("pool", withdrawals.pool, balances.pool, "Crowd Donation");
// //       checkAndPush("getPass", withdrawals.getPass, balances.getPass, "Get pass Earning");
// //       checkAndPush("upgradeBounceBack", withdrawals.upgradeBounceBack, balances.upgradeBounceBack, "Upgrade Bounce Back Earning");

// //       if (totalRequested === 0) return showMessage("Invalid Request", "Enter an amount to withdraw.");
// //       if (totalRequested % 10 !== 0) return showMessage("Invalid Format", `Withdrawal must be in multiples of $10. Your total is $${totalRequested}.`);
// //       if (!isPromo && totalRequested < 10) return showMessage("Limit Error", "Minimum withdrawal threshold is $10.");
// //       if (!transactionPassword.trim()) return showMessage("Security Alert", "Enter your Tx-PIN.");

// //       setLoading(true);
// //       const endpoint = isPromo ? "/wallet/promo-withdraw" : "/wallet/withdraw";

// //       const response = await api.post(endpoint, {
// //         transactionPassword, items, dryRun: false 
// //       }, { headers: { Authorization: `Bearer ${token}` } });
      
// //       const finalUserId = (isPromo && response.data.generatedId) ? response.data.generatedId : userId;
// //       const finalUserName = isPromo ? (response.data.name || "Test UserID") : (loggedInUser?.name || "");

// //       setSuccessData({ 
// //         userId: finalUserId, 
// //         userName: finalUserName, 
// //         amount: totalRequested, 
// //         source: [...new Set(successMessages)].join(", ") 
// //       });
      
// //       setConfirmData(null);
// //       setSuccessOpen(true);
// //       setWithdrawals({ direct: "", level: "", reward: "", pool: "", getPass: "", upgradeBounceBack: "" }); 
// //       setTransactionPassword("");
// //       await fetchData();

// //     } catch (err) {
// //       console.error(err);
// //       let errorMsg = err.message || "Withdrawal failed due to a contract error.";
// //       if (err.response && err.response.data && err.response.data.message) errorMsg = err.response.data.message;
// //       else if (err.response?.status === 403) errorMsg = "Invalid Transaction PIN";
      
// //       showMessage("Validation Failed", errorMsg);
// //     } finally {
// //       setLoading(false); 
// //     }
// //   };

// //   const renderInputRow = (label, icon, iconColor, balance, stateKey) => (
// //     <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 shadow-inner hover:border-cyan-500/30 transition-all focus-within:border-cyan-500/50 group">
// //       <div className="flex justify-between items-center mb-2">
// //         <h3 className="text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
// //             {icon} {label}
// //         </h3>
// //         <span className={`text-[11px] font-mono font-bold ${iconColor}`}>
// //            Available: ${Number(balance).toFixed(2)}
// //         </span>
// //       </div>
// //       <div className="flex items-center bg-black/40 border border-white/5 rounded-xl px-3 py-2 shadow-inner">
// //           <span className={`${iconColor} font-black text-sm pr-1`}>$</span>
         
// //           <input 
// //               type="number" 
// //               placeholder="0.00" 
// //               className="w-full bg-transparent border-none text-white text-base font-black font-mono outline-none placeholder-slate-600 disabled:opacity-50"
// //               value={withdrawals[stateKey] || ""} 
// //               onChange={e => handleInputChange(e, stateKey)} 
// //               disabled={isLeader || isSetupUser} 
// //           />
// //           {(!isLeader && !isSetupUser) && (
// //               <button 
// //                 onClick={() => setWithdrawals((prev) => ({ ...prev, [stateKey]: Math.floor(balance) }))}
// //                 className="text-[9px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20 active:scale-95 transition-all ml-2"
// //               >
// //                  Max
// //               </button>
// //           )}
// //       </div>
// //     </div>
// //   );

// //   return (
// //     <>
// //       <style>{`
// //         input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
// //         input[type=number] { -moz-appearance: textfield; }
// //         .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(34,211,238,0.3) transparent; }
// //         .custom-scroll::-webkit-scrollbar { width: 4px; }
// //         .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 10px; }
// //       `}</style>

// //       {successOpen && (
// //         <SuccessModal 
// //            isOpen={successOpen} 
// //            onClose={() => { setSuccessOpen(false); onClose(); }} 
// //            type="withdrawal" 
// //            userId={successData.userId} 
// //            userName={successData.userName} 
// //            amount={successData.amount} 
// //            source={successData.source} 
// //         />
// //       )}

// //       {messageModal.open && (
// //          <MessageModal 
// //             isOpen={messageModal.open} 
// //             title={messageModal.title} 
// //             message={<div className="font-sans whitespace-pre-wrap text-[12px] text-center text-slate-300">{messageModal.message}</div>} 
// //             type={messageModal.type} 
// //             onClose={() => setMessageModal({ ...messageModal, open: false })} 
// //          />
// //       )}

// //       {!successOpen && (
// //         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-4 overflow-hidden animate-in fade-in duration-300">
          
// //           <div className="bg-[#0a0f1e] w-full max-w-sm rounded-[28px] border border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] flex flex-col max-h-[92vh] relative overflow-hidden animate-in zoom-in-95 duration-300">
            
// //             <button
// //               onClick={() => confirmData ? setConfirmData(null) : onClose()}
// //               className="absolute top-4 right-4 z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all border border-white/10 active:scale-95"
// //             >
// //               <X size={16} className="text-slate-300" strokeWidth={2.5} />
// //             </button>

// //           <div className="overflow-y-auto custom-scroll flex-1">

// //   {/* Hero header */}
// //   <div className="px-6 pt-7 pb-4 relative overflow-hidden">
// //     <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 blur-[60px] pointer-events-none rounded-full"></div>
// //     <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/20 blur-[50px] pointer-events-none rounded-full"></div>

// //     <div className="relative z-10 text-center">
// //       <h1 className="text-white text-2xl font-black tracking-tight mb-1">
// //         Withdraw Assets
// //       </h1>
// //       <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mt-1">
// //         10-Week Distribution Plan
// //       </p>
// //     </div>
// //   </div>

// //   {/* 🔥 DIRECT WITHDRAWAL INPUT SCREEN */}
// //   <div className="px-5 pb-6 space-y-4 relative z-10">
    
// //     {/* Balances Overview */}
// //     <div className="grid grid-cols-2 gap-3">
// //         <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-2xl shadow-inner">
// //             <p className="text-cyan-400/80 text-[9px] font-bold uppercase tracking-widest mb-1 text-center">Earning Balance</p>
// //             <h3 className="text-lg text-center font-black text-white font-mono">${totalAvailableToWithdraw.toFixed(2)}</h3>
// //         </div>
// //         <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl shadow-inner relative overflow-hidden">
// //             <p className="text-amber-400/80 text-[9px] font-bold uppercase tracking-widest mb-1 text-center">Deposit Wallet</p>
// //             <h3 className="text-lg text-center font-black text-amber-400 font-mono">${balances.walletBalance.toFixed(2)}</h3>
// //         </div>
// //     </div>

// //     {/* Warning Address Box */}
// //     {isAddressMissing && !isPromo ? (
// //       <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
// //         <p className="text-[11px] text-rose-300 font-bold leading-relaxed mb-3">
// //           External Wallet not found! Please update BEP-20 address first.
// //         </p>
// //         <Link 
// //           to="/profile" 
// //           onClick={onClose}
// //           className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(244,63,94,0.3)] w-full justify-center"
// //         >
// //           <UserCog size={14} /> Update Your Usdt Bep-20 Address
// //         </Link>
// //       </div>
// //     ) : (
// //       <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col shadow-sm">
// //         <p className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldCheck size={12}/> Linked BEP-20</p>
// //         <p className="text-[11px] font-mono text-emerald-300 font-black truncate">{isPromo ? "Dummy Network Active" : walletAddress}</p>
// //       </div>
// //     )}

// //     {/* MAIN INCOMES */}
// //     {(hasMainIncome || isPromo) && (
// //         <div className="flex flex-col gap-3">
// //           {renderInputRow("Direct Earning", <Zap size={14} className="text-amber-400" />, "text-amber-400", balances.direct, "direct")}
// //           {renderInputRow("Level Earning", <Users size={14} className="text-cyan-400" />, "text-cyan-400", balances.level, "level")}
// //           {renderInputRow("Crowd Donation Earning", <Layers size={14} className="text-emerald-400" />, "text-emerald-400", balances.pool, "pool")}
// //         </div>
// //     )}

// //     {/* 🔥 LIVE CALCULATION & SUMMARY BOX (FEE HIDDEN) 🔥 */}
// //     <div className={`border rounded-2xl p-4 transition-all duration-300 ${totalEnteredAmount > 0 ? (hasEnoughDeposit ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-rose-500/10 border-rose-500/30') : 'bg-white/5 border-white/10'}`}>
        
// //         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-white/10 pb-2 mb-3 flex items-center gap-1.5">
// //             <Info size={12} /> Withdrawal Summary
// //         </h4>

// //         <div className="space-y-2 text-xs font-medium">
// //             <div className="flex justify-between">
// //                 <span className="text-slate-400">Total Requested:</span>
// //                 <span className="text-white font-mono">${totalEnteredAmount.toFixed(2)}</span>
// //             </div>
            
// //             <div className="flex justify-between items-center">
// //                 <span className="text-slate-400">Top-up Wallet Required (50%):</span>
// //                 <span className={`font-mono font-bold px-2 py-0.5 rounded ${hasEnoughDeposit || totalEnteredAmount === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400 animate-pulse'}`}>
// //                     -${requiredDepositWallet.toFixed(2)}
// //                 </span>
// //             </div>
            
// //             {/* 10% Fee Wala Section Yahan Se Hata Diya Gaya Hai */}
            
// //             <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
// //                 <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Net Payable:</span>
// //                 <span className="text-emerald-400 font-black text-sm font-mono">${displayNetPayable.toFixed(2)}</span>
// //             </div>

// //             {totalEnteredAmount > 0 && (
// //                 <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2.5 mt-3 text-center">
// //                     <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-1">10-Week Distribution</p>
// //                     <p className="text-white text-xs font-mono font-bold">10 x ${(displayWeeklyInstallment).toFixed(2)} / week</p>
// //                 </div>
// //             )}
// //         </div>
// //     </div>

// //     {/* Warning message if balance is low */}
// //     {totalEnteredAmount > 0 && !hasEnoughDeposit && (
// //         <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-medium">
// //             <AlertCircle size={16} className="shrink-0 mt-0.5" />
// //             <p>You need at least <strong>${requiredDepositWallet.toFixed(2)}</strong> in your Top-up Wallet to process this withdrawal.</p>
// //         </div>
// //     )}

// //     {/* Tx PIN */}
// //     <div>
// //       <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5 mt-2 uppercase tracking-wider">Transaction PIN</label>
// //       <div className="relative group">
// //         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
// //           <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
// //         </div>
// //         <input
// //           type={showPassword ? "text" : "password"}
// //           placeholder="Enter Secure PIN"
// //           value={transactionPassword}
// //           autoComplete="new-password"
// //           onChange={(e) => setTransactionPassword(e.target.value)}
// //           disabled={isLeader || isSetupUser}
// //           className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-white focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all font-mono font-bold tracking-widest placeholder-slate-500 text-sm"
// //         />
// //         <button 
// //           type="button"
// //           onClick={() => setShowPassword(!showPassword)}
// //           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
// //         >
// //           {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
// //         </button>
// //       </div>
// //     </div>

// //     {/* CTA BUTTON */}
// //     <button
// //       onClick={proceedWithdrawal} 
// //       disabled={loading || (isLeader || isSetupUser) || (totalEnteredAmount > 0 && !hasEnoughDeposit)}
// //       className={`w-full mt-2 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
// //         loading || (isLeader || isSetupUser) || (totalEnteredAmount > 0 && !hasEnoughDeposit)
// //           ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
// //           : "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-[0_10px_30px_-8px_rgba(34,211,238,0.5)] hover:brightness-110"
// //       }`}
// //     >
// //       {loading ? (
// //         <>
// //           <Activity size={18} className="animate-pulse" /> Processing...
// //         </>
// //       ) : (
// //         <>
// //           <Zap size={18} strokeWidth={2.5} /> Withdraw Now
// //         </>
// //       )}
// //     </button>

// //   </div>
// // </div>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // };

// // export default WithdrawalModal;

// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import api from "../../api/axios"; 
// import SuccessModal from "./SuccessModal";
// import MessageModal from "./MessageModal";
// import { useAuth } from "../../context/AuthContext";
// import { Wallet, Zap, Lock, X, UserCog, Eye, EyeOff, ShieldCheck, Activity, Layers, AlertCircle, Info } from "lucide-react"; 
// import { Link } from "react-router-dom"; 

// const WithdrawalModal = ({ userId, onClose }) => {
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false); 
  
//   const [balances, setBalances] = useState({
//     walletBalance: 0, 
//     direct: 0, 
//     level: 0, 
//     reward: 0, 
//     roi: 0, // Daily Trade Income
//     matchingRoi: 0, // Team Compounding Income
//     pool: 0, // Old Auto-Pool Income (Crowd Donation)
//     isUserToppedUp: false
//   });
  
//   // 🔥 Ab sirf 2 hi inputs hain: Combined Working aur Old Pool
//   const [withdrawals, setWithdrawals] = useState({
//     working: "", 
//     pool: ""
//   });
  
//   const [transactionPassword, setTransactionPassword] = useState("");
//   const [walletAddress, setWalletAddress] = useState(""); 
//   const [isAddressMissing, setIsAddressMissing] = useState(false);
  
//   const [confirmData, setConfirmData] = useState(null);
  
//   const [successOpen, setSuccessOpen] = useState(false);
//   const [successData, setSuccessData] = useState({ userId: "", userName: "", amount: 0, source: "" });
//   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

//   const { user: loggedInUser, token } = useAuth();
//   const isPromo = loggedInUser?.role === "promo";
//   const isLeader = loggedInUser?.role === "leader" || loggedInUser?.role === "superleader";
//   const isSetupUser = loggedInUser?.role === "setup" || loggedInUser?.role === "super_setup";

//   const showMessage = (title, message, type = "error") =>
//     setMessageModal({ open: true, title, message, type });

//   const fetchData = useCallback(async () => {
//     try {
//       const res = await api.get(`/wallet/withdrawable/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
//       const profileRes = await api.get(`/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });

//       if (res.data) {
//         setBalances({
//           walletBalance: Number(res.data.walletBalance) || 0,
//           direct: Number(res.data.direct) || 0, 
//           level: Number(res.data.level) || 0,
//           reward: Number(res.data.reward) || 0,
//           roi: Number(res.data.roi) || 0,
//           matchingRoi: Number(res.data.matchingRoi) || 0,
//           pool: Number(res.data.pool) || 0, // Sirf purana pool
//           isUserToppedUp: res.data.isUserToppedUp || false
//         });
//       }

//       const u = profileRes.data?.user || profileRes.data;
//       if (u) {
//         const addr = (u.walletAddress || "").trim();
//         setWalletAddress(addr);
//         setIsAddressMissing(!addr);
//       }
//     } catch (err) {
//       console.error("Fetch Error:", err);
//     }
//   }, [userId, token]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // 🔥 Combined Working Income Balance
//   const totalWorkingBalance = balances.direct + balances.level + balances.reward + balances.roi + balances.matchingRoi;
//   const totalPoolBalance = balances.pool;

//   // Input states
//   const workingAmt = Number(withdrawals.working) || 0;
//   const poolAmt = Number(withdrawals.pool) || 0;
  
//   const totalEnteredAmount = workingAmt + poolAmt;

//   const isWorkingActive = workingAmt > 0;
//   const isPoolActive = poolAmt > 0;

//   // 50% Rule sirf Working Income ke liye
//   const requiredDepositWallet = isWorkingActive ? (workingAmt / 2) : 0; 
//   const hasEnoughDeposit = balances.walletBalance >= requiredDepositWallet;
  
//   const handleInputChange = (e, source) => {
//     const value = e.target.value;
//     if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
//       setWithdrawals((prev) => ({ ...prev, [source]: value }));
//     }
//   };

//   const proceedWithdrawal = async () => {
//     if (isLeader || isSetupUser) return showMessage("Action Denied", "System roles cannot withdraw funds directly from here.");
//     if (!balances.isUserToppedUp && !isPromo) return showMessage("UserID Inactive", "You must initialize your UserID to withdraw funds.");
//     if (!walletAddress.trim() && isAddressMissing && !isPromo) return showMessage("Address Missing", "Please configure your BEP-20 withdrawal address in your Profile.");

//     if (isWorkingActive && isPoolActive) {
//         return showMessage("Action Denied", "Please withdraw Crowd Donation (Pool) separately from your Working Incomes.");
//     }

//     if (isWorkingActive && !hasEnoughDeposit) {
//         return showMessage("Insufficient Deposit Wallet", `You need 50% ($${requiredDepositWallet.toFixed(2)}) in your Top-up wallet to withdraw $${workingAmt}.`);
//     }

//     let items = [];
//     let successMessages = [];

//     // 🔥 Auto-Split Logic for Working Income
//     if (isWorkingActive) {
//         if (!isPromo && workingAmt > totalWorkingBalance) return showMessage("Insufficient Funds", "Not enough working balance available.");
        
//         let remainingToDeduct = workingAmt;
//         const incomeSources = [
//             { name: "direct", bal: balances.direct, label: "Direct Income" },
//             { name: "level", bal: balances.level, label: "Level Income" },
//             { name: "roi", bal: balances.roi, label: "Trade Income" },
//             { name: "matchingRoi", bal: balances.matchingRoi, label: "Team Compounding" },
//             { name: "reward", bal: balances.reward, label: "Reward Income" }
//         ];

//         for (let src of incomeSources) {
//             if (remainingToDeduct <= 0) break;
//             if (src.bal > 0) {
//                 let deductAmount = Math.min(src.bal, remainingToDeduct);
//                 items.push({ source: src.name, amount: deductAmount });
//                 successMessages.push(src.label);
//                 remainingToDeduct -= deductAmount;
//             }
//         }
//     }

//     // Logic for Pool Income
//     if (isPoolActive) {
//         if (!isPromo && poolAmt > totalPoolBalance) return showMessage("Insufficient Funds", "Not enough Crowd Donation balance.");
//         items.push({ source: "pool", amount: poolAmt });
//         successMessages.push("Crowd Donation (Pool)");
//     }

//     if (totalEnteredAmount === 0) return showMessage("Invalid Request", "Enter an amount to withdraw.");
//     if (totalEnteredAmount % 10 !== 0) return showMessage("Invalid Format", `Withdrawal must be in multiples of $10. Your total is $${totalEnteredAmount}.`);
//     if (!isPromo && totalEnteredAmount < 10) return showMessage("Limit Error", "Minimum withdrawal threshold is $10.");
//     if (!transactionPassword.trim()) return showMessage("Security Alert", "Enter your Tx-PIN.");

//     try {
//       setLoading(true);
//       const endpoint = isPromo ? "/wallet/promo-withdraw" : "/wallet/withdraw";

//       const response = await api.post(endpoint, {
//         transactionPassword, items, dryRun: false 
//       }, { headers: { Authorization: `Bearer ${token}` } });
      
//       const finalUserId = (isPromo && response.data.generatedId) ? response.data.generatedId : userId;
//       const finalUserName = isPromo ? (response.data.name || "Test UserID") : (loggedInUser?.name || "");

//       setSuccessData({ 
//         userId: finalUserId, 
//         userName: finalUserName, 
//         amount: totalEnteredAmount, 
//         source: [...new Set(successMessages)].join(" + ") 
//       });
      
//       setConfirmData(null);
//       setSuccessOpen(true);
//       setWithdrawals({ working: "", pool: "" }); 
//       setTransactionPassword("");
//       await fetchData();

//     } catch (err) {
//       console.error(err);
//       let errorMsg = err.message || "Withdrawal failed due to a contract error.";
//       if (err.response && err.response.data && err.response.data.message) errorMsg = err.response.data.message;
//       else if (err.response?.status === 403) errorMsg = "Invalid Transaction PIN";
      
//       showMessage("Validation Failed", errorMsg);
//     } finally {
//       setLoading(false); 
//     }
//   };

//   return (
//     <>
//       <style>{`
//         input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
//         input[type=number] { -moz-appearance: textfield; }
//         .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(34,211,238,0.3) transparent; }
//         .custom-scroll::-webkit-scrollbar { width: 4px; }
//         .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 10px; }
//       `}</style>

//       {successOpen && (
//         <SuccessModal 
//            isOpen={successOpen} 
//            onClose={() => { setSuccessOpen(false); onClose(); }} 
//            type="withdrawal" 
//            userId={successData.userId} 
//            userName={successData.userName} 
//            amount={successData.amount} 
//            source={successData.source} 
//         />
//       )}

//       {messageModal.open && (
//          <MessageModal 
//             isOpen={messageModal.open} 
//             title={messageModal.title} 
//             message={<div className="font-sans whitespace-pre-wrap text-[12px] text-center text-slate-300">{messageModal.message}</div>} 
//             type={messageModal.type} 
//             onClose={() => setMessageModal({ ...messageModal, open: false })} 
//          />
//       )}

//       {!successOpen && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-4 overflow-hidden animate-in fade-in duration-300">
          
//           <div className="bg-[#0a0f1e] w-full max-w-sm rounded-[28px] border border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] flex flex-col max-h-[92vh] relative overflow-hidden animate-in zoom-in-95 duration-300">
            
//             <button
//               onClick={() => confirmData ? setConfirmData(null) : onClose()}
//               className="absolute top-4 right-4 z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all border border-white/10 active:scale-95"
//             >
//               <X size={16} className="text-slate-300" strokeWidth={2.5} />
//             </button>

//           <div className="overflow-y-auto custom-scroll flex-1">

//   {/* Hero header */}
//   <div className="px-6 pt-7 pb-4 relative overflow-hidden">
//     <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 blur-[60px] pointer-events-none rounded-full"></div>
//     <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/20 blur-[50px] pointer-events-none rounded-full"></div>

//     <div className="relative z-10 text-center">
//       <h1 className="text-white text-2xl font-black tracking-tight mb-1">
//         Withdraw Assets
//       </h1>
//       <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mt-1">
//         Select Balance to Withdraw
//       </p>
//     </div>
//   </div>

//   <div className="px-5 pb-6 space-y-4 relative z-10">
    
//     {/* Balances Overview */}
//     <div className="grid grid-cols-2 gap-3">
//         <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-2xl shadow-inner">
//             <p className="text-cyan-400/80 text-[9px] font-bold uppercase tracking-widest mb-1 text-center">Working Balance</p>
//             <h3 className="text-lg text-center font-black text-white font-mono">${totalWorkingBalance.toFixed(2)}</h3>
//         </div>
//         <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl shadow-inner relative overflow-hidden">
//             <p className="text-amber-400/80 text-[9px] font-bold uppercase tracking-widest mb-1 text-center">Deposit Wallet</p>
//             <h3 className="text-lg text-center font-black text-amber-400 font-mono">${balances.walletBalance.toFixed(2)}</h3>
//         </div>
//     </div>

//     {/* Warning Address Box */}
//     {isAddressMissing && !isPromo ? (
//       <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
//         <p className="text-[11px] text-rose-300 font-bold leading-relaxed mb-3">
//           External Wallet not found! Please update BEP-20 address first.
//         </p>
//         <Link 
//           to="/profile" 
//           onClick={onClose}
//           className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(244,63,94,0.3)] w-full justify-center"
//         >
//           <UserCog size={14} /> Update Your Usdt Bep-20 Address
//         </Link>
//       </div>
//     ) : (
//       <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col shadow-sm">
//         <p className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldCheck size={12}/> Linked BEP-20</p>
//         <p className="text-[11px] font-mono text-emerald-300 font-black truncate">{isPromo ? "Dummy Network Active" : walletAddress}</p>
//       </div>
//     )}

//     {/* 🔥 COMBINED WORKING INCOME INPUT */}
//     <div className={`bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 shadow-inner transition-all group ${isPoolActive ? 'opacity-40 grayscale pointer-events-none' : 'focus-within:border-cyan-500/50 hover:border-cyan-500/30'}`}>
//       <div className="flex justify-between items-center mb-2">
//         <h3 className="text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
//             <Zap size={14} className="text-amber-400" /> Combined  Earning
//         </h3>
//         <span className="text-[11px] font-mono font-bold text-amber-400">
//            Available: ${totalWorkingBalance.toFixed(2)}
//         </span>
//       </div>
//       <div className="flex items-center bg-black/40 border border-white/5 rounded-xl px-3 py-2 shadow-inner">
//           <span className="text-amber-400 font-black text-sm pr-1">$</span>
//           <input 
//               type="number" 
//               placeholder="0.00" 
//               className="w-full bg-transparent border-none text-white text-base font-black font-mono outline-none placeholder-slate-600 disabled:opacity-50"
//               value={withdrawals.working} 
//               onChange={e => handleInputChange(e, "working")} 
//               disabled={isLeader || isSetupUser || isPoolActive} 
//           />
//           {(!isLeader && !isSetupUser && !isPoolActive) && (
//               <button 
//                 onClick={() => setWithdrawals({ working: Math.floor(totalWorkingBalance), pool: "" })}
//                 className="text-[9px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20 active:scale-95 transition-all ml-2"
//               >
//                  Max
//               </button>
//           )}
//       </div>
//     </div>

//     {/* 🔥 OLD POOL INCOME INPUT (Shows ONLY if balance > 0) */}
//     {totalPoolBalance > 0 && (
//       <div className={`bg-emerald-500/[0.04] border border-emerald-500/10 rounded-2xl px-4 py-3 shadow-inner transition-all group ${isWorkingActive ? 'opacity-40 grayscale pointer-events-none' : 'focus-within:border-emerald-500/50 hover:border-emerald-500/30'}`}>
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
//               <Layers size={14} className="text-emerald-400" /> Crowd Donation 
//           </h3>
//           <span className="text-[11px] font-mono font-bold text-emerald-400">
//              Available: ${totalPoolBalance.toFixed(2)}
//           </span>
//         </div>
//         <div className="flex items-center bg-black/40 border border-emerald-500/10 rounded-xl px-3 py-2 shadow-inner">
//             <span className="text-emerald-400 font-black text-sm pr-1">$</span>
//             <input 
//                 type="number" 
//                 placeholder="0.00" 
//                 className="w-full bg-transparent border-none text-white text-base font-black font-mono outline-none placeholder-slate-600 disabled:opacity-50"
//                 value={withdrawals.pool} 
//                 onChange={e => handleInputChange(e, "pool")} 
//                 disabled={isLeader || isSetupUser || isWorkingActive} 
//             />
//             {(!isLeader && !isSetupUser && !isWorkingActive) && (
//                 <button 
//                   onClick={() => setWithdrawals({ working: "", pool: Math.floor(totalPoolBalance) })}
//                   className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 active:scale-95 transition-all ml-2"
//                 >
//                    Max
//                 </button>
//             )}
//         </div>
//       </div>
//     )}

//     {/* 🔥 DYNAMIC SUMMARY BOX 🔥 */}
//     <div className={`border rounded-2xl p-4 transition-all duration-300 ${totalEnteredAmount > 0 ? (hasEnoughDeposit ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-rose-500/10 border-rose-500/30') : 'bg-white/5 border-white/10'}`}>
        
//         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-white/10 pb-2 mb-3 flex items-center gap-1.5">
//             <Info size={12} /> Withdrawal Summary
//         </h4>

//         <div className="space-y-2 text-xs font-medium">
//             <div className="flex justify-between">
//                 <span className="text-slate-400">Total Requested:</span>
//                 <span className="text-white font-mono">${totalEnteredAmount.toFixed(2)}</span>
//             </div>
            
//             {/* Logic based on selected input */}
//             {isWorkingActive ? (
//                <>
//                  <div className="flex justify-between items-center">
//                      <span className="text-slate-400">Deposite Wallet Required (50%):</span>
//                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${hasEnoughDeposit ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400 animate-pulse'}`}>
//                          -${requiredDepositWallet.toFixed(2)}
//                      </span>
//                  </div>
//                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
//                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Net Payable (Over 10 Weeks):</span>
//                      <span className="text-emerald-400 font-black text-sm font-mono">${totalEnteredAmount.toFixed(2)}</span>
//                  </div>
//                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2.5 mt-3 text-center">
//                      <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-1">10-Week Distribution</p>
//                      <p className="text-white text-xs font-mono font-bold">10 x ${(totalEnteredAmount / 10).toFixed(2)} / week</p>
//                  </div>
//                </>
//             ) : isPoolActive ? (
//                <>
//                  <div className="flex justify-between items-center">
//                      <span className="text-slate-400">Top-up Wallet Required:</span>
//                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
//                          $0.00 (Not Required)
//                      </span>
//                  </div>
//                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
//                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Net Payable (Direct):</span>
//                      <span className="text-emerald-400 font-black text-sm font-mono">${(totalEnteredAmount * 0.8).toFixed(2)}</span>
//                  </div>
//                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 mt-3 text-center">
//                      <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-1">Direct Transfer</p>
//                      <p className="text-white text-[10px] font-mono font-bold">80% Payout / 20% Fee Rule Applied</p>
//                  </div>
//                </>
//             ) : (
//                <div className="flex justify-between items-center">
//                    <span className="text-slate-400">Top-up Wallet Required:</span>
//                    <span className="font-mono font-bold text-slate-500">$0.00</span>
//                </div>
//             )}
//         </div>
//     </div>

//     {/* Warning message if balance is low */}
//     {isWorkingActive && !hasEnoughDeposit && (
//         <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-medium">
//             <AlertCircle size={16} className="shrink-0 mt-0.5" />
//             <p>You need at least <strong>${requiredDepositWallet.toFixed(2)}</strong> in your Top-up Wallet to process this working income withdrawal.</p>
//         </div>
//     )}

//     {/* Tx PIN */}
//     <div>
//       <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5 mt-2 uppercase tracking-wider">Transaction PIN</label>
//       <div className="relative group">
//         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//           <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
//         </div>
//         <input
//           type={showPassword ? "text" : "password"}
//           placeholder="Enter Secure PIN"
//           value={transactionPassword}
//           autoComplete="new-password"
//           onChange={(e) => setTransactionPassword(e.target.value)}
//           disabled={isLeader || isSetupUser}
//           className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-white focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all font-mono font-bold tracking-widest placeholder-slate-500 text-sm"
//         />
//         <button 
//           type="button"
//           onClick={() => setShowPassword(!showPassword)}
//           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
//         >
//           {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//         </button>
//       </div>
//     </div>

//     {/* CTA BUTTON */}
//     <button
//       onClick={proceedWithdrawal} 
//       disabled={loading || (isLeader || isSetupUser) || (isWorkingActive && !hasEnoughDeposit)}
//       className={`w-full mt-2 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
//         loading || (isLeader || isSetupUser) || (isWorkingActive && !hasEnoughDeposit)
//           ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
//           : "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-[0_10px_30px_-8px_rgba(34,211,238,0.5)] hover:brightness-110"
//       }`}
//     >
//       {loading ? (
//         <>
//           <Activity size={18} className="animate-pulse" /> Processing...
//         </>
//       ) : (
//         <>
//           <Zap size={18} strokeWidth={2.5} /> Withdraw Now
//         </>
//       )}
//     </button>

//   </div>
// </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default WithdrawalModal;

import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/axios"; 
import SuccessModal from "./SuccessModal";
import MessageModal from "./MessageModal";
import { useAuth } from "../../context/AuthContext";
import { Wallet, Zap, Lock, X, UserCog, Eye, EyeOff, ShieldCheck, Activity, Layers, AlertCircle, Info } from "lucide-react"; 
import { Link } from "react-router-dom"; 

const WithdrawalModal = ({ userId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
  const [balances, setBalances] = useState({
    walletBalance: 0, 
    direct: 0, 
    level: 0, 
    reward: 0, 
    roi: 0, // Daily Trade Income
    matchingRoi: 0, // Team Compounding Income
    pool: 0, // Old Auto-Pool Income (Crowd Donation)
    isUserToppedUp: false
  });
  
  // 🔥 Ab sirf 2 hi inputs hain: Combined Working aur Old Pool
  const [withdrawals, setWithdrawals] = useState({
    working: "", 
    pool: ""
  });
  
  const [transactionPassword, setTransactionPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState(""); 
  const [isAddressMissing, setIsAddressMissing] = useState(false);
  
  const [confirmData, setConfirmData] = useState(null);
  
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState({ userId: "", userName: "", amount: 0, source: "" });
  const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

  const { user: loggedInUser, token } = useAuth();
  const isPromo = loggedInUser?.role === "promo";
  const isLeader = loggedInUser?.role === "leader" || loggedInUser?.role === "superleader";
  const isSetupUser = loggedInUser?.role === "setup" || loggedInUser?.role === "super_setup";

  const showMessage = (title, message, type = "error") =>
    setMessageModal({ open: true, title, message, type });

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/wallet/withdrawable/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const profileRes = await api.get(`/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data) {
        setBalances({
          walletBalance: Number(res.data.walletBalance) || 0,
          direct: Number(res.data.direct) || 0, 
          level: Number(res.data.level) || 0,
          reward: Number(res.data.reward) || 0,
          roi: Number(res.data.roi) || 0,
          matchingRoi: Number(res.data.matchingRoi) || 0,
          pool: Number(res.data.pool) || 0, // Sirf purana pool
          isUserToppedUp: res.data.isUserToppedUp || false
        });
      }

      const u = profileRes.data?.user || profileRes.data;
      if (u) {
        const addr = (u.walletAddress || "").trim();
        setWalletAddress(addr);
        setIsAddressMissing(!addr);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🔥 Combined Working Income Balance
  const totalWorkingBalance = balances.direct + balances.level + balances.reward + balances.roi + balances.matchingRoi;
  const totalPoolBalance = balances.pool;

  // Input states
  const workingAmt = Number(withdrawals.working) || 0;
  const poolAmt = Number(withdrawals.pool) || 0;
  
  const totalEnteredAmount = workingAmt + poolAmt;

  const isWorkingActive = workingAmt > 0;
  const isPoolActive = poolAmt > 0;

  // 50% Rule sirf Working Income ke liye
  const requiredDepositWallet = isWorkingActive ? (workingAmt / 2) : 0; 
  const hasEnoughDeposit = balances.walletBalance >= requiredDepositWallet;
  
  const handleInputChange = (e, source) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setWithdrawals((prev) => ({ ...prev, [source]: value }));
    }
  };

  const proceedWithdrawal = async () => {
    // 🔥 Setup users allow kiye gaye hain, sirf leader/superleader blocked hain
    if (isLeader) return showMessage("Action Denied", "System roles cannot withdraw funds directly from here.");
    if (!balances.isUserToppedUp && !isPromo) return showMessage("UserID Inactive", "You must initialize your UserID to withdraw funds.");
    if (!walletAddress.trim() && isAddressMissing && !isPromo) return showMessage("Address Missing", "Please configure your BEP-20 withdrawal address in your Profile.");

    if (isWorkingActive && isPoolActive) {
        return showMessage("Action Denied", "Please withdraw Crowd Donation (Pool) separately from your Working Incomes.");
    }
    
    // 🔥 Extra Security: Frontend par bhi setup user ko pool nikalne se roko
    if (isPoolActive && isSetupUser) {
        return showMessage("Action Denied", "Setup accounts are not eligible to withdraw Crowd Donation (Pool) Income.");
    }

    if (isWorkingActive && !hasEnoughDeposit) {
        return showMessage("Insufficient Deposit Wallet", `You need 50% ($${requiredDepositWallet.toFixed(2)}) in your Top-up wallet to withdraw $${workingAmt}.`);
    }

    let items = [];
    let successMessages = [];

    // 🔥 Auto-Split Logic for Working Income
    if (isWorkingActive) {
        if (!isPromo && workingAmt > totalWorkingBalance) return showMessage("Insufficient Funds", "Not enough working balance available.");
        
        let remainingToDeduct = workingAmt;
        const incomeSources = [
            { name: "direct", bal: balances.direct, label: "Direct Income" },
            { name: "level", bal: balances.level, label: "Level Income" },
            { name: "roi", bal: balances.roi, label: "Trade Income" },
            { name: "matchingRoi", bal: balances.matchingRoi, label: "Team Compounding" },
            { name: "reward", bal: balances.reward, label: "Reward Income" }
        ];

        for (let src of incomeSources) {
            if (remainingToDeduct <= 0) break;
            if (src.bal > 0) {
                let deductAmount = Math.min(src.bal, remainingToDeduct);
                items.push({ source: src.name, amount: deductAmount });
                successMessages.push(src.label);
                remainingToDeduct -= deductAmount;
            }
        }
    }

    // Logic for Pool Income
    if (isPoolActive) {
        if (!isPromo && poolAmt > totalPoolBalance) return showMessage("Insufficient Funds", "Not enough Crowd Donation balance.");
        items.push({ source: "pool", amount: poolAmt });
        successMessages.push("Crowd Donation (Pool)");
    }

    if (totalEnteredAmount === 0) return showMessage("Invalid Request", "Enter an amount to withdraw.");
    if (totalEnteredAmount % 10 !== 0) return showMessage("Invalid Format", `Withdrawal must be in multiples of $10. Your total is $${totalEnteredAmount}.`);
    if (!isPromo && totalEnteredAmount < 10) return showMessage("Limit Error", "Minimum withdrawal threshold is $10.");
    if (!transactionPassword.trim()) return showMessage("Security Alert", "Enter your Tx-PIN.");

    try {
      setLoading(true);
      const endpoint = isPromo ? "/wallet/promo-withdraw" : "/wallet/withdraw";

      const response = await api.post(endpoint, {
        transactionPassword, items, dryRun: false 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      const finalUserId = (isPromo && response.data.generatedId) ? response.data.generatedId : userId;
      const finalUserName = isPromo ? (response.data.name || "Test UserID") : (loggedInUser?.name || "");

      setSuccessData({ 
        userId: finalUserId, 
        userName: finalUserName, 
        amount: totalEnteredAmount, 
        source: [...new Set(successMessages)].join(" + ") 
      });
      
      setConfirmData(null);
      setSuccessOpen(true);
      setWithdrawals({ working: "", pool: "" }); 
      setTransactionPassword("");
      await fetchData();

    } catch (err) {
      console.error(err);
      let errorMsg = err.message || "Withdrawal failed due to a contract error.";
      if (err.response && err.response.data && err.response.data.message) errorMsg = err.response.data.message;
      else if (err.response?.status === 403) errorMsg = "Invalid Transaction PIN";
      
      showMessage("Validation Failed", errorMsg);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <>
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(34,211,238,0.3) transparent; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 10px; }
      `}</style>

      {successOpen && (
        <SuccessModal 
           isOpen={successOpen} 
           onClose={() => { setSuccessOpen(false); onClose(); }} 
           type="withdrawal" 
           userId={successData.userId} 
           userName={successData.userName} 
           amount={successData.amount} 
           source={successData.source} 
        />
      )}

      {messageModal.open && (
         <MessageModal 
            isOpen={messageModal.open} 
            title={messageModal.title} 
            message={<div className="font-sans whitespace-pre-wrap text-[12px] text-center text-slate-300">{messageModal.message}</div>} 
            type={messageModal.type} 
            onClose={() => setMessageModal({ ...messageModal, open: false })} 
         />
      )}

      {!successOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-4 overflow-hidden animate-in fade-in duration-300">
          
          <div className="bg-[#0a0f1e] w-full max-w-sm rounded-[28px] border border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] flex flex-col max-h-[92vh] relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            <button
              onClick={() => confirmData ? setConfirmData(null) : onClose()}
              className="absolute top-4 right-4 z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all border border-white/10 active:scale-95"
            >
              <X size={16} className="text-slate-300" strokeWidth={2.5} />
            </button>

          <div className="overflow-y-auto custom-scroll flex-1">

  {/* Hero header */}
  <div className="px-6 pt-7 pb-4 relative overflow-hidden">
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 blur-[60px] pointer-events-none rounded-full"></div>
    <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/20 blur-[50px] pointer-events-none rounded-full"></div>

    <div className="relative z-10 text-center">
      <h1 className="text-white text-2xl font-black tracking-tight mb-1">
        Withdraw Assets
      </h1>
      <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mt-1">
        Select Balance to Withdraw
      </p>
    </div>
  </div>

  <div className="px-5 pb-6 space-y-4 relative z-10">
    
    {/* Balances Overview */}
    <div className="grid grid-cols-2 gap-3">
        <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-2xl shadow-inner">
            <p className="text-cyan-400/80 text-[9px] font-bold uppercase tracking-widest mb-1 text-center">Withdraw Balance</p>
            <h3 className="text-lg text-center font-black text-white font-mono">${totalWorkingBalance.toFixed(2)}</h3>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl shadow-inner relative overflow-hidden">
            <p className="text-amber-400/80 text-[9px] font-bold uppercase tracking-widest mb-1 text-center">Deposit Wallet</p>
            <h3 className="text-lg text-center font-black text-amber-400 font-mono">${balances.walletBalance.toFixed(2)}</h3>
        </div>
    </div>

    {/* Warning Address Box */}
    {isAddressMissing && !isPromo ? (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
        <p className="text-[11px] text-rose-300 font-bold leading-relaxed mb-3">
          External Wallet not found! Please update BEP-20 address first.
        </p>
        <Link 
          to="/profile" 
          onClick={onClose}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(244,63,94,0.3)] w-full justify-center"
        >
          <UserCog size={14} /> Update Your Usdt Bep-20 Address
        </Link>
      </div>
    ) : (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col shadow-sm">
        <p className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldCheck size={12}/> Linked BEP-20</p>
        <p className="text-[11px] font-mono text-emerald-300 font-black truncate">{isPromo ? "Dummy Network Active" : walletAddress}</p>
      </div>
    )}

    {/* 🔥 COMBINED WORKING INCOME INPUT */}
    {/* isSetupUser ab yahan se hta diya gaya hai, Setup user yahan type kar payega */}
    <div className={`bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 shadow-inner transition-all group ${isPoolActive ? 'opacity-40 grayscale pointer-events-none' : 'focus-within:border-cyan-500/50 hover:border-cyan-500/30'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Zap size={14} className="text-amber-400" /> Combined  Earning
        </h3>
        <span className="text-[11px] font-mono font-bold text-amber-400">
           Available: ${totalWorkingBalance.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center bg-black/40 border border-white/5 rounded-xl px-3 py-2 shadow-inner">
          <span className="text-amber-400 font-black text-sm pr-1">$</span>
          <input 
              type="number" 
              placeholder="0.00" 
              className="w-full bg-transparent border-none text-white text-base font-black font-mono outline-none placeholder-slate-600 disabled:opacity-50"
              value={withdrawals.working} 
              onChange={e => handleInputChange(e, "working")} 
              disabled={isLeader || isPoolActive} 
          />
          {(!isLeader && !isPoolActive) && (
              <button 
                onClick={() => setWithdrawals({ working: Math.floor(totalWorkingBalance), pool: "" })}
                className="text-[9px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20 active:scale-95 transition-all ml-2"
              >
                 Max
              </button>
          )}
      </div>
    </div>

    {/* 🔥 OLD POOL INCOME INPUT (Shows ONLY if balance > 0) */}
    {/* Setup user isme type NAHI kar payega (isSetupUser disabled me rakha hai) */}
    {totalPoolBalance > 0 && (
      <div className={`bg-emerald-500/[0.04] border border-emerald-500/10 rounded-2xl px-4 py-3 shadow-inner transition-all group ${isWorkingActive ? 'opacity-40 grayscale pointer-events-none' : 'focus-within:border-emerald-500/50 hover:border-emerald-500/30'}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-400" /> Crowd Donation 
          </h3>
          <span className="text-[11px] font-mono font-bold text-emerald-400">
             Available: ${totalPoolBalance.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center bg-black/40 border border-emerald-500/10 rounded-xl px-3 py-2 shadow-inner">
            <span className="text-emerald-400 font-black text-sm pr-1">$</span>
            <input 
                type="number" 
                placeholder="0.00" 
                className="w-full bg-transparent border-none text-white text-base font-black font-mono outline-none placeholder-slate-600 disabled:opacity-50"
                value={withdrawals.pool} 
                onChange={e => handleInputChange(e, "pool")} 
                disabled={isLeader || isSetupUser || isWorkingActive} 
            />
            {(!isLeader && !isSetupUser && !isWorkingActive) && (
                <button 
                  onClick={() => setWithdrawals({ working: "", pool: Math.floor(totalPoolBalance) })}
                  className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 active:scale-95 transition-all ml-2"
                >
                   Max
                </button>
            )}
        </div>
      </div>
    )}

    {/* 🔥 DYNAMIC SUMMARY BOX 🔥 */}
    <div className={`border rounded-2xl p-4 transition-all duration-300 ${totalEnteredAmount > 0 ? (hasEnoughDeposit ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-rose-500/10 border-rose-500/30') : 'bg-white/5 border-white/10'}`}>
        
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-white/10 pb-2 mb-3 flex items-center gap-1.5">
            <Info size={12} /> Withdrawal Summary
        </h4>

        <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between">
                <span className="text-slate-400">Total Requested:</span>
                <span className="text-white font-mono">${totalEnteredAmount.toFixed(2)}</span>
            </div>
            
            {/* Logic based on selected input */}
            {isWorkingActive ? (
               <>
                 <div className="flex justify-between items-center">
                     <span className="text-slate-400">Deposite Wallet Required (50%):</span>
                     <span className={`font-mono font-bold px-2 py-0.5 rounded ${hasEnoughDeposit ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400 animate-pulse'}`}>
                         -${requiredDepositWallet.toFixed(2)}
                     </span>
                 </div>
                 <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
                     <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Net Payable (Over 10 Weeks):</span>
                     <span className="text-emerald-400 font-black text-sm font-mono">${totalEnteredAmount.toFixed(2)}</span>
                 </div>
                 <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2.5 mt-3 text-center">
                     <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-1">10-Week Distribution</p>
                     <p className="text-white text-xs font-mono font-bold">10 x ${(totalEnteredAmount / 10).toFixed(2)} / week</p>
                 </div>
               </>
            ) : isPoolActive ? (
               <>
                 <div className="flex justify-between items-center">
                     <span className="text-slate-400">Deposite Wallet Required:</span>
                     <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                         $0.00 (Not Required)
                     </span>
                 </div>
                 <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
                     <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Net Payable (Direct):</span>
                     <span className="text-emerald-400 font-black text-sm font-mono">${(totalEnteredAmount * 0.8).toFixed(2)}</span>
                 </div>
                 <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 mt-3 text-center">
                     <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-1">Direct Transfer</p>
                     <p className="text-white text-[10px] font-mono font-bold">80% Payout / 20% Fee Rule Applied</p>
                 </div>
               </>
            ) : (
               <div className="flex justify-between items-center">
                   <span className="text-slate-400">Top-up Wallet Required:</span>
                   <span className="font-mono font-bold text-slate-500">$0.00</span>
               </div>
            )}
        </div>
    </div>

    {/* Warning message if balance is low */}
    {isWorkingActive && !hasEnoughDeposit && (
        <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-medium">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>You need at least <strong>${requiredDepositWallet.toFixed(2)}</strong> in your Top-up Wallet to process this working income withdrawal.</p>
        </div>
    )}

    {/* Tx PIN */}
    <div>
      <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5 mt-2 uppercase tracking-wider">Transaction PIN</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter Secure PIN"
          value={transactionPassword}
          autoComplete="new-password"
          onChange={(e) => setTransactionPassword(e.target.value)}
          disabled={isLeader} // 🔥 isSetupUser removed from here too
          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-white focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all font-mono font-bold tracking-widest placeholder-slate-500 text-sm"
        />
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>

    {/* CTA BUTTON */}
    <button
      onClick={proceedWithdrawal} 
      // 🔥 isSetupUser button ke disabled se hata diya gaya hai
      disabled={loading || isLeader || (isWorkingActive && !hasEnoughDeposit)}
      className={`w-full mt-2 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
        loading || isLeader || (isWorkingActive && !hasEnoughDeposit)
          ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
          : "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-[0_10px_30px_-8px_rgba(34,211,238,0.5)] hover:brightness-110"
      }`}
    >
      {loading ? (
        <>
          <Activity size={18} className="animate-pulse" /> Processing...
        </>
      ) : (
        <>
          <Zap size={18} strokeWidth={2.5} /> Withdraw Now
        </>
      )}
    </button>

  </div>
</div>
          </div>
        </div>
      )}
    </>
  );
};

export default WithdrawalModal;