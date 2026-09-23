'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Activity,
  Building2,
  FileText,
  Search,
  SlidersHorizontal,
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
      const created = await createCase({
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
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/60 text-blue-300 border border-blue-700/50">ARRIVED</span>;
      case 'DIAGNOSING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/60 text-amber-300 border border-amber-700/50 animate-pulse">DIAGNOSING</span>;
      case 'AWAITING_PARTS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/60 text-red-300 border border-red-700/50">AWAITING PARTS</span>;
      case 'REPAIRING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/60 text-purple-300 border border-purple-700/50">REPAIRING</span>;
      case 'VERIFYING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">VERIFYING</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">COMPLETED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                FSE Case Operations Center
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Field Service Engineering active case management & precision diagnostic dispatch
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vault"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Knowledge Vault
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Service Case
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Field Cases</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow">
            <div className="text-xs font-medium text-amber-400 uppercase tracking-wider">In Diagnosis / Repair</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{stats.diagnosing}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow">
            <div className="text-xs font-medium text-red-400 uppercase tracking-wider">Awaiting Parts / Gate</div>
            <div className="text-2xl font-bold text-red-300 mt-1">{stats.awaitingParts}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow">
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Completed / Signed</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.completed}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search case #, serial, hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'DIAGNOSING', 'AWAITING_PARTS', 'REPAIRING', 'VERIFYING', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Case List */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading field cases...</div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400">
            No service cases found matching criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCases.map((c) => (
              <Link
                key={c.id}
                href={`/workspace/${c.id}`}
                className="group flex flex-col justify-between p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all shadow-lg hover:shadow-cyan-950/20"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-semibold text-cyan-400 tracking-wide">
                      {c.caseNumber}
                    </span>
                    {getStatusBadge(c.status)}
                  </div>

                  <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {c.symptomDescription}
                  </h3>

                  {c.initialErrorCode && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-red-950/50 text-red-400 border border-red-800/40">
                      <AlertCircle className="w-3 h-3" />
                      Alarm Code: {c.initialErrorCode}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{c.asset?.site?.name || 'Site unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        Asset: <strong className="text-slate-200">{c.asset?.serialNumber}</strong> ({c.asset?.instrument?.model || 'Clinical Analyzer'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Assigned to: {c.engineerName}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-medium text-cyan-400 group-hover:translate-x-0.5 transition-transform">
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Create Field Service Case</h2>
            <p className="text-xs text-slate-400 mb-5">
              Register an on-site hospital intervention and associate with a clinical instrument.
            </p>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Installed Asset *
                </label>
                <select
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.serialNumber} — {a.instrument?.model} ({a.site?.name || 'Unknown Site'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Engineer ID
                  </label>
                  <input
                    type="text"
                    value={newEngineerId}
                    onChange={(e) => setNewEngineerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Engineer Name
                  </label>
                  <input
                    type="text"
                    value={newEngineerName}
                    onChange={(e) => setNewEngineerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Initial Alarm Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. E1045, E1201"
                  value={newErrorCode}
                  onChange={(e) => setNewErrorCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                </input>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reported Symptom / Problem Description *
                </label>
                <textarea
                  rows={3}
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  placeholder="Describe observed fault, laboratory test interruption, or fluidics error..."
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50"
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
