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
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col lg:flex-row font-sans selection:bg-[#e8b74e]/30 selection:text-[#12151c]">

      {/* --- LEFT SIDE: INK PANEL WITH ORBIT MOTIF (hidden on mobile) --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#12151c] flex-col justify-between p-8 xl:p-12">

        {/* Orbit rings signature graphic */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] opacity-[0.35] pointer-events-none"
          viewBox="0 0 600 600"
          fill="none"
        >
          <circle cx="300" cy="300" r="120" stroke="#e8b74e" strokeWidth="0.75" strokeDasharray="2 6" />
          <circle cx="300" cy="300" r="200" stroke="#3ecf8e" strokeWidth="0.75" strokeDasharray="2 8" />
          <circle cx="300" cy="300" r="280" stroke="#6b7280" strokeWidth="0.5" strokeDasharray="1 10" />
          <circle cx="420" cy="220" r="4" fill="#e8b74e" />
          <circle cx="150" cy="380" r="3" fill="#3ecf8e" />
          <circle cx="330" cy="500" r="2.5" fill="#8b93a5" />
        </svg>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 no-underline group w-fit hover:opacity-80 transition-opacity">
            <div className="bg-[#e8b74e] p-2 rounded-xl shadow-[0_4px_15px_rgba(232,183,78,0.35)]">
              <Hexagon size={20} color="#12151c" fill="#12151c" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight flex items-center gap-1">
              CROWD<span className="text-[#e8b74e]">ONE</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#e8b74e] text-xs font-black tracking-[0.2em] mb-6">
            SECURE PORTAL
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
            Your network, <br />
            <span className="text-[#e8b74e]">always in orbit.</span>
          </h1>
          <p className="text-slate-400 text-base xl:text-lg leading-relaxed font-medium max-w-md">
            Log in to track your community's growth, monitor earnings, and manage every transfer from one place.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 text-slate-500 text-xs xl:text-sm font-bold uppercase tracking-wider">
          <span>© {new Date().getFullYear()} CROWD ONE</span>
          <span className="text-slate-700">•</span>
          <span>256-Bit Encrypted</span>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 py-6 sm:px-8 relative overflow-y-auto bg-[#f7f5f0]">

        {/* Mobile-only header */}
        <div className="lg:hidden w-full max-w-md mb-6 flex flex-col items-center gap-4 mt-2">
          <Link to="/" className="text-2xl font-black text-[#12151c] tracking-tight flex items-center gap-2 no-underline hover:opacity-80 transition-opacity mb-2">
            <div className="bg-[#e8b74e] p-1.5 rounded-lg shadow-sm">
              <Hexagon size={18} color="#12151c" fill="#12151c" />
            </div>
            CROWD<span className="text-[#c9932e]">ONE</span>
          </Link>
          <div className="flex w-full gap-2">
            <Link to="/" className="flex-1 flex justify-center items-center gap-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-3 rounded-xl transition-colors shadow-sm">
              <Home size={16} /> Home
            </Link>
            <Link to="/register" className="flex-1 flex justify-center items-center text-sm font-black text-[#12151c] bg-[#e8b74e] hover:bg-[#dba936] px-4 py-3 rounded-xl transition-colors shadow-sm">
              Create Account
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 mt-2 md:mt-0">

          {/* Desktop header */}
          <div className="hidden lg:flex justify-end items-center mb-6 gap-3">
            <Link to="/" className="text-sm flex items-center gap-1.5 font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-colors shadow-sm">
              <Home size={16} /> Home
            </Link>
            <Link to="/register" className="text-sm font-black text-[#12151c] bg-[#e8b74e] hover:bg-[#dba936] px-4 py-2.5 rounded-xl transition-colors shadow-sm">
              Create Account
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-[#12151c] mb-2 tracking-tight">Login</h2>
            <p className="text-slate-500 text-sm font-medium">Access your global network dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2 animate-in slide-in-from-top-2 shadow-sm">
              <ShieldAlert size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* User ID Field */}
            <div ref={inputRef} className="relative z-20">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#c9932e] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.replace(/\D/g, ''))}
                  onFocus={() => setDropdownOpen(true)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 pl-12 text-[#12151c] font-bold placeholder-slate-400 focus:border-[#e8b74e] focus:ring-4 focus:ring-[#e8b74e]/15 outline-none transition-all shadow-sm"
                  required
                />
              </div>

              {dropdownOpen && filteredUsers.length > 0 && (
                <div className="absolute top-[105%] left-0 right-0 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  {filteredUsers.map((u, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-amber-50/60 border-b border-slate-100 last:border-0 transition-colors"
                      onClick={() => handleUserSelect(u.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#12151c] flex items-center justify-center text-[#e8b74e] shadow-inner flex-shrink-0">
                          <User size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-slate-800 font-bold font-mono text-sm truncate">{u.id}</span>
                      </div>
                      <span className="text-[10px] font-black text-[#8a6a1f] bg-[#e8b74e]/20 border border-[#e8b74e]/40 px-2 py-1 rounded uppercase tracking-wider flex-shrink-0">
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
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#c9932e] transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 pl-12 pr-12 text-[#12151c] font-bold placeholder-slate-400 focus:border-[#e8b74e] focus:ring-4 focus:ring-[#e8b74e]/15 outline-none transition-all font-mono shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-[#c9932e] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-2">
              <label className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#12151c] border-[#12151c]' : 'border-slate-300 group-hover:border-[#e8b74e]'}`}>
                  {rememberMe && <CheckCircle2 size={14} color="#e8b74e" strokeWidth={3} />}
                </div>
                <span className="text-slate-600 text-sm font-bold select-none group-hover:text-[#12151c] transition-colors">
                  Remember me
                </span>
              </label>

              <Link to="/forgot-password" className="text-[#c9932e] text-sm font-black hover:text-[#a5791f] transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button type="submit" disabled={loading} className={`w-full py-4 mt-2 rounded-xl bg-[#12151c] text-white font-black text-sm tracking-widest uppercase shadow-[0_10px_20px_-10px_rgba(18,21,28,0.5)] hover:shadow-[0_10px_30px_-10px_rgba(18,21,28,0.65)] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-1 active:scale-95'}`}>
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#e8b74e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  AUTHENTICATING...
                </>
              ) : (
                <>ACCESS DASHBOARD <ArrowRight size={18} strokeWidth={3} className="text-[#e8b74e]" /></>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;