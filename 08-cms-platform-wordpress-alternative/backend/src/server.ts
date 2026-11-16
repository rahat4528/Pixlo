import { createApp } from './app';

const PORT = process.env.PORT || 4008;
const app = createApp();

app.listen(PORT, () => {
  console.log(`[08-cms-platform-wordpress-alternative] Server listening on http://localhost:${PORT}`);
});
