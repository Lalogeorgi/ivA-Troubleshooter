'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { VaultEntityDetail, fetchVaultEntity } from '../../lib/api';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-800">Knowledge Object Not Found</h2>
          <p className="text-slate-500 mt-2">{error || 'Could not locate this entity in the vault.'}</p>
          <Link href="/vault" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg">
            Back to Vault
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
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300 hover:decoration-blue-600 transition"
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
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600">Intervention Hub</Link>
          <span>/</span>
          <Link href="/vault" className="hover:text-blue-600">Knowledge Vault</Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">{entity.title}</span>
        </div>

        {/* Entity Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    CATEGORY_COLORS[entity.category] || CATEGORY_COLORS.GENERAL
                  }`}
                >
                  {entity.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400 font-mono">{entity.relativePath}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{entity.title}</h1>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">ID: {entity.id}</span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 mt-1 inline-block">
                Obsidian Synced
              </span>
            </div>
          </div>
        </div>

        {/* Frontmatter Properties Card */}
        {Object.keys(entity.frontmatter).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              YAML Frontmatter Attributes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(entity.frontmatter).map(([key, val]) => (
                <div key={key} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <span className="text-[11px] font-mono font-medium text-slate-500 uppercase">{key}</span>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
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
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
              <span>Outbound Connections</span>
              <span className="text-xs font-mono text-slate-400">{entity.outboundEdges.length}</span>
            </h3>
            {entity.outboundEdges.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No outbound links from this object.</p>
            ) : (
              <div className="space-y-2">
                {entity.outboundEdges.map((edge) => (
                  <div
                    key={edge.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        {edge.relationship}
                      </span>
                      <Link
                        href={`/vault/${encodeURIComponent(edge.targetId)}`}
                        className="ml-2 font-semibold text-slate-800 hover:text-blue-600"
                      >
                        {edge.targetId}
                      </Link>
                    </div>
                    <span className="text-slate-400 text-[10px]">{edge.targetType}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inbound Edges */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
              <span>Referenced By (Inbound)</span>
              <span className="text-xs font-mono text-slate-400">{entity.inboundEdges.length}</span>
            </h3>
            {entity.inboundEdges.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No inbound links referencing this object.</p>
            ) : (
              <div className="space-y-2">
                {entity.inboundEdges.map((edge) => (
                  <div
                    key={edge.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {edge.relationship}
                      </span>
                      <Link
                        href={`/vault/${encodeURIComponent(edge.sourceId)}`}
                        className="ml-2 font-semibold text-slate-800 hover:text-blue-600"
                      >
                        {edge.sourceId}
                      </Link>
                    </div>
                    <span className="text-slate-400 text-[10px]">{edge.sourceType}</span>
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
