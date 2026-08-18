import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { getUserId } from "../../utils/authUtils";
import { Search, DollarSign, ChevronLeft, ChevronRight, UserCircle } from "lucide-react";

const DirectIncome = () => {
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
    api.get(`/transaction/transactions/${userId}?type=direct_income&t=${new Date().getTime()}`)
      .then((res) => {
        const sorted = (res.data || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(sorted);
        setFiltered(sorted);
      })
      .catch((err) => {
        console.error("Failed to fetch direct income", err);
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
    // ✅ LIGHT NEO-BANKING THEME WRAPPER
    <div className="w-full max-w-7xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500 font-sans mt-4 md:mt-0">
      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 px-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-3">
             <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                <DollarSign className="text-blue-600" size={24} /> 
             </div>
             Direct Income
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-semibold tracking-widest uppercase mt-2 ml-1">
            Track your direct referrals earnings
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center px-2">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by User ID or details..."
            value={search}
            onChange={handleSearch}
            // ✅ Light Input Styling
            className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-full px-5 py-3.5 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder-slate-400 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]"
          />
        </div>
      </div>

      {/* Table wrapper */}
      <div className="w-full bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
        <div className="overflow-x-auto custom-scroll w-full">
          <div className="min-w-[860px]">
            {/* Header row */}
            <div className="bg-slate-50 rounded-2xl px-6 py-4 grid grid-cols-6 gap-3 mb-3 border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Sr.</div>
              <div className="text-slate-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-right">Date</div>
              <div className="text-slate-500 text-[11px] md:text-xs font-black uppercase tracking-widest">From User</div>
              <div className="text-slate-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Package</div>
              <div className="text-slate-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Income</div>
              <div className="text-slate-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Description</div>
            </div>

            {/* Rows */}
            <div className="space-y-2.5">
              {loading ? (
                <div className="bg-slate-50 rounded-2xl py-10 text-center border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading Records...</span>
                </div>
              ) : paginated.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl py-10 text-center border border-slate-100">
                  <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">No Direct Income Records Found</span>
                </div>
              ) : (
                paginated.map((txn, idx) => {
                  const date = new Date(txn.createdAt);
                  const packageAmount = Number(txn.package) > 0 ? Number(txn.package) : 30;
                  const cleanDescription = txn.description
                    ? txn.description.replace(/\s*\(Leader\)/gi, "")
                    : "Direct income";

                  let displayUser = txn.fromUserId ? txn.fromUserId : "N/A";

                  return (
                    <div key={txn._id || idx} className="bg-white hover:bg-slate-50/80 rounded-2xl px-6 py-4 grid grid-cols-6 gap-3 items-center border border-slate-100 shadow-sm transition-colors">
                      <div className="font-bold text-slate-400 text-sm text-center">{indexOfFirst + idx + 1}</div>
                      
                      {/* Date Only */}
                      <div className="text-slate-500 font-mono text-xs text-right font-medium">
                        {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      
                      {/* User ID */}
                      <div className="font-black text-slate-700 text-sm flex items-center gap-2 truncate">
                        <UserCircle className="text-blue-500 shrink-0" size={16} />
                        <span>{displayUser}</span>
                      </div>

                      <div className="text-center">
                        <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-600 py-1 px-2.5 rounded-lg text-[11px] font-black tracking-widest">
                          ${packageAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="text-center">
                        <span className="text-emerald-500 text-base font-black">+ ${Number(txn.amount).toFixed(2)}</span>
                      </div>
                      
                      <div className="text-slate-500 text-[11px] md:text-xs font-bold tracking-wide capitalize truncate" title={cleanDescription}>
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
          <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-inner">
            <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} Entries
            </span>
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} disabled={currentPage === 1} className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${currentPage === 1 ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-300 shadow-sm"}`}>
                <ChevronLeft size={18} />
              </button>
              <span className="bg-white border border-slate-300 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm">{currentPage} / {totalPages}</span>
              <button onClick={handleNext} disabled={currentPage === totalPages} className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${currentPage === totalPages ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-300 shadow-sm"}`}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectIncome;