import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axios"; 
import { useAuth } from "../../context/AuthContext"; 
import { Search, ChevronLeft, ChevronRight, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Wallet, Activity, ArrowLeftRight } from "lucide-react";

const MyTransfers = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [view, setView] = useState("sent");
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

  const sentTransfers = transfers.filter((txn) => String(txn.fromUserId) === String(userId));
  const receivedTransfers = transfers.filter((txn) => String(txn.toUserId) === String(userId));
  
  const filtered = view === "sent" ? sentTransfers : receivedTransfers;

  // 🔥 TOTALS
  const totalSentAmount = sentTransfers.reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
  const totalReceivedAmount = receivedTransfers.reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

  const searchedTransfers = filtered.filter((txn) => {
    const searchLower = searchTerm.toLowerCase();
    return view === "sent"
      ? txn.toUserId?.toString().toLowerCase().includes(searchLower)
      : txn.fromUserId?.toString().toLowerCase().includes(searchLower);
  });

  const totalPages = Math.ceil(searchedTransfers.length / itemsPerPage) || 1;
  const paginatedTransfers = searchedTransfers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
               <ArrowRightLeft className="text-cyan-400" size={24} /> 
             </div>
             P2P Asset Transfer
          </h2>
          <p className="text-cyan-400/60 text-[10px] md:text-xs font-bold tracking-widest uppercase mt-2 ml-1">
            Manage peer-to-peer asset movement
          </p>
        </div>
      </div>

      {/* 🔥 SUMMARY BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-6 flex items-center justify-between group shadow-inner">
          <div>
            <p className="text-rose-400/70 text-[10px] font-black uppercase tracking-widest mb-1">Total Assets Sent</p>
            <h3 className="text-2xl font-black text-white font-mono drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">${totalSentAmount.toFixed(2)}</h3>
          </div>
          <div className="h-12 w-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400">
            <ArrowUpRight size={24} strokeWidth={3} />
          </div>
        </div>
        
        <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 flex items-center justify-between group shadow-inner">
          <div>
            <p className="text-emerald-400/70 text-[10px] font-black uppercase tracking-widest mb-1">Total Assets Received</p>
            <h3 className="text-2xl font-black text-white font-mono drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">${totalReceivedAmount.toFixed(2)}</h3>
          </div>
          <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
            <ArrowDownLeft size={24} strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Toggle View */}
      <div className="flex gap-2 mb-6 bg-black/20 p-2 w-fit rounded-2xl border border-white/5">
        <button
          onClick={() => { setView("sent"); setSearchTerm(""); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
            view === "sent" 
              ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ArrowUpRight size={14} /> Sent
        </button>
        <button
          onClick={() => { setView("received"); setSearchTerm(""); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
            view === "received" 
              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ArrowDownLeft size={14} /> Received
        </button>
      </div>

      {/* Table Box */}
      <div className="bg-[#0f172a]/60 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.3)] rounded-3xl border border-white/5 overflow-hidden relative">
        
        <div className="overflow-x-auto custom-scroll w-full relative z-10">
          <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
            <thead className="bg-black/40 text-cyan-400 text-[10px] md:text-xs uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="p-5 font-black text-center w-16">Sr.</th>
                <th className="p-5 font-black text-right">Date & Time</th>
                <th className="p-5 font-black">Transaction Type</th>
                <th className="p-5 font-black">{view === "sent" ? "Receiver  UserId" : "Sender  UserId"}</th>
                <th className="p-5 font-black text-center">Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                     <div className="flex flex-col items-center justify-center gap-3">
                        <Activity size={28} className="text-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/70">Syncing P2P Ledger...</span>
                     </div>
                  </td>
                </tr>
              ) : paginatedTransfers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-widest bg-black/40 px-6 py-3 rounded-xl border border-white/5">
                      No {view} transactions found
                    </span>
                  </td>
                </tr>
              ) : (
                paginatedTransfers.map((txn, idx) => {
                  const date = new Date(txn.createdAt);
                  const isSent = view === "sent";
                  
                  return (
                    <tr key={txn._id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-5 font-bold text-slate-500 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>

                      <td className="p-5 text-slate-400 font-mono text-[11px]">
                        <div className="flex flex-col items-end">
                            <span className="text-white font-bold">{date.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span className="text-slate-500 text-[10px]">{date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        </div>
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
                         <span className="bg-black/40 px-3 py-1.5 border border-white/10 rounded-lg">{isSent ? txn.toUserId : txn.fromUserId}</span>
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

        {/* Pagination Footer */}
        {!loading && searchedTransfers.length > 0 && (
           <div className="p-5 border-t border-white/5 bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
              <span className="text-cyan-400/60 text-[10px] font-black uppercase tracking-widest">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, searchedTransfers.length)} of {searchedTransfers.length} Entries
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

export default MyTransfers;