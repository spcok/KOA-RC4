import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ShieldCheck, Loader2, Trash2, UserPlus, AlertTriangle } from 'lucide-react';
import { db } from '../../../lib/db';
import { mutateOnlineFirst } from '../../../lib/syncEngine';
import { User, UserRole, RolePermissionConfig } from '../../../types';
import EditUserModal from './EditUserModal';

const permissionLabels: Record<keyof Omit<RolePermissionConfig, 'role'>, string> = {
  view_animals: 'View Animals',
  edit_animals: 'Edit Animals',
  view_daily_logs: 'View Daily Logs',
  view_tasks: 'View Tasks',
  view_daily_rounds: 'View Daily Rounds',
  view_medical: 'View Medical',
  edit_medical: 'Edit Medical',
  view_movements: 'View Movements',
  view_incidents: 'View Incidents',
  view_maintenance: 'View Maintenance',
  view_safety_drills: 'View Safety Drills',
  view_first_aid: 'View First Aid',
  view_timesheets: 'View Timesheets',
  view_holidays: 'View Holidays',
  view_missing_records: 'View Missing Records',
  generate_reports: 'Generate Reports',
  view_settings: 'View Settings',
  manage_access_control: 'Manage Access Control',
};

const UsersView: React.FC = () => {
  const users = useLiveQuery(() => db.users.toArray());
  const [editingUser, setEditingUser] = useState<User | null>(null);

  if (!users) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      await mutateOnlineFirst('users', { id: user.id }, 'delete');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900">Staff Directory</h3>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
          <UserPlus size={18} />
          Add Staff
        </button>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 flex items-start gap-3">
        <AlertTriangle className="shrink-0" size={20} />
        <p className="text-sm">Attention: You must first create this user's email and password in the Supabase Auth Dashboard before adding them here.</p>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest">Name</th>
              <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest">Email</th>
              <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest">Role</th>
              <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingUser(user)} className="text-indigo-600 hover:text-indigo-800">Edit</button>
                    <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}
    </div>
  );
};

const PermissionsMatrix: React.FC = () => {
  const roles = useLiveQuery(() => db.role_permissions.toArray());

  if (!roles) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const permissionKeys = Object.keys(permissionLabels) as (keyof Omit<RolePermissionConfig, 'role'>)[];

  const handleToggle = async (role: UserRole, key: keyof Omit<RolePermissionConfig, 'role'>) => {
    let roleConfig = roles.find(r => r.role === role);
    if (!roleConfig) {
      // Initialize missing role permissions
      roleConfig = {
        role,
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
        manage_access_control: false
      };
    }
    const updatedRole = { ...roleConfig, [key]: !roleConfig[key] };
    await mutateOnlineFirst('role_permissions', updatedRole);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-white shadow-sm">
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 font-black text-slate-500 uppercase tracking-widest">Permission</th>
            {Object.values(UserRole).map(role => (
              <th key={role} className="px-4 py-3 font-black text-slate-500 uppercase tracking-widest text-center">{role}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissionKeys.map(key => (
            <tr key={key} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-3 font-bold text-slate-900">{permissionLabels[key]}</td>
              {Object.values(UserRole).map(role => {
                const roleConfig = roles.find(r => r.role === role);
                const isAdminOrOwner = role === UserRole.ADMIN || role === UserRole.OWNER;
                return (
                  <td key={role} className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isAdminOrOwner ? true : (roleConfig ? roleConfig[key] : false)}
                      disabled={isAdminOrOwner}
                      onChange={() => !isAdminOrOwner && handleToggle(role, key)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AccessControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-emerald-600" size={28} />
        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Access Control</h2>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-1 font-bold uppercase tracking-widest text-sm ${activeTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Staff Users
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`pb-4 px-1 font-bold uppercase tracking-widest text-sm ${activeTab === 'permissions' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Permissions Matrix
          </button>
        </nav>
      </div>

      {activeTab === 'users' ? <UsersView /> : <PermissionsMatrix />}
    </div>
  );
};

export default AccessControl;
