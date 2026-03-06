import React, { useState } from 'react';
import { Truck, Plus, History, MapPin, Calendar, User as UserIcon, ArrowRight, Plane, Lock } from 'lucide-react';
import { useMovementsData } from './useMovementsData';
import { useTransfersData } from './useTransfersData';
import AddMovementModal from './AddMovementModal';
import AddTransferModal from './AddTransferModal';
import { usePermissions } from '../../hooks/usePermissions';

export default function Movements() {
  const { view_movements } = usePermissions();
  const { movements } = useMovementsData();
  const { transfers } = useTransfersData();
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!view_movements) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex flex-col items-center gap-2 max-w-md text-center">
          <Lock size={48} className="opacity-50" />
          <h2 className="text-lg font-bold uppercase tracking-tight">Access Restricted</h2>
          <p className="text-sm font-medium">You do not have permission to view Logistics & Movements. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3 uppercase tracking-tight">
            <Truck className="text-slate-600" size={28} /> Logistics & Movements
          </h1>
          <p className="text-slate-500 text-sm font-medium">Record of internal transfers and external acquisitions/dispositions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:bg-black transition-all active:scale-95 font-black uppercase text-xs tracking-widest"
        >
          <Plus size={18}/> Record {activeTab === 'internal' ? 'Movement' : 'Transfer'}
        </button>
      </div>

      <div className="flex bg-white p-1 rounded-xl border-2 border-slate-200 shadow-sm w-full md:w-auto self-start inline-flex">
        <button
          onClick={() => setActiveTab('internal')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'internal' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          Internal Movements
        </button>
        <button
          onClick={() => setActiveTab('external')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'external' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          External Transfers
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeTab === 'internal' ? (
          (movements || []).map(movement => (
            <div key={movement.id} className="bg-white rounded-2xl border-2 border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">{String(movement.animal_name)}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{String(movement.movement_type)}</p>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                <div className="text-center flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Origin</p>
                  <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700 text-sm">
                    <MapPin size={14} className="text-slate-300" />
                    {String(movement.source_location)}
                  </div>
                </div>
                <ArrowRight className="text-slate-300" size={20} />
                <div className="text-center flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                  <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700 text-sm">
                    <MapPin size={14} className="text-slate-300" />
                    {String(movement.destination_location)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 min-w-[150px]">
                <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm">
                  <Calendar size={14} className="text-slate-400" />
                  {String(movement.log_date)}
                </div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                  <UserIcon size={10}/> {String(movement.created_by)}
                </div>
              </div>
            </div>
          ))
        ) : (
          (transfers || []).map(transfer => (
            <div key={transfer.id} className="bg-white rounded-2xl border-2 border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  transfer.transfer_type === 'Arrival' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <Plane size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">{String(transfer.animal_name)}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    transfer.transfer_type === 'Arrival' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>{String(transfer.transfer_type)}</p>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                <div className="text-center flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Institution</p>
                  <div className="font-bold text-slate-700 text-sm">{String(transfer.institution)}</div>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">CITES / A10</p>
                  <div className="font-bold text-slate-700 text-sm">{String(transfer.cites_article_10_ref)}</div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 min-w-[150px]">
                <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm">
                  <Calendar size={14} className="text-slate-400" />
                  {String(transfer.date)}
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  transfer.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {String(transfer.status)}
                </div>
              </div>
            </div>
          ))
        )}
        {(activeTab === 'internal' ? movements : transfers || []).length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <History size={48} className="mx-auto mb-4 text-slate-100"/>
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">No {activeTab} Records Found</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        activeTab === 'internal' 
          ? <AddMovementModal onClose={() => setIsModalOpen(false)} />
          : <AddTransferModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
