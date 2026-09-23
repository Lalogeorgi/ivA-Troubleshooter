'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  VaultEntitySummary,
  VaultSyncResult,
  fetchVaultEntities,
  syncVault,
} from '../lib/api';
import { BookOpen, RefreshCw, Search, CheckCircle2 } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  INSTRUMENT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SUBSYSTEM: 'bg-sky-50 text-sky-700 border-sky-200',
  COMPONENT: 'bg-slate-100 text-slate-700 border-slate-300',
  ERROR_CODE: 'bg-rose-50 text-rose-700 border-rose-200',
  SYMPTOM: 'bg-amber-50 text-amber-700 border-amber-200',
  PROCEDURE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SERVICE_BULLETIN: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  FAILURE_MODE: 'bg-orange-50 text-orange-700 border-orange-200',
  SPARE_PART: 'bg-teal-50 text-teal-700 border-teal-200',
  SAFETY_PROTOCOL: 'bg-red-50 text-red-700 border-red-200',
  GENERAL: 'bg-slate-50 text-slate-700 border-slate-200',
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-8 border-b border-slate-200 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/" className="text-xs font-mono font-semibold text-sky-600 hover:underline">
                &larr; ivA-Troubleshooter Home
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono text-slate-500">Clinical Knowledge Vault</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Clinical Knowledge Vault
                </h1>
                <p className="text-slate-600 text-sm mt-0.5">
                  Obsidian-compatible Markdown graph with parsed frontmatter, bidirectional wikilinks, and PostgreSQL synchronization
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-touch-56 px-6 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-md shadow-sky-600/20 flex items-center gap-2 transition disabled:opacity-50 focus-ring"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Synchronizing...' : 'Sync Vault'}</span>
            </button>
          </div>
        </div>

        {/* Sync notification banner */}
        {syncResult && (
          <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Sync Complete:</strong> Parsed <strong>{syncResult.parsedEntities}</strong> markdown files, indexed{' '}
                <strong>{syncResult.edgesCreated} relational graph edges</strong> into PostgreSQL.
              </span>
            </div>
            <button
              onClick={() => setSyncResult(null)}
              className="text-xs font-semibold text-emerald-700 hover:underline px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters and search */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[38px] px-3.5 py-1.5 text-xs font-mono font-semibold rounded-xl border transition focus-ring ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search knowledge entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl shadow-sm focus-ring outline-none"
            />
          </div>
        </div>

        {/* Entities Grid */}
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEntities.map((item) => (
              <Link key={item.id} href={`/vault/${encodeURIComponent(item.id)}`} className="focus-ring rounded-2xl">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-400 hover:shadow-md transition h-full flex flex-col justify-between cursor-pointer">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${
                          CATEGORY_COLORS[item.category] || CATEGORY_COLORS.GENERAL
                        }`}
                      >
                        {item.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono font-medium">
                        {item.outboundLinksCount} links
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 line-clamp-1">{item.title}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">{item.relativePath}</p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-sky-600 font-semibold">
                    <span>Inspect Object &rarr;</span>
                    <span className="text-[11px] text-slate-400 font-mono">{item.id}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredEntities.length === 0 && (
          <div className="text-center p-16 bg-white rounded-2xl border border-slate-200 mt-6">
            <p className="text-slate-500 text-sm">No knowledge objects match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
