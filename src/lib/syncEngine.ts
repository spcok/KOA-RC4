import { db, AppDatabase } from './db';
import { supabase } from './supabase';
import { Animal, User, LogEntry, ClinicalNote } from '../types';

export async function syncInitialData() {
  try {
    // Fetch animals and users
    const [animals, users] = await Promise.all([
      supabase.from('animals').select('*'),
      supabase.from('users').select('*')
    ]);

    if (animals.data) await db.animals.bulkPut(animals.data as Animal[]);
    if (users.data) await db.users.bulkPut(users.data as User[]);

    // Fetch logs
    const [dailyLogs, medicalLogs] = await Promise.all([
      supabase.from('daily_logs').select('*'),
      supabase.from('medical_logs').select('*')
    ]);

    if (dailyLogs.data) await db.daily_logs.bulkPut(dailyLogs.data as LogEntry[]);
    if (medicalLogs.data) await db.medical_logs.bulkPut(medicalLogs.data as ClinicalNote[]);
  } catch (error) {
    console.error('Error syncing initial data:', error);
  }
}

export async function processSyncQueue() {
  const queue = await db.sync_queue.toArray();
  
  for (const item of queue) {
    try {
      const payload = item.payload as Record<string, unknown>;
      if (item.operation === 'upsert') {
        await supabase.from(item.table_name).upsert(payload).throwOnError();
      } else if (item.operation === 'delete') {
        await supabase.from(item.table_name).delete().eq('id', payload.id as string).throwOnError();
      }
      await db.sync_queue.delete(item.id!);
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function mutateOnlineFirst(tableName: keyof AppDatabase, payload: any, operation: 'upsert' | 'delete' = 'upsert') {
  const table = db[tableName] as import('dexie').Table<unknown, string>;
  try {
    // Try online
    if (operation === 'upsert') {
      await supabase.from(tableName).upsert(payload).throwOnError();
      // Update local cache
      await table.put(payload);
    } else {
      await supabase.from(tableName).delete().eq('id', payload.id as string).throwOnError();
      // Update local cache
      await table.delete(payload.id as string);
    }
  } catch (error) {
    console.warn('Offline mode: queuing mutation', error);
    // Queue for later
    await db.sync_queue.add({
      table_name: tableName,
      operation,
      payload,
      created_at: new Date().toISOString()
    });
    // Update local cache anyway
    if (operation === 'upsert') {
      await table.put(payload);
    } else {
      await table.delete(payload.id as string);
    }
  }
}

export async function pushLegacyDataToCloud() {
  const syncOrder = [
    'settings', 'role_permissions', 'users', 'contacts', 'zla_documents',
    'animals',
    'daily_logs', 'medical_logs', 'tasks', 'daily_rounds', 'mar_charts', 'quarantine_records', 'internal_movements', 'external_transfers', 'timesheets', 'holidays', 'incidents', 'maintenance_logs', 'safety_drills', 'first_aid_logs'
  ];

  try {
    for (const tableName of syncOrder) {
      let records: Record<string, unknown>[] = [];
      const targetTableName = tableName;

      records = await db.table(tableName).toArray();

      if (records.length === 0) {
        console.log(`No records found for ${tableName} (local), skipping.`);
        continue;
      }

      console.log(`Syncing ${records.length} records for ${tableName} to cloud...`);

      for (let i = 0; i < records.length; i += 500) {
        const chunk = records.slice(i, i + 500);
        const { error } = await supabase.from(targetTableName).upsert(chunk);
        if (error) {
          console.error(`Error syncing chunk for ${targetTableName}:`, error);
          throw error;
        }
      }
      console.log(`Successfully synced ${tableName} to cloud.`);
    }
    return true;
  } catch (error) {
    console.error('Error pushing legacy data to cloud:', error);
    throw error;
  }
}

export function startRealtimeSubscription() {
  const channel = supabase.channel('koa-db-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      async (payload) => {
        const { table, eventType } = payload;
        console.log(`📡 Realtime Sync: ${eventType} on ${table}`);

        const dbTable = db[table as keyof AppDatabase] as import('dexie').Table<unknown, string | number>;
        if (!dbTable) return;

        try {
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            await dbTable.put(payload.new);
          } else if (eventType === 'DELETE') {
            await dbTable.delete(payload.old.id);
          }
        } catch (error) {
          console.error(`Realtime Sync Error on ${table}:`, error);
        }
      }
    )
    .subscribe();

  return channel;
}
