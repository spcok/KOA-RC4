import React, { useState } from 'react';
import { Animal, AnimalCategory } from '../../types';
import { Heart, AlertCircle, Plus, Calendar, Scale, Drumstick, ArrowUpDown, Loader2, ClipboardCheck, CheckCircle, ChevronUp, ChevronDown, Lock, Unlock } from 'lucide-react';
import { formatWeightDisplay } from '../../services/weightUtils';
import AnimalFormModal from '../animals/AnimalFormModal';
import { useDashboardData } from './useDashboardData';
import { usePermissions } from '../../hooks/usePermissions';

interface DashboardProps {
  onSelectAnimal: (animal: Animal) => void;
  activeTab: AnimalCategory;
  setActiveTab: (category: AnimalCategory) => void;
  viewDate: string;
  setViewDate: (date: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    onSelectAnimal, activeTab, setActiveTab, viewDate, setViewDate
}) => {
  const { view_animals, edit_animals } = usePermissions();
  const {
    filteredAnimals,
    animalStats,
    taskStats,
    isLoading,
    cycleSort,
    sortOption,
    isOrderLocked,
    toggleOrderLock
  } = useDashboardData(activeTab, viewDate);

  const [isCreateAnimalModalOpen, setIsCreateAnimalModalOpen] = useState(false);
  const [isBentoMinimized, setIsBentoMinimized] = useState(false);

  if (!view_animals) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex flex-col items-center gap-2 max-w-md text-center">
          <Lock size={48} className="opacity-50" />
          <h2 className="text-lg font-bold uppercase tracking-tight">Access Restricted</h2>
          <p className="text-sm font-medium">You do not have permission to view the animal directory. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  const getWeightDisplay = (log?: { weight_grams?: number; value?: string | number }, unit: 'g' | 'oz' | 'lbs_oz' | 'kg' = 'g') => {
      if (!log) return '-';
      if (log.weight_grams) return formatWeightDisplay(log.weight_grams, unit);
      return typeof log.value === 'string' ? log.value : String(log.value || '-');
  };

  const getSafeDate = (dateStr?: string | Date | null) => {
      if (!dateStr) return 'N/A';
      try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return 'N/A';
          return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      } catch {
          return 'N/A';
      }
  };

  if (isLoading) {
      return (
          <div className="p-8 flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-sm font-medium text-slate-500">Loading Dashboard...</p>
          </div>
      );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 w-full max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-xs lg:text-base">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} <span className="text-slate-300">|</span> 🌤️ 14°C Partly Cloudy
          </p>
        </div>
      </div>

      {/* Tasks & Health Rota Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col transition-all duration-300">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsBentoMinimized(!isBentoMinimized)}>
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><ClipboardCheck size={18} /></div>
                      <h2 className="text-xs lg:text-sm font-semibold text-slate-800">Pending Duties</h2>
                  </div>
                  <div className="flex items-center gap-3">
                      <span className="bg-slate-100 text-slate-600 text-[10px] lg:text-xs font-bold px-2.5 py-1 rounded-md">{taskStats?.pendingTasks?.length || 0}</span>
                      <button className="text-slate-400 hover:text-slate-600">
                          {isBentoMinimized ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                      </button>
                  </div>
              </div>
              {!isBentoMinimized && (
                  <div className="mt-4 flex-1 overflow-y-auto max-h-48 pr-2 space-y-2 scrollbar-hide">
                      {(taskStats?.pendingTasks?.length || 0) > 0 ? (
                          (taskStats?.pendingTasks || []).map(t => (
                              <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                  <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0"/>
                                  <div>
                                      <p className="text-xs lg:text-sm font-medium text-slate-800 leading-tight">{t.title}</p>
                                      <p className="text-[10px] lg:text-xs text-slate-500 mt-1">Due: {getSafeDate(t.due_date)}</p>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6">
                              <CheckCircle size={28} className="mb-2 text-emerald-400 opacity-60"/>
                              <p className="text-xs font-medium">All Duties Satisfied</p>
                          </div>
                      )}
                  </div>
              )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col transition-all duration-300">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsBentoMinimized(!isBentoMinimized)}>
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Heart size={18} /></div>
                      <h2 className="text-xs lg:text-sm font-semibold text-slate-800">Health Rota</h2>
                  </div>
                  <div className="flex items-center gap-3">
                      <span className="bg-rose-50 text-rose-600 text-[10px] lg:text-xs font-bold px-2.5 py-1 rounded-md">{taskStats?.pendingHealth?.length || 0}</span>
                      <button className="text-slate-400 hover:text-slate-600">
                          {isBentoMinimized ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                      </button>
                  </div>
              </div>
              {!isBentoMinimized && (
                  <div className="mt-4 flex-1 overflow-y-auto max-h-48 pr-2 space-y-2 scrollbar-hide">
                      {(taskStats?.pendingHealth?.length || 0) > 0 ? (
                          (taskStats?.pendingHealth || []).map(t => (
                              <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg bg-rose-50/50 border border-rose-100 hover:border-rose-200 transition-colors">
                                  <Heart size={16} className="text-rose-500 mt-0.5 shrink-0"/>
                                  <div>
                                      <p className="text-xs lg:text-sm font-medium text-slate-800 leading-tight">{t.title}</p>
                                      <p className="text-[10px] lg:text-xs text-slate-500 mt-1">Mandatory: {getSafeDate(t.due_date)}</p>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6">
                              <Heart size={28} className="mb-2 text-rose-300 opacity-50"/>
                              <p className="text-xs font-medium">Collection Stable</p>
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-[#0fa968] rounded-xl p-6 text-white flex justify-between items-center shadow-sm">
          <div>
            <div className="text-xs lg:text-sm font-medium opacity-90 mb-1">Weighed Today</div>
            <div className="text-2xl lg:text-4xl font-bold">
              {animalStats?.weighed || 0}<span className="text-sm lg:text-xl opacity-80">/{animalStats?.total || 0}</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Scale size={28} className="text-white" />
          </div>
        </div>
        <div className="bg-[#f97316] rounded-xl p-6 text-white flex justify-between items-center shadow-sm">
          <div>
            <div className="text-xs lg:text-sm font-medium opacity-90 mb-1">Fed Today</div>
            <div className="text-2xl lg:text-4xl font-bold">
              {animalStats?.fed || 0}<span className="text-sm lg:text-xl opacity-80">/{animalStats?.total || 0}</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Drumstick size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {[AnimalCategory.OWLS, AnimalCategory.RAPTORS, AnimalCategory.MAMMALS, AnimalCategory.EXOTICS].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex-1 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
              activeTab === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {cat.charAt(0) + cat.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Date Control */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-700 font-medium whitespace-nowrap text-xs lg:text-sm">
            <Calendar size={20} className="text-blue-600" />
            Viewing Date:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() - 1); setViewDate(d.toISOString().split('T')[0]); }} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs lg:text-sm hover:bg-slate-50 whitespace-nowrap flex-1 sm:flex-none text-center">← Previous</button>
            <div className="relative flex-1 sm:flex-none min-w-[140px]">
              <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="w-full pl-3 pr-10 py-1.5 border border-slate-200 rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() + 1); setViewDate(d.toISOString().split('T')[0]); }} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs lg:text-sm hover:bg-slate-50 whitespace-nowrap flex-1 sm:flex-none text-center">Next →</button>
            <button onClick={() => setViewDate(new Date().toISOString().split('T')[0])} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs lg:text-sm hover:bg-slate-50 whitespace-nowrap flex-1 sm:flex-none text-center">Today</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button onClick={cycleSort} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs lg:text-sm font-medium hover:bg-slate-50 text-slate-700 bg-white min-w-[100px]">
            <ArrowUpDown size={16} /> {sortOption === 'alpha-asc' ? 'A-Z' : sortOption === 'alpha-desc' ? 'Z-A' : 'Custom'}
          </button>
          <button onClick={() => toggleOrderLock(!isOrderLocked)} className={`p-2.5 border border-slate-200 rounded-lg ${isOrderLocked ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}>
            {isOrderLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
        </div>
        {edit_animals && (
          <button onClick={() => setIsCreateAnimalModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs lg:text-sm font-medium hover:bg-blue-700 shadow-sm whitespace-nowrap w-full md:w-auto">
            <Plus size={16} /> Add {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}
          </button>
        )}
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-lg lg:text-2xl font-semibold text-slate-800">Your {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}</h2>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left text-[10px] md:text-[11px] lg:text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 whitespace-nowrap">Name</th>
                <th className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 whitespace-nowrap hidden lg:table-cell">Species</th>
                <th className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 whitespace-nowrap hidden lg:table-cell">Ring #</th>
                <th className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 whitespace-nowrap hidden lg:table-cell">Status</th>
                <th className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 whitespace-nowrap">Today</th>
                <th className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 whitespace-nowrap hidden lg:table-cell">Latest</th>
                <th className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 whitespace-nowrap hidden lg:table-cell">Target</th>
                <th className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 whitespace-nowrap">Fed</th>
                <th className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 whitespace-nowrap">Location</th>
                <th className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(filteredAnimals || []).map(animal => {
                const d = animalStats?.animalData?.get(animal.id);
                return (
                  <tr key={animal.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onSelectAnimal(animal)}>
                    <td className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 font-semibold text-slate-900 whitespace-nowrap">{animal.name}</td>
                    <td className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 text-slate-500 whitespace-nowrap hidden lg:table-cell">{animal.species}</td>
                    <td className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 text-slate-400 whitespace-nowrap hidden lg:table-cell">{animal.ring_number || '-'}</td>
                    <td className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium">active</span>
                    </td>
                    <td className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 text-slate-400 whitespace-nowrap">{d?.todayWeight ? getWeightDisplay(d.todayWeight, animal.weight_unit) : '-'}</td>
                    <td className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 text-slate-400 whitespace-nowrap hidden lg:table-cell">{d?.previousWeight ? getWeightDisplay(d.previousWeight, animal.weight_unit) : '-'}</td>
                    <td className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 text-slate-400 whitespace-nowrap hidden lg:table-cell">{animal.flying_weight_g ? formatWeightDisplay(animal.flying_weight_g, animal.weight_unit) : '-'}</td>
                    <td className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 text-slate-400 whitespace-nowrap">{d?.todayFeed ? (typeof d.todayFeed.value === 'string' ? d.todayFeed.value : String(d.todayFeed.value || 'Fed')) : '-'}</td>
                    <td className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 text-blue-500 whitespace-nowrap">{animal.location}</td>
                    <td className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-6 lg:py-4 text-right whitespace-nowrap">
                      <button className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100 text-slate-600" onClick={(e) => { e.stopPropagation(); /* handle add action */ }}>
                        <Plus size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {isCreateAnimalModalOpen && (
          <AnimalFormModal isOpen={isCreateAnimalModalOpen} onClose={() => setIsCreateAnimalModalOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;
