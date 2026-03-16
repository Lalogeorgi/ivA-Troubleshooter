'use client';

import { X, ExternalLink, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface DocumentViewerProps {
  documentTitle: string;
  chunkHighlight: string;
  onClose: () => void;
}

export default function DocumentViewer({ documentTitle, chunkHighlight, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(1);

  // In a real implementation this might fetch the original binary file from S3 or use react-pdf.
  // For Phase 3, we mock the viewer displaying the extracted text chunk since the system only stores vector chunks and extracts.
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">{documentTitle}</h3>
              <p className="text-xs text-neutral-500 font-medium">Document Viewer View</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 mr-4">
              <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-400 transition-colors">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-xs font-semibold w-16 text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={() => setZoom(Math.min(2, zoom + 0.25))} className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-400 transition-colors">
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Canvas */}
        <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 overflow-auto p-8 flex justify-center custom-scrollbar">
          <div 
            className="bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 transition-transform origin-top"
            style={{ 
              width: '800px', 
              minHeight: '1050px',
              transform: `scale(${zoom})`,
              marginBottom: `${Math.max(0, (zoom - 1) * 1050)}px`
            }}
          >
            <div className="p-12 prose dark:prose-invert max-w-none">
              <div className="mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <h1 className="text-3xl font-bold font-serif mb-2">{documentTitle}</h1>
                <p className="text-neutral-500 text-sm">Automated Extracted Content</p>
              </div>
              
              <div className="text-sm border-l-4 border-amber-400 pl-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 mt-8 mb-8">
                <strong>Highlighted Search Match:</strong>
                <p className="mt-2 font-mono text-sm leading-relaxed whitespace-pre-wrap">{chunkHighlight}</p>
              </div>

              <div className="text-neutral-400 italic text-sm mt-12 text-center">
                (Full document text rendering requires cloud storage integration in Phase 4)
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-between items-center text-sm">
          <button className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md font-medium transition-colors">
            <ExternalLink className="w-4 h-4" />
            Open Original File
          </button>
          
          <div className="flex items-center gap-4">
            <button className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-600 transition-colors disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-neutral-600 dark:text-neutral-400">Page {page} of 1</span>
            <button className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-600 transition-colors disabled:opacity-50" disabled>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
