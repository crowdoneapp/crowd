import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { getUserId } from "../../utils/authUtils";
import { Search, ChevronLeft, ChevronRight, Wallet, ArrowDownLeft, AlertCircle, ArrowRightLeft } from "lucide-react";

const CreditToWalletHistory = () => {
  const userId = getUserId();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const formatSource = (src) => {
    if (!src) return "-";
    const s = src.toLowerCase().trim();

    const poolMatch = s.match(/^pool[_\-\s]*(\d+)$/);
    if (poolMatch) {
      return `Community Level ${poolMatch[1]}`;
    }

    if (s === "pool") return "Community Income";
    if (s === "direct") return "Direct Income";
    if (s === "level") return "Level Income";
    if (s === "reward") return "Team Reward";

    return src;
  };

  useEffect(() => {
    if (!userId) {
      setErrorMessage("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get(`/wallet/history/${userId}?t=${new Date().getTime()}`)
      .then((res) => {
        const rawData = res.data.history ? res.data.history : (Array.isArray(res.data) ? res.data : []);

        const creditTxs = rawData
          .filter(
            (tx) =>
              tx.type === "credit_to_wallet" || tx.type === "binary_income" || tx.type === "credit"
          )
          .filter((tx) => {
            const desc = (tx.description || "").toLowerCase();
            const source = (tx.source || "").toLowerCase();

            if (
              source === "system" ||
              source === "pool" ||
              source === "instant_leader_bonus" ||
              source === "admin_bonus"
            ) {
              return false;
            }

            if (
              desc.includes("single leg") ||
              desc.includes("singel leg") ||
              desc.includes("auto-pool") ||
              desc.includes("unlocked") ||
              desc.includes("community income") ||
              desc.includes("instant leader bonus") ||
              desc.includes("instant bonus")
            ) {
              return false;
            }

            return true;
          })
          .map((tx) => ({
            ...tx,
            source: formatSource(tx.source),
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setTransactions(creditTxs);
        setFiltered(creditTxs);
        setErrorMessage("");
      })
      .catch((err) => {
        console.error("Failed to fetch wallet transactions", err);
        setErrorMessage(
          err.response?.data?.message || "Failed to load history. Please try again later."
        );
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
        txn.source?.toLowerCase().includes(value) ||
        String(txn.userId).includes(value) ||
        txn.type.toLowerCase().includes(value)
    );
    setFiltered(result);
  };

  const totalCredit = filtered.reduce((acc, txn) => {
    let val = 0;
    if (txn.amount && typeof txn.amount === "object" && txn.amount.$numberDecimal) {
      val = parseFloat(txn.amount.$numberDecimal);
    } else if (txn.amount !== undefined && txn.amount !== null) {
      val = parseFloat(txn.amount);
    } else {
      val = parseFloat(txn.grossAmount || 0);
    }
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginated = filtered.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500">

      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
      `}</style>

      {/* Header with Total Amount Box */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 uppercase tracking-wide flex items-center gap-3">
            <Wallet className="text-blue-500" size={28} /> Credit To Wallet
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-bold tracking-widest uppercase mt-1">
            Track your internal fund credits and binary income
          </p>
        </div>

        <div className="bg-white shadow-sm border border-slate-100 px-6 py-3.5 rounded-2xl flex items-center gap-4 min-w-[200px]">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500 shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Credited</p>
            <h3 className="text-xl md:text-2xl font-black text-blue-500">+ ${totalCredit.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 px-5 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span className="font-bold text-sm tracking-wide">{errorMessage}</span>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by User ID, Source, or Type..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold rounded-full px-5 py-3.5 pl-12 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white focus:outline-none transition-all placeholder-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Table wrapper */}
      <div className="w-full">
        <div className="overflow-x-auto custom-scroll w-full">
          <div className="min-w-[760px]">

            {/* Header row */}
            <div className="bg-slate-100 rounded-2xl px-6 py-4 grid grid-cols-5 gap-3 mb-3 shadow-sm">
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Sr.</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-right">Date & Time</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Type</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Source</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Amount</div>
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
                  <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                    {errorMessage ? "Could not load data" : "No Transactions Found"}
                  </span>
                </div>
              ) : (
                paginated.map((txn, idx) => {
                  const date = new Date(txn.createdAt || txn.date);
                  const isBinary = txn.type === "binary_income";

                  let val = 0;
                  if (txn.amount && typeof txn.amount === "object" && txn.amount.$numberDecimal) {
                    val = parseFloat(txn.amount.$numberDecimal);
                  } else if (txn.amount !== undefined && txn.amount !== null) {
                    val = parseFloat(txn.amount);
                  } else {
                    val = parseFloat(txn.grossAmount || 0);
                  }
                  const validAmount = isNaN(val) ? 0 : val;

                  return (
                    <div
                      key={txn._id || idx}
                      className="bg-white hover:bg-blue-50/50 rounded-2xl px-6 py-4 grid grid-cols-5 gap-3 items-center shadow-sm border border-slate-100 transition-colors"
                    >
                      <div className="font-bold text-slate-400 text-sm text-center">
                        {indexOfFirst + idx + 1}
                      </div>

                      <div className="text-slate-400 font-mono text-[10px] sm:text-xs text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-slate-600">
                            {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          <span>{date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${
                            isBinary
                              ? "bg-purple-50 text-purple-600 border-purple-200"
                              : "bg-blue-50 text-blue-600 border-blue-200"
                          }`}
                        >
                          {isBinary ? <ArrowRightLeft size={12} /> : <ArrowDownLeft size={12} />}
                          {isBinary ? "Binary Income" : "Credit"}
                        </span>
                      </div>

                      <div className="font-bold text-slate-700 capitalize truncate">
                        {txn.source || "-"}
                      </div>

                      <div className="text-center">
                        <span className="text-emerald-600 text-base font-black">
                          + ${validAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Pagination Footer */}
        {!loading && !errorMessage && filtered.length > 0 && (
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

export default CreditToWalletHistory;