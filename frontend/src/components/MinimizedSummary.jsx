export function MinimizedSummary({ minimizedDfa }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-950">Minimized DFA output</h3>
          <p className="text-sm text-slate-600">Final state mapping and compact machine definition.</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {minimizedDfa.states.length} minimized states
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-800">Old state → new state</p>
          <div className="space-y-2">
            {Object.entries(minimizedDfa.stateMapping).map(([state, group]) => (
              <div key={state} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm shadow-sm">
                <span className="font-mono text-slate-900">{state}</span>
                <span className="rounded-full bg-teal-50 px-2 py-1 font-semibold text-teal-700">{group}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-slate-950 p-4 text-slate-100">
          <p className="mb-3 text-sm font-semibold text-white">JSON</p>
          <pre className="overflow-auto text-xs leading-6">{JSON.stringify(minimizedDfa, null, 2)}</pre>
        </div>
      </div>
    </section>
  );
}
