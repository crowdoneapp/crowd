import React, { useEffect, useState, useMemo } from "react"; 
import api from "../../api/axios"; 
import { useAuth } from "../../context/AuthContext"; 
import { Search, UserPlus, ChevronLeft, ChevronRight, Phone, ShieldPlus, CheckCircle2, ShieldCheck } from "lucide-react";
import Swal from 'sweetalert2';

const DirectTeamPage = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [totalTeamCount, setTotalTeamCount] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  
  // Track how many setups created locally for UI indicator
  const setupCount = team.filter(m => m.role === 'setup').length;

  const fetchDirectTeam = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get(
        `/user/direct-team/${user.userId}?t=${new Date().getTime()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const teamData = Array.isArray(res.data.team) ? res.data.team : [];
      setTeam(teamData);
      setTotalTeamCount(res.data.totalTeam || res.data.totalTeamCount || 0);

    } catch (err) {
      console.error("Error fetching direct team:", err);
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  // 🔥 PROMOTE TO SETUP FUNCTION
  const handlePromote = (memberId, memberName) => {
    Swal.fire({
      title: 'Promote to Setup?',
      html: `Are you sure you want to promote <b>${memberName}</b> (${memberId}) to a <b>Setup</b> account?<br/><br/><span style="color: #ef4444; font-size: 13px; font-weight: bold;">Note: This action is permanent. The user will receive $30 in their wallet.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb', // Blue-600
      cancelButtonColor: '#f1f5f9', // Slate-100
      confirmButtonText: 'Yes, Promote to Setup!',
      cancelButtonText: '<span style="color: #475569;">Cancel</span>',
      customClass: {
        popup: 'rounded-[24px]',
        confirmButton: 'rounded-xl font-bold shadow-md',
        cancelButton: 'rounded-xl font-bold border border-slate-200 shadow-sm'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const res = await api.put(`/user/promote-to-setup/${memberId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });

          Swal.fire({
            title: 'Promoted!',
            text: res.data.message,
            icon: 'success',
            confirmButtonColor: '#2563eb',
            customClass: { popup: 'rounded-[24px]', confirmButton: 'rounded-xl font-bold shadow-md' }
          });

          // Refresh list to update UI
          fetchDirectTeam();

        } catch (err) {
          Swal.fire({
            title: 'Error',
            text: err.response?.data?.message || 'Failed to promote user.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            customClass: { popup: 'rounded-[24px]', confirmButton: 'rounded-xl font-bold shadow-md' }
          });
        }
      }
    });
  };

  // Search/Filter Logic
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return team.filter((u) =>
      u.userId?.toString().includes(s) ||
      u.name?.toLowerCase().includes(s) ||
      u.mobile?.toString().includes(s) ||
      u.country?.toLowerCase().includes(s)
    );
  }, [team, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Pagination Logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

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
                <UserPlus className="text-blue-600" size={24} strokeWidth={2.5} /> 
             </div>
             Direct Team
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-bold tracking-widest uppercase mt-2">Manage your direct referrals</p>
        </div>

        {/* Status indicator for Super Setup */}
        {user?.role === 'super_setup' && (
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
             <ShieldCheck size={24} className="text-indigo-600" />
             <div>
                <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Super Setup Access</p>
                <p className="text-xs font-bold text-indigo-600">Setups Assigned: {setupCount} <span className="text-indigo-400">/ 100</span></p>
             </div>
          </div>
        )}
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
             onChange={(e) => setSearch(e.target.value)}
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
                <th className="p-4 font-black text-center">Sr.</th>
                <th className="p-4 font-black text-right">Date</th>
                <th className="p-4 font-black">User ID</th>
                <th className="p-4 font-black">Name</th>
                <th className="p-4 font-black text-center">Directs</th>
                <th className="p-4 font-black text-center">Team Size</th>
                <th className="p-4 font-black text-center">Top-Up</th>
                <th className="p-4 font-black">Mobile</th>
                
                {/* Extra Column for Super Setup Action */}
                {user?.role === 'super_setup' && (
                  <th className="p-4 font-black text-center">Setup Mgmt</th>
                )}
              </tr>
            </thead>

            <tbody className="text-[#0b1c3c]">
              {loading ? (
                <tr>
                  <td colSpan={user?.role === 'super_setup' ? "9" : "8"} className="text-center py-12">
                     <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loading Network Data...</span>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'super_setup' ? "9" : "8"} className="text-center py-12">
                    <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">No Direct Referrals Found</span>
                  </td>
                </tr>
              ) : (
                currentItems.map((member, index) => (
                  <tr
                    key={member._id || index}
                    className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors bg-white"
                  >
                    <td className="p-4 font-bold text-slate-500 text-center">
                      {indexOfFirst + index + 1}
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-xs text-right">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString("en-GB") : "-"}
                    </td>
                    <td className="p-4 font-black">
                      {member.userId}
                    </td>
                    <td className="p-4 font-bold text-slate-600">
                      {member.name || "-"}
                    </td>

                    {/* Leader Bypass Logic */}
                    <td className="p-4 text-center">
                      <span className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-md text-[10px] font-black tracking-widest shadow-sm">
                        {member.role === 'leader' && user?.role !== 'superleader' ? 0 : (member.totalDirects || member.directCount || 0)}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 py-1 px-2.5 rounded-md text-[10px] font-black tracking-widest shadow-sm">
                        {member.role === 'leader' && user?.role !== 'superleader' ? 0 : (member.totalTeam || member.teamCount || 0)}
                      </span>
                    </td>

                    <td className="p-4 font-black text-center">
                       {Number(member.topUpAmount) > 0 ? (
                          <span className="text-emerald-600">${member.topUpAmount}</span>
                       ) : (
                          <span className="text-slate-400">$0</span>
                       )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                          <span className="text-slate-600 font-bold">{member.mobile || "-"}</span>
                          {member.mobile && (
                              <a 
                                  href={`tel:+91${member.mobile}`} 
                                  title="Call User"
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 shadow-sm transition-all active:scale-95 flex items-center justify-center"
                              >
                                  <Phone size={14} className="text-blue-600 fill-blue-600" />
                              </a>
                          )}
                      </div>
                    </td>

                    {/* 🔥 EXTRA COLUMN: Promote to Setup Button 🔥 */}
                    {user?.role === 'super_setup' && (
                      <td className="p-4 text-center">
                        {member.role === 'setup' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            <CheckCircle2 size={14} strokeWidth={2.5} /> Promoted
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePromote(member.userId, member.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[#0b1c3c] hover:bg-[#0b1c3c] hover:text-white hover:border-[#0b1c3c] text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95"
                          >
                            <ShieldPlus size={14} /> Make Setup
                          </button>
                        )}
                      </td>
                    )}

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 0 && (
           <div className="p-4 md:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-slate-500 text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                Showing <span className="text-[#0b1c3c]">{indexOfFirst + 1}</span> to <span className="text-[#0b1c3c]">{Math.min(indexOfLast, filtered.length)}</span> of <span className="text-[#0b1c3c]">{filtered.length}</span> Entries
              </span>
              
              <div className="flex items-center gap-2">
                 <button
                   onClick={handlePrev}
                   disabled={currentPage === 1}
                   className={`p-2 rounded-xl flex items-center justify-center transition-all shadow-sm ${currentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent' : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 active:scale-95'}`}
                 >
                   <ChevronLeft size={18} strokeWidth={2.5} />
                 </button>
                 
                 <span className="bg-white border border-slate-200 text-[#0b1c3c] shadow-sm text-xs font-black px-4 py-2 rounded-xl">
                    {currentPage} / {totalPages}
                 </span>
                 
                 <button
                   onClick={handleNext}
                   disabled={currentPage === totalPages}
                   className={`p-2 rounded-xl flex items-center justify-center transition-all shadow-sm ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent' : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 active:scale-95'}`}
                 >
                   <ChevronRight size={18} strokeWidth={2.5} />
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default DirectTeamPage;