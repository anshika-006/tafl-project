export function PartitionTable({ step }) {
  if (!step?.table || step.table.length === 0) {
    return null;
  }

  const isFinal = step.type === 'final';

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-950">Partition detail</h3>
          <p className="text-sm text-slate-600">Track how groups evolve at this step.</p>
        </div>
        <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          {step.title}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              {isFinal ? (
                <>
                  <th className="px-4 py-3 font-semibold">Minimized state</th>
                  <th className="px-4 py-3 font-semibold">Original states</th>
                  <th className="px-4 py-3 font-semibold">Accepting</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 font-semibold">Group</th>
                  <th className="px-4 py-3 font-semibold">Next / kind</th>
                  <th className="px-4 py-3 font-semibold">States</th>
                  <th className="px-4 py-3 font-semibold">Signature / reason</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
            {step.table.map((row) => (
              <tr key={JSON.stringify(row)}>
                {isFinal ? (
                  <>
                    <td className="px-4 py-3 font-semibold text-slate-950">{row.minimizedState}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.originalStates.join(', ')}</td>
                    <td className="px-4 py-3">{row.isAccepting ? 'Yes' : 'No'}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-semibold text-slate-950">{row.previousGroup ?? row.group}</td>
                    <td className="px-4 py-3 font-semibold text-teal-700">{row.nextGroup ?? row.group}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.states.join(', ')}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.reason ?? JSON.stringify(row.signature)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
