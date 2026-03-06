import React, { useState } from 'react';
import { Palmtree, Plus, Trash2, Calendar, Lock } from 'lucide-react';
import { useHolidayData } from './useHolidayData';
import AddHolidayModal from './AddHolidayModal';
import { HolidayStatus } from '@/src/types';
import { usePermissions } from '../../hooks/usePermissions';

export default function Holidays() {
  const { view_holidays } = usePermissions();
  const { holidays, deleteHoliday } = useHolidayData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!view_holidays) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex flex-col items-center gap-2 max-w-md text-center">
          <Lock size={48} className="opacity-50" />
          <h2 className="text-lg font-bold uppercase tracking-tight">Access Restricted</h2>
          <p className="text-sm font-medium">You do not have permission to view Staff Holidays. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3 uppercase tracking-tight">
            <Palmtree className="text-emerald-600" size={28} /> Holiday Registry
          </h1>
          <p className="text-slate-500 text-sm font-medium">Official records of staff leave and availability.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:bg-black transition-all active:scale-95 font-black uppercase text-xs tracking-widest"
        >
          <Plus size={18}/> Request Leave
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(holidays || []).map(holiday => (
          <div key={holiday.id} className="bg-white rounded-2xl border-2 border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-black text-xs border-2 border-white shadow-lg shrink-0">
                {String(holiday.staff_name).split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{String(holiday.staff_name)}</h3>
                <div className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={10}/> {String(holiday.start_date)} → {String(holiday.end_date)}
                </div>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center gap-8 w-full md:w-auto">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Leave Type</span>
                <span className="bg-slate-50 px-3 py-1.5 rounded-lg border-2 border-slate-100 font-mono text-xs font-black text-slate-600">
                  {String(holiday.leave_type)}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                <span className={`px-3 py-1.5 rounded-lg border-2 font-mono text-xs font-black ${
                  holiday.status === HolidayStatus.APPROVED ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  holiday.status === HolidayStatus.DECLINED ? 'bg-rose-50 border-rose-100 text-rose-700' :
                  'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                  {String(holiday.status)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <p className="text-xs text-slate-500 font-medium italic leading-relaxed border-l-4 border-slate-100 pl-4 max-w-xs">
                {holiday.notes ? `"${String(holiday.notes)}"` : 'No notes'}
              </p>
              <button 
                onClick={() => deleteHoliday(holiday.id)}
                className="p-2.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl border-2 border-slate-100 transition-all"
                title="Delete Request"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
        {(holidays || []).length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-24 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Nil Leave Registry Records</p>
          </div>
        )}
      </div>

      {isModalOpen && <AddHolidayModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
