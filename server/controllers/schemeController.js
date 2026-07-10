const { prepareAll } = require('../db');

const schemeController = {
  async getAll(req, res) {
    const schemes = await prepareAll('SELECT * FROM schemes WHERE is_active = 1');
    schemes.forEach(s => { s.required_documents = typeof s.required_documents === 'string' ? JSON.parse(s.required_documents || '[]') : (s.required_documents || []); });
    res.json(schemes);
  }
};

module.exports = schemeController;
