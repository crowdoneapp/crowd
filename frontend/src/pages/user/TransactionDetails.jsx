// import React, { useEffect, useState } from "react";
// import api from "../../api/axios";
// import { format } from "date-fns";
// import { Search, ChevronLeft, ChevronRight, Wallet, History, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Zap, Landmark, Activity, ListFilter, FileText } from "lucide-react";

// const TransactionDetails = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState("");
//   const [filterType, setFilterType] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [loading, setLoading] = useState(true);
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const userStr = localStorage.getItem("user");
//     if (!userStr) { setLoading(false); return; }
//     try {
//       const parsedUser = JSON.parse(userStr);
//       if (!parsedUser?.userId) throw new Error("Invalid user");
//       const uid = String(parsedUser.userId);
//       setUserId(uid);

//       setLoading(true);
//       api.get(`/transaction/transactions/${uid}?t=${new Date().getTime()}`)
//         .then((res) => {
//           let sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//           sorted = sorted.filter(txn => {
//               const tType = (txn.type || "").toLowerCase();
//               const tSource = (txn.source || "").toLowerCase();
//               const tDesc = (txn.description || "").toLowerCase();
//               const tUserId = String(txn.userId);
//               const tFrom = String(txn.fromUserId);
//               const tTo = String(txn.toUserId);
//               const me = uid;

//               // 🔥 1. Instant Leader Bonus Hide Kiya
//               if (tSource === "instant_leader_bonus" || tDesc.includes("instant leader bonus") || tDesc.includes("instant bonus")) return false;
              
//               // 🔥 2. Setup/Super Setup Setting Income Hide Kiya (5% aur 10% wala)
//               if (tSource === "setting_income" || tDesc.includes("setting income")) return false;

//               // 🔥 3. Promoted entries hide ki
//               if (tDesc.includes("promoted to setup") || tDesc.includes("promoted to super")) return false;

//               if (tType === "topup" && txn.description?.toUpperCase().includes("PROMOTION")) return false;
//               if (tUserId === me) return true;
//               if (tType === "transfer" || tType === "topup") {
//                   if (tFrom === me || tTo === me) return true;
//               }
//               return false;
//           });

//           setTransactions(sorted);
//           setFiltered(sorted);
//         })
//         .catch((err) => {
//           console.error("Failed to fetch transactions", err);
//           setTransactions([]);
//           setFiltered([]);
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     } catch { setLoading(false); }
//   }, []);

//   // 🔥 manual_credit ko credit type me daal diya taaki wo +$ banke green aaye
//   const isCreditType = (type = "") => [
//     "deposit", "credit_to_wallet", "roi_income", "referral_income", "topup_income", 
//     "binary", "spin_income", "level_income", "direct_income", "plan_income", "transfer", 
//     "reward_income", "fast_track", "manual_credit" 
//   ].includes(type.toLowerCase());
  
//   const isDebitType = (type = "") => ["withdrawal","buy_spin","topup","transfer", "manual_debit"].includes(type.toLowerCase());

//   useEffect(() => {
//     let result = [...transactions];

//     if (search.trim() !== "") {
//       const value = search.toLowerCase();
//       result = result.filter(
//         (txn) =>
//           txn.type?.toLowerCase().includes(value) ||
//           txn.description?.toLowerCase().includes(value) ||
//           String(txn.fromUserId || "").includes(value) ||
//           String(txn.toUserId || "").includes(value)
//       );
//     }

//     if (filterType === "credit") {
//         result = result.filter(txn => isCreditType(txn.type) && String(txn.fromUserId) !== userId);
//     } 
//     else if (filterType === "debit") {
//         result = result.filter(txn => isDebitType(txn.type) && String(txn.toUserId) !== userId);
//     }

//     setFiltered(result);
//     setCurrentPage(1);
//   }, [search, filterType, transactions, userId]);

//   const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const paginated = filtered.slice(indexOfFirst, indexOfLast);

//   // 🔥 FIXED: Yahan handlePrev aur handleNext wapas add kar diye gaye hain
//   const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
//   const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

//   const formatAmount = (txn) => {
//     const type = txn.type?.toLowerCase() || "";
//     let amt = 0;
//     if (txn.amount && typeof txn.amount === 'object' && txn.amount.$numberDecimal) amt = parseFloat(txn.amount.$numberDecimal);
//     else if (txn.amount !== undefined && txn.amount !== null) amt = parseFloat(txn.amount);
//     else amt = parseFloat(txn.grossAmount || 0);

