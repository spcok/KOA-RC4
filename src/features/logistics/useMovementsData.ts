import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { InternalMovement, MovementType } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { mutateOnlineFirst } from '../../lib/syncEngine';

export function useMovementsData() {
  const movements = useLiveQuery(() => db.internal_movements.toArray(), []);

  const addMovement = async (movement: Omit<InternalMovement, 'id' | 'created_by'>) => {
    const newMovement: InternalMovement = {
      ...movement,
      id: uuidv4(),
      created_by: 'SYS' // Mock user
    };
    await mutateOnlineFirst('internal_movements', newMovement, 'upsert');
  };

  const seedMovements = async () => {
    const count = await db.internal_movements.count();
    if (count === 0) {
      const animals = await db.animals.toArray();
      if (animals.length > 0) {
        const animal = animals[0];
        const movements = [
          {
            id: uuidv4(),
            animal_id: animal.id,
            animal_name: animal.name,
            log_date: new Date().toISOString().split('T')[0],
            movement_type: MovementType.TRANSFER,
            source_location: 'Main Aviary',
            destination_location: 'Flying Field',
            created_by: 'SYS'
          },
          {
            id: uuidv4(),
            animal_id: animal.id,
            animal_name: animal.name,
            log_date: new Date().toISOString().split('T')[0],
            movement_type: MovementType.TRANSFER,
            source_location: 'Flying Field',
            destination_location: 'Main Aviary',
            created_by: 'SYS'
          }
        ];
        
        for (const m of movements) {
            await mutateOnlineFirst('internal_movements', m, 'upsert');
        }
      }
    }
  };

  return {
    movements: movements || [],
    addMovement,
    seedMovements
  };
}
