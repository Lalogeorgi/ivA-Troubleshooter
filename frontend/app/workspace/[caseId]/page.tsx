'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Cpu,
  FileText,
  Activity,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Sparkles,
  Layers,
  ArrowLeft,
  Check,
  X,
  Copy,
  Printer,
  Compass,
  CornerDownRight,
  Info,
} from 'lucide-react';
import {
  fetchCase,
  fetchProcedureTree,
  recordCaseStep,
  requestCaseApproval,
  grantCaseApproval,
  updateCaseStatus,
  generateCaseReport,
  runAgentDiagnostic,
  fetchDocuments,
  ServiceCase,
  DiagnosticTree,
  DiagnosticNode,
  AgentDiagnosticResult,
  DocumentSummary,
} from '../../lib/api';
import { DigitalTwinViewer } from '../../../components/DigitalTwinViewer';
import DocumentViewer from '../../../components/DocumentViewer';

export default function CaseWorkspacePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  // Case & Tree State
  const [serviceCase, setServiceCase] = useState<ServiceCase | null>(null);
  const [tree, setTree] = useState<DiagnosticTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stepper State
  const [measurementInput, setMeasurementInput] = useState<string>('');
  const [technicianNotes, setTechnicianNotes] = useState<string>('');
  const [isProcessingStep, setIsProcessingStep] = useState(false);

  // Right Panel Tabs: 'ai' | 'pdf' | 'digital-twin'
  const [activeTab, setActiveTab] = useState<'ai' | 'pdf' | 'digital-twin'>('ai');

  // AI Diagnostic State
  const [agentResult, setAgentResult] = useState<AgentDiagnosticResult | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // PDF Document State
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalApproverName, setApprovalApproverName] = useState('Lead Specialist Karen Diaz');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [copiedReport, setCopiedReport] = useState(false);

  useEffect(() => {
    loadCaseData();
    loadDocuments();
  }, [caseId]);

  async function loadDocuments() {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
      if (docs.length > 0) {
        setSelectedDocId(docs[0].id);
      }
    } catch (err) {
      console.warn('Could not load documents list:', err);
    }
  }

  async function loadCaseData() {
    setLoading(true);
    try {
      const c = await fetchCase(caseId);
      setServiceCase(c);

      if (c.activeProcedureId) {
        const t = await fetchProcedureTree(c.activeProcedureId);
        setTree(t);
      }
    } catch (err: any) {
      console.error('Failed to load case:', err);
      setError(err.message || 'Failed to load case');
    } finally {
      setLoading(false);
    }
  }

  // Find active step node
  const currentNode: DiagnosticNode | undefined =
    tree?.nodes.find((n) => n.key === serviceCase?.currentNodeKey) ||
    tree?.nodes[0];

  // Helper to map active node to 3D mesh node
  const getMeshNodeForCurrentStep = (nodeKey?: string | null): string => {
    if (!nodeKey) return 'PUMP_P102';
    if (nodeKey.includes('PUMP') || nodeKey.includes('SEAL')) return 'PUMP_P102';
    if (nodeKey.includes('SENSOR') || nodeKey.includes('PRESSURE') || nodeKey.includes('ZERO'))
      return 'SENSOR_PS23';
    if (nodeKey.includes('VALVE')) return 'VALVE_V04';
    if (nodeKey.includes('LAMP') || nodeKey.includes('OPTIC')) return 'LAMP_LS01';
    if (nodeKey.includes('FLOWCELL')) return 'FLOWCELL_FC01';
    if (nodeKey.includes('ARM') || nodeKey.includes('ROBOT')) return 'ARM_SAMPLE';
    return 'PUMP_P102';
  };

  // Run AI Diagnostic
  async function handleRunAgent() {
    if (!serviceCase) return;
    setAgentLoading(true);
    try {
      const prompt = `Case ${serviceCase.caseNumber}: Asset ${serviceCase.asset?.serialNumber} reported symptom: "${serviceCase.symptomDescription}". Initial alarm code: ${serviceCase.initialErrorCode || 'None'}. Current step: ${currentNode?.title || 'Initial inspection'}.`;
      const result = await runAgentDiagnostic(prompt, {
        instrumentId: serviceCase.asset?.instrumentId,
      });
      setAgentResult(result);
    } catch (err) {
      console.error('Failed to run agent:', err);
      alert('Error running AI diagnostic agent.');
    } finally {
      setAgentLoading(false);
    }
  }

  // Handle Step Advancement
  async function handleCompleteStep(actionStatus: 'DONE' | 'SKIPPED' | 'FAILED') {
    if (!currentNode) return;
    setIsProcessingStep(true);
    try {
      const updated = await recordCaseStep(caseId, {
        nodeKey: currentNode.key,
        actionStatus,
        notes: technicianNotes || undefined,
      });
      setServiceCase(updated);
      setMeasurementInput('');
      setTechnicianNotes('');
    } catch (err: any) {
      console.error('Failed to record step:', err);
      alert(`Error recording step: ${err.message}`);
    } finally {
      setIsProcessingStep(false);
    }
  }

  async function handleCommitMeasurement() {
    if (!currentNode || measurementInput.trim() === '') return;
    const val = parseFloat(measurementInput);
    if (isNaN(val)) {
      alert('Please enter a valid numeric measurement.');
      return;
    }

    setIsProcessingStep(true);
    try {
      const updated = await recordCaseStep(caseId, {
        nodeKey: currentNode.key,
        measuredValue: val,
        notes: technicianNotes || undefined,
      });
      setServiceCase(updated);
      setMeasurementInput('');
      setTechnicianNotes('');
    } catch (err: any) {
      console.error('Failed to record measurement:', err);
      alert(`Error recording measurement: ${err.message}`);
    } finally {
      setIsProcessingStep(false);
    }
  }

  // Handle Approval Requests
  async function handleRequestApproval() {
    if (!currentNode || !serviceCase) return;
    setIsProcessingStep(true);
    try {
      const actionType = currentNode.recommendedPart ? 'REPLACE_PART' : 'CHANGE_CONFIG';
      const targetEntity = currentNode.recommendedPart
        ? `Spare Part Kit (${currentNode.recommendedPart})`
        : `Calibration Parameter: ${currentNode.title}`;

      await requestCaseApproval(caseId, {
        actionType,
        targetEntity,
        justification: `Step ${currentNode.stepNumber} [${currentNode.title}]: ${currentNode.instruction}`,
      });
      await loadCaseData();
    } catch (err: any) {
      console.error('Failed to request approval:', err);
      alert(`Error requesting approval: ${err.message}`);
    } finally {
      setIsProcessingStep(false);
    }
  }

  async function handleGrantApproval(approvalId: string, decision: 'APPROVE' | 'REJECT') {
    try {
      await grantCaseApproval(approvalId, {
        decision,
        approvedBy: approvalApproverName,
      });
      setShowApprovalModal(false);
      await loadCaseData();
    } catch (err: any) {
      console.error('Failed to grant approval:', err);
      alert(`Error updating approval: ${err.message}`);
    }
  }

  // Generate Service Report
  async function handleGenerateReport() {
    try {
      const res = await generateCaseReport(caseId);
      setReportMarkdown(res.reportMarkdown);
      setShowReportModal(true);
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      alert('Error generating service report.');
    }
  }

  // Tolerance visual helper
  const parsedMeas = parseFloat(measurementInput);
  const hasMeasurementValue = !isNaN(parsedMeas);
  const isInTolerance =
    hasMeasurementValue &&
    currentNode?.nominalMin !== null &&
    currentNode?.nominalMin !== undefined &&
    currentNode?.nominalMax !== null &&
    currentNode?.nominalMax !== undefined
      ? parsedMeas >= currentNode.nominalMin && parsedMeas <= currentNode.nominalMax
      : true;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-cyan-400">
          <Activity className="w-6 h-6 animate-spin" />
          <span className="text-sm font-semibold tracking-wider uppercase font-mono">
            Initializing FSE Case Workspace...
          </span>
        </div>
      </div>
    );
  }

  if (error || !serviceCase) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Service Case Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">{error || 'Could not load service case details.'}</p>
        <Link
          href="/workspace"
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium"
        >
          Return to Operations Center
        </Link>
      </div>
    );
  }

  const pendingApprovals = (serviceCase.approvals || []).filter((a) => a.status === 'PENDING');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Workspace Header */}
      <header className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-0 z-40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/workspace"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Return to Cases"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-cyan-400">
                {serviceCase.caseNumber}
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-semibold text-white text-sm">
                {serviceCase.asset?.instrument?.model || 'Clinical Analyzer'}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                S/N {serviceCase.asset?.serialNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{serviceCase.asset?.site?.name}</span>
              <span className="text-slate-600">•</span>
              <span>FSE: {serviceCase.engineerName} ({serviceCase.engineerId})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Status:</span>
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
              {serviceCase.status.replace('_', ' ')}
            </span>
          </div>

          {/* Pending Approval Alert Button */}
          {pendingApprovals.length > 0 && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold animate-bounce shadow-lg shadow-red-950 transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{pendingApprovals.length} Approval Required</span>
            </button>
          )}

          {/* Report Generation */}
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Field Service Report</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Grid: 3-column on large screens */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column (3 cols): Asset Identity, Telemetry Specs, Step History */}
        <div className="lg:col-span-3 border-r border-slate-800 bg-slate-900/40 p-5 overflow-y-auto space-y-6">
          {/* Asset & Hospital Spec */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 shadow">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Hospital Installation</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block">Facility Name</span>
                <span className="font-medium text-slate-200">{serviceCase.asset?.site?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location</span>
                <span className="text-slate-300">
                  {serviceCase.asset?.site?.city}, {serviceCase.asset?.site?.country}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Hospital Network</span>
                <span className="text-slate-300">{serviceCase.asset?.site?.hospitalSystem || 'Stand-Alone Laboratory'}</span>
              </div>
            </div>
          </div>

          {/* Instrument Technical Spec */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 shadow">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Equipment Telemetry</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Firmware:</span>
                <span className="text-slate-200">{serviceCase.asset?.firmwareVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Modality:</span>
                <span className="text-slate-200">{serviceCase.asset?.instrument?.modality || 'Clinical Chemistry'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subsystems:</span>
                <span className="text-cyan-400 font-sans text-xs">6 Assemblies</span>
              </div>
            </div>
          </div>

          {/* Consumed Spare Parts */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 shadow">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Consumed Spare Parts</span>
              <span className="text-slate-500 text-[10px] font-mono">
                {serviceCase.partsReplaced?.length || 0} items
              </span>
            </div>
            {!serviceCase.partsReplaced || serviceCase.partsReplaced.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No parts consumed yet.</p>
            ) : (
              <ul className="space-y-2 text-xs mt-2">
                {serviceCase.partsReplaced.map((p, idx) => (
                  <li key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200 block">{p.part}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Approved by {p.approvedBy}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Physical Measurements Audit */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 shadow">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Recorded Measurements</span>
              <span className="text-slate-500 text-[10px] font-mono">
                {serviceCase.measurements?.length || 0} checks
              </span>
            </div>
            {!serviceCase.measurements || serviceCase.measurements.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No measurements recorded.</p>
            ) : (
              <div className="space-y-1.5 mt-2">
                {serviceCase.measurements.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-slate-300 block text-[11px] truncate max-w-[150px]">{m.target}</span>
                      <span className="text-slate-400 text-[10px]">
                        {m.measured} {m.unit || ''}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.inTolerance
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {m.inTolerance ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Column (5 cols): Interactive Diagnostic Stepper & Tolerance Engine */}
        <div className="lg:col-span-5 p-6 overflow-y-auto border-r border-slate-800 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Procedure Banner */}
            {tree && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                      Active Diagnostic Protocol
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{tree.title}</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-cyan-300/80 bg-cyan-900/40 px-2 py-0.5 rounded">
                  {tree.nodes.length} Steps Tree
                </span>
              </div>
            )}

            {/* Active Step Card */}
            {currentNode ? (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-xl space-y-5">
                {/* Step Metadata Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Step {currentNode.stepNumber} of {tree?.nodes.length || 8}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {currentNode.nodeType.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-500">{currentNode.key}</span>
                </div>

                {/* Step Title & Instruction */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{currentNode.title}</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">{currentNode.instruction}</p>
                </div>

                {/* Warning Callout */}
                {currentNode.warning && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/50 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wide block">
                        Safety & Compliance Warning
                      </span>
                      <p className="text-xs text-amber-200/90 mt-0.5">{currentNode.warning}</p>
                    </div>
                  </div>
                )}

                {/* Required Tool */}
                {currentNode.requiredTool && (
                  <div className="text-xs text-slate-400 flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Required Tool: <strong className="text-slate-200">{currentNode.requiredTool}</strong></span>
                  </div>
                )}

                {/* Interactive Mode: MEASUREMENT with Tolerance Bar */}
                {currentNode.nodeType === 'MEASUREMENT' && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Physical Measurement: {currentNode.measurementTarget || 'Target'}
                      </label>
                      {currentNode.nominalMin !== null && currentNode.nominalMax !== null && (
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                          Nominal: {currentNode.nominalMin} – {currentNode.nominalMax} {currentNode.unit || ''}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        placeholder={`Enter measured value in ${currentNode.unit || ''}...`}
                        value={measurementInput}
                        onChange={(e) => setMeasurementInput(e.target.value)}
                        className={`w-full px-4 py-3 text-lg font-mono rounded-xl bg-slate-950 border focus:outline-none transition-colors ${
                          hasMeasurementValue
                            ? isInTolerance
                              ? 'border-emerald-500 text-emerald-300'
                              : 'border-red-500 text-red-300'
                            : 'border-slate-700 text-white focus:border-cyan-500'
                        }`}
                      />
                      {hasMeasurementValue && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold font-mono">
                          {isInTolerance ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" /> IN TOLERANCE
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400">
                              <AlertTriangle className="w-4 h-4" /> OUT OF TOLERANCE
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Visual Tolerance Gauge */}
                    {currentNode.nominalMin !== null && currentNode.nominalMax !== null && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>Min: {currentNode.nominalMin}</span>
                          <span className="text-cyan-400">
                            Center: {((currentNode.nominalMin + currentNode.nominalMax) / 2).toFixed(1)} {currentNode.unit}
                          </span>
                          <span>Max: {currentNode.nominalMax}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full relative overflow-hidden">
                          <div className="absolute inset-y-0 left-1/4 right-1/4 bg-emerald-500/30 border-x border-emerald-500/50" />
                          {hasMeasurementValue && (
                            <div
                              className={`absolute top-0 bottom-0 w-2.5 rounded-full ${
                                isInTolerance ? 'bg-emerald-400 shadow-lg shadow-emerald-500' : 'bg-red-500 shadow-lg shadow-red-500'
                              }`}
                              style={{
                                left: `${Math.max(
                                  5,
                                  Math.min(
                                    95,
                                    50 +
                                      ((parsedMeas - (currentNode.nominalMin + currentNode.nominalMax) / 2) /
                                        (currentNode.nominalMax - currentNode.nominalMin)) *
                                        40
                                  )
                                )}%`,
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <input
                        type="text"
                        placeholder="Optional technician notes on this measurement..."
                        value={technicianNotes}
                        onChange={(e) => setTechnicianNotes(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <button
                      onClick={handleCommitMeasurement}
                      disabled={isProcessingStep || !hasMeasurementValue}
                      className="w-full py-3 rounded-xl font-bold text-sm bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 shadow-lg shadow-cyan-950 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isProcessingStep ? 'Evaluating Tolerances...' : 'Evaluate & Commit Measurement'}</span>
                    </button>
                  </div>
                )}

                {/* Interactive Mode: APPROVAL_GATE */}
                {currentNode.nodeType === 'APPROVAL_GATE' && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-600/50 space-y-2">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wide">
                        <ShieldAlert className="w-4 h-4 text-purple-400" />
                        <span>Consequential Action: Human-in-the-Loop Gate</span>
                      </div>
                      <p className="text-xs text-purple-200 leading-relaxed">
                        This operation requires authorized FSE review before proceeding:
                        {currentNode.recommendedPart && (
                          <strong className="block text-white mt-1">
                            Consumes Part: {currentNode.recommendedPart}
                          </strong>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={handleRequestApproval}
                      disabled={isProcessingStep}
                      className="w-full py-3 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 shadow-lg shadow-purple-950 transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Request Human Approval Gate</span>
                    </button>
                  </div>
                )}

                {/* Interactive Mode: SAFETY_CHECK or ACTION */}
                {(currentNode.nodeType === 'SAFETY_CHECK' ||
                  currentNode.nodeType === 'ACTION' ||
                  currentNode.nodeType === 'DECISION' ||
                  currentNode.nodeType === 'REPLACEMENT') && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    <div>
                      <input
                        type="text"
                        placeholder="Optional technician observations or findings..."
                        value={technicianNotes}
                        onChange={(e) => setTechnicianNotes(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCompleteStep('DONE')}
                        disabled={isProcessingStep}
                        className="flex-1 py-3 rounded-xl font-bold text-sm bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 shadow-lg shadow-cyan-950 transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {currentNode.nodeType === 'SAFETY_CHECK'
                            ? 'Acknowledge Safety & Proceed'
                            : 'Complete Action & Advance'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleCompleteStep('SKIPPED')}
                        disabled={isProcessingStep}
                        className="px-4 py-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      >
                        Skip Step
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Diagnostic Protocol Completed</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  All diagnostic and verification steps have executed. The instrument is ready for final sign-off and Return-to-Service report generation.
                </p>
                <button
                  onClick={handleGenerateReport}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950"
                >
                  Generate & Sign Field Service Report
                </button>
              </div>
            )}

            {/* Step History Timeline */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Intervention Audit Timeline</span>
                <span className="font-mono text-[10px] text-slate-500">
                  {serviceCase.stepHistory?.length || 0} executed
                </span>
              </div>

              {!serviceCase.stepHistory || serviceCase.stepHistory.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No steps recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {serviceCase.stepHistory.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200">
                          {idx + 1}. {s.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === 'PASS'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                      {s.measuredValue !== undefined && (
                        <p className="text-[11px] font-mono text-cyan-400">
                          Measured: {s.measuredValue} {s.unit || ''} (Nominal: {s.nominalMin} – {s.nominalMax})
                        </p>
                      )}
                      {s.notes && <p className="text-[11px] text-slate-400 italic">Note: {s.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Multi-Mode Intelligence Inspector (AI Agent / PDF Manual / 3D Digital Twin) */}
        <div className="lg:col-span-4 p-5 overflow-y-auto flex flex-col space-y-4">
          {/* Tab Selector Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Inspector</span>
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pdf'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Service Manual</span>
            </button>
            <button
              onClick={() => setActiveTab('digital-twin')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'digital-twin'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D Twin</span>
            </button>
          </div>

          {/* TAB 1: AI DIAGNOSTIC REASONING INSPECTOR */}
          {activeTab === 'ai' && (
            <div className="space-y-4 flex-1">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Multi-Step Evidence Reasoning
                    </span>
                  </div>
                  <button
                    onClick={handleRunAgent}
                    disabled={agentLoading}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50"
                  >
                    {agentLoading ? 'Reasoning...' : 'Run Analysis'}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Retrieves clinical ground truth, equipment ontology, and active measurements into a multi-step structured diagnostic reasoning trace.
                </p>
              </div>

              {agentResult ? (
                <div className="space-y-3">
                  {/* Facts */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>Documented Facts</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 pl-3 list-disc">
                      {agentResult.facts.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Observations */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Historical Observations</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 pl-3 list-disc">
                      {agentResult.observations.map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Rules */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>Tolerance Rules</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 pl-3 list-disc">
                      {agentResult.rules.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Hypotheses */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span>Differential Hypotheses</span>
                    </div>
                    <div className="space-y-2">
                      {agentResult.hypotheses.map((h, i) => (
                        <div key={i} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-200">{h.hypothesis}</span>
                            <span className="font-mono font-bold text-red-400">
                              {(h.probability * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1.5">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${h.probability * 100}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400">Evidence: {h.evidence.join('; ')}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Action Plan</span>
                    </div>
                    <div className="space-y-1.5">
                      {agentResult.recommendedActions.map((a, i) => (
                        <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs flex items-start gap-2">
                          <CornerDownRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-200 block">{a.action}</span>
                            {a.requiresApproval && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                                Requires Approval Gate
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
                  Click &ldquo;Run Analysis&rdquo; to launch deterministic multi-step diagnostic reasoning on this case.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLINICAL PDF SERVICE MANUAL */}
          {activeTab === 'pdf' && (
            <div className="flex-1 flex flex-col min-h-[500px]">
              {selectedDocId ? (
                <DocumentViewer
                  documentId={selectedDocId}
                  documentTitle="BioMed Analyzer X200 Service Manual"
                  initialPage={1}
                />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No service manual documents loaded in repository.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 3D SPATIAL DIGITAL TWIN */}
          {activeTab === 'digital-twin' && (
            <div className="flex-1 flex flex-col min-h-[500px]">
              <DigitalTwinViewer
                activeMeshNodeId={getMeshNodeForCurrentStep(currentNode?.key)}
              />
            </div>
          )}
        </div>
      </div>

      {/* APPROVAL GATE MODAL */}
      {showApprovalModal && pendingApprovals.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-purple-400">
              <ShieldAlert className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-bold text-white">Consequential Action Authorization</h3>
                <p className="text-xs text-slate-400">Human-in-the-Loop Field Approval Gate</p>
              </div>
            </div>

            <div className="space-y-3">
              {pendingApprovals.map((appr) => (
                <div key={appr.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-purple-300">{appr.actionType}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                      PENDING
                    </span>
                  </div>
                  <h4 className="font-semibold text-white text-sm">{appr.targetEntity}</h4>
                  <p className="text-xs text-slate-300">{appr.justification}</p>

                  <div className="pt-2">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Authorizing Sign-Off Name:
                    </label>
                    <input
                      type="text"
                      value={approvalApproverName}
                      onChange={(e) => setApprovalApproverName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleGrantApproval(appr.id, 'REJECT')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-red-300 border border-slate-700"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleGrantApproval(appr.id, 'APPROVE')}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950"
                    >
                      Grant Authorization
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIELD SERVICE REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Field Service Intervention Report</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(reportMarkdown);
                    setCopiedReport(true);
                    setTimeout(() => setCopiedReport(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{copiedReport ? 'Copied!' : 'Copy Markdown'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto my-4 p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {reportMarkdown}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
              <span>Authoritative Return-to-Service document signed by FSE {serviceCase.engineerName}</span>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
