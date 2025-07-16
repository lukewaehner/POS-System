import React, { useState } from "react";
import {
  Modal,
  ProductCard,
  ConfirmationDialog,
  ProductDetailsModal,
  PaymentProcessingModal,
  LoadingSpinner,
  ProductCardSkeleton,
  DashboardStatsSkeleton,
  ErrorMessage,
  NetworkErrorMessage,
  EmptyStateMessage,
  CartDisplay,
  Product,
  PaymentStatus,
} from "../components/ui";
import ApiConnectionTest from "../components/ApiConnectionTest";
import StateDemo from "../components/StateDemo";
import CartValidationDemo from "../components/CartValidationDemo";
import ProductSearchDemo from "../components/ProductSearchDemo";
import { ProductsService } from "../services";

const ComponentDemo: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("selecting");
  const [showLoading, setShowLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string>("");

  // Sample product data
  const sampleProduct: Product = {
    id: 1,
    name: "Premium Coffee Beans - Dark Roast",
    price: 12.99,
    stock_quantity: 25,
    barcode: "123456789012",
    category: "Beverages",
    tax_rate: 0.08,
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    alert(`Added ${quantity} x ${product.name} to cart!`);
  };

  const handleViewDetails = (product: Product) => {
    setProductDetailsOpen(true);
  };

  const handlePaymentFlow = () => {
    setPaymentStatus("processing");
    setTimeout(() => {
      setPaymentStatus("success");
      setTimeout(() => {
        setPaymentModalOpen(false);
        setPaymentStatus("selecting");
      }, 3000);
    }, 2000);
  };

  // Products Service test functions
  const testGetProducts = async () => {
    setProductsLoading(true);
    setProductsError("");

    try {
      const result = await ProductsService.getProducts();
      if (result.success) {
        setProductsData(result.data);
        console.log("✅ Products fetched successfully:", result.data);
      } else {
        setProductsError(result.error || "Failed to fetch products");
      }
    } catch (error) {
      setProductsError("Network error occurred");
      console.error("❌ Error testing products service:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const testSearchProducts = async () => {
    setProductsLoading(true);
    setProductsError("");

    try {
      const result = await ProductsService.searchProducts("Toothpaste", {
        category: "Health & Beauty",
        limit: 5,
      });
      if (result.success) {
        setProductsData(result.data);
        console.log("✅ Toothpaste search successful:", result.data);
      } else {
        setProductsError(result.error || "Search failed");
      }
    } catch (error) {
      setProductsError("Network error occurred");
      console.error("❌ Error testing search:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const testGetCategories = async () => {
    try {
      console.log("🔍 Testing getCategories...");
      const result = await ProductsService.getCategories();
      console.log("📊 getCategories result:", result);

      if (result.success) {
        console.log("✅ Categories fetched successfully:", result.data);
        if (Array.isArray(result.data)) {
          alert(
            `Categories found: ${
              result.data.join(", ") || "No categories found"
            }`
          );
        } else {
          alert(
            `Categories data type: ${typeof result.data}, value: ${JSON.stringify(
              result.data
            )}`
          );
        }
      } else {
        console.error("❌ Failed to fetch categories:", result.error);
        alert(`Error fetching categories: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error testing categories:", error);
      alert(
        `Exception: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Test individual API endpoints
  const testGetProductById = async () => {
    try {
      console.log("🔍 Testing getProductById...");
      const result = await ProductsService.getProductById(1); // Test with ID 1
      console.log("📊 getProductById result:", result);

      if (result.success && result.data) {
        console.log("✅ Product by ID fetched successfully:", result.data);
        console.log(
          "🔍 Product ID:",
          result.data.id,
          "Type:",
          typeof result.data.id
        );
        alert(`Found product: ${result.data.name} - $${result.data.price}`);
        setProductsData([result.data]); // Display in UI
      } else {
        console.error("❌ Failed to fetch product by ID:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error testing getProductById:", error);
      alert(
        `Exception: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  const testGetProductByBarcode = async () => {
    try {
      console.log("🔍 Testing getProductByBarcode...");
      // Using a barcode from the seed data - Coca-Cola
      const result = await ProductsService.getProductByBarcode("049000000443");
      console.log("📊 getProductByBarcode result:", result);

      if (result.success && result.data) {
        console.log("✅ Product by barcode fetched successfully:", result.data);
        console.log(
          "🔍 Product ID:",
          result.data.id,
          "Type:",
          typeof result.data.id
        );
        alert(`Found product: ${result.data.name} - $${result.data.price}`);
        setProductsData([result.data]); // Display in UI
      } else {
        console.error("❌ Failed to fetch product by barcode:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error testing getProductByBarcode:", error);
      alert(
        `Exception: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">UI Components Demo</h1>
        <p className="text-gray-500">Testing all new components</p>
      </div>

      {/* API Connection Test */}
      <ApiConnectionTest />

      {/* State Management Demo */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">State Management Demo</h2>
        <p className="text-gray-600 mb-4">
          Interactive demo showing React Context-based state management with
          cart, products, authentication, and notifications.
        </p>
        <StateDemo />
      </div>

      {/* Products Service Demo */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">
          Products API Service Demo
        </h2>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={testGetProducts}
                disabled={productsLoading}
                className="btn-primary disabled:opacity-50"
              >
                {productsLoading ? "Loading..." : "Get All Products"}
              </button>
              <button
                onClick={testSearchProducts}
                disabled={productsLoading}
                className="btn-secondary disabled:opacity-50"
              >
                Search "Toothpaste"
              </button>
              <button onClick={testGetCategories} className="btn-secondary">
                Get Categories
              </button>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm text-gray-600 mb-2 font-medium">
                Individual API Tests:
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={testGetProductById} className="btn-secondary">
                  Get Product by ID (1)
                </button>
                <button
                  onClick={testGetProductByBarcode}
                  className="btn-secondary"
                >
                  Get by Barcode (Coca-Cola)
                </button>
              </div>
            </div>
          </div>

          {productsError && (
            <ErrorMessage
              type="error"
              title="API Error"
              message={productsError}
              onRetry={() => {
                setProductsError("");
                testGetProducts();
              }}
            />
          )}

          {productsLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" text="Fetching products..." />
            </div>
          )}

          {!productsLoading && productsData.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">
                Results ({productsData.length} products)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {productsData.map((product, index) => (
                  <ProductCard
                    key={product.id || `product-${index}`}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {!productsLoading && !productsError && productsData.length === 0 && (
            <EmptyStateMessage
              title="No Products Found"
              message="Try running 'Get All Products' to fetch data from the API."
              icon="🔍"
            />
          )}
        </div>
      </div>

      {/* Buttons Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Interactive Components</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            Open Modal
          </button>
          <button
            onClick={() => setConfirmationOpen(true)}
            className="btn-secondary"
          >
            Confirmation Dialog
          </button>
          <button
            onClick={() => setProductDetailsOpen(true)}
            className="btn-secondary"
          >
            Product Details
          </button>
          <button
            onClick={() => setPaymentModalOpen(true)}
            className="btn-primary"
          >
            Payment Modal
          </button>
          <button
            onClick={() => setShowLoading(!showLoading)}
            className="btn-secondary"
          >
            Toggle Loading
          </button>
          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className="btn-secondary"
          >
            Toggle Skeleton
          </button>
        </div>
      </div>

      {/* Loading States */}
      {showLoading && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Small</h3>
              <LoadingSpinner size="sm" text="Loading..." />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Medium</h3>
              <LoadingSpinner size="md" text="Processing..." />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Large</h3>
              <LoadingSpinner size="lg" text="Please wait..." />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Extra Large</h3>
              <LoadingSpinner size="xl" text="Loading data..." />
            </div>
          </div>
        </div>
      )}

      {/* Skeleton States */}
      {showSkeleton && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Skeleton Loading</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Dashboard Stats</h3>
              <DashboardStatsSkeleton />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Product Cards</h3>
              <ProductCardSkeleton count={4} />
            </div>
          </div>
        </div>
      )}

      {/* Product Card */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Product Card</h2>
        <div className="max-w-xs">
          <ProductCard
            product={sampleProduct}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>

      {/* Cart Display */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Shopping Cart Display</h2>
        <p className="text-gray-600 mb-4">
          This component shows the current cart items with quantity controls and
          remove functionality. Try adding items using the "State Management
          Demo" section above to see it in action. Click on the cart to focus it
          and try keyboard shortcuts!
        </p>
        <div className="max-w-2xl">
          <CartDisplay
            onProceedToCheckout={() => alert("Proceeding to checkout! 🛒")}
          />
        </div>
      </div>

      {/* Cart Validation & Persistence Demo */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">
          Cart Validation, Persistence & Keyboard Shortcuts Demo
        </h2>
        <p className="text-gray-600 mb-4">
          This demo shows the cart validation system, persistence features, and
          keyboard shortcuts. Try adding different products to see validation in
          action, refresh the page to test persistence, and use keyboard
          shortcuts for efficient cart management.
        </p>
        <CartValidationDemo />
      </div>

      {/* Product Search Demo */}
      <ProductSearchDemo />

      {/* Error Messages */}
      <div className="space-y-4">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Error Messages</h2>
          <div className="space-y-4">
            <ErrorMessage
              type="error"
              title="Validation Error"
              message="Please check the required fields and try again."
              onRetry={() => alert("Retrying...")}
            />
            <ErrorMessage
              type="warning"
              title="Low Stock Warning"
              message="This product is running low on stock. Consider reordering."
            />
            <NetworkErrorMessage
              onRetry={() => alert("Retrying connection...")}
            />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Empty States</h2>
          <EmptyStateMessage
            title="No Products Found"
            message="Start by adding your first product to the catalog."
            actionText="Add Product"
            onAction={() => alert("Adding product...")}
            icon="📦"
          />
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample Modal"
        size="md"
      >
        <div className="space-y-4">
          <p>This is a sample modal demonstrating the Modal component.</p>
          <p>
            It supports different sizes, titles, and can be closed by clicking
            outside or pressing Escape.
          </p>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Close
            </button>
            <button onClick={() => setModalOpen(false)} className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={() => {
          alert("Confirmed!");
          setConfirmationOpen(false);
        }}
        title="Confirm Action"
        message="Are you sure you want to proceed with this action? This cannot be undone."
        type="danger"
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />

      <ProductDetailsModal
        isOpen={productDetailsOpen}
        onClose={() => setProductDetailsOpen(false)}
        product={sampleProduct}
        onAddToCart={handleAddToCart}
        showAdminFeatures={true}
        onEditProduct={(product) => alert(`Editing ${product.name}`)}
      />

      <PaymentProcessingModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setPaymentStatus("selecting");
        }}
        status={paymentStatus}
        paymentMethod="cash"
        amount={25.98}
        cashReceived={30.0}
        change={4.02}
        onRetry={handlePaymentFlow}
        onNewTransaction={() => {
          setPaymentModalOpen(false);
          setPaymentStatus("selecting");
          alert("Starting new transaction...");
        }}
      />

      {/* Test Payment Flow */}
      {paymentModalOpen && paymentStatus === "selecting" && (
        <div className="fixed bottom-4 right-4">
          <button onClick={handlePaymentFlow} className="btn-primary shadow-lg">
            Start Payment Flow
          </button>
        </div>
      )}
    </div>
  );
};

export default ComponentDemo;
