import { useState, useEffect, useMemo } from 'react';
import { Animal, AnimalCategory, LogType } from '../../types';
import { db } from '../../lib/db';
import { useTaskData } from '../husbandry/useTaskData';
import { useLiveQuery } from 'dexie-react-hooks';

export interface AnimalStatsData {
  todayWeight?: { weight_grams?: number; value?: string | number; log_date?: string | Date };
  previousWeight?: { weight_grams?: number; value?: string | number; log_date?: string | Date };
  todayFeed?: { value?: string | number; log_date?: string | Date };
}

export interface PendingTask {
  id: string;
  title: string;
  due_date?: string;
}

export function useDashboardData(activeTab: AnimalCategory, viewDate: string) {
  const liveAnimalsRaw = useLiveQuery(() => db.animals.toArray());
  const logsRaw = useLiveQuery(() => db.daily_logs.where('log_date').equals(viewDate).toArray(), [viewDate]);
  
  const liveAnimals = useMemo(() => liveAnimalsRaw || [], [liveAnimalsRaw]);
  const logs = useMemo(() => logsRaw || [], [logsRaw]);
  
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('alpha-asc');
  const [isOrderLocked, setIsOrderLocked] = useState(false);

  const { tasks } = useTaskData();

  const animalStats = useMemo(() => {
    let filtered = liveAnimals || [];
    if (activeTab && activeTab !== AnimalCategory.ALL) {
      filtered = filtered.filter(a => a.category === activeTab);
    }
    
    const filteredIds = new Set(filtered.map(a => a.id));
    const todayLogs = (logs || []).filter(l => filteredIds.has(l.animal_id));
    
    const weighed = todayLogs.filter(l => l.log_type === LogType.WEIGHT).length;
    const fed = todayLogs.filter(l => l.log_type === LogType.FEED).length;

    return {
      total: filtered.length,
      weighed,
      fed,
      animalData: new Map<string, AnimalStatsData>()
    };
  }, [liveAnimals, activeTab, logs]);

  const [taskStats, setTaskStats] = useState({
    pendingTasks: [] as PendingTask[],
    pendingHealth: [] as PendingTask[]
  });

  useEffect(() => {
    if (liveAnimals) {
      const timer = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(timer);
    }
  }, [liveAnimals]);

  useEffect(() => {
    const pendingTasks = (tasks || [])
      .filter(t => !t.completed && t.type !== 'HEALTH')
      .map(t => ({ id: t.id, title: t.title, due_date: t.dueDate }));
      
    const pendingHealth = (tasks || [])
      .filter(t => !t.completed && t.type === 'HEALTH')
      .map(t => ({ id: t.id, title: t.title, due_date: t.dueDate }));

    const timer = setTimeout(() => setTaskStats({ pendingTasks, pendingHealth }), 0);
    return () => clearTimeout(timer);
  }, [tasks]);

  useEffect(() => {
    let result = [...liveAnimals];
    
    if (activeTab && activeTab !== AnimalCategory.ALL) {
      result = result.filter(a => a.category === activeTab);
    }
    
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(a => 
        a.name?.toLowerCase().includes(lowerTerm) || 
        a.species?.toLowerCase().includes(lowerTerm) ||
        (a.latin_name && a.latin_name.toLowerCase().includes(lowerTerm))
      );
    }
    
    if (sortOption === 'alpha-asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOption === 'alpha-desc') {
      result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    }
    
    const timer = setTimeout(() => setFilteredAnimals(result), 0);
    return () => clearTimeout(timer);
  }, [liveAnimals, activeTab, searchTerm, sortOption]);

  const toggleOrderLock = (locked: boolean) => setIsOrderLocked(locked);
  const reorderAnimals = (newOrder: Animal[]) => setFilteredAnimals(newOrder);
  const cycleSort = () => {
    setSortOption(prev => prev === 'alpha-asc' ? 'alpha-desc' : prev === 'alpha-desc' ? 'custom' : 'alpha-asc');
  };

  return {
    filteredAnimals,
    animalStats,
    taskStats,
    isLoading,
    searchTerm,
    setSearchTerm,
    sortOption,
    isOrderLocked,
    toggleOrderLock,
    reorderAnimals,
    cycleSort
  };
}
