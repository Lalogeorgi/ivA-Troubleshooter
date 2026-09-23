'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  VaultEntitySummary,
  VaultSyncResult,
  fetchVaultEntities,
  syncVault,
} from '../lib/api';

const CATEGORY_COLORS: Record<string, string> = {
  INSTRUMENT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  SUBSYSTEM: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPONENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ERROR_CODE: 'bg-rose-100 text-rose-800 border-rose-200',
  SYMPTOM: 'bg-amber-100 text-amber-800 border-amber-200',
  PROCEDURE: 'bg-purple-100 text-purple-800 border-purple-200',
  SERVICE_BULLETIN: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  FAILURE_MODE: 'bg-orange-100 text-orange-800 border-orange-200',
  SPARE_PART: 'bg-teal-100 text-teal-800 border-teal-200',
  SAFETY_PROTOCOL: 'bg-red-100 text-red-800 border-red-200',
  GENERAL: 'bg-slate-100 text-slate-800 border-slate-200',
};

export default function VaultPage() {
  const [entities, setEntities] = useState<VaultEntitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<VaultSyncResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const loadEntities = async () => {
    setLoading(true);
    try {
      const data = await fetchVaultEntities();
      setEntities(data);
    } catch (err) {
      console.error('Failed to load vault entities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntities();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncVault();
      setSyncResult(res);
      await loadEntities();
    } catch (err) {
      console.error('Failed to sync vault:', err);
    } finally {
      setSyncing(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(entities.map((e) => e.category)))];

  const filteredEntities = entities.filter((e) => {
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.relativePath.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
                &larr; Intervention Hub
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-sm text-slate-500">Knowledge Vault</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Knowledge Vault
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Obsidian-compatible Markdown graph with parsed frontmatter, wikilinks, and PostgreSQL synchronization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {syncing ? 'Synchronizing...' : 'Sync Vault'}
            </button>
          </div>
        </div>

        {/* Sync notification banner */}
        {syncResult && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Sync Complete:</strong> Parsed {syncResult.parsedEntities} markdown files, created{' '}
                <strong>{syncResult.edgesCreated} graph edges</strong> in PostgreSQL.
              </span>
            </div>
            <button
              onClick={() => setSyncResult(null)}
              className="text-xs text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters and search */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search knowledge..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Entities Grid */}
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntities.map((item) => (
              <Link key={item.id} href={`/vault/${encodeURIComponent(item.id)}`}>
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition h-full flex flex-col justify-between cursor-pointer">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          CATEGORY_COLORS[item.category] || CATEGORY_COLORS.GENERAL
                        }`}
                      >
                        {item.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.outboundLinksCount} links
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-800 line-clamp-1">{item.title}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">{item.relativePath}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
                    <span>Inspect Object &rarr;</span>
                    <span className="text-[11px] text-slate-400 font-mono">{item.id}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredEntities.length === 0 && (
          <div className="text-center p-16 bg-white rounded-xl border border-slate-200 mt-6">
            <p className="text-slate-500">No knowledge objects match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
