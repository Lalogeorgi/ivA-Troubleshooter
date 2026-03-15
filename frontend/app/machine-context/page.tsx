'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { 
  Instrument, 
  Module, 
  fetchInstruments, 
  fetchModules, 
  createMachine, 
  createInterventionSession 
} from '../lib/api';

function MachineContextForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const instrumentId = searchParams.get('instrumentId');

  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [serialNumber, setSerialNumber] = useState('');
  const [firmwareVersion, setFirmwareVersion] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [engineerName, setEngineerName] = useState('');

  useEffect(() => {
    if (!instrumentId) return;

    Promise.all([
      fetchInstruments().then(list => list.find(i => i.id === instrumentId)),
      fetchModules()
    ]).then(([inst, modules]) => {
      if (inst) setInstrument(inst);
      setAllModules(modules);
      setLoading(false);
    });
  }, [instrumentId]);

  const handleToggleModule = (id: string) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instrumentId || !serialNumber || !firmwareVersion || !engineerName) return;

    setSubmitting(true);
    try {
      // 1. Create/Update machine
      const machine = await createMachine({
        instrumentId,
        serialNumber,
        firmwareVersion,
        moduleIds: selectedModules
      });

      // 2. Start intervention session
      const session = await createInterventionSession({
        machineId: machine.id,
        engineerName,
      });

      // 3. Store context locally for future use (AI agents phase)
      const context = {
        instrument: instrument?.model,
        serial_number: machine.serialNumber,
        firmware: machine.firmwareVersion,
        modules: machine.modules?.map(m => m.module.name) || [],
        session_id: session.id
      };
      localStorage.setItem('current_intervention_context', JSON.stringify(context));

      // 4. Navigate to success or future AI screen
      alert('Intervention session started successfully!');
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('Failed to start intervention. Please check your data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading context...</div>;
  if (!instrument) return <div className="p-12 text-center text-red-500">Instrument not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="text-blue-600 font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Back to Selection
        </button>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Machine Context</h1>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-slate-600 text-sm">Selected Instrument:</p>
          <p className="text-xl font-bold text-blue-800">{instrument.model}</p>
          <p className="text-blue-600 text-sm">{instrument.manufacturer}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">Serial Number</label>
            <input
              type="text"
              required
              placeholder="e.g. X2-938420"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">Firmware Version</label>
            <input
              type="text"
              required
              placeholder="e.g. 4.2.0"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={firmwareVersion}
              onChange={(e) => setFirmwareVersion(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 block">Engineer Name</label>
          <input
            type="text"
            required
            placeholder="Enter your full name"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={engineerName}
            onChange={(e) => setEngineerName(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 block">Installed Modules</label>
          <div className="grid grid-cols-2 gap-3">
            {allModules.map((module) => (
              <label 
                key={module.id} 
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedModules.includes(module.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedModules.includes(module.id)}
                  onChange={() => handleToggleModule(module.id)}
                />
                <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                  selectedModules.includes(module.id) ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'
                }`}>
                  {selectedModules.includes(module.id) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700">{module.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Session...' : 'Start Intervention'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function MachineContextPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <MachineContextForm />
    </Suspense>
  );
}
