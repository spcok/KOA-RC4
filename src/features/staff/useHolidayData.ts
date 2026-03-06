import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { Holiday, LeaveType, HolidayStatus } from '@/src/types';
import { v4 as uuidv4 } from 'uuid';
import { mutateOnlineFirst } from '@/src/lib/syncEngine';

export function useHolidayData() {
  const holidays = useLiveQuery(() => db.holidays.toArray(), []);

  const addHoliday = async (holiday: Omit<Holiday, 'id'>) => {
    const newHoliday = {
      ...holiday,
      id: uuidv4()
    };
    await mutateOnlineFirst('holidays', newHoliday, 'upsert');
  };

  const deleteHoliday = async (id: string) => {
    await mutateOnlineFirst('holidays', { id }, 'delete');
  };

  const seedHolidays = async () => {
    const count = await db.holidays.count();
    if (count === 0) {
      const seeds = [
        {
          id: uuidv4(),
          staff_name: 'John Doe',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          leave_type: LeaveType.ANNUAL,
          status: HolidayStatus.APPROVED,
          notes: 'Summer vacation'
        },
        {
          id: uuidv4(),
          staff_name: 'Jane Smith',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          leave_type: LeaveType.SICK,
          status: HolidayStatus.PENDING,
          notes: 'Flu'
        }
      ];
      
      for (const seed of seeds) {
        await mutateOnlineFirst('holidays', seed, 'upsert');
      }
    }
  };

  return {
    holidays: holidays || [],
    addHoliday,
    deleteHoliday,
    seedHolidays
  };
}
