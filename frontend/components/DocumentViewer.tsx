'use client';

import { X, ExternalLink, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DocumentPageDetail, fetchDocumentPage, getDocumentPdfUrl, fetchDocuments } from '../app/lib/api';

interface DocumentViewerProps {
  documentTitle: string;
  chunkHighlight?: string;
  initialPage?: number;
  documentId?: string;
  onClose?: () => void;
}

export default function DocumentViewer({
  documentTitle,
  chunkHighlight = '',
  initialPage = 1,
  documentId: propDocId,
  onClose,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(4);
  const [docId, setDocId] = useState<string | null>(propDocId || null);
  const [pageData, setPageData] = useState<DocumentPageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'provenance' | 'pdf'>('provenance');

  // Locate document ID if not provided directly
  useEffect(() => {
    if (!docId) {
      fetchDocuments()
        .then((docs) => {
          const match = docs.find(
            (d) =>
              d.title.toLowerCase().includes(documentTitle.toLowerCase()) ||
              documentTitle.toLowerCase().includes(d.title.toLowerCase())
          );
          if (match) {
            setDocId(match.id);
            if (match._count && match._count.pages) {
              setTotalPages(match._count.pages);
            }
          }
        })
        .catch(console.error);
    }
  }, [documentTitle, docId]);

  // Load page provenance chunks whenever docId or page changes
  useEffect(() => {
    if (docId) {
      setLoading(true);
      fetchDocumentPage(docId, page)
        .then((data) => {
          setPageData(data);
        })
        .catch((err) => {
          console.error(`Failed to load page ${page}:`, err);
        })
        .finally(() => setLoading(false));
    }
  }, [docId, page]);

  const pdfUrl = docId ? getDocumentPdfUrl(docId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">{documentTitle}</h3>
              <p className="text-xs text-neutral-500 font-medium">
                Layout-Aware Document Intelligence & Provenance Canvas
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex bg-neutral-200 dark:bg-neutral-800 rounded-lg p-0.5 text-xs font-semibold mr-2">
              <button
                onClick={() => setViewMode('provenance')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewMode === 'provenance'
                    ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Layout Provenance
              </button>
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewMode === 'pdf'
                    ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Binary PDF
              </button>
            </div>

            {/* Zoom Controls */}
            {viewMode === 'provenance' && (
              <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 mr-2">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-400 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-3 py-1.5 text-xs font-semibold w-14 text-center tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(1.75, zoom + 0.25))}
                  className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-400 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            {onClose && (
              <button 
                onClick={onClose}
                className="p-2 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Viewer Canvas */}
        <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 overflow-auto p-6 flex justify-center custom-scrollbar">
          {viewMode === 'pdf' && pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-xl border border-neutral-200 dark:border-neutral-800"
              title={documentTitle}
            />
          ) : (
            <div 
              className="bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-800 transition-transform origin-top rounded-xl relative p-8"
              style={{ 
                width: '780px', 
                minHeight: '1000px',
                transform: `scale(${zoom})`,
                marginBottom: `${Math.max(0, (zoom - 1) * 1000)}px`
              }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <span className="text-xs text-neutral-400">Loading page layout structures...</span>
                </div>
              ) : pageData ? (
                <div className="space-y-6">
                  {/* Page header */}
                  <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                        BioMed Service Documentation — Page {pageData.pageNumber}
                      </h4>
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{documentTitle}</p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 rounded border border-neutral-200">
                      {pageData.width} × {pageData.height} pt
                    </span>
                  </div>

                  {/* Render Chunks on Page */}
                  <div className="space-y-4">
                    {pageData.chunks.map((chunk) => {
                      const isHighlighted =
                        chunkHighlight &&
                        (chunk.chunkText.toLowerCase().includes(chunkHighlight.toLowerCase().substring(0, 30)) ||
                          chunkHighlight.toLowerCase().includes(chunk.chunkText.toLowerCase().substring(0, 30)));

                      return (
                        <div
                          key={chunk.id}
                          className={`p-4 rounded-xl border transition relative ${
                            isHighlighted
                              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                              : chunk.chunkType === 'WARNING'
                              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300'
                              : chunk.chunkType === 'TABLE'
                              ? 'bg-slate-50 dark:bg-slate-900 border-slate-300'
                              : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {chunk.chunkType === 'WARNING' && (
                                <AlertTriangle className="w-4 h-4 text-rose-600" />
                              )}
                              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                {chunk.sectionTitle || 'Section Content'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {chunk.boundingBox && (
                                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
                                  [{chunk.boundingBox.x}, {chunk.boundingBox.y}, {chunk.boundingBox.width}×{chunk.boundingBox.height}]
                                </span>
                              )}
                              <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded border border-blue-200">
                                {chunk.chunkType}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs md:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap">
                            {chunk.chunkText}
                          </div>

                          {isHighlighted && (
                            <div className="mt-3 pt-2 border-t border-amber-200 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                              Active Clinical Evidence Match
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-500 text-sm">
                  No layout chunks found for page {page}.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-between items-center text-sm">
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Original PDF
            </a>
          ) : (
            <div />
          )}
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-400 transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-xs text-neutral-600 dark:text-neutral-400 font-mono">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-400 transition-colors disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
