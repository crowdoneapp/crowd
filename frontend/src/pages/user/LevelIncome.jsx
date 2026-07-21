import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { getUserId } from "../../utils/authUtils";
import { Search, Users, ChevronLeft, ChevronRight, UserCircle } from "lucide-react";

const LevelIncome = () => {
  const userId = getUserId();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get(`/transaction/transactions/${userId}?type=level_income&t=${new Date().getTime()}`)
      .then((res) => {
        const sorted = (res.data || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(sorted);
        setFiltered(sorted);
      })
      .catch((err) => {
        console.error("Failed to fetch level income", err);
        setTransactions([]);
        setFiltered([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setCurrentPage(1);
    if (!value) return setFiltered(transactions);

    const result = transactions.filter(
      (txn) =>
        txn.description?.toLowerCase().includes(value) ||
        String(txn.fromUserId || "").toLowerCase().includes(value)
    );
    setFiltered(result);
  };

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  const totalPages = Math.ceil(filtered.length / entriesPerPage) || 1;
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const paginated = filtered.slice(indexOfFirst, indexOfLast);

  return (
    // 🔥 CROWDONE DARK / AMBER THEME WRAPPER
    <div className="w-full max-w-7xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500 font-sans">
      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #0b0f19; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 uppercase tracking-wide flex items-center gap-3">
            <Users className="text-amber-500" size={28} /> Level Income
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500 group-focus-within:text-amber-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by User ID or details..."
            value={search}
            onChange={handleSearch}
            // 🔥 Dark Input Styling
            className="w-full bg-[#131b2f] border border-slate-700 text-slate-200 text-sm font-semibold rounded-full px-5 py-3.5 pl-12 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder-slate-500 shadow-inner"
          />
        </div>
      </div>

      {/* Table wrapper */}
      <div className="w-full bg-[#131b2f] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="overflow-x-auto custom-scroll w-full">
          <div className="min-w-[860px]">
            {/* Header row */}
            <div className="bg-[#1a233a] rounded-2xl px-6 py-4 grid grid-cols-6 gap-3 mb-3 border border-slate-700/50 shadow-sm">
              <div className="text-amber-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Sr.</div>
              <div className="text-amber-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-right">Date</div>
              <div className="text-amber-500 text-[11px] md:text-xs font-black uppercase tracking-widest">From User</div>
              <div className="text-amber-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Package</div>
              <div className="text-amber-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Income</div>
              <div className="text-amber-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Description</div>
            </div>

            {/* Rows */}
            <div className="space-y-2.5">
              {loading ? (
                <div className="bg-[#0b0f19] rounded-2xl py-10 text-center border border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Records...</span>
                </div>
              ) : paginated.length === 0 ? (
                <div className="bg-[#0b0f19] rounded-2xl py-10 text-center border border-slate-800">
                  <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">No Level Income Records Found</span>
                </div>
              ) : (
                paginated.map((txn, idx) => {
                  const date = new Date(txn.createdAt);
                  const packageAmount = Number(txn.package) > 0 ? Number(txn.package) : 30;
                  const cleanDescription = txn.description
                    ? txn.description.replace(/\s*\(Leader\)/gi, "")
                    : "Level income";

                  // 🔥 FIX: Extract User ID from different fields or description
                  let displayUser = txn.fromUserId || txn.from || txn.byUserId;
                  
                  if (!displayUser && cleanDescription.toLowerCase().includes(" from ")) {
                    displayUser = cleanDescription.split(/ from /i)[1].trim();
                  }
                  
                  // Default to "Downline User" if nothing is found
                  displayUser = displayUser || "Downline User";

                  return (
                    <div key={txn._id || idx} className="bg-[#0b0f19] hover:bg-[#1a233a] rounded-2xl px-6 py-4 grid grid-cols-6 gap-3 items-center border border-slate-800 transition-colors">
                      <div className="font-bold text-slate-500 text-sm text-center">{indexOfFirst + idx + 1}</div>
                      
                      {/* 🔥 Date Only (No Time) */}
                      <div className="text-slate-400 font-mono text-xs text-right">
                        {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      
                      {/* 🔥 Display Correct User ID */}
                      <div className="font-black text-slate-200 text-sm flex items-center gap-2 truncate">
                        <UserCircle className="text-amber-500 shrink-0" size={16} /> 
                        <span className={displayUser === "Downline User" ? "text-slate-500 italic font-bold text-xs" : ""}>
                          {displayUser}
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 py-1 px-2.5 rounded-lg text-[11px] font-black tracking-widest">
                          ${packageAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-emerald-400 text-base font-black">+ ${Number(txn.amount).toFixed(2)}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] md:text-xs font-bold tracking-wide capitalize truncate">
                        {cleanDescription}
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
          <div className="mt-5 p-4 bg-[#0b0f19] rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} Entries
            </span>
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} disabled={currentPage === 1} className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${currentPage === 1 ? "bg-slate-800/50 text-slate-600 cursor-not-allowed" : "bg-[#1a233a] text-slate-300 hover:bg-amber-500 hover:text-slate-900 border border-slate-700 shadow-sm"}`}>
                <ChevronLeft size={18} />
              </button>
              <span className="bg-[#1a233a] border border-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl">{currentPage} / {totalPages}</span>
              <button onClick={handleNext} disabled={currentPage === totalPages} className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${currentPage === totalPages ? "bg-slate-800/50 text-slate-600 cursor-not-allowed" : "bg-[#1a233a] text-slate-300 hover:bg-amber-500 hover:text-slate-900 border border-slate-700 shadow-sm"}`}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelIncome;