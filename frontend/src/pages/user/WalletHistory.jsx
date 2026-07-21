import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { format } from "date-fns";
import { Search, ChevronLeft, ChevronRight, Wallet, History, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Zap, Landmark, Activity } from "lucide-react";

const WalletHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [userId, setUserId] = useState(null);

  const [userRole, setUserRole] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const allTypes = [
    "deposit", "credit_to_wallet", "credit", "transfer", "topup",
    "debit_topup", "withdrawal", "manual_credit", "manual_debit", "fast_track"
  ];

  const dropdownTypes = [
    "all", "deposit", "credit_to_wallet", "credit", "transfer",
    "topup", "withdrawal", "fast_track"
  ];

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { setError("User not found."); setLoading(false); return; }
    try {
      const parsedUser = JSON.parse(userStr);
      if (!parsedUser?.userId) throw new Error("Invalid user");
      setUserId(String(parsedUser.userId));

      setUserRole(parsedUser.role ? parsedUser.role.toLowerCase() : "");
      fetchWalletHistory(String(parsedUser.userId));
    } catch { setError("Invalid user."); setLoading(false); }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  const fetchWalletHistory = async (uid) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/wallet/history/${uid}?t=${new Date().getTime()}`);

      let txns = [];
      if (res.data && Array.isArray(res.data.history)) {
        txns = res.data.history;
      } else if (Array.isArray(res.data)) {
        txns = res.data;
      }

      const formattedHistory = txns
        .filter((t) => allTypes.includes(t.type))
        .filter((t) => {
          const desc = (t.description || "").toLowerCase();

          if (t.type === "transfer") {
            const isSender = String(t.fromUserId) === String(uid) || String(t.userId) === String(uid);
            const isReceiver = String(t.toUserId) === String(uid);

            if (!isSender && !isReceiver) return false;
            if (isReceiver && !isSender && desc.includes("transferred")) return false;
            if (isSender && !isReceiver && desc.includes("received")) return false;
          }

          return !(
            desc.includes("auto-pool") ||
            desc.includes("pool level") ||
            desc.includes("pool income") ||
            desc.includes("singel leg") ||
            desc.includes("single leg") ||
            desc.includes("community income") ||
            desc.includes("unlocked") ||
            desc.includes("instant leader staking bonus") ||
            desc.includes("instant leader bonus") ||
            desc.includes("instant bonus from downline")
          );
        })
        .map((t) => {
          let val = 0;
          if (t.amount && typeof t.amount === "object" && t.amount.$numberDecimal) {
            val = parseFloat(t.amount.$numberDecimal);
          } else if (t.amount !== undefined && t.amount !== null) {
            val = parseFloat(t.amount);
          } else {
            val = parseFloat(t.grossAmount || 0);
          }

          return {
            ...t,
            date: t.createdAt || t.date,
            rawAmount: isNaN(val) ? 0 : val
          };
        });

      const uniqueTxns = [];
      const seenTxnIds = new Set();

      for (const txn of formattedHistory) {
        if (!seenTxnIds.has(txn._id)) {
          seenTxnIds.add(txn._id);
          uniqueTxns.push(txn);
        }
      }

      uniqueTxns.sort((a, b) => new Date(a.date) - new Date(b.date));
      setTransactions(uniqueTxns);

    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = () => {
    let runningBalance = 0;

    return transactions.map((txn) => {
      let mathImpact = 0;
      let colorStyle = "text-slate-300";
      let operator = "";
      let finalDescription = txn.description || "";
      let displayTypeUI = "UNKNOWN";
      let icon = <History size={14} />;

      const amt = Number(txn.rawAmount || 0);
      const myId = String(userId);
      const fromId = txn.fromUserId ? String(txn.fromUserId) : "";
      const toId = txn.toUserId ? String(txn.toUserId) : "";
      const txnOwnerId = String(txn.userId);

      switch (txn.type) {
        case "deposit":
        case "manual_credit":
        case "credit_to_wallet":
        case "credit":
          mathImpact = amt;
          colorStyle = "text-emerald-400";
          operator = "+";
          displayTypeUI = "CREDIT";
          icon = <ArrowDownLeft size={14} className="text-emerald-400" />;
          break;

        case "fast_track":
          mathImpact = amt;
          colorStyle = "text-amber-400";
          operator = "+";
          displayTypeUI = "FAST TRACK";
          icon = <Zap size={14} className="text-amber-400" />;
          break;

        case "manual_debit":
          mathImpact = -amt;
          colorStyle = "text-rose-400";
          operator = "-";
          displayTypeUI = "DEBIT";
          icon = <ArrowUpRight size={14} className="text-rose-400" />;
          break;

        case "withdrawal":
          mathImpact = txn.status === "success" || txn.status === "completed" ? -amt : 0;
          colorStyle = "text-slate-400";
          operator = mathImpact < 0 ? "-" : "";
          displayTypeUI = "WITHDRAWAL";
          icon = <Landmark size={14} className="text-slate-400" />;
          break;

        case "transfer":
          if (toId === myId) {
            mathImpact = amt;
            colorStyle = "text-emerald-400";
            operator = "+";
            displayTypeUI = "RECEIVED";
            icon = <ArrowDownLeft size={14} className="text-emerald-400" />;
            finalDescription = `Received $${amt} from ID #${fromId || txnOwnerId}`;
          } else if (fromId === myId || (!fromId && txnOwnerId === myId)) {
            mathImpact = -amt;
            colorStyle = "text-rose-400";
            operator = "-";
            displayTypeUI = "SENT P2P";
            icon = <ArrowRightLeft size={14} className="text-rose-400" />;
          }
          break;

        case "topup":
        case "debit_topup": {
          displayTypeUI = "TOPUP";
          icon = <Zap size={14} className="text-amber-400" />;
          const isMyMoneySpent = fromId === myId || (!fromId && txnOwnerId === myId);

          if (isMyMoneySpent) {
            if (amt === 10 && finalDescription.includes("Pre-launch")) {
              mathImpact = 0;
              colorStyle = "text-amber-400";
              operator = "";
            }
            else if (userRole === "leader" || finalDescription.toLowerCase().includes("leader")) {
              mathImpact = 0;
              colorStyle = "text-slate-400";
              operator = "";
            }
            else {
              mathImpact = -amt;
              colorStyle = "text-rose-400";
              operator = "-";
            }
          } else {
            mathImpact = 0;
            colorStyle = "text-slate-400";
            operator = "";
          }
          break;
        }

        default:
          break;
      }

      if (userRole !== "leader") {
        runningBalance += mathImpact;
      }

      const finalFormattedAmt = `${operator} $${(amt || 0).toFixed(2)}`;

      return {
        ...txn,
        description: finalDescription,
        balance: userRole === "leader" ? "0.00" : (runningBalance || 0).toFixed(2),
        colorStyle,
        formattedAmount: finalFormattedAmt,
        displayTypeUI,
        icon,
        fromIdSafe: fromId,
        toIdSafe: toId,
        txnOwnerIdSafe: txnOwnerId,
      };
    });
  };

  const processedData = calculateBalances();

  const currentWalletBalance = processedData.length > 0 ? processedData[processedData.length - 1].balance : "0.00";

  const filtered = processedData.filter((txn) => {
    const s = searchTerm.toLowerCase();
    const matchesType = typeFilter === "all" || txn.type === typeFilter;
    const matchesSearch =
      txn.displayTypeUI.toLowerCase().includes(s) ||
      txn.description?.toLowerCase().includes(s) ||
      txn.fromIdSafe.includes(s) ||
      txn.toIdSafe.includes(s) ||
      txn.txnOwnerIdSafe.includes(s);

    return matchesType && matchesSearch;
  });

  const reversedData = [...filtered].reverse();
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reversedData.slice(indexOfFirstItem, indexOfLastItem);

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
                <History className="text-amber-400" size={24} /> 
             </div>
             Wallet Statement
          </h2>
          
        </div>
      </div>

      {/* Balance Card */}
      {/* <div className="mb-8 relative group max-w-sm">
        <div className="absolute inset-0 bg-amber-500/10 rounded-3xl blur-[40px] opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"></div>
        <div className="bg-[#131b2f] shadow-inner rounded-3xl border border-amber-500/20 p-5 md:p-6 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
          <h3 className="text-amber-400/80 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-amber-400" /> Current Wallet Balance
          </h3>
          <p className="text-3xl md:text-4xl font-black text-white font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
            ${currentWalletBalance}
          </p>
        </div>
      </div> */}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center bg-[#131b2f] shadow-inner p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-500 group-focus-within:text-amber-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by ID or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 text-sm font-bold tracking-wide rounded-xl px-4 py-3.5 pl-11 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder-slate-600 shadow-inner"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap hidden sm:block">Filter:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#0b0f19] border border-slate-700 text-slate-200 text-sm font-bold rounded-xl px-4 py-3.5 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all appearance-none cursor-pointer uppercase shadow-inner outline-none"
          >
            {dropdownTypes.map((type) => (
              <option key={type} value={type} className="bg-[#0b0f19] text-slate-200">
                {type === "all" ? "All Types" : type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="w-full">
        <div className="overflow-x-auto crowd-scroll w-full pb-4">
          <div className="min-w-[950px]">

            {/* Header row */}
            <div className="bg-[#1a233a] border-b border-slate-700/50 rounded-xl px-6 py-4 grid grid-cols-7 gap-3 mb-4 shadow-md text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest">
              <div className="text-center">Sr.</div>
              <div className="text-right">Date</div>
              <div>Type</div>
              <div>Amount</div>
              <div>Balance</div>
              <div>From / To</div>
              <div>Details</div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {loading ? (
                <div className="bg-[#131b2f] rounded-xl py-12 text-center border border-slate-800 shadow-sm">
                  <Activity size={32} className="text-amber-400 animate-pulse mx-auto mb-3" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Syncing Statement...</span>
                </div>
              ) : error ? (
                <div className="bg-rose-500/10 rounded-xl py-10 text-center border border-rose-500/20">
                  <span className="text-rose-400 font-bold text-sm uppercase tracking-widest">{error}</span>
                </div>
              ) : currentItems.length === 0 ? (
                <div className="bg-[#131b2f] rounded-xl py-12 text-center border border-slate-800">
                  <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">No Transactions Found</span>
                </div>
              ) : (
                currentItems.map((txn, idx) => {
                  const serialNumber = indexOfFirstItem + idx + 1;
                  let partyInfo = "-";

                  if (txn.type === "fast_track") {
                    partyInfo = txn.fromIdSafe ? `From: ${txn.fromIdSafe}` : "-";
                  }
                  else if (txn.fromIdSafe === String(userId) && txn.toIdSafe === String(userId)) {
                    partyInfo = "Self";
                  }
                  else if (txn.fromIdSafe === String(userId)) {
                    partyInfo = `To: ${txn.toIdSafe}`;
                  }
                  else if (txn.toIdSafe === String(userId)) {
                    partyInfo = `From: ${txn.fromIdSafe}`;
                  }
                  else if (txn.type === "topup" && !txn.fromIdSafe && txn.txnOwnerIdSafe === String(userId)) {
                    partyInfo = "Self";
                  }

                  return (
                    <div
                      key={`${txn._id}-${txn.date}-${idx}`}
                      className="bg-[#131b2f] hover:bg-[#1a233a] rounded-xl px-6 py-4 grid grid-cols-7 gap-3 items-center shadow-sm border border-slate-800 transition-colors"
                    >
                      <div className="font-bold text-slate-500 text-center">{serialNumber}</div>

                      {/* 🔥 SIRF DATE DIKHEGI, TIME REMOVED */}
                      <div className="text-slate-200 font-mono text-[12px] sm:text-sm font-bold tracking-wide text-right">
                        {txn.date ? format(new Date(txn.date), "dd MMM yyyy") : "N/A"}
                      </div>

                      <div>
                        <span className="inline-flex items-center gap-1.5 bg-[#0b0f19] border border-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-widest text-slate-300">
                          {txn.icon} {txn.displayTypeUI}
                        </span>
                      </div>

                      <div className={`font-black font-mono text-sm ${txn.colorStyle}`}>
                        {txn.formattedAmount}
                      </div>

                      <div className="font-black text-white font-mono text-sm">
                        ${txn.balance}
                      </div>

                      <div className="font-mono text-slate-300 text-xs">
                        {partyInfo !== "-" ? <span className="bg-[#0b0f19] px-2.5 py-1.5 border border-slate-700 rounded-lg">{partyInfo}</span> : "-"}
                      </div>

                      <div className="text-slate-400 text-[11px] md:text-xs font-medium tracking-wide capitalize truncate" title={txn.description || "-"}>
                        {txn.description
                          ? txn.description
                              .replace(/leader settlement:?\s*/gi, "")
                              .replace(/pool/gi, "Community Income")
                          : "-"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Pagination Footer */}
        {!loading && !error && filtered.length > 0 && (
          <div className="mt-6 p-4 bg-[#1a233a] rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Rows:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-[#0b0f19] border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-3 py-2 focus:border-amber-400 outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
              Showing <span className="text-amber-400">{indexOfFirstItem + 1}</span> to <span className="text-amber-400">{Math.min(indexOfLastItem, filtered.length)}</span> of <span className="text-amber-400">{filtered.length}</span> Entries
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
};

export default WalletHistory;