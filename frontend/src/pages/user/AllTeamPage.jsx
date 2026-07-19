import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import { Search, Globe2, Activity, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";

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
  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    if (!key) return;
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const tableColumns = [
    { label: "Sr", key: null, center: true },
    { label: "Date", key: "createdAt", right: true },
    { label: "Level", key: "level", center: true },
    { label: "User ID", key: "userId" },
    { label: "Name", key: "name" },
    { label: "Country", key: "country" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500">

      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #3B82F6; border-radius: 10px; }
      `}</style>

      {/* Filters (Search & Entries) - rounded pill style */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">

        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-100 border border-slate-200 text-slate-700 text-sm rounded-full px-5 py-3.5 pl-12 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white focus:outline-none transition-all placeholder-slate-400 font-semibold shadow-sm"
          />
        </div>

      </div>

      {/* Table wrapper */}
      <div className="w-full">
        <div className="overflow-x-auto custom-scroll w-full">
          <div className="min-w-[720px]">

            {/* Header - rounded grey pill bar */}
            <div className="bg-slate-100 rounded-2xl px-6 py-4 grid grid-cols-6 gap-2 mb-3 shadow-sm">
              {tableColumns.map((col) => (
                <div
                  key={col.label}
                  onClick={() => handleSort(col.key)}
                  className={`text-blue-500 text-[11px] md:text-xs font-black uppercase tracking-widest transition-colors ${col.key ? "cursor-pointer hover:text-blue-600 select-none" : ""} ${col.center ? "text-center" : ""} ${col.right ? "text-right" : ""}`}
                >
                  <span className={`inline-flex items-center gap-1 ${col.center ? "justify-center" : ""} ${col.right ? "justify-end" : ""}`}>
                    {col.label}
                    {sortConfig.key === col.key && (
                      <span className="text-[9px] text-slate-500">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Rows - stacked rounded pill cards */}
            <div className="space-y-2.5">
              {isLoading ? (
                <div className="bg-white rounded-2xl py-10 text-center shadow-sm border border-slate-100">
                  <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Network Data...</span>
                </div>
              ) : currentItems.length === 0 ? (
                <div className="bg-white rounded-2xl py-10 text-center shadow-sm border border-slate-100">
                  <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">No Team Members Found</span>
                </div>
              ) : (
                currentItems.map((u, i) => (
                  <div
                    key={u._id || i}
                    className="bg-white hover:bg-blue-50/50 rounded-2xl px-6 py-4 grid grid-cols-6 gap-2 items-center shadow-sm border border-slate-100 transition-colors"
                  >
                    <div className="font-bold text-slate-400 text-sm text-center">
                      {indexOfFirst + i + 1}
                    </div>

                    <div className="text-slate-400 font-mono text-xs text-right">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "-"}
                    </div>

                    <div className="text-center">
                      <span className="inline-block bg-blue-50 border border-blue-200 text-blue-600 py-1 px-3 rounded-lg text-[11px] font-black tracking-widest">
                        L-{u.level}
                      </span>
                    </div>

                    <div className="font-black text-slate-800 text-sm truncate">
                      {u.userId}
                    </div>

                    <div className="font-bold text-slate-600 text-sm truncate" title={u.name || "-"}>
                      {u.name || "-"}
                    </div>

                    <div className="text-slate-500 text-sm">
                      {u.country || "-"}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
            <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, team.length)} of {team.length} Entries
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  currentPage === 1
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm"
                }`}
              >
                <ChevronLeft size={18} />
              </button>

              <span className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  currentPage === totalPages
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm"
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTeamPage;