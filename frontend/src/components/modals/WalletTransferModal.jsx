
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import SuccessModal from "./SuccessModal";
import MessageModal from "./MessageModal";
import { Send, User, Lock, Wallet, ArrowRightLeft, X, XCircle, CheckCircle2, ShieldCheck, Activity, Zap, Clock, FileText } from "lucide-react";

const WalletTransferModal = ({ onClose }) => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [senderBalance, setSenderBalance] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user: loggedInUser, token } = useAuth();
  const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

  // 🔥 UPDATE: Ab 'leader' ki jagah 'setup' aur 'super' role check hoga
  const isSpecialUser = loggedInUser?.role === "setup" || loggedInUser?.role === "super";
  const isPromoUser = loggedInUser?.role === "promo";

  const quickAmounts = [10, 50, 100, 200, 500];

  const showMessage = (title, message, type = "error") =>
    setMessageModal({ open: true, title, message, type });

  useEffect(() => {
    if (!loggedInUser?.userId || !token) return;
    const fetchSenderBalance = async () => {
      try {
        const res = await api.get(`/user/${loggedInUser.userId}?t=${new Date().getTime()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSenderBalance(res.data.user.walletBalance || 0);
      } catch (err) {
        setSenderBalance(0);
        console.error(err);
      }
    };
    fetchSenderBalance();
  }, [loggedInUser?.userId, token]);

  const fetchUserName = async (idToFetch) => {
    if (isPromoUser) return;

    const trimmedId = (idToFetch || userId).trim();
    if (!trimmedId) {
      setUserName("");
      return;
    }
    try {
      const res = await api.get(`/user/${trimmedId}?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserName(res.data.user?.name || "User not found");
    } catch {
      setUserName("User not found");
    }
  };

  const handleTransfer = async () => {
    const amt = Number(amount);

    if (!transactionPassword) return showMessage("Security Alert", "Enter your Tx-PIN to authorize this transfer.", "error");

    if (isPromoUser) {
      if (amt < 10 || amt > 1000) {
        return showMessage("Invalid Amount", "Promo transfer amount must be between $10 and $1000.", "error");
      }
    }
    else {
      const trimmedId = userId.trim();
      if (!trimmedId || amt <= 0 || !userName || userName === "User not found")
        return showMessage("Validation Error", "Provide a valid recipient ID and amount.", "error");
      if (trimmedId === String(loggedInUser.userId))
        return showMessage("Action Denied", "You cannot transfer assets to yourself.", "error");
      if (amt > senderBalance)
        return showMessage("Insufficient Funds", `Your available balance is $${(Math.floor(Number(senderBalance) * 100) / 100).toFixed(2)}`, "error");
    }

    setLoading(true);
    try {
      let endpoint = "/wallet/transfer";
      let payload = { fromUserId: loggedInUser.userId, toUserId: userId.trim(), amount: amt, transactionPassword };

      if (isPromoUser) {
        endpoint = "/wallet/promo-transfer";
        payload = { amount: amt, transactionPassword };
      } else if (isSpecialUser) {
        // 🔥 UPDATE: Naya backend route match karne ke liye '/wallet/special-transfer' kar diya hai
        endpoint = "/wallet/special-transfer";
      }

      const res = await api.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });

      if (isPromoUser) {
        setUserId(res.data.generatedId);
        setUserName(res.data.name);
      }

      setSuccessOpen(true);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Transfer failed due to a network or contract error.";
      showMessage("Transfer Failed", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    setUserId("");
    setUserName("");
    setAmount("");
    setTransactionPassword("");
    onClose();
  };

  return (
    <>
      {!successOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-4 overflow-hidden animate-in fade-in duration-300">

          <style>{`
            input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            input[type=number] { -moz-appearance: textfield; }
            .custom-scroll::-webkit-scrollbar { width: 4px; }
            .custom-scroll::-webkit-scrollbar-track { background: transparent; }
            .custom-scroll::-webkit-scrollbar-thumb { background: rgba(96,165,250,0.3); border-radius: 10px; }
          `}</style>

          <div className="bg-[#0a0f1e] w-full max-w-sm rounded-[28px] border border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] flex flex-col max-h-[92vh] relative overflow-hidden animate-in zoom-in-95 duration-300">

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all border border-white/10 active:scale-95"
            >
              <X size={16} className="text-slate-300" strokeWidth={2.5} />
            </button>

            <div className="overflow-y-auto custom-scroll flex-1">

              {/* Hero header */}
              <div className="px-6 pt-7 pb-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 blur-[60px] pointer-events-none rounded-full"></div>
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/10 blur-[50px] pointer-events-none rounded-full"></div>

                <div className="relative z-10">
                  <h1 className="text-white text-2xl font-black tracking-tight mb-1">Send Funds</h1>
                  <p className="text-slate-400 text-xs font-semibold">
                    Secure <span className="text-slate-600">•</span> Fast <span className="text-slate-600">•</span> Reliable
                  </p>
                </div>

               
              </div>

              <div className="px-5 pb-6 space-y-4 relative z-10">

                {/* Secure badge row */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-amber-400" />
                    <span className="text-slate-300 text-xs font-semibold">
                      Your transactions are <span className="text-emerald-400 font-bold">100% secure</span>
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Lock size={12} className="text-slate-400" />
                  </div>
                </div>

                {/* From Wallet */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5">From Wallet</label>
                  <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Wallet size={16} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold">Wallet Balance</p>
                      <p className="text-slate-500 text-[11px] font-medium">
                        Available: {senderBalance !== null ? `$${(Math.floor(Number(senderBalance) * 100) / 100).toFixed(2)}` : "..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recipient */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5">To User ID</label>
                  {isPromoUser ? (
                    <div className="w-full bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-2xl px-4 py-3.5 font-semibold flex items-center justify-center gap-2 text-sm">
                      <ShieldCheck size={16} /> Recipient auto-allocated
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      </div>
                      <input
                        type="number"
                        placeholder="Enter User ID"
                        value={userId}
                        onChange={(e) => {
                          setUserId(e.target.value);
                          if (e.target.value.length >= 6) fetchUserName(e.target.value);
                        }}
                        onBlur={() => fetchUserName()}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-white text-sm focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-semibold placeholder-slate-500"
                      />
                    </div>
                  )}
                </div>

                {!isPromoUser && userName && (
                  <div
                    className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                      userName === "User not found"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}
                  >
                    {userName === "User not found" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    <span className="text-[11px] font-bold">
                      {userName === "User not found" ? "Account not found" : userName}
                    </span>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5">Amount (USD)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 group-focus-within:text-blue-400 font-black text-base transition-colors">$</span>
                    </div>
                    <input
                      type="number"
                      placeholder={isPromoUser ? "10 - 1000" : "Enter Amount"}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-9 text-white text-base focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-bold placeholder-slate-500"
                    />
                  </div>

                  {/* Quick amount pills */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {quickAmounts.map((q) => (
                      <button
                        key={q}
                        onClick={() => setAmount(q)}
                        className={`flex-1 min-w-[56px] py-2 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
                          Number(amount) === q
                            ? "bg-blue-500/20 border-blue-400/50 text-blue-300"
                            : "bg-white/[0.03] border-white/10 text-blue-300/80 hover:bg-white/[0.06]"
                        }`}
                      >
                        ${q}
                      </button>
                    ))}
                   
                    
                  </div>
                </div>

                {/* Tx PIN */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-2 ml-0.5">Transaction PIN</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="password"
                      placeholder="Enter your PIN"
                      value={transactionPassword}
                      autoComplete="new-password"
                      onChange={(e) => setTransactionPassword(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-white focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-mono font-bold tracking-widest placeholder-slate-500 text-sm"
                    />
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleTransfer}
                  disabled={loading}
                  className={`w-full mt-2 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${
                    loading
                      ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
                      : "bg-gradient-to-r from-amber-400 to-amber-500 text-[#0a0f1e] shadow-[0_10px_30px_-8px_rgba(251,191,36,0.5)] hover:brightness-110"
                  }`}
                >
                  {loading ? (
                    <>
                      <Activity size={18} className="animate-pulse" /> Processing...
                    </>
                  ) : (
                    <>
                      <Send size={18} strokeWidth={2.5} /> Transfer Now
                    </>
                  )}
                </button>

            

              </div>
            </div>

          </div>
        </div>
      )}

      <SuccessModal
        isOpen={successOpen}
        onClose={handleSuccessClose}
        type="transfer"
        userId={userId}
        userName={userName}
        amount={amount}
        zIndex={10000}
      />

      <MessageModal
        isOpen={messageModal.open}
        onClose={() => setMessageModal({ ...messageModal, open: false })}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        zIndex={11000}
      />
    </>
  );
};

export default WalletTransferModal;