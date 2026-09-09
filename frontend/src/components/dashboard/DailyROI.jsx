// // // import React, { useState, useEffect } from "react";
// // // import { useAuth } from "../../context/AuthContext";
// // // import { CheckCircle2, Lock, ArrowRight, ArrowLeft, ShieldAlert, Crown, Users, CalendarDays, Wallet, BadgeDollarSign, UserPlus, Globe, UserCheck } from "lucide-react";
// // // import api from "../../api/axios";

// // // // ✅ Neo-Banking Theme + Custom Flyer Table Styling
// // // const customStyles = `
// // //   .neo-bg {
// // //     background-color: #f8fafc;
// // //     background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
// // //     background-size: 24px 24px;
// // //   }
// // //   .neo-card {
// // //     background: #ffffff;
// // //     border-radius: 16px;
// // //     border: 1px solid #f1f5f9;
// // //     box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
// // //     transition: transform 0.3s ease, box-shadow 0.3s ease;
// // //   }
// // //   .neo-card:hover {
// // //     box-shadow: 0 15px 50px -10px rgba(37, 99, 235, 0.1);
// // //   }
// // //   .neo-table-wrapper {
// // //     background: #ffffff;
// // //     border-radius: 16px;
// // //     border: 1px solid #e2e8f0;
// // //     box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04);
// // //   }
// // //   .neo-row {
// // //     background: #ffffff;
// // //     border-bottom: 1px solid #f1f5f9;
// // //     transition: all 0.2s ease;
// // //   }
// // //   .neo-row:hover {
// // //     background: #f8fafc;
// // //   }
// // //   .neo-row:last-child {
// // //     border-bottom: none;
// // //   }
// // //   .custom-scroll::-webkit-scrollbar { height: 5px; }
// // //   .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
// // //   .hide-scroll::-webkit-scrollbar { display: none; }
// // //   .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
// // //   .flyer-header { background-color: #0b1c3c; color: #ffffff; }
// // // `;

// // // const PACKAGES = [30, 100, 300, 500, 1000];
// // // const LEVELS_PER_PAGE = 10;
// // // const TOTAL_LEVELS = 50;
// // // const ROI_DAYS = 90;

// // // const generateLevelsData = (pkgAmount) => {
// // //   const levels = [];
// // //   const totalReturnPerLevel = pkgAmount * 2; 
// // //   const dailyReturnPerLevel = Math.floor((totalReturnPerLevel / ROI_DAYS) * 100) / 100; 

// // //   for (let i = 1; i <= TOTAL_LEVELS; i++) {
// // //     let displayTeamUI = 100;
// // //     let unlockTeamLogic = i * 100;

// // //     levels.push({
// // //       level: i,
// // //       totalEarning: totalReturnPerLevel,
// // //       dailyEarning: dailyReturnPerLevel,
// // //       days: ROI_DAYS,
// // //       reqDirectsActual: i, // Cumulative direct logic
// // //       reqTeamActual: displayTeamUI,   
// // //       unlockTeamReq: unlockTeamLogic, 
// // //     });
// // //   }
// // //   return levels;
// // // };

// // // export default function Plan() {
// // //   const { user } = useAuth();
// // //   const [selectedPackage, setSelectedPackage] = useState(30);
// // //   const [currentPage, setCurrentPage] = useState(1);
// // //   const [levelsData, setLevelsData] = useState([]);
// // //   const [globalData, setGlobalData] = useState({});

// // //   const userHighestPackage = user?.highestPackage || user?.topUpAmount || 0;
// // //   const isToppedUp = user?.isToppedUp || userHighestPackage > 0;
// // //   const purchasedPackages = user?.purchasedPackages || [];

// // //   // 🔥 API Call for User & Global Data
// // //   useEffect(() => {
// // //     const fetchUserData = async () => {
// // //         try {
// // //             if (!user?.userId) return;
// // //             const res = await api.get(`/user/${user.userId}`);
            
// // //             if (res.data && res.data.globalStats) {
// // //                 setGlobalData(res.data.globalStats); 
// // //             }
// // //         } catch (err) {
// // //             console.error("Fetch Error:", err);
// // //         }
// // //     };
// // //     fetchUserData();
// // //   }, [user?.userId]);

