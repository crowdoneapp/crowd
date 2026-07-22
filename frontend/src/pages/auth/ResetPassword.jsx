import React, { useState } from 'react';
import api from '../../api/axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ShieldAlert, Hexagon, Home, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post(`/auth/reset-password/${token}`, {
        newPassword,
      });
      
      setMessage(res.data.message || "Password reset successfully!");
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Link expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center px-4 py-8 sm:py-10 relative overflow-hidden font-sans selection:bg-cyan-400/30 selection:text-white">
      
      {/* ===== AURORA MESH BACKGROUND ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-violet-600/25 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[5%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] bg-cyan-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] max-w-[350px] max-h-[350px] bg-fuchsia-500/10 blur-[100px] rounded-full"></div>
      </div>
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      ></div>

      {/* ===== TOP BAR: brand + nav links ===== */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between mb-6 sm:mb-8">
        <Link to="/" className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity">
          <div className="bg-gradient-to-br from-cyan-400 to-violet-500 p-1.5 rounded-lg shadow-[0_4px_15px_rgba(34,211,238,0.35)]">
            <Hexagon size={16} color="#0a0e1a" fill="#0a0e1a" />
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            CROWD<span className="text-cyan-400">ONE</span>
          </span>
        </Link>
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
        >
          <Home size={14} /> Back to Login
        </Link>
      </div>

      {/* ===== CENTERED GLASS CARD ===== */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        
        {/* Pulsing ring above the card */}
        <div className="relative flex justify-center mb-[-28px] z-20">
          <div className="relative">
            <span className="absolute inset-0 rounded-2xl bg-cyan-400/40 blur-md animate-pulse"></span>
            <div className="relative bg-gradient-to-br from-cyan-400 to-violet-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_-6px_rgba(34,211,238,0.5)] border border-white/20">
              <Hexagon size={26} color="#0a0e1a" fill="#0a0e1a" />
            </div>
          </div>
        </div>

        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-[28px] pt-12 pb-8 px-6 sm:px-9 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)]">
          
          <div className="mb-7 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-tight">Set New Password</h2>
            <p className="text-slate-400 text-sm font-medium">Create a strong password for your account.</p>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              ✅ {message}
            </div>
          )}
          {error && (
            <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              <ShieldAlert size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            
            {/* New Password Input */}
            <div className="relative group z-20">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 pr-12 text-white font-bold placeholder-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 outline-none transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative group z-10">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 pr-12 text-white font-bold placeholder-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 outline-none transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-[#0a0e1a] font-black text-sm tracking-widest uppercase shadow-[0_10px_30px_-8px_rgba(34,211,238,0.5)] hover:shadow-[0_10px_35px_-8px_rgba(34,211,238,0.7)] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5 active:scale-95'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#0a0e1a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  UPDATING...
                </>
              ) : (
                <>RESET PASSWORD <ArrowRight size={18} strokeWidth={3} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;