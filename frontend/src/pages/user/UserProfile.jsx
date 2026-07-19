import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../api/axios";
import {
  ArrowLeft, Lock, User, Mail, Wallet, ShieldCheck, BadgeInfo,
  Settings2, Clock, Send, Copy, Fingerprint, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MessageModal from '../../components/modals/MessageModal';

function UserProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    walletAddress: user?.walletAddress || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        walletAddress: user.walletAddress || '',
      });
    }
  }, [user]);

  const [loginPassword, setLoginPassword] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [currentTxnPassword, setCurrentTxnPassword] = useState('');
  const [newTxnPassword, setNewTxnPassword] = useState('');

  const [messageModal, setMessageModal] = useState({
    open: false, title: '', message: '', type: 'info',
  });

  const showMessage = (title, message, type = 'info') =>
    setMessageModal({ open: true, title, message, type });

  const handleChangePassword = async (type) => {
    let payload;
    if (type === 'login') {
      if (!loginPassword || !newLoginPassword) {
        return showMessage('Missing Fields', 'Please enter current and new login password.', 'warning');
      }
      payload = { oldPassword: loginPassword, newPassword: newLoginPassword };
    } else {
      if (!currentTxnPassword || !newTxnPassword) {
        return showMessage('Missing Fields', 'Please enter current and new transaction password.', 'warning');
      }
      payload = { oldTxnPassword: currentTxnPassword, newTxnPassword };
    }

    try {
      await api.put(`/user/change-password/${user.userId}`, payload);
      showMessage('Password Updated', 'Your password has been changed successfully.', 'success');

      if (type === 'login') {
        setLoginPassword('');
        setNewLoginPassword('');
      } else {
        setCurrentTxnPassword('');
        setNewTxnPassword('');
      }
    } catch (err) {
      showMessage('Error', err.response?.data?.message || 'Password update failed.', 'error');
    }
  };

  const supportEmail = "support@crowdone.world";
  const mailSubject = encodeURIComponent(`Wallet Address Update Request - User ID: ${user?.userId}`);
  const mailBody = encodeURIComponent(`Hello Support Team,\n\nPlease update my USDT (BEP20) wallet address.\n\nUser ID: ${user?.userId}\nRegistered Email: ${user?.email}\nNew Wallet Address: [Please paste your BEP-20 address here]\n\nThank you.`);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const gmailWebLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}&su=${mailSubject}&body=${mailBody}`;
  const mailToLink = `mailto:${supportEmail}?subject=${mailSubject}&body=${mailBody}`;
  const finalMailLink = isMobile ? mailToLink : gmailWebLink;

  const handleCopyDetails = () => {
    const template = `To: ${supportEmail}\nSubject: Wallet Address Update Request - User ID: ${user?.userId}\n\nHello Support Team,\n\nPlease update my USDT (BEP20) wallet address.\n\nUser ID: ${user?.userId}\nRegistered Email: ${user?.email}\nNew Wallet Address: [Please paste your BEP-20 address here]\n\nThank you.`;
    navigator.clipboard.writeText(template);
    alert("Email details copied to clipboard! You can paste this in your email app.");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex justify-center items-center font-bold text-xl">
        Please login first.
      </div>
    );
  }

  const navItems = [
    { id: 'profile', label: 'Account Details', icon: User },
    { id: 'security', label: 'Security & PIN', icon: Settings2 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-500/20 pb-20">

      {/* Neo-Banking Background Glows */}
      <div className="fixed top-0 right-0 w-[50vw] h-[50vw] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-[50vw] h-[50vw] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95 shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">Wallet Console</p>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Profile & Security</h1>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          {/* LEFT SIDEBAR */}
          <div className="space-y-6">

            {/* User Profile Card */}
            <div className="bg-white border border-slate-100 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] rounded-[24px] p-6 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-50 rounded-full blur-[30px] group-hover:bg-blue-100 transition-colors duration-500 pointer-events-none"></div>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-lg border-2 border-white relative z-10 mb-4">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight relative z-10">{user.name}</h2>
              <p className="text-xs font-bold text-slate-500 mt-1 relative z-10">{user.email}</p>

              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3 relative z-10">
                <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">User ID</span>
                  <span className="text-xs font-mono font-black text-blue-600">{user.userId}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Sponsor</span>
                  <span className="text-xs font-mono font-black text-slate-700">{user.sponsorId || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border border-slate-100 shadow-sm rounded-[20px] p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all mb-1 last:mb-0 ${isActive ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' : 'text-slate-500 border border-transparent hover:bg-slate-50 hover:text-slate-800'}`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                      {item.label}
                    </span>
                    <ChevronRight size={16} className={isActive ? 'text-blue-500' : 'text-slate-300'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div>
            {/* ================= TAB 1: PROFILE DETAILS ================= */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">

                {/* Account Info Box */}
                <div className="bg-white border border-slate-100 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] rounded-[24px] p-6 md:p-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-5 flex items-center gap-2">
                    <User size={14} /> Personal Information
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
                        <User size={16} className="text-slate-400 shrink-0" />
                        <span className="text-sm font-bold text-slate-700 truncate">{formData.name}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
                        <Mail size={16} className="text-slate-400 shrink-0" />
                        <span className="text-sm font-bold text-slate-700 truncate">{formData.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet Info Box */}
                <div className="bg-white border border-slate-100 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] rounded-[24px] p-6 md:p-8">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-2">
                      <Wallet size={14} /> USDT Wallet (BEP20)
                    </p>
                    <Wallet size={18} className={formData.walletAddress ? "text-indigo-500" : "text-slate-300"} />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4">
                    <span className={`text-sm font-mono font-bold break-all ${formData.walletAddress ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                      {formData.walletAddress || 'Not updated yet'}
                    </span>
                  </div>

                  {/* Request Wallet Update Area */}
                  {!formData.walletAddress && (
                    <div className="mt-6 bg-blue-50/80 border border-blue-100 rounded-2xl p-5 md:p-6 shadow-sm">
                      <h4 className="text-blue-800 font-black text-sm mb-2 flex items-center gap-2">
                        <BadgeInfo size={16} /> Request a Wallet Update
                      </h4>
                      <p className="text-xs font-semibold text-blue-700/80 mb-5 leading-relaxed">
                        Send a request from your registered email to update your withdrawal wallet. Verification takes{' '}
                        <span className="text-blue-800 font-black">24-48 hours</span>.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href={finalMailLink}
                          target={isMobile ? "_self" : "_blank"}
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-[11px] uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all active:scale-95 shadow-md"
                        >
                          <Send size={16} /> Open Mail App
                        </a>
                        <button
                          onClick={handleCopyDetails}
                          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 font-black text-[11px] uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all active:scale-95 shadow-sm"
                        >
                          <Copy size={16} /> Copy Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wallet History Box */}
                {user.walletAddressHistory && user.walletAddressHistory.length > 0 && (
                  <div className="bg-white border border-slate-100 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] rounded-[24px] p-6 md:p-8">
                    <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-5">
                      <Clock size={14} /> Wallet History
                    </p>
                    <div className="space-y-3 relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                      {[...user.walletAddressHistory].reverse().map((history, idx) => (
                        <div key={idx} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 shadow-sm">
                          <span className="absolute -left-[19px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400"></span>
                          <span className="text-xs font-mono font-bold text-slate-600 break-all">{history.address}</span>
                          <span className="text-[10px] font-black text-slate-400 shrink-0 uppercase tracking-widest bg-white px-2 py-1 rounded border border-slate-100">
                            {new Date(history.changedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 2: SECURITY SETTINGS ================= */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">

                <div className="bg-white border border-slate-100 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] rounded-[24px] p-6 md:p-8">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-800 mb-5 border-b border-slate-100 pb-4">
                    <ShieldCheck size={20} className="text-blue-600" /> Account Access Password
                  </div>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Current Login Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold placeholder-slate-400 transition-all shadow-sm"
                    />
                    <input
                      type="password"
                      placeholder="New Login Password"
                      value={newLoginPassword}
                      onChange={(e) => setNewLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold placeholder-slate-400 transition-all shadow-sm"
                    />
                    <button
                      onClick={() => handleChangePassword('login')}
                      className="w-full py-4 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-sm mt-2"
                    >
                      Update Access Password
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] rounded-[24px] p-6 md:p-8">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-800 mb-5 border-b border-slate-100 pb-4">
                    <Fingerprint size={20} className="text-indigo-500" /> Transaction Security PIN
                  </div>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Current Txn Password"
                      value={currentTxnPassword}
                      onChange={(e) => setCurrentTxnPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold font-mono placeholder-slate-400 transition-all shadow-sm"
                    />
                    <input
                      type="password"
                      placeholder="New Txn Password"
                      value={newTxnPassword}
                      onChange={(e) => setNewTxnPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold font-mono placeholder-slate-400 transition-all shadow-sm"
                    />
                    <button
                      onClick={() => handleChangePassword('txn')}
                      className="w-full py-4 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-sm mt-2"
                    >
                      Update Security PIN
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      <MessageModal
        isOpen={messageModal.open}
        onClose={() => setMessageModal({ ...messageModal, open: false })}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        zIndex={11000}
      />
    </div>
  );
}

export default UserProfile;