import { localExamples } from '../data/examples';
import { minimizeDfaLocal } from './minimizer';

export async function fetchExamples() {
  try {
    const response = await fetch('/api/examples');
    if (!response.ok) {
      throw new Error('Unable to load examples from the backend.');
    }
    const payload = await response.json();
    return {
      examples: {
        ...localExamples,
        ...(payload.examples ?? {}),
      },
      source: 'backend',
    };
  } catch {
    return {
      examples: localExamples,
      source: 'local',
    };
  }
}

export async function minimizeDfa(dfa) {
  try {
    const response = await fetch('/api/minimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dfa),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.errors?.join(' ') || 'Minimization failed.');
    }

    return {
      ...payload,
      source: 'backend',
    };
  } catch {
    return {
      ...minimizeDfaLocal(dfa),
      source: 'local',
    };
  }
}
