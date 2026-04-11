export const parseCsv = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const stringifyDfa = (dfa) => JSON.stringify(dfa, null, 2);

const pickExistingTarget = (states, candidate) => {
  if (states.includes(candidate)) {
    return candidate;
  }
  return '';
};

export const ensureTransitionShape = (dfa) => {
  const transitions = {};

  dfa.states.forEach((state) => {
    transitions[state] = {};
    dfa.alphabet.forEach((symbol) => {
      transitions[state][symbol] = pickExistingTarget(dfa.states, dfa.transitions?.[state]?.[symbol]);
    });
  });

  return {
    ...dfa,
    transitions,
    startState: pickExistingTarget(dfa.states, dfa.startState),
  };
};

export const normalizeFormDfa = ({ statesText, alphabetText, startState, acceptStatesText, transitions }) => {
  const states = parseCsv(statesText);
  const alphabet = parseCsv(alphabetText);
  const acceptStates = parseCsv(acceptStatesText);

  const shapedTransitions = {};
  states.forEach((state) => {
    shapedTransitions[state] = {};
    alphabet.forEach((symbol) => {
      shapedTransitions[state][symbol] = pickExistingTarget(states, transitions?.[state]?.[symbol]);
    });
  });

  return {
    states,
    alphabet,
    transitions: shapedTransitions,
    startState: startState?.trim() ?? '',
    acceptStates,
  };
};

export const toFormState = (dfa) => ({
  statesText: dfa.states.join(', '),
  alphabetText: dfa.alphabet.join(', '),
  startState: dfa.startState,
  acceptStatesText: dfa.acceptStates.join(', '),
  transitions: ensureTransitionShape(dfa).transitions,
});

export const buildExport = (minimizedDfa) => {
  const blob = new Blob([JSON.stringify(minimizedDfa, null, 2)], { type: 'application/json' });
  return URL.createObjectURL(blob);
};
