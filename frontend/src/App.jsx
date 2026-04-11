import { useCallback, useEffect, useMemo, useState } from 'react';
import { DfaForm } from './components/DfaForm';
import { GraphPanel } from './components/GraphPanel';
import { JsonEditor } from './components/JsonEditor';
import { MinimizedSummary } from './components/MinimizedSummary';
import { PartitionTable } from './components/PartitionTable';
import { StepInsights } from './components/StepInsights';
import { fetchExamples, minimizeDfa } from './lib/api';
import { buildExport, ensureTransitionShape, normalizeFormDfa, stringifyDfa, toFormState } from './lib/dfaHelpers';

const EMPTY_DFA = {
  states: [],
  alphabet: [],
  transitions: {},
  startState: '',
  acceptStates: [],
};

const featureCards = [
  {
    eyebrow: 'Input',
    title: 'Build any DFA fast',
    description: 'Enter states, alphabet, transitions, start state, and accepting states with either a guided form or raw JSON.',
  },
  {
    eyebrow: 'Trace',
    title: 'See every refinement step',
    description: 'The app explains how partitions split, why states stop being equivalent, and how the minimized DFA is formed.',
  },
  {
    eyebrow: 'Visual',
    title: 'Compare before and after',
    description: 'Original DFA, minimized DFA, and the state mapping are visible together so the reduction is easy to understand.',
  },
];

