const { prepareAll, prepareGet, prepareRun } = require('../db');

const notificationController = {
  async getAll(req, res) {
    res.json(await prepareAll('SELECT * FROM notifications WHERE farmer_id = ? ORDER BY sent_at DESC LIMIT 50', [req.farmer.id]));
  },
  async markRead(req, res) {
    await prepareRun('UPDATE notifications SET is_read = 1 WHERE id = ? AND farmer_id = ?', [req.params.id, req.farmer.id]);
    res.json({ success: true });
  },
  async markAllRead(req, res) {
    await prepareRun('UPDATE notifications SET is_read = 1 WHERE farmer_id = ?', [req.farmer.id]);
    res.json({ success: true });
  },
  async getUnreadCount(req, res) {
    const result = await prepareGet('SELECT COUNT(*) as count FROM notifications WHERE farmer_id = ? AND is_read = 0', [req.farmer.id]);
    res.json({ unread: result ? result.count : 0 });
  }
};

module.exports = notificationController;
