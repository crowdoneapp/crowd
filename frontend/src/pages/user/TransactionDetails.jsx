import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api/axios"; 
import { getUserId } from "../../utils/authUtils";
import { Search, FileText, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, ListFilter, Activity, ChevronLeft, ChevronRight } from "lucide-react"; 

const TransactionDetails = () => {
  const userId = String(getUserId()); 
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // 🔥 PAGINATION FUNCTIONS (Ye component ke andar hone chahiye)
  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  useEffect(() => {
    if (!userId) return;
    
    setLoading(true);
    api.get(`/transaction/transactions/${userId}?t=${new Date().getTime()}`)
      .then((res) => {
        let sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        sorted = sorted.filter(txn => {
            const tType = (txn.type || "").toLowerCase();
            const tSource = (txn.source || "").toLowerCase();
            const tDesc = (txn.description || "").toLowerCase();
            const tUserId = String(txn.userId);
            const tFrom = String(txn.fromUserId);
            const tTo = String(txn.toUserId);
            const me = userId;

            if (tSource === "instant_leader_bonus" || tDesc.includes("instant leader bonus") || tDesc.includes("instant bonus")) return false;
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
  }, [userId]);

  const isCreditType = (type = "") => [
    "deposit", "credit_to_wallet", "roi_income", "referral_income", "topup_income", 
    "binary", "spin_income", "level_income", "direct_income", "plan_income", "transfer", 
    "reward_income", "fast_track" 
  ].includes(type.toLowerCase());
  
  const isDebitType = (type = "") => ["withdrawal","buy_spin","topup","transfer"].includes(type.toLowerCase());

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

  const formatAmount = (txn) => {
    const type = txn.type?.toLowerCase() || "";
    let amt = 0;
    if (txn.amount && typeof txn.amount === 'object' && txn.amount.$numberDecimal) amt = parseFloat(txn.amount.$numberDecimal);
    else if (txn.amount !== undefined && txn.amount !== null) amt = parseFloat(txn.amount);
    else amt = parseFloat(txn.grossAmount || 0);

    let colorClass = "text-white";
    let display = `$${isNaN(amt) ? "0.00" : amt.toFixed(2)}`;
    let icon = null;

    if (type === "transfer" || type === "topup") {
      if (String(txn.toUserId) === userId || String(txn.userId) === userId) { 
        if(type === "topup" && String(txn.userId) === userId && String(txn.fromUserId) !== userId) {
            display = `+$${amt.toFixed(2)}`; 
            colorClass = "text-emerald-400"; 
            icon = <ArrowDownLeft size={14} />;
        }
        else if(type === "transfer" && String(txn.toUserId) === userId) {
            display = `+$${amt.toFixed(2)}`; 
            colorClass = "text-emerald-400"; 
            icon = <ArrowDownLeft size={14} />;
        }
        else {
            display = `-$${amt.toFixed(2)}`; 
            colorClass = "text-rose-400"; 
            icon = <ArrowUpRight size={14} />;
        }
      } else {
        display = `-$${amt.toFixed(2)}`; 
        colorClass = "text-rose-400"; 
        icon = <ArrowUpRight size={14} />;
      }
    } else if (isCreditType(type)) { 
      display = `+$${amt.toFixed(2)}`; 
      colorClass = "text-emerald-400"; 
      icon = <ArrowDownLeft size={14} />;
    } else if (isDebitType(type)) { 
      display = `-$${Math.abs(amt).toFixed(2)}`; 
      colorClass = "text-rose-400"; 
      icon = <ArrowUpRight size={14} />;
    }

    return { display, colorClass, icon };
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500 font-sans">
      
      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.3); border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide flex items-center gap-3">
             <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.1)]">
               <FileText className="text-cyan-400" size={24} /> 
             </div>
             Master Ledger
          </h2>
          <p className="text-cyan-400/60 text-[10px] md:text-xs font-bold tracking-widest uppercase mt-2 ml-1">
            Complete audit trail of all assets
          </p>
        </div>
        
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-inner">
           <ListFilter size={16} className="text-cyan-400" />
           <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Total Records:</span>
           <span className="text-white font-black text-sm">{filtered.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 justify-between items-center bg-[#0f172a]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-inner">
        <div className="relative w-full lg:w-80 group">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <Search size={16} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
           </div>
           <input
             type="text"
             placeholder="Search tx hash, desc..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-black/40 border border-white/10 text-white text-sm font-bold tracking-wide rounded-xl px-4 py-3.5 pl-11 focus:border-cyan-400 focus:outline-none transition-all placeholder-slate-600 shadow-inner"
           />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
           <select
             value={filterType}
             onChange={(e) => setFilterType(e.target.value)}
             className="w-full sm:w-auto bg-black/40 border border-white/10 text-white text-sm font-bold rounded-xl px-4 py-3.5 focus:border-cyan-400 focus:outline-none transition-all appearance-none cursor-pointer uppercase shadow-inner outline-none"
           >
             <option value="all" className="bg-slate-900">All Types</option>
             <option value="credit" className="bg-slate-900">Credits</option>
             <option value="debit" className="bg-slate-900">Debits</option>
           </select>

           <select
             value={itemsPerPage}
             onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
             className="w-full sm:w-auto bg-black/40 border border-white/10 text-white text-sm font-bold rounded-xl px-4 py-3.5 focus:border-cyan-400 focus:outline-none transition-all appearance-none cursor-pointer shadow-inner outline-none"
           >
             <option value={10} className="bg-slate-900">10 Rows</option>
             <option value={20} className="bg-slate-900">20 Rows</option>
             <option value={50} className="bg-slate-900">50 Rows</option>
           </select>
        </div>
      </div>

      {/* Table Box */}
      <div className="bg-[#0f172a]/60 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.3)] rounded-3xl border border-white/5 overflow-hidden relative">
        <div className="overflow-x-auto custom-scroll w-full relative z-10">
          <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
            <thead className="bg-black/40 text-cyan-400 text-[10px] md:text-xs uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="p-5 font-black text-center">Sr.</th>
                <th className="p-5 font-black">Date & Time</th>
                <th className="p-5 font-black">Event Type</th>
                <th className="p-5 font-black text-center">Amount</th>
                <th className="p-5 font-black">From UserId</th>
                <th className="p-5 font-black">To UserId</th>
                <th className="p-5 font-black">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16">
                     <div className="flex flex-col items-center justify-center gap-3">
                        <Activity size={28} className="text-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/70">Syncing Ledger...</span>
                     </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16">
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-widest bg-black/40 px-6 py-3 rounded-xl border border-white/5">
                      No Records Found
                    </span>
                  </td>
                </tr>
              ) : (
                paginated.map((txn, idx) => {
                  const date = new Date(txn.createdAt || txn.date);
                  const { display, colorClass, icon } = formatAmount(txn);
                  
                  return (
                    <tr key={txn._id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-5 font-bold text-slate-500 text-center">{indexOfFirst + idx + 1}</td>
                      <td className="p-5 text-slate-400 font-mono text-[11px]">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white font-bold">{date.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span className="text-slate-500 text-[10px]">{date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        </div>
                      </td>
                      <td className="p-5">
                         <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest text-cyan-100 uppercase">
                            {icon} {(txn.type || "-").replace(/_/g, " ").toUpperCase()}
                         </span>
                      </td>
                      <td className={`p-5 font-black text-center text-sm font-mono ${colorClass} drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]`}>
                        {display}
                      </td>
                      <td className="p-5 font-mono text-slate-300 text-[11px]">
                         {txn.fromUserId ? <span className="bg-black/40 px-3 py-1.5 border border-white/5 rounded-lg">{String(txn.fromUserId) === userId ? "Self" : txn.fromUserId}</span> : "-"}
                      </td>
                      <td className="p-5 font-mono text-slate-300 text-[11px]">
                         {txn.toUserId ? <span className="bg-black/40 px-3 py-1.5 border border-white/5 rounded-lg">{String(txn.toUserId) === userId ? "Self" : txn.toUserId}</span> : "-"}
                      </td>
                      <td className="p-5 text-white text-[11px] font-bold tracking-wide capitalize max-w-[200px] truncate" title={txn.description}>
                        {txn.description 
                            ? txn.description.replace(/\s*\(Leader\)/gi, "").replace(/leader settlement:?\s*/gi, "").replace(/(singel|single)\s?leg/gi, "Community Income").replace(/pool/gi, "Community Income").replace(/unlocked/gi, "").trim()
                            : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && filtered.length > 0 && (
           <div className="p-5 border-t border-white/5 bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
              <span className="text-cyan-400/60 text-[10px] font-black uppercase tracking-widest">
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} Entries
              </span>
              
              <div className="flex items-center gap-2">
                 <button
                   onClick={handlePrev}
                   disabled={currentPage === 1}
                   className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${currentPage === 1 ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-transparent' : 'bg-white/5 text-cyan-400 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 active:scale-95'}`}
                 >
                   <ChevronLeft size={16} strokeWidth={2.5} />
                 </button>
                 
                 <span className="bg-black/40 border border-white/10 text-white text-[11px] font-black font-mono px-4 py-2.5 rounded-xl shadow-inner">
                    {currentPage} / {totalPages}
                 </span>
                 
                 <button
                   onClick={handleNext}
                   disabled={currentPage === totalPages}
                   className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${currentPage === totalPages ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-transparent' : 'bg-white/5 text-cyan-400 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 active:scale-95'}`}
                 >
                   <ChevronRight size={16} strokeWidth={2.5} />
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetails;