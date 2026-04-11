export const examples = {
  classroom: {
    name: 'Classroom Example',
    description: 'A DFA with equivalent middle states that merge after refinement.',
    dfa: {
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
    },
  },
  binaryEndsWithOne: {
    name: 'Binary Strings Ending With 1',
    description: 'Small DFA where no further merge is possible after the first split.',
    dfa: {
      states: ['A', 'B'],
      alphabet: ['0', '1'],
      transitions: {
        A: { '0': 'A', '1': 'B' },
        B: { '0': 'A', '1': 'B' },
      },
      startState: 'A',
      acceptStates: ['B'],
    },
  },
  unreachableDemo: {
    name: 'Unreachable State Demo',
    description: 'Includes extra states that are never reached from the start state, so they are pruned first.',
    dfa: {
      states: ['s0', 's1', 's2', 'dead', 'ghost'],
      alphabet: ['a', 'b'],
      transitions: {
        s0: { a: 's1', b: 's2' },
        s1: { a: 's1', b: 's2' },
        s2: { a: 's1', b: 's2' },
        dead: { a: 'dead', b: 'ghost' },
        ghost: { a: 'ghost', b: 'ghost' },
      },
      startState: 's0',
      acceptStates: ['s2', 'ghost'],
    },
  },
};
