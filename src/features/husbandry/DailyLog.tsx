import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AnimalCategory, LogType, LogEntry } from '../../types';
import { ClipboardList, ChevronLeft, ChevronRight, Loader2, Lock } from 'lucide-react';
import { formatWeightDisplay } from '../../services/weightUtils';
import AddEntryModal from './AddEntryModal';
import { useDailyLogData } from './useDailyLogData';
import { useAppData } from '../../context/Context';
import { usePermissions } from '../../hooks/usePermissions';
import { useOrgSettings } from '../settings/useOrgSettings';
import { getFullWeather } from '../../services/weatherService';

const DailyLog: React.FC = () => {
  const { view_daily_logs } = usePermissions();
  const [activeCategory, setActiveCategory] = useState<AnimalCategory>(AnimalCategory.OWLS);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const { settings } = useOrgSettings();
  const [currentOutdoorTemp, setCurrentOutdoorTemp] = useState<number | undefined>();

  const { 
    animals, 
    isLoading, 
    sortOption, 
    cycleSort, 
    getTodayLog, 
    addLogEntry
  } = useDailyLogData(viewDate, activeCategory);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weather = await getFullWeather(settings?.address || 'Kent, UK');
        if (weather && weather.current) {
          setCurrentOutdoorTemp(Math.round(weather.current.temperature));
        }
      } catch (error) {
        console.error('Failed to fetch weather for DailyLog', error);
      }
    };
    fetchWeather();
  }, [settings?.address]);

  const { isSidebarCollapsed } = useOutletContext<{ isSidebarCollapsed?: boolean }>() || { isSidebarCollapsed: false };

  const { foodOptions, feedMethods, eventTypes } = useAppData();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [logType, setLogType] = useState<LogType>(LogType.WEIGHT);
  const [editingLog, setEditingLog] = useState<LogEntry | undefined>(undefined);

  if (!view_daily_logs) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex flex-col items-center gap-2 max-w-md text-center">
          <Lock size={48} className="opacity-50" />
          <h2 className="text-lg font-bold uppercase tracking-tight">Access Restricted</h2>
          <p className="text-sm font-medium">You do not have permission to view the Daily Logs. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const filteredAnimals = animals;

  const handleCellClick = (animalId: string, type: LogType, existingLog?: LogEntry) => {
    setSelectedAnimalId(animalId);
    setLogType(type);
    setEditingLog(existingLog);
    setModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 -mt-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3 uppercase tracking-tight">
            <ClipboardList className="text-emerald-600" size={28} /> DAILY OPERATIONS
          </h1>
          <p className="text-slate-500 text-sm font-medium">Mandatory husbandry logs for {String(viewDate)}.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button type="button" onClick={cycleSort} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-emerald-500 transition-all shadow-sm flex items-center gap-2">
                SORT {String(sortOption).replace('-', ' ')} →
            </button>
            <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button type="button" onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() - 1); setViewDate(d.toISOString().split('T')[0]); }} className="p-2 text-slate-400 hover:text-slate-900"><ChevronLeft size={18}/></button>
                <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="bg-transparent border-none focus:ring-0 text-slate-800 font-bold text-[10px] w-32 text-center p-0 uppercase"/>
                <button type="button" onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() + 1); setViewDate(d.toISOString().split('T')[0]); }} className="p-2 text-slate-400 hover:text-slate-900"><ChevronRight size={18}/></button>
            </div>
        </div>
      </div>

      <div className="flex gap-2 pb-4">
        {(Object.values(AnimalCategory) as string[])
          .filter(cat => !['ALL', 'REPTILES', 'INVERTEBRATES', 'AMPHIBIANS'].includes(cat))
          .map((cat) => (
            <button key={String(cat)} type="button" onClick={() => setActiveCategory(cat as AnimalCategory)} className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>{cat}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredAnimals?.map(animal => {
          const logs = {
            weight: getTodayLog(animal.id, LogType.WEIGHT),
            feed: getTodayLog(animal.id, LogType.FEED),
            temp: getTodayLog(animal.id, LogType.TEMPERATURE),
          };

          return (
            <div key={animal.id} className="flex flex-row items-center justify-between gap-2 sm:gap-4 w-full min-w-0 bg-white p-2 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 w-1/3 sm:w-1/4 shrink-0">
                <img src={animal.image_url} alt="" className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 ${isSidebarCollapsed ? 'hidden sm:block' : 'hidden lg:block'}`} referrerPolicy="no-referrer" />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 uppercase truncate text-xs sm:text-base">{String(animal.name)}</h3>
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase truncate">{String(animal.species)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 sm:gap-2 flex-1 min-w-0">
                <button 
                  onClick={() => handleCellClick(animal.id, LogType.WEIGHT, logs.weight)}
                  className="p-1 sm:p-3 rounded-lg sm:rounded-xl border border-dashed border-slate-300 min-w-0 hover:border-emerald-500 hover:text-emerald-600 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2"
                >
                  <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">WT</span>
                  <span className="w-full text-center truncate px-0.5 text-[9px] sm:text-xs font-bold text-slate-900">{logs.weight && logs.weight.weight_grams !== undefined ? formatWeightDisplay(logs.weight.weight_grams, animal.weight_unit) : '--'}</span>
                </button>
                <button 
                  onClick={() => handleCellClick(animal.id, LogType.TEMPERATURE, logs.temp)}
                  className="p-1 sm:p-3 rounded-lg sm:rounded-xl border border-dashed border-slate-300 min-w-0 hover:border-emerald-500 hover:text-emerald-600 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2"
                >
                  <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">ENV</span>
                  <span className="w-full text-center truncate px-0.5 text-[9px] sm:text-xs font-bold text-slate-900">{logs.temp ? `${logs.temp.temperature_c}°C` : '--'}</span>
                </button>
                <button 
                  onClick={() => handleCellClick(animal.id, LogType.FEED, logs.feed)}
                  className="p-1 sm:p-3 rounded-lg sm:rounded-xl border border-dashed border-slate-300 min-w-0 hover:border-emerald-500 hover:text-emerald-600 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2"
                >
                  <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">FOOD</span>
                  <span className="w-full text-center truncate px-0.5 text-[9px] sm:text-xs font-bold text-slate-900">{logs.feed ? (typeof logs.feed.value === 'string' ? logs.feed.value : String(logs.feed.value || '--')) : '--'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && selectedAnimalId && (
          <AddEntryModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
            onSave={(entry) => {
              addLogEntry(entry);
              setModalOpen(false);
            }} 
            animal={animals.find(a => a.id === selectedAnimalId)!} 
            initialType={logType} 
            existingLog={editingLog}
            foodOptions={foodOptions}
            feedMethods={feedMethods[activeCategory] || []}
            eventTypes={eventTypes}
            initialDate={viewDate}
            allAnimals={animals}
            defaultTemperature={currentOutdoorTemp}
          />
      )}
    </div>
  );
};

export default DailyLog;
