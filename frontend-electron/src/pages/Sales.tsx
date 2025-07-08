import React from "react";

const Sales = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
        <div className="flex space-x-4">
          <button className="btn-secondary">📊 Export</button>
          <button className="btn-secondary">📅 Filter Date</button>
        </div>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">$0.00</div>
            <div className="text-sm text-gray-500">Today's Sales</div>
          </div>
        </div>
        <div className="card p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Transactions</div>
          </div>
        </div>
        <div className="card p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">$0.00</div>
            <div className="text-sm text-gray-500">Average Sale</div>
          </div>
        </div>
        <div className="card p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">$0.00</div>
            <div className="text-sm text-gray-500">Tax Collected</div>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Transactions
        </h2>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Sales Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Sales transactions will appear here once you start processing
            orders.
          </p>
          <button className="btn-primary">Go to Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default Sales;
