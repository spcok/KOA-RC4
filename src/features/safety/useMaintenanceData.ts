import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { MaintenanceLog } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { mutateOnlineFirst } from '../../lib/syncEngine';

export function useMaintenanceData() {
  const logs = useLiveQuery(() => db.maintenance_logs.toArray()) || [];
  const isLoading = logs === undefined;

  const addLog = async (log: Omit<MaintenanceLog, 'id'>) => {
    const newLog = {
      ...log,
      id: uuidv4(),
    };
    await mutateOnlineFirst('maintenance_logs', newLog, 'upsert');
  };

  const updateLog = async (log: MaintenanceLog) => {
    await mutateOnlineFirst('maintenance_logs', log, 'upsert');
  };

  const deleteLog = async (id: string) => {
    await mutateOnlineFirst('maintenance_logs', { id }, 'delete');
  };

  return {
    logs,
    isLoading,
    addLog,
    updateLog,
    deleteLog
  };
}
