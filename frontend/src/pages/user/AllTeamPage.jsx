import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import { Search, ChevronLeft, ChevronRight, Globe2 } from "lucide-react";

const AllTeamPage = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [stats, setStats] = useState({
    totalTeam: 0,
    activeTeam: 0
  });

  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) return;

    const fetchAllTeam = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/user/all-team/${user.userId}?t=${new Date().getTime()}`);

        let teamData = (res.data.team || []).filter((u) => u.level > 0);
        setTeam(teamData);

        setStats({
          totalTeam: teamData.length,
          activeTeam: teamData.filter((u) => u.topUpAmount > 0).length
        });
      } catch (err) {
        console.error("Error fetching all team:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllTeam();
  }, [user?.userId]);

  const sortedAndFilteredTeam = useMemo(() => {
    let filtered = team.filter(
      (u) =>
        u.userId?.toString().includes(search) ||
        u.name?.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (!sortConfig.key) return 0;
      let aValue = a[sortConfig.key] || "";
      let bValue = b[sortConfig.key] || "";

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (sortConfig.key === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [team, search, sortConfig]);

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = sortedAndFilteredTeam.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedAndFilteredTeam.length / entriesPerPage) || 1;

  const handleNext = () => currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const handlePrev = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

  const handleSort = (key) => {
    if (!key) return;
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 🔥 1 2 3 4 5 Number Generator Logic
  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const tableColumns = [
    { label: "Sr.", key: null, center: true },
    { label: "Date", key: "createdAt", right: true },
    { label: "Level", key: "level", center: true },
    { label: "User ID", key: "userId" },
    { label: "Name", key: "name" },
    { label: "Country", key: "country" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500 font-sans">
      
      {/* Light Theme Scrollbar CSS */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[#0b1c3c] uppercase tracking-wide flex items-center gap-3">
             <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                <Globe2 className="text-blue-600" size={24} strokeWidth={2.5} /> 
             </div>
             All Team
          </h2>
         </div>

        {/* Stats indicator */}
        <div className="flex gap-3">
            <div className="bg-indigo-50 border border-indigo-100 py-2 px-4 rounded-2xl flex items-center gap-3 shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Total Team</p>
                  <p className="text-sm font-bold text-indigo-600">{stats.totalTeam}</p>
                </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 py-2 px-4 rounded-2xl flex items-center gap-3 shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Active Team</p>
                  <p className="text-sm font-bold text-emerald-600">{stats.activeTeam}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Filters (Search & Entries) */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
        <div className="relative w-full sm:w-80 group">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <Search size={16} strokeWidth={2.5} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
           </div>
           <input
             type="text"
             placeholder="Search by name or ID..."
             value={search}
             onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
             className="w-full bg-slate-50 border border-slate-200 text-[#0b1c3c] font-medium text-sm rounded-xl px-4 py-3.5 pl-11 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all placeholder-slate-400 shadow-inner"
           />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto custom-scroll w-full">
          <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
            
            <thead className="bg-slate-50 text-slate-500 text-[10px] md:text-xs uppercase tracking-widest border-b border-slate-200">
              <tr>
                {tableColumns.map((col) => (
                  <th 
                    key={col.label}
                    onClick={() => handleSort(col.key)}
                    className={`p-4 font-black transition-colors ${col.key ? "cursor-pointer hover:text-blue-600 select-none" : ""} ${col.center ? "text-center" : ""} ${col.right ? "text-right" : ""}`}
                  >
                    <span className={`inline-flex items-center gap-1 ${col.center ? "justify-center" : ""} ${col.right ? "justify-end" : ""}`}>
                      {col.label}
                      {sortConfig.key === col.key && (
                        <span className="text-[9px] text-blue-500">
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-[#0b1c3c]">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                     <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loading Network Data...</span>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">No Team Members Found</span>
                  </td>
                </tr>
              ) : (
                currentItems.map((u, i) => (
                  <tr
                    key={u._id || i}
                    className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors bg-white"
                  >
                    <td className="p-4 font-bold text-slate-500 text-center">
                      {indexOfFirst + i + 1}
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-xs text-right">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "-"}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-50 border border-blue-200 text-blue-700 py-1 px-2.5 rounded-md text-[10px] font-black tracking-widest shadow-sm">
                        L - {u.level}
                      </span>
                    </td>
                    <td className="p-4 font-black">
                      {u.userId}
                    </td>
                    <td className="p-4 font-bold text-slate-600">
                      {u.name || "-"}
                    </td>
                    <td className="p-4 font-bold text-slate-500">
                      {u.country || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🔥 NEW NUMBERED PAGINATION FOOTER - MOBILE & PC BOTH VISIBLE 🔥 */}
        {totalPages > 0 && (
           <div className="p-4 md:p-5 border-t border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Entries Info */}
              <span className="text-slate-500 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center md:text-left">
                Showing <span className="text-[#0b1c3c]">{indexOfFirst + 1}</span> to <span className="text-[#0b1c3c]">{Math.min(indexOfLast, sortedAndFilteredTeam.length)}</span> of <span className="text-[#0b1c3c]">{sortedAndFilteredTeam.length}</span> Entries
              </span>
              
              {/* Controls - Flex Wrap for Mobile */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
                 
                 {/* Prev Button */}
                 <button
                   onClick={handlePrev}
                   disabled={currentPage === 1}
                   className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg md:rounded-xl transition-all shadow-sm border ${
                     currentPage === 1 
                       ? 'bg-slate-100 text-slate-300 cursor-not-allowed border-transparent' 
                       : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-[#0b1c3c] active:scale-95'
                   }`}
                 >
                   <ChevronLeft size={16} strokeWidth={2.5} />
                 </button>
                 
                 {/* Number Buttons (1, 2, 3...) - ALWAYS VISIBLE */}
                 <div className="flex items-center gap-1 md:gap-1.5">
                   {getPageNumbers().map(num => (
                     <button
                       key={num}
                       onClick={() => setCurrentPage(num)}
                       className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg md:rounded-xl text-xs font-black transition-all shadow-sm border ${
                         currentPage === num 
                           ? 'bg-[#0b1c3c] text-white border-[#0b1c3c] scale-105' 
                           : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-[#0b1c3c]'
                       }`}
                     >
                       {num}
                     </button>
                   ))}
                 </div>
                 
                 {/* Next Button */}
                 <button
                   onClick={handleNext}
                   disabled={currentPage === totalPages}
                   className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg md:rounded-xl transition-all shadow-sm border ${
                     currentPage === totalPages 
                       ? 'bg-slate-100 text-slate-300 cursor-not-allowed border-transparent' 
                       : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-[#0b1c3c] active:scale-95'
                   }`}
                 >
                   <ChevronRight size={16} strokeWidth={2.5} />
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AllTeamPage;