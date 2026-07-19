import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate, useLocation, Link } from "react-router-dom"; 
import { 
  Home, Wallet, Banknote, History, Users, UserCircle2, 
  HelpCircle, BadgeDollarSign, BarChart, Globe, Zap, 
  FileQuestion, Coins, Layers, ArrowRightLeft, ShieldCheck, 
  Network, PieChart, LayoutDashboard, Send, ChevronDown
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Nested Item Component (Sub-menu items)
const SidebarItem = ({ label, icon: Icon, active, onClick, badge, path }) => {
  const content = (
    <>
      <div className={`p-1 rounded-md transition-colors duration-300 ${active ? "text-white bg-white/20" : "text-slate-400 group-hover:text-blue-600"}`}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <span className="font-bold tracking-wide whitespace-nowrap">{label}</span>
      
      {badge > 0 && (
        <span className="absolute top-1/2 -translate-y-1/2 right-3 bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">
          {badge}
        </span>
      )}
    </>
  );

  // Active state styling for nested items
  const className = `relative flex items-center gap-3 pl-11 pr-3 py-2.5 cursor-pointer rounded-xl font-medium text-[13px] transition-all duration-300 group ${
    active 
      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] transform scale-[1.02]" 
      : "text-slate-500 hover:text-blue-700 hover:bg-blue-50/50"
  }`;

  if (path && path !== "#") {
    return <Link to={path} onClick={onClick} className={className}>{content}</Link>;
  }
  return <div onClick={onClick} className={className}>{content}</div>;
};

const Sidebar = ({ user, isOpen, setIsOpen }) => { 
  const location = useLocation();
  const [notifCount, setNotifCount] = useState(0);
  const { logout } = useAuth();
  
  // State to track which dropdowns are open
  const [openGroups, setOpenGroups] = useState({});

  // 🔥 NEO-BANKING: Menus Grouped with Parent Icons
  const menuGroups = [
    {
      title: "Main Menu",
      icon: LayoutDashboard,
      items: [
        { label: "Dashboard", icon: Home, path: "/dashboard" },
        { label: "My Profile", icon: UserCircle2, path: "/profile" },
       ]
    },
    {
      title: "My Network",
      icon: Users,
      items: [
        { label: "Direct Team", icon: UserCircle2, path: "/direct-team" },
        { label: "All Team", icon: Users, path: "/all-team" },
       ]
    },
    {
      title: "Earnings & Incomes",
      icon: BadgeDollarSign,
      items: [
        { label: "Direct Income", icon: BadgeDollarSign, path: "/direct-income" },
        { label: "Level Income", icon: Layers, path: "/level-income" },
        ]
    },
     
    {
      title: "Financials",
      icon: Wallet,
      items: [
        { label: "Top-Up History", icon: BarChart, path: "/topup-details" },
        { label: "Deposit History", icon: History, path: "/deposit-history" },
        { label: "Withdrawals", icon: Banknote, path: "/withdrawals" },
        { label: "Wallet History", icon: Wallet, path: "/wallet-history" },
        { label: "Income To Wallet", icon: ArrowRightLeft, path: "/credit-to-wallet" },
        { label: "P2P Transfers", icon: Send, path: "/my-transfers" },
        { label: "Transactions", icon: History, path: "/transaction-details" },
      ]
    },
    {
      title: "Help & Support",
      icon: HelpCircle,
      items: [
         { label: "Support Help Center", icon: ShieldCheck, path: "/support" },
      ]
    }
  ];

  // Auto-open the group that contains the current active route
  useEffect(() => {
    const initialOpenState = {};
    menuGroups.forEach((group, index) => {
      const hasActiveItem = group.items.some(item => location.pathname === item.path);
      if (hasActiveItem) {
        initialOpenState[index] = true;
      } else {
        initialOpenState[index] = index === 0; // Default open first menu
      }
    });
    setOpenGroups(initialOpenState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Notifications API
  useEffect(() => {
    const fetchNotifCount = async () => {
      if (!user?.userId) return;
      try {
        const res = await api.get(`/admin/notifications/count/${user.userId}?t=${new Date().getTime()}`);
        setNotifCount(res.data.count || 0);
      } catch (err) {
        console.log("Notification error", err);
      }
    };
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 15000);
    return () => clearInterval(interval);
  }, [user?.userId]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = isOpen ? "hidden" : "auto";
    }
  }, [isOpen]);

  const toggleGroup = (index) => {
    setOpenGroups((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <>
      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] lg:hidden transition-opacity" />
      )}

      <aside className={`fixed top-16 md:top-20 left-0 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] z-[60] bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"}`}>
        
        <div className="w-64 h-full overflow-y-auto custom-scroll pb-24">
          <nav className="px-3 py-6 space-y-2">
            <style>{`
              .custom-scroll::-webkit-scrollbar { width: 4px; }
              .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
              .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
            
            {/* Loop through Accordion Groups */}
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-1">
                
                {/* Accordion Dropdown Header */}
                <button
                  onClick={() => toggleGroup(groupIndex)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 ${
                    openGroups[groupIndex]
                      ? "bg-slate-50 shadow-sm"
                      : "bg-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${openGroups[groupIndex] ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                      <group.icon size={16} strokeWidth={2.5} />
                    </div>
                    <span className={`text-sm font-bold tracking-wide ${openGroups[groupIndex] ? "text-[#0b1c3c]" : "text-slate-600"}`}>
                      {group.title}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    strokeWidth={2.5}
                    className={`transition-transform duration-300 ${openGroups[groupIndex] ? "rotate-180 text-blue-600" : "text-slate-400"}`}
                  />
                </button>

                {/* Expanded Menu Items */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openGroups[groupIndex] ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-1 relative before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {group.items.map((item, index) => (
                      <SidebarItem
                        key={index} 
                        label={item.label} 
                        icon={item.icon} 
                        badge={item.badge} 
                        path={item.path} 
                        active={location.pathname === item.path}
                        onClick={() => {
                          if (item.onClick) item.onClick();
                          if (window.innerWidth < 1024) setIsOpen(false); 
                        }}
                      />
                    ))}
                  </div>
                </div>

              </div>
            ))}

          </nav>
        </div>
        
      </aside>
    </>
  );
};

export default Sidebar;
