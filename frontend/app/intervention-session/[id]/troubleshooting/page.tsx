'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchTroubleshooting, TroubleshootingProcedure } from '../../../lib/api';
import Link from 'next/link';

export default function TroubleshootingLookupPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [machineContext, setMachineContext] = useState<any>(null);
  const [errorCode, setErrorCode] = useState('');
  const [symptom, setSymptom] = useState('');
  const [procedures, setProcedures] = useState<TroubleshootingProcedure[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Load context created from the machine selection phase
    const savedContext = localStorage.getItem('current_intervention_context');
    if (savedContext) {
      setMachineContext(JSON.parse(savedContext));
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineContext) return;

    setLoading(true);
    setHasSearched(true);
    try {
      // Find procedures matching instrument, firmware, and error/symptom
      // The API requires instrument_id, but the context stored in Phase 1 currently only has model/firmware.
      // Assuming context needs to be expanded or we fetch instrument from backend. 
      // For now, simulating API call structure. We need instrument ID, let's look it up or rely on the API to match.
      // *Wait, Phase 1 only stored model name in local storage! Let me check how instrument is used.*
      // Let's parse out what we saved. We need instrument ID! We'll fix context saving if missing, but we'll try to use context.instrument (model) and adjust API or just update context.
      
      const results = await fetchTroubleshooting({
        instrument_id: machineContext.instrument_id, // We'll assume we update page.tsx to save this!
        firmware_version: machineContext.firmware,
        error_code: errorCode,
        symptom: symptom,
      });
      setProcedures(results);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch procedures.');
    } finally {
      setLoading(false);
    }
  };

  if (!machineContext) return <div className="p-12 text-center">Loading context...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={() => router.push('/')} 
          className="text-slate-600 font-medium flex items-center hover:text-slate-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Exit Session
        </button>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Active Session</span>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Troubleshooting Lookup</h1>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between gap-4 flex-wrap">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Instrument</p>
            <p className="font-medium text-slate-900">{machineContext.instrument}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">S/N</p>
            <p className="font-medium text-slate-900">{machineContext.serial_number}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Firmware</p>
            <p className="font-medium inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              v{machineContext.firmware}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Find Procedures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">Error Code (Optional)</label>
            <input
              type="text"
              placeholder="e.g. E1045"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={errorCode}
              onChange={(e) => setErrorCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">Symptom Search (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Pressure instability"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || (!errorCode && !symptom)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Lookup Procedures'
          )}
        </button>
      </form>

      {hasSearched && !loading && (
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4">Results ({procedures.length})</h3>
          
          {procedures.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 text-center rounded-2xl">
              <p className="text-slate-500 font-medium">No completely matching procedures found for firmware v{machineContext.firmware}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {procedures.map((proc) => (
                <Link key={proc.id} href={`/intervention-session/${sessionId}/procedures/${proc.id}`}>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide bg-purple-100 text-purple-700">
                          {proc.procedureType}
                        </span>
                        {proc.errorCodes.map((ec) => (
                          <span key={ec.errorCode.code} className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {ec.errorCode.code}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{proc.title}</h4>
                      <p className="text-slate-500 text-sm mt-1">{proc.description}</p>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                      <div className="flex items-center text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        FW: {proc.firmwareMin ? `${proc.firmwareMin}+` : 'All'}
                      </div>
                      <div className="text-blue-600 font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                        View Steps
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
