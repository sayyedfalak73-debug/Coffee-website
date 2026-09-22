import http.server
import socketserver
import os
import sys

PORT = 8000

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable caching for frames
        if self.path.endswith('.webp') or self.path.endswith('.png'):
            self.send_header('Cache-Control', 'public, max-age=86400')
        else:
            self.send_header('Cache-Control', 'no-cache')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def guess_type(self, path):
        if path.endswith('.webp'):
            return 'image/webp'
        return super().guess_type(path)

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    
    for port in [PORT, 8080, 8888, 5000]:
        try:
            with socketserver.TCPServer(("", port), CustomHTTPHandler) as httpd:
                print(f"Serving Smooth Scroll Animation at http://localhost:{port}/")
                sys.stdout.flush()
                httpd.serve_forever()
        except OSError:
            print(f"Port {port} in use, trying next...")
            continue

if __name__ == "__main__":
    run()
