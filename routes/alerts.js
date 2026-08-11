const { Router } = require('express');
const db = require('../db');
const { validateAlert } = require('../validation/alertValidation');
const { requireApiKey } = require('../middleware/auth');

const router = Router();

// every price_alerts operation is restricted to authenticated (API-key) requests,
// since alerts contain personal data (the alert's email field)
router.use(requireApiKey);

const SORTABLE_FIELDS = ['target_price', 'created_at', 'updated_at', 'direction', 'is_triggered', 'email'];

function parseSort(sortParam, fallback = 'id') {
  if (!sortParam) return { column: fallback, direction: 'ASC' };
  const direction = sortParam.startsWith('-') ? 'DESC' : 'ASC';
  const column = sortParam.replace(/^-/, '');
  if (!SORTABLE_FIELDS.includes(column)) return { column: fallback, direction: 'ASC' };
  return { column, direction };
}

// GET /alerts - list, with pagination, multi-field search, sort
router.get('/', (req, res) => {
  const limit = req.query.limit !== undefined ? Number(req.query.limit) : 20;
  const offset = req.query.offset !== undefined ? Number(req.query.offset) : 0;

  if (!Number.isInteger(limit) || limit <= 0 || !Number.isInteger(offset) || offset < 0) {
    return res.status(400).json({ success: false, error: 'limit must be a positive integer, offset a non-negative integer' });
  }

  const conditions = [];
  const params = {};

  if (req.query.email) {
    conditions.push('email LIKE @email');
    params.email = `%${req.query.email}%`;
  }
  if (req.query.asset_id) {
    conditions.push('asset_id = @asset_id');
    params.asset_id = Number(req.query.asset_id);
  }
  if (req.query.direction) {
    conditions.push('direction = @direction');
    params.direction = req.query.direction;
  }
  if (req.query.is_triggered !== undefined) {
    conditions.push('is_triggered = @is_triggered');
    params.is_triggered = req.query.is_triggered === 'true' ? 1 : 0;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { column, direction } = parseSort(req.query.sort);

  const total = db.prepare(`SELECT COUNT(*) AS count FROM price_alerts ${whereClause}`).get(params).count;
  const rows = db
    .prepare(`SELECT * FROM price_alerts ${whereClause} ORDER BY ${column} ${direction} LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit, offset });

  res.json({ success: true, data: rows, pagination: { limit, offset, total } });
});

// GET /alerts/:id - detail
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
  const alert = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(id);
  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }
  res.json({ success: true, data: alert });
});

// POST /alerts - create, runs the cross-field business-rule validation
router.post('/', (req, res) => {
  const validation = validateAlert(req.body, db);
  if (!validation.valid) {
    return res.status(400).json({ success: false, errors: validation.errors });
  }

  const { asset_id, email, direction, target_price } = req.body;

  const result = db
    .prepare('INSERT INTO price_alerts (asset_id, email, direction, target_price) VALUES (?, ?, ?, ?)')
    .run(Number(asset_id), email.trim(), direction, Number(target_price));

  const created = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: created });
});

// PUT /alerts/:id - update (e.g. change target_price), re-runs the cross-field validation
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
  const existing = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }

  const validation = validateAlert(req.body, db, { isUpdate: true, existingAlert: existing });
  if (!validation.valid) {
    return res.status(400).json({ success: false, errors: validation.errors });
  }

  const next = {
    asset_id: req.body.asset_id !== undefined ? Number(req.body.asset_id) : existing.asset_id,
    email: req.body.email !== undefined ? req.body.email.trim() : existing.email,
    direction: req.body.direction !== undefined ? req.body.direction : existing.direction,
    target_price: req.body.target_price !== undefined ? Number(req.body.target_price) : existing.target_price
  };

  db.prepare(`
    UPDATE price_alerts SET asset_id = ?, email = ?, direction = ?, target_price = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(next.asset_id, next.email, next.direction, next.target_price, id);

  const updated = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(id);
  res.json({ success: true, data: updated });
});

// DELETE /alerts/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
  const existing = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }
  db.prepare('DELETE FROM price_alerts WHERE id = ?').run(id);
  res.json({ success: true, message: 'Alert deleted' });
});

module.exports = router;
