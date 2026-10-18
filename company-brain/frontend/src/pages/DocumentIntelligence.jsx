import { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  X,
  AlertTriangle,
  CheckCircle,
  FileX,
  ChevronRight,
  User,
  GitBranch,
  Box,
  Target,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { demoData } from '../mock/data';

const statusBadge = {
  current: {
    bg: 'bg-green-intel/15',
    text: 'text-green-intel',
    border: 'border-green-intel/30',
    label: 'Current',
  },
  superseded: {
    bg: 'bg-amber-tactical/15',
    text: 'text-amber-tactical',
    border: 'border-amber-tactical/30',
    label: 'Superseded (Stale)',
  },
  draft: {
    bg: 'bg-surface-elevated',
    text: 'text-text-muted',
    border: 'border-border-default',
    label: 'Draft',
  },
};

const typeBadge = {
  RFC: 'bg-cyan-analytical/15 text-cyan-analytical border-cyan-analytical/30',
  'Design Doc': 'bg-amber-tactical/15 text-amber-tactical border-amber-tactical/30',
  Plan: 'bg-green-intel/15 text-green-intel border-green-intel/30',
};

export default function DocumentIntelligence() {
  const [selectedDoc, setSelectedDoc] = useState(demoData.documents[1]); // Legacy Auth Design (superseded)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const filteredDocs = useMemo(() => {
    return demoData.documents.filter((doc) => {
      const matchSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  // Find decisions sourced from this document
  const linkedDecisions = useMemo(() => {
    if (!selectedDoc) return [];
    return demoData.decisions.filter((d) => d.source === selectedDoc.title);
  }, [selectedDoc]);

  // Find affected projects
  const affectedProjects = useMemo(() => {
    const projNames = new Set(linkedDecisions.map((d) => d.project));
    return demoData.projects.filter((p) => projNames.has(p.name));
  }, [linkedDecisions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Document Intelligence & Source Provenance
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono font-medium tracking-wide uppercase bg-amber-tactical/15 text-amber-tactical border border-amber-tactical/30 rounded">
              Demo Data
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Audit evidence freshness. Detect when active corporate decisions depend on superseded or stale architectural RFCs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-panel-bg border border-border-default rounded-md pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-intel transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-panel-bg border border-border-default rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-green-intel"
          >
            <option value="all">All Document Statuses</option>
            <option value="current">Current</option>
            <option value="superseded">Superseded</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Document Registry + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table (Left) */}
        <div className="lg:col-span-7 bg-panel-bg border border-border-default rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border-default flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-analytical" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider font-mono">
                Document Registry ({filteredDocs.length})
              </h2>
            </div>
            <span className="text-xs text-text-muted">Edge: SOURCED_FROM</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-default/60 bg-bg-secondary text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3 text-right">Linked Decisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40 text-sm">
                {filteredDocs.map((doc) => {
                  const isSelected = selectedDoc?.title === doc.title;
                  const stat = statusBadge[doc.status] || statusBadge.current;
                  const dCount = demoData.decisions.filter((d) => d.source === doc.title).length;

                  return (
                    <tr
                      key={doc.title}
                      onClick={() => setSelectedDoc(doc)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-elevated border-l-2 border-l-cyan-analytical'
                          : 'hover:bg-surface-elevated/50'
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-text-primary flex items-center gap-2">
                        {doc.status === 'superseded' ? (
                          <FileX className="w-4 h-4 text-amber-tactical flex-shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-green-intel flex-shrink-0" />
                        )}
                        <span className={doc.status === 'superseded' ? 'line-through text-text-muted' : ''}>
                          {doc.title}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${
                            typeBadge[doc.type] || 'bg-surface-elevated text-text-secondary border-border-default'
                          }`}
                        >
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${stat.bg} ${stat.text} ${stat.border}`}
                        >
                          {stat.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-text-secondary text-xs">{doc.owner}</td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-cyan-analytical">
                        {dCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspector (Right) */}
        <div className="lg:col-span-5 bg-panel-bg border border-border-default rounded-lg p-5 space-y-5">
          {selectedDoc ? (
            <>
              <div className="border-b border-border-default pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono border ${
                      typeBadge[selectedDoc.type] || 'bg-surface-elevated'
                    }`}
                  >
                    {selectedDoc.type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono border ${
                      statusBadge[selectedDoc.status]?.bg
                    } ${statusBadge[selectedDoc.status]?.text} ${statusBadge[selectedDoc.status]?.border}`}
                  >
                    {statusBadge[selectedDoc.status]?.label}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-text-primary leading-tight">
                  {selectedDoc.title}
                </h2>
                <p className="text-xs text-text-muted mt-1">Author / Owner: {selectedDoc.owner}</p>
              </div>

              {/* WARNING ALERT IF SUPERSEDED */}
              {selectedDoc.status === 'superseded' && (
                <div className="bg-amber-tactical/10 border border-amber-tactical/40 rounded-lg p-4 space-y-2 text-amber-tactical">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>⚠️ Stale Evidence Warning</span>
                  </div>
                  <p className="text-xs text-amber-tactical/90 leading-relaxed">
                    This document has been marked as <strong>superseded</strong> in the knowledge graph. Decisions referencing this document are based on potentially outdated architecture or legacy specifications.
                  </p>
                </div>
              )}

              {/* Linked Decisions */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-text-muted flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-amber-tactical" />
                    Decisions Sourced From This Document ({linkedDecisions.length})
                  </span>
                  <span className="text-[10px] text-text-muted">Edge: SOURCED_FROM</span>
                </div>

                {linkedDecisions.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => navigate('/decisions')}
                    className="p-3 rounded bg-surface-elevated border border-border-default hover:border-amber-tactical/50 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-cyan-analytical">{d.id}</span>
                      <span className="font-mono text-text-muted">{d.date}</span>
                    </div>
                    <p className="text-xs font-semibold text-text-primary">{d.summary}</p>
                    <div className="flex items-center justify-between text-[11px] text-text-muted pt-1 border-t border-border-default/40">
                      <span>Maker: {d.maker}</span>
                      <span className="text-cyan-analytical font-mono">Project: {d.project}</span>
                    </div>
                  </div>
                ))}

                {linkedDecisions.length === 0 && (
                  <p className="text-xs text-text-muted italic bg-surface-elevated/40 p-3 rounded">
                    No active decisions in the graph currently reference this document directly.
                  </p>
                )}
              </div>

              {/* Provenance Impact Chain */}
              <div className="bg-surface-elevated/60 border border-border-default rounded-md p-3.5 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-green-intel" />
                  Evidence Provenance Path
                </div>

                <div className="flex flex-col gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-text-primary">
                    <FileText className="w-3.5 h-3.5 text-cyan-analytical" />
                    <span>{selectedDoc.title}</span>
                  </div>
                  <div className="pl-4 flex items-center gap-2 text-text-muted">
                    <ArrowRight className="w-3 h-3" />
                    <span className="text-amber-tactical">SOURCED_FROM</span>
                    <span className="text-text-primary">
                      {linkedDecisions.map((d) => d.id).join(', ') || 'No decision'}
                    </span>
                  </div>
                  <div className="pl-8 flex items-center gap-2 text-text-muted">
                    <ArrowRight className="w-3 h-3" />
                    <span className="text-green-intel">AFFECTS</span>
                    <span className="text-text-primary">
                      {affectedProjects.map((p) => p.name).join(', ') || 'No project'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() =>
                  navigate(
                    `/agent?q=${encodeURIComponent(
                      `Which decisions reference superseded documents like ${selectedDoc.title}?`
                    )}`
                  )
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-cyan-analytical/15 text-cyan-analytical border border-cyan-analytical/30 hover:bg-cyan-analytical/20 font-medium text-sm transition-colors"
              >
                <Search className="w-4 h-4" />
                Audit Provenance in Agent Workbench
              </button>
            </>
          ) : (
            <div className="text-center py-12 text-text-muted text-sm">
              Select a document to inspect evidence chain
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
