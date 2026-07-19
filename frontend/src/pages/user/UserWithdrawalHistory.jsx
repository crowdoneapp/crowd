import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Search,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Activity
} from "lucide-react";

function UserWithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = Number(user?.userId);
  
  // 🔥 Check if user is a Leader
  const isLeader = user?.role?.toLowerCase() === "leader" || user?.role?.toLowerCase() === "superleader";

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/wallet/withdrawals/${userId}?t=${new Date().getTime()}`
        );
        setWithdrawals(res.data.withdrawals || []);
      } catch (error) {
        console.error("Error fetching withdrawal history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchWithdrawals();
    else setLoading(false);
  }, [userId]);

  // 🔥 GROUP & ADJUST ENTRIES (WITH TIME-BASED LOGIC)
  const groupWithdrawals = (list) => {
    const sorted = [...list].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const groups = [];
    const THRESHOLD_MS = 5000;
    
    // 🔥 CUTOFF TIME: 13 July 2026, 4:00 PM IST
    const CUTOFF_TIME = new Date("2026-07-13T16:00:00+05:30").getTime();

    for (const item of sorted) {
      const itemTime = new Date(item.createdAt).getTime();
      const lastGroup = groups[groups.length - 1];

      // 👉 TIME CHECK: Purana (before 4 PM) ya Naya (after 4 PM)
      const isNewLogic = itemTime >= CUTOFF_TIME;

      // 👉 AMOUNT CALCULATION LOGIC
      // Purane me 2x hota tha, naye me 1x (exactly wahi jo database me hai)
      const iGross = isNewLogic ? Number(item.grossAmount || 0) : Number(item.grossAmount || 0) * 2;
      const iFee = isNewLogic ? Number(item.fee || 0) : Number(item.fee || 0) * 2;
      const iCryptoNet = Number(item.netAmount || 0); // USDT portion
      
      // TopUp calculation: Naye backend ke hisaab se TopUp = Gross - Fee - USDT
      // Purane me TopUp aur CryptoNet barabar (netAmount) dikhate the
      const iTopupNet = isNewLogic ? (iGross - iFee - iCryptoNet) : Number(item.netAmount || 0);

      if (
        lastGroup &&
        itemTime -
          new Date(
            lastGroup.entries[lastGroup.entries.length - 1].createdAt
          ).getTime() <=
          THRESHOLD_MS
      ) {
        lastGroup.entries.push(item);

        lastGroup.rawGross += iGross;
        lastGroup.rawFee += iFee;
        lastGroup.rawCryptoNet += iCryptoNet;
        lastGroup.rawTopupNet += iTopupNet;

        if (item.status?.toLowerCase() === "pending")
          lastGroup.status = "pending";
        else if (
          item.status?.toLowerCase() === "rejected" &&
          lastGroup.status !== "pending"
        )
          lastGroup.status = "rejected";
      } else {
        groups.push({
          _id: item._id,
          createdAt: item.createdAt,
          entries: [item],
          rawGross: iGross,
          rawFee: iFee,
          rawCryptoNet: iCryptoNet,
          rawTopupNet: iTopupNet,
          walletAddress: item.walletAddress,
          status: item.status || "pending",
          isNewLogic: isNewLogic // Tracking for Leader override
        });
      }
    }

    // 🔥 LEADER ADJUSTMENT LOGIC (Sirf Purane records pe lagu hoga)
    groups.forEach(g => {
        if (isLeader && !g.isNewLogic) {
            // Agar Leader hai aur entry PURANI hai (Before 4 PM)
            const roundedGross = Math.floor(g.rawGross / 10) * 10;
            g.totalGross = roundedGross;
            g.totalFee = roundedGross * 0.10; 
            g.totalCryptoNet = roundedGross * 0.45; 
            g.totalTopupNet = roundedGross * 0.45; 
        } else {
            // Normal user YA Naya logic (After 4 PM) -> Exact backend values!
            g.totalGross = g.rawGross;
            g.totalFee = g.rawFee;
            g.totalCryptoNet = g.rawCryptoNet;
            g.totalTopupNet = g.rawTopupNet;
        }
    });

    return groups;
  };

  const grouped = groupWithdrawals(withdrawals);

  const totalAmount = grouped.reduce((sum, g) => {
      // Sirf Success/Approved withdrawals ka total
      if (g.status?.toLowerCase() === "success" || g.status?.toLowerCase() === "approved") {
          return sum + g.totalGross;
      }
      return sum;
  }, 0);

  const filtered = grouped.filter((g) => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      g.status?.toLowerCase().includes(searchLower) ||
      g.totalGross.toString().includes(searchLower) ||
      new Date(g.createdAt)
        .toLocaleDateString("en-GB")
        .includes(searchLower) ||
      (g.walletAddress?.toLowerCase() || "").includes(searchLower);

    const matchStatus =
      statusFilter === "all" ||
      g.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

  const sortedFiltered = [...filtered].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const totalPages =
    Math.ceil(sortedFiltered.length / itemsPerPage) || 1;

  const startIdx = (currentPage - 1) * itemsPerPage;

  const paginated = sortedFiltered.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const getStatusDetails = (group) => {
    const s = group.status?.toLowerCase();

    if (s === "approved" || s === "success") {
      return {
        label: group.status,
        color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
      };
    }

    if (s === "pending") {
      return {
        label: group.status,
        color: "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
      };
    }

    if (s === "rejected" || s === "failed") {
      return {
        label: group.status,
        color: "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]",
      };
    }

    return {
      label: group.status || "UNKNOWN",
      color: "bg-white/5 text-slate-400 border border-white/10",
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500 font-sans">

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.2);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.5);
        }
      `}</style>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.1)]">
               <Banknote className="text-cyan-400" size={24} />
            </div>
            Withdrawal History
          </h2>
          <p className="text-cyan-400/60 text-[10px] md:text-xs font-bold tracking-widest uppercase mt-2 ml-1">
            Track all your smart contract executions
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="mb-8 relative group">
        <div className="absolute inset-0 bg-cyan-500/20 rounded-3xl blur-[40px] opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"></div>
        <div className="bg-[#0f172a]/80 backdrop-blur-xl shadow-inner rounded-3xl border border-cyan-500/20 p-5 md:p-6 relative overflow-hidden flex flex-col justify-center max-w-sm transform transition-transform hover:scale-[1.02] duration-300">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>

          <h3 className="text-cyan-400/80 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-cyan-400" />
            Total Successfully Withdrawn
          </h3>

          <p className="text-3xl md:text-4xl font-black text-white font-mono drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
            ${totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center bg-black/20 shadow-inner p-4 rounded-2xl border border-white/5 backdrop-blur-sm">

        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search
              size={16}
              className="text-slate-500 group-focus-within:text-cyan-400 transition-colors"
            />
          </div>

          <input
            type="text"
            placeholder="Search amount, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 text-white text-sm font-bold tracking-wide rounded-xl px-4 py-3.5 pl-11 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all placeholder-slate-600 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[10px] font-black text-cyan-400/80 uppercase tracking-widest whitespace-nowrap hidden sm:block">
            Filter:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-black/40 border border-white/10 text-white text-sm font-bold rounded-xl px-4 py-3.5 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all appearance-none cursor-pointer capitalize shadow-inner outline-none"
          >
            <option value="all" className="bg-slate-900 text-white">All Statuses</option>
            <option value="pending" className="bg-slate-900 text-white">Pending</option>
            <option value="approved" className="bg-slate-900 text-white">Approved</option>
            <option value="rejected" className="bg-slate-900 text-white">Rejected</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#0f172a]/60 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.3)] rounded-3xl border border-white/10 overflow-hidden relative">

        <div className="overflow-x-auto custom-scroll w-full relative z-10">
          <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">

            <thead className="bg-black/40 text-cyan-400 text-[10px] md:text-xs uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="p-5 font-black text-center">Sr.</th>
                <th className="p-5 font-black">Date</th>
                <th className="p-5 font-black">Gross Total</th>
                <th className="p-5 font-black">Network Fee</th>
                <th className="p-5 font-black">
                  <div className="flex items-center gap-1.5">
                      <span className="text-emerald-400">BEP-20 Output</span>
                  </div>
                </th>

                <th className="p-5 font-black">
                  <div className="flex items-center gap-1.5">
                      <span className="text-indigo-400">Internal Vault</span>
                  </div>
                </th>

                <th className="p-5 font-black">Linked Address</th>
                <th className="p-5 font-black text-center">Status</th>
              </tr>
            </thead>

            <tbody className="text-slate-300">

              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-16">
                     <div className="flex flex-col items-center justify-center gap-3">
                        <Activity size={28} className="text-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/70">
                          Fetching Blockchain Records...
                        </span>
                     </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-16">
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-widest bg-black/40 px-6 py-3 rounded-xl border border-white/5">
                      No Withdrawal Records Found
                    </span>
                  </td>
                </tr>
              ) : (
                paginated.map((group, idx) => {
                  const statusInfo = getStatusDetails(group);

                  return (
                    <tr
                      key={group._id}
                      className="border-b border-white/5 bg-transparent hover:bg-white/5 transition-colors"
                    >
                      <td className="p-5 font-bold text-slate-500 text-center">
                        {startIdx + idx + 1}
                      </td>

                      <td className="p-5 text-slate-400 font-mono text-[11px]">
                        {new Date(group.createdAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>

                      <td className="p-5 font-black text-white font-mono">
                        ${group.totalGross.toFixed(2)}
                      </td>

                      <td className="p-5 font-bold text-rose-400 font-mono">
                        -${group.totalFee.toFixed(2)}
                      </td>

                      <td className="p-5 font-black text-emerald-400 font-mono">
                        ${group.totalCryptoNet.toFixed(2)}
                      </td>

                      <td className="p-5 font-black text-indigo-400 font-mono">
                        ${group.totalTopupNet.toFixed(2)}
                      </td>

                      <td className="p-5 text-slate-400 font-mono text-[10px] sm:text-[11px]">
                        {group.walletAddress ? (
                          <span className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-black/40 shadow-inner">
                            {group.walletAddress}
                          </span>
                        ) : (
                          <span className="text-slate-600">N/A</span>
                        )}
                      </td>

                      <td className="p-5 text-center">
                        <span
                          className={`px-3 py-1.5 text-[9px] font-black tracking-widest rounded-lg uppercase ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && sortedFiltered.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">

            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Showing {startIdx + 1} to{" "}
              {Math.min(
                startIdx + itemsPerPage,
                sortedFiltered.length
              )}{" "}
              of {sortedFiltered.length} Entries
            </span>

            <div className="flex items-center gap-2">

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.max(p - 1, 1))
                }
                disabled={currentPage === 1}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                  currentPage === 1
                    ? "bg-white/5 text-slate-600 cursor-not-allowed border border-transparent"
                    : "bg-white/5 text-cyan-400 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 active:scale-95"
                }`}
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>

              <span className="bg-black/40 border border-white/10 text-white text-[11px] font-black font-mono px-4 py-2.5 rounded-xl shadow-inner">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(p + 1, totalPages)
                  )
                }
                disabled={currentPage === totalPages}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                  currentPage === totalPages
                    ? "bg-white/5 text-slate-600 cursor-not-allowed border border-transparent"
                    : "bg-white/5 text-cyan-400 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 active:scale-95"
                }`}
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserWithdrawalHistory;