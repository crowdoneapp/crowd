import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { format } from "date-fns";
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
      const iGross = isNewLogic ? Number(item.grossAmount || 0) : Number(item.grossAmount || 0) * 2;
      const iFee = isNewLogic ? Number(item.fee || 0) : Number(item.fee || 0) * 2;
      const iCryptoNet = Number(item.netAmount || 0); // USDT portion
      
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
          isNewLogic: isNewLogic 
        });
      }
    }

    // 🔥 LEADER ADJUSTMENT LOGIC (Sirf Purane records pe lagu hoga)
    groups.forEach(g => {
        if (isLeader && !g.isNewLogic) {
            const roundedGross = Math.floor(g.rawGross / 10) * 10;
            g.totalGross = roundedGross;
            g.totalFee = roundedGross * 0.10; 
            g.totalCryptoNet = roundedGross * 0.45; 
            g.totalTopupNet = roundedGross * 0.45; 
        } else {
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
      color: "bg-[#1a233a] text-slate-400 border border-slate-700",
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10 animate-in fade-in duration-500 rounded-3xl bg-[#0b0f19] shadow-2xl border border-slate-800 overflow-hidden font-sans">

      <style>{`
        .crowd-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .crowd-scroll::-webkit-scrollbar-track { background: #0f172a; border-radius: 10px; }
        .crowd-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .crowd-scroll::-webkit-scrollbar-thumb:hover { background: #eab308; }
      `}</style>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 uppercase tracking-wide flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.15)]">
               <Banknote className="text-amber-400" size={24} />
            </div>
             Withdrawals
          </h2>
          
        </div>
      </div>

      {/* STATS */}
      <div className="mb-8 relative group">
        <div className="absolute inset-0 bg-amber-500/10 rounded-3xl blur-[40px] opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"></div>
        <div className="bg-[#131b2f] shadow-inner rounded-3xl border border-amber-500/20 p-5 md:p-6 relative overflow-hidden flex flex-col justify-center max-w-sm transform transition-transform hover:scale-[1.02] duration-300">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>

          <h3 className="text-amber-400/80 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-amber-400" />
            Total Successfully Withdrawn
          </h3>

          <p className="text-3xl md:text-4xl font-black text-white font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
            ${totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center bg-[#131b2f] shadow-inner p-4 rounded-2xl border border-slate-800">

        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search
              size={16}
              className="text-slate-500 group-focus-within:text-amber-400 transition-colors"
            />
          </div>

          <input
            type="text"
            placeholder="Search amount, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 text-sm font-bold tracking-wide rounded-xl px-4 py-3.5 pl-11 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder-slate-600 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap hidden sm:block">
            Filter:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#0b0f19] border border-slate-700 text-slate-200 text-sm font-bold rounded-xl px-4 py-3.5 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all appearance-none cursor-pointer capitalize shadow-inner outline-none"
          >
            <option value="all" className="bg-[#0b0f19] text-slate-200">All Statuses</option>
            <option value="pending" className="bg-[#0b0f19] text-slate-200">Pending</option>
            <option value="approved" className="bg-[#0b0f19] text-slate-200">Approved</option>
            <option value="rejected" className="bg-[#0b0f19] text-slate-200">Rejected</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full">
        <div className="overflow-x-auto crowd-scroll w-full pb-4">
          <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">

            <thead className="bg-[#1a233a] border-b border-slate-700/50 text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest">
              <tr>
                <th className="p-5 text-center rounded-tl-xl">Sr.</th>
                <th className="p-5">Date</th>
                <th className="p-5">Gross Total</th>
                <th className="p-5">Network Fee</th>
                <th className="p-5">
                  <div className="flex items-center gap-1.5">
                      <span className="text-emerald-400">BEP-20 Output</span>
                  </div>
                </th>
                <th className="p-5">
                  <div className="flex items-center gap-1.5">
                      <span className="text-blue-400">Internal Vault</span>
                  </div>
                </th>
                <th className="p-5">Linked Address</th>
                <th className="p-5 text-center rounded-tr-xl">Status</th>
              </tr>
            </thead>

            <tbody className="text-slate-300">

              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-16 bg-[#131b2f] border-b border-slate-800">
                     <div className="flex flex-col items-center justify-center gap-3">
                        <Activity size={32} className="text-amber-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          Fetching Blockchain Records...
                        </span>
                     </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-16 bg-[#131b2f] border-b border-slate-800">
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">
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
                      className="bg-[#131b2f] hover:bg-[#1a233a] border-b border-slate-800 transition-colors group-hover"
                    >
                      <td className="p-5 font-bold text-slate-500 text-center">
                        {startIdx + idx + 1}
                      </td>

                      {/* 🔥 SIRF DATE DIKHEGI, TIME REMOVED */}
                      <td className="p-5 text-slate-200 font-mono text-[12px] sm:text-sm font-bold tracking-wide">
                        {group.createdAt ? format(new Date(group.createdAt), "dd MMM yyyy") : "N/A"}
                      </td>

                      <td className="p-5 font-black text-white font-mono text-sm">
                        ${group.totalGross.toFixed(2)}
                      </td>

                      <td className="p-5 font-bold text-rose-400 font-mono">
                        -${group.totalFee.toFixed(2)}
                      </td>

                      <td className="p-5 font-black text-emerald-400 font-mono">
                        ${group.totalCryptoNet.toFixed(2)}
                      </td>

                      <td className="p-5 font-black text-blue-400 font-mono">
                        ${group.totalTopupNet.toFixed(2)}
                      </td>

                      <td className="p-5 text-slate-400 font-mono text-[10px] sm:text-[11px]">
                        {group.walletAddress ? (
                          <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-[#0b0f19] shadow-inner text-slate-300">
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
          <div className="mt-6 p-4 bg-[#1a233a] rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">

            <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
              Showing <span className="text-amber-400">{startIdx + 1}</span> to{" "}
              <span className="text-amber-400">
                {Math.min(
                  startIdx + itemsPerPage,
                  sortedFiltered.length
                )}
              </span>{" "}
              of {sortedFiltered.length} Entries
            </span>

            <div className="flex items-center gap-2">

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.max(p - 1, 1))
                }
                disabled={currentPage === 1}
                className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                  currentPage === 1
                    ? "bg-[#0b0f19] text-slate-600 cursor-not-allowed border border-slate-800"
                    : "bg-[#131b2f] text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 border border-slate-700"
                }`}
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>

              <span className="bg-[#131b2f] border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-lg">
                {currentPage} <span className="text-slate-600 mx-1">/</span> {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(p + 1, totalPages)
                  )
                }
                disabled={currentPage === totalPages}
                className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                  currentPage === totalPages
                    ? "bg-[#0b0f19] text-slate-600 cursor-not-allowed border border-slate-800"
                    : "bg-[#131b2f] text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 border border-slate-700"
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