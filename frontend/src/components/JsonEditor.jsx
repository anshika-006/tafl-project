export function JsonEditor({ jsonValue, onChange, onSubmit }) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block text-sm font-semibold text-slate-800">Raw DFA JSON</label>
      <textarea
        className="h-[30rem] w-full rounded-3xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        value={jsonValue}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="submit"
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Validate and minimize JSON
      </button>
    </form>
  );
}
