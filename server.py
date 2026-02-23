#!/usr/bin/env python3
"""
Simple HTTP server with basic password authentication for investor-intro-links.html
Deploy to process.sypniewicz.com with password protection
"""

import http.server
import socketserver
import base64
from functools import partial

# Configuration
PORT = 8080
PASSWORD = "ramp2026"  # Change this to your desired password
USERNAME = "ramp"

class AuthHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, username=None, password=None, **kwargs):
        self.username = username
        self.password = password
        super().__init__(*args, **kwargs)

    def do_GET(self):
        # Check for authentication
        auth_header = self.headers.get('Authorization')

        if auth_header is None:
            self.send_auth_required()
            return

        # Decode and check credentials
        try:
            auth_type, auth_string = auth_header.split(' ', 1)
            if auth_type.lower() != 'basic':
                self.send_auth_required()
                return

            decoded = base64.b64decode(auth_string).decode('utf-8')
            username, password = decoded.split(':', 1)

            if username == self.username and password == self.password:
                # Redirect root to investor-intro-links.html
                if self.path == '/':
                    self.path = '/investor-intro-links.html'
                return super().do_GET()
            else:
                self.send_auth_required()
                return
        except Exception:
            self.send_auth_required()
            return

    def send_auth_required(self):
        self.send_response(401)
        self.send_header('WWW-Authenticate', 'Basic realm="Ramp Investor Intros"')
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b'<html><body><h1>401 Unauthorized</h1><p>Authentication required.</p></body></html>')

if __name__ == '__main__':
    handler = partial(AuthHandler, username=USERNAME, password=PASSWORD)

    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Server running on port {PORT}")
        print(f"Username: {USERNAME}")
        print(f"Password: {PASSWORD}")
        print(f"\nAccess at: http://localhost:{PORT}")
        print(f"Deploy to: process.sypniewicz.com")
        print("\nPress Ctrl+C to stop")
        httpd.serve_forever()
