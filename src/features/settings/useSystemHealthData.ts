import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { forceHydrateFromCloud } from '../../lib/syncEngine';

export function useSystemHealthData() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isHydrating, setIsHydrating] = useState(false);
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

      setPwaHealth(prev => ({
        ...prev,
        swActive,
        manifestValid
      }));
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
    const animals = await db.animals.count();
    const users = await db.users.count();
    const daily_logs = await db.daily_logs.count();
    const tasks = await db.tasks.count();
    const medical_logs = await db.medical_logs.count();
    
    return {
      animals,
      users,
      daily_logs,
      tasks,
      medical_logs
    };
  }, []);

  const handleForceRebuild = async () => {
    if (!window.confirm("WARNING: This will wipe your local cache and re-download all data from the cloud. Are you sure you want to proceed?")) {
      return;
    }

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

  return { 
    isOnline, 
    isHydrating, 
    pwaHealth,
    tableCounts: tableCounts || { animals: 0, users: 0, daily_logs: 0, tasks: 0, medical_logs: 0 },
    handleForceRebuild 
  };
}
