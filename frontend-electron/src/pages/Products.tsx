import React, { useState, useEffect } from "react";
import { useProducts } from "../hooks/useProducts";
import { useNotifications } from "../hooks/useNotifications";
import useBarcodeScanner from "../hooks/useBarcodeScanner";
import ProductSearch from "../components/ui/ProductSearch";
import QuickAddProductModal from "../components/ui/QuickAddProductModal";
import ProductManagementModal from "../components/ui/ProductManagementModal";
import { Product } from "../services/productsService";

interface ProductFilters {
  category: string | null;
  stockStatus: "all" | "inStock" | "lowStock" | "outOfStock";
  sortBy: "name" | "price" | "stock_quantity";
  sortOrder: "asc" | "desc";
}

const Products: React.FC = () => {
  const {
    products,
    categories,
    isLoading,
    loadProducts,
    getProductByBarcode,
    clearFilters,
    recentlyViewed,
    addToRecentlyViewed,
  } = useProducts();

  const { addNotification } = useNotifications();

  const [filters, setFilters] = useState<ProductFilters>({
    category: null,
    stockStatus: "all",
    sortBy: "name",
    sortOrder: "asc",
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>("");

  // Barcode scanner integration for product management
  const handleBarcodeScanned = async (barcode: string) => {
    console.log(
      "🎯 [Products] handleBarcodeScanned called with barcode:",
      barcode
    );

    try {
      console.log("🔍 [Products] Searching for product with barcode:", barcode);

      // Search for product by barcode
      const product = await getProductByBarcode(barcode);

      console.log("🔍 [Products] Product search result:", product);

      if (product) {
        console.log(
          "✅ [Products] Product found:",
          product.name,
          "ID:",
          product.id
        );

        // Track as recently viewed
        addToRecentlyViewed(product);

        // Show product management modal for comprehensive management
        setSelectedProduct(product);
        setIsManagementModalOpen(true);

        addNotification({
          type: "success",
          message: `Opening management for: ${product.name}`,
          autoClose: true,
        });
      } else {
        console.log("❌ [Products] Product not found for barcode:", barcode);
        // Product not found - show QuickAddProductModal to create it
        setScannedBarcode(barcode);
        setQuickAddModalOpen(true);
      }
    } catch (error) {
      console.error("🚨 [Products] Error processing barcode:", error);
      addNotification({
        type: "error",
        message: "Error processing barcode scan",
        autoClose: true,
      });
    }
  };

  const handleBarcodeScanError = (error: string) => {
    addNotification({
      type: "error",
      message: `Barcode scanner error: ${error}`,
      autoClose: true,
    });
  };

  const barcodeScanner = useBarcodeScanner({
    onBarcodeScanned: handleBarcodeScanned,
    onError: handleBarcodeScanError,
    minBarcodeLength: 8,
    maxBarcodeLength: 20,
    enableLogging: process.env.NODE_ENV === "development",
    preventDefaultKeyEvents: true,
  });

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Apply filters and sorting to products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...products];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(
        (product) =>
          (product.category_name || product.category) === filters.category
      );
    }

    // Apply stock status filter
    switch (filters.stockStatus) {
      case "inStock":
        filtered = filtered.filter((product) => product.stock_quantity > 5);
        break;
      case "lowStock":
        filtered = filtered.filter(
          (product) => product.stock_quantity > 0 && product.stock_quantity <= 5
        );
        break;
      case "outOfStock":
        filtered = filtered.filter((product) => product.stock_quantity === 0);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[filters.sortBy];
      let bVal: any = b[filters.sortBy];

      // Handle string sorting
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [products, filters]);

  const handleProductSelect = (product: Product) => {
    // Track as recently viewed
    addToRecentlyViewed(product);

    // Show product management modal for comprehensive management
    setSelectedProduct(product);
    setIsManagementModalOpen(true);
  };

  const handleViewDetails = (product: Product) => {
    // Track as recently viewed
    addToRecentlyViewed(product);

    setSelectedProduct(product);
    setIsManagementModalOpen(true);
  };

  const handleProductAdded = (product: Product) => {
    // Product management focus - just show success and refresh list
    addNotification({
      type: "success",
      message: `Product "${product.name}" added to inventory successfully!`,
      autoClose: true,
    });

    // Close the modal
    setQuickAddModalOpen(false);
    setScannedBarcode("");

    // Refresh the products list to include the new product
    loadProducts(true);
  };

  const handleProductUpdated = (product: Product) => {
    // Refresh the products list to show updated data
    loadProducts(true);

    // Update the selected product if it's the same one
    if (selectedProduct && selectedProduct.id === product.id) {
      setSelectedProduct(product);
    }
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: null,
      stockStatus: "all",
      sortBy: "name",
      sortOrder: "asc",
    });
    clearFilters();
  };

  const getStockStatusBadge = (product: Product) => {
    if (product.stock_quantity === 0) {
      return {
        text: "Out of Stock",
        dot: "🔴",
        color: "text-red-700",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    } else if (product.stock_quantity <= 5) {
      return {
        text: `Low Stock (${product.stock_quantity} units)`,
        dot: "🟡",
        color: "text-yellow-700",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    } else {
      return {
        text: `In Stock (${product.stock_quantity} units)`,
        dot: "🟢",
        color: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    }
  };

  const getStockLevelIndicator = (product: Product) => {
    const percentage = Math.min((product.stock_quantity / 50) * 100, 100); // Assuming 50 is a good stock level
    let color = "bg-green-500";
    if (product.stock_quantity === 0) color = "bg-red-500";
    else if (product.stock_quantity <= 5) color = "bg-yellow-500";
    else if (product.stock_quantity <= 15) color = "bg-orange-500";

    return { percentage, color };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-600 mt-1">
            Search and browse products, manage inventory
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {filteredAndSortedProducts.length} of {products.length} products
          </span>

          {/* Barcode Scanner Status */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                barcodeScanner.isConnected
                  ? barcodeScanner.isScanning
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-green-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {barcodeScanner.isConnected
                ? barcodeScanner.isScanning
                  ? "Scanning..."
                  : "Scanner Ready"
                : "Scanner Disconnected"}
            </span>
            {barcodeScanner.scanCount > 0 && (
              <span className="text-xs text-gray-500">
                ({barcodeScanner.scanCount} scans)
              </span>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card p-6">
        <ProductSearch
          placeholder="Search products by name, category, or barcode..."
          onProductSelect={handleProductSelect}
          showAddToCart={false}
          maxResults={8}
          className="w-full"
        />
      </div>

      {/* Recent Products */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recently Viewed Products
        </h2>
        {recentlyViewed.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Recently viewed products will appear here for quick access
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyViewed.map((product) => {
              const stockStatus = getStockStatusBadge(product);
              const stockIndicator = getStockLevelIndicator(product);

              return (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-100 overflow-hidden"
                  onClick={() => handleViewDetails(product)}
                >
                  {/* Product Image */}
                  <div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden mb-3">
                    <div className="text-4xl opacity-40 group-hover:opacity-60 transition-opacity">
                      📦
                    </div>
                    {/* Stock Level Indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div
                        className={`h-full transition-all duration-300 ${stockIndicator.color}`}
                        style={{ width: `${stockIndicator.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2">
                    {/* Product Name */}
                    <h3 className="text-sm font-bold text-gray-900 truncate leading-tight">
                      {product.name}
                    </h3>

                    {/* Category */}
                    <p className="text-xs text-gray-500 truncate flex items-center">
                      <span className="mr-1">🏷️</span>
                      {product.category_name ||
                        product.category ||
                        "No Category"}
                    </p>

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}
                      >
                        <span className="mr-1">{stockStatus.dot}</span>
                        <span>{product.stock_quantity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filters and Sorting */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              Category:
            </label>
            <select
              value={filters.category || ""}
              onChange={(e) =>
                handleFilterChange("category", e.target.value || null)
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Stock:</label>
            <select
              value={filters.stockStatus}
              onChange={(e) =>
                handleFilterChange("stockStatus", e.target.value)
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Items</option>
              <option value="inStock">In Stock</option>
              <option value="lowStock">Low Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock_quantity">Stock Level</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Order:</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>

          {/* Refresh */}
          <button
            onClick={() => loadProducts(true)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Products Display */}
      <div className="card p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading products...</span>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-4">
              {products.length === 0
                ? "No products are available in the catalog."
                : "No products match your current filters."}
            </p>
            {products.length > 0 && (
              <button onClick={handleClearFilters} className="btn-primary">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map((product) => {
                  const stockStatus = getStockStatusBadge(product);
                  const stockIndicator = getStockLevelIndicator(product);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-100 overflow-hidden"
                      onClick={() => handleViewDetails(product)}
                    >
                      {/* Product Image */}
                      <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                        <div className="text-6xl opacity-40 group-hover:opacity-60 transition-opacity">
                          📦
                        </div>
                        {/* Stock Level Indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                          <div
                            className={`h-full transition-all duration-300 ${stockIndicator.color}`}
                            style={{ width: `${stockIndicator.percentage}%` }}
                          />
                        </div>
                        {/* Quick Actions on Hover */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white rounded-full p-2 shadow-md">
                            <span
                              className="text-xs text-gray-600"
                              title={product.barcode || "No barcode"}
                            >
                              🏷️
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-5">
                        {/* Product Name & Category */}
                        <div className="mb-3">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <span className="mr-1">🏷️</span>
                            {product.category_name ||
                              product.category ||
                              "No Category"}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="mb-3">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-4">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bgColor} ${stockStatus.borderColor} ${stockStatus.color} border`}
                          >
                            <span className="mr-1">{stockStatus.dot}</span>
                            {stockStatus.text}
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(product);
                          }}
                          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                          Manage Product
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-3">
                {filteredAndSortedProducts.map((product) => {
                  const stockStatus = getStockStatusBadge(product);
                  const stockIndicator = getStockLevelIndicator(product);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-100 overflow-hidden"
                      onClick={() => handleViewDetails(product)}
                    >
                      <div className="flex items-center p-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden mr-4 flex-shrink-0">
                          <div className="text-3xl opacity-40 group-hover:opacity-60 transition-opacity">
                            📦
                          </div>
                          {/* Stock Level Indicator */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                            <div
                              className={`h-full transition-all duration-300 ${stockIndicator.color}`}
                              style={{ width: `${stockIndicator.percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              {/* Product Name & Category */}
                              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-500 flex items-center mb-2">
                                <span className="mr-1">🏷️</span>
                                {product.category_name ||
                                  product.category ||
                                  "No Category"}
                              </p>

                              {/* Stock Status */}
                              <div
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bgColor} ${stockStatus.borderColor} ${stockStatus.color} border`}
                              >
                                <span className="mr-1">{stockStatus.dot}</span>
                                {stockStatus.text}
                              </div>
                            </div>

                            {/* Price & Actions */}
                            <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                  {formatPrice(product.price)}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(product);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                              >
                                Manage Product
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Quick Info on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                          <div
                            className="text-xs text-gray-500"
                            title={product.barcode || "No barcode"}
                          >
                            🏷️{" "}
                            {product.barcode
                              ? `${product.barcode}`
                              : "No barcode"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Management Modal */}
      <ProductManagementModal
        isOpen={isManagementModalOpen}
        onClose={() => {
          setIsManagementModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />

      {/* Quick Add Product Modal */}
      <QuickAddProductModal
        isOpen={quickAddModalOpen}
        onClose={() => {
          setQuickAddModalOpen(false);
          setScannedBarcode("");
        }}
        scannedBarcode={scannedBarcode}
        onProductAdded={handleProductAdded}
      />

      {/* Development Testing Section */}
      {process.env.NODE_ENV === "development" && (
        <div className="card p-4 mt-6 bg-gray-50 border-dashed border-2 border-gray-300">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            🔧 Barcode Scanner Testing
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter barcode to test..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const barcode = e.currentTarget.value.trim();
                  if (barcode) {
                    barcodeScanner.simulateBarcodeScan(barcode);
                    e.currentTarget.value = "";
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector(
                  '[placeholder="Enter barcode to test..."]'
                ) as HTMLInputElement;
                const barcode = input?.value.trim();
                if (barcode) {
                  barcodeScanner.simulateBarcodeScan(barcode);
                  input.value = "";
                }
              }}
              className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
            >
              Test Scan
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Status:{" "}
            {barcodeScanner.isConnected ? "✅ Connected" : "❌ Disconnected"} |
            Scans: {barcodeScanner.scanCount} | Last:{" "}
            {barcodeScanner.lastScannedBarcode || "None"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
