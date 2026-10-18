import { useState } from 'react';
import {
  X,
  ShieldAlert,
  GitBranch,
  FileText,
  AlertTriangle,
  ExternalLink,
  Target,
  User,
  Box,
  Copy,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { demoData } from '../mock/data';

export default function EvidenceDrawer({ onClose }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopyCypher = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleCypher = `MATCH (d:Decision {id: 'D2'})-[:MADE_BY]->(p:Person)
OPTIONAL MATCH (d)-[:SOURCED_FROM]->(doc:Document)
OPTIONAL MATCH (d)-[:AFFECTS]->(proj:Project)-[:SUPPORTS]->(g:Goal)
RETURN p.name, doc.title, doc.status, proj.name, g.name`;

  return (
    <aside className="fixed inset-y-0 right-0 w-96 glass-panel-elevated border-l border-white/10 shadow-[-12px_0_40px_rgba(0,0,0,0.6)] z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-analytical drop-shadow-[0_0_8px_rgba(93,214,245,0.4)]">
            Investigation Inspector
          </span>
          <h2 className="text-sm font-bold text-text-primary">Evidence & Context Drawer</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-white/10"
          title="Close Drawer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* Active Provenance Trail */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-amber-tactical" />
            Decision Provenance Trail (Sample: D2)
          </div>
          <div className="glass-card rounded-md p-3.5 space-y-2 font-mono">
            <div className="text-text-primary font-bold">Decision D2</div>
            <div className="text-text-muted">"Keep legacy auth for enterprise SSO"</div>
            <div className="text-green-intel text-[11px]">→ MADE_BY: Sarah Chen (CTO)</div>
            <div className="text-cyan-analytical text-[11px]">→ AFFECTS: Enterprise Sales Playbook</div>
            <div className="text-amber-tactical text-[11px]">→ SOURCED_FROM: Legacy Auth Design (superseded)</div>
            <div className="text-green-intel text-[11px]">→ SUPPORTS: Grow enterprise ARR to $20M</div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-tactical/10 border border-amber-tactical/40 rounded-lg p-3.5 space-y-2 text-amber-tactical">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Superseded Source Detected</span>
          </div>
          <p className="text-[11px] text-amber-tactical/90 leading-relaxed">
            The supporting document <strong>"Legacy Auth Design"</strong> has been marked as <em>superseded</em> in the graph. Any decision relying on this evidence should be reviewed for currency.
          </p>
        </div>

        {/* Grounding Cypher Query */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
            <span className="uppercase tracking-wider">Grounding Cypher Query</span>
            <button
              onClick={() => handleCopyCypher(sampleCypher)}
              className="flex items-center gap-1 text-cyan-analytical hover:underline font-mono text-[10px]"
            >
              {copied ? <Check size={12} className="text-green-intel" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-3 bg-bg-primary border border-border-default rounded-md font-mono text-[11px] text-text-secondary overflow-x-auto leading-relaxed">
            {sampleCypher}
          </pre>
        </div>

        {/* Quick Entity Links */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
            Connected Graph Entities
          </span>
          <div className="space-y-1.5 font-mono">
            <button
              onClick={() => {
                navigate('/decisions');
                onClose();
              }}
              className="w-full p-2 rounded bg-surface-elevated/70 border border-border-default hover:border-cyan-analytical flex items-center justify-between text-left text-text-primary transition-colors"
            >
              <span>D2: Enterprise SSO</span>
              <span className="text-[10px] text-cyan-analytical">Decision</span>
            </button>
            <button
              onClick={() => {
                navigate('/people');
                onClose();
              }}
              className="w-full p-2 rounded bg-surface-elevated/70 border border-border-default hover:border-cyan-analytical flex items-center justify-between text-left text-text-primary transition-colors"
            >
              <span>Sarah Chen (CTO)</span>
              <span className="text-[10px] text-green-intel">Person</span>
            </button>
            <button
              onClick={() => {
                navigate('/projects');
                onClose();
              }}
              className="w-full p-2 rounded bg-surface-elevated/70 border border-border-default hover:border-cyan-analytical flex items-center justify-between text-left text-text-primary transition-colors"
            >
              <span>Enterprise Sales Playbook</span>
              <span className="text-[10px] text-cyan-analytical">Project</span>
            </button>
            <button
              onClick={() => {
                navigate('/risks');
                onClose();
              }}
              className="w-full p-2 rounded bg-surface-elevated/70 border border-border-default hover:border-red-alert flex items-center justify-between text-left text-text-primary transition-colors"
            >
              <span>R1: Stale Auth Exposure</span>
              <span className="text-[10px] text-red-alert">High Risk</span>
            </button>
          </div>
        </div>

        {/* Confidence Statement */}
        <div className="p-3 bg-surface-elevated/40 border border-border-default rounded text-[11px] text-text-muted leading-relaxed">
          <strong className="text-text-primary block mb-0.5">Evidence Before Conclusions</strong>
          All reasoning chains are validated directly against FalkorDB relationship graphs before presentation. No ungrounded conclusions are synthesized.
        </div>
      </div>
    </aside>
  );
}
