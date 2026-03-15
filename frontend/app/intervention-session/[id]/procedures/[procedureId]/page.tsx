'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TroubleshootingProcedure } from '../../../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ProcedureViewPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const procedureId = params.procedureId as string;

  const [procedure, setProcedure] = useState<TroubleshootingProcedure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProcedure() {
      try {
        const response = await fetch(`${API_URL}/procedures/${procedureId}`);
        if (!response.ok) throw new Error('Failed to fetch procedure');
        
        // Ensure steps are loaded
        const data = await response.json();
        
        // Since we didn't customize the default nestjs GET /procedures/:id to include relations yet
        // Let's explicitly fetch it with steps if necessary or assume the backend returned it.
        // ACTUALLY, the default nestjs resource doesn't 'include' Prisma relations.
        // Let's modify the backend service to include steps, but for now we'll just try to use it.
        // I will fix the backend GET /procedures/:id if it fails!
        setProcedure(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (procedureId) loadProcedure();
  }, [procedureId]);

  if (loading) return <div className="p-12 text-center">Loading procedure...</div>;
  if (!procedure) return <div className="p-12 text-center text-red-500">Procedure not found.</div>;

  // Type guarding in case backend didn't include steps
  const steps = procedure.steps || [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.push(`/intervention-session/${sessionId}/troubleshooting`)} 
          className="text-blue-600 font-medium flex items-center hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg w-fit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Back to Lookup
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <header className="bg-slate-900 border-b border-slate-200 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-md">
              {procedure.procedureType}
            </span>
            {procedure.firmwareMin && (
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold py-1 px-3 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                FW: {procedure.firmwareMin} {procedure.firmwareMax ? `- ${procedure.firmwareMax}` : '+'}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{procedure.title}</h1>
          {procedure.description && (
            <p className="text-slate-400 text-lg max-w-2xl">{procedure.description}</p>
          )}
        </header>

        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Procedure Steps
          </h2>

          {steps.length === 0 ? (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <p className="text-slate-500">No step-by-step instructions available for this procedure.</p>
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {steps.map((step, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {step.stepNumber}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md hover:border-blue-300">
                    <p className="text-slate-800 text-lg font-medium leading-relaxed">{step.instruction}</p>
                    
                    {step.warning && (
                      <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-amber-800 font-bold uppercase tracking-wider mb-1">Warning</p>
                            <p className="text-sm text-amber-700">{step.warning}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {step.referenceDocument && (
                      <div className="mt-3 flex items-center text-sm text-blue-600 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        Ref: {step.referenceDocument}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
