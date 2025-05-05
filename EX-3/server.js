const http = require('http');
const fs = require('fs');
const { parse } = require('querystring');

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    console.log(`Received ${method} request for ${url}`);

    if (url === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('Welcome to the Home Page');
    }

    if (url === '/contact' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(`
            <form method="POST" action="/contact">
                <input type="text" name="name" placeholder="Your name" required />
                <button type="submit">Submit</button>
            </form>
        `);
    }

    if (url === '/contact' && method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const parsed = parse(body);
            const name = parsed.name?.trim();

            if (!name) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                return res.end(`<h3>Name cannot be empty. <a href="/contact">Go back</a></h3>`);
            }

            console.log(`Received name: ${name}`);

            const entry = { name, timestamp: new Date().toISOString() };

            fs.appendFile('submissions.json', JSON.stringify(entry) + '\n', (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    return res.end('<h3>Server error. Please try again later.</h3>');
                }

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>Thanks</title></head>
                        <body>
                            <h2>Thank you, ${name}!</h2>
                            <p>Your submission was saved successfully.</p>
                        </body>
                    </html>
                `);
            });
        });

        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
});

server.listen(3001, () => {
    console.log('Server is running at http://localhost:3001');
});
