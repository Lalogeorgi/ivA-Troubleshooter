'use client';

import { useState, useEffect } from 'react';
import { fetchKnowledgeSearch, SearchResult } from '../../../lib/api';
import Link from 'next/link';
import { FileText, Search, Loader2, BookOpen, ChevronRight } from 'lucide-react';
import { useParams } from 'next/navigation';
import DocumentViewer from '../../../../components/DocumentViewer';

export default function DocumentationSearchPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [machineContext, setMachineContext] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Viewer state
  const [selectedDoc, setSelectedDoc] = useState<{ title: string; chunk: string } | null>(null);

  useEffect(() => {
    const savedContext = localStorage.getItem('current_intervention_context') || localStorage.getItem('machineContext');
    if (savedContext) {
      setMachineContext(JSON.parse(savedContext));
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchData = await fetchKnowledgeSearch({
        query,
        instrument_id: machineContext?.instrument_id || undefined,
      });
      setResults(searchData);
    } catch (err: any) {
      setError(err.message || 'Failed to search documentation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Documentation Search
          </h1>
          {machineContext && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Context: {machineContext.instrument_id} (FW: {machineContext.firmware})
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/intervention-session/${sessionId}/troubleshooting`}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-lg text-sm font-medium transition-colors"
          >
            Switch to Troubleshooting
          </Link>
          <Link
            href="/"
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors"
          >
            Exit Session
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <form onSubmit={handleSearch} className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <label htmlFor="query" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Describe the issue or topic to search across manuals and bulletins
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. pressure unstable after pump replacement"
              className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Search Results
          </h2>
          {results.length === 0 && !isLoading && !error && query && (
             <p className="text-neutral-500 italic">No exact matches found. Try different keywords.</p>
          )}

          <div className="grid gap-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 group hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                      {result.document_type.replace('_', ' ')}
                    </span>
                    <h3 className="font-semibold text-lg">{result.document_title}</h3>
                  </div>
                  <div className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-1 rounded-md font-medium">
                    {(result.similarity_score * 100).toFixed(0)}% Match
                  </div>
                </div>
                
                <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-4 line-clamp-3">
                  "...{result.chunk_text}..."
                </p>

                <div className="flex justify-end pt-3 border-t border-neutral-100 dark:border-neutral-700">
                  <button 
                    onClick={() => setSelectedDoc({ title: result.document_title, chunk: result.chunk_text })}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    View Document <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Document Viewer Modal Overlay */}
      {selectedDoc && (
        <DocumentViewer 
          documentTitle={selectedDoc.title} 
          chunkHighlight={selectedDoc.chunk} 
          onClose={() => setSelectedDoc(null)} 
        />
      )}
    </div>
  );
}
