import { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { mutateOnlineFirst } from '../../lib/syncEngine';

export function useAnimalProfileData(animalId: string) {
  const animal = useLiveQuery(() => (animalId ? db.animals.get(animalId) : undefined), [animalId]);
  const logs = useLiveQuery(() => (animalId ? db.daily_logs.where('animal_id').equals(animalId).toArray() : []), [animalId]);
  const tasks = useLiveQuery(() => (animalId ? db.tasks.where('animalId').equals(animalId).toArray() : []), [animalId]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (animal !== undefined && logs !== undefined && tasks !== undefined) {
      const timer = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(timer);
    }
  }, [animal, logs, tasks]);

  const archiveAnimal = async (reason: string, type: 'Disposition' | 'Death') => {
    if (animal) {
      const updatedAnimal = { ...animal, archived: true, archive_reason: reason, archive_type: type };
      await mutateOnlineFirst('animals', updatedAnimal, 'upsert');
    }
  };

  return {
    animal: animal || null,
    logs: logs || [],
    tasks: tasks || [],
    orgProfile: { name: 'Kent Owl Academy', logo_url: '' },
    allAnimals: [],
    isLoading,
    archiveAnimal
  };
}
