const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
app.use(express.json());

// -------------------------------------------------------------------------- //

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: '/data' }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('ready', () => console.log('[INFO] event: ready'));
client.on('authenticated', () => console.log('[INFO] event: authenticated'));
client.on('change_state', (state) => console.log(`[INFO] event: change_state: ${state}`));
client.on('disconnected', (reason) => console.log(`[INFO] event: disconnected: ${reason}`));
client.on('auth_failure', (message) => console.log(`[ERROR] event: auth_failure: ${message}`));

client.initialize();

// -------------------------------------------------------------------------- //

app.post('/connect', async (req, res) => {
  const { number } = req.body;
  const code = await client.requestPairingCode(number);
  return res.json({ code });
});

app.post('/send', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({
      error: 'number and message are required'
    });
  }

  try {
    const chatId = `${number}@c.us`;
    await client.sendMessage(chatId, message);

    res.json({
      success: true,
      number,
      message
    });
  } catch (err) {
    console.error('[ERROR] Failed to send message:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('[INFO] Server listening on port', process.env.PORT || 3000);
});
