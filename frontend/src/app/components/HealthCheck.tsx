import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../services/client';

interface HealthStatus {
  service: string;
  url: string;
  status: 'checking' | 'success' | 'error';
  message: string;
  responseTime?: number;
}

export function HealthCheck() {
  const [checks, setChecks] = useState<HealthStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    const results: HealthStatus[] = [];

    // Check API Gateway
    const apiGatewayUrl = `${API_BASE_URL}/actuator/health`;
    const startTime = Date.now();

    try {
      const response = await fetch(apiGatewayUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        results.push({
          service: 'API Gateway',
          url: apiGatewayUrl,
          status: 'success',
          message: `Status: ${data.status || 'UP'}`,
          responseTime,
        });
      } else {
        results.push({
          service: 'API Gateway',
          url: apiGatewayUrl,
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
        });
      }
    } catch (error) {
      results.push({
        service: 'API Gateway',
        url: apiGatewayUrl,
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
      });
    }

    // Check Auth Service endpoint
    const authUrl = `${API_BASE_URL}/api/auth/health`;
    const authStartTime = Date.now();

    try {
      const response = await fetch(authUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const responseTime = Date.now() - authStartTime;

      if (response.ok) {
        results.push({
          service: 'Auth Service',
          url: authUrl,
          status: 'success',
          message: 'Reachable',
          responseTime,
        });
      } else {
        results.push({
          service: 'Auth Service',
          url: authUrl,
          status: 'error',
          message: `HTTP ${response.status}`,
          responseTime,
        });
      }
    } catch (error) {
      results.push({
        service: 'Auth Service',
        url: authUrl,
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
      });
    }

    setChecks(results);
    setIsChecking(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">🔍 System Health Check</h1>
            <button
              onClick={checkHealth}
              disabled={isChecking}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isChecking ? 'Checking...' : 'Refresh'}
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm font-medium text-blue-900">API Base URL</p>
            <p className="text-lg font-mono text-blue-700">{API_BASE_URL}</p>
          </div>

          <div className="space-y-4">
            {checks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Running health checks...</p>
            ) : (
              checks.map((check, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    check.status === 'success'
                      ? 'bg-green-50 border-green-500'
                      : check.status === 'error'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{check.service}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        check.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : check.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {check.status === 'success' ? '✅ UP' : check.status === 'error' ? '❌ DOWN' : '⏳ CHECKING'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-mono mb-1">{check.url}</p>
                  <p className="text-sm text-gray-700">{check.message}</p>
                  {check.responseTime && (
                    <p className="text-xs text-gray-500 mt-1">Response time: {check.responseTime}ms</p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-3">Troubleshooting Tips</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Make sure Docker Desktop is running</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Start backend services: <code className="bg-gray-200 px-2 py-1 rounded">docker compose up -d</code></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Check services are running: <code className="bg-gray-200 px-2 py-1 rounded">docker compose ps</code></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Check API Gateway logs: <code className="bg-gray-200 px-2 py-1 rounded">docker compose logs api-gateway</code></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">5.</span>
                <span>Test manually: <code className="bg-gray-200 px-2 py-1 rounded">curl {API_BASE_URL}/actuator/health</code></span>
              </li>
            </ul>
          </div>

          <div className="mt-6 flex space-x-4">
            <a
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Back to Home
            </a>
            <a
              href="http://localhost:8761"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Open Eureka Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

