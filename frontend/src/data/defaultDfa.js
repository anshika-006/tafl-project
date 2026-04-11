export const defaultDfa = {
  states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5'],
  alphabet: ['0', '1'],
  transitions: {
    q0: { '0': 'q1', '1': 'q2' },
    q1: { '0': 'q3', '1': 'q4' },
    q2: { '0': 'q3', '1': 'q4' },
    q3: { '0': 'q3', '1': 'q5' },
    q4: { '0': 'q3', '1': 'q5' },
    q5: { '0': 'q5', '1': 'q5' },
  },
  startState: 'q0',
  acceptStates: ['q5'],
};
