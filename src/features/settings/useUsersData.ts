import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { User } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { mutateOnlineFirst } from '../../lib/syncEngine';

export function useUsersData() {
  const usersData = useLiveQuery(() => db.users.toArray());
  const isLoading = usersData === undefined;
  const users = usersData || [];

  const addUser = async (user: Omit<User, 'id'>) => {
    const id = uuidv4();
    const newUser = { ...user, id } as User;
    await mutateOnlineFirst('users', newUser, 'upsert');
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const user = await db.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      await mutateOnlineFirst('users', updatedUser, 'upsert');
    }
  };

  const deleteUser = async (id: string) => {
    await mutateOnlineFirst('users', { id }, 'delete');
  };

  return { users, isLoading, addUser, updateUser, deleteUser };
}
