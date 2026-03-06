import React, { useState } from 'react';
import { 
  CalendarDays, 
  ListOrdered, 
  CheckSquare, 
  AlertTriangle, 
  ArrowRightLeft, 
  Download,
  Loader2,
  FileText,
  ChevronRight,
  Calendar,
  Layers,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as exportService from './utils/docxExportService';

interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  exportFn: () => Promise<boolean>;
  columns: string[];
  totalRecords: number;
}

const REPORTS: ReportDefinition[] = [
  {
    id: 'husbandry',
    title: 'DAILY HUSBANDRY LOG',
    description: 'Export daily feeding, cleaning, and observation records.',
    icon: CalendarDays,
    exportFn: exportService.exportHusbandryDocx,
    columns: ['ANIMAL', 'TIME', 'WEIGHT', 'FEED', 'ACTIVITY / NOTES', 'STAFF'],
    totalRecords: 13
  },
  {
    id: 'census',
    title: 'ANNUAL CENSUS',
    description: 'Complete inventory of all animals currently on site.',
    icon: ListOrdered,
    exportFn: exportService.exportCensusDocx,
    columns: ['ANIMAL', 'SPECIES', 'SEX', 'LOCATION', 'STATUS', 'ID'],
    totalRecords: 42
  },
  {
    id: 'stocklist',
    title: 'STOCK LIST (SECTION 9)',
    description: 'Acquisition, disposition, and internal transfer records.',
    icon: ArrowRightLeft,
    exportFn: exportService.exportMovementsDocx,
    columns: ['DATE', 'ANIMAL', 'TYPE', 'SOURCE', 'DESTINATION', 'STAFF'],
    totalRecords: 8
  },
  {
    id: 'rounds',
    title: 'ROUNDS CHECKLIST',
    description: 'Verification of completed daily operational rounds.',
    icon: CheckSquare,
    exportFn: exportService.exportRoundsDocx,
    columns: ['ROUND', 'TIME', 'STATUS', 'CHECKED BY', 'NOTES'],
    totalRecords: 24
  },
  {
    id: 'incidents',
    title: 'INCIDENT LOG',
    description: 'Log of recorded operational and safety incidents.',
    icon: AlertTriangle,
    exportFn: exportService.exportIncidentsDocx,
    columns: ['DATE', 'TITLE', 'SEVERITY', 'LOCATION', 'STAFF'],
    totalRecords: 3
  },
  {
    id: 'weight',
    title: 'WEIGHT HISTORY',
    description: 'Historical weight records for all animals.',
    icon: Scale,
    exportFn: async () => { await new Promise(r => setTimeout(r, 1000)); return true; },
    columns: ['DATE', 'ANIMAL', 'WEIGHT', 'CHANGE', 'STAFF'],
    totalRecords: 156
  }
];

const MOCK_DATA: Record<string, Record<string, string>[]> = {
  husbandry: [
    { animal: 'Yorkley', time: '13:00', weight: '-', feed: '-', notes: 'Temperature: 12.8°C (Statutory 13:00 Telemetry Sync)', staff: 'SYS' },
    { animal: 'Azula', time: '13:00', weight: '-', feed: '-', notes: 'Temperature: 12.8°C (Statutory 13:00 Telemetry Sync)', staff: 'SYS' },
    { animal: 'Kermit', time: '13:00', weight: '-', feed: '-', notes: 'Temperature: 12.8°C (Statutory 13:00 Telemetry Sync)', staff: 'SYS' },
    { animal: 'Teacup', time: '13:00', weight: '-', feed: '-', notes: 'Temperature: 12.8°C (Statutory 13:00 Telemetry Sync)', staff: 'SYS' },
    { animal: 'Lenny', time: '13:00', weight: '-', feed: '-', notes: 'Temperature: 12.8°C (Statutory 13:00 Telemetry Sync)', staff: 'SYS' },
  ],
  census: [
    { animal: 'Yorkley', species: 'European Eagle Owl', sex: 'Male', location: 'Aviary 1', status: 'Active', id: 'EEO-001' },
    { animal: 'Azula', species: 'Peregrine Falcon', sex: 'Female', location: 'Aviary 4', status: 'Active', id: 'PF-002' },
    { animal: 'Kermit', species: 'Tawny Frogmouth', sex: 'Unknown', location: 'Aviary 2', status: 'Active', id: 'TF-003' },
    { animal: 'Teacup', species: 'Little Owl', sex: 'Female', location: 'Aviary 3', status: 'Active', id: 'LO-004' },
    { animal: 'Lenny', species: 'Barn Owl', sex: 'Male', location: 'Aviary 5', status: 'Active', id: 'BO-005' },
  ],
  stocklist: [
    { date: '2026-03-01', animal: 'Yorkley', type: 'Internal', source: 'Aviary 1', destination: 'Hospital', staff: 'JC' },
    { date: '2026-02-15', animal: 'Teacup', type: 'Acquisition', source: 'External', destination: 'Quarantine', staff: 'SYS' },
    { date: '2026-02-10', animal: 'Azula', type: 'Internal', source: 'Aviary 4', destination: 'Display Area', staff: 'JC' },
  ],
  rounds: [
    { round: 'Morning Check', time: '08:30', status: 'Complete', checkedBy: 'JC', notes: 'All birds present and correct' },
    { round: 'Feeding', time: '13:00', status: 'Complete', checkedBy: 'SYS', notes: 'Telemetry sync successful' },
    { round: 'Evening Check', time: '17:30', status: 'Pending', checkedBy: '-', notes: '-' },
  ],
  incidents: [
    { date: '2026-02-20', title: 'Minor Scratch', severity: 'Low', location: 'Aviary 1', staff: 'JC' },
    { date: '2026-01-15', title: 'Enclosure Lock Issue', severity: 'Medium', location: 'Aviary 3', staff: 'SYS' },
  ],
  weight: [
    { date: '2026-03-04', animal: 'Yorkley', weight: '1850g', change: '+20g', staff: 'JC' },
    { date: '2026-03-04', animal: 'Azula', weight: '980g', change: '-5g', staff: 'SYS' },
    { date: '2026-03-03', animal: 'Kermit', weight: '450g', change: '0g', staff: 'JC' },
  ]
};

