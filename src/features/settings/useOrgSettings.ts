import { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { OrgProfileSettings } from '../../types';
import { mutateOnlineFirst } from '../../lib/syncEngine';

const DEFAULT_SETTINGS: OrgProfileSettings = {
  id: 'profile',
  org_name: 'Kent Owl Academy',
  logo_url: '',
  contact_email: '',
  contact_phone: '',
  address: '',
  zla_license_number: '',
};

export function useOrgSettings() {
  const [settings, setSettings] = useState<OrgProfileSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const stored = await db.settings.get('profile');
        setSettings(stored || DEFAULT_SETTINGS);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (newSettings: OrgProfileSettings) => {
    const settingsToSave = { ...newSettings, id: 'profile' };
    await mutateOnlineFirst('settings', settingsToSave, 'upsert');
    setSettings(newSettings);
  };

  return { settings, isLoading, saveSettings };
}
