import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { LogType } from '../../types';

export interface MissingRecordAlert {
  id: string;
  animal_id: string;
  animal_name: string;
  alert_type: 'Missing Weight' | 'Missing Feed' | 'Overdue Checkup' | 'Missing Details';
  days_overdue: number;
  severity: 'High' | 'Medium';
  category: 'Husbandry' | 'Health' | 'Details';
}

export interface HusbandryLogStatus {
  animal_id: string;
  animal_name: string;
  weights: boolean[]; // 7 days
  feeds: boolean[];   // 7 days
}

export function useMissingRecordsData(anchorDate: Date = new Date()) {
  const alerts = useLiveQuery(async () => {
    const animals = await db.animals.toArray();
    const activeAnimals = animals.filter(a => !a.archived);
    const allAlerts: MissingRecordAlert[] = [];
    const now = new Date();

    for (const animal of activeAnimals) {
      // 1. Audit Weights (Last 14 days)
      const lastWeightLog = await db.daily_logs
        .where('animal_id')
        .equals(animal.id)
        .filter(log => log.log_type === LogType.WEIGHT)
        .reverse()
        .sortBy('log_date');

      const latestWeight = lastWeightLog[0];
      const weightThreshold = 14;
      
      if (!latestWeight) {
        allAlerts.push({
          id: `weight-${animal.id}`,
          animal_id: animal.id,
          animal_name: animal.name,
          alert_type: 'Missing Weight',
          days_overdue: 999,
          severity: 'Medium',
          category: 'Husbandry'
        });
      } else {
        const lastDate = new Date(latestWeight.log_date);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > weightThreshold) {
          allAlerts.push({
            id: `weight-${animal.id}`,
            animal_id: animal.id,
            animal_name: animal.name,
            alert_type: 'Missing Weight',
            days_overdue: diffDays,
            severity: 'Medium',
            category: 'Husbandry'
          });
        }
      }

      // 1b. Audit Feeds (Last 7 days)
      const lastFeedLog = await db.daily_logs
        .where('animal_id')
        .equals(animal.id)
        .filter(log => log.log_type === LogType.FEED)
        .reverse()
        .sortBy('log_date');

      const latestFeed = lastFeedLog[0];
      const feedThreshold = 7;
      
      if (!latestFeed) {
        allAlerts.push({
          id: `feed-${animal.id}`,
          animal_id: animal.id,
          animal_name: animal.name,
          alert_type: 'Missing Feed',
          days_overdue: 999,
          severity: 'Medium',
          category: 'Husbandry'
        });
      } else {
        const lastDate = new Date(latestFeed.log_date);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > feedThreshold) {
          allAlerts.push({
            id: `feed-${animal.id}`,
            animal_id: animal.id,
            animal_name: animal.name,
            alert_type: 'Missing Feed',
            days_overdue: diffDays,
            severity: 'Medium',
            category: 'Husbandry'
          });
        }
      }

      // 2. Audit Medical (Last 365 days)
      const medicalLogs = await db.medical_logs
        .where('animal_id')
        .equals(animal.id)
        .toArray();

      const checkupLogs = medicalLogs
        .filter(log => 
          log.note_type.toLowerCase().includes('checkup') || 
          log.note_type.toLowerCase().includes('medical')
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const latestCheckup = checkupLogs[0];
      const checkupThreshold = 365;

      if (!latestCheckup) {
        allAlerts.push({
          id: `medical-${animal.id}`,
          animal_id: animal.id,
          animal_name: animal.name,
          alert_type: 'Overdue Checkup',
          days_overdue: 999,
          severity: 'High',
          category: 'Health'
        });
      } else {
        const lastDate = new Date(latestCheckup.date);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > checkupThreshold) {
          allAlerts.push({
            id: `medical-${animal.id}`,
            animal_id: animal.id,
            animal_name: animal.name,
            alert_type: 'Overdue Checkup',
            days_overdue: diffDays,
            severity: 'High',
            category: 'Health'
          });
        }
      }

      // 3. Audit Animal Details
      if (!animal.ring_number || !animal.hazard_rating) {
        allAlerts.push({
          id: `details-${animal.id}`,
          animal_id: animal.id,
          animal_name: animal.name,
          alert_type: 'Missing Details',
          days_overdue: 0,
          severity: 'Medium',
          category: 'Details'
        });
      }
    }

    return allAlerts.sort((a, b) => {
      if (a.severity === b.severity) return b.days_overdue - a.days_overdue;
      return a.severity === 'High' ? -1 : 1;
    });
  }, [anchorDate]);

  const husbandryStatus = useLiveQuery(async () => {
    const animals = await db.animals.toArray();
    const activeAnimals = animals.filter(a => !a.archived);
    const baseDate = new Date(anchorDate);
    const status: HusbandryLogStatus[] = [];

    for (const animal of activeAnimals) {
      const weights = Array(7).fill(false);
      const feeds = Array(7).fill(false);

      for (let i = 0; i < 7; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const logs = await db.daily_logs
          .where('animal_id')
          .equals(animal.id)
          .filter(log => log.log_date.startsWith(dateStr))
          .toArray();

        weights[i] = logs.some(l => l.log_type === LogType.WEIGHT);
        feeds[i] = logs.some(l => l.log_type === LogType.FEED);
      }
      status.push({ animal_id: animal.id, animal_name: animal.name, weights, feeds });
    }
    return status;
  }, [anchorDate]);

  return {
    alerts: alerts || [],
    husbandryStatus: husbandryStatus || [],
    isLoading: alerts === undefined || husbandryStatus === undefined
  };
}
