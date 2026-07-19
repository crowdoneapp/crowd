import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, LogOut } from "lucide-react";

const TopNav = ({ onHamburgerClick }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogoClick = () => {
    navigate("/dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center h-16 md:h-20 relative">
          
          {/* 1. Left Section: Hamburger Icon */}
          <div className="flex-1 flex justify-start">
            <button 
              onClick={onHamburgerClick} 
              className="p-2 -ml-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
            >
              <Menu size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* 2. Center Section: REAL LOGO IMAGE */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center transition-transform hover:scale-105"
            onClick={handleLogoClick}
          >
            {/* 🔥 YAHAN AAPKA NAYA LOGO AAYEGA 🔥 */}
            <img 
              src="/logo.jpg" // Agar aapne png me save kiya hai to "/logo.png" kar dena
              alt="Crowd One Logo" 
              className="h-60 mt-1 md:h-40 object-contain drop-shadow-sm"
            />
          </div>

          {/* 3. Right Section: Logout */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-2 md:px-4 md:py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <LogOut size={18} strokeWidth={2.5} />
              <span className="hidden md:inline font-bold text-xs tracking-widest uppercase">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default TopNav;