export function StepInsights({ step, currentIndex, totalSteps }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Algorithm trace</p>
          <h3 className="font-display text-xl font-semibold text-slate-950">{step.title}</h3>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Step {currentIndex + 1} / {totalSteps}
        </div>
      </div>
      <p className="mb-4 text-sm leading-6 text-slate-600">{step.description}</p>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.5rem] bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-800">Logs</p>
          <ul className="space-y-2 text-sm text-slate-700">
            {step.logs?.map((log) => (
              <li key={log} className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                {log}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.5rem] bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-800">Splits and reasons</p>
          <div className="space-y-3 text-sm text-slate-700">
            {step.splitDetails?.length ? (
              step.splitDetails.map((detail) => (
                <div key={detail.message} className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                  <p className="font-semibold text-slate-900">{detail.sourceGroup}</p>
                  <p>{detail.message}</p>
                  {detail.symbol ? (
                    <p className="mt-2 font-mono text-xs text-slate-500">
                      on {detail.symbol}: {detail.leftTargetGroup} vs {detail.rightTargetGroup}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-white px-3 py-3 shadow-sm text-slate-600">
                No split at this step. The current groups are stable.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
