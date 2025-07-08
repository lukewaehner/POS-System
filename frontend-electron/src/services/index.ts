// API Client and utilities
export { api, apiUtils, handleApiError } from "./api";
export type { ApiResponse, ApiErrorResponse } from "./api";

// Products Service
export { ProductsService } from "./productsService";
export type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductSearchParams,
  ProductServiceResponse,
} from "./productsService";

// Re-export default exports
export { default as ProductsServiceDefault } from "./productsService";
