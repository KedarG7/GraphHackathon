import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send,
  Copy,
  Terminal,
  Search,
  MessageSquare,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { askAgent } from '../api/client';
import { DEMO_QUERY_FIXTURES } from '../mock/demoQueries';

/* ─── Example question chips ─── */
const EXAMPLE_QUESTIONS = [
  'Why did we decide D2?',
  'Who is responsible for Agent Memory Service?',
  'Show the decision history of Agent Memory Service',
  'Which decisions reference superseded documents?',
  'What are the highest-severity open risks?',
  'What changed after the previous decision?',
];

/* ─── Helpers ─── */
function statusColor(status) {
  if (!status) return 'text-text-muted';
  const s = status.toLowerCase();
  if (s.includes('verified') || s.includes('fresh') || s.includes('ok') || s.includes('good'))
    return 'text-green-intel';
  if (s.includes('stale') || s.includes('warning') || s.includes('partial'))
    return 'text-amber-tactical';
  if (s.includes('missing') || s.includes('error') || s.includes('critical'))
    return 'text-red-alert';
  return 'text-cyan-analytical';
}

function statusBg(status) {
  if (!status) return 'bg-surface-elevated text-text-muted';
  const s = status.toLowerCase();
  if (s.includes('verified') || s.includes('fresh') || s.includes('ok') || s.includes('good'))
    return 'bg-green-intel/10 text-green-intel';
  if (s.includes('stale') || s.includes('warning') || s.includes('partial'))
    return 'bg-amber-tactical/10 text-amber-tactical';
  if (s.includes('missing') || s.includes('error') || s.includes('critical'))
    return 'bg-red-alert/10 text-red-alert';
  return 'bg-cyan-analytical/10 text-cyan-analytical';
}

/* ─── Skeleton Pulse ─── */
function SkeletonPulse() {
  return (
    <div className="animate-pulse space-y-4 mt-6">
      <div className="h-4 bg-surface-elevated rounded w-3/4" />
      <div className="h-4 bg-surface-elevated rounded w-full" />
      <div className="h-4 bg-surface-elevated rounded w-5/6" />
      <div className="h-3 bg-surface-elevated rounded w-1/2 mt-6" />
      <div className="flex gap-2 mt-2">
        <div className="h-6 w-20 bg-surface-elevated rounded-full" />
        <div className="h-6 w-24 bg-surface-elevated rounded-full" />
        <div className="h-6 w-16 bg-surface-elevated rounded-full" />
      </div>
      <div className="h-3 bg-surface-elevated rounded w-1/3 mt-6" />
      <div className="h-20 bg-surface-elevated rounded mt-2" />
    </div>
  );
}

