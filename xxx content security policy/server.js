import express from 'express';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use((_req, res, next) => {
  // TODO: Add middleware
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(3000, () => {
  console.log('App runs on port 3000')
});
