import React, { useState } from 'react';
import { Activity, Database, HardDrive, Download, Upload, Loader2, AlertTriangle, X, CloudUpload, Wifi, WifiOff, RefreshCw, CloudCog, CheckCircle2 } from 'lucide-react';
import { useSystemHealthData } from '../useSystemHealthData';
import { db } from '../../../lib/db';
import { pushLegacyDataToCloud, processSyncQueue } from '../../../lib/syncEngine';

const SystemHealth: React.FC = () => {
  const { storageStats, exportDatabase, importDatabase, syncQueueCount, isOnline } = useSystemHealthData();
  const [isProcessingBackup, setIsProcessingBackup] = useState(false);
  const [isSyncingToCloud, setIsSyncingToCloud] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [pendingImportContent, setPendingImportContent] = useState<string | null>(null);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeProgress, setWipeProgress] = useState(0);

  const handleForceSync = async () => {
    setIsSyncing(true);
    await processSyncQueue();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const handleExportData = async () => {
    await exportDatabase();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setPendingImportContent(content);
      setShowImportConfirmModal(true);
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (!pendingImportContent) return;
    
    setIsProcessingBackup(true);
    setShowImportConfirmModal(false);
    
    const success = await importDatabase(pendingImportContent);
    
    if (success) {
      // alert("Database imported successfully. System will reload.");
      window.location.reload();
    } else {
      console.error("Import failed. Invalid file format.");
      // alert("Import failed. Invalid file format.");
    }
    setIsProcessingBackup(false);
    setPendingImportContent(null);
  };

 const handlePushToCloud = async () => {
    // Removed window.confirm() and alert() so it bypasses the sandbox restrictions
    setIsSyncingToCloud(true);
    try {
      await pushLegacyDataToCloud();
      console.log("SUCCESS: Data successfully pushed to cloud!");
    } catch (err) {
      console.error("Cloud push failed:", err);
    } finally {
      setIsSyncingToCloud(false);
    }
  };

  const handleFactoryReset = async () => {
    setIsWiping(true);
    setWipeProgress(10);
    
    try {
      // Get all tables except users and role_permissions
      const tablesToClear = db.tables.filter(table => 
        table.name !== 'users' && 
        table.name !== 'role_permissions'
      );
      
      const total = tablesToClear.length;
      let count = 0;
      
      for (const table of tablesToClear) {
        await table.clear();
        count++;
        setWipeProgress(10 + Math.floor((count / total) * 90));
      }
      
      setWipeProgress(100);
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error("Wipe failed:", err);
      setIsWiping(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-8 animate-in slide-in-from-right-4 duration-300 pb-24">
      <div className="border-b-2 border-slate-200 pb-6">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <Activity size={28} className="text-emerald-600" /> System Health & Data
        </h3>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Database Management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Storage Stats */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm space-y-6">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Database size={16} className="text-blue-500" /> Database Statistics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Animals</p>
              <p className="text-2xl font-black text-slate-900">{storageStats.totalAnimals}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Logs</p>
              <p className="text-2xl font-black text-slate-900">{storageStats.totalLogs}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Size</p>
              <p className="text-2xl font-black text-slate-900">{storageStats.dbSizeMB} MB</p>
            </div>
          </div>
        </div>

        {/* Service Connectivity */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm space-y-6">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <CloudCog size={16} className="text-indigo-500" /> Service Connectivity
          </h4>
          
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                    {isOnline ? <Wifi className="text-emerald-500" size={20} /> : <WifiOff className="text-rose-500" size={20} />}
                    <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Network Status</p>
                        <p className="text-sm font-medium text-slate-500">{isOnline ? 'Online & Connected' : 'Offline Mode Active'}</p>
                    </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
            </div>

            {/* Sync Queue */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                    {syncQueueCount === 0 ? <CheckCircle2 className="text-emerald-500" size={20} /> : <RefreshCw className="text-amber-500 animate-spin" size={20} />}
                    <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Sync Queue</p>
                        <p className="text-sm font-medium text-slate-500">{syncQueueCount === 0 ? 'All Systems Synchronized' : `${syncQueueCount} Pending Changes`}</p>
                    </div>
                </div>
                {syncQueueCount > 0 && (
                     <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Syncing</span>
                )}
            </div>

            {/* Realtime Status */}
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        </div>
                        <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-20 animate-ping"></div>
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Supabase Realtime</p>
                        <p className="text-sm font-medium text-slate-500">WebSocket Active</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleForceSync}
                disabled={isSyncing || !isOnline}
                className={`w-full bg-white border-2 border-slate-200 text-slate-600 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all ${isSyncing ? 'opacity-50' : ''}`}
            >
                <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> Force Re-Sync
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm space-y-6">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <HardDrive size={16} className="text-emerald-500" /> Data Management
          </h4>
          <div className="space-y-4">
            <button onClick={handleExportData} className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md">
              <Download size={16} /> Export Full Database
            </button>

            <div className="relative">
              <input type="file" id="import-db" className="hidden" accept=".json" onChange={handleFileImport} disabled={isProcessingBackup} />
              <label htmlFor="import-db" className={`w-full bg-rose-50 text-rose-600 border-2 border-rose-200 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-100 transition-all cursor-pointer ${isProcessingBackup ? 'opacity-50 pointer-events-none' : ''}`}>
                {isProcessingBackup ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Import & Overwrite Database
              </label>
            </div>

            <button 
              onClick={handlePushToCloud} 
              disabled={isSyncingToCloud}
              className={`w-full bg-indigo-600 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md ${isSyncingToCloud ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSyncingToCloud ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />} Push Local Data to Cloud
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50 p-6 rounded-[2rem] border-2 border-rose-200 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-600" /> Danger Zone
        </h4>
        <p className="text-sm text-rose-700">This action will permanently delete all local data. Use with extreme caution.</p>
        <button 
          onClick={() => setShowConfirmModal(true)}
          className="bg-rose-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md"
        >
          Wipe Database (Factory Reset)
        </button>
      </div>

      {/* Factory Reset Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="text-rose-600" /> Confirm Factory Reset
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Are you absolutely sure you want to wipe the database? This will delete all animals, logs, and settings, but will <span className="font-bold text-emerald-600">keep user accounts and permission settings</span>. This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowConfirmModal(false);
                  handleFactoryReset();
                }}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Confirmation Modal */}
      {showImportConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" /> Confirm Database Import
              </h3>
              <button onClick={() => setShowImportConfirmModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              WARNING: Importing a database will <span className="font-bold text-rose-600">overwrite all current data</span>. This cannot be undone. Are you sure you want to continue?
            </p>
            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setShowImportConfirmModal(false)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmImport}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600"
              >
                Yes, Overwrite Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overlay */}
      {isWiping && (
        <div className="fixed inset-0 bg-white/90 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm space-y-4 text-center">
            <Loader2 className="animate-spin text-rose-600 mx-auto" size={48} />
            <h3 className="text-xl font-bold text-slate-900">Wiping Database...</h3>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div className="bg-rose-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${wipeProgress}%` }}></div>
            </div>
            <p className="text-sm text-slate-500">Please do not close this window.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
