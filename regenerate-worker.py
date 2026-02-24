#!/usr/bin/env python3
"""
Regenerate worker.js with updated HTML content.
JSON-escape the HTML and embed it into the Cloudflare Worker.
"""

import json
from pathlib import Path

def json_escape_html(html_content):
    """JSON-escape HTML content for embedding in JavaScript."""
    # Use json.dumps to properly escape the string
    return json.dumps(html_content)

def regenerate_worker_js(html_path, worker_template_path, output_path):
    """
    Read HTML, JSON-escape it, and regenerate worker.js.
    """
    # Read HTML
    print(f"Reading HTML from {html_path}...")
    html_content = html_path.read_text()

    # JSON-escape it
    print("JSON-escaping HTML...")
    escaped_html = json_escape_html(html_content)

    # Create worker.js content
    worker_js = f'''/**
 * Cloudflare Worker for password-protected investor intro tracker
 */

const USERNAME = 'ramp';
const PASSWORD = 'ramp2026';

const HTML = {escaped_html};

export default {{
  async fetch(request) {{
    const authorization = request.headers.get('Authorization');

    if (!authorization) {{
      return new Response('Authentication required', {{
        status: 401,
        headers: {{ 'WWW-Authenticate': 'Basic realm="Ramp Investor Intros"' }},
      }});
    }}

    const [scheme, encoded] = authorization.split(' ');
    if (!encoded || scheme !== 'Basic') {{
      return new Response('Invalid authentication', {{ status: 401 }});
    }}

    const decoded = atob(encoded);
    const [username, password] = decoded.split(':');

    if (username !== USERNAME || password !== PASSWORD) {{
      return new Response('Invalid credentials', {{
        status: 401,
        headers: {{ 'WWW-Authenticate': 'Basic realm="Ramp Investor Intros"' }},
      }});
    }}

    return new Response(HTML, {{
      headers: {{ 'Content-Type': 'text/html;charset=UTF-8' }},
    }});
  }},
}};
'''

    # Write worker.js
    print(f"Writing worker.js to {output_path}...")
    output_path.write_text(worker_js)

    print(f"✓ Worker.js regenerated successfully")
    print(f"  - HTML size: {len(html_content)} bytes")
    print(f"  - Escaped size: {len(escaped_html)} bytes")

def main():
    """Main regeneration process."""
    tracker_dir = Path("/Users/szymonsypniewicz/Documents/tracker")

    html_path = tracker_dir / "index.html"
    worker_path = tracker_dir / "worker.js"

    regenerate_worker_js(html_path, None, worker_path)

    print("\n✓ Ready to deploy!")
    print("  Run: cd /Users/szymonsypniewicz/Documents/tracker && wrangler deploy")

if __name__ == '__main__':
    main()
