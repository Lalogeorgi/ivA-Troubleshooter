'use client';

import { useEffect, useState } from 'react';
import { Instrument, fetchInstruments } from './lib/api';
import Link from 'next/link';

export default function MachineSelectionPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstruments()
      .then(setInstruments)
      .finally(() => setLoading(false));
  }, []);

  const filteredInstruments = instruments.filter(
    (i) =>
      i.model.toLowerCase().includes(search.toLowerCase()) ||
      i.manufacturer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">ivA Troubleshooter</h1>
          <p className="text-slate-600">Select an instrument to start an intervention.</p>
        </div>
        <div>
          <Link
            href="/vault"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Knowledge Vault
          </Link>
        </div>
      </header>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search instruments (model or manufacturer)..."
          className="w-full p-4 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInstruments.map((instrument) => (
            <Link key={instrument.id} href={`/machine-context?instrumentId=${instrument.id}`}>
              <div className="card h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{instrument.model}</h2>
                  <p className="text-blue-600 font-medium">{instrument.manufacturer}</p>
                  <p className="text-slate-500 mt-2 text-sm line-clamp-2">
                    {instrument.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-blue-600 font-semibold">
                  Select Instrument
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredInstruments.length === 0 && (
        <div className="text-center p-12 bg-slate-100 rounded-xl">
          <p className="text-slate-500">No instruments found matching your search.</p>
        </div>
      )}
    </div>
  );
}
