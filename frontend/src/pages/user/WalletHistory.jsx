import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Search, ChevronLeft, ChevronRight, Wallet, History, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Zap, Landmark } from "lucide-react";

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
      let colorStyle = "text-black";
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
          colorStyle = "text-emerald-600";
          operator = "+";
          displayTypeUI = "CREDIT";
          icon = <ArrowDownLeft size={14} className="text-emerald-500" />;
          break;

        case "fast_track":
          mathImpact = amt;
          colorStyle = "text-blue-600";
          operator = "+";
          displayTypeUI = "FAST TRACK";
          icon = <Zap size={14} className="text-blue-500" />;
          break;

        case "manual_debit":
          mathImpact = -amt;
          colorStyle = "text-rose-600";
          operator = "-";
          displayTypeUI = "DEBIT";
          icon = <ArrowUpRight size={14} className="text-rose-500" />;
          break;

        case "withdrawal":
          mathImpact = txn.status === "success" || txn.status === "completed" ? -amt : 0;
          colorStyle = "text-slate-500";
          operator = mathImpact < 0 ? "-" : "";
          displayTypeUI = "WITHDRAWAL";
          icon = <Landmark size={14} className="text-slate-500" />;
          break;

        case "transfer":
          if (toId === myId) {
            mathImpact = amt;
            colorStyle = "text-emerald-600";
            operator = "+";
            displayTypeUI = "RECEIVED";
            icon = <ArrowDownLeft size={14} className="text-emerald-500" />;
            finalDescription = `Received $${amt} from ID #${fromId || txnOwnerId}`;
          } else if (fromId === myId || (!fromId && txnOwnerId === myId)) {
            mathImpact = -amt;
            colorStyle = "text-rose-600";
            operator = "-";
            displayTypeUI = "SENT P2P";
            icon = <ArrowRightLeft size={14} className="text-rose-500" />;
          }
          break;

        case "topup":
        case "debit_topup": {
          displayTypeUI = "TOPUP";
          icon = <Zap size={14} className="text-amber-500" />;
          const isMyMoneySpent = fromId === myId || (!fromId && txnOwnerId === myId);

          if (isMyMoneySpent) {
            if (amt === 10 && finalDescription.includes("Pre-launch")) {
              mathImpact = 0;
              colorStyle = "text-amber-500";
              operator = "";
            }
            else if (userRole === "leader" || finalDescription.toLowerCase().includes("leader")) {
              mathImpact = 0;
              colorStyle = "text-slate-500";
              operator = "";
            }
            else {
              mathImpact = -amt;
              colorStyle = "text-rose-600";
              operator = "-";
            }
          } else {
            mathImpact = 0;
            colorStyle = "text-slate-500";
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
            <History className="text-blue-500" size={28} /> Wallet Statement
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-bold tracking-widest uppercase mt-1">
            Complete wallet transaction history
          </p>
        </div>
      </div>

      {/* Balance Card (Main Wallet only) */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm relative overflow-hidden max-w-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[40px]"></div>
          <h3 className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-blue-500" /> Current Wallet Balance
          </h3>
          <p className="text-3xl md:text-4xl font-black text-slate-800">
            ${currentWalletBalance}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by ID or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold rounded-full px-5 py-3.5 pl-12 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white focus:outline-none transition-all placeholder-slate-400 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Filter:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-3 focus:border-blue-400 focus:outline-none transition-all appearance-none cursor-pointer uppercase shadow-sm"
          >
            {dropdownTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="w-full">
        <div className="overflow-x-auto custom-scroll w-full">
          <div className="min-w-[900px]">

            {/* Header row */}
            <div className="bg-slate-100 rounded-2xl px-6 py-4 grid grid-cols-7 gap-3 mb-3 shadow-sm">
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Sr.</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest text-right">Date & Time</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Type</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Amount</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Balance</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">From / To</div>
              <div className="text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest">Details</div>
            </div>

            {/* Rows */}
            <div className="space-y-2.5">
              {loading ? (
                <div className="bg-white rounded-2xl py-10 text-center shadow-sm border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Statement...</span>
                </div>
              ) : error ? (
                <div className="bg-white rounded-2xl py-10 text-center shadow-sm border border-slate-100">
                  <span className="text-rose-500 font-bold text-sm uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-lg border border-rose-200">{error}</span>
                </div>
              ) : currentItems.length === 0 ? (
                <div className="bg-white rounded-2xl py-10 text-center shadow-sm border border-slate-100">
                  <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">No Transactions Found</span>
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
                      className="bg-white hover:bg-blue-50/50 rounded-2xl px-6 py-4 grid grid-cols-7 gap-3 items-center shadow-sm border border-slate-100 transition-colors"
                    >
                      <div className="font-bold text-slate-400 text-sm text-center">{serialNumber}</div>

                      <div className="text-slate-400 font-mono text-[10px] sm:text-xs text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-slate-600">
                            {new Date(txn.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          <span>{new Date(txn.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                        </div>
                      </div>

                      <div>
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-[10px] font-black tracking-widest text-slate-600">
                          {txn.icon} {txn.displayTypeUI}
                        </span>
                      </div>

                      <div className={`font-black ${txn.colorStyle}`}>
                        {txn.formattedAmount}
                      </div>

                      <div className="font-black text-slate-800">
                        ${txn.balance}
                      </div>

                      <div className="font-mono text-slate-600 text-xs">
                        {partyInfo !== "-" ? <span className="bg-slate-100 px-2 py-1 border border-slate-200 rounded">{partyInfo}</span> : "-"}
                      </div>

                      <div className="text-slate-500 text-[11px] md:text-xs font-bold tracking-wide capitalize whitespace-normal" title={txn.description || "-"}>
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
          <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Rows:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1.5 focus:border-blue-400 outline-none cursor-pointer shadow-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

export default WalletHistory;