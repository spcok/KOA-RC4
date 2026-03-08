import React from 'react';
import { Activity, Database, AlertTriangle, Loader2, Wifi, WifiOff, CloudCog, Smartphone, ShieldCheck, CheckCircle2, XCircle, Trash2, ServerCrash } from 'lucide-react';
import { useSystemHealthData } from '../useSystemHealthData';

const SystemHealth: React.FC = () => {
  const { 
    isOnline, isHydrating, pwaHealth, 
    handleForceRebuild, handleClearQueue, isClearingQueue,
    handleWipeData, isWipingData, wipeProgress
  } = useSystemHealthData();

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

        {/* Mobile & App Health */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm space-y-6">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Smartphone size={16} className="text-emerald-500" /> Mobile & App Health
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className={pwaHealth.isSecure ? 'text-emerald-500' : 'text-amber-500'} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection Security</p>
                  <p className="text-xs font-bold text-slate-700">{pwaHealth.isSecure ? 'Secure / HTTPS' : 'Insecure'}</p>
                </div>
              </div>
              {pwaHealth.isSecure ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-amber-500" />}
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Activity size={18} className={pwaHealth.swActive ? 'text-emerald-500' : 'text-rose-500'} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Offline Engine</p>
                  <p className="text-xs font-bold text-slate-700">{pwaHealth.swActive ? 'Service Worker Active' : 'Service Worker Missing'}</p>
                </div>
              </div>
              {pwaHealth.swActive ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50 p-6 rounded-[2rem] border-2 border-rose-200 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-600" /> Danger Zone
        </h4>
        
        <div className="grid grid-cols-1 gap-4 mt-4">
          
          {/* Purge Queue Button */}
          <div className="p-4 bg-white rounded-xl border border-rose-100 space-y-3">
            <div>
              <p className="text-sm font-bold text-slate-800">1. Purge Stuck Sync Queue</p>
              <p className="text-xs text-slate-500 mt-1">Clears the offline outbox. Use this if the console is throwing infinite loop errors and the app refuses to sync new changes.</p>
            </div>
            <button 
              onClick={handleClearQueue}
              disabled={isClearingQueue || isWipingData || isHydrating}
              className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClearingQueue ? <><Loader2 size={16} className="animate-spin" /> Purging...</> : <><Trash2 size={16} /> Purge Outbox Queue</>}
            </button>
          </div>

          {/* Force Rebuild Button */}
          <div className="p-4 bg-white rounded-xl border border-rose-100 space-y-3">
            <div>
              <p className="text-sm font-bold text-slate-800">2. Force Database Rebuild</p>
              <p className="text-xs text-slate-500 mt-1">Wipes the local cache on this device only, and forces a fresh download from the cloud.</p>
            </div>
            <button 
              onClick={handleForceRebuild}
              disabled={isHydrating || isWipingData || isClearingQueue || !isOnline}
              className="w-full bg-rose-600 text-white px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isHydrating ? <><Loader2 size={16} className="animate-spin" /> Rebuilding Local Cache...</> : <><Database size={16} /> Rebuild Local Database</>}
            </button>
          </div>

          {/* Nuclear Wipe Button */}
          <div className="p-4 bg-rose-100 rounded-xl border-2 border-rose-300 space-y-3">
            <div>
              <p className="text-sm font-bold text-rose-900">3. Wipe Entire Database (Nuclear Option)</p>
              <p className="text-xs text-rose-700 mt-1 font-medium">Deletes EVERYTHING (Animals, Logs, Tasks, Records) from the Cloud Database and Local Caches. Preserves Settings and Staff accounts. Cannot be undone.</p>
            </div>
            
            {isWipingData && (
              <div className="w-full bg-rose-200 rounded-full h-4 mb-2 overflow-hidden border border-rose-300">
                <div className="bg-rose-600 h-4 transition-all duration-300" style={{ width: `${wipeProgress}%` }}></div>
              </div>
            )}

            <button 
              onClick={handleWipeData}
              disabled={isWipingData || isHydrating || isClearingQueue || !isOnline}
              className="w-full bg-rose-800 text-white px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-900 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWipingData ? <><Loader2 size={16} className="animate-spin" /> Wiping Data ({wipeProgress}%)...</> : <><ServerCrash size={16} /> Wipe Cloud & Local Data</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
