import cors from 'cors';
import express from 'express';
import { examples } from './data/examples.js';
import { minimizeDfa, validateDfa } from './utils/dfaMinimizer.js';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'dfa-minimizer-api' });
});

app.get('/api/examples', (_req, res) => {
  res.json({ examples });
});

app.post('/api/minimize', (req, res) => {
  const errors = validateDfa(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const result = minimizeDfa(req.body);
  return res.json(result);
});

app.listen(port, () => {
  console.log(`DFA minimizer API listening on http://localhost:${port}`);
});