// // //   // 🔥 LOGIC: Selected Package Check
// // //   const isPackageActive = purchasedPackages.includes(selectedPackage) || userHighestPackage >= selectedPackage;

// // //   // ✅ Package Specific Calculations
// // //   const currentPackageAllCrowd = globalData[String(selectedPackage)]?.allCrowd || 0;
// // //   const currentPackageYourCrowd = isPackageActive ? (user?.packageStats?.[String(selectedPackage)]?.globalTeamCount || user?.globalTeamCount || 0) : 0;
// // //   const currentPackageDirects = isPackageActive ? (user?.packageStats?.[String(selectedPackage)]?.directCount || user?.directCount || 0) : 0;

// // //   useEffect(() => {
// // //     setCurrentPage(1); 
// // //     const data = generateLevelsData(selectedPackage);
// // //     setLevelsData(data);
// // //   }, [selectedPackage]);

// // //   const totalPages = Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE);
// // //   const startIndex = (currentPage - 1) * LEVELS_PER_PAGE;
// // //   const currentLevels = levelsData.slice(startIndex, startIndex + LEVELS_PER_PAGE);

// // //   const handleNext = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };
// // //   const handlePrev = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };

// // //   const total50LevelsAmount = selectedPackage * 2 * TOTAL_LEVELS;

// // //   return (
// // //     <div className="neo-bg min-h-screen w-full py-6 md:py-10 text-slate-800 relative font-sans">
// // //       <style>{customStyles}</style>

// // //       <div className="relative z-10 w-full px-1 sm:px-6 md:px-8 max-w-7xl mx-auto pb-24">
        
// // //         {/* 🛑 INACTIVE USER WARNING */}
// // //         {!isToppedUp && (
// // //            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start sm:items-center gap-4 shadow-sm">
// // //               <div className="p-2 bg-rose-100 rounded-full shrink-0 mt-1 sm:mt-0">
// // //                 <ShieldAlert className="text-rose-600 w-5 h-5 sm:w-6 sm:h-6" />
// // //               </div>
// // //               <div>
// // //                 <h4 className="text-rose-800 font-bold text-sm">Account Inactive</h4>
// // //                 <p className="text-rose-600 text-xs font-medium mt-0.5 leading-relaxed">
// // //                    Activate a package to start receiving global team and level benefits.
// // //                 </p>
// // //               </div>
// // //            </div>
// // //         )}

// // //         {/* ✅ SUMMARY CARDS */}
// // //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
// // //            <div className="neo-card p-5 sm:p-6 flex items-center justify-between group">
// // //               <div>
// // //                 <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">Highest Package</p>
// // //                 <h3 className="text-2xl sm:text-3xl font-black text-[#0b1c3c] tracking-tight flex items-center gap-1">
// // //                   <span className="text-blue-600">$</span>{userHighestPackage}
// // //                 </h3>
// // //               </div>
// // //               <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
// // //                 <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
// // //               </div>
// // //            </div>

// // //            <div className="neo-card p-5 sm:p-6 flex items-center justify-between group">
// // //               <div>
// // //                 <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">50-Level Potential</p>
// // //                 <h3 className="text-2xl sm:text-3xl font-black text-[#0b1c3c] tracking-tight flex items-center gap-1">
// // //                    <span className="text-indigo-600">$</span>{total50LevelsAmount.toLocaleString()}
// // //                 </h3>
// // //               </div>
// // //               <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
// // //                 <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
// // //               </div>
// // //            </div>
// // //         </div>

// // //         {/* ✅ PACKAGE SELECTOR TABS */}
// // //         <div className="mb-4">
// // //            <h4 className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 pl-1">Select Tier Level</h4>
// // //            <div className="flex overflow-x-auto hide-scroll gap-2 sm:gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
// // //               {PACKAGES.map((pkg) => {
// // //                  const isActive = purchasedPackages.includes(pkg) || userHighestPackage >= pkg;
// // //                  return (
// // //                   <button
// // //                     key={pkg}
// // //                     onClick={() => setSelectedPackage(pkg)}
// // //                     className={`shrink-0 min-w-[80px] sm:flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${
// // //                       selectedPackage === pkg 
// // //                       ? 'bg-[#0b1c3c] text-white shadow-md transform scale-[1.02]' 
// // //                       : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
// // //                     }`}
// // //                   >
// // //                     ${pkg}
// // //                     {isActive && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400"></div>}
// // //                   </button>
// // //                  );
// // //               })}
// // //            </div>
// // //            {!isPackageActive && (
// // //              <p className="text-[10px] text-rose-500 font-bold mt-2 ml-1 animate-pulse flex items-center gap-1">
// // //                <Lock size={10} /> This package is currently inactive. Please upgrade to unlock stats.
// // //              </p>
// // //            )}
// // //         </div>

