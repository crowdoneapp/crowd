import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, 
  Globe2, ChevronRight, Activity,
  Users, DollarSign,
  Gift, Target, Crown, Calendar, ChevronDown,Rocket ,Hexagon , User, Wallet, UserPlus, Building2, MapPin, HeartHandshake, Eye, RefreshCw, BarChart3
} from 'lucide-react';

// --- PREMIUM SVG ICONS FOR WALLETS ---
const MetamaskIcon = () => (
  <svg viewBox="0 0 318.6 318.6" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm transition-transform group-hover:scale-110 duration-300">
    <path fill="#E2761B" d="M274.1 35.5L174.6 109.4 193 65.8zM44.5 35.5L144 109.4 125.6 65.8z"/>
    <path fill="#E4761B" d="M238.3 206.8L211.8 247.4 268.5 263 284.8 207.7zM80.3 206.8L106.8 247.4 50.1 263 33.8 207.7z"/>
    <path fill="#D7C1B3" d="M268.5 263.1L211.8 247.4 227.4 286.3zM50.1 263.1L106.8 247.4 91.2 286.3z"/>
    <path fill="#233447" d="M138.8 193.5L110.6 185.2 130.5 233.1 143.6 270.8 159.3 286.3 175 270.8 188.1 233.1 208 185.2 179.8 193.5 159.3 213.2z"/>
    <path fill="#CD6116" d="M106.8 247.4L143.6 270.8 130.5 233.1zM211.8 247.4L175 270.8 188.1 233.1z"/>
    <path fill="#E4751F" d="M188.1 233.1L175 270.8 159.3 286.3 143.6 270.8 130.5 233.1 110.6 185.2 106.8 247.4 159.3 263.1 211.8 247.4 208 185.2z"/>
    <path fill="#F6851B" d="M211.8 247.4L268.5 263.1 238.3 206.8 208 185.2zM106.8 247.4L50.1 263.1 80.3 206.8 110.6 185.2z"/>
    <path fill="#C0AD9E" d="M268.5 263.1L284.8 207.7 301.6 256.1zM50.1 263.1L33.8 207.7 17 256.1z"/>
    <path fill="#161616" d="M208 185.2L238.3 206.8 242.3 176.4 191.9 160.7zM110.6 185.2L80.3 206.8 76.3 176.4 126.7 160.7z"/>
    <path fill="#763D16" d="M242.3 176.4L284.8 207.7 265 152 208.3 141.5zM76.3 176.4L33.8 207.7 53.6 152 110.3 141.5z"/>
    <path fill="#F6851B" d="M265 152L284.8 207.7 318.6 117.9 274.1 35.5 174.6 109.4 208.3 141.5zM53.6 152L33.8 207.7 0 117.9 44.5 35.5 144 109.4 110.3 141.5z"/>
    <path fill="#F6851B" d="M159.3 213.2L179.8 193.5 191.9 160.7 159.3 169.5 126.7 160.7 138.8 193.5z"/>
    <path fill="#E4761B" d="M159.3 286.3L159.3 263.1 106.8 247.4 110.6 185.2 126.7 160.7 159.3 169.5 191.9 160.7 208 185.2 211.8 247.4z"/>
  </svg>
);

const TrustWalletIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm transition-transform group-hover:scale-110 duration-300">
    <path fill="#3375BB" d="M49.9 2C49.9 2 27.6 10.4 10 14.1v31.7c0 28.5 39.9 52.2 39.9 52.2s39.9-23.7 39.9-52.2V14.1C72.2 10.4 49.9 2 49.9 2z"/>
    <path fill="#FFFFFF" d="M49.9 76.5s-23-15.6-23-34.6V24.5c11.1-2.3 23-8.2 23-8.2s11.9 5.9 23 8.2v17.4c0 19-23 34.6-23 34.6z"/>
    <path fill="#3375BB" d="M49.9 66s-15.8-10.7-15.8-23.8V29.5c7.6-1.6 15.8-5.6 15.8-5.6s8.2 4 15.8 5.6v12.7c0 13.1-15.8 23.8-15.8 23.8z"/>
  </svg>
);

const TokenPocketIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm transition-transform group-hover:scale-110 duration-300">
    <rect width="100" height="100" rx="20" fill="#2980B9"/>
    <path fill="#FFFFFF" d="M30 35h40v10H55v30H45V45H30z"/>
    <path fill="#FFFFFF" d="M60 45h15v20H60z" opacity="0.8"/>
  </svg>
);

const SafePalIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm transition-transform group-hover:scale-110 duration-300">
    <rect width="100" height="100" rx="20" fill="#1C1C1E"/>
    <path fill="#FFFFFF" d="M35 65l15 15 25-25-10-10-15 15-5-5 10-10-15-15L15 55z"/>
  </svg>
);


// --- TERMS & CONDITIONS (FAQ) DATA ---
const faqData = [
  { q: "01. Free Registration", a: "Joining on the platform is completely free." },
  { q: "02. Transaction Currency", a: "All donations, earnings and withdrawals are processed in BEP20 USDT only." },
  { q: "03. Donation Packages", a: "Available donation packages are: $30, $100, $300, $500 and $1000." },
  { q: "04. Earnings Policy", a: "All earnings are subject to the rules of the active donation package." },
  { q: "05. Upgrade Bounce Back Income", a: "If a direct member activates a higher package than yours, the Direct and Upgrade Income will go to the nearest upline who has the same package upgraded." },
  { q: "06. Package Upgrade", a: "To receive benefits and income from a higher package, you must upgrade to that package." },
  { q: "07. 24/7 Withdrawal Available", a: "Withdraw your earnings 24 hours a day, 7 days a week." },
  { q: "08. One Account Policy", a: "Each member is allowed to have only one account. Duplicate accounts are not allowed." },
  { q: "09. Rights Reserved", a: "The platform reserves the right to change, modify or update any rule, policy or plan at any time without prior notice." }
];

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-x-hidden relative selection:bg-[#0b1c3c]/20 selection:text-[#0b1c3c]">
      
      {/* --- CUSTOM CSS ANIMATIONS --- */}
      <style>{`
        @keyframes float-coin {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(38, 161, 123, 0.4); }
          70% { box-shadow: 0 0 0 30px rgba(38, 161, 123, 0); }
          100% { box-shadow: 0 0 0 0 rgba(38, 161, 123, 0); }
        }
        .animate-coin { animation: float-coin 6s ease-in-out infinite; }
        .pulse-ring-effect { animation: pulse-ring 3s infinite; }
        
        .bg-grid-neo {
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-neo opacity-40 pointer-events-none z-0"></div>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-500/10 blur-[140px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[140px] rounded-full"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-400 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center no-underline hover:scale-105 transition-transform">
            {/* Real Logo integration (Fallback to text if image not found) */}
            <img 
              src="/logo.jpg" 
              alt="CrowdOne" 
              className="h-8 md:h-10 object-contain drop-shadow-sm" 
              onError={(e) => {
                e.target.onerror = null; 
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="hidden text-xl md:text-2xl font-black tracking-tighter text-[#0b1c3c]">
              CROWD<span className="text-blue-600">ONE</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link to="/login" className="hidden md:block text-slate-600 hover:text-[#0b1c3c] font-black px-4 py-2 transition tracking-wider text-sm">LOGIN</Link>
            <Link to="/register" className="bg-[#0b1c3c] hover:bg-blue-700 text-white font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all transform hover:-translate-y-1 shadow-[0_4px_15px_rgba(11,28,60,0.3)] flex items-center gap-2 text-xs sm:text-sm tracking-widest">
              <span>JOIN NOW</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* --- UNIQUE HERO SECTION --- */}
        <section className="pt-32 sm:pt-40 pb-16 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-6 min-h-[85vh]">
          
          <div className="flex-1 text-center lg:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-6 shadow-sm">
              <Globe2 size={14} className="text-blue-600" /> Welcome To CrowdOne
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight text-[#0b1c3c]">
              Together We Can <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 -webkit-background-clip-text text-transparent bg-clip-text">Change The World.</span>
            </h1>
            
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0 font-medium">
              Join the most transparent peer-to-peer crowdfunding platform. 
              <strong className="text-slate-800"> One Vision. One Community. Limitless Opportunities.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={() => navigate('/register')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm sm:text-base font-black tracking-widest px-8 py-4 sm:py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-[0_10px_30px_rgba(16,185,129,0.3)] w-full sm:w-auto">
                START WITH $30 <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* 3D USDT Coin Hero Graphic */}
          <div className="flex-1 relative flex justify-center items-center mt-10 lg:mt-0 w-full max-w-[320px] sm:max-w-[450px] mx-auto">
              <div className="absolute w-[120%] h-[120%] bg-gradient-to-tr from-emerald-400/20 to-blue-500/20 rounded-full blur-[80px]"></div>
              
              <div className="relative animate-coin">
                 {/* Glowing Base */}
                 <div className="absolute inset-0 bg-emerald-400 rounded-full blur-[20px] opacity-60 pulse-ring-effect"></div>
                 
                 {/* The Coin Body */}
                 <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-[#26a17b] to-[#156e52] relative z-10 flex items-center justify-center shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.3),_10px_20px_30px_rgba(0,0,0,0.4)] border-4 border-[#34d399]/40">
                    
                    {/* Inner Coin Ridge */}
                    <div className="w-[85%] h-[85%] rounded-full border-2 border-emerald-300/50 flex items-center justify-center bg-gradient-to-br from-[#1b8c69] to-[#26a17b] shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)]">
                       
                       {/* Tether Logo (T) */}
                       <svg viewBox="0 0 24 24" className="w-24 h-24 sm:w-32 sm:h-32 text-white drop-shadow-[2px_4px_6px_rgba(0,0,0,0.3)]" fill="currentColor">
                         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.33 8.35h-2.14v6.86h-2.38v-6.86H8.67V8.5h6.66v1.85z"/>
                       </svg>

                    </div>
                 </div>

                 {/* Floating BEP20 Badge */}
                 <div className="absolute -right-6 -bottom-6 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-full flex items-center justify-center p-2">
                       <img src="https://cryptologos.cc/logos/bnb-bnb-logo.svg" alt="BSC" className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase">Network</p>
                      <p className="text-sm sm:text-base font-black text-[#0b1c3c]">BEP20</p>
                    </div>
                 </div>
              </div>
          </div>
        </section>

        {/* --- 4 PILLARS OF CROWDONE (Based on Welcome Flyer) --- */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
             {[
               { icon: <Users />, title: "Stronger Together" },
               { icon: <ShieldCheck />, title: "Trust & Transparency" },
               { icon: <BarChart3 />, title: "Growth & Prosperity" },
               { icon: <Globe2 />, title: "Global Community" }
             ].map((pillar, i) => (
               <div key={i} className="bg-white p-4 sm:p-6 rounded-[20px] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.06)] border border-slate-100 text-center group hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                     {React.cloneElement(pillar.icon, { size: 20 })}
                  </div>
                  <h4 className="text-[11px] sm:text-sm font-black text-[#0b1c3c] uppercase tracking-wide leading-tight">
                    {pillar.title}
                  </h4>
               </div>
             ))}
          </div>
        </div>

        {/* --- MISSION & VISION --- */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-[#0b1c3c]">Our <span className="text-emerald-500">Mission & Vision</span></h2>
            <p className="text-slate-500 text-sm sm:text-lg max-w-2xl mx-auto font-medium">A Crowdfunding Platform Built on Trust, Compassion & Community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Mission */}
            <div className="bg-white p-6 sm:p-10 rounded-[32px] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-50 rounded-full blur-[40px] group-hover:bg-emerald-100 transition-colors duration-500 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
                    <Target size={32} strokeWidth={2.5}/>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-emerald-700 uppercase tracking-tight">Our Mission</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-lg font-medium mb-8">
                  To create a transparent and secure peer-to-peer crowdfunding platform where everyone can come together to help and support each other in times of need and in pursuit of dreams.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><ShieldCheck size={16}/> Trust First</span>
                  <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><HeartHandshake size={16}/> Help Today, Empower Tomorrow</span>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-white p-6 sm:p-10 rounded-[32px] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-[40px] group-hover:bg-blue-100 transition-colors duration-500 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600">
                    <Eye size={32} strokeWidth={2.5}/>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-blue-700 uppercase tracking-tight">Our Vision</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-lg font-medium mb-8">
                  To build a global community of givers and dreamers, empowered by technology, where peer-to-peer help becomes a movement and no one faces challenges alone. Together, we build a better tomorrow.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Globe2 size={16}/> Global Community</span>
                  <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Users size={16}/> Better Tomorrow, Together</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FOUNDER SECTION --- */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0b1c3c] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              
              <div className="w-56 h-56 sm:w-80 sm:h-80 shrink-0 rounded-full border-4 border-amber-400 overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.3)] relative p-2 bg-gradient-to-b from-amber-200 to-amber-600">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#1e293b] flex items-center justify-center">
                   {/* Placeholder for Adrian Tan image to maintain structure */}
                   <User size={100} className="text-slate-500 opacity-50" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black tracking-widest uppercase mb-4 sm:mb-6">
                  <Crown size={16} className="text-amber-400" /> Founder & Visionary
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-3 tracking-tight">Adrian <span className="text-blue-400">Tan</span></h2>
                <p className="text-slate-300 text-sm sm:text-lg font-medium mb-8 leading-relaxed max-w-xl mx-auto md:mx-0">
                  Entrepreneur with a strong vision to build a global digital economy. Leading CrowdOne towards a transparent, secure and financially inclusive future.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                   <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 flex items-start gap-4">
                      <Building2 className="text-amber-400 shrink-0 mt-1" size={24} />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Company</p>
                        <p className="text-base font-black text-white mt-0.5">CrowdOne Sdn. Bhd.</p>
                      </div>
                   </div>
                   <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 flex items-start gap-4">
                      <MapPin className="text-emerald-400 shrink-0 mt-1" size={24} />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Malaysia Based Company</p>
                        <p className="text-base font-black text-white mt-0.5">Kuala Lumpur, Malaysia</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-3 bg-white/10 w-fit mx-auto md:mx-0 px-6 py-3 rounded-xl border border-white/10 text-amber-400 text-sm font-black tracking-widest uppercase">
                   <Calendar size={18} /> Established 2024
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SUPPORTED WALLETS (SVG Integrations) --- */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-b border-slate-200 text-center">
          <div className="max-w-5xl mx-auto">
             <div className="inline-block bg-blue-50 px-6 py-2 rounded-full border border-blue-100 mb-6">
                <span className="text-sm font-black text-blue-800 uppercase tracking-[0.2em]">Supported Wallets</span>
             </div>
             <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-10 sm:mb-14 text-[#0b1c3c]">
               All Transactions in <span className="text-emerald-500">BEP20 USDT</span>
             </h2>

             <div className="flex flex-wrap justify-center items-stretch gap-4 sm:gap-6 md:gap-8">
                
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[24px] flex flex-col items-center gap-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all group min-w-[140px] sm:min-w-[180px]">
                  <MetamaskIcon />
                  <span className="font-black text-slate-800 text-sm sm:text-base uppercase tracking-wider">MetaMask</span>
                </div>
                
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[24px] flex flex-col items-center gap-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all group min-w-[140px] sm:min-w-[180px]">
                  <TokenPocketIcon />
                  <span className="font-black text-slate-800 text-sm sm:text-base uppercase tracking-wider">Token Pocket</span>
                </div>
                
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[24px] flex flex-col items-center gap-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all group min-w-[140px] sm:min-w-[180px]">
                  <TrustWalletIcon />
                  <span className="font-black text-slate-800 text-sm sm:text-base uppercase tracking-wider">Trust Wallet</span>
                </div>
                
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[24px] flex flex-col items-center gap-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all group min-w-[140px] sm:min-w-[180px]">
                  <SafePalIcon />
                  <span className="font-black text-slate-800 text-sm sm:text-base uppercase tracking-wider">SafePal</span>
                </div>

             </div>
          </div>
        </section>

        {/* --- TERMS & CONDITIONS SECTION --- */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-[#0b1c3c]">Terms & <span className="text-blue-600">Conditions</span></h2>
            <p className="text-slate-500 text-sm sm:text-lg font-black tracking-widest uppercase">Please read carefully before participating</p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_4px_15px_-10px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex justify-between items-center focus:outline-none bg-white hover:bg-slate-50 transition-colors"
                >
                  <span className="font-black text-[#0b1c3c] pr-4 text-sm sm:text-base tracking-wide uppercase">{faq.q}</span>
                  <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${openFaq === index ? 'bg-blue-600' : 'bg-slate-100'}`}>
                    <ChevronDown className={`transition-transform duration-300 w-5 h-5 ${openFaq === index ? 'rotate-180 text-white' : 'text-slate-500'}`} strokeWidth={3} />
                  </div>
                </button>
                <div className={`transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-2 border-t border-slate-100">
                    <p className="text-slate-600 text-sm leading-relaxed font-bold whitespace-pre-line">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center bg-[#0b1c3c] text-white py-4 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase shadow-md">
            By participating, you agree to all the above terms and conditions.
          </div>
        </section>

        {/* --- CALL TO ACTION --- */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 relative z-10 bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#0b1c3c] to-blue-800 rounded-[24px] sm:rounded-[40px] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
             <div className="relative z-20">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tight">Start Your Journey Today</h2>
                <p className="text-blue-100 text-sm sm:text-lg md:text-xl font-medium mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                  Join the CrowdOne platform. Grow with the community, unlock all 50 levels, and secure your financial future.
                </p>
                <button onClick={() => navigate('/register')} className="bg-white text-[#0b1c3c] text-sm sm:text-lg font-black px-8 sm:px-12 py-4 sm:py-5 rounded-2xl hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3 mx-auto w-full sm:w-auto">
                  REGISTER FOR FREE <Rocket size={20} className="text-blue-600 sm:w-[24px] sm:h-[24px]" />
                </button>
             </div>
             <div className="absolute top-[-30%] right-[-10%] w-64 h-64 sm:w-[500px] sm:h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
             <div className="absolute bottom-[-30%] left-[-10%] w-64 h-64 sm:w-[500px] sm:h-[500px] bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="py-10 sm:py-16 px-4 sm:px-6 border-t border-slate-200 bg-slate-50 text-center relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-2 mb-4 sm:mb-6">
              <div className="bg-white border border-slate-200 p-2 sm:p-3 rounded-2xl mb-1 sm:mb-2 shadow-sm">
                <Hexagon size={24} className="text-blue-600 sm:w-8 sm:h-8" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">CROWD<span className="text-blue-600">ONE</span></span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed font-medium">
            Empowering People. Creating Opportunities. Building a Better Future.
          </p>
          <div className="w-12 h-1 sm:w-16 sm:h-1.5 bg-slate-300 mx-auto rounded-full mb-5 sm:mb-6"></div>
          <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold">
            &copy; {new Date().getFullYear()} CrowdOne Sdn. Bhd. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;