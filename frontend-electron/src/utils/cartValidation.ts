import { CartItem } from "../types/state";
import { Product } from "../services/productsService";

export interface CartValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CartValidationSettings {
  minQuantity: number;
  maxQuantity: number;
  allowOutOfStock: boolean;
  allowNegativePrice: boolean;
  allowZeroPrice: boolean;
  maxCartItems: number;
  maxCartValue: number;
}

export const defaultValidationSettings: CartValidationSettings = {
  minQuantity: 1,
  maxQuantity: 999,
  allowOutOfStock: false,
  allowNegativePrice: false,
  allowZeroPrice: false,
  maxCartItems: 100,
  maxCartValue: 10000,
};

/**
 * Validates a product before adding to cart
 */
export const validateProduct = (product: Product): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!product) {
    errors.push("Product is required");
    return { isValid: false, errors, warnings };
  }

  if (!product.id) {
    errors.push("Product ID is required");
  }

  if (!product.name || product.name.trim() === "") {
    errors.push("Product name is required");
  }

  if (typeof product.price !== "number") {
    errors.push("Product price must be a number");
  } else {
    if (product.price < 0 && !defaultValidationSettings.allowNegativePrice) {
      errors.push("Product price cannot be negative");
    }
    if (product.price === 0 && !defaultValidationSettings.allowZeroPrice) {
      warnings.push("Product price is zero");
    }
  }

  // Stock validation
  if (product.stock_quantity !== undefined) {
    if (product.stock_quantity < 0) {
      errors.push("Stock quantity cannot be negative");
    }
    if (
      product.stock_quantity === 0 &&
      !defaultValidationSettings.allowOutOfStock
    ) {
      errors.push("Product is out of stock");
    }
    if (product.stock_quantity <= 5 && product.stock_quantity > 0) {
      warnings.push("Product is low in stock");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validates a quantity for a specific product
 */
export const validateQuantity = (
  quantity: number,
  product: Product,
  settings: CartValidationSettings = defaultValidationSettings
): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic quantity validation
  if (!Number.isInteger(quantity)) {
    errors.push("Quantity must be a whole number");
  }

  if (quantity < settings.minQuantity) {
    errors.push(`Quantity must be at least ${settings.minQuantity}`);
  }

  if (quantity > settings.maxQuantity) {
    errors.push(`Quantity cannot exceed ${settings.maxQuantity}`);
  }

  // Stock validation
  if (product.stock_quantity !== undefined) {
    if (quantity > product.stock_quantity) {
      if (settings.allowOutOfStock) {
        warnings.push(
          `Requested quantity (${quantity}) exceeds available stock (${product.stock_quantity})`
        );
      } else {
        errors.push(`Only ${product.stock_quantity} items available in stock`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validates an entire cart
 */
export const validateCart = (
  cartItems: CartItem[],
  settings: CartValidationSettings = defaultValidationSettings
): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Cart size validation
  if (cartItems.length > settings.maxCartItems) {
    errors.push(`Cart cannot contain more than ${settings.maxCartItems} items`);
  }

  // Cart value validation
  const cartTotal = cartItems.reduce((total, item) => total + item.subtotal, 0);
  if (cartTotal > settings.maxCartValue) {
    errors.push(
      `Cart total cannot exceed $${settings.maxCartValue.toFixed(2)}`
    );
  }

  // Validate individual items
  for (const item of cartItems) {
    const productValidation = validateProduct(item.product);
    const quantityValidation = validateQuantity(
      item.quantity,
      item.product,
      settings
    );

    errors.push(...productValidation.errors);
    warnings.push(...productValidation.warnings);
    errors.push(...quantityValidation.errors);
    warnings.push(...quantityValidation.warnings);

    // Validate subtotal calculation
    const expectedSubtotal = item.quantity * item.product.price;
    if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) {
      errors.push(`Invalid subtotal for ${item.product.name}`);
    }
  }

  // Check for duplicate products (shouldn't happen but good to validate)
  const productIds = cartItems.map((item) => item.product.id);
  const duplicateIds = productIds.filter(
    (id, index) => productIds.indexOf(id) !== index
  );
  if (duplicateIds.length > 0) {
    errors.push("Cart contains duplicate products");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Sanitizes a cart by removing invalid items and fixing quantities
 */
export const sanitizeCart = (
  cartItems: CartItem[],
  settings: CartValidationSettings = defaultValidationSettings
): CartItem[] => {
  const sanitizedItems: CartItem[] = [];

  for (const item of cartItems) {
    const productValidation = validateProduct(item.product);

    // Skip invalid products
    if (!productValidation.isValid) {
      console.warn(
        `Removing invalid product from cart: ${item.product.name}`,
        productValidation.errors
      );
      continue;
    }

    // Fix quantity if needed
    let quantity = item.quantity;

    // Ensure quantity is within bounds
    quantity = Math.max(
      settings.minQuantity,
      Math.min(quantity, settings.maxQuantity)
    );

    // Ensure quantity doesn't exceed stock
    if (
      item.product.stock_quantity !== undefined &&
      !settings.allowOutOfStock
    ) {
      quantity = Math.min(quantity, item.product.stock_quantity);
    }

    // Skip items with invalid quantities
    if (quantity <= 0) {
      console.warn(`Removing item with invalid quantity: ${item.product.name}`);
      continue;
    }

    // Create sanitized item
    const sanitizedItem: CartItem = {
      ...item,
      quantity,
      subtotal: quantity * item.product.price,
    };

    sanitizedItems.push(sanitizedItem);
  }

  return sanitizedItems;
};

/**
 * Gets the maximum quantity that can be added for a product
 */
export const getMaxQuantityForProduct = (
  product: Product,
  currentQuantityInCart: number = 0,
  settings: CartValidationSettings = defaultValidationSettings
): number => {
  let maxQuantity = settings.maxQuantity;

  // Factor in stock availability
  if (product.stock_quantity !== undefined && !settings.allowOutOfStock) {
    maxQuantity = Math.min(maxQuantity, product.stock_quantity);
  }

  // Factor in current quantity in cart
  maxQuantity = Math.max(0, maxQuantity - currentQuantityInCart);

  return maxQuantity;
};