// // //         {/* ✅ PACKAGE SPECIFIC STATS BOXES */}
// // //         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
// // //             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">All Crowd (${selectedPackage})</p>
// // //                 <h4 className="text-xl font-black text-[#0b1c3c]">{currentPackageAllCrowd.toLocaleString()}</h4>
// // //               </div>
// // //               <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100 text-blue-600">
// // //                 <Globe size={20} />
// // //               </div>
// // //             </div>

// // //             <div className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between ${!isPackageActive && 'opacity-60 grayscale'}`}>
// // //               <div>
// // //                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Your Crowd (${selectedPackage})</p>
// // //                 <h4 className="text-xl font-black text-emerald-600">{currentPackageYourCrowd.toLocaleString()}</h4>
// // //               </div>
// // //               <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-emerald-600">
// // //                 <Users size={20} />
// // //               </div>
// // //             </div>

// // //             <div className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between ${!isPackageActive && 'opacity-60 grayscale'}`}>
// // //               <div>
// // //                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Directs (${selectedPackage})</p>
// // //                 <h4 className="text-xl font-black text-indigo-600">{currentPackageDirects}</h4>
// // //               </div>
// // //               <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 text-indigo-600">
// // //                 <UserCheck size={20} />
// // //               </div>
// // //             </div>
// // //         </div>

// // //         {/* ✅ 50 LEVELS PAGINATED TABLE */}
// // //         <div className="w-full mb-8">
// // //           <div className="neo-table-wrapper overflow-hidden border-2 border-[#0b1c3c]/10">
// // //             <div className="overflow-x-auto w-full custom-scroll">
// // //               <table className="w-full text-center whitespace-nowrap">
// // //                 <thead className="flyer-header text-[10px] sm:text-xs font-bold uppercase tracking-wider">
// // //                   <tr>
// // //                     <th className="py-4 px-3 sm:py-5 sm:px-6"><div className="flex flex-col items-center gap-1"><Users size={18} className="text-blue-300" /><span>Team</span></div></th>
// // //                     <th className="py-4 px-3 sm:py-5 sm:px-6"><div className="flex flex-col items-center gap-1"><BadgeDollarSign size={18} className="text-blue-300" /><span>Income (USDT)</span></div></th>
// // //                     <th className="py-4 px-3 sm:py-5 sm:px-6"><div className="flex flex-col items-center gap-1"><UserPlus size={18} className="text-blue-300" /><span>Direct Required</span></div></th>
// // //                     <th className="py-4 px-3 sm:py-5 sm:px-6"><div className="flex flex-col items-center gap-1"><Wallet size={18} className="text-blue-300" /><span>Daily Income</span></div></th>
// // //                     <th className="py-4 px-3 sm:py-5 sm:px-6"><div className="flex flex-col items-center gap-1"><CalendarDays size={18} className="text-blue-300" /><span>Time ({ROI_DAYS} Days)</span></div></th>
// // //                     <th className="py-4 px-3 sm:py-5 sm:px-6"><div className="flex flex-col items-center gap-1"><ShieldAlert size={18} className="text-blue-300" /><span>Status</span></div></th>
// // //                   </tr>
// // //                 </thead>
// // //                 <tbody>
// // //                   {currentLevels.map((lvl) => {
// // //                     const isDirectMet = currentPackageDirects >= lvl.reqDirectsActual;
// // //                     const isTeamMet = currentPackageYourCrowd >= lvl.unlockTeamReq;
// // //                     const isLevelUnlocked = isPackageActive && isDirectMet && isTeamMet;

