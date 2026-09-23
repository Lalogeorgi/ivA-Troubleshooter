'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  AlertCircle,
  Clock,
  Plus,
  ArrowRight,
  Activity,
  Building2,
  Search,
  BookOpen,
  X,
} from 'lucide-react';
import {
  fetchCases,
  createCase,
  fetchInstalledAssets,
  ServiceCase,
  InstalledAsset,
} from '../lib/api';

export default function WorkspaceDashboard() {
  const [cases, setCases] = useState<ServiceCase[]>([]);
  const [assets, setAssets] = useState<InstalledAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [newAssetId, setNewAssetId] = useState('');
  const [newEngineerId, setNewEngineerId] = useState('FSE-704');
  const [newEngineerName, setNewEngineerName] = useState('Alex Mercer');
  const [newSymptom, setNewSymptom] = useState('');
  const [newErrorCode, setNewErrorCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [casesData, assetsData] = await Promise.all([
        fetchCases(),
        fetchInstalledAssets(),
      ]);
      setCases(casesData);
      setAssets(assetsData);
      if (assetsData.length > 0) {
        setNewAssetId(assetsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load cases/assets:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCase(e: React.FormEvent) {
    e.preventDefault();
    if (!newAssetId || !newSymptom) return;

    setSubmitting(true);
    try {
      await createCase({
        assetId: newAssetId,
        engineerId: newEngineerId,
        engineerName: newEngineerName,
        symptomDescription: newSymptom,
        initialErrorCode: newErrorCode || undefined,
      });
      setShowCreateModal(false);
      setNewSymptom('');
      setNewErrorCode('');
      await loadData();
    } catch (err) {
      console.error('Failed to create case:', err);
      alert('Error creating case. Please check that asset is valid.');
    } finally {
      setSubmitting(false);
    }
  }

  const filteredCases = cases.filter((c) => {
    const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.asset?.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symptomDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.asset?.site?.name && c.asset.site.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: cases.length,
    diagnosing: cases.filter((c) => c.status === 'DIAGNOSING' || c.status === 'REPAIRING').length,
    awaitingParts: cases.filter((c) => c.status === 'AWAITING_PARTS').length,
    completed: cases.filter((c) => c.status === 'COMPLETED').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ARRIVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-sky-950/80 text-sky-300 border border-sky-700/60">
            ARRIVED
          </span>
        );
      case 'DIAGNOSING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/60">
            DIAGNOSING
          </span>
        );
      case 'AWAITING_PARTS':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60">
            AWAITING PARTS
          </span>
        );
      case 'REPAIRING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-600/60">
            REPAIRING
          </span>
        );
      case 'VERIFYING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
            VERIFYING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/60">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1120] text-slate-100 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#1e2e4a]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/" className="text-xs font-mono font-semibold text-sky-400 hover:underline">
              &larr; ivA-Troubleshooter Home
            </Link>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                FSE Case Operations Center
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Field Service Engineering active interventions & precision diagnostic execution
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vault"
            className="btn-touch-56 px-5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition focus-ring"
          >
            <BookOpen className="w-4 h-4 text-emerald-400 mr-2" />
            <span>Knowledge Vault</span>
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-touch-56 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-lg shadow-sky-600/25 transition focus-ring flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Service Case</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#111c30] border border-[#1e2e4a] shadow-sm">
            <div className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
              Total Field Cases
            </div>
            <div className="text-3xl font-bold font-telemetry text-white mt-1.5">{stats.total}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#111c30] border border-[#1e2e4a] shadow-sm">
            <div className="text-xs font-mono font-medium text-amber-400 uppercase tracking-wider">
              In Diagnosis / Repair
            </div>
            <div className="text-3xl font-bold font-telemetry text-amber-300 mt-1.5">{stats.diagnosing}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#111c30] border border-[#1e2e4a] shadow-sm">
            <div className="text-xs font-mono font-medium text-rose-400 uppercase tracking-wider">
              Awaiting Parts / Gate
            </div>
            <div className="text-3xl font-bold font-telemetry text-rose-300 mt-1.5">{stats.awaitingParts}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#111c30] border border-[#1e2e4a] shadow-sm">
            <div className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
              Completed / Signed
            </div>
            <div className="text-3xl font-bold font-telemetry text-emerald-300 mt-1.5">{stats.completed}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search case #, serial, hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-[#111c30] border border-[#1e2e4a] rounded-xl text-slate-100 placeholder-slate-500 focus-ring outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'DIAGNOSING', 'AWAITING_PARTS', 'REPAIRING', 'VERIFYING', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors whitespace-nowrap focus-ring ${
                  filterStatus === st
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                    : 'bg-[#111c30] text-slate-400 hover:text-slate-200 border border-[#1e2e4a]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Case List */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-3"></div>
            <span>Loading field service cases...</span>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#111c30] border border-[#1e2e4a] text-slate-400">
            No service cases found matching criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCases.map((c) => (
              <Link
                key={c.id}
                href={`/workspace/${c.id}`}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-[#111c30] border border-[#1e2e4a] hover:border-sky-500/60 transition-all shadow-md focus-ring"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="font-mono text-xs font-bold text-sky-400 tracking-wide">
                      {c.caseNumber}
                    </span>
                    {getStatusBadge(c.status)}
                  </div>

                  <h3 className="font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-2 text-base leading-snug">
                    {c.symptomDescription}
                  </h3>

                  {c.initialErrorCode && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-rose-950/60 text-rose-300 border border-rose-800/50">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Alarm Code: {c.initialErrorCode}
                    </div>
                  )}

                  <div className="mt-4 pt-3.5 border-t border-[#1e2e4a] space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.asset?.site?.name || 'Site unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Asset: <strong className="text-slate-200">{c.asset?.serialNumber}</strong> ({c.asset?.instrument?.model || 'Clinical Analyzer'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">FSE: {c.engineerName}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3.5 border-t border-[#1e2e4a] flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Diagnostic Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New Case Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111c30] border border-[#2a3d60] rounded-2xl p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">Create Field Service Case</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Register an on-site intervention and associate with a clinical instrument.
            </p>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Installed Asset *
                </label>
                <select
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 text-sm bg-[#0a1120] border border-[#1e2e4a] rounded-xl text-slate-100 focus-ring outline-none"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.serialNumber} — {a.instrument?.model} ({a.site?.name || 'Unknown Site'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Engineer ID
                  </label>
                  <input
                    type="text"
                    value={newEngineerId}
                    onChange={(e) => setNewEngineerId(e.target.value)}
                    required
                    className="w-full px-3.5 py-3 text-sm bg-[#0a1120] border border-[#1e2e4a] rounded-xl text-slate-100 focus-ring outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Engineer Name
                  </label>
                  <input
                    type="text"
                    value={newEngineerName}
                    onChange={(e) => setNewEngineerName(e.target.value)}
                    required
                    className="w-full px-3.5 py-3 text-sm bg-[#0a1120] border border-[#1e2e4a] rounded-xl text-slate-100 focus-ring outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Initial Alarm Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. E1045, E1201"
                  value={newErrorCode}
                  onChange={(e) => setNewErrorCode(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm bg-[#0a1120] border border-[#1e2e4a] rounded-xl text-slate-100 placeholder-slate-500 focus-ring outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reported Symptom / Problem Description *
                </label>
                <textarea
                  rows={3}
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  placeholder="Describe observed fault, laboratory test interruption, or fluidics error..."
                  required
                  className="w-full px-3.5 py-3 text-sm bg-[#0a1120] border border-[#1e2e4a] rounded-xl text-slate-100 placeholder-slate-500 focus-ring outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e2e4a]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-touch-56 px-5 text-sm rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-touch-56 px-6 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 transition shadow-lg shadow-sky-600/25"
                >
                  {submitting ? 'Creating Case...' : 'Create Service Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
