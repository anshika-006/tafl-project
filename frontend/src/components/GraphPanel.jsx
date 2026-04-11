import { DfaDiagram } from './DfaDiagram';

export function GraphPanel({ title, subtitle, dfa, partitions, mutedStates = [] }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-950">{title}</h3>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
        <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          {dfa.states.length} states
        </div>
      </div>
      <div className="h-[30rem] overflow-hidden rounded-[1.5rem] border border-slate-200">
        <DfaDiagram dfa={dfa} partitions={partitions} mutedStates={mutedStates} />
      </div>
      {mutedStates.length > 0 ? (
        <p className="mt-3 text-xs font-medium text-slate-500">
          Dimmed states are unreachable from the start state and are removed before refinement.
        </p>
      ) : null}
    </section>
  );
}