// // //                     // 🔥 DYNAMIC COLOR LOGIC (UPDATED FOR DIRECT HIGHLIGHT)
// // //                     let rowBgClass = "neo-row border-b border-slate-100 hover:bg-blue-50/50";
// // //                     let teamTextClass = "text-slate-800";
// // //                     let incomeTextClass = "text-[#0b1c3c]";
// // //                     let directTextClass = "text-slate-600";
// // //                     let dailyTextClass = "text-blue-600";
// // //                     let timeTextClass = "text-slate-600";

// // //                     if (isPackageActive) {
// // //                       if (isDirectMet && isTeamMet) {
// // //                         // DONO COMPLETE: Dark Green Line (ACHIEVED)
// // //                         rowBgClass = "bg-emerald-700 hover:bg-emerald-800 border-b border-emerald-800";
// // //                         teamTextClass = "text-white";
// // //                         incomeTextClass = "text-white";
// // //                         directTextClass = "text-white font-extrabold";
// // //                         dailyTextClass = "text-white";
// // //                         timeTextClass = "text-white";
// // //                       } else if (isTeamMet && !isDirectMet) {
// // //                         // TEAM COMPLETE + DIRECT INCOMPLETE: Highlight missing direct in RED
// // //                         rowBgClass = "bg-emerald-100 hover:bg-emerald-200 border-b border-emerald-200";
// // //                         teamTextClass = "text-emerald-900";
// // //                         incomeTextClass = "text-emerald-900";
// // //                         // 🔥 Yahan gray ki jagah RED color diya hai taaki user ko saaf dikhe!
// // //                         directTextClass = "text-red-600 font-black"; 
// // //                         dailyTextClass = "text-emerald-900";
// // //                         timeTextClass = "text-emerald-900";
// // //                       } else if (isDirectMet && !isTeamMet) {
// // //                         // DIRECT COMPLETE + TEAM INCOMPLETE: Direct Text Green
// // //                         rowBgClass = "bg-white hover:bg-slate-50 border-b border-slate-100";
// // //                         teamTextClass = "text-slate-800";
// // //                         incomeTextClass = "text-[#0b1c3c]";
// // //                         directTextClass = "text-emerald-600 font-extrabold"; // Completed direct is Green
// // //                         dailyTextClass = "text-blue-600";
// // //                         timeTextClass = "text-slate-600";
// // //                       } else {
// // //                         // DONO INCOMPLETE: Direct pending clearly dikhe isliye red
// // //                         directTextClass = "text-red-500 font-bold";
// // //                       }
// // //                     }

// // //                     return (
// // //                       <tr key={lvl.level} className={`${rowBgClass} transition-all duration-300`}>
// // //                         <td className={`py-4 px-3 sm:py-5 sm:px-6 font-black text-sm sm:text-base ${teamTextClass}`}>
// // //                           {lvl.reqTeamActual.toLocaleString()}
// // //                         </td>
                        
// // //                         <td className={`py-4 px-3 sm:py-5 sm:px-6 font-bold text-sm sm:text-base ${incomeTextClass}`}>
// // //                           ${lvl.totalEarning.toFixed(2)} USDT
// // //                         </td>
                        
// // //                         <td className={`py-4 px-3 sm:py-5 sm:px-6 font-bold text-xs sm:text-sm transition-colors duration-300 ${directTextClass}`}>
// // //                            1 Direct
// // //                         </td>

// // //                         <td className={`py-4 px-3 sm:py-5 sm:px-6 font-black text-sm sm:text-base ${dailyTextClass}`}>
// // //                           ${lvl.dailyEarning.toFixed(2)} USDT
// // //                         </td>
                        
// // //                         <td className={`py-4 px-3 sm:py-5 sm:px-6 font-bold text-xs sm:text-sm ${timeTextClass}`}>
// // //                           {lvl.days} Days
// // //                         </td>
                        
