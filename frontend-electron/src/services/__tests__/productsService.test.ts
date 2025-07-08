import { ProductsService, Product } from "../productsService";

// Mock the api module
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();
const mockHandleApiError = jest.fn();

jest.mock("../api", () => ({
  api: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
  handleApiError: (...args: any[]) => mockHandleApiError(...args),
}));

describe("ProductsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up the mock to return 'API Error' by default
    mockHandleApiError.mockReturnValue("API Error");
  });

  const mockProduct: Product = {
    id: 1,
    name: "Test Product",
    description: "A test product",
    price: 9.99,
    stock_quantity: 100,
    barcode: "123456789012",
    category_id: 1,
    category_name: "Test Category",
    tax_rate: 0.08,
    is_active: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
  };

  describe("getProducts", () => {
    it("should fetch all products successfully", async () => {
      const mockResponse = {
        data: {
          data: {
            products: [mockProduct],
            count: 1,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.getProducts();

      expect(mockGet).toHaveBeenCalledWith("/products", { params: undefined });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockProduct]);
    });

    it("should fetch products with search parameters", async () => {
      const searchParams = {
        query: "test",
        category: "Test Category",
        minPrice: 1.0,
        maxPrice: 10.0,
        limit: 10,
      };

      const mockResponse = {
        data: {
          data: {
            products: [mockProduct],
            count: 1,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.getProducts(searchParams);

      expect(mockGet).toHaveBeenCalledWith("/products", {
        params: searchParams,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockProduct]);
    });

    it("should handle API errors gracefully", async () => {
      const error = new Error("Network error");
      mockGet.mockRejectedValueOnce(error);

      const result = await ProductsService.getProducts();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.error).toBe("API Error");
    });
  });

  describe("getProductById", () => {
    it("should fetch a product by ID successfully", async () => {
      const mockResponse = {
        data: {
          data: {
            product: mockProduct,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.getProductById(1);

      expect(mockGet).toHaveBeenCalledWith("/products/1");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });

    it("should handle product not found", async () => {
      const error = new Error("Product not found");
      mockGet.mockRejectedValueOnce(error);

      const result = await ProductsService.getProductById(999);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe("API Error");
    });
  });

  describe("getProductByBarcode", () => {
    it("should fetch a product by barcode successfully", async () => {
      const mockResponse = {
        data: {
          data: {
            product: mockProduct,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.getProductByBarcode("123456789012");

      expect(mockGet).toHaveBeenCalledWith("/products/barcode/123456789012");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });

    it("should handle barcode not found", async () => {
      const error = new Error("Product not found");
      mockGet.mockRejectedValueOnce(error);

      const result = await ProductsService.getProductByBarcode("999999999999");

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe("API Error");
    });
  });

  describe("searchProducts", () => {
    it("should search products with query and parameters", async () => {
      const mockResponse = {
        data: {
          data: {
            products: [mockProduct],
            count: 1,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.searchProducts("test", {
        category: "Test Category",
        limit: 5,
      });

      expect(mockGet).toHaveBeenCalledWith("/products", {
        params: {
          query: "test",
          category: "Test Category",
          limit: 5,
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockProduct]);
    });
  });

  describe("createProduct", () => {
    it("should create a new product successfully", async () => {
      const productData = {
        name: "New Product",
        price: 19.99,
        stock_quantity: 50,
        barcode: "987654321098",
      };

      // The createProduct method returns the raw response, not just the product
      const mockResponse = {
        data: {
          data: {
            product: mockProduct,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.createProduct(productData);

      expect(mockPost).toHaveBeenCalledWith("/products", productData);
      expect(result.success).toBe(true);
      // createProduct returns the full response data, not just the product
      expect(result.data).toEqual({
        product: mockProduct,
        timestamp: "2023-01-01T00:00:00.000Z",
      });
    });

    it("should handle creation errors", async () => {
      const productData = {
        name: "New Product",
        price: 19.99,
        stock_quantity: 50,
        barcode: "987654321098",
      };

      const error = new Error("Validation failed");
      mockPost.mockRejectedValueOnce(error);

      const result = await ProductsService.createProduct(productData);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe("API Error");
    });
  });

  describe("updateProduct", () => {
    it("should update a product successfully", async () => {
      const updateData = {
        name: "Updated Product",
        price: 29.99,
      };

      // The updateProduct method returns the raw response, not just the product
      const mockResponse = {
        data: {
          data: {
            product: mockProduct,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockPut.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.updateProduct(1, updateData);

      expect(mockPut).toHaveBeenCalledWith("/products/1", updateData);
      expect(result.success).toBe(true);
      // updateProduct returns the full response data, not just the product
      expect(result.data).toEqual({
        product: mockProduct,
        timestamp: "2023-01-01T00:00:00.000Z",
      });
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product successfully (soft delete)", async () => {
      const mockResponse = {
        data: {
          data: {},
        },
      };
      mockDelete.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.deleteProduct(1);

      expect(mockDelete).toHaveBeenCalledWith("/products/1", {
        params: undefined,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it("should delete a product with hard delete", async () => {
      const mockResponse = {
        data: {
          data: {},
        },
      };
      mockDelete.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.deleteProduct(1, true);

      expect(mockDelete).toHaveBeenCalledWith("/products/1", {
        params: { hard: "true" },
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });

  describe("getLowStockProducts", () => {
    it("should fetch low stock products with default threshold", async () => {
      const mockResponse = {
        data: {
          data: {
            products: [mockProduct],
            count: 1,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.getLowStockProducts();

      expect(mockGet).toHaveBeenCalledWith("/products", {
        params: {
          lowStock: true,
          stockThreshold: 5,
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockProduct]);
    });

    it("should fetch low stock products with custom threshold", async () => {
      const mockResponse = {
        data: {
          data: {
            products: [mockProduct],
            count: 1,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.getLowStockProducts(10);

      expect(mockGet).toHaveBeenCalledWith("/products", {
        params: {
          lowStock: true,
          stockThreshold: 10,
        },
      });
    });
  });

  describe("getProductsByCategory", () => {
    it("should fetch products by category", async () => {
      const mockResponse = {
        data: {
          data: {
            products: [mockProduct],
            count: 1,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.getProductsByCategory(
        "Test Category"
      );

      expect(mockGet).toHaveBeenCalledWith("/products", {
        params: { category: "Test Category" },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockProduct]);
    });
  });

  describe("getCategories", () => {
    it("should fetch categories from dedicated endpoint", async () => {
      const mockResponse = {
        data: {
          data: ["Category 1", "Category 2"],
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.getCategories();

      expect(mockGet).toHaveBeenCalledWith("/products/categories");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(["Category 1", "Category 2"]);
    });

    it("should fallback to extracting categories from products", async () => {
      // First call fails (categories endpoint doesn't exist)
      const error = new Error("Not found");
      mockGet.mockRejectedValueOnce(error);

      // Second call succeeds (fallback to get all products)
      const productsWithCategories = {
        data: {
          data: {
            products: [
              { ...mockProduct, category_name: "Category 1" },
              { ...mockProduct, id: 2, category_name: "Category 2" },
              { ...mockProduct, id: 3, category_name: "Category 1" }, // Duplicate
            ],
          },
        },
      };
      mockGet.mockResolvedValueOnce(productsWithCategories);

      const result = await ProductsService.getCategories();

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(["Category 1", "Category 2"]); // Unique categories
    });
  });

  describe("isBarcodeAvailable", () => {
    it("should return true when barcode is not found (available)", async () => {
      const error = new Error("Product not found");
      mockGet.mockRejectedValueOnce(error);

      const result = await ProductsService.isBarcodeAvailable("999999999999");

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it("should return false when barcode is found (not available)", async () => {
      const mockResponse = {
        data: {
          data: {
            product: mockProduct,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.isBarcodeAvailable("123456789012");

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });

    it("should return true when barcode belongs to excluded product", async () => {
      const mockResponse = {
        data: {
          data: {
            product: mockProduct,
            timestamp: "2023-01-01T00:00:00.000Z",
          },
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await ProductsService.isBarcodeAvailable(
        "123456789012",
        1
      ); // Exclude product ID 1

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });
});
