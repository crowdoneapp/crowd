import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import SuccessModal from "../../components/modals/SuccessModal";
import {
  LifeBuoy,
  Send,
  MessageSquare,
  Wallet,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Ticket,
  ShieldCheck,
} from "lucide-react";

const Support = () => {
  const { user, token } = useAuth();
  const [message, setMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [optional, setOptional] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [userMessages, setUserMessages] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      setFetching(true);
      const res = await api.get(`/support/me?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserMessages(res.data.supports || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setStatusMsg({ type: "error", text: "Please enter your message." });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const res = await api.post(
        "/support/create",
        {
          message,
          email: user?.email || "unknown",
          walletAddress,
          optional,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSubmittedMessage({ message, walletAddress, optional });
        setShowModal(true);
        setMessage("");
        setWalletAddress("");
        setOptional("");
        fetchMessages();
      }
    } catch (err) {
      const errorText =
        err.response?.data?.error || "Failed to send message. Please try again.";
      setStatusMsg({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const headerStats = userMessages.length;
  const successTitle = "Ticket Submitted";
  const successMessage =
    "Your support request has been received successfully. Our team will review it and respond as soon as possible.";

  return (
    <div className="w-full max-w-6xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500">
      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34,211,238,.35); border-radius: 999px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,.55); }
      `}</style>

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#08111f]/90 shadow-[0_30px_80px_-18px_rgba(14,165,233,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_26%),linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_38%)]" />
        <div className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 p-5 md:p-7">
          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">
                <Sparkles size={12} /> Support Center
              </div>
              <h2 className="mt-3 flex items-center gap-3 text-2xl md:text-3xl font-black tracking-tight text-white">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.16)]">
                  <LifeBuoy size={24} />
                </span>
                Support Center
              </h2>
              <p className="mt-2 text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                We are here to help you 24/7
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Active tickets
              </div>
              <div className="mt-1 text-2xl font-black text-white">{headerStats}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="rounded-[24px] border border-white/10 bg-[#0a1324]/80 p-5 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <h3 className="mb-6 flex items-center gap-2 text-base md:text-lg font-black uppercase tracking-[0.22em] text-white">
                <MessageSquare size={18} className="text-cyan-300" />
                Create New Ticket
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300/90">
                    Your Message <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative group">
                    <div className="pointer-events-none absolute left-0 top-3.5 pl-4">
                      <MessageSquare
                        size={16}
                        className="text-slate-500 transition group-focus-within:text-cyan-300"
                      />
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      className="custom-scroll min-h-[130px] w-full rounded-2xl border border-white/8 bg-[#050b14] px-4 py-4 pl-11 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-[#07101d] focus:ring-4 focus:ring-cyan-400/10 disabled:opacity-50"
                      rows="5"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300/90">
                      Wallet Address
                    </label>
                    <div className="relative group">
                      <div className="pointer-events-none absolute left-0 top-3.5 pl-4">
                        <Wallet
                          size={16}
                          className="text-slate-500 transition group-focus-within:text-cyan-300"
                        />
                      </div>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="Optional wallet address"
                        className="w-full rounded-2xl border border-white/8 bg-[#050b14] px-4 py-4 pl-11 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-[#07101d] focus:ring-4 focus:ring-cyan-400/10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300/90">
                      Optional Tag
                    </label>
                    <div className="relative group">
                      <div className="pointer-events-none absolute left-0 top-3.5 pl-4">
                        <Info
                          size={16}
                          className="text-slate-500 transition group-focus-within:text-cyan-300"
                        />
                      </div>
                      <input
                        type="text"
                        value={optional}
                        onChange={(e) => setOptional(e.target.value)}
                        placeholder="Billing, login, payment..."
                        className="w-full rounded-2xl border border-white/8 bg-[#050b14] px-4 py-4 pl-11 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-[#07101d] focus:ring-4 focus:ring-cyan-400/10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {statusMsg.text && statusMsg.type === "error" && (
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-rose-300">
                    <AlertCircle size={18} className="shrink-0" />
                    <span className="text-xs font-bold tracking-wide">
                      {statusMsg.text}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  aria-disabled={loading}
                  disabled={loading}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-[0.25em] transition ${
                    loading
                      ? "cursor-not-allowed border border-white/8 bg-white/5 text-slate-500"
                      : "bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 text-white shadow-[0_16px_30px_-10px_rgba(34,211,238,0.5)] hover:brightness-110 active:scale-[0.99]"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Ticket
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0a1324]/80 p-5 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <h3 className="mb-6 flex items-center gap-2 text-base md:text-lg font-black uppercase tracking-[0.22em] text-white">
                <Clock size={18} className="text-cyan-300" />
                Ticket History
              </h3>

              <div className="custom-scroll flex-1 space-y-4 overflow-y-auto pr-1 max-h-[560px]">
                {fetching ? (
                  <div className="rounded-2xl border border-white/8 bg-white/5 py-12 text-center">
                    <svg
                      className="mx-auto mb-3 h-8 w-8 animate-spin text-cyan-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                      Loading history...
                    </span>
                  </div>
                ) : userMessages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-12 text-center">
                    <Ticket size={34} className="mx-auto mb-3 text-slate-500" />
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                      No previous tickets
                    </span>
                  </div>
                ) : (
                  userMessages.map((m) => {
                    let statusColor = "border-slate-500/20 bg-white/5 text-slate-300";
                    let StatusIcon = Clock;

                    if (m.status === "Pending") {
                      statusColor = "border-amber-400/20 bg-amber-500/10 text-amber-300";
                      StatusIcon = Clock;
                    } else if (m.status === "Resolved" || m.status === "Closed") {
                      statusColor = "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
                      StatusIcon = CheckCircle2;
                    } else if (m.status === "Rejected") {
                      statusColor = "border-rose-400/20 bg-rose-500/10 text-rose-300";
                      StatusIcon = XCircle;
                    }

                    return (
                      <div
                        key={m._id}
                        className="rounded-2xl border border-white/8 bg-[#050b14] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:border-cyan-400/20 hover:bg-[#07101d]"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] ${statusColor}`}>
                            <StatusIcon size={12} /> {m.status || "PENDING"}
                          </span>
                          <span className="rounded-lg border border-white/8 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-400">
                            {new Date(m.createdAt).toLocaleDateString("en-GB")}
                          </span>
                        </div>

                        <p className="mb-3 text-sm leading-relaxed text-slate-300">
                          {m.message}
                        </p>

                        <div className="flex flex-col gap-2">
                          {m.walletAddress && (
                            <p className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400">
                              <Wallet size={12} className="text-slate-500" />
                              <span className="max-w-[220px] truncate rounded-md border border-white/8 bg-white/5 px-2 py-0.5 font-mono text-slate-300">
                                {m.walletAddress}
                              </span>
                            </p>
                          )}

                          {m.optional && (
                            <p className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400">
                              <Info size={12} className="text-slate-500" />
                              <span className="text-slate-300">{m.optional}</span>
                            </p>
                          )}
                        </div>

                        {m.adminReply && (
                          <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4">
                            <div className="mb-1 flex items-center gap-2">
                              <ShieldCheck size={14} className="text-cyan-300" />
                              <span className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                                Support Reply
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-200">
                              {m.adminReply}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {submittedMessage && (
        <SuccessModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          customTitle={successTitle}
          customMessage={successMessage}
        />
      )}
    </div>
  );
};

export default Support;