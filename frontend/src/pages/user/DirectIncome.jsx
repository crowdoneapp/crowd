import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { getUserId } from "../../utils/authUtils";
import { Search, DollarSign, ChevronLeft, ChevronRight, UserCircle, ListChecks } from "lucide-react";

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
          .filter((txn) => txn.fromUserId && txn.fromUserId !== userId)
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
        String(txn.fromUserId).toLowerCase().includes(value)
    );
    setFiltered(result);
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const totalIncome = filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalPages = Math.ceil(filtered.length / entriesPerPage) || 1;
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const paginated = filtered.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500">

      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #3B82F6; border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 uppercase tracking-wide flex items-center gap-3">
            <DollarSign className="text-blue-500" size={28} /> Direct Income
          </h2>
         
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by User ID or details..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold rounded-full px-5 py-3.5 pl-12 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white focus:outline-none transition-all placeholder-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Table wrapper */}
      <div className="w-full">
        <div className="overflow-x-auto custom-scroll w-full">
          <div className="min-w-[860px]">

            {/* Header row */}
            <div className="bg-slate-100 rounded-2xl px-6 py-4 grid grid-cols-6 gap-3 mb-3 shadow-sm">
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Sr.</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-right">Date & Time</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">From User</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Package</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Income</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Description</div>
            </div>

            {/* Rows */}
            <div className="space-y-2.5">
              {loading ? (
                <div className="bg-white rounded-2xl py-10 text-center shadow-sm border border-slate-100">
                  <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Records...</span>
                </div>
              ) : paginated.length === 0 ? (
                <div className="bg-white rounded-2xl py-10 text-center shadow-sm border border-slate-100">
                  <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">No Direct Income Records Found</span>
                </div>
              ) : (
                paginated.map((txn, idx) => {
                  const date = new Date(txn.createdAt);
                  const packageAmount = Number(txn.package) > 0 ? Number(txn.package) : 30;
                  const cleanDescription = txn.description
                    ? txn.description.replace(/\s*\(Leader\)/gi, "")
                    : "Direct income";

                  return (
                    <div
                      key={txn._id || idx}
                      className="bg-white hover:bg-blue-50/50 rounded-2xl px-6 py-4 grid grid-cols-6 gap-3 items-center shadow-sm border border-slate-100 transition-colors"
                    >
                      <div className="font-bold text-slate-400 text-sm text-center">
                        {indexOfFirst + idx + 1}
                      </div>

                      <div className="text-slate-400 font-mono text-xs text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-slate-600">
                            {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          <span className="text-[10px]">
                            {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                          </span>
                        </div>
                      </div>

                      <div className="font-black text-slate-800 text-sm flex items-center gap-2 truncate">
                        <UserCircle className="text-slate-400 shrink-0" size={16} /> {txn.fromUserId || "N/A"}
                      </div>

                      <div className="text-center">
                        <span className="inline-block bg-purple-50 border border-purple-200 text-purple-600 py-1 px-2.5 rounded-lg text-[11px] font-black tracking-widest">
                          ${packageAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="text-emerald-600 text-base font-black">
                          + ${Number(txn.amount).toFixed(2)}
                        </span>
                      </div>

                      <div className="text-slate-500 text-[11px] md:text-xs font-bold tracking-wide capitalize truncate">
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
          <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
            <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} Entries
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  currentPage === 1
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm"
                }`}
              >
                <ChevronLeft size={18} />
              </button>

              <span className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  currentPage === totalPages
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm"
                }`}
              >
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