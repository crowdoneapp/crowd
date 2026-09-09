// // import React, { useState, useEffect } from "react";
// // import api from "../../api/axios"; 
// // import SuccessModal from "./SuccessModal";
// // import MessageModal from "./MessageModal";
// // import { useAuth } from "../../context/AuthContext";
// // import { CheckCircle2, ShieldAlert, Rocket, X, RefreshCcw, ArrowUpCircle, Wallet, Lock, User, Crown, Check, AlertOctagon, Info, Cpu, Activity, Zap, ShieldCheck } from "lucide-react"; 

// // const PACKAGES = [30, 100, 300, 500, 1000];

// // const TopUpModal = ({ onClose, onTopUpSuccess }) => {
// //   const { user: loggedInUser, token, login } = useAuth();
// //   const [userId, setUserId] = useState("");
// //   const [userInfo, setUserInfo] = useState(null);
  
// //   const [walletBalance, setWalletBalance] = useState(null);
// //   const [transactionPassword, setTransactionPassword] = useState("");
// //   const [loading, setLoading] = useState(false);
  
// //   const isPromoUser = loggedInUser?.role === "promo";
// //   const isLeaderUser = loggedInUser?.role === "leader" || loggedInUser?.role === "superleader";
// //   const isSetupUser = loggedInUser?.role === "setup" || loggedInUser?.role === "super_setup";

// //   const [successModalOpen, setSuccessModalOpen] = useState(false);
// //   const [successData, setSuccessData] = useState({ userId: "", name: "", amount: 0 });
// //   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

// //   const showMessage = (title, message, type = "info") => setMessageModal({ open: true, title, message, type });

// //   // 1. Fetch Balance
// //   useEffect(() => {
// //     const fetchBalance = async () => {
// //       if (!loggedInUser?.userId || !token) return;
// //       try {
// //         const res = await api.get(`/user/${loggedInUser.userId}`, {
// //           headers: { Authorization: `Bearer ${token}` },
// //         });
// //         setWalletBalance(res.data.user.walletBalance || 0);
// //       } catch (err) {
// //         console.error(err);
// //         setWalletBalance(0);
// //       }
// //     };
// //     fetchBalance();
// //   }, [loggedInUser?.userId, token]);

// //   // 2. Fetch User Info
// //   const fetchUser = async (idToFetch, showManualError = false) => {
// //     if (isPromoUser) return; 
    
// //     if (!idToFetch || idToFetch.toString().trim() === "") {
// //       setUserInfo(null);
// //       return;
// //     }
// //     try {
// //       const res = await api.get(`/user/${idToFetch}`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       if (res.data && res.data.user) {
// //         setUserInfo(res.data.user);
// //       } else {
// //         setUserInfo(null);
// //         if (showManualError) showMessage("Sync Failed", "ID details not found in the blockchain network.", "error");
// //       }
// //     } catch (err) {
// //       setUserInfo(null);
// //       if (showManualError) {
// //         const errorMsg = err.response?.data?.message || "UserID not found";
// //         showMessage("Sync Failed", errorMsg, "error");
// //       }
// //     }
// //   };

// //   useEffect(() => {
// //     if (isPromoUser) return;
// //     const delayDebounceFn = setTimeout(() => {
// //       if (userId && userId.trim() !== "") fetchUser(userId, false);
// //       else setUserInfo(null);
// //     }, 500);
// //     return () => clearTimeout(delayDebounceFn);
// //   }, [userId, token, isPromoUser]);

// //   const currentHighestPkg = userInfo?.highestPackage || userInfo?.topUpAmount || 0;

// //   // NEXT Package Logic
// //   const getNextPackage = (highest) => {
// //     if (!highest || highest === 0) return 30;
// //     if (highest === 30) return 100;
// //     if (highest === 100) return 300;
// //     if (highest === 300) return 500;
// //     if (highest === 500) return 1000;
// //     return null; 
// //   };

// //   const nextAmount = isPromoUser ? 30 : (userInfo ? getNextPackage(currentHighestPkg) : 30);
// //   const isMaxedOut = userInfo && nextAmount === null;
// //   const isFirstTopup = userInfo && currentHighestPkg === 0;

