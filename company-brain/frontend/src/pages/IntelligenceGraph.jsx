import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Handle, Position } from '@xyflow/react';
import {
  User,
  Box,
  GitBranch,
  Target,
  ShieldAlert,
  FileText,
  Search,
  Filter,
  Maximize,
  RotateCcw,
  X,
  ExternalLink,
  Database,
  Layers,
} from 'lucide-react';
import { demoData } from '../mock/data';

/* ─── Node type config ─── */
const NODE_CONFIG = {
  person: { icon: User, borderColor: 'border-l-[#5DD6F5]', dotColor: 'bg-cyan-analytical', label: 'Person', glow: 'shadow-[0_0_15px_rgba(93,214,245,0.2)]' },
  project: { icon: Box, borderColor: 'border-l-[#6EE7A8]', dotColor: 'bg-green-intel', label: 'Project', glow: 'shadow-[0_0_15px_rgba(110,231,168,0.2)]' },
  decision: { icon: GitBranch, borderColor: 'border-l-[#F2B84B]', dotColor: 'bg-amber-tactical', label: 'Decision', glow: 'shadow-[0_0_15px_rgba(242,184,75,0.2)]' },
  goal: { icon: Target, borderColor: 'border-l-[#6EE7A8]', dotColor: 'bg-green-intel', label: 'Goal', glow: 'shadow-[0_0_15px_rgba(110,231,168,0.2)]' },
  risk: { icon: ShieldAlert, borderColor: 'border-l-[#FF6577]', dotColor: 'bg-red-alert', label: 'Risk', glow: 'shadow-[0_0_15px_rgba(255,101,119,0.2)]' },
  document: { icon: FileText, borderColor: 'border-l-[#5DD6F5]', dotColor: 'bg-cyan-analytical', label: 'Document', glow: 'shadow-[0_0_15px_rgba(93,214,245,0.2)]' },
};