// // //                         <td className="py-4 px-3 sm:py-5 sm:px-6">
// // //                           {!isPackageActive ? (
// // //                              <button className="inline-flex items-center justify-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 font-bold text-[9px] sm:text-[10px] uppercase tracking-wide whitespace-nowrap shadow-sm">
// // //                                 <Lock size={12} /> UPGRADE TIER
// // //                              </button>
// // //                           ) : isLevelUnlocked ? (
// // //                              <button className="inline-flex items-center justify-center gap-1.5 text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-transparent font-black text-[9px] sm:text-[10px] uppercase tracking-wide whitespace-nowrap shadow-md">
// // //                                 <CheckCircle2 size={12} strokeWidth={2.5} /> ACHIEVED
// // //                              </button>
// // //                           ) : isDirectMet ? (
// // //                              <button className="inline-flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-bold text-[9px] sm:text-[10px] uppercase tracking-wide whitespace-nowrap shadow-sm">
// // //                                 <Users size={12} /> UNLOCKING...
// // //                              </button>
// // //                           ) : (
// // //                              <button className="inline-flex items-center justify-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-[9px] sm:text-[10px] uppercase tracking-wide whitespace-nowrap shadow-sm">
// // //                                 <Lock size={12} /> LOCKED
// // //                              </button>
// // //                           )}
// // //                         </td>
// // //                       </tr>
// // //                     );
// // //                   })}
// // //                 </tbody>
// // //                 <tfoot className="bg-[#f8fafc] border-t-2 border-[#0b1c3c]/10">
// // //                   <tr>
// // //                     <td colSpan="3" className="py-4 px-4 sm:py-5 sm:px-6 text-right font-bold uppercase tracking-widest text-[10px] sm:text-xs text-slate-500">Total 50 Levels Return</td>
// // //                     <td colSpan="3" className="py-4 px-4 sm:py-5 sm:px-6 text-left font-black text-xl sm:text-2xl text-[#0b1c3c]">${total50LevelsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</td>
// // //                   </tr>
// // //                 </tfoot>
// // //               </table>
// // //             </div>
            
// // //             {/* ✅ PAGINATION CONTROLS */}
// // //             <div className="bg-white border-t border-slate-100 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
// // //                <div className="flex w-full sm:w-auto justify-between sm:justify-start gap-2">
// // //                  <button onClick={handlePrev} disabled={currentPage === 1} className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs transition-all ${currentPage === 1 ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm'}`}>
// // //                     <ArrowLeft size={14} /> Prev
// // //                  </button>
// // //                  <button onClick={handleNext} disabled={currentPage === totalPages} className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs transition-all ${currentPage === totalPages ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent' : 'bg-[#0b1c3c] hover:bg-[#1a3668] text-white shadow-sm'}`}>
// // //                     Next <ArrowRight size={14} />
// // //                  </button>
// // //                </div>
// // //                <div className="text-slate-400 font-medium text-[10px] sm:text-xs uppercase tracking-widest">
// // //                  Page <span className="text-[#0b1c3c] font-black">{currentPage}</span> / {totalPages}
// // //                </div>
// // //             </div>
// // //           </div>
// // //         </div>

// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import React from "react";
// // import { useAuth } from "../../context/AuthContext";
// // import { CheckCircle2, Lock, ShieldAlert, Crown, Package, Gift } from "lucide-react";

// // // ✅ Super Clean Neo-Banking Theme (Compact)
// // const customStyles = `
// //   .neo-bg {
// //     background-color: #f8fafc;
// //     background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
// //     background-size: 24px 24px;
// //   }
// //   .neo-card {
// //     background: #ffffff;
// //     border-radius: 16px;
// //     border: 1px solid #f1f5f9;
// //     box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
// //     transition: all 0.3s ease;
// //   }
// //   .neo-card:hover {
// //     box-shadow: 0 15px 40px -10px rgba(37, 99, 235, 0.08);
// //     transform: translateY(-2px);
// //   }
// // `;

// // const PACKAGES = [100];

// // export default function Plan() {
// //   const { user } = useAuth();

// //   const userHighestPackage = user?.highestPackage || user?.topUpAmount || 0;
// //   const isToppedUp = user?.isToppedUp || userHighestPackage > 0;
// //   const purchasedPackages = user?.purchasedPackages || [];

// //   return (
// //     <div className="neo-bg min-h-screen w-full py-6 md:py-10 text-slate-800 relative font-sans">
// //       <style>{customStyles}</style>

// //       <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 max-w-4xl mx-auto pb-24">
        
