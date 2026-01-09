/**
 * Tests voor de Products API validatie
 */
import { describe, expect, it, vi } from "vitest";
import { validateProduct } from "./validation";

// Mock de database functies
vi.mock("./db", () => ({
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  getProductsWithPagination: vi.fn(),
  searchProducts: vi.fn(),
  getProductsByCategory: vi.fn(),
  getCategoryById: vi.fn(),
}));

describe("Product Validation", () => {
  describe("validateProduct", () => {
    it("should reject empty name", () => {
      const result = validateProduct({ name: "", price: 10 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: "name" })
      );
    });

    it("should reject name with numbers", () => {
      const result = validateProduct({ name: "Product123", price: 10 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "name",
          message: expect.stringContaining("cijfers"),
        })
      );
    });

    it("should reject empty price", () => {
      const result = validateProduct({ name: "Laptop", price: "" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: "price" })
      );
    });

    it("should reject negative price", () => {
      const result = validateProduct({ name: "Laptop", price: -50 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "price",
          message: expect.stringContaining("groter"),
        })
      );
    });

    it("should reject zero price", () => {
      const result = validateProduct({ name: "Laptop", price: 0 });
      expect(result.valid).toBe(false);
    });

    it("should reject string price", () => {
      const result = validateProduct({ name: "Laptop", price: "abc" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "price",
          message: expect.stringContaining("nummer"),
        })
      );
    });

    it("should accept valid product data", () => {
      const result = validateProduct({
        name: "Laptop",
        description: "Krachtige laptop",
        price: 999.99,
        stock: 50,
        categoryId: 1,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept product without optional fields", () => {
      const result = validateProduct({
        name: "Laptop",
        price: 999.99,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject negative stock", () => {
      const result = validateProduct({
        name: "Laptop",
        price: 100,
        stock: -5,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: "stock" })
      );
    });

    it("should accept zero stock", () => {
      const result = validateProduct({
        name: "Laptop",
        price: 100,
        stock: 0,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject non-integer stock", () => {
      const result = validateProduct({
        name: "Laptop",
        price: 100,
        stock: 5.5,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject invalid categoryId", () => {
      const result = validateProduct({
        name: "Laptop",
        price: 100,
        categoryId: -1,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: "categoryId" })
      );
    });

    it("should allow partial updates when isUpdate is true", () => {
      const result = validateProduct({ price: 899.99 }, true);
      expect(result.valid).toBe(true);
    });

    it("should validate fields provided in partial update", () => {
      const result = validateProduct({ price: -50 }, true);
      expect(result.valid).toBe(false);
    });
  });
});
