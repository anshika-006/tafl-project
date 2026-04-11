const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100';

export function DfaForm({
  formState,
  transitionStates,
  transitionAlphabet,
  onFieldChange,
  onTransitionChange,
  onSubmit,
  isDirty,
  loading,
  hasAnalysis,
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className={`rounded-[1.5rem] border px-4 py-3 text-sm ${isDirty ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
        <p className="font-semibold">{isDirty ? 'Pending changes' : hasAnalysis ? 'Diagram is up to date' : 'No DFA applied yet'}</p>
        <p className="mt-1 text-xs">
          {isDirty
            ? 'You changed the DFA. Press the button below to recompute the minimization and update the diagram.'
            : hasAnalysis
              ? 'The graph, steps, and tables match the DFA currently shown in the form.'
              : 'Fill in the DFA and press the button to generate the walkthrough.'}
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">States</label>
        <input
          className={inputClassName}
          value={formState.statesText}
          onChange={(event) => onFieldChange('statesText', event.target.value)}
          placeholder="q0, q1, q2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">Alphabet</label>
        <input
          className={inputClassName}
          value={formState.alphabetText}
          onChange={(event) => onFieldChange('alphabetText', event.target.value)}
          placeholder="0, 1"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">Start state</label>
          <input
            className={inputClassName}
            value={formState.startState}
            onChange={(event) => onFieldChange('startState', event.target.value)}
            placeholder="q0"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">Accept states</label>
          <input
            className={inputClassName}
            value={formState.acceptStatesText}
            onChange={(event) => onFieldChange('acceptStatesText', event.target.value)}
            placeholder="q2, q3"
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-800">Transition function</label>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            δ(state, symbol)
          </span>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <div className="grid grid-cols-[110px_repeat(auto-fit,minmax(90px,1fr))] gap-px bg-slate-200 text-sm">
            <div className="bg-slate-100 px-4 py-3 font-semibold text-slate-700">State</div>
            {transitionAlphabet.map((symbol) => (
              <div key={symbol} className="bg-slate-100 px-4 py-3 font-semibold text-slate-700">
                {symbol}
              </div>
            ))}
            {transitionStates.map((state) => (
              <div key={state} className="contents">
                <div key={`${state}-label`} className="bg-white px-4 py-3 font-semibold text-slate-900">
                  {state}
                </div>
                {transitionAlphabet.map((symbol) => (
                  <select
                    key={`${state}-${symbol}`}
                    className="min-w-0 bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                    value={formState.transitions?.[state]?.[symbol] ?? ''}
                    onChange={(event) => onTransitionChange(state, symbol, event.target.value)}
                  >
                    <option value="">Select target</option>
                    {transitionStates.map((target) => (
                      <option key={target} value={target}>
                        {target}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
        disabled={loading}
      >
        {loading ? 'Updating...' : isDirty ? 'Apply changes now' : 'Run minimization'}
      </button>
      <p className="text-xs text-slate-500">
        {isDirty
          ? 'Changes are pending. The visualizer updates only when you press the button.'
          : hasAnalysis
            ? 'You can keep editing. The current diagram stays fixed until you apply again.'
            : 'Edit the DFA, then press the button to update the walkthrough.'}
      </p>
    </form>
  );
}
