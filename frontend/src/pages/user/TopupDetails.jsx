import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { Search, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, RefreshCcw, CheckCircle2, User } from "lucide-react";

const TopupDetails = () => {
  const { user } = useAuth();
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchTopups = async () => {
      if (!user?.userId) {
        setLoading(false);
        setError("User not found. Please log in.");
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/wallet/topup-history/${user.userId}?t=${new Date().getTime()}`);

        if (Array.isArray(res.data)) {
          const userTopups = res.data.filter((t) => {
            const typeStr = (t.type || "").toLowerCase();
            const sourceStr = (t.source || "").toLowerCase();
            const descStr = (t.description || "").toUpperCase();

            const isTopupRelated = typeStr.includes("topup") || sourceStr.includes("topup") || typeStr === "activation";
            const isNotPromo = !descStr.includes("PROMOTION");

            return isTopupRelated && isNotPromo;
          });

          const uniqueTopups = Array.from(
            new Map(userTopups.map((t) => [`${t._id}-${t.createdAt}`, t])).values()
          );

          uniqueTopups.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

          setTopups(uniqueTopups);
        } else {
          setTopups([]);
        }
      } catch (err) {
        console.error("Topup fetch error:", err);
        setError(err.response?.data?.message || "Failed to load top-ups.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopups();
  }, [user]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredTopups = topups.filter((t) => {
    const searchLower = searchQuery.toLowerCase();
    const senderIdStr = (t.fromUserId || t.userId || "").toString().toLowerCase();
    const receiverIdStr = (t.toUserId || t.userId || "").toString().toLowerCase();
    const descStr = (t.description || "").toLowerCase();
    const amountStr = (t.amount || t.grossAmount || "").toString().toLowerCase();

    return (
      senderIdStr.includes(searchLower) ||
      receiverIdStr.includes(searchLower) ||
      descStr.includes(searchLower) ||
      amountStr.includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredTopups.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredTopups.slice(indexOfFirstRow, indexOfLastRow);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrev = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((prev) => prev + 1);

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500">

      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 uppercase tracking-wide flex items-center gap-3">
            <RefreshCcw className="text-blue-500" size={28} /> Tires Top-Up Details
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-bold tracking-widest uppercase mt-1">
            Track all self, sent, and received Tire activations
          </p>
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
            placeholder="Search ID, details, amount..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold rounded-full px-5 py-3.5 pl-12 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white focus:outline-none transition-all placeholder-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Table wrapper */}
      <div className="w-full">
        <div className="overflow-x-auto custom-scroll w-full">
          <div className="min-w-[980px]">

            {/* Header row */}
            <div className="bg-slate-100 rounded-2xl px-6 py-4 grid grid-cols-7 gap-3 mb-3 shadow-sm">
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Sr.</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Date & Time</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Action Type</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Topped Up By (Sender)</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Topped Up For (Receiver)</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Amount</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Details</div>
            </div>

            {/* Rows */}
            <div className="space-y-2.5">
              {loading ? (
                <div className="bg-white rounded-2xl py-10 text-center shadow-sm border border-slate-100">
                  <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading History...</span>
                </div>
              ) : error ? (
                <div className="bg-white rounded-2xl py-10 text-center shadow-sm border border-slate-100">
                  <span className="text-rose-500 font-bold text-sm uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-lg border border-rose-200">{error}</span>
                </div>
              ) : currentRows.length === 0 ? (
                <div className="bg-white rounded-2xl py-10 text-center shadow-sm border border-slate-100">
                  <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">No Top-up Records Found</span>
                </div>
              ) : (
                currentRows.map((t, idx) => {

                  const currentUserId = String(user?.userId || "");
                  let senderId = t.fromUserId ? String(t.fromUserId) : String(t.userId);
                  let receiverId = t.toUserId ? String(t.toUserId) : String(t.userId);

                  const isDebitTransaction = t.type?.toLowerCase().includes("debit") || Number(t.amount) < 0;

                  if (isDebitTransaction && !t.toUserId) {
                    senderId = currentUserId;

                    const descMatch = t.description?.match(/(?:for|user|to|#|-)\s*([0-9]{4,10})/i);
                    if (descMatch && descMatch[1]) {
                      receiverId = descMatch[1];
                    } else {
                      receiverId = "Team Member";
                    }
                  }

                  let tagDetails = { icon: null, text: "", style: "" };

                  if (senderId === currentUserId && receiverId === currentUserId) {
                    tagDetails = { icon: <CheckCircle2 size={12} />, text: "SELF ACTIVATION", style: "bg-emerald-50 text-emerald-600 border-emerald-200" };
                  } else if (senderId === currentUserId && receiverId !== currentUserId) {
                    tagDetails = { icon: <ArrowUpRight size={12} />, text: "ACTIVATED FOR TEAM", style: "bg-amber-50 text-amber-600 border-amber-200" };
                  } else if (receiverId === currentUserId && senderId !== currentUserId) {
                    tagDetails = { icon: <ArrowDownLeft size={12} />, text: "ACTIVATED BY UPLINE", style: "bg-blue-50 text-blue-600 border-blue-200" };
                  } else {
                    tagDetails = { icon: <CheckCircle2 size={12} />, text: "ACTIVATED", style: "bg-slate-100 text-slate-600 border-slate-200" };
                  }

                  return (
                    <div
                      key={`${t._id}-${t.createdAt}-${idx}`}
                      className="bg-white hover:bg-blue-50/50 rounded-2xl px-6 py-4 grid grid-cols-7 gap-3 items-center shadow-sm border border-slate-100 transition-colors"
                    >
                      <div className="font-bold text-slate-400 text-sm text-center">
                        {indexOfFirstRow + idx + 1}
                      </div>

                      <div className="text-slate-600 font-mono text-[11px] sm:text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold">{t.createdAt || t.date ? format(new Date(t.createdAt || t.date), "dd MMM yyyy") : "N/A"}</span>
                          <span className="text-slate-400">{t.createdAt || t.date ? format(new Date(t.createdAt || t.date), "hh:mm a") : ""}</span>
                        </div>
                      </div>

                      <div>
                        <span className={`flex items-center gap-1.5 w-fit border py-1.5 px-3 rounded-lg text-[10px] font-black tracking-widest ${tagDetails.style}`}>
                          {tagDetails.icon} {tagDetails.text}
                        </span>
                      </div>

                      {/* SENDER COLUMN */}
                      <div className="font-black text-slate-700 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 rounded-full text-slate-400"><User size={14} /></div>
                          {senderId === currentUserId ? (
                            <span className="text-indigo-600 font-black">
                              #{senderId} <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded ml-1">YOU</span>
                            </span>
                          ) : (
                            <span>{senderId.includes("Team") ? senderId : `#${senderId}`}</span>
                          )}
                        </div>
                      </div>

                      {/* RECEIVER COLUMN */}
                      <div className="font-black text-slate-700 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 rounded-full text-slate-400"><User size={14} /></div>
                          {receiverId === currentUserId ? (
                            <span className="text-indigo-600 font-black">
                              #{receiverId} <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded ml-1">YOU</span>
                            </span>
                          ) : (
                            <span>{receiverId.includes("Team") ? receiverId : `#${receiverId}`}</span>
                          )}
                        </div>
                      </div>

                      <div className="font-black text-center">
                        <span className="text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg text-sm">
                          ${Math.abs(t.amount || t.grossAmount)}
                        </span>
                      </div>

                      <div className="text-slate-500 text-[11px] md:text-xs font-bold tracking-wide capitalize truncate" title={t.description || "Top-up package"}>
                        {t.description || "Top-up package"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Pagination Footer */}
        {!loading && filteredTopups.length > 0 && (
          <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Rows:</span>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1.5 focus:border-blue-400 outline-none cursor-pointer shadow-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
              Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredTopups.length)} of {filteredTopups.length}
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

export default TopupDetails;