import { useMemo, useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { mutateOnlineFirst } from '../../lib/syncEngine';

export function useSystemHealthData() {
  const animalsRaw = useLiveQuery(() => db.animals.toArray());
  const logEntriesRaw = useLiveQuery(() => db.logEntries.toArray());
  const tasksRaw = useLiveQuery(() => db.tasks.toArray());
  const usersRaw = useLiveQuery(() => db.users.toArray());
  const syncQueueRaw = useLiveQuery(() => db.sync_queue.toArray());

  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const animals = useMemo(() => animalsRaw || [], [animalsRaw]);
  const logEntries = useMemo(() => logEntriesRaw || [], [logEntriesRaw]);
  const tasks = useMemo(() => tasksRaw || [], [tasksRaw]);
  const users = useMemo(() => usersRaw || [], [usersRaw]);
  const syncQueueCount = syncQueueRaw?.length || 0;

  const storageStats = useMemo(() => {
    const totalAnimals = animals?.length || 0;
    const totalLogs = logEntries?.length || 0;
    const dbSizeEst = JSON.stringify(animals || []).length + 
                      JSON.stringify(tasks || []).length + 
                      JSON.stringify(users || []).length + 
                      JSON.stringify(logEntries || []).length;
    const dbSizeMB = (dbSizeEst / (1024 * 1024)).toFixed(2);
    return { totalAnimals, totalLogs, dbSizeMB };
  }, [animals, tasks, users, logEntries]);

  const exportDatabase = async () => {
    const data = {
      animals,
      log_entries: logEntries,
      tasks,
      users
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koa_backup_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = async (content: string) => {
    try {
      const data = JSON.parse(content);
      
      // Clear local DB first
      await db.transaction('rw', db.animals, db.logEntries, db.tasks, db.users, async () => {
        await db.animals.clear();
        await db.logEntries.clear();
        await db.tasks.clear();
        await db.users.clear();
      });

      // Import using mutateOnlineFirst to ensure sync
      if (data.animals) {
        for (const item of data.animals) await mutateOnlineFirst('animals', item, 'upsert');
      }
      if (data.log_entries) {
        for (const item of data.log_entries) await mutateOnlineFirst('daily_logs', item, 'upsert');
      }
      if (data.tasks) {
        for (const item of data.tasks) await mutateOnlineFirst('tasks', item, 'upsert');
      }
      if (data.users) {
        for (const item of data.users) await mutateOnlineFirst('users', item, 'upsert');
      }
      
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  };

  return { storageStats, exportDatabase, importDatabase, syncQueueCount, isOnline };
}