function LandingPage({ onLaunch, onLoadExample }) {
  return (
    <div className="min-h-screen bg-[#f7f4ec] text-slate-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.18),transparent_32%),radial-gradient(circle_at_75%_20%,rgba(245,158,11,0.18),transparent_28%),linear-gradient(180deg,#fffdf8,#f7f4ec)]" />
        <div className="absolute inset-y-0 right-0 w-[40vw] bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent)] [clip-path:polygon(24%_0,100%_0,100%_100%,0_100%)]" />

        <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-5 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(135deg,#0f172a,#0f766e)] font-display text-sm font-bold text-white">
                DFA
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Automata Lab</p>
                <p className="font-display text-lg font-semibold text-slate-950">DFA Minimization Visualizer</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLaunch}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open workspace
            </button>
          </header>

          <section className="grid gap-10 pb-14 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-20">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">
                Theory made visual
              </div>
              <h1 className="max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
                Turn DFA minimization into a crisp, visual walkthrough.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Start with a DFA, inspect every partition split, and end with a polished minimized automaton that is easy to explain in class, viva, or project demo.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={onLaunch}
                  className="rounded-[1.6rem] bg-[linear-gradient(135deg,#0f172a,#115e59)] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition hover:translate-y-[-1px]"
                >
                  Make minimize DFA
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadExample('classroom');
                    onLaunch();
                  }}
                  className="rounded-[1.6rem] border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:border-teal-300 hover:bg-teal-50"
                >
                  Launch with sample DFA
                </button>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {featureCards.map((card) => (
                  <div key={card.title} className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">{card.eyebrow}</p>
                    <h2 className="mt-3 font-display text-xl font-semibold text-slate-950">{card.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-12 h-40 w-40 rounded-full bg-teal-200/60 blur-3xl" />
              <div className="absolute -right-6 bottom-8 h-48 w-48 rounded-full bg-amber-200/70 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#fffdf8] p-5 shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
                <div className="mb-4 flex items-center justify-between rounded-[1.5rem] bg-slate-950 px-4 py-3 text-white">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-teal-200">Demo flow</p>
                    <p className="font-display text-lg font-semibold">Minimization studio</p>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Interactive</div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-display text-lg font-semibold">Input DFA</p>
                      <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Form + JSON</div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-100 px-4 py-3 font-mono text-sm text-slate-700">states = q0, q1, q2, q3</div>
                      <div className="rounded-2xl bg-slate-100 px-4 py-3 font-mono text-sm text-slate-700">accept = q2, q3</div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="font-display text-lg font-semibold">Partition refinement</p>
                      <div className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">Step by step</div>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">P0 = &#123;q0, q1&#125;</p>
                        <p className="text-sm text-slate-600">Non-accepting states stay together initially.</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">P1 = &#123;q2, q3&#125;</p>
                        <p className="text-sm text-slate-600">Accepting states are separated from non-accepting states.</p>
                      </div>
                      <div className="rounded-2xl bg-[linear-gradient(135deg,#0f172a,#115e59)] px-4 py-4 text-white">
                        <p className="text-sm font-semibold">Final mapping</p>
                        <p className="mt-1 font-mono text-sm text-teal-100">q0 → M0, q1 → M0, q2 → M1, q3 → M1</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function WorkspaceShell({
  activeInput,
  setActiveInput,
  formState,
  transitionStates,
  transitionAlphabet,
  handleFieldChange,
  handleTransitionChange,
  handleFormSubmit,
  isDirty,
  loading,
  analysis,
  jsonValue,
  setJsonValue,
  handleJsonSubmit,
  examples,
  loadExample,
  resetToDefault,
  exportMinimized,
  error,
  dataSource,
  diagramStatus,
  onBack,
}) {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-slate-900">
      <div className="mx-auto max-w-[1540px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
          <div className="bg-[linear-gradient(135deg,#0f172a,#0f766e_52%,#f59e0b_140%)] px-6 py-6 text-white">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onBack}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/15"
                  >
                    Back to landing
                  </button>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${dataSource === 'backend' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-400/20 text-amber-100'}`}>
                    {dataSource === 'backend' ? 'Backend connected' : 'Local fallback mode'}
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${isDirty ? 'bg-amber-400/20 text-amber-100' : 'bg-sky-400/20 text-sky-100'}`}>
                    {diagramStatus}
                  </div>
                </div>
                <h1 className="font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Minimization workspace</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-100/88 sm:text-base">
                  Build the DFA, apply the changes, and read the full reduction story from original machine to minimized result.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <button type="button" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.12)]" onClick={resetToDefault}>
                  Reset board
                </button>
                <button type="button" className="rounded-2xl bg-[#fff4db] px-4 py-3 text-sm font-semibold text-amber-900 shadow-[0_10px_30px_rgba(15,23,42,0.12)]" onClick={() => loadExample('classroom')}>
                  Sample DFA
                </button>
                <button type="button" className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white" onClick={exportMinimized}>
                  Export minimized JSON
                </button>
              </div>
            </div>
          </div>
          {error ? <div className="border-t border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">{error}</div> : null}
        </header>

        <main className="grid gap-6 xl:grid-cols-[410px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
              <div className="mb-4 flex gap-2 rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${activeInput === 'form' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}
                  onClick={() => setActiveInput('form')}
                >
                  Guided form
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${activeInput === 'json' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}
                  onClick={() => setActiveInput('json')}
                >
                  Raw JSON
                </button>
              </div>
              {activeInput === 'form' ? (
                <DfaForm
                  formState={formState}
                  transitionStates={transitionStates}
                  transitionAlphabet={transitionAlphabet}
                  onFieldChange={handleFieldChange}
                  onTransitionChange={handleTransitionChange}
                  onSubmit={handleFormSubmit}
                  isDirty={isDirty}
                  loading={loading}
                  hasAnalysis={Boolean(analysis)}
                />
              ) : (
                <JsonEditor jsonValue={jsonValue} onChange={setJsonValue} onSubmit={handleJsonSubmit} />
              )}
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Quick start</p>
                  <h2 className="mt-2 font-display text-xl font-semibold text-slate-950">Example DFAs</h2>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {Object.keys(examples).length}
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(examples).map(([key, example]) => (
                  <button
                    key={key}
                    type="button"
                    className="group w-full rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
                    onClick={() => loadExample(key)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-semibold text-slate-950">{example.name}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{example.description}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-slate-200 transition group-hover:ring-teal-300">
                        Load
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            {analysis ? (
              <>
                <GraphPanel
                  title="Original DFA"
                  subtitle="The machine exactly as entered by the user. Unreachable states are dimmed when present."
                  dfa={analysis.originalDfa}
                  partitions={[]}
                  mutedStates={analysis.unreachableStates}
                />

                <GraphPanel
                  title="Minimized DFA"
                  subtitle="The reduced machine after pruning unreachable states and merging equivalent ones."
                  dfa={analysis.minimizedDfa}
                  partitions={[]}
                />

                <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
                  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Walkthrough</p>
                        <h3 className="mt-2 font-display text-2xl font-semibold text-slate-950">How the DFA gets minimized</h3>
                      </div>
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {analysis.steps.length} stages
                      </div>
                    </div>
                    <div className="space-y-5">
                      {analysis.steps.map((step, index) => (
                        <div key={`${step.type}-${index}`} className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-4">
                          <StepInsights step={step} currentIndex={index} totalSteps={analysis.steps.length} />
                          <div className="mt-4">
                            <PartitionTable step={step} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="space-y-6">
                    <MinimizedSummary minimizedDfa={analysis.minimizedDfa} />
                    <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] p-5 text-white shadow-[0_22px_70px_rgba(15,23,42,0.14)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">Why this matters</p>
                      <h3 className="mt-2 font-display text-2xl font-semibold">Smaller machine, same language.</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-200">
                        The minimized DFA accepts exactly the same language as the original, but with fewer states and a cleaner structure. That is the whole point of minimization.
                      </p>
                    </section>
                  </div>
                </div>
              </>
            ) : (
              <section className="grid min-h-[44rem] place-items-center rounded-[2.5rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Workspace ready</p>
                  <h2 className="mt-3 font-display text-4xl font-semibold text-slate-950">Start with a DFA or load a sample.</h2>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    Once you apply a DFA, the original graph, minimized graph, and complete minimization story will appear here.
                  </p>
                </div>
              </section>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState('landing');
  const [activeInput, setActiveInput] = useState('form');
  const [formState, setFormState] = useState(() => toFormState(EMPTY_DFA));
  const [jsonValue, setJsonValue] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [examples, setExamples] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('local');
  const [lastAppliedSignature, setLastAppliedSignature] = useState(() => JSON.stringify(EMPTY_DFA));

  const transitionStates = useMemo(() => {
    const normalized = normalizeFormDfa(formState);
    return normalized.states;
  }, [formState]);

  const transitionAlphabet = useMemo(() => {
    const normalized = normalizeFormDfa(formState);
    return normalized.alphabet;
  }, [formState]);

  const normalizedFormDfa = useMemo(() => normalizeFormDfa(formState), [formState]);
  const formSignature = useMemo(() => JSON.stringify(normalizedFormDfa), [normalizedFormDfa]);
  const isDirty = activeInput === 'form' && formSignature !== lastAppliedSignature;
  const diagramStatus = isDirty ? 'Showing previously applied DFA' : analysis ? 'Showing current DFA' : 'No diagram yet';

  function syncEditors(dfa) {
    const shaped = ensureTransitionShape(dfa);
    setFormState(toFormState(shaped));
    setJsonValue(stringifyDfa(shaped));
  }

  const runMinimization = useCallback(async (dfa) => {
    setLoading(true);
    setError('');

    try {
      const result = await minimizeDfa(dfa);
      setAnalysis(result);
      setDataSource(result.source ?? 'local');
      setLastAppliedSignature(JSON.stringify(dfa));
      syncEditors(dfa);
      setView('workspace');
    } catch (runError) {
      setError(runError.message);
      setView('workspace');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExamples()
      .then((payload) => {
        setExamples(payload.examples);
        setDataSource(payload.source ?? 'local');
      })
      .catch(() => {
        setExamples({});
      });
  }, []);

  function handleFieldChange(field, value) {
    setFormState((current) => {
      const next = { ...current, [field]: value };
      const normalized = normalizeFormDfa(next);
      next.transitions = ensureTransitionShape(normalized).transitions;
      return next;
    });
  }

  function handleTransitionChange(state, symbol, value) {
    setFormState((current) => ({
      ...current,
      transitions: {
        ...current.transitions,
        [state]: {
          ...current.transitions[state],
          [symbol]: value,
        },
      },
    }));
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    setJsonValue(stringifyDfa(normalizedFormDfa));
    void runMinimization(normalizedFormDfa);
  }

  function handleJsonSubmit(event) {
    event.preventDefault();
    try {
      const parsed = JSON.parse(jsonValue);
      void runMinimization(parsed);
    } catch {
      setError('The JSON input is not valid. Check commas, quotes, and braces, then run again.');
      setView('workspace');
    }
  }

  function loadExample(key) {
    const example = examples[key]?.dfa;
    if (!example) {
      setError('That example could not be loaded.');
      setView('workspace');
      return;
    }
    void runMinimization(example);
  }

  function resetToDefault() {
    setLoading(false);
    setError('');
    setAnalysis(null);
    setActiveInput('form');
    setLastAppliedSignature(JSON.stringify(EMPTY_DFA));
    setFormState(toFormState(EMPTY_DFA));
    setJsonValue('');
  }

  function exportMinimized() {
    if (!analysis?.minimizedDfa) {
      setError('Nothing to export yet. Run minimization first.');
      return;
    }

    const url = buildExport(analysis.minimizedDfa);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'minimized-dfa.json';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (view === 'landing') {
    return <LandingPage onLaunch={() => setView('workspace')} onLoadExample={loadExample} />;
  }

  return (
    <WorkspaceShell
      activeInput={activeInput}
      setActiveInput={setActiveInput}
      formState={formState}
      transitionStates={transitionStates}
      transitionAlphabet={transitionAlphabet}
      handleFieldChange={handleFieldChange}
      handleTransitionChange={handleTransitionChange}
      handleFormSubmit={handleFormSubmit}
      isDirty={isDirty}
      loading={loading}
      analysis={analysis}
      jsonValue={jsonValue}
      setJsonValue={setJsonValue}
      handleJsonSubmit={handleJsonSubmit}
      examples={examples}
      loadExample={loadExample}
      resetToDefault={resetToDefault}
      exportMinimized={exportMinimized}
      error={error}
      dataSource={dataSource}
      diagramStatus={diagramStatus}
      onBack={() => setView('landing')}
    />
  );
}

export default App;
