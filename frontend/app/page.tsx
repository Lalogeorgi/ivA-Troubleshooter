'use client';

import { useEffect, useState } from 'react';
import { Instrument, fetchInstruments } from './lib/api';
import Link from 'next/link';
import {
  Wrench,
  BookOpen,
  ArrowRight,
  Activity,
  Search,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck2,
} from 'lucide-react';

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
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
      {/* Top Banner / Navigation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  ivA-Troubleshooter
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Open Source v1.0
                </span>
              </div>
              <p className="text-slate-600 text-sm mt-0.5">
                AI-native medical device service intelligence, 3D spatial diagnostics & clinical knowledge vault
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vault"
            className="btn-touch-56 px-5 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-sm font-semibold shadow-sm flex items-center gap-2 focus-ring"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Knowledge Vault</span>
          </Link>

          <Link
            href="/workspace"
            className="btn-touch-56 px-6 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/25 flex items-center gap-2 focus-ring"
          >
            <Wrench className="w-4 h-4" />
            <span>FSE Operations Center</span>
          </Link>
        </div>
      </header>

      {/* High-Level Telemetry Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-telemetry text-slate-900">
              {loading ? '-' : instruments.length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Supported Fleets</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-telemetry text-slate-900">25</div>
            <div className="text-xs text-slate-500 font-medium">Vault Entities</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-telemetry text-slate-900">151</div>
            <div className="text-xs text-slate-500 font-medium">Graph Relations</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-telemetry text-slate-900">100%</div>
            <div className="text-xs text-slate-500 font-medium">Grounded Provenance</div>
          </div>
        </div>
      </section>

      {/* Featured Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/workspace"
          className="group p-8 rounded-2xl bg-[#0c1a30] text-white border border-slate-800 shadow-xl hover:border-sky-500/60 transition-all flex flex-col justify-between focus-ring"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 mb-5">
              <Wrench className="w-3.5 h-3.5" />
              <span>ACTIVE FSE INTERVENTION WORKSPACE</span>
            </div>
            <h2 className="text-2xl font-bold group-hover:text-sky-300 transition-colors">
              Field Service Engineer Case Center
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Execute stateful diagnostic decision trees with live physical tolerance checks, multi-step AI reasoning, consequential action approval gates, and authoritative Return-to-Service reports.
            </p>
          </div>
          <div className="mt-8 flex items-center text-sm font-semibold text-sky-400 group-hover:translate-x-1.5 transition-transform">
            <span>Enter Case Operations Center</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </Link>

        <Link
          href="/vault"
          className="group p-8 rounded-2xl bg-[#072421] text-white border border-teal-900/60 shadow-xl hover:border-emerald-500/60 transition-all flex flex-col justify-between focus-ring"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>CLINICAL KNOWLEDGE VAULT</span>
            </div>
            <h2 className="text-2xl font-bold group-hover:text-emerald-300 transition-colors">
              Enterprise Knowledge Graph
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Explore validated medical engineering Markdown entities and relational graph links with bidirectional Obsidian wikilinks, YAML frontmatter, and layout-aware PDF provenance.
            </p>
          </div>
          <div className="mt-8 flex items-center text-sm font-semibold text-emerald-400 group-hover:translate-x-1.5 transition-transform">
            <span>Explore Knowledge Vault</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </Link>
      </div>

      {/* Instrument Fleet Selection */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Supported Diagnostic Equipment</h3>
            <p className="text-xs text-slate-500">
              Select an instrument to inspect subsystem hierarchy, sensor telemetry, and 3D spatial models.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search instruments, models, OEM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus-ring outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInstruments.map((instrument) => (
              <Link
                key={instrument.id}
                href={`/machine-context?instrumentId=${instrument.id}`}
                className="focus-ring rounded-xl"
              >
                <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-sky-500 hover:shadow-md transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider">
                        {instrument.manufacturer}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {instrument.modality || 'Clinical Diagnostic'}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mt-1">{instrument.model}</h4>
                    <p className="text-slate-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {instrument.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-sky-600">
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