//     let colorClass = "text-slate-300";
//     let display = `$${isNaN(amt) ? "0.00" : amt.toFixed(2)}`;
//     let icon = null;

//     if (type === "transfer" || type === "topup") {
//       if (String(txn.toUserId) === userId || String(txn.userId) === userId) { 
//         if(type === "topup" && String(txn.userId) === userId && String(txn.fromUserId) !== userId) {
//             display = `+$${amt.toFixed(2)}`; 
//             colorClass = "text-emerald-400"; 
//             icon = <ArrowDownLeft size={14} className="text-emerald-400" />;
//         }
//         else if(type === "transfer" && String(txn.toUserId) === userId) {
//             display = `+$${amt.toFixed(2)}`; 
//             colorClass = "text-emerald-400"; 
//             icon = <ArrowDownLeft size={14} className="text-emerald-400" />;
//         }
//         else {
//             display = `-$${amt.toFixed(2)}`; 
//             colorClass = "text-rose-400"; 
//             icon = <ArrowUpRight size={14} className="text-rose-400" />;
//         }
//       } else {
//         display = `-$${amt.toFixed(2)}`; 
//         colorClass = "text-rose-400"; 
//         icon = <ArrowUpRight size={14} className="text-rose-400" />;
//       }
//     } else if (isCreditType(type)) { 
//       display = `+$${amt.toFixed(2)}`; 
//       colorClass = "text-emerald-400"; 
//       icon = <ArrowDownLeft size={14} className="text-emerald-400" />;
//     } else if (isDebitType(type)) { 
//       display = `-$${Math.abs(amt).toFixed(2)}`; 
//       colorClass = "text-rose-400"; 
//       icon = <ArrowUpRight size={14} className="text-rose-400" />;
//     }

//     return { display, colorClass, icon };
//   };

//   return (
//     <div className="w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10 animate-in fade-in duration-500 rounded-3xl bg-[#0b0f19] shadow-2xl border border-slate-800 overflow-hidden font-sans">
      
//       <style>{`
//         .crowd-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
//         .crowd-scroll::-webkit-scrollbar-track { background: #0f172a; border-radius: 10px; }
//         .crowd-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
//         .crowd-scroll::-webkit-scrollbar-thumb:hover { background: #eab308; }
//       `}</style>

//       {/* Header */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
//         <div>
//           <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 uppercase tracking-wide flex items-center gap-3">
//              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.15)]">
//                 <FileText className="text-amber-400" size={24} /> 
//              </div>
//              Master Ledger
//           </h2>
//           <p className="text-slate-400 text-xs md:text-sm font-medium tracking-widest uppercase mt-2 ml-1">
//             Complete audit trail of all assets
//           </p>
//         </div>
        
//         <div className="bg-[#131b2f] border border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-inner">
//            <ListFilter size={16} className="text-amber-400" />
//            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Records:</span>
//            <span className="text-white font-black text-sm">{filtered.length}</span>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col lg:flex-row gap-4 mb-8 justify-between items-center bg-[#131b2f] shadow-inner p-4 rounded-2xl border border-slate-800">
//         <div className="relative w-full lg:w-80 group">
//            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//              <Search size={16} className="text-slate-500 group-focus-within:text-amber-400 transition-colors" />
//            </div>
//            <input
//              type="text"
//              placeholder="Search tx hash, desc..."
//              value={search}
//              onChange={(e) => setSearch(e.target.value)}
//              className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 text-sm font-bold tracking-wide rounded-xl px-4 py-3.5 pl-11 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder-slate-600 shadow-inner"
//            />
//         </div>

//         <div className="flex items-center gap-3 w-full lg:w-auto">
//            <select
//              value={filterType}
//              onChange={(e) => setFilterType(e.target.value)}
//              className="w-full sm:w-auto bg-[#0b0f19] border border-slate-700 text-slate-200 text-sm font-bold rounded-xl px-4 py-3.5 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all appearance-none cursor-pointer uppercase shadow-inner outline-none"
//            >
//              <option value="all" className="bg-[#0b0f19] text-slate-200">All Types</option>
//              <option value="credit" className="bg-[#0b0f19] text-slate-200">Credits</option>
//              <option value="debit" className="bg-[#0b0f19] text-slate-200">Debits</option>
//            </select>

