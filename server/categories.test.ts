/**
 * Tests voor de Categories API endpoints
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { validateCategory, validatePagination } from "./validation";

// Mock de database functies
vi.mock("./db", () => ({
  getAllCategories: vi.fn(),
  getCategoryById: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  getCategoriesWithPagination: vi.fn(),
  searchCategories: vi.fn(),
}));

describe("Category Validation", () => {
  describe("validateCategory", () => {
    it("should reject empty name", () => {
      const result = validateCategory({ name: "" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: "name" })
      );
    });

    it("should reject name with numbers", () => {
      const result = validateCategory({ name: "Test123" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "name",
          message: expect.stringContaining("cijfers"),
        })
      );
    });

    it("should accept valid category data", () => {
      const result = validateCategory({
        name: "Elektronica",
        description: "Elektronische apparaten",
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept category without description", () => {
      const result = validateCategory({ name: "Kleding" });
      expect(result.valid).toBe(true);
    });

    it("should allow partial updates when isUpdate is true", () => {
      const result = validateCategory({ description: "Nieuwe beschrijving" }, true);
      expect(result.valid).toBe(true);
    });

    it("should reject invalid description type", () => {
      const result = validateCategory({ name: "Test", description: 123 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: "description" })
      );
    });
  });
});

describe("Pagination Validation", () => {
  describe("validatePagination", () => {
    it("should accept valid pagination parameters", () => {
      const result = validatePagination(10, 0);
      expect(result.valid).toBe(true);
    });

    it("should reject negative limit", () => {
      const result = validatePagination(-5, 0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: "limit" })
      );
    });

    it("should reject zero limit", () => {
      const result = validatePagination(0, 0);
      expect(result.valid).toBe(false);
    });

    it("should reject negative offset", () => {
      const result = validatePagination(10, -5);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: "offset" })
      );
    });

    it("should accept zero offset", () => {
      const result = validatePagination(10, 0);
      expect(result.valid).toBe(true);
    });

    it("should reject non-integer limit", () => {
      const result = validatePagination(10.5, 0);
      expect(result.valid).toBe(false);
    });

    it("should reject string limit", () => {
      const result = validatePagination("abc", 0);
      expect(result.valid).toBe(false);
    });
  });
});
