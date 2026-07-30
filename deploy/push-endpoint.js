// ---------------------------------------------------------------------------
// push-endpoint.js — Add this to your Heroku WhatsApp bot Express server
//
// This adds a POST /api/push endpoint that sends Web Push notifications
// to browser endpoints using the web-push library.
//
// SETUP:
//   1. npm install web-push
//   2. Add these env vars to Heroku:
//      VAPID_PUBLIC_KEY=BFZVN5aWgdI7hAiFH162fQkadhHwewq1WKrcCVN7BaCcRCLGPztolIQTAy3FqlYo6SEiNaIrKSIzN1LDrIBO804
//      VAPID_PRIVATE_KEY=8ptjAazSzen3COa3HMtaUQMdg_DVoHzR5bcmVKbBU0U
//      VAPID_EMAIL=mailto:yosua@famfin.app
//   3. Add the route to your Express app (see below)
// ---------------------------------------------------------------------------

const webpush = require('web-push');

// Configure VAPID keys from environment variables
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@famfin.app',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * POST /api/push
 * Body: {
 *   subscription: { endpoint, keys: { p256dh, auth } },
 *   payload: { title, body, icon, data, tag }
 * }
 */
function pushRoute(req, res) {
  const { subscription, payload } = req.body;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: 'Missing subscription data' });
  }

  const pushPayload = JSON.stringify(payload || { title: 'FamFin', body: 'New notification' });

  webpush.sendNotification(subscription, pushPayload)
    .then(() => {
      res.json({ success: true });
    })
    .catch((err) => {
      console.error('[WebPush] Send error:', err.statusCode, err.body);
      // 410 Gone or 404 = subscription expired, client should clean up
      if (err.statusCode === 410 || err.statusCode === 404) {
        res.status(410).json({ error: 'Subscription expired', expired: true });
      } else {
        res.status(500).json({ error: 'Push failed', details: err.message });
      }
    });
}

module.exports = { pushRoute };

// ---------------------------------------------------------------------------
// Usage in your Express server (e.g., server.js or index.js):
//
//   const { pushRoute } = require('./push-endpoint');
//   app.post('/api/push', authMiddleware, pushRoute);
//
// Where authMiddleware checks the x-api-key header.
// ---------------------------------------------------------------------------
