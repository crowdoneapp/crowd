import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; 
import { Zap, RefreshCcw, Layers } from 'lucide-react';

const PACKAGES = [30, 100, 300, 500, 1000];

const PackageBoostControl = () => {
    const [allTargets, setAllTargets] = useState({});
    const [selectedPkg, setSelectedPkg] = useState(30);
    const [indiaTarget, setIndiaTarget] = useState("");
    const [otherTarget, setOtherTarget] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Page load hote hi saare packages ke targets fetch karenge
    useEffect(() => {
        fetchCurrentTargets();
    }, []);

    const fetchCurrentTargets = async () => {
        try {
            setFetching(true);
            const token = localStorage.getItem('adminToken');
            const res = await api.get('/admin/package-boost-settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const fetchedData = res.data.data || {};
            setAllTargets(fetchedData);
            
            // Default 30 wale data ko input fields me set karo
            const defaultPkgData = fetchedData["30"] || { indiaTarget: 0, otherTarget: 0 };
            setIndiaTarget(defaultPkgData.indiaTarget || 0);
            setOtherTarget(defaultPkgData.otherTarget || 0);
            
        } catch (error) {
            console.error("Failed to fetch boost targets:", error);
        } finally {
            setFetching(false);
        }
    };

    // Jab Admin doosra package select kare (jaise $100)
    const handlePackageChange = (pkg) => {
        setSelectedPkg(pkg);
        const pkgData = allTargets[String(pkg)] || { indiaTarget: 0, otherTarget: 0 };
        setIndiaTarget(pkgData.indiaTarget || 0);
        setOtherTarget(pkgData.otherTarget || 0);
    };

    const handleSave = async () => {
        if (Number(indiaTarget) < 0 || Number(otherTarget) < 0) {
            alert("Please enter valid positive numbers.");
            return;
        }

        if (!window.confirm(`Are you sure you want to update targets for $${selectedPkg} Package?`)) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await api.post('/admin/update-package-boost', 
                { 
                    packageAmount: selectedPkg,
                    indiaTarget: Number(indiaTarget),
                    otherTarget: Number(otherTarget)
                }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            alert(res.data.message || `$${selectedPkg} Targets Updated Successfully!`);
            
            // Update local state so it doesn't revert on click
            setAllTargets(prev => ({
                ...prev,
                [String(selectedPkg)]: { 
                    ...prev[String(selectedPkg)], 
                    indiaTarget: Number(indiaTarget), 
                    otherTarget: Number(otherTarget) 
                }
            }));
            
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update targets.");
            console.error("Update Boost Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-2">
                <Layers size={24} className="text-indigo-600" />
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                    Package Growth Control
                </h3>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 font-bold uppercase tracking-wider leading-relaxed border-b border-slate-100 pb-4">
                Select a package and set daily fake ID targets. System will distribute them smoothly over 24 hours.
            </p>
            
            {fetching ? (
                <div className="flex items-center gap-2 text-xs font-bold text-orange-500 animate-pulse py-4">
                    <RefreshCcw size={14} className="animate-spin" /> Fetching Current Settings...
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    
                    {/* PACKAGE SELECTOR TABS */}
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Select Package</label>
                        <div className="flex flex-wrap gap-2">
                            {PACKAGES.map(pkg => (
                                <button 
                                    key={pkg}
                                    onClick={() => handlePackageChange(pkg)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                        selectedPkg === pkg 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    ${pkg}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-sm font-black text-slate-700">Settings for ${selectedPkg} Package</span>
                        </div>

                        {/* INDIA INPUT */}
                        <div className="flex items-center gap-3">
                            <span className="text-2xl" title="India">🇮🇳</span>
                            <div className="relative flex-grow">
                                <label className="text-[10px] font-black uppercase text-slate-400 absolute -top-2 left-3 bg-slate-50 px-1">India Target (Daily)</label>
                                <input 
                                    type="number" 
                                    value={indiaTarget}
                                    onChange={(e) => setIndiaTarget(e.target.value)}
                                    placeholder="E.g., 50"
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-bold text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* FOREIGN/OTHER INPUT */}
                        <div className="flex items-center gap-3">
                            <span className="text-2xl" title="Other Countries">🌍</span>
                            <div className="relative flex-grow">
                                <label className="text-[10px] font-black uppercase text-slate-400 absolute -top-2 left-3 bg-slate-50 px-1">Foreign Target (Daily)</label>
                                <input 
                                    type="number" 
                                    value={otherTarget}
                                    onChange={(e) => setOtherTarget(e.target.value)}
                                    placeholder="E.g., 20"
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-bold text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SAVE BUTTON */}
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                    >
                        {loading ? (
                            <><RefreshCcw size={14} className="animate-spin" /> Saving...</>
                        ) : (
                            <><Zap size={14} className="fill-white" /> Save ${selectedPkg} Targets</>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PackageBoostControl;