import { useState } from 'react';
import Head from 'next/head';

// --- Key-Value Pair Component ---
// This component manages the lists of query params and headers
function KeyValueEditor({ items, setItems }) {
    
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { key: '', value: '' }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    return (
        <div className="space-y-2 p-2">
            {items.map((item, index) => (
                <div key={index} className="input-grid">
                    <input
                        type="text"
                        placeholder="Key"
                        className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={item.key}
                        onChange={(e) => handleItemChange(index, 'key', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Value"
                        className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={item.value}
                        onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                    />
                    <button
                        onClick={() => removeItem(index)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-md text-sm"
                    >
                        &times;
                    </button>
                </div>
            ))}
            <button
                onClick={addItem}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm mt-2"
            >
                Add
            </button>
        </div>
    );
}

// --- Helper Tab Component ---
function TabButton({ name, currentTab, setTab }) {
    const isActive = name === currentTab;
    return (
        <button
            onClick={() => setTab(name)}
            className={`py-2 px-4 font-medium text-sm capitalize
                ${isActive ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:bg-gray-700'}
            `}
        >
            {name}
        </button>
    );
}

// --- Main App Component (Your Page) ---
export default function Home() {
    // State for the request
    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
    const [requestTab, setRequestTab] = useState('params'); // 'params', 'headers', 'body'
    const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
    const [headers, setHeaders] = useState([{ key: '', value: '' }]);
    const [body, setBody] = useState('{\n  "key": "value"\n}');

    // State for the response
    const [response, setResponse] = useState(null);
    const [responseTab, setResponseTab] = useState('body'); // 'body', 'headers'
    const [loading, setLoading] = useState(false);

    // This function calls your OWN proxy API, not the target URL
    const handleSend = async () => {
        setLoading(true);
        setResponse(null);

        // 1. Construct Query Params
        const params = {};
        queryParams.forEach(param => {
            if (param.key) params[param.key] = param.value;
        });

        // 2. Construct Headers
        const requestHeaders = {};
        headers.forEach(header => {
            if (header.key) requestHeaders[header.key] = header.value;
        });

        // 3. Send everything to our proxy
        try {
            const res = await fetch('/api/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url,
                    method,
                    params,
                    headers: requestHeaders,
                    // Only send body if it's not GET/DELETE
                    body: (method !== 'GET' && method !== 'DELETE') ? body : null,
                }),
            });

            const data = await res.json();
            
            if (res.status !== 200) {
                 // If the proxy itself fails, show that error
                setResponse({
                    status: data.status || 500,
                    statusText: data.statusText || "Proxy Error",
                    headers: data.headers || {},
                    body: data.body || { error: "Proxy server failed", message: data.error }
                });
            } else {
                // The proxy succeeded, so show the response from the target API
                setResponse(data);
            }

        } catch (error) {
            console.error("Error calling proxy:", error);
            setResponse({
                status: 0,
                statusText: "Client Error",
                headers: {},
                body: { error: "Failed to connect to proxy API.", message: error.message }
            });
        }

        setLoading(false);
    };

    // --- Helper functions for styling ---
    const getMethodClass = (m) => {
        switch(m) {
            case 'GET': return 'text-green-400';
            case 'POST': return 'text-yellow-400';
            case 'PUT': return 'text-blue-400';
            case 'PATCH': return 'text-purple-400';
            case 'DELETE': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };
    
    const getStatusClass = (status) => {
        if (status >= 200 && status < 300) return 'text-green-400';
        if (status >= 400 && status < 500) return 'text-red-400';
        if (status >= 500) return 'text-orange-400';
        return 'text-gray-400';
    };

    // --- JSX for the UI ---
    return (
        <>
            <Head>
                <title>PostLab - API Tester</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="min-h-screen p-4 space-y-4 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold">PostLab</h1>

                {/* --- Request Panel --- */}
                <div className="flex space-x-2">
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className={`bg-gray-800 border border-gray-600 rounded-md p-2 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${getMethodClass(method)}`}
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Enter URL"
                        className="bg-gray-800 border border-gray-600 rounded-md p-2 text-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-gray-500"
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>

                {/* --- Request Configuration --- */}
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex border-b border-gray-700">
                        <TabButton name="params" currentTab={requestTab} setTab={setRequestTab} />
                        <TabButton name="headers" currentTab={requestTab} setTab={setRequestTab} />
                        <TabButton name="body" currentTab={requestTab} setTab={setRequestTab} />
                    </div>
                    
                    <div className="min-h-[150px]">
                        {requestTab === 'params' && <KeyValueEditor items={queryParams} setItems={setQueryParams} />}
                        {requestTab === 'headers' && <KeyValueEditor items={headers} setItems={setHeaders} />}
                        {requestTab === 'body' && (
                            <textarea
                                className="w-full h-48 p-2 bg-gray-700 text-white font-mono text-sm rounded-b-md focus:outline-none"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                // Disable body for GET/DELETE requests
                                disabled={method === 'GET' || method === 'DELETE'}
                            />
                        )}
                    </div>
                </div>

                {/* --- Response Panel --- */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 min-h-[200px]">
                    <div className="flex justify-between items-center border-b border-gray-700 p-2">
                        <div className="flex">
                            <TabButton name="body" currentTab={responseTab} setTab={setResponseTab} />
                            <TabButton name="headers" currentTab={responseTab} setTab={setResponseTab} />
                        </div>
                        {response && (
                            <div className="text-sm font-bold">
                                Status: <span className={getStatusClass(response.status)}>{response.status} {response.statusText}</span>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        {loading && <div className="p-4 text-center">Loading...</div>}
                        
                        {response && !loading && (
                            <pre className="p-4 text-sm font-mono overflow-auto">
                                {responseTab === 'body' && (
                                    // Check if body is a string (like from text()) or object (from json())
                                    typeof response.body === 'string'
                                        ? response.body
                                        : JSON.stringify(response.body, null, 2)
                                )}
                                {responseTab === 'headers' && JSON.stringify(response.headers, null, 2)}
                            </pre>
                        )}

                        {!response && !loading && (
                            <div className="p-10 text-center text-gray-500">
                                Click "Send" to make a request
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}