// //   // 3. Handle Top Up
// //   const handleTopUp = async () => {
// //     if (!transactionPassword) return showMessage("Security Alert", "Please enter your Tx-PIN to authorize this contract.", "error");
// //     if (isMaxedOut) return showMessage("Apex Tier", "This UserID already achieved the maximum $1000 Apex Tier.", "info");
    
// //     setLoading(true);

// //     try {
// //       if (isPromoUser) {
// //         const res = await api.post(`/user/promo-dummy-topup`, { amount: 30, transactionPassword }, { headers: { Authorization: `Bearer ${token}` } });
// //         setSuccessData({ userId: res.data.generatedId, name: res.data.name, amount: 30 });
// //         setSuccessModalOpen(true);
// //         if (onTopUpSuccess) onTopUpSuccess();
// //         setTransactionPassword("");
// //       } else {
// //         if (!userInfo) { setLoading(false); return showMessage("Validation Required", "Please sync the target User ID first.", "error"); }
// //         if (walletBalance < nextAmount) { setLoading(false); return showMessage("Insufficient Liquidity", `Contract requires $${nextAmount}, but your Asset Vault holds $${walletBalance}`, "error"); }

// //         let endpoint = `/user/topup/${Number(userId)}`;
// //         if (isLeaderUser) endpoint = `/user/leader-topup/${Number(userId)}`;
// //         if (isSetupUser && loggedInUser?.role === 'setup') endpoint = `/user/setup-topup/${Number(userId)}`;
// //         if (isSetupUser && loggedInUser?.role === 'super_setup') endpoint = `/user/supersetup-topup/${Number(userId)}`;
        
// //         await api.put(endpoint, { amount: nextAmount, transactionPassword }, { headers: { Authorization: `Bearer ${token}` } });

// //         setSuccessData({ userId: userInfo.userId, name: userInfo.name, amount: nextAmount });
// //         setSuccessModalOpen(true);

// //         const refreshedRes = await api.get(`/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
// //         const refreshedUser = refreshedRes.data.user;

// //         if (Number(userId) === loggedInUser.userId) {
// //           login(refreshedUser, token);
// //           setWalletBalance(refreshedUser.walletBalance);
// //         } else {
// //           setUserInfo(refreshedUser);
// //         }

// //         if (onTopUpSuccess) onTopUpSuccess();
// //         setTransactionPassword("");
// //       }
// //     } catch (err) {
// //       const msg = err.response?.data?.message || "Smart contract failed to execute due to network divergence.";
// //       showMessage("Contract Execution Error", msg, "error");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <>
// //       {!successModalOpen && (
// //         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-4 overflow-hidden animate-in fade-in duration-300">

// //           <style>{`
// //             input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
// //             input[type=number] { -moz-appearance: textfield; }
// //             .custom-scroll::-webkit-scrollbar { width: 4px; }
// //             .custom-scroll::-webkit-scrollbar-track { background: transparent; }
// //             .custom-scroll::-webkit-scrollbar-thumb { background: rgba(96,165,250,0.3); border-radius: 10px; }
// //           `}</style>

// //           {/* 🟢 Main Container matches WalletTransfer style */}
// //           <div className="bg-[#0a0f1e] w-full max-w-sm rounded-[28px] border border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] flex flex-col max-h-[92vh] relative overflow-hidden animate-in zoom-in-95 duration-300">

// //             <button
// //               onClick={onClose}
// //               className="absolute top-4 right-4 z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all border border-white/10 active:scale-95"
// //             >
// //               <X size={16} className="text-slate-300" strokeWidth={2.5} />
// //             </button>

// //             <div className="overflow-y-auto custom-scroll flex-1">

// //               {/* Hero header */}
// //               <div className="px-6 pt-7 pb-5 relative overflow-hidden">
// //                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 blur-[60px] pointer-events-none rounded-full"></div>
// //                 <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/10 blur-[50px] pointer-events-none rounded-full"></div>

// //                 <div className="relative z-10">
// //                   <h1 className="text-white text-2xl font-black tracking-tight mb-1">
// //                     {isFirstTopup || !userInfo ? 'Buy Package' : 'Elevate Tier'}
// //                   </h1>
// //                   <p className="text-slate-400 text-xs font-semibold">
// //                     Secure <span className="text-slate-600">•</span> Blockchain <span className="text-slate-600">•</span> Protocol
// //                   </p>
// //                 </div>

