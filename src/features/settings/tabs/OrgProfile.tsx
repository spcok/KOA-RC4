import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrgSettings } from '../useOrgSettings';
import { OrgProfileSettings } from '../../../types';

const schema = z.object({
  id: z.string(),
  org_name: z.string().min(1, 'Organisation Name is required'),
  logo_url: z.string().min(1, 'Logo URL is required'),
  contact_email: z.string().email('Invalid email'),
  contact_phone: z.string().min(1, 'Contact Phone is required'),
  address: z.string().min(1, 'Address is required'),
  zla_license_number: z.string().min(1, 'ZLA License Number is required'),
});

const OrgProfile: React.FC = () => {
  const { settings, isLoading, saveSettings } = useOrgSettings();
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<OrgProfileSettings>({
    resolver: zodResolver(schema),
    defaultValues: settings
  });

  useEffect(() => {
    if (!isLoading) {
      Object.entries(settings).forEach(([key, value]) => {
        setValue(key as keyof OrgProfileSettings, value);
      });
    }
  }, [settings, isLoading, setValue]);

  const logoUrl = useWatch({ control, name: 'logo_url' });

  const onSubmit = async (data: OrgProfileSettings) => {
    await saveSettings(data);
    console.log('Settings saved successfully!');
    // alert('Settings saved successfully!');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Brand & Identity</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700">Organisation Name</label>
          <input {...register('org_name')} className="mt-1 block w-full border border-slate-300 rounded-md p-2" />
          {errors.org_name && <p className="text-red-500 text-xs">{errors.org_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Logo URL</label>
          <input {...register('logo_url')} className="mt-1 block w-full border border-slate-300 rounded-md p-2" />
          {errors.logo_url && <p className="text-red-500 text-xs">{errors.logo_url.message}</p>}
          {logoUrl && <img src={logoUrl} alt="Logo Preview" className="mt-2 h-20 w-auto" referrerPolicy="no-referrer" />}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Contact & Location</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input {...register('contact_email')} className="mt-1 block w-full border border-slate-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input {...register('contact_phone')} className="mt-1 block w-full border border-slate-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Address</label>
          <textarea {...register('address')} className="mt-1 block w-full border border-slate-300 rounded-md p-2" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Regulatory</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700">ZLA License Number</label>
          <input {...register('zla_license_number')} className="mt-1 block w-full border border-slate-300 rounded-md p-2" />
          {errors.zla_license_number && <p className="text-red-500 text-xs">{errors.zla_license_number.message}</p>}
        </div>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Changes</button>
    </form>
  );
};

export default OrgProfile;
