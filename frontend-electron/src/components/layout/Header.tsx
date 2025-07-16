import React, { useState } from "react";

type Page =
  | "dashboard"
  | "products"
  | "sales"
  | "checkout"
  | "checkout-summary"
  | "reports"
  | "demo"
  | "debug";

interface HeaderProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

// HamburgerMenu Component
const HamburgerMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}> = ({ isOpen, onClose, currentPage, onPageChange }) => {
  if (!isOpen) return null;

  const navigationItems = [
    { id: "dashboard", name: "Dashboard", icon: "🏠" },
    { id: "products", name: "Products", icon: "📦" },
    { id: "checkout", name: "Checkout", icon: "🛒" },
    { id: "checkout-summary", name: "Payment", icon: "💳" },
    { id: "sales", name: "Sales", icon: "💰" },
    { id: "reports", name: "Reports", icon: "📊" },
    { id: "demo", name: "Component Demo", icon: "🎯" },
    { id: "debug", name: "Debug", icon: "🔧" },
  ];

  const handlePageChange = (page: Page) => {
    onPageChange(page);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Slide-out Menu */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">POS Menu</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Store Information
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Store #001 - Main Location</div>
              <div>Register 1</div>
              <div>Cashier: C</div>
              <div>Session: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Navigation
            </h3>
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id as Page)}
                  className={`w-full text-left p-2 rounded-lg text-sm flex items-center space-x-2 transition-colors ${
                    currentPage === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-lg text-sm">
                📊 View Sales Reports
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-lg text-sm">
                📦 Inventory Management
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-lg text-sm">
                👥 Customer Management
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-lg text-sm">
                🎯 Promotions & Discounts
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">System</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-lg text-sm">
                ⚙️ Settings
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-lg text-sm">
                🔧 Hardware Setup
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-lg text-sm">
                📱 Help & Support
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                // Handle sign out - you can add proper confirmation modal later
                console.log("Sign out requested");
                onClose();
              }}
              className="w-full text-left p-2 hover:bg-red-50 rounded-lg text-sm text-red-600"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange }) => {
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);

  const getPageTitle = (page: Page): string => {
    switch (page) {
      case "dashboard":
        return "Dashboard";
      case "products":
        return "Products";
      case "sales":
        return "Sales";
      case "checkout":
        return "Checkout";
      case "checkout-summary":
        return "Checkout Summary";
      case "reports":
        return "Reports";
      case "demo":
        return "Component Demo";
      case "debug":
        return "Debug";
      default:
        return "POS Terminal";
    }
  };

  return (
    <>
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0 h-12">
        <div className="flex items-center justify-between h-full">
          {/* Left Section - Navigation & Store Info */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setHamburgerMenuOpen(true)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-lg">☰</span>
            </button>
            <span className="text-sm font-medium text-gray-700">#001•R1</span>
            <span className="text-sm text-gray-600">C</span>
          </div>

          {/* Center Section - Page Title */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-900">
              {getPageTitle(currentPage)}
            </span>
          </div>

          {/* Right Section - Settings & Status */}
          <div className="flex items-center space-x-2">
            <button
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <span className="text-lg">⚙️</span>
            </button>
            <div
              className="w-2 h-2 bg-green-500 rounded-full"
              title="System Online"
            ></div>
          </div>
        </div>
      </div>

      {/* Hamburger Menu */}
      <HamburgerMenu
        isOpen={hamburgerMenuOpen}
        onClose={() => setHamburgerMenuOpen(false)}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </>
  );
};

export default Header;
