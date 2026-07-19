// C:\Users\HP\Desktop\crowdone\frontend\src\pages\user\Support.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import SuccessModal from "../../components/modals/SuccessModal";
import { LifeBuoy, Send, MessageSquare, Wallet, Info, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

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
        { message, email: user?.email || "unknown", walletAddress, optional },
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
      const errorText = err.response?.data?.error || "Failed to send message. Please try again.";
      setStatusMsg({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500">

      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 uppercase tracking-wide flex items-center gap-3">
            <LifeBuoy className="text-blue-500" size={28} /> Support Center
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-bold tracking-widest uppercase mt-1">
            We are here to help you 24/7
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT COLUMN: Support Form */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full"></div>

            <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" /> Create New Ticket
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">

              {/* Message Input (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                  Your Message <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute top-3.5 left-0 pl-3.5 pointer-events-none">
                    <MessageSquare size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-3 pl-10 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white focus:outline-none transition-all placeholder-slate-400 custom-scroll disabled:opacity-50"
                    rows="4"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {statusMsg.text && statusMsg.type === "error" && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-3">
                  <AlertCircle size={18} className="shrink-0" />
                  <span className="font-bold text-xs tracking-wide">{statusMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                  loading
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:brightness-110 hover:scale-[1.02] shadow-[0_4px_20px_-4px_rgba(59,130,246,0.4)]"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Submit Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Ticket History */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
              <Clock size={18} className="text-blue-500" /> Ticket History
            </h3>

            <div className="flex-1 overflow-y-auto custom-scroll pr-2 space-y-4 max-h-[500px]">
              {fetching ? (
                <div className="text-center py-10">
                  <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading History...</span>
                </div>
              ) : userMessages.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">No Previous Tickets</span>
                </div>
              ) : (
                userMessages.map((m) => {

                  let statusColor = "bg-slate-100 text-slate-500 border-slate-200";
                  let StatusIcon = Clock;

                  if (m.status === "Pending") {
                    statusColor = "bg-amber-50 text-amber-600 border-amber-200";
                    StatusIcon = Clock;
                  } else if (m.status === "Resolved" || m.status === "Closed") {
                    statusColor = "bg-emerald-50 text-emerald-600 border-emerald-200";
                    StatusIcon = CheckCircle2;
                  } else if (m.status === "Rejected") {
                    statusColor = "bg-rose-50 text-rose-600 border-rose-200";
                    StatusIcon = XCircle;
                  }

                  return (
                    <div key={m._id} className="p-5 border border-slate-100 rounded-xl bg-white hover:bg-blue-50/40 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] sm:text-[10px] font-black tracking-widest uppercase rounded-md border ${statusColor}`}>
                          <StatusIcon size={12} /> {m.status || "PENDING"}
                        </span>
                        <span className="text-[10px] md:text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                          {new Date(m.createdAt).toLocaleDateString("en-GB")}
                        </span>
                      </div>

                      <p className="text-slate-600 text-sm font-medium leading-relaxed mb-3">
                        {m.message}
                      </p>

                      <div className="flex flex-col gap-1.5">
                        {m.walletAddress && (
                          <p className="text-[10px] md:text-xs text-slate-500 flex items-center gap-2">
                            <Wallet size={12} className="text-slate-400" />
                            <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono truncate max-w-[200px] sm:max-w-xs">{m.walletAddress}</span>
                          </p>
                        )}
                        {m.optional && (
                          <p className="text-[10px] md:text-xs text-slate-500 flex items-center gap-2">
                            <Info size={12} className="text-slate-400" />
                            <span className="text-slate-600 capitalize">{m.optional}</span>
                          </p>
                        )}
                      </div>

                      {m.adminReply && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl relative">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 size={14} className="text-blue-600" />
                            <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Support Reply</span>
                          </div>
                          <p className="text-slate-800 text-sm font-medium">
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

      {submittedMessage && (
        <SuccessModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          customTitle="Support Ticket Created"
          customMessage="We've received your message. Our support team will review it and get back to you shortly."
        />
      )}
    </div>
  );
};

export default Support;