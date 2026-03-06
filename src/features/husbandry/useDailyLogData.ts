import { useState, useEffect, useMemo } from 'react';
import { AnimalCategory, LogType, LogEntry, Animal } from '../../types';
import { db } from '../../lib/db';
import { useHybridQuery, mutateOnlineFirst } from '../../lib/dataEngine';

export const useDailyLogData = (viewDate: string, activeCategory: AnimalCategory) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState('Name');

  const liveAnimals = useHybridQuery<Animal[]>('animals', () => db.animals.toArray(), []);
  const liveLogs = useHybridQuery<LogEntry[]>('daily_logs', () => db.daily_logs.where('log_date').startsWith(viewDate).toArray(), [viewDate]);

  const animals = useMemo(() => {
    const allAnimals = liveAnimals || [];
    return allAnimals.filter(a => a.category === activeCategory || activeCategory === AnimalCategory.ALL);
  }, [activeCategory, liveAnimals]);

  const logs = useMemo(() => liveLogs || [], [liveLogs]);

  useEffect(() => {
    if (liveAnimals !== undefined && liveLogs !== undefined) {
      const timer = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(timer);
    }
  }, [liveAnimals, liveLogs]);

  const cycleSort = () => {
    const options = ['Name', 'Location', 'Status'];
    const currentIndex = options.indexOf(sortOption);
    setSortOption(options[(currentIndex + 1) % options.length]);
  };

  const getTodayLog = (animalId: string, type: LogType) => {
    return logs.find(l => l.animal_id === animalId && l.log_type === type);
  };

  const handleQuickCheck = async (animalId: string, type: LogType) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      animal_id: animalId,
      log_type: type,
      log_date: viewDate,
      value: 'Done',
      created_at: new Date().toISOString(),
      created_by: 'System',
    };
    await mutateOnlineFirst('daily_logs', newLog, 'upsert');
  };

  const addLogEntry = async (entry: Partial<LogEntry>) => {
    if (entry.id) {
      const log = await db.daily_logs.get(entry.id);
      if (log) {
        const updatedLog = { ...log, ...entry };
        await mutateOnlineFirst('daily_logs', updatedLog, 'upsert');
      }
    } else {
      const newLog: LogEntry = {
        id: crypto.randomUUID(),
        animal_id: entry.animal_id || '',
        log_type: entry.log_type || LogType.WEIGHT,
        log_date: entry.log_date || viewDate,
        ...entry,
        created_at: new Date().toISOString(),
        created_by: 'System',
      } as LogEntry;
      await mutateOnlineFirst('daily_logs', newLog, 'upsert');
    }
  };

  return {
    animals,
    isLoading,
    sortOption,
    cycleSort,
    getTodayLog,
    handleQuickCheck,
    addLogEntry
  };
};
