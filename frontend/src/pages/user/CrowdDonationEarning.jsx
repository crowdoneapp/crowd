import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { format } from "date-fns";
import { Search, ChevronLeft, ChevronRight, Layers, Target, Activity, CheckCircle2, DollarSign, CalendarDays, TrendingUp, Clock } from "lucide-react";

const CrowdDonationEarning = () => {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { setLoading(false); return; }
    try {
      const parsedUser = JSON.parse(userStr);
      if (!parsedUser?.userId) throw new Error("Invalid user");
      const uid = String(parsedUser.userId);

      setLoading(true);
      api.get(`/transaction/transactions/${uid}?t=${new Date().getTime()}`)
        .then((res) => {
          // 🔥 1. Filter ONLY Pool / Crowd Donation Income
          const poolTxns = (res.data || []).filter(txn => {
              const tSource = (txn.source || "").toLowerCase();
              const tDesc = (txn.description || "").toLowerCase();
              return tSource === "pool" || tDesc.includes("crowd donation");
          }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          // 🔥 2. Parse Description to generate Progress Bars
          const summaryMap = {};
          let totalAmt = 0;

          const processedTxns = poolTxns.map(txn => {
              const desc = txn.description || "";
              let amt = 0;
              if (txn.amount && typeof txn.amount === 'object' && txn.amount.$numberDecimal) amt = parseFloat(txn.amount.$numberDecimal);
              else if (txn.amount !== undefined && txn.amount !== null) amt = parseFloat(txn.amount);
              else amt = parseFloat(txn.grossAmount || 0);

              totalAmt += amt;

              // Regex to extract Level, Tier, Day, TotalDays
              // Expected desc: "Daily Crowd Donation Earning Level 1 ($100 Tier) (Day 5 of 90)"
              const match = desc.match(/Level\s+(\d+)\s+\(\$(\d+)\s+Tier\)\s+\(Day\s+(\d+)\s+of\s+(\d+)\)/i);
              
              let level = "-", tier = "-", day = 0, totalDays = 90;
              if (match) {
                  level = match[1];
                  tier = match[2];
                  day = parseInt(match[3]);
                  totalDays = parseInt(match[4]);

                  const key = `T${tier}-L${level}`;
                  
                  if (!summaryMap[key]) {
                      summaryMap[key] = {
                          tier,
                          level,
                          daysPaid: day,
                          totalDays,
                          dailyAmount: amt,
                          totalEarned: 0,
                          lastDate: txn.createdAt || txn.date,
                          status: day >= totalDays ? 'COMPLETED' : 'ACTIVE'
                      };
                  }
                  
                  summaryMap[key].totalEarned += amt;
                  
                  // Keep track of the highest day paid for the progress bar
                  if (day > summaryMap[key].daysPaid) {
                      summaryMap[key].daysPaid = day;
                      summaryMap[key].lastDate = txn.createdAt || txn.date;
                      if (day >= totalDays) summaryMap[key].status = 'COMPLETED';
                  }
              }

              return { ...txn, parsedAmount: amt, parsedLevel: level, parsedTier: tier, parsedDay: day, parsedTotalDays: totalDays };
          });

          // Convert map to array and sort (Highest Tier First, then Level)
          const summaryArray = Object.values(summaryMap).sort((a, b) => Number(b.tier) - Number(a.tier) || Number(a.level) - Number(b.level));

          setHistory(processedTxns);
          setFiltered(processedTxns);
          setSummary(summaryArray);
          setTotalEarned(totalAmt);
        })
        .catch((err) => console.error("Failed to fetch pool transactions", err))
        .finally(() => setLoading(false));
    } catch { setLoading(false); }
  }, []);

  useEffect(() => {
    let result = [...history];
    if (search.trim() !== "") {
      const value = search.toLowerCase();
      result = result.filter(
        (txn) =>
          txn.description?.toLowerCase().includes(value) ||
          String(txn.parsedTier).includes(value) ||
          String(txn.parsedLevel).includes(value)
      );
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [search, history]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginated = filtered.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10 animate-in fade-in duration-500 rounded-3xl bg-[#0b0f19] shadow-2xl border border-slate-800 overflow-hidden font-sans mt-10 md:mt-2">
      
      <style>{`
        .crowd-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .crowd-scroll::-webkit-scrollbar-track { background: #0f172a; border-radius: 10px; }
        .crowd-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .crowd-scroll::-webkit-scrollbar-thumb:hover { background: #eab308; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 uppercase tracking-wide flex items-center gap-3">
             <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                <Target className="text-amber-400" size={24} /> 
             </div>
             Crowd Donation
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-medium tracking-widest uppercase mt-2 ml-1">
            Track your daily pool progress & earnings
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a233a] to-[#131b2f] border border-slate-700 px-6 py-4 rounded-2xl flex flex-col items-end shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 blur-[30px] rounded-full"></div>
           <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Total Donated to You</span>
           <span className="text-amber-400 font-black text-2xl relative z-10 font-mono tracking-tight">${totalEarned.toFixed(2)}</span>
        </div>
      </div>

      {/* ==========================================
          🔥 ACTIVE POOLS TRACKER (PROGRESS BARS)
          ========================================== */}
      {summary.length > 0 && (
        <div className="mb-10">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2">
               <TrendingUp size={16} className="text-amber-400" /> Active Level Trackers
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {summary.map((pool, idx) => {
                    const percent = Math.min((pool.daysPaid / pool.totalDays) * 100, 100).toFixed(1);
                    const isCompleted = pool.status === 'COMPLETED';

                    return (
                        <div key={idx} className="bg-[#131b2f] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
                            {/* Decorative Background */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full group-hover:bg-amber-500/10 transition-colors"></div>
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-slate-800 text-slate-300 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-slate-700">
                                            Level {pool.level}
                                        </span>
                                        {isCompleted ? (
                                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest">
                                                <CheckCircle2 size={10} /> Completed
                                            </span>
                                        ) : (
                                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest animate-pulse">
                                                <Activity size={10} /> Active
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-lg font-black text-white font-mono tracking-tight">${pool.tier} <span className="text-slate-500 text-xs font-sans tracking-wide">Package</span></h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Daily</p>
                                    <p className="text-emerald-400 font-black font-mono">+${pool.dailyAmount.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative z-10 mb-4">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    <span>Day {pool.daysPaid}</span>
                                    <span>{pool.totalDays} Days</span>
                                </div>
                                <div className="w-full bg-[#0b0f19] rounded-full h-2.5 border border-slate-800 p-0.5 shadow-inner">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]'}`}
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                                <p className="text-right text-[9px] font-bold text-slate-500 mt-1.5 font-mono">{percent}% Paid</p>
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                    <Clock size={12} /> Last Paid
                                </div>
                                <div className="text-slate-200 font-mono text-[11px] font-bold tracking-wide">
                                    {pool.lastDate ? format(new Date(pool.lastDate), "dd MMM yyyy") : 'N/A'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* ==========================================
          🔥 HISTORY TABLE
          ========================================== */}
      <div>
        <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2">
           <Layers size={16} className="text-amber-400" /> Daily Credit Logs
        </h3>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center bg-[#131b2f] shadow-inner p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                </div>
                <input
                type="text"
                placeholder="Search package or level..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 text-xs font-bold tracking-wide rounded-xl px-4 py-3 pl-11 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder-slate-600 shadow-inner"
                />
            </div>

            <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="w-full sm:w-auto bg-[#0b0f19] border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-4 py-3 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all appearance-none cursor-pointer shadow-inner outline-none"
            >
                <option value={10} className="bg-[#0b0f19] text-slate-200">10 Rows</option>
                <option value={20} className="bg-[#0b0f19] text-slate-200">20 Rows</option>
                <option value={50} className="bg-[#0b0f19] text-slate-200">50 Rows</option>
            </select>
        </div>

        {/* Table Box */}
        <div className="w-full">
            <div className="overflow-x-auto crowd-scroll w-full pb-4">
            <div className="min-w-[800px]">
                <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
                <thead className="bg-[#1a233a] border-b border-slate-700/50 text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest">
                    <tr>
                    <th className="p-4 text-center rounded-tl-xl">Sr.</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4 text-center">Package Tier</th>
                    <th className="p-4 text-center">Level</th>
                    <th className="p-4 text-center">Day</th>
                    <th className="p-4 text-right rounded-tr-xl">Amount Credit</th>
                    </tr>
                </thead>
                <tbody className="text-slate-300">
                    {loading ? (
                    <tr>
                        <td colSpan="6" className="text-center py-16 bg-[#131b2f] border-b border-slate-800">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <Activity size={28} className="text-amber-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Syncing Crowd Data...</span>
                            </div>
                        </td>
                    </tr>
                    ) : paginated.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="text-center py-16 bg-[#131b2f] border-b border-slate-800">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                            No Records Found
                        </span>
                        </td>
                    </tr>
                    ) : (
                    paginated.map((txn, idx) => {
                        return (
                        <tr key={txn._id || idx} className="bg-[#131b2f] hover:bg-[#1a233a] border-b border-slate-800 transition-colors">
                            <td className="p-4 font-bold text-slate-500 text-center">{indexOfFirst + idx + 1}</td>

                            <td className="p-4 text-slate-200 font-mono text-[11px] sm:text-[12px] font-bold tracking-wide">
                              <div className="flex items-center gap-2">
                                <CalendarDays size={14} className="text-slate-500" />
                                {txn.createdAt || txn.date ? format(new Date(txn.createdAt || txn.date), "dd MMM yyyy, hh:mm a") : 'N/A'}
                              </div>
                            </td>

                            <td className="p-4 text-center font-mono font-bold text-amber-400">
                                {txn.parsedTier !== "-" ? `$${txn.parsedTier}` : "-"}
                            </td>

                            <td className="p-4 text-center font-bold text-slate-300">
                                {txn.parsedLevel !== "-" ? `Level ${txn.parsedLevel}` : "-"}
                            </td>

                            <td className="p-4 text-center font-mono text-slate-400 text-xs">
                                {txn.parsedDay !== 0 ? `${txn.parsedDay} / ${txn.parsedTotalDays}` : "-"}
                            </td>

                            <td className={`p-4 font-black text-right text-sm font-mono text-emerald-400`}>
                              +${txn.parsedAmount.toFixed(2)}
                            </td>
                        </tr>
                        );
                    })
                    )}
                </tbody>
                </table>
            </div>
            </div>

            {/* Pagination Footer */}
            {!loading && filtered.length > 0 && (
                <div className="mt-4 p-4 bg-[#1a233a] rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                    <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
                        Showing <span className="text-amber-400">{indexOfFirst + 1}</span> to <span className="text-amber-400">{Math.min(indexOfLast, filtered.length)}</span> of <span className="text-amber-400">{filtered.length}</span> Logs
                    </span>
                    
                    <div className="flex items-center gap-2">
                        <button
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${currentPage === 1 ? 'bg-[#0b0f19] text-slate-600 cursor-not-allowed border border-slate-800' : 'bg-[#131b2f] text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 border border-slate-700'}`}
                        >
                        <ChevronLeft size={16} strokeWidth={2.5} />
                        </button>
                        
                        <span className="bg-[#131b2f] border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-lg">
                            {currentPage} <span className="text-slate-600 mx-1">/</span> {totalPages}
                        </span>
                        
                        <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages ? 'bg-[#0b0f19] text-slate-600 cursor-not-allowed border border-slate-800' : 'bg-[#131b2f] text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 border border-slate-700'}`}
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

export default CrowdDonationEarning;