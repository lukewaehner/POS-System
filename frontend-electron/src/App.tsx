import React, { useState } from "react";
import "./App.css";

// Import components
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Checkout from "./pages/Checkout";
import CheckoutSummary from "./pages/CheckoutSummary";
import Reports from "./pages/Reports";
import ComponentDemo from "./pages/ComponentDemo";
import BarcodeScannerDebug from "./components/debug/BarcodeScannerDebug";

// Import layout components
import Header from "./components/layout/Header";

// Import state management
import { AppProvider } from "./hooks";

type Page =
  | "dashboard"
  | "products"
  | "sales"
  | "checkout"
  | "checkout-summary"
  | "reports"
  | "demo"
  | "debug";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  // Define pages that should have outside margins
  const pagesWithMargins: Page[] = [
    "dashboard",
    "products",
    "sales",
    "reports",
    "demo",
    "debug",
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <Products />;
      case "sales":
        return <Sales />;
      case "checkout":
        return <Checkout onNavigate={(page) => setCurrentPage(page as Page)} />;
      case "checkout-summary":
        return (
          <CheckoutSummary
            onNavigate={(page) => setCurrentPage(page as Page)}
          />
        );
      case "reports":
        return <Reports />;
      case "demo":
        return <ComponentDemo />;
      case "debug":
        return <BarcodeScannerDebug />;
      default:
        return <Dashboard />;
    }
  };

  const shouldHaveMargins = pagesWithMargins.includes(currentPage);

  const pageContent = renderPage();

  // Conditionally wrap with margins
  const wrappedContent = shouldHaveMargins ? (
    <div className="p-4">{pageContent}</div>
  ) : (
    pageContent
  );

  return (
    <AppProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Header */}
        <Header currentPage={currentPage} onPageChange={setCurrentPage} />

        {/* Main Content Area - Full Width */}
        <main className="flex-1 overflow-y-auto">{wrappedContent}</main>
      </div>
    </AppProvider>
  );
}

export default App;
