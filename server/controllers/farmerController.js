const { prepareGet, prepareRun } = require('../db');

const farmerController = {
  async getProfile(req, res) {
    const farmer = await prepareGet(
      'SELECT id, name, mobile, farmer_id, village, district, state, land_size, crop_types, preferred_language, notification_prefs, created_at FROM farmers WHERE id = ?',
      [req.params.id]
    );

    if (!farmer) return res.status(404).json({ error: 'Farmer not found.' });

    farmer.crop_types = typeof farmer.crop_types === 'string' ? JSON.parse(farmer.crop_types || '[]') : (farmer.crop_types || []);
    farmer.notification_prefs = typeof farmer.notification_prefs === 'string' ? JSON.parse(farmer.notification_prefs || '{}') : (farmer.notification_prefs || {});
    res.json(farmer);
  },

  async updateProfile(req, res) {
    const { name, village, district, state, land_size, crop_types, preferred_language, notification_prefs } = req.body;
    const farmerId = req.params.id;

    if (req.farmer.id !== parseInt(farmerId)) {
      return res.status(403).json({ error: "Cannot update another farmer's profile." });
    }

    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (village) { updates.push('village = ?'); values.push(village); }
    if (district) { updates.push('district = ?'); values.push(district); }
    if (state) { updates.push('state = ?'); values.push(state); }
    if (land_size !== undefined) { updates.push('land_size = ?'); values.push(land_size); }
    if (crop_types) { updates.push('crop_types = ?'); values.push(JSON.stringify(crop_types)); }
    if (preferred_language) { updates.push('preferred_language = ?'); values.push(preferred_language); }
    if (notification_prefs) { updates.push('notification_prefs = ?'); values.push(JSON.stringify(notification_prefs)); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' });

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(parseInt(farmerId));

    await prepareRun(`UPDATE farmers SET ${updates.join(', ')} WHERE id = ?`, values);

    const updated = await prepareGet(
      'SELECT id, name, mobile, farmer_id, village, district, state, land_size, crop_types, preferred_language, notification_prefs FROM farmers WHERE id = ?',
      [parseInt(farmerId)]
    );
    updated.crop_types = typeof updated.crop_types === 'string' ? JSON.parse(updated.crop_types || '[]') : (updated.crop_types || []);
    updated.notification_prefs = typeof updated.notification_prefs === 'string' ? JSON.parse(updated.notification_prefs || '{}') : (updated.notification_prefs || {});

    res.json({ success: true, farmer: updated });
  }
};

module.exports = farmerController;
