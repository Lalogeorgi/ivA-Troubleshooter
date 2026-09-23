'use client';

import { useEffect, useState } from 'react';
import { Instrument, fetchInstruments } from './lib/api';
import Link from 'next/link';
import { Wrench, BookOpen, Layers, ShieldCheck, Cpu, ArrowRight, Activity, Search } from 'lucide-react';

export default function HomePage() {
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
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
      {/* Top Banner */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                ivA Service Intelligence
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">
                AI-native medical device field service engineering & diagnostic platform
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vault"
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-sm font-semibold shadow-sm flex items-center gap-2 transition"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Knowledge Vault</span>
          </Link>

          <Link
            href="/workspace"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 flex items-center gap-2 transition"
          >
            <Wrench className="w-4 h-4" />
            <span>FSE Case Operations Center</span>
          </Link>
        </div>
      </header>

      {/* Featured Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/workspace"
          className="group p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl hover:shadow-2xl hover:border-cyan-500/50 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-4">
              <Wrench className="w-3.5 h-3.5" />
              <span>ACTIVE FSE INTERVENTION WORKSPACE</span>
            </div>
            <h2 className="text-2xl font-bold group-hover:text-cyan-300 transition-colors">
              Field Service Engineer Case Center
            </h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Execute stateful diagnostic decision trees with live physical tolerance checks, multi-step AI reasoning, consequential action approval gates, and authoritative Return-to-Service reports.
            </p>
          </div>
          <div className="mt-6 flex items-center text-sm font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
            <span>Enter Case Operations</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </Link>

        <Link
          href="/vault"
          className="group p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 text-white border border-emerald-900/40 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              <span>CLINICAL KNOWLEDGE VAULT</span>
            </div>
            <h2 className="text-2xl font-bold group-hover:text-emerald-300 transition-colors">
              Enterprise Knowledge Graph
            </h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Explore 25 validated medical engineering Markdown entities and 151 typed graph relationships with bidirectional Obsidian wikilinks and layout-aware PDF provenance.
            </p>
          </div>
          <div className="mt-6 flex items-center text-sm font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Explore Knowledge Vault</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </Link>
      </div>

      {/* Instrument Fleet Selection */}
      <div className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Supported Diagnostic Equipment</h3>
            <p className="text-xs text-slate-500">Select an instrument to inspect hardware hierarchy or start legacy intervention.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInstruments.map((instrument) => (
              <Link key={instrument.id} href={`/machine-context?instrumentId=${instrument.id}`}>
                <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
                        {instrument.manufacturer}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {instrument.modality || 'Clinical Diagnostic'}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mt-1">{instrument.model}</h4>
                    <p className="text-slate-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {instrument.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                    <span>Inspect Hierarchy & Subsystems</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
