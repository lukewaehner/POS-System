import React, { useState } from "react";
import { apiUtils, handleApiError, ApiErrorResponse } from "../services/api";
import { LoadingSpinner, ErrorMessage } from "./ui";
import { AxiosError } from "axios";

interface ConnectionStatus {
  api: boolean | null;
  database: boolean | null;
  loading: boolean;
  error: string | null;
}

const ApiConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    api: null,
    database: null,
    loading: false,
    error: null,
  });

  const testConnections = async () => {
    setStatus({
      api: null,
      database: null,
      loading: true,
      error: null,
    });

    try {
      // Test API connection
      const apiConnected = await apiUtils.testConnection();

      // Test database connection
      const dbConnected = await apiUtils.testDatabase();

      setStatus({
        api: apiConnected,
        database: dbConnected,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = handleApiError(
        error as AxiosError<ApiErrorResponse>
      );
      setStatus({
        api: false,
        database: false,
        loading: false,
        error: errorMessage,
      });
    }
  };

  const getStatusIcon = (connected: boolean | null) => {
    if (connected === null) return "⚪";
    return connected ? "✅" : "❌";
  };

  const getStatusText = (connected: boolean | null) => {
    if (connected === null) return "Not tested";
    return connected ? "Connected" : "Failed";
  };

  const getStatusColor = (connected: boolean | null) => {
    if (connected === null) return "text-gray-500";
    return connected ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          API Connection Test
        </h3>
        <button
          onClick={testConnections}
          disabled={status.loading}
          className="btn-primary"
        >
          {status.loading ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            "🔄 Test Connection"
          )}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(status.api)}</span>
            <div>
              <div className="font-medium text-gray-900">API Server</div>
              <div className="text-sm text-gray-500">
                http://localhost:3001/api
              </div>
            </div>
          </div>
          <span className={`font-medium ${getStatusColor(status.api)}`}>
            {getStatusText(status.api)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(status.database)}</span>
            <div>
              <div className="font-medium text-gray-900">Database</div>
              <div className="text-sm text-gray-500">SQLite Connection</div>
            </div>
          </div>
          <span className={`font-medium ${getStatusColor(status.database)}`}>
            {getStatusText(status.database)}
          </span>
        </div>
      </div>

      {status.error && (
        <div className="mt-4">
          <ErrorMessage
            type="network"
            message={status.error}
            onRetry={testConnections}
            retryText="Retry Test"
          />
        </div>
      )}

      {status.api === true && status.database === true && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">🎉</span>
            <span className="text-green-800 font-medium">
              All connections successful!
            </span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            The frontend is successfully connected to the backend API and
            database.
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• Make sure the backend server is running on port 3001</p>
        <p>• Check that the database is properly configured</p>
        <p>• Verify there are no firewall issues blocking the connection</p>
      </div>
    </div>
  );
};

export default ApiConnectionTest;
