import React from 'react';
import { Activity, Database, AlertTriangle, Loader2, Wifi, WifiOff, CloudCog } from 'lucide-react';
import { useSystemHealthData } from '../useSystemHealthData';

const SystemHealth: React.FC = () => {
  const { isOnline, isHydrating, tableCounts, handleForceRebuild } = useSystemHealthData();

  return (
    <div className="max-w-6xl space-y-8 animate-in slide-in-from-right-4 duration-300 pb-24">
      <div className="border-b-2 border-slate-200 pb-6">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <Activity size={28} className="text-emerald-600" /> System Health & Data
        </h3>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Observability Dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connection Status */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm space-y-6">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <CloudCog size={16} className="text-indigo-500" /> Connection Status
          </h4>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              {isOnline ? <Wifi className="text-emerald-500" size={24} /> : <WifiOff className="text-amber-500" size={24} />}
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Network Status</p>
                <p className="text-sm font-medium text-slate-500">
                  {isOnline ? 'Connected to Cloud' : 'Offline / Local Cache'}
                </p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
          </div>
        </div>

        {/* Cache Diagnostics */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm space-y-6">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Database size={16} className="text-blue-500" /> Cache Diagnostics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Animals</p>
              <p className="text-2xl font-black text-slate-900">{tableCounts.animals}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Users</p>
              <p className="text-2xl font-black text-slate-900">{tableCounts.users}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Logs</p>
              <p className="text-2xl font-black text-slate-900">{tableCounts.daily_logs}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tasks</p>
              <p className="text-2xl font-black text-slate-900">{tableCounts.tasks}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medical Logs</p>
              <p className="text-2xl font-black text-slate-900">{tableCounts.medical_logs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50 p-6 rounded-[2rem] border-2 border-rose-200 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-600" /> Danger Zone
        </h4>
        <p className="text-sm text-rose-700">
          Force rebuilding the database will wipe your local cache and re-download all data from the cloud. 
          Use this only if you suspect your local cache is corrupted or out of sync.
        </p>
        <button 
          onClick={handleForceRebuild}
          disabled={isHydrating || !isOnline}
          className={`bg-rose-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-md ${
            (isHydrating || !isOnline) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isHydrating ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Rebuilding... Do not close app
            </>
          ) : (
            'Force Database Rebuild'
          )}
        </button>
      </div>
    </div>
  );
};

export default SystemHealth;