// //                 {/* <div className="relative z-10 mt-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-400/30 flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(59,130,246,0.5)]">
// //                   {isFirstTopup || !userInfo ? (
// //                      <Rocket size={28} className="text-blue-200" strokeWidth={1.8} />
// //                   ) : (
// //                      <Cpu size={28} className="text-blue-200" strokeWidth={1.8} />
// //                   )}
// //                   <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 border-2 border-[#0a0f1e] flex items-center justify-center">
// //                     <Crown size={10} className="text-[#0a0f1e]" strokeWidth={3} />
// //                   </div>
// //                 </div> */}
// //               </div>

// //               <div className="px-5 pb-6 space-y-4 relative z-10">

// //                 {/* Asset Vault (Balance) */}
// //                 <div>
// //                   <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5">Asset Vault</label>
// //                   <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3">
// //                     <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
// //                       <Wallet size={16} className="text-blue-400" />
// //                     </div>
// //                     <div className="flex-1 min-w-0">
// //                       <p className="text-white text-sm font-bold">Wallet Balance</p>
// //                       <p className="text-slate-500 text-[11px] font-medium">
// //                         Available: {walletBalance !== null ? `$${(Math.floor(Number(walletBalance) * 100) / 100).toFixed(2)}` : "..."}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* Target User ID */}
// //                 <div>
// //                   <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5">User ID</label>
// //                   <div className="flex gap-2">
// //                     <div className="relative flex-1 group">
// //                       {isPromoUser ? (
// //                         <div className="w-full bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-2xl px-4 py-3.5 font-semibold flex items-center justify-center gap-2 text-sm">
// //                           <ShieldAlert size={16} /> Auto-Allocation Active
// //                         </div>
// //                       ) : (
// //                         <>
// //                           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
// //                             <User className="h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
// //                           </div>
// //                           <input 
// //                             type="number" 
// //                             placeholder="Enter User ID"
// //                             value={userId}
// //                             onChange={(e) => setUserId(e.target.value)}
// //                             className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-white text-sm focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-semibold placeholder-slate-500"
// //                           />
// //                           {userInfo && (
// //                             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400">
// //                               <CheckCircle2 size={16} strokeWidth={3} />
// //                             </div>
// //                           )}
// //                         </>
// //                       )}
// //                     </div>
                    
                   
// //                   </div>
// //                 </div>

// //                 {/* Fetched User Info Area */}
// //                 {!isPromoUser && userInfo && (
// //                   <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    
// //                     {/* User Profile Card */}
// //                     <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-inner">
// //                       <div>
// //                         <div className="text-white font-bold text-sm">{userInfo.name}</div>
// //                         <div className="text-[11px] font-mono font-medium text-slate-500 mt-0.5">ID: {userInfo.userId}</div>
// //                       </div>
// //                       <div className="text-right">
// //                          <div className="text-slate-500 font-medium text-[10px] uppercase mb-1">Active Tier</div>
// //                          <div className="text-blue-400 font-black text-sm font-mono bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 inline-block shadow-[0_0_10px_rgba(59,130,246,0.1)]">
// //                            ${currentHighestPkg}
// //                          </div>
// //                       </div>
// //                     </div>

// //                     {/* 🔥 Visual Package Tracker */}
// //                     <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl shadow-inner">
// //                         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Contract Progression</h4>
// //                         <div className="flex items-center justify-between gap-1">
// //                             {PACKAGES.map((pkg, idx) => {
// //                                 const isCompleted = currentHighestPkg >= pkg;
// //                                 const isNext = nextAmount === pkg;
// //                                 const isLocked = !isCompleted && !isNext;

// //                                 return (
// //                                     <div key={pkg} className="flex flex-col items-center gap-2 relative flex-1">
// //                                         {/* Connector Line */}
// //                                         {idx !== 0 && (
// //                                             <div className={`absolute top-[14px] left-[-50%] w-full h-[2px] -z-10 ${isCompleted ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-white/10'}`}></div>
// //                                         )}
                                        
