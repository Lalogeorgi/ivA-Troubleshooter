'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { VaultEntityDetail, fetchVaultEntity } from '../../lib/api';
import { ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';

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

export default function VaultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [entity, setEntity] = useState<VaultEntityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchVaultEntity(resolvedParams.id)
      .then(setEntity)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="max-w-lg bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Knowledge Object Not Found</h2>
          <p className="text-slate-500 text-sm mt-2">{error || 'Could not locate this entity in the vault.'}</p>
          <Link
            href="/vault"
            className="btn-touch-56 mt-5 px-6 bg-sky-600 text-white text-sm font-semibold rounded-xl focus-ring"
          >
            Return to Knowledge Vault
          </Link>
        </div>
      </div>
    );
  }

  // Render markdown text and transform [[wikilinks]] into clickable links
  const renderMarkdownWithWikilinks = (content: string) => {
    const parts: React.ReactNode[] = [];
    const linkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(content)) !== null) {
      const preceding = content.substring(lastIndex, match.index);
      if (preceding) parts.push(preceding);

      const target = match[1].trim();
      const alias = match[2] ? match[2].trim() : target;

      parts.push(
        <Link
          key={`${target}-${match.index}`}
          href={`/vault/${encodeURIComponent(target)}`}
          className="inline-flex items-center text-sky-600 hover:text-sky-800 font-semibold underline decoration-sky-300 hover:decoration-sky-600 transition"
        >
          {alias}
        </Link>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Link href="/" className="hover:text-sky-600">
            ivA-Troubleshooter
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/vault" className="hover:text-sky-600">
            Knowledge Vault
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">{entity.title}</span>
        </div>

        {/* Entity Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                    CATEGORY_COLORS[entity.category] || CATEGORY_COLORS.GENERAL
                  }`}
                >
                  {entity.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400 font-mono">{entity.relativePath}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {entity.title}
              </h1>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">ID: {entity.id}</span>
              <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 mt-1 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Obsidian Graph Synced
              </span>
            </div>
          </div>
        </div>

        {/* Frontmatter Properties Card */}
        {Object.keys(entity.frontmatter).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3.5">
              Structured YAML Frontmatter
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(entity.frontmatter).map(([key, val]) => (
                <div key={key} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    {key}
                  </span>
                  <div className="text-sm font-semibold text-slate-900 mt-1 truncate">
                    {Array.isArray(val) ? (
                      <span className="text-xs text-slate-700">{val.join(', ')}</span>
                    ) : typeof val === 'object' && val !== null ? (
                      JSON.stringify(val)
                    ) : (
                      String(val)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Markdown Document Content with Rendered Wikilinks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="prose max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed font-sans text-sm md:text-base">
            {renderMarkdownWithWikilinks(entity.bodyContent)}
          </div>
        </div>

        {/* Relational Knowledge Graph Connections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Outbound Edges */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-sky-600" />
                <span>Outbound Relationships</span>
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">{entity.outboundEdges.length}</span>
            </h3>
            {entity.outboundEdges.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No outbound links from this object.</p>
            ) : (
              <div className="space-y-2">
                {entity.outboundEdges.map((edge) => (
                  <div
                    key={edge.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {edge.relationship}
                      </span>
                      <Link
                        href={`/vault/${encodeURIComponent(edge.targetId)}`}
                        className="ml-2 font-semibold text-slate-900 hover:text-sky-600"
                      >
                        {edge.targetId}
                      </Link>
                    </div>
                    <span className="text-slate-400 text-[10px] font-mono">{edge.targetType}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inbound Edges */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <span>Inbound References</span>
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">{entity.inboundEdges.length}</span>
            </h3>
            {entity.inboundEdges.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No inbound links referencing this object.</p>
            ) : (
              <div className="space-y-2">
                {entity.inboundEdges.map((edge) => (
                  <div
                    key={edge.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {edge.relationship}
                      </span>
                      <Link
                        href={`/vault/${encodeURIComponent(edge.sourceId)}`}
                        className="ml-2 font-semibold text-slate-900 hover:text-sky-600"
                      >
                        {edge.sourceId}
                      </Link>
                    </div>
                    <span className="text-slate-400 text-[10px] font-mono">{edge.sourceType}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