//            <select
//              value={itemsPerPage}
//              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
//              className="w-full sm:w-auto bg-[#0b0f19] border border-slate-700 text-slate-200 text-sm font-bold rounded-xl px-4 py-3.5 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all appearance-none cursor-pointer shadow-inner outline-none"
//            >
//              <option value={10} className="bg-[#0b0f19] text-slate-200">10 Rows</option>
//              <option value={20} className="bg-[#0b0f19] text-slate-200">20 Rows</option>
//              <option value={50} className="bg-[#0b0f19] text-slate-200">50 Rows</option>
//            </select>
//         </div>
//       </div>

//       {/* Table Box */}
//       <div className="w-full">
//         <div className="overflow-x-auto crowd-scroll w-full pb-4">
//           <div className="min-w-[900px]">
//             <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
//               <thead className="bg-[#1a233a] border-b border-slate-700/50 text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest">
//                 <tr>
//                   <th className="p-5 text-center rounded-tl-xl">Sr.</th>
//                   <th className="p-5">Date & Time</th>
//                   <th className="p-5">Event Type</th>
//                   <th className="p-5 text-center">Amount</th>
//                   <th className="p-5">From UserId</th>
//                   <th className="p-5">To UserId</th>
//                   <th className="p-5 rounded-tr-xl">Description</th>
//                 </tr>
//               </thead>
//               <tbody className="text-slate-300">
//                 {loading ? (
//                   <tr>
//                     <td colSpan="7" className="text-center py-16 bg-[#131b2f] border-b border-slate-800">
//                        <div className="flex flex-col items-center justify-center gap-3">
//                           <Activity size={28} className="text-amber-400 animate-pulse" />
//                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Syncing Ledger...</span>
//                        </div>
//                     </td>
//                   </tr>
//                 ) : paginated.length === 0 ? (
//                   <tr>
//                     <td colSpan="7" className="text-center py-16 bg-[#131b2f] border-b border-slate-800">
//                       <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">
//                         No Records Found
//                       </span>
//                     </td>
//                   </tr>
//                 ) : (
//                   paginated.map((txn, idx) => {
//                     const date = new Date(txn.createdAt || txn.date);
//                     const { display, colorClass, icon } = formatAmount(txn);
                    
//                     return (
//                       <tr key={txn._id || idx} className="bg-[#131b2f] hover:bg-[#1a233a] border-b border-slate-800 transition-colors">
//                         <td className="p-5 font-bold text-slate-500 text-center">{indexOfFirst + idx + 1}</td>

//                         <td className="p-5 text-slate-200 font-mono text-[12px] sm:text-sm font-bold tracking-wide">
//                           {txn.createdAt || txn.date ? format(new Date(txn.createdAt || txn.date), "dd MMM yyyy, hh:mm a") : 'N/A'}
//                         </td>

//                         <td className="p-5">
//                            <span className="inline-flex items-center gap-1.5 bg-[#0b0f19] border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest text-slate-300 uppercase">
//                               {/* 🔥 MANUAL CREDIT KO DEPOSIT ME CHANGE KIYA GAYA */}
//                               {icon} {txn.type?.toLowerCase() === "manual_credit" ? "DEPOSIT" : (txn.type || "-").replace(/_/g, " ").toUpperCase()}
//                            </span>
//                         </td>

//                         <td className={`p-5 font-black text-center text-sm font-mono ${colorClass}`}>
//                           {display}
//                         </td>

//                         <td className="p-5 font-mono text-slate-300 text-xs">
//                            {txn.fromUserId ? <span className="bg-[#0b0f19] px-3 py-1.5 border border-slate-700 rounded-lg">{String(txn.fromUserId) === userId ? "Self" : txn.fromUserId}</span> : "-"}
//                         </td>

//                         <td className="p-5 font-mono text-slate-300 text-xs">
//                            {txn.toUserId ? <span className="bg-[#0b0f19] px-3 py-1.5 border border-slate-700 rounded-lg">{String(txn.toUserId) === userId ? "Self" : txn.toUserId}</span> : "-"}
//                         </td>

