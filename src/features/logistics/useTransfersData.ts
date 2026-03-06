import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { ExternalTransfer, TransferType, TransferStatus } from '@/src/types';
import { v4 as uuidv4 } from 'uuid';
import { mutateOnlineFirst } from '@/src/lib/syncEngine';

export function useTransfersData() {
  const transfers = useLiveQuery(() => db.external_transfers.toArray(), []);

  const addTransfer = async (transfer: Omit<ExternalTransfer, 'id'>) => {
    const newTransfer = {
      ...transfer,
      id: uuidv4()
    };
    await mutateOnlineFirst('external_transfers', newTransfer, 'upsert');
  };

  const seedTransfers = async () => {
    const count = await db.external_transfers.count();
    if (count === 0) {
      const animals = await db.animals.toArray();
      if (animals.length > 0) {
        const animal = animals[0];
        const transfers = [
          {
            id: uuidv4(),
            animal_id: animal.id,
            animal_name: animal.name,
            transfer_type: TransferType.ARRIVAL,
            date: new Date().toISOString().split('T')[0],
            institution: 'London Zoo',
            transport_method: 'Road',
            cites_article_10_ref: 'A10-12345',
            status: TransferStatus.COMPLETED,
            notes: 'Arrived in good health'
          },
          {
            id: uuidv4(),
            animal_id: animal.id,
            animal_name: animal.name,
            transfer_type: TransferType.DEPARTURE,
            date: new Date().toISOString().split('T')[0],
            institution: 'Edinburgh Zoo',
            transport_method: 'Road',
            cites_article_10_ref: 'A10-67890',
            status: TransferStatus.PENDING,
            notes: 'Scheduled transfer'
          }
        ];
        
        for (const t of transfers) {
            await mutateOnlineFirst('external_transfers', t, 'upsert');
        }
      }
    }
  };

  return {
    transfers: transfers || [],
    addTransfer,
    seedTransfers
  };
}