const SECTIONS = ['ALL SECTIONS', 'OWLS', 'RAPTORS', 'MAMMALS', 'REPTILES', 'EXOTICS'];

export default function ReportsDashboard() {
  const [activeReportId, setActiveReportId] = useState('husbandry');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('2026-03-04');
  const [endDate, setEndDate] = useState('2026-03-04');
  const [selectedSection, setSelectedSection] = useState('ALL SECTIONS');
  const [isSectionOpen, setIsSectionOpen] = useState(false);

  const activeReport = REPORTS.find(r => r.id === activeReportId) || REPORTS[0];
  const previewData = MOCK_DATA[activeReportId] || [];

  const handleExport = async () => {
    setGeneratingId(activeReport.id);
    try {
      await activeReport.exportFn();
    } catch (error) {
      console.error(`Failed to export ${activeReport.title}:`, error);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-700" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">REPORTS</h2>
          </div>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">SELECT REPORT TYPE</p>
        </div>

        <nav className="flex-grow p-4 space-y-3 overflow-y-auto">
          {REPORTS.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReportId(report.id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 group relative ${
                activeReportId === report.id 
                  ? 'text-white z-10' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'
              }`}
            >
              {activeReportId === report.id && (
                <motion.div 
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-slate-900 rounded-xl shadow-xl shadow-slate-200 -z-10"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`text-xs font-black tracking-wide uppercase ${activeReportId === report.id ? 'text-white' : 'text-slate-500'}`}>
                {report.title}
              </span>
              {activeReportId === report.id && (
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            {/* Date Range Picker */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer"
              />
              <span className="text-slate-300">—</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer"
              />
              <Calendar className="w-4 h-4 text-slate-400 ml-1" />
            </div>

            {/* Section Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsSectionOpen(!isSectionOpen)}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-100 transition-colors"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{selectedSection}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSectionOpen ? 'rotate-[-90deg]' : 'rotate-90'}`} />
              </button>

              <AnimatePresence>
                {isSectionOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsSectionOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 overflow-hidden"
                    >
                      {SECTIONS.map(section => (
                        <button
                          key={section}
                          onClick={() => {
                            setSelectedSection(section);
                            setIsSectionOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3 text-xs font-black uppercase tracking-wide transition-colors ${
                            selectedSection === section ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {section}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={generatingId !== null}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-lg font-black text-sm tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            {generatingId ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            EXPORT WORD
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-grow p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeReportId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden"
            >
              {/* Report Header */}
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">
                    {activeReport.title}
                  </h2>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    KENT OWL ACADEMY • 4 MAR
                  </p>
                </div>
                <div className="bg-slate-50 px-6 py-2 rounded-full border border-slate-200 shadow-sm">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    {activeReport.totalRecords} RECORDS
                  </span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/30">
                      {activeReport.columns.map((col, idx) => (
                        <th key={idx} className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        {Object.values(row).map((val: string, vIdx) => (
                          <td key={vIdx} className={`px-10 py-6 text-sm whitespace-nowrap ${vIdx === 0 ? 'font-bold text-slate-800' : 'text-slate-500'} ${vIdx === activeReport.columns.length - 1 ? 'font-black text-slate-400' : ''}`}>
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State / More Data Info */}
              <div className="p-10 bg-slate-50/50 text-center border-t border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  SHOWING FIRST {previewData.length} RECORDS. EXPORT TO VIEW FULL REPORT.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
