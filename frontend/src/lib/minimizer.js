const canonicalize = (items) => [...items].sort((a, b) => a.localeCompare(b));

const partitionKey = (partitions, state) => {
  const index = partitions.findIndex((group) => group.includes(state));
  return index === -1 ? 'missing' : String(index);
};

const buildTransitionSignature = (dfa, partitions, state) => {
  const signature = {};
  dfa.alphabet.forEach((symbol) => {
    signature[symbol] = partitionKey(partitions, dfa.transitions[state][symbol]);
  });
  return signature;
};

const getReachableStates = (dfa) => {
  const visited = new Set();
  const queue = [dfa.startState];

  while (queue.length > 0) {
    const state = queue.shift();
    if (!state || visited.has(state)) {
      continue;
    }
    visited.add(state);
    dfa.alphabet.forEach((symbol) => {
      const target = dfa.transitions[state]?.[symbol];
      if (target && !visited.has(target)) {
        queue.push(target);
      }
    });
  }

  return canonicalize([...visited]);
};

export function validateDfa(input) {
  const errors = [];

  if (!input || typeof input !== 'object') {
    return ['DFA payload must be an object.'];
  }

  const { states, alphabet, transitions, startState, acceptStates } = input;
  if (!Array.isArray(states) || states.length === 0) errors.push('States must be a non-empty array.');
  if (!Array.isArray(alphabet) || alphabet.length === 0) errors.push('Alphabet must be a non-empty array.');
  if (!transitions || typeof transitions !== 'object') errors.push('Transitions must be an object keyed by state.');
  if (typeof startState !== 'string') errors.push('Start state must be a string.');
  if (!Array.isArray(acceptStates)) errors.push('Accept states must be an array.');

  if (errors.length > 0) return errors;

  const stateSet = new Set(states);
  const alphabetSet = new Set(alphabet);

  if (!stateSet.has(startState)) errors.push(`Start state "${startState}" is not listed in states.`);
  acceptStates.forEach((state) => {
    if (!stateSet.has(state)) errors.push(`Accept state "${state}" is not listed in states.`);
  });

  states.forEach((state) => {
    if (!transitions[state]) {
      errors.push(`Missing transition row for state "${state}".`);
      return;
    }
    alphabet.forEach((symbol) => {
      if (!(symbol in transitions[state])) {
        errors.push(`Missing transition for state "${state}" on symbol "${symbol}".`);
        return;
      }
      const target = transitions[state][symbol];
      if (!stateSet.has(target)) {
        errors.push(`Transition ${state} --${symbol}--> ${target} points to an unknown state.`);
      }
    });
  });

  Object.entries(transitions).forEach(([state, row]) => {
    if (!stateSet.has(state)) errors.push(`Transition row "${state}" is not declared in states.`);
    Object.keys(row).forEach((symbol) => {
      if (!alphabetSet.has(symbol)) errors.push(`Transition symbol "${symbol}" is not in alphabet.`);
    });
  });

  return errors;
}

export function minimizeDfaLocal(rawDfa) {
  const validationErrors = validateDfa(rawDfa);
  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(' '));
    error.validationErrors = validationErrors;
    throw error;
  }

  const normalizedDfa = {
    ...rawDfa,
    states: canonicalize(rawDfa.states),
    alphabet: canonicalize(rawDfa.alphabet),
    acceptStates: canonicalize(rawDfa.acceptStates),
  };

  const reachableStates = getReachableStates(normalizedDfa);
  const reachableStateSet = new Set(reachableStates);
  const unreachableStates = normalizedDfa.states.filter((state) => !reachableStateSet.has(state));

  const dfa = {
    ...normalizedDfa,
    states: reachableStates,
    acceptStates: normalizedDfa.acceptStates.filter((state) => reachableStateSet.has(state)),
    transitions: Object.fromEntries(
      reachableStates.map((state) => [
        state,
        Object.fromEntries(normalizedDfa.alphabet.map((symbol) => [symbol, normalizedDfa.transitions[state][symbol]])),
      ]),
    ),
  };

  const steps = [];

  if (unreachableStates.length > 0) {
    steps.push({
      type: 'prune-unreachable',
      title: 'Remove unreachable states',
      description: 'States that cannot be reached from the start state are removed before minimization.',
      partitions: [reachableStates, unreachableStates],
      reachableStates,
      unreachableStates,
      logs: [
        `Reachable from ${normalizedDfa.startState}: ${reachableStates.join(', ')}`,
        `Removed as unreachable: ${unreachableStates.join(', ')}`,
      ],
      table: [
        { group: 'Reachable', states: reachableStates, reason: 'Visited from the start state.' },
        { group: 'Unreachable', states: unreachableStates, reason: 'Never visited from the start state.' },
      ],
    });
  }

  const accepting = canonicalize(dfa.states.filter((state) => dfa.acceptStates.includes(state)));
  const nonAccepting = canonicalize(dfa.states.filter((state) => !dfa.acceptStates.includes(state)));
  const initialPartitions = [nonAccepting, accepting].filter((group) => group.length > 0);

  steps.push({
    type: 'initial-partition',
    title: 'Initial partition',
    description: 'Split reachable states into accepting and non-accepting groups.',
    partitions: initialPartitions,
    logs: [
      `Non-accepting: ${nonAccepting.length ? nonAccepting.join(', ') : 'none'}`,
      `Accepting: ${accepting.length ? accepting.join(', ') : 'none'}`,
    ],
    table: initialPartitions.map((group, index) => ({
      group: `P${index}`,
      states: group,
      reason: index === 0 && nonAccepting.length ? 'Non-accepting reachable states' : 'Accepting reachable states',
    })),
  });

  let partitions = initialPartitions;
  let changed = true;
  let iteration = 1;

  while (changed) {
    changed = false;
    const nextPartitions = [];
    const logs = [];
    const splitDetails = [];
    const table = [];

    partitions.forEach((group, groupIndex) => {
      const buckets = new Map();

      group.forEach((state) => {
        const signature = buildTransitionSignature(dfa, partitions, state);
        const signatureKey = JSON.stringify(signature);
        if (!buckets.has(signatureKey)) {
          buckets.set(signatureKey, { states: [], signature });
        }
        buckets.get(signatureKey).states.push(state);
      });

      const bucketList = [...buckets.values()].map((bucket) => ({
        states: canonicalize(bucket.states),
        signature: bucket.signature,
      }));

      bucketList.forEach((bucket, bucketIndex) => {
        nextPartitions.push(bucket.states);
        table.push({
          previousGroup: `P${groupIndex}`,
          nextGroup: `N${nextPartitions.length - 1}`,
          states: bucket.states,
          signature: bucket.signature,
        });
        if (bucketIndex > 0) changed = true;
      });

      if (bucketList.length > 1) {
        changed = true;
        logs.push(`Group P${groupIndex} split into ${bucketList.length} blocks.`);
        const base = bucketList[0];
        bucketList.slice(1).forEach((bucket) => {
          const difference = dfa.alphabet
            .map((symbol) => ({ symbol, left: base.signature[symbol], right: bucket.signature[symbol] }))
            .find((entry) => entry.left !== entry.right);

          splitDetails.push({
            sourceGroup: `P${groupIndex}`,
            keptStates: base.states,
            separatedStates: bucket.states,
            symbol: difference?.symbol ?? null,
            leftTargetGroup: difference?.left ?? null,
            rightTargetGroup: difference?.right ?? null,
            message: difference
              ? `${base.states.join(', ')} and ${bucket.states.join(', ')} differ on symbol "${difference.symbol}".`
              : `${base.states.join(', ')} and ${bucket.states.join(', ')} have different transition signatures.`,
          });
        });
      } else {
        logs.push(`Group P${groupIndex} stays together with signature ${JSON.stringify(bucketList[0].signature)}.`);
      }
    });

    if (changed) {
      steps.push({
        type: 'refinement',
        title: `Refinement iteration ${iteration}`,
        description: 'Refine groups by comparing where each state transitions under every symbol.',
        partitions: nextPartitions,
        previousPartitions: partitions,
        splitDetails,
        logs,
        table,
      });
      partitions = nextPartitions;
      iteration += 1;
    }
  }

  const namedGroups = partitions.map((group, index) => ({ id: `M${index}`, states: group }));
  const stateMapping = Object.fromEntries(namedGroups.flatMap((group) => group.states.map((state) => [state, group.id])));

  const minimizedDfa = {
    states: namedGroups.map((group) => group.id),
    alphabet: dfa.alphabet,
    transitions: Object.fromEntries(
      namedGroups.map((group) => {
        const representative = group.states[0];
        return [
          group.id,
          Object.fromEntries(dfa.alphabet.map((symbol) => [symbol, stateMapping[dfa.transitions[representative][symbol]]])),
        ];
      }),
    ),
    startState: stateMapping[dfa.startState],
    acceptStates: namedGroups
      .filter((group) => group.states.some((state) => dfa.acceptStates.includes(state)))
      .map((group) => group.id),
    groups: namedGroups,
    stateMapping,
  };

  steps.push({
    type: 'final',
    title: 'Minimized DFA',
    description: 'Each stable block becomes one state in the minimized automaton.',
    partitions,
    logs: namedGroups.map((group) => `${group.id} = {${group.states.join(', ')}}`),
    mapping: stateMapping,
    minimizedDfa,
    table: namedGroups.map((group) => ({
      minimizedState: group.id,
      originalStates: group.states,
      isAccepting: group.states.some((state) => dfa.acceptStates.includes(state)),
    })),
  });

  return {
    originalDfa: normalizedDfa,
    workingDfa: dfa,
    reachableStates,
    unreachableStates,
    steps,
    minimizedDfa,
  };
}
