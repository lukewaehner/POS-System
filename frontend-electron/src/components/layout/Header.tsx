import React, { useState, useEffect } from "react";

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Store Info */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">POS Terminal</h1>
          <span className="text-sm text-gray-500">Store #001</span>
        </div>

        {/* Center - Current Date/Time */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="text-sm text-gray-600">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Cashier</div>
            <div className="text-xs text-gray-500">Terminal 1</div>
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">C</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