// //         {/* 🛑 INACTIVE USER WARNING */}
// //         {!isToppedUp && (
// //            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start sm:items-center gap-4 shadow-sm">
// //               <div className="p-2 bg-rose-100 rounded-full shrink-0 mt-1 sm:mt-0">
// //                 <ShieldAlert className="text-rose-600 w-5 h-5 sm:w-6 sm:h-6" />
// //               </div>
// //               <div>
// //                 <h4 className="text-rose-800 font-bold text-sm">Account Inactive</h4>
// //                 <p className="text-rose-600 text-xs font-medium mt-0.5 leading-relaxed">
// //                    Activate a package to start receiving platform benefits.
// //                 </p>
// //               </div>
// //            </div>
// //         )}

// //         {/* ✅ HIGHEST PACKAGE SUMMARY CARD */}
// //         <div className="neo-card p-5 sm:p-6 flex items-center justify-between group mb-8 border-l-4 border-l-blue-600">
// //           <div>
// //             <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">Highest Active Package</p>
// //             <h3 className="text-3xl sm:text-4xl font-black text-[#0b1c3c] tracking-tight flex items-center gap-1 font-mono">
// //               <span className="text-blue-600 text-2xl">$</span>{userHighestPackage}
// //             </h3>
// //           </div>
// //           <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
// //             <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
// //           </div>
// //         </div>

       

// //         {/* ✅ COMPACT PACKAGE LIST (NO HUGE BOXES) */}
// //         <div className="flex flex-col gap-3 sm:gap-4">
// //           {PACKAGES.map((pkg) => {
// //             const isActive = purchasedPackages.includes(pkg) || userHighestPackage >= pkg;
            
// //             // 🔥 Special Logic for $100 Package Claim
// //             const isFree100Pending = pkg === 100 && !isActive;

            
// //           })}
// //         </div>

// //       </div>
// //     </div>
// //   );
// // }


// import React, { useState, useEffect } from "react";
// import api from "../../api/axios";
// import { useAuth } from "../../context/AuthContext";
// import { Package, Clock, CheckCircle2, Activity, ShieldAlert } from "lucide-react";

// const DailyROIPlan = () => {
//   const { user, token } = useAuth();
//   const [packages, setPackages] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserPackages = async () => {
//       if (!user?.userId || !token) return;
//       try {
//         setLoading(true);
//         const res = await api.get(`/user/packages/${user.userId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (res.data && res.data.success) {
//           setPackages(res.data.data || []);
//         }
//       } catch (err) {
//         console.error("Error fetching user packages:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserPackages();
//   }, [user?.userId, token]);

//   if (loading) {
//     return (
//       <div className="p-6 text-center text-slate-400 text-sm">
//         <Activity className="animate-pulse mx-auto mb-2 text-cyan-400" size={24} />
//         Loading your active packages...
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
//         <div>
//           <h3 className="text-slate-900 font-black text-base md:text-lg tracking-tight">Active Packages & Trade ROI</h3>
//           <p className="text-slate-500 text-xs font-medium">30 Days Cycle • 4% Daily Return</p>
//         </div>
//         <div className="bg-cyan-500/10 text-cyan-600 px-3 py-1 rounded-xl text-xs font-bold border border-cyan-500/20">
//           Total: {packages.length} Active
//         </div>
//       </div>

//       {packages.length === 0 ? (
//         <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-center">
//           <ShieldAlert className="mx-auto text-amber-500 mb-2" size={28} />
//           <p className="text-slate-800 font-bold text-sm">No Active Package Found</p>
//           <p className="text-slate-500 text-xs mt-1">Purchase a package from the dashboard to start earning daily 4% ROI.</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {packages.map((pkg, index) => {
//             const progress = Math.min(100, Math.round((pkg.daysCompleted / pkg.totalDays) * 100));

//             return (
//               <div 
//                 key={pkg._id || index} 
//                 className="bg-gradient-to-br from-slate-900 to-[#0a0f1e] border border-slate-800 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden flex flex-col justify-between"
//               >
//                 <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] pointer-events-none rounded-full"></div>

//                 <div>
//                   <div className="flex justify-between items-start mb-3">
//                     <div className="flex items-center gap-2.5">
//                       <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
//                         <Package size={18} />
//                       </div>
//                       <div>
//                         <h4 className="font-black text-sm text-white tracking-wide">Investment Package</h4>
//                         <p className="text-[11px] font-mono text-slate-400">ID: {pkg.userId}</p>
//                       </div>
//                     </div>
//                     <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${pkg.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'}`}>
//                       {pkg.status}
//                     </span>
//                   </div>

