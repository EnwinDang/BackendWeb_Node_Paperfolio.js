import { eq, like, sql, and, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, products, InsertCategory, InsertProduct, Category, Product } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER QUERIES ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ CATEGORY QUERIES ============

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

export async function getCategoryById(id: number): Promise<Category | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertCategory): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateCategory(id: number, data: Partial<InsertCategory>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(categories).set(data).where(eq(categories.id, id));
  return result[0].affectedRows > 0;
}

export async function deleteCategory(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.delete(categories).where(eq(categories.id, id));
  return result[0].affectedRows > 0;
}

export async function getCategoriesWithPagination(limit: number, offset: number): Promise<{ data: Category[]; total: number }> {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const data = await db.select().from(categories).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(categories);
  const total = Number(countResult[0]?.count || 0);
  
  return { data, total };
}

export async function searchCategories(searchTerm: string): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(categories).where(
    or(
      like(categories.name, `%${searchTerm}%`),
      like(categories.description, `%${searchTerm}%`)
    )
  );
}

// ============ PRODUCT QUERIES ============

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products);
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: InsertProduct): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateProduct(id: number, data: Partial<InsertProduct>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(products).set(data).where(eq(products.id, id));
  return result[0].affectedRows > 0;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.delete(products).where(eq(products.id, id));
  return result[0].affectedRows > 0;
}

export async function getProductsWithPagination(limit: number, offset: number): Promise<{ data: Product[]; total: number }> {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const data = await db.select().from(products).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(products);
  const total = Number(countResult[0]?.count || 0);
  
  return { data, total };
}

export async function searchProducts(searchTerm: string, categoryId?: number): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    or(
      like(products.name, `%${searchTerm}%`),
      like(products.description, `%${searchTerm}%`)
    )
  ];
  
  if (categoryId !== undefined) {
    conditions.push(eq(products.categoryId, categoryId));
  }
  
  return db.select().from(products).where(and(...conditions));
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.categoryId, categoryId));
}
