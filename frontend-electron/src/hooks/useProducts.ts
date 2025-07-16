import { useCallback, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Product, ProductsService } from "../services/productsService";

export const useProducts = () => {
  const { state, dispatch } = useAppContext();

  // Load products from API
  const loadProducts = useCallback(
    async (refresh: boolean = false) => {
      // Check if we need to fetch (first load or forced refresh or cache expired)
      const cacheAge = state.products.lastFetched
        ? Date.now() - state.products.lastFetched
        : Infinity;
      const cacheExpired = cacheAge > 5 * 60 * 1000; // 5 minutes

      if (!refresh && state.products.items.length > 0 && !cacheExpired) {
        return; // Use cached data
      }

      try {
        dispatch({
          type: "SET_PRODUCTS_LOADING",
          payload: { isLoading: true },
        });

        const productsResponse = await ProductsService.getProducts({
          query: state.products.searchQuery || undefined,
          category: state.products.selectedCategory || undefined,
        });

        if (productsResponse.success && productsResponse.data) {
          dispatch({
            type: "SET_PRODUCTS",
            payload: { products: productsResponse.data },
          });
        } else {
          throw new Error(productsResponse.error || "Failed to load products");
        }

        // Load categories if we don't have them
        if (state.products.categories.length === 0) {
          const categoriesResponse = await ProductsService.getCategories();
          if (categoriesResponse.success && categoriesResponse.data) {
            dispatch({
              type: "SET_CATEGORIES",
              payload: { categories: categoriesResponse.data },
            });
          }
        }
      } catch (error) {
        console.error("Failed to load products:", error);
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            notification: {
              type: "error",
              message: "Failed to load products",
              autoClose: true,
            },
          },
        });
      } finally {
        dispatch({
          type: "SET_PRODUCTS_LOADING",
          payload: { isLoading: false },
        });
      }
    },
    [state.products, dispatch]
  );

  // Search products
  const searchProducts = useCallback(
    async (query: string) => {
      dispatch({ type: "SET_SEARCH_QUERY", payload: { query } });

      try {
        dispatch({
          type: "SET_PRODUCTS_LOADING",
          payload: { isLoading: true },
        });

        const productsResponse = await ProductsService.searchProducts(query, {
          category: state.products.selectedCategory || undefined,
        });

        if (productsResponse.success && productsResponse.data) {
          dispatch({
            type: "SET_PRODUCTS",
            payload: { products: productsResponse.data },
          });
        } else {
          throw new Error(
            productsResponse.error || "Failed to search products"
          );
        }
      } catch (error) {
        console.error("Failed to search products:", error);
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            notification: {
              type: "error",
              message: "Failed to search products",
              autoClose: true,
            },
          },
        });
      } finally {
        dispatch({
          type: "SET_PRODUCTS_LOADING",
          payload: { isLoading: false },
        });
      }
    },
    [state.products.selectedCategory, dispatch]
  );

  // Filter by category
  const filterByCategory = useCallback(
    async (category: string | null) => {
      dispatch({ type: "SET_SELECTED_CATEGORY", payload: { category } });

      try {
        dispatch({
          type: "SET_PRODUCTS_LOADING",
          payload: { isLoading: true },
        });

        const productsResponse = await ProductsService.getProducts({
          query: state.products.searchQuery || undefined,
          category: category || undefined,
        });

        if (productsResponse.success && productsResponse.data) {
          dispatch({
            type: "SET_PRODUCTS",
            payload: { products: productsResponse.data },
          });
        } else {
          throw new Error(
            productsResponse.error || "Failed to filter products"
          );
        }
      } catch (error) {
        console.error("Failed to filter products by category:", error);
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            notification: {
              type: "error",
              message: "Failed to filter products",
              autoClose: true,
            },
          },
        });
      } finally {
        dispatch({
          type: "SET_PRODUCTS_LOADING",
          payload: { isLoading: false },
        });
      }
    },
    [state.products.searchQuery, dispatch]
  );

  // Get product by ID
  const getProductById = useCallback(
    async (id: number): Promise<Product | null> => {
      // First check if we have it in cache
      const cachedProduct = state.products.items.find((p) => p.id === id);
      if (cachedProduct) {
        return cachedProduct;
      }

      // Otherwise fetch from API
      try {
        const productResponse = await ProductsService.getProductById(id);
        if (productResponse.success && productResponse.data) {
          dispatch({
            type: "UPDATE_PRODUCT",
            payload: { product: productResponse.data },
          });
          return productResponse.data;
        }
        return null;
      } catch (error) {
        console.error("Failed to get product by ID:", error);
        return null;
      }
    },
    [state.products.items, dispatch]
  );

  // Get product by barcode
  const getProductByBarcode = useCallback(
    async (barcode: string): Promise<Product | null> => {
      try {
        const productResponse = await ProductsService.getProductByBarcode(
          barcode
        );
        if (productResponse.success && productResponse.data) {
          dispatch({
            type: "UPDATE_PRODUCT",
            payload: { product: productResponse.data },
          });
          return productResponse.data;
        }
        return null;
      } catch (error) {
        console.error("Failed to get product by barcode:", error);
        return null;
      }
    },
    [dispatch]
  );

  // Clear search and filters
  const clearFilters = useCallback(() => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: { query: "" } });
    dispatch({ type: "SET_SELECTED_CATEGORY", payload: { category: null } });
    loadProducts(true); // Refresh with no filters
  }, [dispatch, loadProducts]);

  // Create a new product
  const createProduct = useCallback(
    async (productData: {
      name: string;
      barcode: string;
      price: number;
      stock_quantity: number;
      category?: string;
      description?: string;
    }): Promise<Product | null> => {
      try {
        const productResponse = await ProductsService.createProduct(
          productData
        );

        if (productResponse.success && productResponse.data) {
          // Add the new product to the local state
          dispatch({
            type: "ADD_PRODUCT",
            payload: { product: productResponse.data },
          });

          // Show success notification
          dispatch({
            type: "ADD_NOTIFICATION",
            payload: {
              notification: {
                type: "success",
                message: `Product "${productData.name}" added successfully!`,
                autoClose: true,
              },
            },
          });

          return productResponse.data;
        } else {
          throw new Error(productResponse.error || "Failed to create product");
        }
      } catch (error) {
        console.error("Failed to create product:", error);

        // Show error notification
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            notification: {
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to create product",
              autoClose: true,
            },
          },
        });

        return null;
      }
    },
    [dispatch]
  );

  // Update an existing product
  const updateProduct = useCallback(
    async (
      id: number,
      productData: Partial<{
        name: string;
        barcode: string;
        price: number;
        stock_quantity: number;
        category: string;
        description: string;
      }>
    ): Promise<Product | null> => {
      try {
        const productResponse = await ProductsService.updateProduct(
          id,
          productData
        );

        if (productResponse.success && productResponse.data) {
          // Update the product in the local state
          dispatch({
            type: "UPDATE_PRODUCT",
            payload: { product: productResponse.data },
          });

          return productResponse.data;
        } else {
          throw new Error(productResponse.error || "Failed to update product");
        }
      } catch (error) {
        console.error("Failed to update product:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Delete a product
  const deleteProduct = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const deleteResponse = await ProductsService.deleteProduct(id);

        if (deleteResponse.success) {
          // Remove the product from the local state
          dispatch({
            type: "REMOVE_PRODUCT",
            payload: { productId: id },
          });

          return true;
        } else {
          throw new Error(deleteResponse.error || "Failed to delete product");
        }
      } catch (error) {
        console.error("Failed to delete product:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Add product to recently viewed
  const addToRecentlyViewed = useCallback(
    (product: Product) => {
      dispatch({
        type: "ADD_RECENTLY_VIEWED",
        payload: { product },
      });
    },
    [dispatch]
  );

  // Load products on mount if empty
  useEffect(() => {
    if (state.products.items.length === 0) {
      loadProducts();
    }
  }, [loadProducts, state.products.items.length]);

  return {
    // State
    products: state.products.items,
    categories: state.products.categories,
    searchQuery: state.products.searchQuery,
    selectedCategory: state.products.selectedCategory,
    isLoading: state.products.isLoading,
    lastFetched: state.products.lastFetched,
    recentlyViewed: state.products.recentlyViewed,

    // Actions
    loadProducts,
    searchProducts,
    filterByCategory,
    getProductById,
    getProductByBarcode,
    clearFilters,
    createProduct,
    updateProduct,
    deleteProduct,
    addToRecentlyViewed,
  };
};
