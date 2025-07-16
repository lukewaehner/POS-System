import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuickAddProducts from "../QuickAddProducts";
import { useCart } from "../../../hooks/useCart";
import { useProducts } from "../../../hooks/useProducts";
import { useNotifications } from "../../../hooks/useNotifications";

// Mock the hooks
jest.mock("../../../hooks/useCart");
jest.mock("../../../hooks/useProducts");
jest.mock("../../../hooks/useNotifications");

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>;
const mockUseNotifications = useNotifications as jest.MockedFunction<
  typeof useNotifications
>;

const mockProducts = [
  {
    id: 1,
    name: "Coca Cola",
    price: 1.99,
    stock_quantity: 50,
    category: "Beverages",
    category_name: "Beverages",
    barcode: "123456789",
  },
  {
    id: 2,
    name: "Snickers Bar",
    price: 1.49,
    stock_quantity: 3, // Low stock
    category: "Snacks",
    category_name: "Snacks",
    barcode: "987654321",
  },
  {
    id: 3,
    name: "Out of Stock Item",
    price: 2.99,
    stock_quantity: 0, // Out of stock
    category: "Other",
    category_name: "Other",
    barcode: "555666777",
  },
];

const mockCartItems = [
  {
    id: 1,
    product: mockProducts[0],
    quantity: 2,
    subtotal: 3.98,
  },
];

const defaultMockImplementations = {
  useCart: {
    cartItems: mockCartItems,
    cartSubtotal: 3.98,
    cartTax: 0.32,
    cartTotal: 4.3,
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateCartQuantity: jest.fn(),
    clearCart: jest.fn(),
    getCartItemCount: jest.fn().mockReturnValue(2),
    getCartItem: jest.fn(),
    isInCart: jest.fn(),
    validateProductForCart: jest
      .fn()
      .mockReturnValue({ isValid: true, errors: [], warnings: [] }),
    validateQuantityForProduct: jest
      .fn()
      .mockReturnValue({ isValid: true, errors: [], warnings: [] }),
    validateCurrentCart: jest
      .fn()
      .mockReturnValue({ isValid: true, errors: [], warnings: [] }),
    getMaxQuantity: jest.fn().mockReturnValue(10),
    canAddToCart: jest.fn().mockReturnValue(true),
    getCartValidationErrors: jest.fn().mockReturnValue([]),
    getCartValidationWarnings: jest.fn().mockReturnValue([]),
    addToCartWithValidation: jest.fn().mockReturnValue(true),
  },
  useProducts: {
    products: mockProducts,
    categories: ["Beverages", "Snacks", "Other"],
    searchQuery: "",
    selectedCategory: null,
    isLoading: false,
    lastFetched: Date.now(),
    loadProducts: jest.fn(),
    searchProducts: jest.fn(),
    filterByCategory: jest.fn(),
    getProductById: jest.fn(),
    getProductByBarcode: jest.fn(),
    clearFilters: jest.fn(),
  },
  useNotifications: {
    notifications: [],
    notificationCount: 0,
    hasNotifications: false,
    addNotification: jest.fn(),
    removeNotification: jest.fn(),
    clearAllNotifications: jest.fn(),
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showWarning: jest.fn(),
    showInfo: jest.fn(),
  },
};

describe("QuickAddProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCart.mockReturnValue(defaultMockImplementations.useCart);
    mockUseProducts.mockReturnValue(defaultMockImplementations.useProducts);
    mockUseNotifications.mockReturnValue(
      defaultMockImplementations.useNotifications
    );
  });

  describe("Core Functionality", () => {
    it("renders recent and popular product sections", () => {
      render(<QuickAddProducts />);

      expect(screen.getByText("🕒 Recent Products")).toBeInTheDocument();
      expect(screen.getByText("⭐ Popular Products")).toBeInTheDocument();
    });

    it("displays products with correct information", () => {
      render(<QuickAddProducts />);

      // Check for multiple Coca Cola instances (appears in both sections)
      const cocaColaElements = screen.getAllByText("Coca Cola");
      expect(cocaColaElements).toHaveLength(2);

      // Check that prices are displayed
      const priceElements = screen.getAllByText("$1.99");
      expect(priceElements.length).toBeGreaterThan(0);

      // Check stock display
      const stockElements = screen.getAllByText(/Stock:/);
      expect(stockElements.length).toBeGreaterThan(0);
    });

    it("shows stock level indicators", () => {
      render(<QuickAddProducts />);

      // Low stock indicator (for Snickers Bar)
      const lowStockElements = screen.getAllByText("Low");
      expect(lowStockElements).toHaveLength(1);
    });

    it("renders component with product buttons", () => {
      render(<QuickAddProducts />);

      // Check that products are displayed
      expect(screen.getByText("⭐ Popular Products")).toBeInTheDocument();
      const cocaColaElements = screen.getAllByText("Coca Cola");
      expect(cocaColaElements.length).toBeGreaterThan(0);

      // Check that buttons exist
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("handles empty product list gracefully", () => {
      mockUseProducts.mockReturnValue({
        ...defaultMockImplementations.useProducts,
        products: [],
      });

      render(<QuickAddProducts />);

      // Should still render sections but with no products
      expect(screen.getByText("⭐ Popular Products")).toBeInTheDocument();
      expect(screen.getByText("0 items")).toBeInTheDocument();
    });
  });
});
