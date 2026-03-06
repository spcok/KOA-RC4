import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { forceHydrateFromCloud } from '../../lib/syncEngine';

export function useSystemHealthData() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isHydrating, setIsHydrating] = useState(false);

  useEffect(() => {
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
    tableCounts: tableCounts || { animals: 0, users: 0, daily_logs: 0, tasks: 0, medical_logs: 0 },
    handleForceRebuild 
  };
}
