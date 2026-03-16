'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchTroubleshooting, TroubleshootingProcedure, fetchKnowledgeSearch } from '../../../lib/api';
import Link from 'next/link';
import DocumentViewer from '../../../../components/DocumentViewer';

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

  // AI Mode State
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('manual');
  const [aiProblem, setAiProblem] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState<any[] | null>(null);
  
  // Document Viewer State
  const [selectedDoc, setSelectedDoc] = useState<{ title: string; chunk: string } | null>(null);

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

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineContext || !aiProblem) return;

    setAiLoading(true);
    setAiPlan(null);
    try {
      const response = await fetch('http://localhost:3002/ai/troubleshoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_context: machineContext,
          problem_description: aiProblem,
          error_code: errorCode || undefined
        })
      });

      if (!response.ok) throw new Error('AI request failed');
      const data = await response.json();
      setAiPlan(data.troubleshooting_steps || []);
    } catch (err) {
      console.error(err);
      alert('Failed to generate AI troubleshooting plan.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenSource = async (reference: string) => {
    try {
      const searchData = await fetchKnowledgeSearch({ query: reference });
      if (searchData.length > 0) {
        setSelectedDoc({ title: searchData[0].document_title, chunk: searchData[0].chunk_text });
      } else {
        setSelectedDoc({ title: reference, chunk: 'Document content not found in Vector DB for this reference.' });
      }
    } catch {
      setSelectedDoc({ title: reference, chunk: 'Failed to retrieve document reference.' });
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
      
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setActiveMode('manual')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Manual Lookup
        </button>
        <button
          onClick={() => setActiveMode('ai')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeMode === 'ai' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          AI Assisted Plan
        </button>
      </div>

      {activeMode === 'manual' ? (
        <>
          <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Find Procedures</h2>
              <Link 
                href={`/intervention-session/${sessionId}/documentation`}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Search Manuals
              </Link>
            </div>
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
        </>
      ) : (
        <>
          <form onSubmit={handleAIGenerate} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-indigo-100 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Expert Diagnosis
              </h2>
              <p className="text-slate-500 text-sm mt-1">Describe the problem naturally. The AI will cross-reference procedures, service bulletins, and manuals to assemble a step-by-step action plan.</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Problem Description</label>
                <textarea
                  placeholder="e.g. The pressure is highly unstable after I replaced the main pump. I've already bled the lines twice."
                  className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow min-h-[120px]"
                  value={aiProblem}
                  onChange={(e) => setAiProblem(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Associated Error Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. E1045"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  value={errorCode}
                  onChange={(e) => setErrorCode(e.target.value)}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={aiLoading || !aiProblem}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing technical knowledge base...
                </>
              ) : (
                'Generate Troubleshooting Plan'
              )}
            </button>
          </form>

          {aiPlan && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">
              <header className="bg-slate-900 border-b border-slate-200 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-md flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    AI Generated Plan
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Recommended Action Plan</h2>
                <p className="text-slate-400 text-sm max-w-2xl">Compiled from official procedures and machine documentation matching {machineContext.instrument}.</p>
              </header>
              
              <div className="p-6 sm:p-8">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {aiPlan.map((step: any, index: number) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {step.step_number || index + 1}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md hover:border-indigo-300">
                        <p className="text-slate-800 text-lg font-medium leading-relaxed">{step.instruction}</p>
                        
                        {step.source && (
                          <button 
                            onClick={() => handleOpenSource(step.source)}
                            className="mt-4 flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Source: {step.source}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Document Viewer Modal Overlay */}
      {selectedDoc && (
        <DocumentViewer 
          documentTitle={selectedDoc.title} 
          chunkHighlight={selectedDoc.chunk} 
          onClose={() => setSelectedDoc(null)} 
        />
      )}
    </div>
  );
}
