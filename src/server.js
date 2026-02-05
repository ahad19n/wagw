const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
  }
});

client.on('qr', (qr) => {
  console.log('[INFO] Scan this QR code to log in:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('[INFO] WhatsApp client is ready');
});

client.initialize();

app.post('/send', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      error: 'phone and message are required'
    });
  }

  try {
    const chatId = `${phone}@c.us`;
    await client.sendMessage(chatId, message);

    res.json({
      success: true,
      phone,
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
