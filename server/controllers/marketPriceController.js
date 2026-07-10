const { prepareAll } = require('../db');

const marketPriceController = {
  async getAll(req, res) {
    const { crop, mandi, state } = req.query;
    let query = 'SELECT * FROM market_prices';
    const conditions = [];
    const params = [];

    if (crop) { conditions.push('(crop_name LIKE ? OR crop_name_hi LIKE ? OR crop_name_te LIKE ?)'); params.push(`%${crop}%`, `%${crop}%`, `%${crop}%`); }
    if (mandi) { conditions.push('mandi_name LIKE ?'); params.push(`%${mandi}%`); }
    if (state) { conditions.push('state LIKE ?'); params.push(`%${state}%`); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY date_recorded DESC, crop_name ASC';

    res.json(await prepareAll(query, params));
  },

  async getByCrop(req, res) {
    const prices = await prepareAll('SELECT * FROM market_prices WHERE crop_name LIKE ? ORDER BY date_recorded DESC', [`%${req.params.crop}%`]);
    if (prices.length === 0) return res.status(404).json({ error: 'No prices found for this crop.' });
    res.json(prices);
  }
};

module.exports = marketPriceController;
