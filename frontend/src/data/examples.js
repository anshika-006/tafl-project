import { defaultDfa } from './defaultDfa';

export const localExamples = {
  classroom: {
    name: 'Classroom Merge Example',
    description: 'Two pairs of states stay equivalent and merge after refinement.',
    dfa: defaultDfa,
  },
  binaryEndsWithOne: {
    name: 'Ends With 1',
    description: 'A minimal DFA for binary strings that end in 1.',
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
    name: 'Unreachable States',
    description: 'Shows why unreachable states are removed before minimization.',
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
