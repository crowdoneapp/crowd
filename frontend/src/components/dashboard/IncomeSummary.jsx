import React from "react";
import { 
  UserPlus, Network, TrendingUp, Users
} from "lucide-react";

const IncomeSummary = ({ income = {}, user = {} }) => {
  // 1. Direct Earning
  const directIncome = Number(income.totalDirectIncome) || Number(user.totalDirectIncome) || Number(user.directIncome) || 0;
  
  // 2. Level Earning
  const levelIncome = Number(income.totalLevelIncome) || Number(user.totalLevelIncome) || Number(user.levelIncome) || 0;
  
  // 3. Daily Trade Income (4% ROI)
  const roiIncome = Number(income.totalRoiIncome) || Number(user.totalRoiIncome) || Number(user.roiIncome) || 0;

  // 4. Team Compounding Income (Daily Level Income / Matching)
  const matchingRoiIncome = Number(income.totalMatchingRoiIncome) || Number(user.totalMatchingRoiIncome) || Number(user.matchingRoiIncome) || 0;

  // 🔥 CLEAN EARNINGS LIST (Naye 30-day / 4% system ke hisaab se)
  const rawEarningsList = [
    { label: "Daily Trade Income (4%)", value: roiIncome, icon: TrendingUp, accent: "#10b981" }, // Emerald
    { label: "Team Compounding", value: matchingRoiIncome, icon: Users, accent: "#8b5cf6" }, // Violet
    { label: "Direct Earning", value: directIncome, icon: UserPlus, accent: "#2563eb" }, // Blue
    { label: "Level Earning", value: levelIncome, icon: Network, accent: "#c026d3" } // Fuchsia
  ];

  // Numbering dynamically assign (01, 02, 03, 04)
  const earningsList = rawEarningsList.map((item, index) => ({
    ...item,
    num: String(index + 1).padStart(2, '0')
  }));

  // Combined Total
  const totalOfAll = earningsList.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full mb-6">

      {/* Header — passbook style */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#0b1c3c] tracking-tight">
            Earnings
          </h2>
        </div>
        <p className="text-slate-400 text-[10px] sm:text-xs font-mono font-bold hidden sm:block">
          {earningsList.length} categories
        </p>
      </div>

      {/* Single-column ledger */}
      <div className="bg-white rounded-[18px] border border-slate-100 shadow-[0_4px_24px_-12px_rgba(15,27,51,0.08)] overflow-hidden divide-y divide-slate-100">
        {earningsList.map((item, index) => (
          <div
            key={index}
            className="relative flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 group hover:bg-slate-50/60 transition-colors duration-300"
          >
            {/* Accent rail */}
            <span
              className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ backgroundColor: item.accent }}
            ></span>

            {/* Number tag */}
            <span className="text-slate-300 font-mono font-bold text-sm sm:text-base mr-1 sm:mr-2">
              {item.num}
            </span>

            {/* Icon */}
            <div
              className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${item.accent}0d`, borderColor: `${item.accent}33`, color: item.accent }}
            >
              <item.icon size={16} strokeWidth={2.5} />
            </div>

            {/* Label */}
            <h3 className="flex-1 font-bold text-slate-700 text-[11px] sm:text-sm md:text-[15px] uppercase tracking-wide leading-snug group-hover:text-[#0b1c3c] transition-colors">
              {item.label}
            </h3>

            {/* Value */}
            <p
              className="shrink-0 font-black text-base sm:text-lg md:text-xl font-mono tracking-tight text-right"
              style={{ color: item.accent }}
            >
              ${item.value.toFixed(2)}
            </p>
          </div>
        ))}

        {/* Ledger total footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0b1c3c]">
          <span className="text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em]">
            Combined Total
          </span>
          <span className="text-white font-black text-base sm:text-lg md:text-xl font-mono tracking-tight">
            ${totalOfAll.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IncomeSummary;