// //                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] border-2 transition-all duration-300 shadow-sm z-10
// //                                             ${isCompleted ? 'border-blue-500 text-blue-400 bg-[#0a0f1e] shadow-[0_0_10px_rgba(59,130,246,0.3)]' : ''}
// //                                             ${isNext ? 'border-amber-400 text-amber-300 bg-amber-500/10 ring-4 ring-amber-500/20 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : ''}
// //                                             ${isLocked ? 'border-white/10 text-slate-600 bg-white/5' : ''}
// //                                         `}>
// //                                             {isCompleted ? <Check size={14} strokeWidth={3} /> : (isLocked ? <Lock size={10} /> : <span className="font-black">${pkg}</span>)}
// //                                         </div>
// //                                         <span className={`text-[9px] font-black font-mono ${isNext ? 'text-amber-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]' : 'text-slate-500'}`}>
// //                                             ${pkg}
// //                                         </span>
// //                                     </div>
// //                                 );
// //                             })}
// //                         </div>
// //                     </div>

// //                     {/* 🔥 2 Directs Requirement Notification */}
                  

// //                   </div>
// //                 )}

// //                 {/* Tx PIN */}
// //                 <div>
// //                   <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5">Transaction PIN</label>
// //                   <div className="relative group">
// //                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
// //                       <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
// //                     </div>
// //                     <input
// //                       type="password"
// //                       placeholder="Enter your PIN"
// //                       value={transactionPassword}
// //                       autoComplete="new-password"
// //                       onChange={(e) => setTransactionPassword(e.target.value)}
// //                       className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-white focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-mono font-bold tracking-widest placeholder-slate-500 text-sm"
// //                     />
// //                   </div>
// //                 </div>

// //                 {/* CTA Button */}
// //                 <button
// //                   onClick={handleTopUp}
// //                   disabled={loading || isMaxedOut || (!isPromoUser && !userInfo)}
// //                   className={`w-full mt-2 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${
// //                     loading || isMaxedOut || (!isPromoUser && !userInfo)
// //                       ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
// //                       : "bg-gradient-to-r from-amber-400 to-amber-500 text-[#0a0f1e] shadow-[0_10px_30px_-8px_rgba(251,191,36,0.5)] hover:brightness-110"
// //                   }`}
// //                 >
// //                   {loading ? (
// //                     <>
// //                       <Activity size={18} className="animate-pulse" /> Validating Hash...
// //                     </>
// //                   ) : (
// //                     <>
// //                       <Rocket size={18} strokeWidth={2.5} /> 
// //                       {isMaxedOut ? "APEX TIER ACHIEVED" : (isFirstTopup || !userInfo ? "EXECUTE INITIALIZATION" : "AUTHORIZE UPGRADE")}
// //                       {!isMaxedOut && <span className={(!isPromoUser && !userInfo) ? "text-slate-600 ml-1" : "text-[#0a0f1e]/80 ml-1"}>(${nextAmount})</span>}
// //                     </>
// //                   )}
// //                 </button>

// //               </div>
// //             </div>

// //           </div>
// //         </div>
// //       )}

// //       <SuccessModal
// //         isOpen={successModalOpen}
// //         onClose={() => { setSuccessModalOpen(false); onClose(); }}
// //         type="topup"
// //         userId={successData.userId}
// //         userName={successData.name} 
// //         amount={successData.amount}
// //         reward={0}
// //       />
// //       <MessageModal
// //         isOpen={messageModal.open}
// //         onClose={() => setMessageModal({ ...messageModal, open: false })}
// //         title={messageModal.title}
// //         message={messageModal.message}
// //         type={messageModal.type}
// //       />
// //     </>
// //   );
// // };

// // export default TopUpModal;


// import React, { useState, useEffect } from "react";
// import api from "../../api/axios"; 
// import SuccessModal from "./SuccessModal";
// import MessageModal from "./MessageModal";
// import { useAuth } from "../../context/AuthContext";
// import { X, Wallet, Lock, User, Rocket, Activity, CheckCircle2, ShieldAlert } from "lucide-react"; 

// const TopUpModalWithInput = ({ onClose, onSuccess, packageAmount, packageName }) => {
//   const { user: loggedInUser, token, login } = useAuth();
//   const [memberId, setMemberId] = useState("");
//   const [userInfo, setUserInfo] = useState(null);
  
//   const [walletBalance, setWalletBalance] = useState(null);
//   const [transactionPassword, setTransactionPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [successModalOpen, setSuccessModalOpen] = useState(false);
//   const [successData, setSuccessData] = useState({ userId: "", name: "", amount: 0 });
//   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

