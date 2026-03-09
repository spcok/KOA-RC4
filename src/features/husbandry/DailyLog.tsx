import React, { useState, useEffect, useRef } from 'react';
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
  
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [mammalLoadingId, setMammalLoadingId] = useState<string | null>(null);
  const [currentOutdoorTemp, setCurrentOutdoorTemp] = useState<number | undefined>();
  
  const { settings } = useOrgSettings();
  const processedAnimals = useRef<Set<string>>(new Set());

  const { animals, isLoading, sortOption, cycleSort, getTodayLog, addLogEntry } = useDailyLogData(viewDate, activeCategory);
  const { foodOptions, feedMethods, eventTypes } = useAppData();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [logType, setLogType] = useState<LogType>(LogType.WEIGHT);
  const [editingLog, setEditingLog] = useState<LogEntry | undefined>(undefined);

  useEffect(() => {
    processedAnimals.current.clear();
  }, [viewDate]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (viewDate !== today || animals.length === 0) return;

    const birdsToProcess = animals.filter(a => 
      (a.category === AnimalCategory.OWLS || a.category === AnimalCategory.RAPTORS) && 
      !processedAnimals.current.has(a.id) && 
      !getTodayLog(a.id, LogType.TEMPERATURE)
    );
      
    if (birdsToProcess.length > 0) {
      birdsToProcess.forEach(a => processedAnimals.current.add(a.id));
      
      const fetchBirdWeather = async () => {
        setIsWeatherLoading(true);
        try {
          const weather = await getFullWeather(settings?.address || 'Maidstone, Kent');
          if (weather?.current) {
            const temp = Math.round(weather.current.temperature);
            setCurrentOutdoorTemp(temp);
            
            for (const bird of birdsToProcess) {
              await addLogEntry({
                animal_id: bird.id,
                log_type: LogType.TEMPERATURE,
                log_date: viewDate,
                value: `${temp}°C`,
                notes: weather.current.description
              });
            }
          }
        } catch (error) {
          console.error('Failed to auto-fetch weather:', error);
          birdsToProcess.forEach(a => processedAnimals.current.delete(a.id));
        } finally {
          setIsWeatherLoading(false);
        }
      };
      fetchBirdWeather();
    }
  }, [viewDate, animals, getTodayLog, addLogEntry, settings?.address]);

  const handleMammalWeatherFetch = async (animalId: string) => {
    setMammalLoadingId(animalId);
    try {
      const weather = await getFullWeather(settings?.address || 'Maidstone, Kent');
      if (weather?.current) {
        const temp = Math.round(weather.current.temperature);
        setCurrentOutdoorTemp(temp);
        await addLogEntry({
          animal_id: animalId,
          log_type: LogType.TEMPERATURE,
          log_date: viewDate,
          value: `${temp}°C`,
          notes: weather.current.description
        });
      }
    } catch (error) {
      console.error('Failed to fetch weather for Mammal:', error);
    } finally {
      setMammalLoadingId(null);
    }
  };

  const handleCellClick = (animalId: string, type: LogType, existingLog?: LogEntry) => {
    setSelectedAnimalId(animalId);
    setLogType(type);
    setEditingLog(existingLog);
    setModalOpen(true);
  };

  if (!view_daily_logs) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4">
        <div className="p-6 bg-rose-50 text-rose-600 rounded-[2rem] border-2 border-rose-100 flex flex-col items-center gap-3 max-w-md text-center">
          <Lock size={48} className="opacity-50" />
          <h2 className="text-xl font-black uppercase tracking-tight">Access Restricted</h2>
          <p className="text-sm font-bold">You do not have permission to view the Daily Logs.</p>
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

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
            <ClipboardList className="text-emerald-600" size={28} /> DAILY OPERATIONS
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Mandatory husbandry logs for {String(viewDate)}</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button type="button" onClick={cycleSort} className="px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:border-emerald-500 transition-all shadow-sm">
                SORT: {String(sortOption).replace('-', ' ')}
            </button>
            <div className="flex items-center bg-white p-1 rounded-xl border-2 border-slate-200 shadow-sm">
                <button type="button" onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() - 1); setViewDate(d.toISOString().split('T')[0]); }} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><ChevronLeft size={20}/></button>
                <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="bg-transparent border-none focus:ring-0 text-slate-900 font-black text-xs w-32 text-center p-0 uppercase tracking-widest outline-none"/>
                <button type="button" onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() + 1); setViewDate(d.toISOString().split('T')[0]); }} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><ChevronRight size={20}/></button>
            </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(Object.values(AnimalCategory) as string[])
          .filter(cat => !['ALL', 'REPTILES', 'INVERTEBRATES', 'AMPHIBIANS'].includes(cat))
          .map((cat) => (
            <button 
              key={String(cat)} 
              type="button" 
              onClick={() => setActiveCategory(cat as AnimalCategory)} 
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 whitespace-nowrap ${activeCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900'}`}
            >
              {cat}
            </button>
        ))}
      </div>

      <div className="space-y-3 pb-24">
        {animals?.map(animal => {
          const logs = {
            weight: getTodayLog(animal.id, LogType.WEIGHT),
            feed: getTodayLog(animal.id, LogType.FEED),
            temp: getTodayLog(animal.id, LogType.TEMPERATURE),
          };

          return (
            <div key={animal.id} className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-6 w-full min-w-0 bg-white p-3 sm:p-5 rounded-[2rem] border-2 border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
              
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full lg:w-1/4 shrink-0">
                <img src={animal.image_url} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-slate-200 hidden sm:block" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight truncate text-xs sm:text-base">{String(animal.name)}</h3>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate mt-0.5">{String(animal.species)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:flex-1 min-w-0">
                
                <button 
                  onClick={() => handleCellClick(animal.id, LogType.WEIGHT, logs.weight)}
                  className="p-2 sm:p-3 rounded-xl border-2 border-dashed border-slate-200 min-w-0 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 flex flex-col lg:flex-row items-center gap-1 sm:gap-2 transition-all"
                >
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WT</span>
                  <span className="w-full text-center truncate px-0.5 text-[10px] sm:text-xs font-black text-slate-900">
                    {logs.weight && logs.weight.weight_grams !== undefined ? formatWeightDisplay(logs.weight.weight_grams, animal.weight_unit) : '--'}
                  </span>
                </button>
                
                {/* STRICT FLEXBOX CONTAINER FOR ENVIRONMENT & BUTTON */}
                <div className="flex gap-1 sm:gap-2 items-stretch min-w-0">
                  <button 
                    onClick={() => handleCellClick(animal.id, LogType.TEMPERATURE, logs.temp)}
                    className="flex-1 p-2 sm:p-3 rounded-xl border-2 border-dashed border-slate-200 min-w-0 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 flex flex-col lg:flex-row items-center justify-center gap-1 sm:gap-2 transition-all bg-white"
                  >
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ENV</span>
                    <span className="w-full text-center truncate px-0.5 text-[10px] sm:text-xs font-black text-slate-900">
                      {isWeatherLoading && !logs.temp && (animal.category === AnimalCategory.OWLS || animal.category === AnimalCategory.RAPTORS) 
                        ? '☁️...' 
                        : mammalLoadingId === animal.id 
                          ? '☁️...' 
                          : logs.temp 
                            ? String(logs.temp.value || '--')
                            : animal.category === AnimalCategory.EXOTICS 
                              ? 'Basking / Cool' 
                              : '--'}
                    </span>
                  </button>
                  
                  {animal.category === AnimalCategory.MAMMALS && !logs.temp && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMammalWeatherFetch(animal.id); }}
                      disabled={mammalLoadingId === animal.id}
                      className="shrink-0 w-10 sm:w-12 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-500 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-all shadow-sm"
                      title="Fetch local weather"
                    >
                      {mammalLoadingId === animal.id ? <Loader2 size={16} className="animate-spin" /> : '☁️'}
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => handleCellClick(animal.id, LogType.FEED, logs.feed)}
                  className="p-2 sm:p-3 rounded-xl border-2 border-dashed border-slate-200 min-w-0 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 flex flex-col lg:flex-row items-center gap-1 sm:gap-2 transition-all"
                >
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FEED</span>
                  <span className="w-full text-center truncate px-0.5 text-[10px] sm:text-xs font-black text-slate-900">
                    {logs.feed ? String(logs.feed.value || '--') : '--'}
                  </span>
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
