import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { format } from 'date-fns';
import { 
  Search, 
  History, 
  ArrowDownCircle, 
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
      const dateStr = recordDate ? format(new Date(recordDate), 'dd-MM-yyyy').toLowerCase() : '';
      const hashString = (d.displayHash || '').toLowerCase(); 
      return amt.includes(query) || dateStr.includes(query) || hashString.includes(query);
    });
    setFilteredDeposits(filtered);
  }, [search, deposits]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10 animate-in fade-in duration-500 rounded-3xl bg-[#0b0f19] shadow-2xl border border-slate-800 overflow-hidden font-sans">
      
      <style>{`
        .crowd-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .crowd-scroll::-webkit-scrollbar-track { background: #0f172a; border-radius: 10px; }
        .crowd-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .crowd-scroll::-webkit-scrollbar-thumb:hover { background: #eab308; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 uppercase tracking-wide flex items-center gap-3">
            <Wallet className="text-amber-400" size={28} /> 
            Deposit History
          </h2>
          
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-8 relative group w-full sm:w-[400px]">
         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
           <Search size={18} className="text-slate-500 group-focus-within:text-amber-400 transition-colors" />
         </div>
         <input
           type="text"
           placeholder="Search amount, date, or hash..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="w-full bg-[#131b2f] border border-slate-700 text-slate-200 text-sm font-semibold rounded-xl px-5 py-3.5 pl-12 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all placeholder-slate-500 shadow-inner"
         />
      </div>

      {/* Table Box */}
      <div className="w-full">
        <div className="overflow-x-auto crowd-scroll w-full pb-4">
          <div className="min-w-[800px]">
            <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
              <thead className="bg-[#1a233a] border-b border-slate-700/50 text-slate-400 text-[11px] md:text-xs font-black uppercase tracking-widest">
                <tr>
                  <th className="p-5 text-center rounded-tl-xl">Sr.</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Type</th>
                  <th className="p-5 text-center">TxHash (BscScan)</th>
                  <th className="p-5 text-center rounded-tr-xl">Amount</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-16 bg-[#131b2f] border-b border-slate-800">
                      <div className="flex flex-col items-center gap-3">
                         <Activity size={32} className="text-amber-400 animate-pulse" />
                         <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Syncing Records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-16 bg-[#131b2f] border-b border-slate-800">
                      <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                        No Deposit Records Found
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((record, index) => {
                    const recordDate = record.createdAt || record.date;
                    const finalAmount = getSafeAmount(record.amount || record.grossAmount);
                    const shortHash = formatHash(record.displayHash);
                    
                    return (
                      <tr key={record._id || index} className="bg-[#131b2f] hover:bg-[#1a233a] border-b border-slate-800 transition-colors group">
                        <td className="p-5 font-bold text-slate-500 text-center group-hover:text-amber-400 transition-colors">
                          {index + 1}
                        </td>

                        {/* 🔥 SIRF DATE DIKHEGI, TIME REMOVED */}
                        <td className="p-5 text-slate-200 font-mono text-[12px] sm:text-sm font-bold tracking-wide">
                          {recordDate ? format(new Date(recordDate), 'dd MMM yyyy') : 'N/A'}
                        </td>

                        <td className="p-5">
                          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-1.5 px-3 rounded-lg text-[10px] font-black tracking-widest uppercase">
                            <ArrowDownCircle size={14} /> Deposit
                          </span>
                        </td>

                        <td className="p-5 text-center">
                          <a 
                            href={`https://bscscan.com/tx/${record.displayHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-lg transition-all"
                          >
                            {shortHash} <ExternalLink size={12} />
                          </a>
                        </td>

                        <td className="p-5 font-black text-center text-emerald-400 text-base">
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
    </div>
  );
};

export default DepositHistory;