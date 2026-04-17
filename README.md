# DFA Minimization Visualizer

A student-friendly web application for exploring DFA minimization through partition refinement. The app lets you enter a DFA using a form or raw JSON, runs the minimization step by step, shows partition tables and split reasons, and renders both the original and minimized automata graphically.

# Live Demo: https://dfa-minimizer.netlify.app/

## Folder Structure

```text
.
├── backend
│   ├── package.json
│   └── src
│       ├── data
│       │   └── examples.js
│       ├── server.js
│       └── utils
│           └── dfaMinimizer.js
├── frontend
│   ├── package.json
│   ├── src
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── DfaForm.jsx
│   │   │   ├── GraphPanel.jsx
│   │   │   ├── JsonEditor.jsx
│   │   │   ├── MinimizedSummary.jsx
│   │   │   ├── PartitionTable.jsx
│   │   │   └── StepInsights.jsx
│   │   ├── data
│   │   │   └── defaultDfa.js
│   │   ├── lib
│   │   │   ├── api.js
│   │   │   ├── dfaHelpers.js
│   │   │   └── graph.js
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
└── README.md
```

## Features

- Form-based DFA input
- JSON DFA input
- Backend DFA validation and minimization
- Step-by-step partition refinement walkthrough
- Iteration tables with split reasons
- React Flow graph visualization
- Previous / Next step navigation
- Reset, example, save/load, and export JSON actions

## Local Run

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start the backend

```bash
cd backend
npm run dev
```

Server runs at `http://localhost:3001`.

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies API calls to the backend.

## Sample DFA

```json
{
  "states": ["q0", "q1", "q2", "q3", "q4", "q5"],
  "alphabet": ["0", "1"],
  "transitions": {
    "q0": { "0": "q1", "1": "q2" },
    "q1": { "0": "q3", "1": "q4" },
    "q2": { "0": "q3", "1": "q4" },
    "q3": { "0": "q3", "1": "q5" },
    "q4": { "0": "q3", "1": "q5" },
    "q5": { "0": "q5", "1": "q5" }
  },
  "startState": "q0",
  "acceptStates": ["q5"]
}
```

## API

### `GET /api/examples`
Returns bundled example DFAs.

### `POST /api/minimize`
Validates the DFA and returns:

- `originalDfa`
- `steps`
- `minimizedDfa`

## Notes

- The minimization logic uses partition refinement.
- Each refinement step groups states by their transition signature into the previous partition.
- The final stable partition becomes the minimized DFA.