//   const showMessage = (title, message, type = "info") => setMessageModal({ open: true, title, message, type });

//   // Fetch Current User Balance
//   useEffect(() => {
//     const fetchBalance = async () => {
//       if (!loggedInUser?.userId || !token) return;
//       try {
//         const res = await api.get(`/user/${loggedInUser.userId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setWalletBalance(res.data.user.walletBalance || 0);
//       } catch (err) {
//         setWalletBalance(0);
//       }
//     };
//     fetchBalance();
//   }, [loggedInUser?.userId, token]);

//   // Fetch Target User Info
//   const fetchUser = async (idToFetch) => {
//     if (!idToFetch || idToFetch.toString().trim() === "") {
//       setUserInfo(null);
//       return;
//     }
//     try {
//       const res = await api.get(`/user/${idToFetch}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUserInfo(res.data.user || null);
//     } catch (err) {
//       setUserInfo(null);
//     }
//   };

//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       if (memberId && memberId.trim() !== "") fetchUser(memberId);
//       else setUserInfo(null);
//     }, 500);
//     return () => clearTimeout(delayDebounceFn);
//   }, [memberId, token]);

//   // Handle Package Purchase
//   const handleTopUp = async () => {
//     if (!transactionPassword) return showMessage("Security Alert", "Please enter your Tx-PIN.", "error");
//     if (!userInfo) return showMessage("Validation Required", "Please enter a valid Target User ID.", "error");
//     if (walletBalance < packageAmount) return showMessage("Insufficient Funds", `You need $${packageAmount} in your Asset Vault.`, "error");
    
//     setLoading(true);
//     try {
//       // Backend Top-up API Call
//       await api.post(`/user/activate-package`, { 
//         memberId: memberId, 
//         packageAmount: packageAmount, 
//         txnPassword: transactionPassword 
//       }, { 
//         headers: { Authorization: `Bearer ${token}` } 
//       });

//       setSuccessData({ userId: userInfo.userId, name: userInfo.name, amount: packageAmount });
//       setSuccessModalOpen(true);

//       // Refresh Current User Data
//       const refreshedRes = await api.get(`/user/${loggedInUser.userId}`, { headers: { Authorization: `Bearer ${token}` } });
//       login(refreshedRes.data.user, token);
      
//       if (onSuccess) onSuccess();
//       setTransactionPassword("");
//     } catch (err) {
//       const msg = err.response?.data?.message || "Transaction failed.";
//       showMessage("Execution Error", msg, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {!successModalOpen && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-4">
//           <div className="bg-[#0a0f1e] w-full max-w-sm rounded-[28px] border border-white/10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
//             <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/10">
//               <X size={16} className="text-slate-300" />
//             </button>

//             <div className="px-6 pt-7 pb-5 relative">
//               <div className="relative z-10">
//                 <h1 className="text-white text-2xl font-black mb-1">Buy {packageName}</h1>
//                 <p className="text-amber-400 font-bold text-sm">Amount: ${packageAmount}</p>
//               </div>
//             </div>

//             <div className="px-5 pb-6 space-y-4 relative z-10">
//               {/* Wallet Balance */}
//               <div>
//                 <label className="block text-[11px] font-bold text-slate-300 mb-2">Asset Vault</label>
//                 <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3">
//                   <Wallet size={16} className="text-blue-400" />
//                   <div>
//                     <p className="text-white text-sm font-bold">Wallet Balance</p>
//                     <p className="text-slate-400 text-xs font-medium">Available: ${walletBalance !== null ? walletBalance.toFixed(2) : "..."}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Target User ID */}
//               <div>
//                 <label className="block text-[11px] font-bold text-slate-300 mb-2">Target User ID</label>
//                 <div className="relative">
//                   <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
//                   <input 
//                     type="number" placeholder="Enter ID to activate"
//                     value={memberId} onChange={(e) => setMemberId(e.target.value)}
//                     className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-white text-sm focus:border-blue-400 outline-none"
//                   />
//                   {userInfo && <CheckCircle2 className="absolute right-4 top-3.5 h-4 w-4 text-emerald-400" />}
//                 </div>
//                 {userInfo && (
//                   <div className="mt-2 bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg text-xs text-blue-300 flex justify-between">
//                     <span>Name: <strong>{userInfo.name}</strong></span>
//                     <span>Status: {userInfo.isToppedUp ? "Active" : "Inactive"}</span>
//                   </div>
//                 )}
//               </div>

