import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axios"; 
import { useAuth } from "../../context/AuthContext"; 
import { Search, ChevronLeft, ChevronRight, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Activity } from "lucide-react";

const MyTransfers = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const userId = user?.userId;

  const fetchTransfers = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get(
        `/transaction/transactions/${userId}?type=transfer&t=${new Date().getTime()}`
      );
      
      const rawData = res.data || [];
      const uniqueData = rawData.reduce((acc, current) => {
        const isDuplicate = acc.find(item => 
          item.amount === current.amount && 
          item.toUserId === current.toUserId && 
          item.fromUserId === current.fromUserId &&
          Math.abs(new Date(item.createdAt).getTime() - new Date(current.createdAt).getTime()) < 10000 
        );
        if (!isDuplicate) acc.push(current);
        return acc;
      }, []);

      const sortedData = uniqueData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransfers(sortedData);
    } catch (err) {
      console.error("❌ Failed to fetch transfers", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // 🔥 SEARCH LOGIC FOR UNIFIED LIST
  const searchedTransfers = transfers.filter((txn) => {
    const searchLower = searchTerm.toLowerCase();
    const toId = txn.toUserId?.toString().toLowerCase() || "";
    const fromId = txn.fromUserId?.toString().toLowerCase() || "";
    const amt = txn.amount?.toString().toLowerCase() || "";
    return toId.includes(searchLower) || fromId.includes(searchLower) || amt.includes(searchLower);
  });

  const totalPages = Math.ceil(searchedTransfers.length / itemsPerPage) || 1;
  const paginatedTransfers = searchedTransfers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10 animate-in fade-in duration-500 rounded-3xl bg-[#0b0f19] shadow-2xl border border-slate-800 overflow-hidden font-sans">
      
      <style>{`
        .crowd-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .crowd-scroll::-webkit-scrollbar-track { background: #0f172a; border-radius: 10px; }
        .crowd-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .crowd-scroll::-webkit-scrollbar-thumb:hover { background: #eab308; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 uppercase tracking-wide flex items-center gap-3">
             <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                <ArrowRightLeft className="text-amber-400" size={24} /> 
             </div>
             P2P Wallet Transfer History
          </h2>
         
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center bg-[#131b2f] shadow-inner p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-500 group-focus-within:text-amber-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search User ID or amount..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 text-sm font-bold tracking-wide rounded-xl px-4 py-3.5 pl-11 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder-slate-600 shadow-inner"
          />
        </div>
      </div>

      {/* Table Box */}
      <div className="w-full">
        <div className="overflow-x-auto crowd-scroll w-full pb-4">
          <div className="min-w-[800px]">
            <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
              <thead className="bg-[#1a233a] border-b border-slate-700/50 text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest">
                <tr>
                  <th className="p-5 text-center w-16 rounded-tl-xl">Sr.</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Transaction Type</th>
                  <th className="p-5">Sender UserId</th>
                  <th className="p-5">Receiver UserId</th>
                  <th className="p-5 text-center rounded-tr-xl">Amount</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16 bg-[#131b2f] border-b border-slate-800">
                       <div className="flex flex-col items-center justify-center gap-3">
                          <Activity size={28} className="text-amber-400 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Syncing P2P Ledger...</span>
                       </div>
                    </td>
                  </tr>
                ) : paginatedTransfers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16 bg-[#131b2f] border-b border-slate-800">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                        No P2P Transfer Records Found
                      </span>
                    </td>
                  </tr>
                ) : (
                  paginatedTransfers.map((txn, idx) => {
                    const date = new Date(txn.createdAt);
                    const isSent = String(txn.fromUserId) === String(userId);
                    
                    return (
                      <tr key={txn._id || idx} className="bg-[#131b2f] hover:bg-[#1a233a] border-b border-slate-800 transition-colors">
                        <td className="p-5 font-bold text-slate-500 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>

                        {/* 🔥 SIRF DATE DIKHEGI, TIME REMOVED */}
                        <td className="p-5 text-slate-200 font-mono text-[12px] sm:text-sm font-bold tracking-wide">
                          {txn.createdAt ? date.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>

                        <td className="p-5">
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${
                             isSent 
                               ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                               : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                           }`}>
                              {isSent ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownLeft size={12} strokeWidth={3} />}
                              {isSent ? "Transfer Sent" : "Transfer Received"}
                           </span>
                        </td>

                        <td className="p-5 font-mono text-white text-xs">
                           <span className="bg-[#0b0f19] px-3 py-1.5 border border-slate-700 rounded-lg text-slate-300">
                             {String(txn.fromUserId) === String(userId) ? "Self" : txn.fromUserId}
                           </span>
                        </td>

                        <td className="p-5 font-mono text-white text-xs">
                           <span className="bg-[#0b0f19] px-3 py-1.5 border border-slate-700 rounded-lg text-slate-300">
                             {String(txn.toUserId) === String(userId) ? "Self" : txn.toUserId}
                           </span>
                        </td>

                        <td className="p-5 font-black text-center text-sm font-mono">
                          <span className={isSent ? "text-rose-400" : "text-emerald-400"}>
                            {isSent ? "-" : "+"} ${Number(txn.amount || 0).toFixed(2)}
                          </span>
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
        {!loading && searchedTransfers.length > 0 && (
           <div className="mt-6 p-4 bg-[#1a233a] rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
              <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
                Showing <span className="text-amber-400">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-amber-400">{Math.min(currentPage * itemsPerPage, searchedTransfers.length)}</span> of <span className="text-amber-400">{searchedTransfers.length}</span> Entries
              </span>
              
              <div className="flex items-center gap-2">
                 <button
                   onClick={handlePrev}
                   disabled={currentPage === 1}
                   className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${currentPage === 1 ? 'bg-[#0b0f19] text-slate-600 cursor-not-allowed border border-slate-800' : 'bg-[#131b2f] text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 border border-slate-700'}`}
                 >
                   <ChevronLeft size={16} strokeWidth={2.5} />
                 </button>
                 
                 <span className="bg-[#131b2f] border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-lg">
                    {currentPage} <span className="text-slate-600 mx-1">/</span> {totalPages}
                 </span>
                 
                 <button
                   onClick={handleNext}
                   disabled={currentPage === totalPages}
                   className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages ? 'bg-[#0b0f19] text-slate-600 cursor-not-allowed border border-slate-800' : 'bg-[#131b2f] text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 border border-slate-700'}`}
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

export default MyTransfers;