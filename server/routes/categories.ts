import { Router, Request, Response } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesWithPagination,
  searchCategories
} from '../db';
import { validateCategory, validatePagination } from '../validation';

const router = Router();

// get all
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();
    res.json({ success: true, data: categories, count: categories.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// get paginated
router.get('/paginated', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    const validation = validatePagination(limit, offset);
    if (!validation.valid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const result = await getCategoriesWithPagination(limit, offset);
    res.json({
      success: true,
      data: result.data,
      pagination: { limit, offset, total: result.total, hasMore: offset + result.data.length < result.total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// search
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Zoekterm verplicht' });
    }
    const categories = await searchCategories(q.trim());
    res.json({ success: true, data: categories, count: categories.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// get one
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'Ongeldig ID' });
    }
    const category = await getCategoryById(id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Niet gevonden' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// create
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = validateCategory(req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }
    const { name, description } = req.body;
    const result = await createCategory({ name: name.trim(), description: description?.trim() || null });
    const newCategory = await getCategoryById(result.id);
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'Ongeldig ID' });
    }
    const existing = await getCategoryById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Niet gevonden' });
    }
    const validation = validateCategory(req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }
    const { name, description } = req.body;
    await updateCategory(id, { name: name.trim(), description: description?.trim() || null });
    const updated = await getCategoryById(id);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// patch
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'Ongeldig ID' });
    }
    const existing = await getCategoryById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Niet gevonden' });
    }
    const validation = validateCategory(req.body, true);
    if (!validation.valid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }
    const updateData: Record<string, unknown> = {};
    if (req.body.name !== undefined) updateData.name = req.body.name.trim();
    if (req.body.description !== undefined) updateData.description = req.body.description?.trim() || null;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'Geen data' });
    }
    await updateCategory(id, updateData);
    const updated = await getCategoryById(id);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'Ongeldig ID' });
    }
    const existing = await getCategoryById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Niet gevonden' });
    }
    await deleteCategory(id);
    res.json({ success: true, message: 'Verwijderd' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
