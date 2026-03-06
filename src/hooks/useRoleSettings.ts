import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { UserRole, RolePermissionConfig } from '../types';
import { mutateOnlineFirst } from '../lib/syncEngine';
import { useEffect } from 'react';

const defaultPermissions: Omit<RolePermissionConfig, 'role'> = {
  view_animals: false,
  edit_animals: false,
  view_daily_logs: false,
  view_tasks: false,
  view_daily_rounds: false,
  view_medical: false,
  edit_medical: false,
  view_movements: false,
  view_incidents: false,
  view_maintenance: false,
  view_safety_drills: false,
  view_first_aid: false,
  view_timesheets: false,
  view_holidays: false,
  view_missing_records: false,
  generate_reports: false,
  view_settings: false,
  manage_access_control: false,
};

export const useRoleSettings = () => {
  const roles = useLiveQuery(() => db.role_permissions.toArray(), []);

  useEffect(() => {
    if (roles) {
      const existingRoles = roles.map(r => r.role);
      const missingRoles = Object.values(UserRole).filter(role => !existingRoles.includes(role));

      missingRoles.forEach(role => {
        const newRoleConfig: RolePermissionConfig = {
          role,
          ...defaultPermissions,
        };
        mutateOnlineFirst('role_permissions', newRoleConfig as unknown as Record<string, unknown>);
      });
    }
  }, [roles]);

  const handlePermissionChange = async (role: UserRole, permissionKey: keyof RolePermissionConfig, newValue: boolean) => {
    const roleConfig = roles?.find(r => r.role === role);
    if (!roleConfig) return;

    const updatedConfig = {
      ...roleConfig,
      [permissionKey]: newValue,
    };

    try {
      await mutateOnlineFirst('role_permissions', updatedConfig as unknown as Record<string, unknown>);
    } catch (error) {
      console.error('Failed to update permission:', error);
      alert('Failed to update permission. Please try again.');
    }
  };

  return { roles, handlePermissionChange };
};