//                         <td className="p-5 text-slate-400 text-[11px] md:text-xs font-medium tracking-wide capitalize max-w-[200px] truncate" title={txn.description}>
//                           {/* 🔥 NODE KO PACKAGE ME CHANGE KIYA GAYA */}
//                           {txn.description 
//                               ? txn.description
//                                  .replace(/\s*\(Leader\)/gi, "")
//                                  .replace(/leader settlement:?\s*/gi, "")
//                                  .replace(/(singel|single)\s?leg/gi, "Community Income")
//                                  .replace(/pool/gi, "Community Income")
//                                  .replace(/unlocked/gi, "")
//                                  .replace(/node/gi, "Package") 
//                                  .trim()
//                               : "-"}
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Pagination Footer */}
//         {!loading && filtered.length > 0 && (
//            <div className="mt-6 p-4 bg-[#1a233a] rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
//               <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
//                 Showing <span className="text-amber-400">{indexOfFirst + 1}</span> to <span className="text-amber-400">{Math.min(indexOfLast, filtered.length)}</span> of <span className="text-amber-400">{filtered.length}</span> Entries
//               </span>
              
//               <div className="flex items-center gap-2">
//                  <button
//                    onClick={handlePrev}
//                    disabled={currentPage === 1}
//                    className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${currentPage === 1 ? 'bg-[#0b0f19] text-slate-600 cursor-not-allowed border border-slate-800' : 'bg-[#131b2f] text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 border border-slate-700'}`}
//                  >
//                    <ChevronLeft size={16} strokeWidth={2.5} />
//                  </button>
                 
//                  <span className="bg-[#131b2f] border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-lg">
//                     {currentPage} <span className="text-slate-600 mx-1">/</span> {totalPages}
//                  </span>
                 
//                  <button
//                    onClick={handleNext}
//                    disabled={currentPage === totalPages}
//                    className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages ? 'bg-[#0b0f19] text-slate-600 cursor-not-allowed border border-slate-800' : 'bg-[#131b2f] text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 border border-slate-700'}`}
//                  >
//                    <ChevronRight size={16} strokeWidth={2.5} />
//                  </button>
//               </div>
//            </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TransactionDetails;

import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { format } from "date-fns";
import { Search, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, Activity, ListFilter, FileText } from "lucide-react";

