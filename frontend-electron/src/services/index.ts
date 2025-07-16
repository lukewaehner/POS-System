// Products Service
export { ProductsService } from "./productsService";

// API Client and utilities
export { api } from "./api";
export { handleApiError } from "./api";
export type { ApiResponse, ApiErrorResponse } from "./api";

export type {
  Product,
  StockMovement,
  CreateProductPayload,
  UpdateProductPayload,
  ProductSearchParams,
  ProductServiceResponse,
} from "./productsService";

// Re-export default exports
export { default as ProductsServiceDefault } from "./productsService";
