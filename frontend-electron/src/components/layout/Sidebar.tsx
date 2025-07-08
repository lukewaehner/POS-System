import React from "react";

interface NavigationItem {
  name: string;
  path: string;
  icon: string;
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", path: "/", icon: "🏠" },
  { name: "Products", path: "/products", icon: "📦" },
  { name: "Checkout", path: "/checkout", icon: "🛒" },
  { name: "Sales", path: "/sales", icon: "💰" },
  { name: "Reports", path: "/reports", icon: "📊" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          return (
            <a
              key={item.name}
              href={item.path}
              className="flex items-center space-x-3 px-4 py-4 rounded-lg text-left w-full transition-colors duration-200 text-lg font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 no-underline"
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          );
        })}
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
  );
};

export default Sidebar;
