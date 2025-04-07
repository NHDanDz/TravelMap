'use client';

import React, { useState } from 'react';

interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}

export default function ApiDebug() {
  const [url, setUrl] = useState('/api/test-tripadvisor?action=check');
  const [method, setMethod] = useState('GET');
  const [bodyContent, setBodyContent] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      // Add body for non-GET requests if provided
      if (method !== 'GET' && bodyContent.trim()) {
        try {
          options.body = bodyContent;
        } catch (e) {
          setError('Invalid JSON in request body');
          setLoading(false);
          return;
        }
      }

      const fetchResponse = await fetch(url, options);
      
      // Extract headers
      const headers: Record<string, string> = {};
      fetchResponse.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Parse response body - handle different content types
      let body;
      const contentType = fetchResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        body = await fetchResponse.json();
      } else {
        body = await fetchResponse.text();
      }

      setResponse({
        status: fetchResponse.status,
        headers,
        body
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('API request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">API Debug Tool</h2>
      
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., /api/test-tripadvisor?action=check"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        
        {method !== 'GET' && (
          <div>
            <label className="block text-sm font-medium mb-1">Request Body (JSON)</label>
            <textarea
              value={bodyContent}
              onChange={(e) => setBodyContent(e.target.value)}
              className="w-full p-2 border rounded font-mono text-sm"
              rows={5}
              placeholder='{}'
            />
          </div>
        )}
        
        <button
          onClick={sendRequest}
          disabled={loading}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Sending Request...' : 'Send Request'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {response && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Response</h3>
          
          <div className="mb-4">
            <p>
              <strong>Status:</strong>{' '}
              <span className={`${
                response.status >= 200 && response.status < 300 
                  ? 'text-green-600' 
                  : response.status >= 400 
                    ? 'text-red-600' 
                    : 'text-yellow-600'
              }`}>
                {response.status}
              </span>
            </p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-1">Headers</h4>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
              {JSON.stringify(response.headers, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Body</h4>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96 text-xs">
              {typeof response.body === 'string' 
                ? response.body 
                : JSON.stringify(response.body, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}