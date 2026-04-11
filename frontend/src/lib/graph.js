const palette = ['#0f766e', '#d97706', '#dc2626', '#2563eb', '#7c3aed', '#059669', '#db2777'];

const WIDTH = 960;
const HEIGHT = 520;
const NODE_RADIUS = 34;

const polarPoint = (index, total, radius, centerX, centerY) => {
  const angle = (Math.PI * 2 * index) / Math.max(total, 1) - Math.PI / 2;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
};

const normalize = (x, y) => {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
};

const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const groupIndexForState = (partitions, state) => partitions.findIndex((group) => group.includes(state));

export const getGroupColor = (index) => palette[index % palette.length] ?? '#334155';

export function buildAutomatonLayout(dfa, partitions = [], options = {}) {
  const { mutedStates = [] } = options;
  const mutedSet = new Set(mutedStates);
  const total = dfa.states.length;
  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;
  const radius = total <= 2 ? 120 : total <= 4 ? 150 : 185;

  const nodes = dfa.states.map((state, index) => {
    const point = polarPoint(index, total, radius, centerX, centerY);
    const color = getGroupColor(Math.max(partitions.length ? groupIndexForState(partitions, state) : index, 0));

    return {
      id: state,
      label: state,
      x: point.x,
      y: point.y,
      color,
      isAccepting: dfa.acceptStates.includes(state),
      isStart: dfa.startState === state,
      isMuted: mutedSet.has(state),
    };
  });

  const nodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const pairedEdges = new Map();

  dfa.states.forEach((source) => {
    dfa.alphabet.forEach((symbol) => {
      const target = dfa.transitions[source][symbol];
      const key = `${source}->${target}`;
      if (!pairedEdges.has(key)) {
        pairedEdges.set(key, { source, target, symbols: [] });
      }
      pairedEdges.get(key).symbols.push(symbol);
    });
  });

  const edges = [...pairedEdges.values()].map((edge) => {
    const sourceNode = nodeMap[edge.source];
    const targetNode = nodeMap[edge.target];
    const reverseKey = `${edge.target}->${edge.source}`;
    const hasReverse = edge.source !== edge.target && pairedEdges.has(reverseKey);

    if (edge.source === edge.target) {
      const loopTop = sourceNode.y - NODE_RADIUS - 38;
      const path = [
        `M ${sourceNode.x - 16} ${sourceNode.y - NODE_RADIUS + 4}`,
        `C ${sourceNode.x - 58} ${loopTop}, ${sourceNode.x + 58} ${loopTop}, ${sourceNode.x + 16} ${sourceNode.y - NODE_RADIUS + 4}`,
      ].join(' ');

      return {
        ...edge,
        path,
        labelX: sourceNode.x,
        labelY: loopTop - 10,
      };
    }

    const direction = normalize(targetNode.x - sourceNode.x, targetNode.y - sourceNode.y);
    const perpendicular = { x: -direction.y, y: direction.x };
    const start = {
      x: sourceNode.x + direction.x * NODE_RADIUS,
      y: sourceNode.y + direction.y * NODE_RADIUS,
    };
    const end = {
      x: targetNode.x - direction.x * NODE_RADIUS,
      y: targetNode.y - direction.y * NODE_RADIUS,
    };
    const mid = midpoint(start, end);
    const bend = hasReverse ? 42 : 14;
    const control = {
      x: mid.x + perpendicular.x * bend,
      y: mid.y + perpendicular.y * bend,
    };

    return {
      ...edge,
      path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
      labelX: control.x,
      labelY: control.y - 8,
    };
  });

  return {
    width: WIDTH,
    height: HEIGHT,
    nodes,
    edges,
  };
}
