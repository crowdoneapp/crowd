import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Select from 'react-select';
import Confetti from 'react-confetti';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import {
  User, Users, Mail, Phone,
  CheckCircle2, XCircle, ArrowRight, Copy, Globe, Hexagon, Home,
  Calendar, Clock, ShieldCheck, KeyRound, UserPlus
} from 'lucide-react';

// Reusable field wrapper — bordered icon box + input, matches reference image style
// 🔥 IMPORTANT: defined OUTSIDE Register() so it doesn't remount on every keystroke
const FieldShell = ({ icon: Icon, children, focusRing = true, className = '' }) => (
  <div className={`flex items-stretch bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-cyan-400/60 ${focusRing ? 'focus-within:ring-4 focus-within:ring-cyan-400/10' : ''} transition-all ${className}`}>
    <div className="flex items-center justify-center w-12 shrink-0 border-r border-white/10 text-slate-400">
      <Icon size={17} strokeWidth={2.2} />
    </div>
    {children}
  </div>
);

function Register() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');

  const [sponsorId, setSponsorId] = useState('');
  const [sponsorName, setSponsorName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 ANTI-BOT: honeypot field (must stay empty) + form-load timestamp
  const [hp, setHp] = useState('');
  const formLoadTime = useRef(Date.now());

  const navigate = useNavigate();
  const location = useLocation();

  // Referral from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setSponsorId(ref);
      fetchSponsorName(ref);
    }
  }, [location]);

  // Sponsor Name Fetch
  const fetchSponsorName = async (id) => {
    if (id.length < 3) {
      setSponsorName('');
      return;
    }
    try {
      const res = await api.get(`/user/sponsor-name/${id}?t=${new Date().getTime()}`);
      setSponsorName(res.data.name);
    } catch {
      setSponsorName('Invalid Sponsor');
    }
  };

  // MOBILE FIX: 15 digits tak allow karega type karna
  const handleMobileChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/^0+/, '');
    if (value.length > 15) value = value.slice(0, 15);
    setMobile(value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 🔥 ANTI-BOT CHECK 1: Honeypot field — real users never fill this (it's hidden)
    if (hp) {
      setErrorMsg('Registration failed. Please try again.');
      return;
    }

    // 🔥 ANTI-BOT CHECK 2: Too-fast submission = bot (humans need at least ~2.5s to fill the form)
    const elapsed = Date.now() - formLoadTime.current;
    if (elapsed < 2500) {
      setErrorMsg('Please take a moment to fill the form before submitting.');
      return;
    }

    // 🔥 SECURITY: Trim extra spaces
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMobile = mobile.trim();

    if (!cleanName || !cleanMobile || !cleanEmail || !country) {
      setErrorMsg('All fields are required.');
      return;
    }

    // 1. FRONTEND NAME VALIDATION
    const nameRegex = /^[A-Za-z\s]{3,50}$/;
    if (!nameRegex.test(cleanName)) {
      setErrorMsg('Invalid Name. Only alphabets are allowed (No symbols or numbers).');
      return;
    }

    // 2. FRONTEND EMAIL VALIDATION
    if (!cleanEmail.toLowerCase().endsWith('@gmail.com')) {
      setErrorMsg('Only @gmail.com emails are accepted.');
      return;
    }

    // 3. FRONTEND MOBILE VALIDATION
    if (country === 'India' && cleanMobile.length !== 10) {
      setErrorMsg('Mobile number must be exactly 10 digits for India.');
      return;
    } else if (cleanMobile.length < 10 || cleanMobile.length > 15) {
      setErrorMsg('Mobile number must be between 10 to 15 digits.');
      return;
    }

    setLoading(true);

    try {
      const fpPromise = FingerprintJS.load();
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;

      const response = await api.post('/auth/register', {
        name: cleanName,
        mobile: cleanMobile,
        email: cleanEmail,
        country,
        sponsorId,
        deviceId: visitorId,
        // anti-bot payload
        hp,
        formLoadedAt: formLoadTime.current,
      });

      setRegisteredData({
        userId: response.data.userId,
        password: response.data.password,
        name: response.data.name || cleanName,
        registeredAt: new Date(),
      });

      setShowPopup(true);
      setShowConfetti(true);
      setLoading(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
      setLoading(false);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setShowConfetti(false);
    navigate('/login');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const countryOptions = [
    { value: 'Afghanistan', label: 'Afghanistan (+93)' },
    { value: 'Albania', label: 'Albania (+355)' },
    { value: 'Algeria', label: 'Algeria (+213)' },
    { value: 'Andorra', label: 'Andorra (+376)' },
    { value: 'Angola', label: 'Angola (+244)' },
    { value: 'Argentina', label: 'Argentina (+54)' },
    { value: 'Armenia', label: 'Armenia (+374)' },
    { value: 'Australia', label: 'Australia (+61)' },
    { value: 'Austria', label: 'Austria (+43)' },
    { value: 'Azerbaijan', label: 'Azerbaijan (+994)' },
    { value: 'Bahrain', label: 'Bahrain (+973)' },
    { value: 'Bangladesh', label: 'Bangladesh (+880)' },
    { value: 'Belarus', label: 'Belarus (+375)' },
    { value: 'Belgium', label: 'Belgium (+32)' },
    { value: 'Bolivia', label: 'Bolivia (+591)' },
    { value: 'Bosnia and Herzegovina', label: 'Bosnia & Herzegovina (+387)' },
    { value: 'Botswana', label: 'Botswana (+267)' },
    { value: 'Brazil', label: 'Brazil (+55)' },
    { value: 'Brunei', label: 'Brunei (+673)' },
    { value: 'Bulgaria', label: 'Bulgaria (+359)' },
    { value: 'Burkina Faso', label: 'Burkina Faso (+226)' },
    { value: 'Burundi', label: 'Burundi (+257)' },
    { value: 'Cambodia', label: 'Cambodia (+855)' },
    { value: 'Cameroon', label: 'Cameroon (+237)' },
    { value: 'Canada', label: 'Canada (+1)' },
    { value: 'Cape Verde', label: 'Cape Verde (+238)' },
    { value: 'Central African Republic', label: 'Central African Republic (+236)' },
    { value: 'Chad', label: 'Chad (+235)' },
    { value: 'Chile', label: 'Chile (+56)' },
    { value: 'China', label: 'China (+86)' },
    { value: 'Colombia', label: 'Colombia (+57)' },
    { value: 'Comoros', label: 'Comoros (+269)' },
    { value: 'Costa Rica', label: 'Costa Rica (+506)' },
    { value: 'Croatia', label: 'Croatia (+385)' },
    { value: 'Cuba', label: 'Cuba (+53)' },
    { value: 'Cyprus', label: 'Cyprus (+357)' },
    { value: 'Czechia', label: 'Czechia (+420)' },
    { value: 'Denmark', label: 'Denmark (+45)' },
    { value: 'Djibouti', label: 'Djibouti (+253)' },
    { value: 'Dominica', label: 'Dominica (+1767)' },
    { value: 'Dominican Republic', label: 'Dominican Republic (+1)' },
    { value: 'Ecuador', label: 'Ecuador (+593)' },
    { value: 'Egypt', label: 'Egypt (+20)' },
    { value: 'El Salvador', label: 'El Salvador (+503)' },
    { value: 'Equatorial Guinea', label: 'Equatorial Guinea (+240)' },
    { value: 'Eritrea', label: 'Eritrea (+291)' },
    { value: 'Estonia', label: 'Estonia (+372)' },
    { value: 'Ethiopia', label: 'Ethiopia (+251)' },
    { value: 'Fiji', label: 'Fiji (+679)' },
    { value: 'Finland', label: 'Finland (+358)' },
    { value: 'France', label: 'France (+33)' },
    { value: 'Gabon', label: 'Gabon (+241)' },
    { value: 'Gambia', label: 'Gambia (+220)' },
    { value: 'Georgia', label: 'Georgia (+995)' },
    { value: 'Germany', label: 'Germany (+49)' },
    { value: 'Ghana', label: 'Ghana (+233)' },
    { value: 'Greece', label: 'Greece (+30)' },
    { value: 'Guatemala', label: 'Guatemala (+502)' },
    { value: 'Guinea', label: 'Guinea (+224)' },
    { value: 'Haiti', label: 'Haiti (+509)' },
    { value: 'Honduras', label: 'Honduras (+504)' },
    { value: 'Hungary', label: 'Hungary (+36)' },
    { value: 'Iceland', label: 'Iceland (+354)' },
    { value: 'India', label: 'India (+91)' },
    { value: 'Indonesia', label: 'Indonesia (+62)' },
    { value: 'Iran', label: 'Iran (+98)' },
    { value: 'Iraq', label: 'Iraq (+964)' },
    { value: 'Ireland', label: 'Ireland (+353)' },
    { value: 'Israel', label: 'Israel (+972)' },
    { value: 'Italy', label: 'Italy (+39)' },
    { value: 'Jamaica', label: 'Jamaica (+1876)' },
    { value: 'Japan', label: 'Japan (+81)' },
    { value: 'Jordan', label: 'Jordan (+962)' },
    { value: 'Kazakhstan', label: 'Kazakhstan (+7)' },
    { value: 'Kenya', label: 'Kenya (+254)' },
    { value: 'Kiribati', label: 'Kiribati (+686)' },
    { value: 'Kuwait', label: 'Kuwait (+965)' },
    { value: 'Kyrgyzstan', label: 'Kyrgyzstan (+996)' },
    { value: 'Laos', label: 'Laos (+856)' },
    { value: 'Latvia', label: 'Latvia (+371)' },
    { value: 'Lebanon', label: 'Lebanon (+961)' },
    { value: 'Lesotho', label: 'Lesotho (+266)' },
    { value: 'Liberia', label: 'Liberia (+231)' },
    { value: 'Libya', label: 'Libya (+218)' },
    { value: 'Lithuania', label: 'Lithuania (+370)' },
    { value: 'Luxembourg', label: 'Luxembourg (+352)' },
    { value: 'Madagascar', label: 'Madagascar (+261)' },
    { value: 'Malawi', label: 'Malawi (+265)' },
    { value: 'Malaysia', label: 'Malaysia (+60)' },
    { value: 'Maldives', label: 'Maldives (+960)' },
    { value: 'Mali', label: 'Mali (+223)' },
    { value: 'Malta', label: 'Malta (+356)' },
    { value: 'Marshall Islands', label: 'Marshall Islands (+692)' },
    { value: 'Mauritania', label: 'Mauritania (+222)' },
    { value: 'Mauritius', label: 'Mauritius (+230)' },
    { value: 'Mexico', label: 'Mexico (+52)' },
    { value: 'Micronesia', label: 'Micronesia (+691)' },
    { value: 'Moldova', label: 'Moldova (+373)' },
    { value: 'Mongolia', label: 'Mongolia (+976)' },
    { value: 'Montenegro', label: 'Montenegro (+382)' },
    { value: 'Morocco', label: 'Morocco (+212)' },
    { value: 'Mozambique', label: 'Mozambique (+258)' },
    { value: 'Myanmar', label: 'Myanmar (+95)' },
    { value: 'Namibia', label: 'Namibia (+264)' },
    { value: 'Nauru', label: 'Nauru (+674)' },
    { value: 'Nepal', label: 'Nepal (+977)' },
    { value: 'Netherlands', label: 'Netherlands (+31)' },
    { value: 'New Zealand', label: 'New Zealand (+64)' },
    { value: 'Nicaragua', label: 'Nicaragua (+505)' },
    { value: 'Niger', label: 'Niger (+227)' },
    { value: 'Nigeria', label: 'Nigeria (+234)' },
    { value: 'North Macedonia', label: 'North Macedonia (+389)' },
    { value: 'Norway', label: 'Norway (+47)' },
    { value: 'Oman', label: 'Oman (+968)' },
    { value: 'Pakistan', label: 'Pakistan (+92)' },
    { value: 'Palau', label: 'Palau (+680)' },
    { value: 'Panama', label: 'Panama (+507)' },
    { value: 'Papua New Guinea', label: 'Papua New Guinea (+675)' },
    { value: 'Paraguay', label: 'Paraguay (+595)' },
    { value: 'Peru', label: 'Peru (+51)' },
    { value: 'Philippines', label: 'Philippines (+63)' },
    { value: 'Poland', label: 'Poland (+48)' },
    { value: 'Portugal', label: 'Portugal (+351)' },
    { value: 'Qatar', label: 'Qatar (+974)' },
    { value: 'Romania', label: 'Romania (+40)' },
    { value: 'Russia', label: 'Russia (+7)' },
    { value: 'Rwanda', label: 'Rwanda (+250)' },
    { value: 'Samoa', label: 'Samoa (+685)' },
    { value: 'San Marino', label: 'San Marino (+378)' },
    { value: 'Saudi Arabia', label: 'Saudi Arabia (+966)' },
    { value: 'Senegal', label: 'Senegal (+221)' },
    { value: 'Serbia', label: 'Serbia (+381)' },
    { value: 'Seychelles', label: 'Seychelles (+248)' },
    { value: 'Sierra Leone', label: 'Sierra Leone (+232)' },
    { value: 'Singapore', label: 'Singapore (+65)' },
    { value: 'Slovakia', label: 'Slovakia (+421)' },
    { value: 'Slovenia', label: 'Slovenia (+386)' },
    { value: 'Solomon Islands', label: 'Solomon Islands (+677)' },
    { value: 'Somalia', label: 'Somalia (+252)' },
    { value: 'South Africa', label: 'South Africa (+27)' },
    { value: 'South Korea', label: 'South Korea (+82)' },
    { value: 'Spain', label: 'Spain (+34)' },
    { value: 'Sri Lanka', label: 'Sri Lanka (+94)' },
    { value: 'Sudan', label: 'Sudan (+249)' },
    { value: 'Suriname', label: 'Suriname (+597)' },
    { value: 'Sweden', label: 'Sweden (+46)' },
    { value: 'Switzerland', label: 'Switzerland (+41)' },
    { value: 'Syria', label: 'Syria (+963)' },
    { value: 'Tajikistan', label: 'Tajikistan (+992)' },
    { value: 'Tanzania', label: 'Tanzania (+255)' },
    { value: 'Thailand', label: 'Thailand (+66)' },
    { value: 'Timor-Leste', label: 'Timor-Leste (+670)' },
    { value: 'Togo', label: 'Togo (+228)' },
    { value: 'Tonga', label: 'Tonga (+676)' },
    { value: 'Trinidad and Tobago', label: 'Trinidad & Tobago (+1868)' },
    { value: 'Tunisia', label: 'Tunisia (+216)' },
    { value: 'Turkiye', label: 'Türkiye (+90)' },
    { value: 'Turkmenistan', label: 'Turkmenistan (+993)' },
    { value: 'Tuvalu', label: 'Tuvalu (+688)' },
    { value: 'Uganda', label: 'Uganda (+256)' },
    { value: 'Ukraine', label: 'Ukraine (+380)' },
    { value: 'United Arab Emirates', label: 'United Arab Emirates (+971)' },
    { value: 'United Kingdom', label: 'United Kingdom (+44)' },
    { value: 'United States', label: 'United States (+1)' },
    { value: 'Uruguay', label: 'Uruguay (+598)' },
    { value: 'Uzbekistan', label: 'Uzbekistan (+998)' },
    { value: 'Vanuatu', label: 'Vanuatu (+678)' },
    { value: 'Vatican City', label: 'Vatican City (+379)' },
    { value: 'Vietnam', label: 'Vietnam (+84)' },
    { value: 'Yemen', label: 'Yemen (+967)' },
    { value: 'Zambia', label: 'Zambia (+260)' },
    { value: 'Zimbabwe', label: 'Zimbabwe (+263)' }
  ];

  // Dark-glass Custom Select Styles — icon-box style to match the new field design
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      background: 'transparent',
      border: 'none',
      borderRadius: 0,
      color: '#ffffff',
      minHeight: '50px',
      boxShadow: 'none',
      paddingLeft: '2px',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({ ...base, color: '#ffffff', fontWeight: 'bold' }),
    input: (base) => ({ ...base, color: '#ffffff' }),
    menu: (base) => ({ ...base, background: '#141a2b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? 'rgba(34,211,238,0.1)' : 'transparent',
      color: state.isFocused ? '#22d3ee' : '#cbd5e1',
      cursor: 'pointer',
      padding: '12px 18px',
      fontWeight: 'bold'
    }),
    placeholder: (base) => ({ ...base, color: '#64748b', fontWeight: 'bold' }),
    indicatorSeparator: () => ({ display: 'none' }),
  };

  const certDate = registeredData?.registeredAt
    ? registeredData.registeredAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  const certTime = registeredData?.registeredAt
    ? registeredData.registeredAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center px-4 py-8 sm:py-10 relative overflow-hidden font-sans selection:bg-cyan-400/30 selection:text-white">

      {/* ===== AURORA MESH BACKGROUND ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-violet-600/25 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[5%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] bg-cyan-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] max-w-[350px] max-h-[350px] bg-fuchsia-500/10 blur-[100px] rounded-full"></div>
      </div>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      ></div>

      {/* ===== TOP BAR ===== */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between mb-6 sm:mb-8">
        <Link to="/" className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity">
          <div className="bg-gradient-to-br from-cyan-400 to-violet-500 p-1.5 rounded-lg shadow-[0_4px_15px_rgba(34,211,238,0.35)]">
            <Hexagon size={16} color="#0a0e1a" fill="#0a0e1a" />
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            CROWD<span className="text-cyan-400">ONE</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
          >
            <Home size={14} /> Home
          </Link>
          <Link
            to="/login"
            className="text-xs font-black text-cyan-300 bg-cyan-400/10 border border-cyan-400/30 hover:bg-cyan-400/20 px-3 py-2 rounded-lg transition-colors"
          >
            Login
          </Link>
        </div>
      </div>

      {/* ===== CENTERED CARD — matches reference image ===== */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

        {/* Header icon: outline box with person+ icon, like reference */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-16 h-16 rounded-2xl border-2 border-cyan-400/60 bg-cyan-400/5 flex items-center justify-center shadow-[0_0_25px_-5px_rgba(34,211,238,0.4)] mb-4">
            <UserPlus size={28} className="text-cyan-400" strokeWidth={2} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-center">
            CREATE <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">ACCOUNT</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Join us and start your journey</p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[24px] py-7 px-6 sm:px-8 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)]">

          {errorMsg && (
            <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              <XCircle size={16} className="flex-shrink-0" />
              <span className="break-words">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">

            {/* 🔥 HONEYPOT FIELD — invisible to humans, bots fill it automatically */}
            <input
              type="text"
              name="website"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              autoComplete="off"
              tabIndex="-1"
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
              aria-hidden="true"
            />

            {/* Full Name — person+ icon as requested */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Full Name</label>
              <FieldShell icon={UserPlus}>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                  className="w-full bg-transparent px-4 py-3.5 text-white font-bold placeholder-slate-500 outline-none"
                />
              </FieldShell>
            </div>

            {/* Referral Sponsor */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Referral Sponsor</label>
              <FieldShell icon={Users} focusRing={false} className={sponsorName === 'Invalid Sponsor' ? 'border-rose-400/60' : (sponsorName && sponsorId) ? 'border-cyan-400/60' : ''}>
                <input
                  type="text"
                  value={sponsorId}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setSponsorId(val);
                    fetchSponsorName(val);
                  }}
                  className="w-full bg-transparent pl-4 pr-2 py-3.5 text-white font-mono font-bold tracking-wide placeholder-slate-500 outline-none"
                  placeholder="Enter Sponsor ID"
                />
                <div className="flex items-center pr-4">
                  {sponsorName === 'Invalid Sponsor' && <XCircle className="text-rose-400" size={18} />}
                  {sponsorName && sponsorName !== 'Invalid Sponsor' && <CheckCircle2 className="text-cyan-400" size={18} />}
                </div>
              </FieldShell>
              <div className="h-4 mt-1.5 ml-1">
                {sponsorName && (
                  <p className={`text-[10px] font-black tracking-wide uppercase truncate ${sponsorName === 'Invalid Sponsor' ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {sponsorName === 'Invalid Sponsor' ? 'Sponsor not found' : `VERIFIED: ${sponsorName}`}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Email Address</label>
              <FieldShell icon={Mail}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent px-4 py-3.5 text-white font-bold placeholder-slate-500 outline-none"
                />
              </FieldShell>
            </div>

            {/* Country */}
            <div className="relative z-30">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Country</label>
              <FieldShell icon={Globe} focusRing={false}>
                <div className="flex-1">
                  <Select
                    options={countryOptions}
                    onChange={s => setCountry(s.value)}
                    styles={customSelectStyles}
                    placeholder="Select Country"
                    isSearchable={false}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    menuPosition="fixed"
                  />
                </div>
              </FieldShell>
            </div>

            {/* Mobile */}
            <div className="relative z-20">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Mobile Number</label>
              <FieldShell icon={Phone}>
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={handleMobileChange}
                  className="w-full bg-transparent px-4 py-3.5 text-white font-bold font-mono placeholder-slate-500 outline-none"
                />
              </FieldShell>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-[#0a0e1a] font-black text-sm tracking-widest uppercase shadow-[0_10px_30px_-8px_rgba(34,211,238,0.5)] hover:shadow-[0_10px_35px_-8px_rgba(34,211,238,0.7)] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5 active:scale-95'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#0a0e1a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  PROCESSING...
                </>
              ) : (
                <>CREATE ACCOUNT <ArrowRight size={18} strokeWidth={3} /></>
              )}
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <span>Already have an account?</span>
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Login here
          </Link>
        </div>
      </div>

      {/* ===== SUCCESS MODAL — Compact certificate style ===== */}
      {showPopup && registeredData && (
        <div className="fixed inset-0 z-[9999] bg-[#020617]/90 backdrop-blur-md flex justify-center items-center p-4">
 
          <div className="animate-in zoom-in-95 duration-300 relative overflow-hidden bg-gradient-to-b from-[#0b1330] to-[#060a18] border-2 border-cyan-500/30 rounded-[22px] w-full max-w-sm max-h-[90vh] overflow-y-auto p-5 sm:p-6 text-center shadow-[0_0_60px_-10px_rgba(34,211,238,0.35)]">

            {/* Glowing Background Orbs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/20 blur-[50px] rounded-full pointer-events-none"></div>

            {/* Shield badge top-right */}
            <div className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_4px_15px_rgba(34,211,238,0.4)] z-10">
              <ShieldCheck size={17} className="text-white" strokeWidth={2.5} />
            </div>

            {/* Logo */}
            <div className="flex flex-col items-center relative z-10">
              <div className="bg-gradient-to-br from-cyan-400 to-violet-500 w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_6px_20px_-6px_rgba(34,211,238,0.5)] mb-1.5">
                <Hexagon size={18} color="#0a0e1a" fill="#0a0e1a" />
              </div>
              <span className="text-sm font-black text-white tracking-tight">
                CROWD<span className="text-cyan-400">ONE</span>
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg font-black text-white mt-3 tracking-tight leading-none">
              REGISTRATION
            </h2>
            <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-400 mb-2.5 tracking-tight leading-tight">
              CERTIFICATE
            </h2>

          <p className="text-slate-400 text-[11px] font-medium">This is to certify that</p>

<div className="flex items-center justify-center my-3 gap-3">
  {/* Left Decorative Line */}
  <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/50"></div>
  
  <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent tracking-tight truncate px-2">
    {registeredData.name}
  </p>

  {/* Right Decorative Line */}
  <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/50"></div>
</div>

<p className="text-slate-400 mb-2 text-[11px] font-medium leading-relaxed px-2">
  has successfully joined <span className="text-cyan-400 font-bold">CrowdOne</span> World.
</p>

            {/* Details Box */}
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl mb-4 text-left relative z-10 shadow-inner space-y-2.5">

              {/* User ID */}
              <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <User size={12} className="text-cyan-400" /> User ID
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-400 font-black text-sm font-mono">
                    {registeredData.userId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(registeredData.userId)}
                    className="text-slate-400 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 p-1 rounded-md transition-all active:scale-95"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <KeyRound size={12} className="text-cyan-400" /> Password
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-xs truncate max-w-[90px]">
                    {registeredData.password}
                  </span>
                  <button
                    onClick={() => copyToClipboard(registeredData.password)}
                    className="text-slate-400 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 p-1 rounded-md transition-all flex-shrink-0 active:scale-95"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              {/* Date + Time combined row */}
              <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <Calendar size={12} className="text-cyan-400" /> Date
                </span>
                <span className="text-white font-bold text-xs">{certDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <Clock size={12} className="text-cyan-400" /> Time
                </span>
                <span className="text-white font-bold text-xs">{certTime}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handlePopupClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-black text-xs tracking-widest uppercase hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all relative z-10 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-700 ease-out skew-x-12"></div>
              Proceed to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;