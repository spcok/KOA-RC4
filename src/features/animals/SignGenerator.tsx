import React from 'react';
import { X, Printer } from 'lucide-react';
import { Animal, OrgProfile } from '../../types';

interface SignGeneratorProps {
  animal: Animal;
  orgProfile: OrgProfile | null;
  onClose: () => void;
}

const SignGenerator: React.FC<SignGeneratorProps> = ({ animal, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Signage Generator: {animal.name}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="bg-slate-50 p-24 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <Printer size={48} className="mb-4" />
            <p className="text-lg font-medium uppercase tracking-widest">Signage Preview</p>
            <p className="text-sm">This module is part of Phase 3.</p>
          </div>
          <div className="flex justify-end gap-4">
            <button onClick={onClose} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignGenerator;
