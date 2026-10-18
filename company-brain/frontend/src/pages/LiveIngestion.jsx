import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, Loader, ArrowRight, Trash2, BookOpen, AlertCircle, Users, FolderKanban, Scale, ShieldAlert, Sparkles } from 'lucide-react';
import { ingestDocument } from '../api/client';

const SAMPLE_NOTES = [
  {
    title: 'Weekly Exec Sync',
    text: 'On 2026-10-20, Priya Nair decided to delay the SOC 2 audit to Q1 2027 due to the current sales push. A new risk R6 (Medium) was raised: enterprise prospects are asking for SOC 2 compliance.',
  },
  {
    title: 'Ad-hoc Exec Call',
    text: 'Marcus Lee decided to add Jessica Park as tech lead on Agent Memory Service. New risk R7 (High): single point of failure if Jessica leaves.',
  },
];

const STEPS = [
  { label: 'Source received & validated', key: 'received' },
  { label: 'Neural graph extraction executing...', key: 'processing' },
  { label: 'FalkorDB MERGE mutations queued', key: 'persisted' },
  { label: 'Persisted to knowledge graph', key: 'complete' },
];

function StepIndicator({ stepIndex, currentStep, done }) {
  const isActive = stepIndex === currentStep;
  const isComplete = stepIndex < currentStep || done;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      isActive
        ? 'glass-card border-cyan-analytical/50 shadow-[0_0_15px_rgba(93,214,245,0.15)] bg-cyan-analytical/10'
        : isComplete
        ? 'glass-card border-green-intel/30 bg-green-intel/10'
        : 'glass-card opacity-40 border-white/5'
    }`}>
      <div className="flex-shrink-0">
        {isComplete ? (
          <CheckCircle size={18} className="text-green-intel shadow-[0_0_8px_#6EE7A8]" />
        ) : isActive ? (
          <Loader size={18} className="text-cyan-analytical animate-spin" />
        ) : (
          <div className="w-[18px] h-[18px] rounded-full border border-white/20" />
        )}
      </div>
      <span className={`text-xs font-mono font-medium ${isComplete ? 'text-green-intel' : isActive ? 'text-cyan-analytical font-semibold' : 'text-text-muted'}`}>
        {STEPS[stepIndex - 1]?.label || 'Processing...'}
      </span>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, count, color }) {
  const colorMap = {
    green: 'glass-pill-green',
    cyan: 'glass-pill-cyan',
    amber: 'glass-pill-amber',
    red: 'glass-pill-red',
  };

  return (
    <div className={`flex items-center gap-3 rounded-xl p-3.5 glass-card border border-white/10 ${colorMap[color] || 'glass-pill-cyan'}`}>
      <div className="p-2 rounded-lg bg-black/20">
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xl font-bold font-mono leading-none">{count}</div>
        <div className="text-[11px] font-mono mt-1 opacity-90 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

export default function LiveIngestion() {
  const navigate = useNavigate();
  const [sourceTitle, setSourceTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);

  const clearForm = useCallback(() => {
    setSourceTitle('');
    setText('');
    setResult(null);
    setError(null);
    setStep(0);
    setLoading(false);
  }, []);

  const fillSample = useCallback((sample) => {
    setSourceTitle(sample.title);
    setText(sample.text);
    setResult(null);
    setError(null);
    setStep(0);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!sourceTitle.trim() || !text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStep(0);

    // Animate steps sequentially
    setStep(1);
    const stepTimers = [];
    stepTimers.push(setTimeout(() => setStep(2), 500));
    stepTimers.push(setTimeout(() => setStep(3), 1200));

    try {
      const res = await ingestDocument(sourceTitle, text);
      // Clear step timers if API responds faster
      stepTimers.forEach(clearTimeout);
      setStep(4);
      setResult(res);
    } catch (err) {
      stepTimers.forEach(clearTimeout);
      setStep(0);
      setError(err?.response?.data?.detail || err?.message || 'Ingestion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sourceTitle, text]);

  const summary = result?.summary || {};
  const ingested = result?.ingested || {};

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Left side - Ingestion Form */}
      <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2">
        {/* Header */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-intel/15 border border-green-intel/30 flex items-center justify-center shadow-[0_0_15px_rgba(110,231,168,0.2)]">
              <Upload size={20} className="text-green-intel" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-text-primary tracking-wide uppercase font-mono">
                  Live Knowledge Ingestion
                </h1>
                <span className="glass-pill-green px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                  FalkorDB MERGE
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Submit corporate text for neural entity extraction and direct knowledge graph persistence.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
          {/* Source Title */}
          <div>
            <label className="block text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Source Title / Context
            </label>
            <input
              type="text"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              placeholder="e.g. Weekly Executive Sync, Architecture RFC-042"
              disabled={loading}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Source Material */}
          <div>
            <label className="block text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Source Material / Unstructured Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste executive meeting notes, decision memos, or architectural text..."
              disabled={loading}
              rows={8}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-y disabled:opacity-50"
              style={{ minHeight: '190px' }}
            />
            <div className="mt-1.5 text-xs text-text-muted font-mono text-right flex items-center justify-end gap-1.5">
              <Sparkles size={12} className="text-cyan-analytical" />
              <span>{text.length} characters ready for extraction</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={clearForm}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button text-text-secondary text-xs font-mono uppercase tracking-wider hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              Clear Form
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !sourceTitle.trim() || !text.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl glass-button-primary text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(110,231,168,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader size={15} className="animate-spin text-green-intel" /> : <Upload size={15} />}
              Extract & Persist to FalkorDB
            </button>
          </div>
        </div>

        {/* Processing Steps */}
        {loading && (
          <div className="glass-panel border border-cyan-analytical/30 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-mono font-bold text-cyan-analytical uppercase tracking-wider flex items-center gap-2">
                <Loader size={14} className="animate-spin" />
                Live Graph Ingestion Pipeline
              </h3>
              <span className="text-[10px] font-mono text-text-muted">Cypher MERGE engine</span>
            </div>
            <div className="space-y-2">
              {STEPS.map((s, i) => (
                <StepIndicator key={s.key} stepIndex={i + 1} currentStep={step} done={step === 4} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-pill-red rounded-2xl p-4 flex items-start gap-3 shadow-[0_0_20px_rgba(255,101,119,0.2)]">
            <AlertCircle size={18} className="text-red-alert flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Ingestion Pipeline Notice</h3>
              <p className="text-xs text-red-alert/90 leading-relaxed font-mono">{error}</p>
            </div>
          </div>
        )}

        {/* Sample Notes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={15} className="text-cyan-analytical" />
            <h3 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">
              Quick Pre-Seeded Meeting Notes
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {SAMPLE_NOTES.map((sample, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-4 border border-white/10 hover:border-cyan-analytical/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} className="text-cyan-analytical" />
                    <h4 className="text-sm font-bold text-text-primary">{sample.title}</h4>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-3">
                    {sample.text}
                  </p>
                </div>
                <button
                  onClick={() => fillSample(sample)}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-cyan-analytical group-hover:text-cyan-analytical/90 transition-colors disabled:opacity-40 self-start"
                >
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  Load Sample
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl glass-card border border-amber-tactical/25 bg-amber-tactical/5">
          <ShieldAlert size={15} className="text-amber-tactical flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-tactical/90 leading-relaxed">
            Entities identified will be permanently merged into FalkorDB graph <span className="font-mono font-bold text-text-primary">company</span> via Cypher idempotency.
          </p>
        </div>
      </div>

      {/* Right side - Results Panel */}
      <div className="w-[390px] flex-shrink-0 flex flex-col">
        <div className="glass-panel-elevated border border-white/10 rounded-2xl p-5 flex-1 flex flex-col shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <h2 className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">
              Extraction Provenance
            </h2>
            <span className="glass-pill-cyan px-2 py-0.5 rounded-full text-[10px] font-mono font-medium">
              Real-Time Graph
            </span>
          </div>

          {result ? (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
              {/* Summary Counts */}
              <div className="grid grid-cols-2 gap-2.5">
                <SummaryCard icon={Users} label="People" count={summary.people || 0} color="cyan" />
                <SummaryCard icon={FolderKanban} label="Projects" count={summary.projects || 0} color="green" />
                <SummaryCard icon={Scale} label="Decisions" count={summary.decisions || 0} color="amber" />
                <SummaryCard icon={ShieldAlert} label="Risks" count={summary.risks || 0} color="red" />
              </div>

              {/* Entity Lists */}
              <div className="space-y-3.5 glass-card p-4 rounded-xl border border-white/5">
                {ingested.people?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider mb-2">People Discovered</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {ingested.people.map((p, i) => (
                        <span key={i} className="glass-pill-cyan px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1.5">
                          <Users size={11} />
                          {typeof p === 'string' ? p : p.name || p.id || JSON.stringify(p)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {ingested.projects?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider mb-2">Projects Attached</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {ingested.projects.map((p, i) => (
                        <span key={i} className="glass-pill-green px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1.5">
                          <FolderKanban size={11} />
                          {typeof p === 'string' ? p : p.name || p.id || JSON.stringify(p)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {ingested.decisions?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider mb-2">Decisions Merged</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {ingested.decisions.map((d, i) => (
                        <span key={i} className="glass-pill-amber px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1.5">
                          <Scale size={11} />
                          {typeof d === 'string' ? d : d.title || d.id || JSON.stringify(d)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {ingested.risks?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider mb-2">Threat Risks Tracked</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {ingested.risks.map((r, i) => (
                        <span key={i} className="glass-pill-red px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1.5">
                          <ShieldAlert size={11} />
                          {typeof r === 'string' ? r : r.title || r.id || JSON.stringify(r)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-auto pt-3">
                <button
                  onClick={() => navigate('/agent')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass-button-primary text-xs font-bold"
                >
                  <span>Investigate in Agent Workbench</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_20px_rgba(93,214,245,0.1)]">
                <FileText size={26} className="text-cyan-analytical/60" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Awaiting Text Input</h3>
              <p className="text-xs text-text-muted leading-relaxed max-w-[240px]">
                Submit source notes on the left or select a sample to observe real-time entity extraction and FalkorDB persistence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


