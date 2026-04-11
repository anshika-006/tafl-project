import { GraphPanel } from './GraphPanel';

export function ComparisonPanel({ originalDfa, minimizedDfa, unreachableStates = [] }) {
  return (
    <section className="grid gap-6 2xl:grid-cols-2">
      <GraphPanel
        title="Original DFA"
        subtitle="The machine exactly as entered by the user."
        dfa={originalDfa}
        partitions={[]}
        mutedStates={unreachableStates}
      />
      <GraphPanel
        title="Minimized DFA"
        subtitle="The final machine after unreachable-state pruning and partition refinement."
        dfa={minimizedDfa}
        partitions={[]}
      />
    </section>
  );
}