//                   <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/5 p-3 rounded-xl mb-3 text-center">
//                     <div>
//                       <p className="text-[10px] text-slate-400 font-medium uppercase">Amount</p>
//                       <p className="text-sm font-black text-white font-mono">${pkg.packageAmount}</p>
//                     </div>
//                     <div>
//                       <p className="text-[10px] text-slate-400 font-medium uppercase">Daily ROI (4%)</p>
//                       <p className="text-sm font-black text-emerald-400 font-mono">+${pkg.dailyRoi.toFixed(2)}</p>
//                     </div>
//                     <div>
//                       <p className="text-[10px] text-slate-400 font-medium uppercase">Total Return</p>
//                       <p className="text-sm font-black text-cyan-400 font-mono">${(pkg.packageAmount * 1.2).toFixed(0)}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex justify-between text-xs font-semibold mb-1.5">
//                     <span className="text-slate-400 flex items-center gap-1">
//                       <Clock size={12} /> Progress ({pkg.daysCompleted}/{pkg.totalDays} Days)
//                     </span>
//                     <span className="text-cyan-400 font-mono">{progress}%</span>
//                   </div>
                  
//                   {/* Progress Bar */}
//                   <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
//                     <div 
//                       className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
//                       style={{ width: `${progress}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DailyROIPlan;

import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Package, Clock, Activity, ShieldAlert } from "lucide-react";

const DailyROIPlan = () => {
  const { user, token } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPackages = async () => {
      if (!user?.userId || !token) return;
      try {
        setLoading(true);
        // Backend se user ke packages fetch kar rahe hain
        const res = await api.get(`/user/packages/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.success) {
          setPackages(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching user packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPackages();
  }, [user?.userId, token]);

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm bg-white rounded-[20px] shadow-sm border border-slate-100 mb-6">
        <Activity className="animate-pulse mx-auto mb-2 text-cyan-500" size={24} />
        Loading your active packages...
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-[20px] p-4 md:p-6 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] border border-slate-100 mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-[#0b1c3c] font-black text-base md:text-lg tracking-tight">Active Packages </h3>
          <p className="text-slate-400 text-xs font-medium">30 Days Cycle • 4% Daily Return</p>
        </div>
        <div className="bg-cyan-500/10 text-cyan-600 px-3 py-1 rounded-xl text-xs font-bold border border-cyan-500/20">
          Total: {packages.length} Packages
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-center">
          <ShieldAlert className="mx-auto text-amber-500 mb-2" size={28} />
          <p className="text-slate-800 font-bold text-sm">No Package Found</p>
          <p className="text-slate-500 text-xs mt-1">Purchase a package from the dashboard to start earning daily 4% ROI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg, index) => {
            // 30 days ke hisaab se progress calculate hoga
            const progress = Math.min(100, Math.round((pkg.daysCompleted / (pkg.totalDays || 30)) * 100));

            return (
              <div 
                key={pkg._id || index} 
                className="bg-gradient-to-br from-slate-900 to-[#0a0f1e] border border-slate-800 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] pointer-events-none rounded-full"></div>

                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Package size={18} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white tracking-wide">Investment Package</h4>
                        <p className="text-[11px] font-mono text-slate-400">ID: {pkg.userId}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${pkg.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'}`}>
                      {pkg.status}
                    </span>
                  </div>

                  {/* Package Financial Breakdown */}
                  <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/5 p-3 rounded-xl mb-3 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Amount</p>
                      <p className="text-sm font-black text-white font-mono">${pkg.packageAmount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Daily ROI (4%)</p>
                      <p className="text-sm font-black text-emerald-400 font-mono">+${pkg.dailyRoi ? pkg.dailyRoi.toFixed(2) : (pkg.packageAmount * 0.04).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Total Return</p>
                      <p className="text-sm font-black text-cyan-400 font-mono">${(pkg.packageAmount * 1.2).toFixed(0)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> Progress ({pkg.daysCompleted}/{pkg.totalDays || 30} Days)
                    </span>
                    <span className="text-cyan-400 font-mono">{progress}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyROIPlan;