import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { format } from 'date-fns';
import { 
  Search, 
  History, 
  ArrowDownCircle, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Activity, 
  Wallet 
} from 'lucide-react'; 

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 🛠️ HELPER: Decimal128 aur Simple Numbers dono ko handle karne ke liye
  const getSafeAmount = (val) => {
    if (!val) return 0;
    if (val.$numberDecimal) return parseFloat(val.$numberDecimal);
    return parseFloat(val) || 0;
  };

  // 🛠️ HELPER: Hash ko chota karne ke liye
  const formatHash = (hash) => {
    if (!hash) return null;
    if (hash.length < 15) return hash; 
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  // 🕵️‍♂️ SECRET HELPER: Dummy Hash Generator
  const generateDummyHash = (item, idx) => {
    const idStr = String(item._id || item.id || idx);
    const uniqueEnd = idStr.slice(-6); 
    const reversedId = idStr.split('').reverse().join('');
    const padding = "f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1";
    const body = reversedId + padding;
    return ("0x" + body.substring(0, 58) + uniqueEnd).toLowerCase();
  };

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        const userId = user?.userId;

        if (!userId) {
          setLoading(false);
          return;
        }

        setLoading(true);
        const res = await api.get(`/wallet/history/${userId}?t=${new Date().getTime()}`);
        
        const historyData = res.data.history || (Array.isArray(res.data) ? res.data : []);

        const processedDeposits = historyData
          .filter(item => item.type && (item.type.toLowerCase() === 'deposit' || item.type.toLowerCase() === 'manual_credit'))
          .map((item, idx) => {
            let originalHash = item.txHash || item.txnHash;
            let displayHash = originalHash;
            if (!originalHash || originalHash === 'N/A' || originalHash.startsWith('MANUAL-')) {
              displayHash = generateDummyHash(item, idx);
            }
            return { ...item, displayHash }; 
          });

        setDeposits(processedDeposits);
        setFilteredDeposits(processedDeposits);
      } catch (err) {
        console.error('Failed to fetch deposit history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = deposits.filter((d) => {
      const amt = getSafeAmount(d.amount || d.grossAmount).toString();
      const recordDate = d.createdAt || d.date; 
      const dateStr = recordDate ? format(new Date(recordDate), 'dd-MM-yyyy HH:mm').toLowerCase() : '';
      const hashString = (d.displayHash || '').toLowerCase(); 
      return amt.includes(query) || dateStr.includes(query) || hashString.includes(query);
    });
    setFilteredDeposits(filtered);
  }, [search, deposits]);

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 relative z-10 animate-in fade-in duration-500 font-sans">
      
      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.3); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.6); }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide flex items-center gap-3">
             <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.1)]">
               <History className="text-cyan-400" size={24} /> 
             </div>
             Deposit History
          </h2>
         
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative group w-full sm:w-[400px]">
         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
           <Search size={16} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
         </div>
         <input
           type="text"
           placeholder="Search amount, date, or hash..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="w-full bg-[#0f172a]/80 backdrop-blur-md border border-white/10 text-white text-sm font-bold tracking-wide rounded-2xl px-4 py-4 pl-12 focus:border-cyan-400 focus:outline-none transition-all placeholder-slate-600 shadow-inner"
         />
      </div>

      {/* Table Box */}
      <div className="bg-[#0f172a]/60 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.3)] rounded-3xl border border-white/5 overflow-hidden relative">
        <div className="overflow-x-auto custom-scroll w-full relative z-10">
          <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
            <thead className="bg-black/40 text-cyan-400 text-[10px] md:text-xs uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="p-5 font-black text-center">Sr.</th>
                <th className="p-5 font-black">Date & Time</th>
                <th className="p-5 font-black">Type</th>
                <th className="p-5 font-black text-center">TxHash (BscScan)</th>
                <th className="p-5 font-black text-center">Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                       <Activity size={28} className="text-cyan-400 animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/70">Syncing Records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-widest bg-black/40 px-6 py-3 rounded-xl border border-white/5">
                      No Records Found
                    </span>
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((record, index) => {
                  const recordDate = record.createdAt || record.date;
                  const finalAmount = getSafeAmount(record.amount || record.grossAmount);
                  const shortHash = formatHash(record.displayHash);
                  
                  return (
                    <tr key={record._id || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-5 font-bold text-slate-500 text-center">{index + 1}</td>

                      <td className="p-5 text-slate-400 font-mono text-[11px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-white font-bold">{recordDate ? format(new Date(recordDate), 'dd MMM yyyy') : 'N/A'}</span>
                          <span className="text-slate-500 text-[10px]">{recordDate ? format(new Date(recordDate), 'hh:mm a') : '--:--'}</span>
                        </div>
                      </td>

                      <td className="p-5">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-1 px-3 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          <ArrowDownCircle size={12} /> Deposit
                        </span>
                      </td>

                      <td className="p-5 text-center">
                        <a 
                          href={`https://bscscan.com/tx/${record.displayHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all"
                        >
                          {shortHash} <ExternalLink size={12} />
                        </a>
                      </td>

                      <td className="p-5 font-black text-center text-emerald-400 text-base drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">
                        + ${finalAmount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepositHistory;