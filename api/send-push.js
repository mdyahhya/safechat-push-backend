import webpush from 'web-push';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chatId, senderId, messageText, recipients } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients' });
    }

    // Your VAPID keys (from vapidkeys.com)
    const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const payload = JSON.stringify({
      title: `New message from ${req.body.senderName || 'Someone'}`,
      body: `SafeChat • ${timestamp}`,
      data: {
        chatId,
        senderId
      }
    });

    // Send push to all recipients
    const promises = recipients.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload);
      } catch (error) {
        console.error('Push error:', error);
      }
    });

    await Promise.all(promises);

    return res.status(200).json({ success: true, sent: recipients.length });

  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ error: error.message });
  }
}