//               {/* Tx PIN */}
//               <div>
//                 <label className="block text-[11px] font-bold text-slate-300 mb-2">Transaction PIN</label>
//                 <div className="relative">
//                   <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
//                   <input
//                     type="password" placeholder="Enter your PIN"
//                     value={transactionPassword} onChange={(e) => setTransactionPassword(e.target.value)}
//                     className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-white text-sm focus:border-blue-400 outline-none font-mono"
//                   />
//                 </div>
//               </div>

//               {/* CTA Button */}
//               <button
//                 onClick={handleTopUp}
//                 disabled={loading || !userInfo}
//                 className={`w-full mt-2 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all ${
//                   loading || !userInfo ? "bg-white/5 text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:scale-[1.02]"
//                 }`}
//               >
//                 {loading ? <><Activity size={18} className="animate-pulse" /> Processing...</> : <><Rocket size={18} /> CONFIRM ACTIVATION (${packageAmount})</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <SuccessModal
//         isOpen={successModalOpen}
//         onClose={() => { setSuccessModalOpen(false); onClose(); }}
//         type="topup" userId={successData.userId} userName={successData.name} amount={successData.amount}
//       />
//       <MessageModal
//         isOpen={messageModal.open}
//         onClose={() => setMessageModal({ ...messageModal, open: false })}
//         title={messageModal.title} message={messageModal.message} type={messageModal.type}
//       />
//     </>
//   );
// };

// export default TopUpModalWithInput;
import React, { useState, useEffect } from "react";
import api from "../../api/axios"; 
import SuccessModal from "./SuccessModal";
import MessageModal from "./MessageModal";
import { useAuth } from "../../context/AuthContext";
import { X, Wallet, Lock, User, Rocket, Activity, CheckCircle2, Package } from "lucide-react"; 

// 🔥 PACKAGE LIST 🔥
// 🔥 UPDATED PACKAGE LIST ($1 se $5000 tak naye naam ke sath) 🔥
const packagesList = [
  { id: 1, name: 'STARTER ($1)', price: 1 },
   { id: 3, name: 'BRONZE ($5)', price: 5 },
  { id: 4, name: 'SILVER ($10)', price: 10 },
  { id: 5, name: 'GOLD ($20)', price: 20 },
  { id: 6, name: 'PLATINUM ($50)', price: 50 },
  { id: 7, name: 'DIAMOND ($100)', price: 100 },
  { id: 8, name: 'EMERALD ($200)', price: 200 },
  { id: 9, name: 'RUBY ($500)', price: 500 },
  { id: 10, name: 'SAPPHIRE ($1000)', price: 1000 },
  { id: 11, name: 'MASTER ($2000)', price: 2000 },
  { id: 12, name: 'APEX ($5000)', price: 5000 },
];

