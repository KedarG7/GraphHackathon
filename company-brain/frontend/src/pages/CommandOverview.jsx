import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Box,
  GitBranch,
  ShieldAlert,
  FileX,
  Network,
  User,
  Send,
  ArrowRight,
} from 'lucide-react';
import { demoData } from '../mock/data';

const suggestedPrompts = [
  'Why did we choose FalkorDB?',
  'Who is responsible for Agent Memory Service?',
  'Show the decision history of Agent Memory Service',
  'Which decisions reference superseded documents?',
  'What are the highest-severity open risks?',
  'What changed after the previous decision?',
];

const activityItems = [
  {
    text: 'Decision D6 supersedes D3',
    icon: GitBranch,
    color: 'text-green-intel',
    time: '2 hours ago',
  },
  {
    text: 'Source document "Legacy Auth Design" marked superseded',
    icon: FileX,
    color: 'text-amber-tactical',
    time: '4 hours ago',
  },
  {
    text: 'Risk R1 identified: SSO on stale auth',
    icon: ShieldAlert,
    color: 'text-red-alert',
    time: '6 hours ago',
  },
  {
    text: 'New project: Agent Memory Service',
    icon: Box,
    color: 'text-cyan-analytical',
    time: '1 day ago',
  },
  {
    text: 'Sarah Chen made decision D1',
    icon: User,
    color: 'text-green-intel',
    time: '2 days ago',
  },
];

export default function CommandOverview() {
  const [question, setQuestion] = useState('');
  const navigate = useNavigate();

  const peopleCount = demoData.people?.length ?? 7;
  const projectCount = demoData.projects?.length ?? 4;
  const decisionCount = demoData.decisions?.length ?? 6;
  const riskCount = demoData.risks?.filter((r) => r.status === 'open')?.length ?? demoData.risks?.length ?? 3;
  const supersededCount = demoData.documents?.filter((d) => d.status === 'superseded')?.length ?? 2;
  const orgEntities = (demoData.graphNodes?.length ?? 30);

  const metrics = [
    { label: 'Total People', value: peopleCount, icon: Users, color: 'text-cyan-analytical', border: 'border-cyan-analytical/20', trend: '+2 this quarter' },
    { label: 'Active Projects', value: projectCount, icon: Box, color: 'text-green-intel', border: 'border-green-intel/20', trend: '1 new this month' },
    { label: 'Recorded Decisions', value: decisionCount, icon: GitBranch, color: 'text-cyan-analytical', border: 'border-cyan-analytical/20', trend: '3 in last 30 days' },
    { label: 'Open Risks', value: riskCount, icon: ShieldAlert, color: 'text-red-alert', border: 'border-red-alert/20', trend: '1 critical severity' },
    { label: 'Superseded Documents', value: supersededCount, icon: FileX, color: 'text-amber-tactical', border: 'border-amber-tactical/20', trend: 'Review recommended' },
    { label: 'Org Entities', value: `${orgEntities}+`, icon: Network, color: 'text-green-intel', border: 'border-green-intel/20', trend: 'Graph-connected' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    navigate('/agent?q=' + encodeURIComponent(question.trim()));
  };

  return (
    <div className="space-y-8">
      {/* Top bar with DEMO badge */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xs font-mono tracking-[0.3em] text-text-muted uppercase mb-1">
            A.S.K / Command Overview
          </h1>
          <p className="text-text-secondary text-sm">
            Investigate decisions. Trace evidence. Understand organizational impact.
          </p>
        </div>
        <span className="shrink-0 ml-4 px-3 py-1 text-[11px] font-mono font-semibold tracking-widest glass-pill-amber uppercase">
          Demo Data
        </span>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className={`glass-card rounded-xl p-4 flex flex-col gap-2 ${m.border}`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${m.color} opacity-80`} />
              </div>
              <span className={`text-3xl font-bold font-mono tracking-tight ${m.color} drop-shadow-[0_0_12px_rgba(93,214,245,0.2)]`}>
                {m.value}
              </span>
              <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide leading-tight">
                {m.label}
              </span>
              <span className="text-[10px] text-text-muted font-mono">{m.trend}</span>
            </div>
          );
        })}
      </div>

      {/* Main content: Investigation + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investigation Launcher — spans 2 cols */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-analytical shadow-[0_0_8px_#5DD6F5]" />
              Quick Investigation
            </h2>

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask A.S.K a question (e.g. Why did we decide D2?)..."
                className="flex-1 glass-input rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all font-sans"
              />
              <button
                type="submit"
                className="px-5 py-3 glass-pill-cyan rounded-lg transition-all flex items-center gap-2 text-sm font-medium hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" />
                Ask
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setQuestion(prompt);
                    navigate('/agent?q=' + encodeURIComponent(prompt));
                  }}
                  className="group flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-text-secondary glass-card rounded-full hover:text-cyan-analytical hover:border-cyan-analytical/40 transition-all cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 transition-opacity text-cyan-analytical" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-intel shadow-[0_0_8px_#6EE7A8]" />
                Recent Activity
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-mono font-semibold tracking-widest glass-pill-amber uppercase">
                Demo Data
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {activityItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg glass-card flex items-start gap-3"
                  >
                    <div className="p-1.5 rounded-md bg-white/[0.04] border border-white/10 shrink-0 mt-0.5">
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary leading-snug truncate">
                        {item.text}
                      </p>
                      <span className="text-[10px] text-text-muted font-mono mt-0.5 block">
                        {item.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
