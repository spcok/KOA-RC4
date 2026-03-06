import React, { useState } from 'react';
import { useMedicalData } from './useMedicalData';
import { usePermissions } from '../../hooks/usePermissions';
import { Pill, ClipboardList, AlertTriangle, Plus, Edit2, Download, CheckCircle, Lock } from 'lucide-react';
import { AddClinicalNoteModal } from './AddClinicalNoteModal';
import { AddMarChartModal } from './AddMarChartModal';
import { AddQuarantineModal } from './AddQuarantineModal';
import { generateMarChartDocx } from './exportMarChart';

const MedicalRecords: React.FC = () => {
  const { view_medical, edit_medical } = usePermissions();
  const { clinicalNotes, marCharts, quarantineRecords, animals, isLoading, addClinicalNote, addMarChart, addQuarantineRecord, updateQuarantineRecord } = useMedicalData();
  const [activeTab, setActiveTab] = useState<'notes' | 'mar' | 'quarantine'>('notes');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isMarModalOpen, setIsMarModalOpen] = useState(false);
  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState(false);

  if (!view_medical) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex flex-col items-center gap-2 max-w-md text-center">
          <Lock size={48} className="opacity-50" />
          <h2 className="text-lg font-bold uppercase tracking-tight">Access Restricted</h2>
          <p className="text-sm font-medium">You do not have permission to view Medical Records. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Clinical Records...</div>;

  const handleAdd = () => {
    if (activeTab === 'notes') setIsNoteModalOpen(true);
    else if (activeTab === 'mar') setIsMarModalOpen(true);
    else setIsQuarantineModalOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Clinical Records</h1>
        {edit_medical && (
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm"
          >
            <Plus size={16} /> Add {activeTab === 'notes' ? 'Note' : activeTab === 'mar' ? 'Medication' : 'Record'}
          </button>
        )}
      </div>
      
      <AddClinicalNoteModal 
        isOpen={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)} 
        onSave={addClinicalNote} 
        animals={animals} 
      />
      
      <AddMarChartModal 
        isOpen={isMarModalOpen} 
        onClose={() => setIsMarModalOpen(false)} 
        onSave={addMarChart} 
        animals={animals} 
      />

      <AddQuarantineModal
        isOpen={isQuarantineModalOpen}
        onClose={() => setIsQuarantineModalOpen(false)}
        onSave={addQuarantineRecord}
        animals={animals}
      />
      
      <div className="flex space-x-4 border-b border-slate-200">
        {[
          { id: 'notes', label: 'Clinical Notes', icon: ClipboardList },
          { id: 'mar', label: 'MAR Charts', icon: Pill },
          { id: 'quarantine', label: 'Quarantine', icon: AlertTriangle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'notes' | 'mar' | 'quarantine')}
            className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === tab.id ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto overflow-y-hidden">
          {activeTab === 'notes' && (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 whitespace-nowrap">Animal</th>
                  <th className="px-6 py-4 whitespace-nowrap">Type</th>
                  <th className="px-6 py-4 whitespace-nowrap">Clinical Note</th>
                  <th className="px-6 py-4 whitespace-nowrap">Recheck Due</th>
                  <th className="px-6 py-4 whitespace-nowrap">Initials</th>
                  <th className="px-6 py-4 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(clinicalNotes || []).map(n => (
                  <tr key={n.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{String(n.date)}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{String(n.animal_name)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{String(n.note_type)}</td>
                    <td className="px-6 py-4 max-w-xs truncate whitespace-nowrap">{String(n.note_text)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{String(n.recheck_date || '-')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{String(n.staff_initials)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-slate-400 hover:text-emerald-600"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'mar' && (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Medication</th>
                  <th className="px-6 py-4 whitespace-nowrap">Animal</th>
                  <th className="px-6 py-4 whitespace-nowrap">Dosage & Freq</th>
                  <th className="px-6 py-4 whitespace-nowrap">Start-End</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(marCharts || []).map(m => (
                  <tr key={m.id}>
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{String(m.medication)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{String(m.animal_name)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{String(m.dosage)} / {String(m.frequency)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{String(m.start_date)} - {String(m.end_date || 'Ongoing')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{String(m.status)}</td>
                    <td className="px-6 py-4 flex gap-2 whitespace-nowrap">
                      <button className="text-slate-400 hover:text-emerald-600"><Edit2 size={16} /></button>
                      <button onClick={() => generateMarChartDocx(m)} className="text-slate-400 hover:text-emerald-600"><Download size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'quarantine' && (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Animal</th>
                  <th className="px-6 py-4 whitespace-nowrap">Reason</th>
                  <th className="px-6 py-4 whitespace-nowrap">Start</th>
                  <th className="px-6 py-4 whitespace-nowrap">Target Release</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap">Notes</th>
                  <th className="px-6 py-4 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(quarantineRecords || []).map(q => (
                  <tr key={q.id}>
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{String(q.animal_name)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{String(q.reason)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{String(q.start_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{String(q.end_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${q.status === 'Active' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {String(q.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate whitespace-nowrap">{String(q.isolation_notes)}</td>
                    <td className="px-6 py-4 flex gap-2 whitespace-nowrap">
                      <button className="text-slate-400 hover:text-emerald-600"><Edit2 size={16} /></button>
                      {q.status === 'Active' && (
                        <button 
                          onClick={() => updateQuarantineRecord({...q, status: 'Cleared'})}
                          className="text-slate-400 hover:text-emerald-600"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
