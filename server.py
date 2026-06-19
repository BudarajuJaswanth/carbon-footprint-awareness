import http.server
import socketserver

PORT = 8000

class SafeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

SafeHTTPRequestHandler.extensions_map.update({
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.manifest': 'application/manifest+json'
})

with socketserver.TCPServer(("", PORT), SafeHTTPRequestHandler) as httpd:
    print(f"EcoTrace Server running on port {PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
