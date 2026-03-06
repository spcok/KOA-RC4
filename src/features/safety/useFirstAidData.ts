import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { FirstAidLog } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { mutateOnlineFirst } from '../../lib/syncEngine';

export function useFirstAidData() {
  const logs = useLiveQuery(() => db.first_aid_logs.toArray()) || [];
  const isLoading = logs === undefined;

  const addFirstAid = async (log: Omit<FirstAidLog, 'id'>) => {
    const newLog = {
      ...log,
      id: uuidv4(),
    };
    await mutateOnlineFirst('first_aid_logs', newLog, 'upsert');
  };

  const deleteFirstAid = async (id: string) => {
    await mutateOnlineFirst('first_aid_logs', { id }, 'delete');
  };

  return {
    logs,
    isLoading,
    addFirstAid,
    deleteFirstAid
  };
}
