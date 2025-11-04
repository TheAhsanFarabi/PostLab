// This is our serverless function, it will run on Vercel's backend.
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { url, method, params, headers, body } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // 1. Construct final URL with query parameters
        const targetUrl = new URL(url);
        Object.entries(params || {}).forEach(([key, value]) => {
            targetUrl.searchParams.append(key, value);
        });

        // 2. Set up fetch options
        const options = {
            method: method,
            headers: headers || {},
        };

        // Add body only if it's a method that supports it and body is not null
        if (method !== 'GET' && method !== 'DELETE' && body) {
            try {
                // If body is an object/array, stringify it.
                // If it's already a string, use it as is.
                options.body = typeof body === 'string' ? body : JSON.stringify(body);
                // We assume the user has set the 'Content-Type' header correctly if needed
            } catch (e) {
                return res.status(400).json({ 
                    status: 400,
                    statusText: "Bad Request",
                    body: { error: "Invalid JSON body provided" } 
                });
            }
        }
        
        // 3. Make the actual request from the server
        const response = await fetch(targetUrl.toString(), options);

        // 4. Process the response
        let resBody;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            resBody = await response.json();
        } else {
            resBody = await response.text();
        }

        // Get all headers from the response
        const resHeaders = {};
        response.headers.forEach((value, key) => {
            resHeaders[key] = value;
        });

        // 5. Send the processed response back to our frontend
        res.status(200).json({
            status: response.status,
            statusText: response.statusText,
            headers: resHeaders,
            body: resBody,
        });

    } catch (error) {
        console.error("Proxy error:", error.message);
        // Send a structured error response back to the frontend
        res.status(500).json({
            status: 500,
            statusText: "Proxy Fetch Error",
            headers: {},
            body: { 
                error: "The server-side proxy failed to fetch the request.",
                message: error.message 
            }
        });
    }
}
