import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { SafetyDrill } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { mutateOnlineFirst } from '../../lib/syncEngine';

export function useSafetyDrillData() {
  const drills = useLiveQuery(() => db.safety_drills.toArray()) || [];
  const isLoading = drills === undefined;

  const addDrillLog = async (drill: Omit<SafetyDrill, 'id'>) => {
    const newDrill = {
      ...drill,
      id: uuidv4(),
    };
    await mutateOnlineFirst('safety_drills', newDrill, 'upsert');
  };

  const deleteDrillLog = async (id: string) => {
    await mutateOnlineFirst('safety_drills', { id }, 'delete');
  };

  return {
    drills,
    isLoading,
    addDrillLog,
    deleteDrillLog
  };
}