/* ─── Custom Graph Node ─── */
function GraphNode({ data, selected }) {
  const config = NODE_CONFIG[data.type] || NODE_CONFIG.person;
  const Icon = config.icon;

  const subInfo = data.role || data.status || data.severity || null;

  return (
    <div
      className={`
        relative glass-card border-l-[3.5px] ${config.borderColor}
        rounded-xl px-3.5 py-2.5 min-w-[150px] max-w-[220px]
        transition-all duration-300
        ${selected ? `ring-2 ring-cyan-analytical/80 ${config.glow}` : 'hover:scale-[1.02]'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-border-default !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-border-default !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Left} className="!bg-border-default !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-border-default !w-2 !h-2 !border-0" />

      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-white/5 border border-white/10 shrink-0">
          <Icon size={13} className="text-text-primary" />
        </div>
        <span className="text-text-primary text-xs font-semibold leading-tight truncate">
          {data.label}
        </span>
      </div>
      {subInfo && (
        <div className="mt-1.5 text-[10px] text-text-muted font-mono truncate pl-[26px]">
          {subInfo}
        </div>
      )}
    </div>
  );
}

/* ─── Node Types Registration ─── */
const nodeTypes = {
  person: GraphNode,
  project: GraphNode,
  decision: GraphNode,
  goal: GraphNode,
  risk: GraphNode,
  document: GraphNode,
};

/* ─── Process edges with styling ─── */
function processEdges(rawEdges) {
  return rawEdges.map((edge) => ({
    ...edge,
    animated: edge.label === 'SUPERSEDES',
    style: { stroke: '#263342', strokeWidth: 1.5 },
    labelStyle: { fill: '#94A3B5', fontSize: 9, fontFamily: 'monospace', fontWeight: 500 },
    labelBgStyle: { fill: '#111923', fillOpacity: 0.9 },
    labelBgPadding: [4, 2],
    markerEnd: { type: MarkerType.ArrowClosed, color: '#263342', width: 14, height: 14 },
  }));
}

/* ─── Prepare initial data ─── */
function prepareNodes(rawNodes) {
  return rawNodes.map((node) => ({
    ...node,
    data: { ...node.data, type: node.type },
  }));
}

/* ─── Main Component ─── */
export default function IntelligenceGraph() {
  const navigate = useNavigate();
  const initialNodes = useMemo(() => prepareNodes(demoData.graphNodes), []);
  const initialEdges = useMemo(() => processEdges(demoData.graphEdges), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    person: true,
    project: true,
    decision: true,
    goal: true,
    risk: true,
    document: true,
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  /* Toggle filter */
  const toggleFilter = useCallback((type) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  /* Reset */
  const handleReset = useCallback(() => {
    setSearch('');
    setFilters({ person: true, project: true, decision: true, goal: true, risk: true, document: true });
    setSelectedNode(null);
    setNodes(prepareNodes(demoData.graphNodes));
    setEdges(processEdges(demoData.graphEdges));
    if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2 });
  }, [reactFlowInstance, setNodes, setEdges]);

  /* Fit view */
  const handleFitView = useCallback(() => {
    if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
  }, [reactFlowInstance]);

  /* Node click */
  const onNodeClick = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  /* Pane click - deselect */
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  /* Filtered and highlighted nodes */
  const displayNodes = useMemo(() => {
    const searchLower = search.toLowerCase();
    return nodes
      .filter((node) => filters[node.type])
      .map((node) => ({
        ...node,
        style: {
          ...node.style,
          opacity: search && !node.data.label.toLowerCase().includes(searchLower) ? 0.2 : 1,
          transition: 'opacity 0.3s ease',
        },
      }));
  }, [nodes, filters, search]);

  /* Filtered edges (hide edges for hidden nodes) */
  const displayEdges = useMemo(() => {
    const visibleNodeIds = new Set(displayNodes.map((n) => n.id));
    return edges.filter(
      (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, displayNodes]);

  /* Counts */
  const nodeCount = displayNodes.length;
  const edgeCount = displayEdges.length;

  /* Active filter count */
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const totalFilterCount = Object.keys(filters).length;

  const handleInvestigateNode = () => {
    if (!selectedNode) return;
    const label = selectedNode.data.label;
    const type = selectedNode.type;
    if (type === 'decision') {
      navigate(`/agent?q=${encodeURIComponent(`Why did we decide ${label}?`)}`);
    } else if (type === 'person') {
      navigate(`/agent?q=${encodeURIComponent(`What does ${label} work on?`)}`);
    } else if (type === 'project') {
      navigate(`/agent?q=${encodeURIComponent(`Show the decision history of ${label}`)}`);
    } else if (type === 'risk') {
      navigate(`/agent?q=${encodeURIComponent(`What are the risks on ${label}?`)}`);
    } else if (type === 'document') {
      navigate(`/agent?q=${encodeURIComponent(`Which decisions reference superseded documents?`)}`);
    } else {
      navigate(`/agent?q=${encodeURIComponent(`Tell me about ${label}`)}`);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{
          style: { stroke: '#334458', strokeWidth: 1.5 },
        }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={2.5}
      >
        <Background color="#1E293B" gap={24} size={1} />
        <Controls
          className="!glass-panel !border-white/10 !rounded-xl !shadow-2xl [&>button]:!bg-white/5 [&>button]:!border-white/10 [&>button]:!fill-text-secondary hover:[&>button]:!bg-white/10 hover:[&>button]:!fill-cyan-analytical"
          position="bottom-left"
        />
        <MiniMap
          nodeColor={(node) => {
            const colors = {
              person: '#5DD6F5',
              project: '#6EE7A8',
              decision: '#F2B84B',
              goal: '#6EE7A8',
              risk: '#FF6577',
              document: '#5DD6F5',
            };
            return colors[node.type] || '#64748B';
          }}
          maskColor="rgba(8, 11, 16, 0.75)"
          style={{
            backgroundColor: 'rgba(17, 25, 35, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
          }}
          position="top-right"
        />

        {/* ─── Left Controls Panel ─── */}
        <Panel position="top-left" className="!m-4">
          <div className="glass-panel-elevated rounded-2xl w-[270px] overflow-hidden">
            {/* Search */}
            <div className="p-3.5 border-b border-white/10">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-analytical/70" />
                <input
                  type="text"
                  placeholder="Filter nodes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full glass-input rounded-lg pl-9 pr-7 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="p-3.5 border-b border-white/10">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Filter size={12} className="text-cyan-analytical" />
                <span className="text-[10px] text-text-muted font-mono font-semibold uppercase tracking-wider">
                  Entity Types
                </span>
                <span className="text-[10px] font-mono text-cyan-analytical ml-auto px-1.5 py-0.5 rounded bg-cyan-analytical/10 border border-cyan-analytical/20">
                  {activeFilterCount}/{totalFilterCount}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(NODE_CONFIG).map(([type, config]) => {
                  const Icon = config.icon;
                  const active = filters[type];
                  return (
                    <button
                      key={type}
                      onClick={() => toggleFilter(type)}
                      className={`
                        flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium
                        transition-all duration-200 border
                        ${active
                          ? 'glass-card text-text-primary border-white/15'
                          : 'bg-black/20 border-transparent text-text-muted opacity-40 hover:opacity-70'
                        }
                      `}
                    >
                      <Icon size={12} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="p-3.5 border-b border-white/10 flex gap-2">
              <button
                onClick={handleFitView}
                className="flex-1 flex items-center justify-center gap-1.5 glass-button rounded-lg px-2.5 py-1.5 text-[11px] text-text-secondary hover:text-text-primary"
              >
                <Maximize size={12} />
                Fit View
              </button>
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 glass-button rounded-lg px-2.5 py-1.5 text-[11px] text-text-secondary hover:text-text-primary"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>

            {/* Stats */}
            <div className="px-3.5 py-2.5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-text-muted font-mono">
                  <span className="text-cyan-analytical font-semibold">{nodeCount}</span> nodes
                </span>
                <span className="text-[11px] text-text-muted font-mono">
                  <span className="text-green-intel font-semibold">{edgeCount}</span> edges
                </span>
              </div>
              <Database size={12} className="text-cyan-analytical/80" />
            </div>
          </div>
        </Panel>

        {/* ─── Bottom Legend ─── */}
        <Panel position="bottom-center" className="!mb-4">
          <div className="glass-panel rounded-full px-5 py-2.5 flex items-center gap-4 border border-white/15 shadow-2xl">
            {Object.entries(NODE_CONFIG).map(([type, config]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${config.dotColor} shadow-[0_0_8px_currentColor]`} />
                <span className="text-[11px] text-text-secondary font-medium">{config.label}</span>
              </div>
            ))}
            <div className="h-3.5 w-px bg-white/15" />
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-px bg-white/40" />
              <span className="text-[11px] text-text-muted">Edge</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-px bg-amber-tactical" style={{ borderTop: '1px dashed #F2B84B', height: 0 }} />
              <span className="text-[11px] text-amber-tactical font-mono">SUPERSEDES</span>
            </div>
          </div>
        </Panel>

        {/* ─── Demo Data Banner ─── */}
        <Panel position="top-right" className="!m-4 !mt-[116px]">
          <div className="glass-pill-amber px-3 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-tactical animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Graph Track 3 Active</span>
          </div>
        </Panel>

        {/* ─── Selected Node Detail Panel ─── */}
        {selectedNode && (
          <Panel position="bottom-right" className="!m-4">
            <div className="glass-panel-elevated rounded-2xl w-[300px] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = NODE_CONFIG[selectedNode.type];
                    const Icon = config?.icon || Box;
                    return (
                      <div className="p-1 rounded-md bg-white/10 text-cyan-analytical">
                        <Icon size={13} />
                      </div>
                    );
                  })()}
                  <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Node Provenance</span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                    selectedNode.type === 'decision' ? 'glass-pill-amber' :
                    selectedNode.type === 'risk' ? 'glass-pill-red' :
                    selectedNode.type === 'project' ? 'glass-pill-green' : 'glass-pill-cyan'
                  }`}>
                    {selectedNode.type}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">{selectedNode.id}</span>
                </div>

                <h3 className="text-sm font-bold text-text-primary leading-snug">{selectedNode.data.label}</h3>

                <div className="space-y-1.5 pt-1 glass-card p-2.5 rounded-xl border border-white/5">
                  {Object.entries(selectedNode.data)
                    .filter(([key]) => key !== 'label' && key !== 'type')
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-[10px] text-text-muted capitalize">{key}</span>
                        <span className={`text-[11px] font-mono ${
                          value === 'superseded' ? 'text-amber-tactical' :
                          value === 'approved' ? 'text-green-intel' :
                          value === 'High' ? 'text-red-alert font-bold' :
                          value === 'Medium' ? 'text-amber-tactical' :
                          'text-text-secondary'
                        }`}>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Connected edges */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Linked Graph Edges</span>
                  <div className="mt-2 space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                    {edges
                      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((edge) => {
                        const isSource = edge.source === selectedNode.id;
                        const otherNodeId = isSource ? edge.target : edge.source;
                        const otherNode = nodes.find((n) => n.id === otherNodeId);
                        return (
                          <div key={edge.id} className="flex items-center gap-1.5 text-[10px] p-1.5 rounded-lg bg-black/20 border border-white/5">
                            <span className="text-cyan-analytical font-mono font-medium">{edge.label}</span>
                            <span className="text-text-muted">{isSource ? '→' : '←'}</span>
                            <span className="text-text-secondary truncate">
                              {otherNode?.data?.label || otherNodeId}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Investigate button */}
              <div className="p-3 border-t border-white/10 bg-white/5">
                <button
                  onClick={handleInvestigateNode}
                  className="w-full flex items-center justify-center gap-2 glass-button-primary rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <ExternalLink size={12} />
                  Investigate in Workbench
                </button>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
