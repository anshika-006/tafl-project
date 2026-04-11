import { buildAutomatonLayout } from '../lib/graph';

const markerId = 'dfa-arrowhead';

export function DfaDiagram({ dfa, partitions, mutedStates = [] }) {
  const { width, height, nodes, edges } = buildAutomatonLayout(dfa, partitions, { mutedStates });

  return (
    <div className="h-full w-full overflow-auto rounded-[1.5rem] bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.10),_transparent_40%),linear-gradient(180deg,#ffffff,#f8fafc)]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full min-w-[760px]">
        <defs>
          <pattern id="dfa-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.1" fill="#dbe4ee" />
          </pattern>
          <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
          </marker>
        </defs>

        <rect width={width} height={height} fill="url(#dfa-grid)" />

        {edges.map((edge) => (
          <g key={`${edge.source}-${edge.target}-${edge.symbols.join('-')}`}>
            <path d={edge.path} fill="none" stroke="#475569" strokeWidth="2.4" markerEnd={`url(#${markerId})`} />
            <rect x={edge.labelX - 18} y={edge.labelY - 12} width="36" height="18" rx="8" fill="white" opacity="0.9" />
            <text x={edge.labelX} y={edge.labelY} textAnchor="middle" className="fill-slate-700 text-[12px] font-semibold">
              {edge.symbols.join(',')}
            </text>
          </g>
        ))}

        {nodes.map((node) => (
          <g key={node.id} opacity={node.isMuted ? 0.35 : 1}>
            {node.isStart ? (
              <path
                d={`M ${node.x - 82} ${node.y} L ${node.x - 42} ${node.y}`}
                stroke="#0f172a"
                strokeWidth="2.4"
                markerEnd={`url(#${markerId})`}
                fill="none"
              />
            ) : null}
            <circle cx={node.x} cy={node.y} r="34" fill="white" stroke={node.color} strokeWidth={node.isStart ? '4' : '3'} />
            {node.isAccepting ? <circle cx={node.x} cy={node.y} r="26" fill="none" stroke={node.color} strokeWidth="2.5" /> : null}
            <circle cx={node.x} cy={node.y} r="31" fill={`${node.color}22`} stroke="none" />
            <text x={node.x} y={node.y + 5} textAnchor="middle" className="fill-slate-900 text-[14px] font-bold">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
