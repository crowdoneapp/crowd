import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { Search, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, CheckCircle2, User, Zap, Activity } from "lucide-react";

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
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10 animate-in fade-in duration-500 rounded-3xl bg-[#0b0f19] shadow-2xl border border-slate-800 overflow-hidden">
      
      <style>{`
        .crowd-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .crowd-scroll::-webkit-scrollbar-track { background: #0f172a; border-radius: 10px; }
        .crowd-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .crowd-scroll::-webkit-scrollbar-thumb:hover { background: #eab308; }
      `}</style>

      {/* Header */}
       

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500 group-focus-within:text-amber-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search ID, details, amount..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-[#131b2f] border border-slate-700 text-slate-200 text-sm font-semibold rounded-xl px-5 py-3.5 pl-12 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all placeholder-slate-500 shadow-inner"
          />
        </div>
      </div>

      {/* Table wrapper */}
      <div className="w-full">
        <div className="overflow-x-auto crowd-scroll w-full pb-4">
          <div className="min-w-[1000px]">

            {/* Header row */}
            <div className="bg-[#1a233a] border border-slate-700/50 rounded-xl px-6 py-4 grid grid-cols-7 gap-3 mb-4 shadow-md">
              <div className="text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Sr.</div>
              <div className="text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest">Date</div>
              <div className="text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest">Action Type</div>
              <div className="text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest">Sender ID</div>
              <div className="text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest">Receiver ID</div>
              <div className="text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Amount</div>
              <div className="text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest">Details</div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {loading ? (
                <div className="bg-[#131b2f] rounded-xl py-12 text-center border border-slate-800 shadow-sm">
                  <svg className="animate-spin h-8 w-8 text-amber-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Syncing Data...</span>
                </div>
              ) : error ? (
                <div className="bg-rose-500/10 rounded-xl py-10 text-center border border-rose-500/20">
                  <span className="text-rose-400 font-bold text-sm uppercase tracking-widest">{error}</span>
                </div>
              ) : currentRows.length === 0 ? (
                <div className="bg-[#131b2f] rounded-xl py-12 text-center border border-slate-800">
                  <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">No Activation Records Found</span>
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
                    tagDetails = { icon: <CheckCircle2 size={12} />, text: "PERSONAL ACTIVATION", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
                  } else if (senderId === currentUserId && receiverId !== currentUserId) {
                    tagDetails = { icon: <ArrowUpRight size={12} />, text: "TEAM ACTIVATION", style: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
                  } else if (receiverId === currentUserId && senderId !== currentUserId) {
                    // 🔥 UPLINE WALA NAAM HATA DIYA, SPONSORED LIKH DIYA
                    tagDetails = { icon: <ArrowDownLeft size={12} />, text: "SPONSORED ACTIVATION", style: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
                  } else {
                    tagDetails = { icon: <Zap size={12} />, text: "ACTIVATED", style: "bg-slate-800 text-slate-300 border-slate-700" };
                  }

                  return (
                    <div
                      key={`${t._id}-${t.createdAt}-${idx}`}
                      className="bg-[#131b2f] hover:bg-[#1a233a] rounded-xl px-6 py-4 grid grid-cols-7 gap-3 items-center shadow-sm border border-slate-800 hover:border-slate-700 transition-all duration-300 group"
                    >
                      <div className="font-bold text-slate-600 text-sm text-center group-hover:text-amber-400 transition-colors">
                        {indexOfFirstRow + idx + 1}
                      </div>

                      {/* 🔥 SIRF DATE DIKHEGI, TIME REMOVED */}
                      <div className="text-slate-200 font-mono text-[12px] sm:text-sm font-bold tracking-wide">
                        {t.createdAt || t.date ? format(new Date(t.createdAt || t.date), "dd MMM yyyy") : "N/A"}
                      </div>

                      <div>
                        <span className={`flex items-center gap-1.5 w-fit border py-1.5 px-3 rounded-lg text-[10px] font-black tracking-widest ${tagDetails.style}`}>
                          {tagDetails.icon} {tagDetails.text}
                        </span>
                      </div>

                      {/* SENDER COLUMN */}
                      <div className="font-black text-slate-200 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#1a233a] rounded-full text-slate-400 border border-slate-700"><User size={14} /></div>
                          {senderId === currentUserId ? (
                            <span className="text-amber-400 font-black flex items-center">
                              #{senderId} <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded ml-2">YOU</span>
                            </span>
                          ) : (
                            <span className="text-slate-300">{senderId.includes("Team") ? senderId : `#${senderId}`}</span>
                          )}
                        </div>
                      </div>

                      {/* RECEIVER COLUMN */}
                      <div className="font-black text-slate-200 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#1a233a] rounded-full text-slate-400 border border-slate-700"><User size={14} /></div>
                          {receiverId === currentUserId ? (
                            <span className="text-amber-400 font-black flex items-center">
                              #{receiverId} <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded ml-2">YOU</span>
                            </span>
                          ) : (
                            <span className="text-slate-300">{receiverId.includes("Team") ? receiverId : `#${receiverId}`}</span>
                          )}
                        </div>
                      </div>

                      <div className="font-black text-center">
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-sm">
                          ${Math.abs(t.amount || t.grossAmount)}
                        </span>
                      </div>

                      <div className="text-slate-400 text-[11px] md:text-xs font-medium tracking-wide capitalize truncate group-hover:text-slate-200 transition-colors" title={t.description || "Top-up package"}>
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
          <div className="mt-6 p-4 bg-[#1a233a] rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Rows:</span>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="bg-[#0b0f19] border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-3 py-2 focus:border-amber-400 outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
              Showing <span className="text-amber-400">{indexOfFirstRow + 1}</span> to <span className="text-amber-400">{Math.min(indexOfLastRow, filteredTopups.length)}</span> of {filteredTopups.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                  currentPage === 1
                    ? "bg-[#0b0f19] text-slate-600 cursor-not-allowed border border-slate-800"
                    : "bg-[#131b2f] text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 border border-slate-700"
                }`}
              >
                <ChevronLeft size={18} />
              </button>

              <span className="bg-[#131b2f] border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-lg">
                {currentPage} <span className="text-slate-600 mx-1">/</span> {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                  currentPage === totalPages
                    ? "bg-[#0b0f19] text-slate-600 cursor-not-allowed border border-slate-800"
                    : "bg-[#131b2f] text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 border border-slate-700"
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