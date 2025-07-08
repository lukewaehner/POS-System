import React from "react";

const Products = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button className="btn-primary">Add Product</button>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              className="input-field"
            />
          </div>
          <button className="btn-secondary">🔍 Search</button>
          <button className="btn-secondary">📱 Scan Barcode</button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Product Catalog
        </h2>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Products Found
          </h3>
          <p className="text-gray-500 mb-6">
            Start by adding your first product to the catalog.
          </p>
          <button className="btn-primary">Add Your First Product</button>
        </div>
      </div>
    </div>
  );
};

export default Products;
