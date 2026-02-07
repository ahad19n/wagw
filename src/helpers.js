exports.resp = (res, code, message, data = {}) => {
  return res.status(code).json({
    success: (code >= 200 && code <= 299),
    message,
    data
  })
};

exports.apiKeyAuth = (req, res, next) => {
  const { api_key } = req.query;

  if (!api_key) {
    return exports.resp(res, 401, 'Missing API key');
  }

  if (api_key.length !== 32 || api_key !== process.env.API_KEY) {
    return exports.resp(res, 403, 'Invalid API key');
  }

  next();
};

exports.gracefulShutdown = async () => {
  console.log(`[INFO] Shutting down gracefully...`);

  server.close(async () => {
    console.log('[INFO] HTTP server closed');

    try {
      await client.destroy();
      console.log('[INFO] WhatsApp client destroyed');
    } catch (err) {
      console.error('[ERROR] Error during WhatsApp client shutdown:', err);
    }

    process.exit(0);
  });
};