/* ─── Copy Button ─── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* silent */
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-cyan-analytical transition-colors"
    >
      {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ══════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════ */
export default function AgentWorkbench() {
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const answerEndRef = useRef(null);
  const hasAutoSubmitted = useRef(false);

  /* ─── Auto-submit from URL ?q= ─── */
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      submitQuestion(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ─── Scroll answer into view ─── */
  useEffect(() => {
    if (answerEndRef.current) {
      answerEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentIndex, questions]);

  /* ─── Submit handler ─── */
  const submitQuestion = useCallback(
    async (questionText) => {
      const q = (questionText || inputValue).trim();
      if (!q) return;

      const idx = questions.length;
      const entry = { question: q, answer: null, evidence: null, loading: true, error: null };

      setQuestions((prev) => [...prev, entry]);
      setCurrentIndex(idx);
      setInputValue('');

      try {
        const res = await askAgent(q);
        setQuestions((prev) =>
          prev.map((item, i) =>
            i === idx
              ? {
                  ...item,
                  answer: res.answer || res.response || JSON.stringify(res),
                  evidence: res.evidence || null,
                  loading: false,
                }
              : item
          )
        );
      } catch (err) {
        const demoMatch =
          DEMO_QUERY_FIXTURES[q] ||
          Object.entries(DEMO_QUERY_FIXTURES).find(
            ([k]) => q.toLowerCase().includes(k.toLowerCase().slice(0, 15))
          )?.[1];

        if (demoMatch) {
          setQuestions((prev) =>
            prev.map((item, i) =>
              i === idx
                ? {
                    ...item,
                    answer: demoMatch.answer,
                    evidence: demoMatch.evidence,
                    loading: false,
                    isDemoFallback: true,
                    apiError: err.message,
                  }
                : item
            )
          );
        } else {
          setQuestions((prev) =>
            prev.map((item, i) =>
              i === idx ? { ...item, loading: false, error: err.message || 'Request failed' } : item
            )
          );
        }
      }
    },
    [inputValue, questions.length]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuestion();
    }
  };

  const current = currentIndex >= 0 ? questions[currentIndex] : null;

  /* ══════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════ */
  return (
    <div className="flex h-[calc(100vh-110px)] rounded-xl overflow-hidden glass-panel border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      {/* ─── LEFT: Investigation History ─── */}
      <aside className="w-64 shrink-0 border-r border-white/10 bg-black/25 backdrop-blur-md flex flex-col">
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-[10px] font-semibold tracking-[0.15em] text-text-muted uppercase flex items-center gap-2">
            <MessageSquare size={12} className="text-cyan-analytical" />
            Investigation History
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
          {questions.length === 0 && (
            <p className="px-4 py-6 text-xs text-text-muted text-center leading-relaxed">
              No investigations yet. Ask a question to begin.
            </p>
          )}
          {questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-full text-left px-4 py-2.5 text-xs transition-all group
                ${
                  idx === currentIndex
                    ? 'bg-white/[0.08] border-l-2 border-green-intel text-text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]'
                    : 'border-l-2 border-transparent text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
                }`}
            >
              <div className="flex items-start gap-2">
                <ChevronRight
                  size={10}
                  className={`mt-0.5 shrink-0 transition-transform ${
                    idx === currentIndex ? 'text-green-intel rotate-90' : 'text-text-muted'
                  }`}
                />
                <span className="line-clamp-2 leading-relaxed">{q.question}</span>
              </div>
              {q.loading && (
                <span className="ml-4 mt-1 block text-[10px] text-amber-tactical animate-pulse">
                  Processing…
                </span>
              )}
              {q.error && (
                <span className="ml-4 mt-1 block text-[10px] text-red-alert">Failed</span>
              )}
            </button>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-[10px] text-text-muted font-mono">
            {questions.length} investigation{questions.length !== 1 ? 's' : ''} this session
          </p>
        </div>
      </aside>

      {/* ─── CENTER: Composer + Answer ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black/10">
        {/* Composer */}
        <div className="shrink-0 border-b border-white/10 bg-white/[0.02] backdrop-blur-md p-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <Search
                size={16}
                className="absolute left-4 text-text-muted pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={current?.loading}
                placeholder="Ask a question about your organization (e.g. Why did we decide D2?)..."
                className="w-full pl-11 pr-14 py-3.5 glass-input rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all font-sans"
              />
              <button
                onClick={() => submitQuestion()}
                disabled={!inputValue.trim() || current?.loading}
                className="absolute right-2 p-2 rounded-md
                           bg-cyan-analytical/10 text-cyan-analytical
                           hover:bg-cyan-analytical/20
                           disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>

            {/* Example chips */}
            {questions.length === 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {EXAMPLE_QUESTIONS.map((eq) => (
                  <button
                    key={eq}
                    onClick={() => {
                      setInputValue(eq);
                      submitQuestion(eq);
                    }}
                    className="px-3 py-1.5 text-[11px] rounded-full border border-border-default
                               text-text-secondary hover:text-text-primary hover:border-cyan-analytical/40
                               hover:bg-cyan-analytical/5 transition-colors"
                  >
                    {eq}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Answer area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {!current && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="w-14 h-14 rounded-xl bg-surface-elevated flex items-center justify-center mb-4">
                  <Terminal size={24} className="text-cyan-analytical" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Agent Workbench</h3>
                <p className="text-sm text-text-secondary max-w-md leading-relaxed">
                  Ask questions about your organization's structure, decisions, risks, and
                  relationships. The agent queries the knowledge graph and returns evidence-backed
                  answers.
                </p>
              </div>
            )}

            {current?.loading && <SkeletonPulse />}

            {current?.error && (
              <div className="mt-6 p-4 rounded-lg bg-red-alert/10 border border-red-alert/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-red-alert" />
                  <span className="text-xs font-semibold text-red-alert uppercase tracking-wide">
                    Error
                  </span>
                </div>
                <p className="text-sm text-red-alert/90">{current.error}</p>
              </div>
            )}

            {current && !current.loading && !current.error && current.answer && (
              <div className="mt-2 space-y-6">
                {/* Question echo */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-cyan-analytical/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare size={14} className="text-cyan-analytical" />
                  </div>
                  <p className="text-sm text-text-secondary pt-1 leading-relaxed">
                    {current.question}
                  </p>
                </div>

                {/* Answer Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-semibold tracking-[0.15em] text-green-intel uppercase flex items-center gap-2">
                      <CheckCircle size={11} />
                      Answer
                    </h4>
                    {current.isDemoFallback && (
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-tactical/15 text-amber-tactical border border-amber-tactical/30 rounded" title={current.apiError}>
                        Demo Mode • Graph Seed Fixture
                      </span>
                    )}
                  </div>
                  <div className="glass-panel-elevated rounded-xl p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    {current.answer.split('\n').map((line, i) => {
                      const hasWarning =
                        line.includes('⚠️') ||
                        line.toLowerCase().includes('warning');
                      return (
                        <p
                          key={i}
                          className={`text-sm leading-relaxed mb-2 last:mb-0 ${
                            hasWarning
                              ? 'glass-pill-amber px-4 py-2.5 rounded-lg border border-amber-tactical/30'
                              : 'text-text-primary'
                          }`}
                        >
                          {line || '\u00A0'}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Evidence Chain */}
                {current.evidence?.nodes && current.evidence.nodes.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold tracking-[0.15em] text-cyan-analytical uppercase mb-3 flex items-center gap-2">
                      <Search size={11} />
                      Evidence Chain
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {current.evidence.nodes.map((node, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                     glass-pill-cyan text-xs font-medium font-mono"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-analytical shadow-[0_0_6px_#5DD6F5]" />
                          {typeof node === 'string' ? node : node.name || node.label || JSON.stringify(node)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source Status */}
                {current.evidence?.source_status && (
                  <div>
                    <h4 className="text-[10px] font-semibold tracking-[0.15em] text-text-muted uppercase mb-3">
                      Source Status
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium ${
                        current.evidence.source_status === 'superseded'
                          ? 'glass-pill-amber'
                          : 'glass-pill-green'
                      }`}
                    >
                      {current.evidence.source_status}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div ref={answerEndRef} />
          </div>
        </div>
      </main>

      {/* ─── RIGHT: Evidence Inspector ─── */}
      <aside className="w-80 shrink-0 border-l border-white/10 bg-black/25 backdrop-blur-md flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-[10px] font-semibold tracking-[0.15em] text-text-muted uppercase flex items-center gap-2">
            <Terminal size={12} className="text-cyan-analytical" />
            Evidence Inspector
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!current || !current.evidence ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Search size={20} className="text-text-muted mb-3" />
              <p className="text-xs text-text-muted leading-relaxed">
                Submit a question to see evidence here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Tool Used */}
              {current.evidence.tool && (
                <div>
                  <label className="text-[10px] font-semibold tracking-[0.15em] text-text-muted uppercase block mb-1.5">
                    Tool Used
                  </label>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-elevated text-xs font-mono text-cyan-analytical">
                    <Terminal size={10} />
                    {current.evidence.tool}
                  </span>
                </div>
              )}

              {/* Selected By */}
              {current.evidence.selected_by && (
                <div>
                  <label className="text-[10px] font-semibold tracking-[0.15em] text-text-muted uppercase block mb-1.5">
                    Selected By
                  </label>
                  <p className="text-xs text-text-secondary">{current.evidence.selected_by}</p>
                </div>
              )}

              {/* Arguments */}
              {current.evidence.args && (
                <div>
                  <label className="text-[10px] font-semibold tracking-[0.15em] text-text-muted uppercase block mb-1.5">
                    Arguments
                  </label>
                  <pre className="bg-panel-bg border border-border-default rounded-md p-3 text-[11px] font-mono text-text-secondary overflow-x-auto leading-relaxed">
                    {JSON.stringify(current.evidence.args, null, 2)}
                  </pre>
                </div>
              )}

              {/* Cypher Query */}
              {current.evidence.cypher && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-semibold tracking-[0.15em] text-text-muted uppercase">
                      Cypher Query
                    </label>
                    <CopyButton text={current.evidence.cypher} />
                  </div>
                  <pre className="bg-panel-bg border border-border-default rounded-md p-3 text-[11px] font-mono text-green-intel overflow-x-auto leading-relaxed whitespace-pre-wrap">
                    {current.evidence.cypher}
                  </pre>
                </div>
              )}

              {/* Graph Nodes */}
              {current.evidence.nodes && current.evidence.nodes.length > 0 && (
                <div>
                  <label className="text-[10px] font-semibold tracking-[0.15em] text-text-muted uppercase block mb-1.5">
                    Graph Nodes
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {current.evidence.nodes.map((node, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-surface-elevated text-[10px] font-mono text-text-secondary"
                      >
                        {typeof node === 'string' ? node : node.name || node.label || JSON.stringify(node)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Status */}
              {current.evidence.source_status && (
                <div>
                  <label className="text-[10px] font-semibold tracking-[0.15em] text-text-muted uppercase block mb-1.5">
                    Source Status
                  </label>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusBg(
                      current.evidence.source_status
                    )}`}
                  >
                    {current.evidence.source_status.toLowerCase().includes('verified') ||
                    current.evidence.source_status.toLowerCase().includes('fresh') ? (
                      <CheckCircle size={10} />
                    ) : (
                      <AlertTriangle size={10} />
                    )}
                    {current.evidence.source_status}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
