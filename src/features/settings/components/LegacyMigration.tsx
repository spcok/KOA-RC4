import React, { useState } from 'react';
import { CloudUpload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { pushLegacyDataToCloud } from '../../../lib/syncEngine';

const LegacyMigration: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    try {
      await pushLegacyDataToCloud();
      setSyncStatus('success');
    } catch (error) {
      console.error('Migration failed:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Step 2: Push to Cloud</h3>
      <p className="text-sm text-slate-600">
        Warning: This tool is for one-off legacy data syncs only. It will push all local offline data to the Supabase cloud database.
      </p>
      
      <button
        onClick={handleCloudSync}
        disabled={isSyncing}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isSyncing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Syncing to Cloud (This may take a minute)...
          </>
        ) : (
          <>
            <CloudUpload className="w-5 h-5" />
            Push Local Data to Supabase
          </>
        )}
      </button>

      {syncStatus === 'success' && (
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">Successfully pushed all legacy data to the cloud!</p>
        </div>
      )}

      {syncStatus === 'error' && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">Failed to push legacy data. Check console for details.</p>
        </div>
      )}
    </div>
  );
};

export default LegacyMigration;
