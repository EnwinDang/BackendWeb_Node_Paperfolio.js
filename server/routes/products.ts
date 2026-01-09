import { Router, Request, Response } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsWithPagination,
  searchProducts,
  getProductsByCategory,
  getCategoryById
} from '../db';
import { validateProduct, validatePagination } from '../validation';

const router = Router();

// get all
router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await getAllProducts();
    res.json({ success: true, data: products, count: products.length });
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

    const result = await getProductsWithPagination(limit, offset);
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
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Zoekterm verplicht' });
    }
    if (categoryId !== undefined && (isNaN(categoryId) || categoryId <= 0)) {
      return res.status(400).json({ success: false, error: 'Ongeldig categorie ID' });
    }

    const products = await searchProducts(q.trim(), categoryId);
    res.json({ success: true, data: products, count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// get by category
router.get('/category/:categoryId', async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.categoryId);
    if (isNaN(categoryId) || categoryId <= 0) {
      return res.status(400).json({ success: false, error: 'Ongeldig ID' });
    }
    const category = await getCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Categorie niet gevonden' });
    }
    const products = await getProductsByCategory(categoryId);
    res.json({ success: true, data: products, count: products.length });
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
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Niet gevonden' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// create
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = validateProduct(req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { name, description, price, stock, categoryId } = req.body;

    if (categoryId) {
      const cat = await getCategoryById(Number(categoryId));
      if (!cat) {
        return res.status(400).json({ success: false, error: 'Categorie bestaat niet' });
      }
    }

    const result = await createProduct({
      name: name.trim(),
      description: description?.trim() || null,
      price: String(price),
      stock: stock !== undefined ? Number(stock) : 0,
      categoryId: categoryId ? Number(categoryId) : null
    });

    const newProduct = await getProductById(result.id);
    res.status(201).json({ success: true, data: newProduct });
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
    const existing = await getProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Niet gevonden' });
    }

    const validation = validateProduct(req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { name, description, price, stock, categoryId } = req.body;

    if (categoryId) {
      const cat = await getCategoryById(Number(categoryId));
      if (!cat) {
        return res.status(400).json({ success: false, error: 'Categorie bestaat niet' });
      }
    }

    await updateProduct(id, {
      name: name.trim(),
      description: description?.trim() || null,
      price: String(price),
      stock: stock !== undefined ? Number(stock) : 0,
      categoryId: categoryId ? Number(categoryId) : null
    });

    const updated = await getProductById(id);
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
    const existing = await getProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Niet gevonden' });
    }

    const validation = validateProduct(req.body, true);
    if (!validation.valid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const updateData: Record<string, unknown> = {};
    if (req.body.name !== undefined) updateData.name = req.body.name.trim();
    if (req.body.description !== undefined) updateData.description = req.body.description?.trim() || null;
    if (req.body.price !== undefined) updateData.price = String(req.body.price);
    if (req.body.stock !== undefined) updateData.stock = Number(req.body.stock);
    if (req.body.categoryId !== undefined) {
      if (req.body.categoryId === null) {
        updateData.categoryId = null;
      } else {
        const cat = await getCategoryById(Number(req.body.categoryId));
        if (!cat) {
          return res.status(400).json({ success: false, error: 'Categorie bestaat niet' });
        }
        updateData.categoryId = Number(req.body.categoryId);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'Geen data' });
    }

    await updateProduct(id, updateData);
    const updated = await getProductById(id);
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
    const existing = await getProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Niet gevonden' });
    }
    await deleteProduct(id);
    res.json({ success: true, message: 'Verwijderd' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
