import { api, ApiResponse, handleApiError, ApiErrorResponse } from "./api";
import { AxiosError } from "axios";

// Product interface
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  barcode?: string;
  category_id?: number;
  category?: string; // Keep for backward compatibility
  category_name?: string; // New field from JOIN query
  image_url?: string;
  tax_rate?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Stock movement interface for tracking inventory changes
export interface StockMovement {
  id: number;
  product_id: number;
  type: "sale" | "restock" | "adjustment" | "return" | "damage" | "transfer";
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  timestamp: string;
  user_id?: number;
  user?: string;
  reference_id?: string; // For linking to sales, purchase orders, etc.
  notes?: string;
}

// Product creation/update payload (without auto-generated fields)
export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  barcode?: string;
  category?: string;
  image_url?: string;
  tax_rate?: number;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

// Search/filter parameters
export interface ProductSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
  sortBy?: "name" | "price" | "stock_quantity" | "created_at";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// Service response wrapper
export interface ProductServiceResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
}

// Backend API response structures
interface BackendProductsResponse {
  products: Product[];
  count: number;
  timestamp: string;
}

interface BackendProductResponse {
  product: Product;
  timestamp: string;
}

export class ProductsService {
  /**
   * Get all products with optional filtering and pagination
   */
  static async getProducts(
    params?: ProductSearchParams
  ): Promise<ProductServiceResponse<Product[]>> {
    try {
      const response = await api.get<BackendProductsResponse | Product[]>(
        "/products",
        { params }
      );

      // Handle different response structures from the backend
      const responseData = response.data.data || response.data;

      // Debug logging
      console.log("🔍 getProducts - Raw response.data:", response.data);
      console.log("🔍 getProducts - responseData:", responseData);

      // Extract products array from the response
      let products: Product[];
      if (
        responseData &&
        typeof responseData === "object" &&
        "products" in responseData
      ) {
        products = (responseData as BackendProductsResponse).products;
        console.log(
          "✅ getProducts - Extracted products from .products property:",
          products
        );
      } else if (Array.isArray(responseData)) {
        products = responseData;
        console.log(
          "✅ getProducts - Using responseData directly as array:",
          products
        );
      } else {
        products = [];
        console.log(
          "❌ getProducts - No valid products found, defaulting to empty array"
        );
      }

      return {
        data: products,
        success: true,
      };
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error("Failed to fetch products:", errorMessage);

      return {
        data: [],
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(
    id: number
  ): Promise<ProductServiceResponse<Product | null>> {
    try {
      const response = await api.get<BackendProductResponse>(`/products/${id}`);

      // Handle single product response structure
      const responseData = response.data.data || response.data;
      const product = (responseData as any).product || responseData;

      console.log("🔍 getProductById - Raw response.data:", response.data);
      console.log("🔍 getProductById - responseData:", responseData);
      console.log("🔍 getProductById - extracted product:", product);

      return {
        data: product,
        success: true,
      };
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error(`Failed to fetch product ${id}:`, errorMessage);

      return {
        data: null,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get a product by barcode
   */
  static async getProductByBarcode(
    barcode: string
  ): Promise<ProductServiceResponse<Product | null>> {
    try {
      const response = await api.get<BackendProductResponse>(
        `/products/barcode/${barcode}`
      );

      // Handle single product response structure
      const responseData = response.data.data || response.data;
      const product = (responseData as any).product || responseData;

      console.log("🔍 getProductByBarcode - Raw response.data:", response.data);
      console.log("🔍 getProductByBarcode - responseData:", responseData);
      console.log("🔍 getProductByBarcode - extracted product:", product);

      return {
        data: product,
        success: true,
      };
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error(
        `Failed to fetch product by barcode ${barcode}:`,
        errorMessage
      );

      return {
        data: null,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Search products by name or description
   */
  static async searchProducts(
    query: string,
    params?: Omit<ProductSearchParams, "query">
  ): Promise<ProductServiceResponse<Product[]>> {
    try {
      const searchParams = {
        query,
        ...params,
      };

      const response = await api.get<BackendProductsResponse | Product[]>(
        "/products",
        {
          params: searchParams,
        }
      );

      // Handle different response structures from the backend
      const responseData = response.data.data || response.data;

      // Debug logging
      console.log("🔍 searchProducts - Raw response.data:", response.data);
      console.log("🔍 searchProducts - responseData:", responseData);

      // Extract products array from the response
      let products: Product[];
      if (
        responseData &&
        typeof responseData === "object" &&
        "products" in responseData
      ) {
        products = (responseData as BackendProductsResponse).products;
        console.log(
          "✅ searchProducts - Extracted products from .products property:",
          products
        );
      } else if (Array.isArray(responseData)) {
        products = responseData;
        console.log(
          "✅ searchProducts - Using responseData directly as array:",
          products
        );
      } else {
        products = [];
        console.log(
          "❌ searchProducts - No valid products found, defaulting to empty array"
        );
      }

      return {
        data: products,
        success: true,
      };
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error(
        `Failed to search products with query "${query}":`,
        errorMessage
      );

      return {
        data: [],
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(
    productData: CreateProductPayload
  ): Promise<ProductServiceResponse<Product | null>> {
    try {
      const response = await api.post<Product>("/products", productData);

      return {
        data: response.data.data || response.data,
        success: true,
      };
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error("Failed to create product:", errorMessage);

      return {
        data: null,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(
    id: number,
    productData: UpdateProductPayload
  ): Promise<ProductServiceResponse<Product | null>> {
    try {
      const response = await api.put<Product>(`/products/${id}`, productData);

      return {
        data: response.data.data || response.data,
        success: true,
      };
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error(`Failed to update product ${id}:`, errorMessage);

      return {
        data: null,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Delete a product (soft delete by default)
   */
  static async deleteProduct(
    id: number,
    hardDelete: boolean = false
  ): Promise<ProductServiceResponse<boolean>> {
    try {
      const params = hardDelete ? { hard: "true" } : undefined;
      await api.delete(`/products/${id}`, { params });

      return {
        data: true,
        success: true,
      };
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error(`Failed to delete product ${id}:`, errorMessage);

      return {
        data: false,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get products with low stock
   */
  static async getLowStockProducts(
    threshold: number = 5
  ): Promise<ProductServiceResponse<Product[]>> {
    try {
      const params = {
        lowStock: true,
        stockThreshold: threshold,
      };

      const response = await api.get<BackendProductsResponse | Product[]>(
        "/products",
        { params }
      );

      // Handle different response structures from the backend (same as getProducts)
      const responseData = response.data.data || response.data;

      // Extract products array from the response
      let products: Product[];
      if (
        responseData &&
        typeof responseData === "object" &&
        "products" in responseData
      ) {
        products = (responseData as BackendProductsResponse).products;
      } else if (Array.isArray(responseData)) {
        products = responseData;
      } else {
        products = [];
      }

      return {
        data: products,
        success: true,
      };
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error("Failed to fetch low stock products:", errorMessage);

      return {
        data: [],
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(
    category: string
  ): Promise<ProductServiceResponse<Product[]>> {
    try {
      const params = { category };
      const response = await api.get<BackendProductsResponse | Product[]>(
        "/products",
        { params }
      );

      // Handle different response structures from the backend (same as getProducts)
      const responseData = response.data.data || response.data;

      // Extract products array from the response
      let products: Product[];
      if (
        responseData &&
        typeof responseData === "object" &&
        "products" in responseData
      ) {
        products = (responseData as BackendProductsResponse).products;
      } else if (Array.isArray(responseData)) {
        products = responseData;
      } else {
        products = [];
      }

      return {
        data: products,
        success: true,
      };
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error(
        `Failed to fetch products in category "${category}":`,
        errorMessage
      );

      return {
        data: [],
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get all unique categories
   */
  static async getCategories(): Promise<ProductServiceResponse<any[]>> {
    try {
      // This might need to be adjusted based on your backend implementation
      const response = await api.get<any>("/products/categories");

      return {
        data: response.data.data || response.data,
        success: true,
      };
    } catch (error) {
      // Fallback: extract categories from all products
      console.log(
        "🔍 getCategories - Falling back to extract from all products"
      );
      const productsResult = await this.getProducts();
      console.log("🔍 getCategories - productsResult:", productsResult);

      if (productsResult.success && Array.isArray(productsResult.data)) {
        console.log(
          "✅ getCategories - Products data is valid array, extracting categories"
        );
        const categories = Array.from(
          new Set(
            productsResult.data
              .map((product) => product.category_name || product.category)
              .filter((category) => category && category.trim() !== "")
          )
        ).map((name, index) => ({
          id: index + 1,
          name,
          description: "",
          product_count: productsResult.data.filter(
            (p) => (p.category_name || p.category) === name
          ).length,
        }));

        console.log("✅ getCategories - Extracted categories:", categories);
        return {
          data: categories,
          success: true,
        };
      }

      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error(
        "❌ getCategories - Failed to fetch categories:",
        errorMessage
      );
      console.error("❌ getCategories - Products data:", productsResult);

      return {
        data: [],
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Bulk update products (useful for inventory adjustments)
   */
  static async bulkUpdateProducts(
    updates: Array<{ id: number; data: UpdateProductPayload }>
  ): Promise<ProductServiceResponse<Product[]>> {
    try {
      const promises = updates.map((update) =>
        this.updateProduct(update.id, update.data)
      );

      const results = await Promise.all(promises);

      const successful = results.filter((result) => result.success);
      const failed = results.filter((result) => !result.success);

      if (failed.length > 0) {
        console.warn(`${failed.length} products failed to update`);
      }

      return {
        data: successful
          .map((result) => result.data)
          .filter(Boolean) as Product[],
        success: failed.length === 0,
        error:
          failed.length > 0 ? `${failed.length} updates failed` : undefined,
      };
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error("Failed to bulk update products:", errorMessage);

      return {
        data: [],
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if a barcode is already in use
   */
  static async isBarcodeAvailable(
    barcode: string,
    excludeProductId?: number
  ): Promise<ProductServiceResponse<boolean>> {
    try {
      const result = await this.getProductByBarcode(barcode);

      if (!result.success) {
        // If we get an error (like 404), the barcode is available
        return {
          data: true,
          success: true,
        };
      }

      // If we found a product, check if it's the one we're excluding
      if (
        result.data &&
        excludeProductId &&
        result.data.id === excludeProductId
      ) {
        return {
          data: true,
          success: true,
        };
      }

      // Barcode is in use
      return {
        data: false,
        success: true,
      };
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      console.error(
        `Failed to check barcode availability for "${barcode}":`,
        errorMessage
      );

      return {
        data: false,
        success: false,
        error: errorMessage,
      };
    }
  }
}

// Export the service as default and named export
export default ProductsService;
