import React, { useState } from "react";
import "./App.css";

// Import components
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Checkout from "./pages/Checkout";
import Reports from "./pages/Reports";
import ComponentDemo from "./pages/ComponentDemo";

// Import layout components
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

// Import state management
import { AppProvider } from "./hooks";

type Page =
  | "dashboard"
  | "products"
  | "sales"
  | "checkout"
  | "reports"
  | "demo";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <Products />;
      case "sales":
        return <Sales />;
      case "checkout":
        return <Checkout />;
      case "reports":
        return <Reports />;
      case "demo":
        return <ComponentDemo />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Header */}
        <Header />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setCurrentPage("dashboard")}
                className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-left w-full transition-colors duration-200 text-lg font-medium ${
                  currentPage === "dashboard"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-2xl">🏠</span>
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setCurrentPage("products")}
                className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-left w-full transition-colors duration-200 text-lg font-medium ${
                  currentPage === "products"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-2xl">📦</span>
                <span>Products</span>
              </button>

              <button
                onClick={() => setCurrentPage("checkout")}
                className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-left w-full transition-colors duration-200 text-lg font-medium ${
                  currentPage === "checkout"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-2xl">🛒</span>
                <span>Checkout</span>
              </button>

              <button
                onClick={() => setCurrentPage("sales")}
                className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-left w-full transition-colors duration-200 text-lg font-medium ${
                  currentPage === "sales"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-2xl">💰</span>
                <span>Sales</span>
              </button>

              <button
                onClick={() => setCurrentPage("reports")}
                className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-left w-full transition-colors duration-200 text-lg font-medium ${
                  currentPage === "reports"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-2xl">📊</span>
                <span>Reports</span>
              </button>

              <button
                onClick={() => setCurrentPage("demo")}
                className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-left w-full transition-colors duration-200 text-lg font-medium ${
                  currentPage === "demo"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-2xl">🧪</span>
                <span>UI Demo</span>
              </button>
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200 mt-8">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  💳 Open Cash Drawer
                </button>
                <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  🖨️ Test Print
                </button>
                <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  ⚙️ Settings
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4">{renderPage()}</main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
