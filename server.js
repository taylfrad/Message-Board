require('dotenv').config();

const missing = ['MONGODB_URI', 'SESSION_SECRET'].filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(
    `boot failed: missing required env var(s): ${missing.join(', ')}.\n` +
      `On Render: Settings -> Environment -> Add Environment Variable for each one, then Save Changes.`
  );
  process.exit(1);
}

const app = require('./app');
const DatabaseConnection = require('./config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await DatabaseConnection.getInstance().connect();
    app.listen(PORT, () => console.log(`up on ${PORT}`));
  } catch (err) {
    console.error('boot failed:', err.message);
    process.exit(1);
  }
})();
