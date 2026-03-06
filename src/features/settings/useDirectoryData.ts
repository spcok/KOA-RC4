import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../lib/db';
import { Contact } from '../../types';
import { mutateOnlineFirst } from '../../lib/syncEngine';

export function useDirectoryData() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContacts = async () => {
      setIsLoading(true);
      try {
        const allContacts = await db.contacts.toArray();
        setContacts(allContacts);
      } catch (error) {
        console.error("Failed to load contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadContacts();
  }, []);

  const addContact = async (contact: Omit<Contact, 'id'>) => {
    const id = uuidv4();
    const newContact = { ...contact, id };
    await mutateOnlineFirst('contacts', newContact, 'upsert');
    setContacts(prev => [...prev, newContact]);
  };

  const updateContact = async (contact: Contact) => {
    await mutateOnlineFirst('contacts', contact, 'upsert');
    setContacts(prev => prev.map(c => c.id === contact.id ? contact : c));
  };

  const deleteContact = async (id: string) => {
    await mutateOnlineFirst('contacts', { id }, 'delete');
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return { contacts, isLoading, addContact, updateContact, deleteContact };
}
