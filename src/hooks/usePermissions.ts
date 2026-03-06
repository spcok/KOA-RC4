import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export function usePermissions() {
  const { currentUser } = useAuthStore();

  const rolePermissions = useLiveQuery(async () => {
    if (!currentUser?.role) return null;
    return await db.role_permissions.get(currentUser.role);
  }, [currentUser?.role]);

  const permissions = useMemo(() => {
    const role = currentUser?.role || UserRole.VOLUNTEER;
    const isAdminOrOwner = role === UserRole.ADMIN || role === UserRole.OWNER;

    if (isAdminOrOwner) {
      return {
        isAdmin: role === UserRole.ADMIN,
        isOwner: role === UserRole.OWNER,
        isSeniorKeeper: false,
        isVolunteer: false,
        isStaff: true,
        // Granular Permissions
        view_animals: true,
        edit_animals: true,
        view_daily_logs: true,
        view_tasks: true,
        view_daily_rounds: true,
        view_medical: true,
        edit_medical: true,
        view_movements: true,
        view_incidents: true,
        view_maintenance: true,
        view_safety_drills: true,
        view_first_aid: true,
        view_timesheets: true,
        view_holidays: true,
        view_missing_records: true,
        generate_reports: true,
        view_settings: true,
        manage_access_control: true,
        // Compatibility aliases
        canViewAnimals: true,
        canEditAnimals: true,
        canViewMedical: true,
        canEditMedical: true,
        canViewReports: true,
        canManageStaff: true,
        canEditSettings: true,
        canViewSettings: true,
        canGenerateReports: true,
        canManageUsers: true,
        canViewMovements: true,
        canEditMovements: true,
        role
      };
    }

    return {
      isAdmin: false,
      isOwner: false,
      isSeniorKeeper: role === UserRole.SENIOR_KEEPER,
      isVolunteer: role === UserRole.VOLUNTEER,
      isStaff: [UserRole.SENIOR_KEEPER, UserRole.KEEPER].includes(role),
      // Granular Permissions from DB
      view_animals: rolePermissions?.view_animals ?? false,
      edit_animals: rolePermissions?.edit_animals ?? false,
      view_daily_logs: rolePermissions?.view_daily_logs ?? false,
      view_tasks: rolePermissions?.view_tasks ?? false,
      view_daily_rounds: rolePermissions?.view_daily_rounds ?? false,
      view_medical: rolePermissions?.view_medical ?? false,
      edit_medical: rolePermissions?.edit_medical ?? false,
      view_movements: rolePermissions?.view_movements ?? false,
      view_incidents: rolePermissions?.view_incidents ?? false,
      view_maintenance: rolePermissions?.view_maintenance ?? false,
      view_safety_drills: rolePermissions?.view_safety_drills ?? false,
      view_first_aid: rolePermissions?.view_first_aid ?? false,
      view_timesheets: rolePermissions?.view_timesheets ?? false,
      view_holidays: rolePermissions?.view_holidays ?? false,
      view_missing_records: rolePermissions?.view_missing_records ?? false,
      generate_reports: rolePermissions?.generate_reports ?? false,
      view_settings: rolePermissions?.view_settings ?? false,
      manage_access_control: rolePermissions?.manage_access_control ?? false,
      // Compatibility aliases
      canViewAnimals: rolePermissions?.view_animals ?? false,
      canEditAnimals: rolePermissions?.edit_animals ?? false,
      canViewMedical: rolePermissions?.view_medical ?? false,
      canEditMedical: rolePermissions?.edit_medical ?? false,
      canViewReports: rolePermissions?.generate_reports ?? false,
      canManageStaff: rolePermissions?.manage_access_control ?? false,
      canEditSettings: rolePermissions?.view_settings ?? false,
      canViewSettings: rolePermissions?.view_settings ?? false,
      canGenerateReports: rolePermissions?.generate_reports ?? false,
      canManageUsers: rolePermissions?.manage_access_control ?? false,
      canViewMovements: rolePermissions?.view_movements ?? false,
      canEditMovements: rolePermissions?.edit_animals ?? false,
      role
    };
  }, [currentUser, rolePermissions]);

  return permissions;
}
