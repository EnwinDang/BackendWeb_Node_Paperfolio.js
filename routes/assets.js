const { Router } = require('express');
const db = require('../db');
const { validateAsset } = require('../validation/assetValidation');
const { requireApiKey } = require('../middleware/auth');

const router = Router();

const SORTABLE_FIELDS = ['name', 'symbol', 'category', 'current_price', 'created_at', 'updated_at'];

function parseSort(sortParam, fallback = 'id') {
  if (!sortParam) return { column: fallback, direction: 'ASC' };
  const direction = sortParam.startsWith('-') ? 'DESC' : 'ASC';
  const column = sortParam.replace(/^-/, '');
  if (!SORTABLE_FIELDS.includes(column)) return { column: fallback, direction: 'ASC' };
  return { column, direction };
}

function triggerAlerts(assetId, newPrice) {
  const pendingAlerts = db
    .prepare('SELECT * FROM price_alerts WHERE asset_id = ? AND is_triggered = 0')
    .all(assetId);

  const trigger = db.prepare(`
    UPDATE price_alerts SET is_triggered = 1, triggered_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `);

  let triggeredCount = 0;
  for (const alert of pendingAlerts) {
    const qualifies =
      (alert.direction === 'above' && newPrice >= alert.target_price) ||
      (alert.direction === 'below' && newPrice <= alert.target_price);
    if (qualifies) {
      trigger.run(alert.id);
      triggeredCount += 1;
    }
  }
  return triggeredCount;
}

// GET /assets - list, with pagination, search, sort (public)
router.get('/', (req, res) => {
  const limit = req.query.limit !== undefined ? Number(req.query.limit) : 20;
  const offset = req.query.offset !== undefined ? Number(req.query.offset) : 0;

  if (!Number.isInteger(limit) || limit <= 0 || !Number.isInteger(offset) || offset < 0) {
    return res.status(400).json({ success: false, error: 'limit must be a positive integer, offset a non-negative integer' });
  }

  const conditions = [];
  const params = {};

  if (req.query.name) {
    conditions.push('name LIKE @name');
    params.name = `%${req.query.name}%`;
  }
  if (req.query.symbol) {
    conditions.push('symbol LIKE @symbol');
    params.symbol = `%${req.query.symbol}%`;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { column, direction } = parseSort(req.query.sort);

  const total = db.prepare(`SELECT COUNT(*) AS count FROM assets ${whereClause}`).get(params).count;
  const rows = db
    .prepare(`SELECT * FROM assets ${whereClause} ORDER BY ${column} ${direction} LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit, offset });

  res.json({ success: true, data: rows, pagination: { limit, offset, total } });
});

// GET /assets/:id - detail (public)
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  if (!asset) {
    return res.status(404).json({ success: false, error: 'Asset not found' });
  }
  res.json({ success: true, data: asset });
});

// POST /assets - create (requires API key)
router.post('/', requireApiKey, (req, res) => {
  const validation = validateAsset(req.body);
  if (!validation.valid) {
    return res.status(400).json({ success: false, errors: validation.errors });
  }

  const { name, symbol, category, current_price, is_active = true } = req.body;

  const existing = db.prepare('SELECT id FROM assets WHERE symbol = ?').get(symbol);
  if (existing) {
    return res.status(409).json({ success: false, error: 'An asset with this symbol already exists' });
  }

  const result = db
    .prepare('INSERT INTO assets (name, symbol, category, current_price, is_active) VALUES (?, ?, ?, ?, ?)')
    .run(name.trim(), symbol, category.trim(), Number(current_price), is_active ? 1 : 0);

  const created = db.prepare('SELECT * FROM assets WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: created });
});

// PUT /assets/:id - update (requires API key); price changes trigger alert evaluation
router.put('/:id', requireApiKey, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
  const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Asset not found' });
  }

  const validation = validateAsset(req.body, true);
  if (!validation.valid) {
    return res.status(400).json({ success: false, errors: validation.errors });
  }

  const next = {
    name: req.body.name !== undefined ? req.body.name.trim() : existing.name,
    symbol: req.body.symbol !== undefined ? req.body.symbol : existing.symbol,
    category: req.body.category !== undefined ? req.body.category.trim() : existing.category,
    current_price: req.body.current_price !== undefined ? Number(req.body.current_price) : existing.current_price,
    is_active: req.body.is_active !== undefined ? (req.body.is_active ? 1 : 0) : existing.is_active
  };

  db.prepare(`
    UPDATE assets SET name = ?, symbol = ?, category = ?, current_price = ?, is_active = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(next.name, next.symbol, next.category, next.current_price, next.is_active, id);

  let triggeredCount = 0;
  if (next.current_price !== existing.current_price) {
    triggeredCount = triggerAlerts(id, next.current_price);
  }

  const updated = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  res.json({ success: true, data: updated, triggeredAlerts: triggeredCount });
});

// DELETE /assets/:id - delete (requires API key)
router.delete('/:id', requireApiKey, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
  const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Asset not found' });
  }
  db.prepare('DELETE FROM assets WHERE id = ?').run(id);
  res.json({ success: true, message: 'Asset deleted' });
});

module.exports = router;
