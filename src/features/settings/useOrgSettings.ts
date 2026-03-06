import { db } from '../../lib/db';
import { OrgProfileSettings } from '../../types';
import { useHybridQuery, mutateOnlineFirst } from '../../lib/dataEngine';

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
  const settingsData = useHybridQuery<OrgProfileSettings>('settings', () => db.settings.get('profile'), []);
  const isLoading = settingsData === undefined;
  const settings = settingsData || DEFAULT_SETTINGS;

  const saveSettings = async (newSettings: OrgProfileSettings) => {
    const settingsToSave = { ...newSettings, id: 'profile' };
    await mutateOnlineFirst('settings', settingsToSave as Record<string, unknown>, 'upsert');
  };

  return { settings, isLoading, saveSettings };
}
