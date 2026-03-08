import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { supabase } from '../../lib/supabase';
import { forceHydrateFromCloud } from '../../lib/syncEngine';

export function useSystemHealthData() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isHydrating, setIsHydrating] = useState(false);
  const [isClearingQueue, setIsClearingQueue] = useState(false);
  const [isWipingData, setIsWipingData] = useState(false);
  const [wipeProgress, setWipeProgress] = useState(0);

  const [pwaHealth, setPwaHealth] = useState({
    isSecure: window.isSecureContext,
    swActive: false,
    manifestValid: false,
    isInstalled: window.matchMedia('(display-mode: standalone)').matches
  });

  useEffect(() => {
    const checkPwaHealth = async () => {
      const swActive = !!navigator.serviceWorker?.controller;
      let manifestValid = false;
      try {
        const res = await fetch('/manifest.json', { cache: 'no-store' });
        if (res.ok) {
          const manifest = await res.json();
          manifestValid = !!(manifest.icons && manifest.icons.length > 0);
        }
      } catch (e) {
        console.error('Manifest check failed', e);
      }
      setPwaHealth(prev => ({ ...prev, swActive, manifestValid }));
    };

    checkPwaHealth();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const tableCounts = useLiveQuery(async () => {
    return {
      animals: await db.animals.count(),
      users: await db.users.count(),
      daily_logs: await db.daily_logs.count(),
      tasks: await db.tasks.count(),
      medical_logs: await db.medical_logs.count()
    };
  }, []);

  const handleForceRebuild = async () => {
    if (!window.confirm("WARNING: This will wipe your local cache and re-download all data from the cloud. Are you sure you want to proceed?")) return;
    setIsHydrating(true);
    try {
      await forceHydrateFromCloud();
      alert("Database rebuilt successfully!");
    } catch (error) {
      console.error("Hydration failed:", error);
      alert("Failed to rebuild database. Check console for details.");
    } finally {
      setIsHydrating(false);
    }
  };

  const handleClearQueue = async () => {
    if (!window.confirm("Are you sure? This will permanently delete all pending offline changes that haven't synced to the cloud yet.")) return;
    setIsClearingQueue(true);
    try {
      await db.sync_queue.clear();
      alert("Offline sync queue purged successfully!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to clear queue.");
    } finally {
      setIsClearingQueue(false);
    }
  };

  const handleWipeData = async () => {
    if (!window.confirm("CRITICAL WARNING: This will permanently delete ALL operational data (animals, logs, records) from both this tablet AND the Cloud Database. Only Users, Permissions, and Settings will remain. Proceed?")) return;
    
    const check = window.prompt("To confirm complete database wipe, type 'DELETE' in the box below:");
    if (check !== 'DELETE') {
        alert("Wipe aborted.");
        return;
    }

    setIsWipingData(true);
    setWipeProgress(0);

    const tablesToWipe = [
      'animals', 'daily_logs', 'tasks', 'medical_logs', 'mar_charts',
      'quarantine_records', 'internal_movements', 'external_transfers',
      'timesheets', 'holidays', 'contacts', 'zla_documents',
      'safety_drills', 'maintenance_logs', 'first_aid_logs',
      'incidents', 'daily_rounds'
    ];

    try {
      for (let i = 0; i < tablesToWipe.length; i++) {
        const table = tablesToWipe[i];
        
        // Wipe Cloud Database (Supabase requires a filter to delete all, so we use not null)
        await supabase.from(table).delete().not('id', 'is', null);
        
        // Wipe Local IndexedDB Cache
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbTable = db[table as keyof typeof db] as any;
        if (dbTable && dbTable.clear) {
          await dbTable.clear();
        }

        setWipeProgress(Math.round(((i + 1) / tablesToWipe.length) * 100));
      }
      
      alert("Database wiped successfully. Reloading application.");
      window.location.reload();
    } catch (error) {
      console.error("Data wipe failed:", error);
      alert("An error occurred while wiping data. Please check your internet connection.");
    } finally {
      setIsWipingData(false);
      setWipeProgress(0);
    }
  };

  return { 
    isOnline, isHydrating, pwaHealth,
    tableCounts: tableCounts || { animals: 0, users: 0, daily_logs: 0, tasks: 0, medical_logs: 0 },
    handleForceRebuild, handleClearQueue, isClearingQueue,
    handleWipeData, isWipingData, wipeProgress
  };
}