// ✅ Light Neo-Banking Theme
const customStyles = `
  .neo-bg {
    background-color: #f8fafc;
    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .neo-table-wrapper {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04);
  }
  .crowd-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
  .crowd-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
  .crowd-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  .crowd-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

const TransactionDetails = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { setLoading(false); return; }
    try {
      const parsedUser = JSON.parse(userStr);
      if (!parsedUser?.userId) throw new Error("Invalid user");
      const uid = String(parsedUser.userId);
      setUserId(uid);

      setLoading(true);
      api.get(`/transaction/transactions/${uid}?t=${new Date().getTime()}`)
        .then((res) => {
          let sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          sorted = sorted.filter(txn => {
              const tType = (txn.type || "").toLowerCase();
              const tSource = (txn.source || "").toLowerCase();
              const tDesc = (txn.description || "").toLowerCase();
              const tUserId = String(txn.userId);
              const tFrom = String(txn.fromUserId);
              const tTo = String(txn.toUserId);
              const me = uid;

              // 🔥 Filter out unwanted records
              if (tSource === "instant_leader_bonus" || tDesc.includes("instant leader bonus") || tDesc.includes("instant bonus")) return false;
              if (tSource === "setting_income" || tDesc.includes("setting income")) return false;
              if (tDesc.includes("promoted to setup") || tDesc.includes("promoted to super")) return false;
              if (tType === "topup" && txn.description?.toUpperCase().includes("PROMOTION")) return false;

              if (tUserId === me) return true;
              if (tType === "transfer" || tType === "topup") {
                  if (tFrom === me || tTo === me) return true;
              }
              return false;
          });

          setTransactions(sorted);
          setFiltered(sorted);
        })
        .catch((err) => {
          console.error("Failed to fetch transactions", err);
          setTransactions([]);
          setFiltered([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch { setLoading(false); }
  }, []);

  const isCreditType = (type = "") => [
    "deposit", "credit_to_wallet", "roi_income", "referral_income", "topup_income", 
    "binary", "spin_income", "level_income", "direct_income", "plan_income", "transfer", 
    "reward_income", "fast_track", "manual_credit" 
  ].includes(type.toLowerCase());
  
  const isDebitType = (type = "") => ["withdrawal","buy_spin","topup","transfer", "manual_debit"].includes(type.toLowerCase());

  useEffect(() => {
    let result = [...transactions];

    if (search.trim() !== "") {
      const value = search.toLowerCase();
      result = result.filter(
        (txn) =>
          txn.type?.toLowerCase().includes(value) ||
          txn.description?.toLowerCase().includes(value) ||
          String(txn.fromUserId || "").includes(value) ||
          String(txn.toUserId || "").includes(value)
      );
    }

    if (filterType === "credit") {
        result = result.filter(txn => isCreditType(txn.type) && String(txn.fromUserId) !== userId);
    } 
    else if (filterType === "debit") {
        result = result.filter(txn => isDebitType(txn.type) && String(txn.toUserId) !== userId);
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [search, filterType, transactions, userId]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginated = filtered.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  const formatAmount = (txn) => {
    const type = txn.type?.toLowerCase() || "";
    let amt = 0;
    if (txn.amount && typeof txn.amount === 'object' && txn.amount.$numberDecimal) amt = parseFloat(txn.amount.$numberDecimal);
    else if (txn.amount !== undefined && txn.amount !== null) amt = parseFloat(txn.amount);
    else amt = parseFloat(txn.grossAmount || 0);

    let colorClass = "text-slate-500";
    let display = `$${isNaN(amt) ? "0.00" : amt.toFixed(2)}`;
    let icon = null;

    if (type === "transfer" || type === "topup") {
      if (String(txn.toUserId) === userId || String(txn.userId) === userId) { 
        if(type === "topup" && String(txn.userId) === userId && String(txn.fromUserId) !== userId) {
            display = `+$${amt.toFixed(2)}`; 
            colorClass = "text-emerald-600"; 
            icon = <ArrowDownLeft size={14} className="text-emerald-600" />;
        }
        else if(type === "transfer" && String(txn.toUserId) === userId) {
            display = `+$${amt.toFixed(2)}`; 
            colorClass = "text-emerald-600"; 
            icon = <ArrowDownLeft size={14} className="text-emerald-600" />;
        }
        else {
            display = `-$${amt.toFixed(2)}`; 
            colorClass = "text-rose-600"; 
            icon = <ArrowUpRight size={14} className="text-rose-600" />;
        }
      } else {
        display = `-$${amt.toFixed(2)}`; 
        colorClass = "text-rose-600"; 
        icon = <ArrowUpRight size={14} className="text-rose-600" />;
      }
    } else if (isCreditType(type)) { 
      display = `+$${amt.toFixed(2)}`; 
      colorClass = "text-emerald-600"; 
      icon = <ArrowDownLeft size={14} className="text-emerald-600" />;
    } else if (isDebitType(type)) { 
      display = `-$${Math.abs(amt).toFixed(2)}`; 
      colorClass = "text-rose-600"; 
      icon = <ArrowUpRight size={14} className="text-rose-600" />;
    }

    return { display, colorClass, icon };
  };

  return (
    <div className="neo-bg min-h-screen w-full py-6 md:py-10 text-slate-800 relative font-sans">
      <style>{customStyles}</style>

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto pb-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#0b1c3c] tracking-tight flex items-center gap-3">
               <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                  <FileText className="text-blue-600" size={24} /> 
               </div>
               Master Ledger
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium tracking-widest uppercase mt-2 ml-1">
              Complete audit trail of all assets
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
             <ListFilter size={16} className="text-blue-600" />
             <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Records:</span>
             <span className="text-[#0b1c3c] font-black text-sm">{filtered.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 justify-between items-center bg-white shadow-sm p-4 rounded-2xl border border-slate-200">
          <div className="relative w-full lg:w-80 group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <Search size={16} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
             </div>
             <input
               type="text"
               placeholder="Search tx hash, desc..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold tracking-wide rounded-xl px-4 py-3.5 pl-11 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder-slate-400"
             />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
             <select
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
               className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-3.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none cursor-pointer uppercase outline-none"
             >
               <option value="all">All Types</option>
               <option value="credit">Credits</option>
               <option value="debit">Debits</option>
             </select>

             <select
               value={itemsPerPage}
               onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
               className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-3.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none cursor-pointer outline-none"
             >
               <option value={10}>10 Rows</option>
               <option value={20}>20 Rows</option>
               <option value={50}>50 Rows</option>
             </select>
          </div>
        </div>

        {/* Table wrapper */}
        <div className="w-full neo-table-wrapper">
          <div className="overflow-x-auto crowd-scroll w-full">
            <div className="min-w-[950px]">

              {/* Header row */}
              <div className="bg-[#0b1c3c] text-white rounded-t-xl px-6 py-4 grid grid-cols-7 gap-3 text-[11px] md:text-xs font-bold uppercase tracking-wider">
                <div className="text-center">Sr.</div>
                <div className="text-right">Date & Time</div>
                <div>Type</div>
                <div>Amount</div>
                <div>Balance</div>
                <div>From / To</div>
                <div>Details</div>
              </div>

              {/* Rows */}
              <div>
                {loading ? (
                  <div className="bg-white py-16 text-center">
                    <Activity size={32} className="text-blue-500 animate-pulse mx-auto mb-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing Statement...</span>
                  </div>
                ) : paginated.length === 0 ? (
                  <div className="bg-white py-16 text-center">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">No Transactions Found</span>
                  </div>
                ) : (
                  paginated.map((txn, idx) => {
                    // 🔥 Yahan error fix kiya hai (indexOfFirstItem -> indexOfFirst)
                    const serialNumber = indexOfFirst + idx + 1;
                    
                    let partyInfo = "-";

                    if (txn.type === "fast_track") {
                      partyInfo = txn.fromUserId ? `From: ${txn.fromUserId}` : "-";
                    }
                    else if (String(txn.fromUserId) === userId && String(txn.toUserId) === userId) {
                      partyInfo = "Self";
                    }
                    else if (String(txn.fromUserId) === userId) {
                      partyInfo = `To: ${txn.toUserId}`;
                    }
                    else if (String(txn.toUserId) === userId) {
                      partyInfo = `From: ${txn.fromUserId}`;
                    }
                    else if (txn.type === "topup" && !txn.fromUserId && String(txn.userId) === userId) {
                      partyInfo = "Self";
                    }

                    const { display, colorClass, icon } = formatAmount(txn);

                    return (
                      <div
                        key={`${txn._id}-${txn.createdAt}-${idx}`}
                        className="bg-white hover:bg-slate-50 px-6 py-4 grid grid-cols-7 gap-3 items-center border-b border-slate-100 transition-colors"
                      >
                        <div className="font-bold text-slate-500 text-center">{serialNumber}</div>

                        <div className="text-slate-600 font-mono text-[11px] sm:text-xs font-semibold tracking-wide text-right">
                          {txn.createdAt ? format(new Date(txn.createdAt), "dd MMM yyyy, hh:mm a") : "N/A"}
                        </div>

                        <div>
                          <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-widest text-slate-600 uppercase">
                            {icon} {txn.type?.toLowerCase() === "manual_credit" ? "DEPOSIT" : (txn.type || "-").replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className={`font-black font-mono text-sm ${colorClass}`}>
                          {display}
                        </div>

                        <div className="font-black text-[#0b1c3c] font-mono text-sm">
                          -
                        </div>

                        <div className="font-mono text-slate-600 text-xs">
                          {partyInfo !== "-" ? <span className="bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-lg">{partyInfo}</span> : "-"}
                        </div>

                        <div className="text-slate-500 text-[11px] md:text-xs font-medium tracking-wide capitalize truncate" title={txn.description || "-"}>
                          {txn.description
                            ? txn.description
                                .replace(/\s*\(Leader\)/gi, "")
                                .replace(/leader settlement:?\s*/gi, "")
                                .replace(/(singel|single)\s?leg/gi, "Community Income")
                                .replace(/pool/gi, "Community Income")
                                .replace(/unlocked/gi, "")
                                .replace(/node/gi, "Package") 
                                .trim()
                            : "-"}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>

          {/* Pagination Footer */}
          {!loading && filtered.length > 0 && (
            <div className="bg-[#f8fafc] border-t border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-16">
              
              <span className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                Showing <span className="text-[#0b1c3c] font-black">{indexOfFirst + 1}</span> to <span className="text-[#0b1c3c] font-black">{Math.min(indexOfLast, filtered.length)}</span> of <span className="text-[#0b1c3c] font-black">{filtered.length}</span>
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                    currentPage === 1
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm"
                  }`}
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                
                <span className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm">
                  {currentPage} <span className="text-slate-400 mx-1">/</span> {totalPages}
                </span>
                
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                    currentPage === totalPages
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm"
                  }`}
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;