const TopUpModalWithInput = ({ onClose, onSuccess }) => {
  const { user: loggedInUser, token, login } = useAuth();
  const [memberId, setMemberId] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  
  const [walletBalance, setWalletBalance] = useState(null);
  const [transactionPassword, setTransactionPassword] = useState("");
  
  // 🔥 NAYA STATE: Selected Package Amount
  const [selectedPackage, setSelectedPackage] = useState(packagesList[0].price);
  
  const [loading, setLoading] = useState(false);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState({ userId: "", name: "", amount: 0 });
  const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

  const showMessage = (title, message, type = "info") => setMessageModal({ open: true, title, message, type });

  // Fetch Current User Balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!loggedInUser?.userId || !token) return;
      try {
        const res = await api.get(`/user/${loggedInUser.userId}`, { headers: { Authorization: `Bearer ${token}` } });
        setWalletBalance(res.data.user.walletBalance || 0);
      } catch (err) {
        setWalletBalance(0);
      }
    };
    fetchBalance();
  }, [loggedInUser?.userId, token]);

  // Fetch Target User Info
  const fetchUser = async (idToFetch) => {
    if (!idToFetch || idToFetch.toString().trim() === "") {
      setUserInfo(null);
      return;
    }
    try {
      const res = await api.get(`/user/${idToFetch}`, { headers: { Authorization: `Bearer ${token}` } });
      setUserInfo(res.data.user || null);
    } catch (err) {
      setUserInfo(null);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (memberId && memberId.trim() !== "") fetchUser(memberId);
      else setUserInfo(null);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [memberId, token]);

  // Handle Package Purchase
  const handleTopUp = async () => {
    if (!transactionPassword) return showMessage("Security Alert", "Please enter your Tx-PIN.", "error");
    if (!userInfo) return showMessage("Validation Required", "Please enter a valid Target User ID.", "error");
    if (walletBalance < selectedPackage) return showMessage("Insufficient Funds", `You need $${selectedPackage} in your Asset Vault.`, "error");
    
    setLoading(true);
    try {
      await api.post(`/user/activate-package`, { 
        memberId: memberId, 
        packageAmount: selectedPackage, // Dropdown wala amount jayega
        txnPassword: transactionPassword 
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      setSuccessData({ userId: userInfo.userId, name: userInfo.name, amount: selectedPackage });
      setSuccessModalOpen(true);

      const refreshedRes = await api.get(`/user/${loggedInUser.userId}`, { headers: { Authorization: `Bearer ${token}` } });
      login(refreshedRes.data.user, token);
      
      if (onSuccess) onSuccess();
      setTransactionPassword("");
    } catch (err) {
      const msg = err.response?.data?.message || "Transaction failed.";
      showMessage("Execution Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!successModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-4">
          <div className="bg-[#0a0f1e] w-full max-w-sm rounded-[28px] border border-white/10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/10">
              <X size={16} className="text-slate-300" />
            </button>

            <div className="px-6 pt-7 pb-5 relative">
              <div className="relative z-10">
                <h1 className="text-white text-2xl font-black mb-1">Buy Package</h1>
                <p className="text-amber-400 font-bold text-sm">Select & Activate</p>
              </div>
            </div>

            <div className="px-5 pb-6 space-y-4 relative z-10">
              {/* Wallet Balance */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-2">Asset Vault</label>
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3">
                  <Wallet size={16} className="text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-bold">Wallet Balance</p>
                    <p className="text-slate-400 text-xs font-medium">Available: ${walletBalance !== null ? walletBalance.toFixed(2) : "..."}</p>
                  </div>
                </div>
              </div>

              {/* 🔥 NEW: Package Selection Dropdown 🔥 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-2">Select Package</label>
                <div className="relative">
                  <Package className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <select 
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(Number(e.target.value))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-white text-sm focus:border-amber-400 outline-none appearance-none cursor-pointer"
                  >
                    {packagesList.map(pkg => (
                      <option key={pkg.id} value={pkg.price} className="bg-[#0a0f1e] text-white">
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target User ID */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-2">Target User ID</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input 
                    type="number" placeholder="Enter ID to activate"
                    value={memberId} onChange={(e) => setMemberId(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-white text-sm focus:border-blue-400 outline-none"
                  />
                  {userInfo && <CheckCircle2 className="absolute right-4 top-3.5 h-4 w-4 text-emerald-400" />}
                </div>
                {userInfo && (
                  <div className="mt-2 bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg text-xs text-blue-300 flex justify-between">
                    <span>Name: <strong>{userInfo.name}</strong></span>
                    <span>Status: {userInfo.isToppedUp ? "Active" : "Inactive"}</span>
                  </div>
                )}
              </div>

              {/* Tx PIN */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-2">Transaction PIN</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password" placeholder="Enter your PIN"
                    value={transactionPassword} onChange={(e) => setTransactionPassword(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-white text-sm focus:border-blue-400 outline-none font-mono"
                  />
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleTopUp}
                disabled={loading || !userInfo}
                className={`w-full mt-2 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all ${
                  loading || !userInfo ? "bg-white/5 text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:scale-[1.02]"
                }`}
              >
                {loading ? <><Activity size={18} className="animate-pulse" /> Processing...</> : <><Rocket size={18} /> CONFIRM ACTIVATION (${selectedPackage})</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => { setSuccessModalOpen(false); onClose(); }}
        type="topup" userId={successData.userId} userName={successData.name} amount={successData.amount}
      />
      <MessageModal
        isOpen={messageModal.open}
        onClose={() => setMessageModal({ ...messageModal, open: false })}
        title={messageModal.title} message={messageModal.message} type={messageModal.type}
      />
    </>
  );
};

export default TopUpModalWithInput;