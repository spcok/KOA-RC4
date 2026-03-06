import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AppProvider } from './context/AppContext';
import { useAuthStore } from './store/authStore';
import LoginScreen from './features/auth/LoginScreen';
import DashboardContainer from './features/dashboard/DashboardContainer';
import WeatherView from './features/dashboard/WeatherView';
import Tasks from './features/husbandry/Tasks';
import DailyLog from './features/husbandry/DailyLog';
import DailyRounds from './features/husbandry/DailyRounds';
import MedicalRecords from './features/medical/MedicalRecords';
import Movements from './features/logistics/Movements';
import Timesheets from './features/staff/Timesheets';
import Holidays from './features/staff/Holidays';
import MissingRecords from './features/compliance/MissingRecords';
import SettingsLayout from './features/settings/SettingsLayout';
import HelpSupport from './features/help/HelpSupport';
import Incidents from './features/safety/tabs/Incidents';
import FirstAidLog from './features/safety/tabs/FirstAid';
import SafetyDrills from './features/safety/tabs/SafetyDrills';
import SiteMaintenance from './features/safety/tabs/SiteMaintenance';
import ReportsDashboard from './features/reports/ReportsDashboard';
import { processSyncQueue, syncInitialData, startRealtimeSubscription } from './lib/syncEngine';

const Placeholder = ({ title, phase }: { title: string, phase: string }) => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-slate-800 mb-4">{title}</h2>
    <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400">
      <p className="text-lg font-black uppercase tracking-widest text-slate-500 mb-2">{phase}</p>
      <p className="text-sm font-medium">Clean room transplant pending...</p>
    </div>
  </div>
);

export default function App() {
  const { initialize, isLoading, session } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (session) {
      // 1. Pull cache
      syncInitialData();
      
      // 2. Start Realtime
      const sub = startRealtimeSubscription();
      
      // 3. Process queue if online
      if (navigator.onLine) {
        processSyncQueue();
      }

      return () => {
        sub.unsubscribe();
      };
    }
  }, [session]);

  // Network Resilience
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network online, processing sync queue...');
      processSyncQueue();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* COMPLETED MILESTONE 1 ROUTES */}
            <Route index element={<DashboardContainer />} />
            <Route path="weather" element={<div className="p-8"><WeatherView /></div>} />
            <Route path="daily-log" element={<DailyLog />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="daily-rounds" element={<DailyRounds />} />

            {/* PHASE 4: MEDICAL & QUARANTINE */}
            <Route path="medical" element={<MedicalRecords />} />
            <Route path="first-aid" element={<FirstAidLog />} />

            {/* PHASE 5: LOGISTICS & SAFETY */}
            <Route path="movements" element={<Movements />} />
            <Route path="flight-records" element={<Placeholder title="Flight Records" phase="Phase 5: Logistics" />} />
            <Route path="maintenance" element={<SiteMaintenance />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="safety-drills" element={<SafetyDrills />} />

            {/* PHASE 6: STAFF & COMPLIANCE */}
            <Route path="timesheets" element={<Timesheets />} />
            <Route path="holidays" element={<Holidays />} />
            <Route path="compliance" element={<MissingRecords />} />
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="missing-records" element={<MissingRecords />} />

            {/* PHASE 7: SETTINGS */}
            <Route path="settings" element={<SettingsLayout />} />
            <Route path="help" element={<HelpSupport />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
