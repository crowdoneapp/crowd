import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, Home, Hexagon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const UserLogin = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [savedUsers, setSavedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const inputRef = useRef(null);

  // Automatic hard refresh (once per session)
  useEffect(() => {
    const hasRefreshed = sessionStorage.getItem('site_updated_refresh');
    if (!hasRefreshed) {
      sessionStorage.setItem('site_updated_refresh', 'true');
      window.location.reload();
    }
  }, []);

  // Auto-login from admin link
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get('token');
    const urlUser = queryParams.get('user');

    if (urlToken && urlUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(urlUser));
        localStorage.setItem('token', urlToken);
        localStorage.setItem('user', JSON.stringify(userData));
        login(userData, urlToken);
        window.history.replaceState({}, document.title, '/login');
        window.location.href = '/dashboard';
      } catch (err) {
        console.error('Auto-login data parsing failed', err);
        setError('Invalid login link from Admin.');
      }
    }
  }, [location.search, login]);

  // Saved users logic
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('savedUsers') || '[]');
    setSavedUsers(users);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (userId === '') {
      setFilteredUsers(savedUsers);
    } else {
      setFilteredUsers(
        savedUsers.filter(u => u.id.toLowerCase().includes(userId.toLowerCase()))
      );
    }
  }, [userId, savedUsers]);

  const handleUserSelect = (id) => {
    const user = savedUsers.find(u => u.id === id);
    if (user) {
      setUserId(user.id);
      setPassword(user.password);
      setRememberMe(true);
      setDropdownOpen(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fpPromise = FingerprintJS.load();
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;

      const res = await api.post('/auth/login', { userId, password, deviceId: visitorId });
      const { token, user } = res.data;

      login(user, token);

      if (rememberMe) {
        const updatedUsers = savedUsers.filter(u => u.id !== userId);
        updatedUsers.unshift({ id: userId, password });
        localStorage.setItem('savedUsers', JSON.stringify(updatedUsers));
        setSavedUsers(updatedUsers);
      }

      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
        >
          <Home size={14} /> Home
        </Link>
      </div>

      {/* ===== CENTERED GLASS CARD ===== */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

        {/* Pulsing ring above the card, centered on the seam */}
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
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-tight">Welcome back</h2>
            <p className="text-slate-400 text-sm font-medium">Sign in to your network dashboard.</p>
          </div>

          {error && (
            <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              <ShieldAlert size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            {/* User ID Field */}
            <div ref={inputRef} className="relative z-20">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.replace(/\D/g, ''))}
                  onFocus={() => setDropdownOpen(true)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-white font-bold placeholder-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 outline-none transition-all"
                  required
                />
              </div>

              {dropdownOpen && filteredUsers.length > 0 && (
                <div className="absolute top-[105%] left-0 right-0 bg-[#141a2b] border border-white/10 shadow-2xl rounded-xl overflow-hidden z-50 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  {filteredUsers.map((u, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                      onClick={() => handleUserSelect(u.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[#0a0e1a] shadow-inner flex-shrink-0">
                          <User size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-slate-200 font-bold font-mono text-sm truncate">{u.id}</span>
                      </div>
                      <span className="text-[10px] font-black text-cyan-300 bg-cyan-400/10 border border-cyan-400/30 px-2 py-1 rounded uppercase tracking-wider flex-shrink-0">
                        Saved
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="relative group z-10">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 pr-12 text-white font-bold placeholder-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 outline-none transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${rememberMe ? 'bg-gradient-to-br from-cyan-400 to-violet-500 border-transparent' : 'border-white/20 group-hover:border-cyan-400/50'}`}>
                  {rememberMe && <CheckCircle2 size={14} color="#0a0e1a" strokeWidth={3} />}
                </div>
                <span className="text-slate-400 text-sm font-bold select-none group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>

              <Link to="/" className="text-cyan-400 text-sm font-black hover:text-cyan-300 transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-[#0a0e1a] font-black text-sm tracking-widest uppercase shadow-[0_10px_30px_-8px_rgba(34,211,238,0.5)] hover:shadow-[0_10px_35px_-8px_rgba(34,211,238,0.7)] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5 active:scale-95'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#0a0e1a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  AUTHENTICATING...
                </>
              ) : (
                <>ACCESS DASHBOARD <ArrowRight size={18} strokeWidth={3} /></>
              )}
            </button>

          </form>
        </div>

        {/* Footer strip below the card */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <span>New here?</span>
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Create an account
          </Link>
          <span className="text-slate-700">•</span>
          <span>256-Bit Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;