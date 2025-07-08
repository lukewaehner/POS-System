import React from "react";

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Reports & Analytics
        </h1>
        <div className="flex space-x-4">
          <button className="btn-secondary">📅 Date Range</button>
          <button className="btn-secondary">📊 Export</button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Sales Report
          </h3>
          <div className="text-center py-6">
            <div className="text-3xl font-bold text-green-600">$0.00</div>
            <div className="text-sm text-gray-500">Today's Revenue</div>
          </div>
          <button className="w-full btn-secondary text-sm">
            View Detailed Report
          </button>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Inventory Report
          </h3>
          <div className="text-center py-6">
            <div className="text-3xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-500">Products in Stock</div>
          </div>
          <button className="w-full btn-secondary text-sm">
            View Inventory Details
          </button>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tax Summary
          </h3>
          <div className="text-center py-6">
            <div className="text-3xl font-bold text-purple-600">$0.00</div>
            <div className="text-sm text-gray-500">Tax Collected</div>
          </div>
          <button className="w-full btn-secondary text-sm">
            View Tax Report
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Trend
          </h3>
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📈</div>
            <p className="text-gray-500">
              Sales chart will appear here once you have transaction data
            </p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Products
          </h3>
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🏆</div>
            <p className="text-gray-500">
              Best selling products will be shown here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
