# Deployment Guide for Investor Intro Links

## Quick Start (Local Testing)

```bash
cd /Users/szymonsypniewicz/Documents/code/tracker
python3 server.py
```

Then visit: http://localhost:8080

**Credentials:**
- Username: `ramp`
- Password: `ramp2026`

## Deploy to process.sypniewicz.com

### Option 1: Deploy to VPS/Cloud Server

If you have SSH access to the server running process.sypniewicz.com:

```bash
# 1. Copy files to server
scp investor-intro-links.html server.py user@process.sypniewicz.com:/var/www/tracker/

# 2. SSH into server
ssh user@process.sypniewicz.com

# 3. Install systemd service
sudo tee /etc/systemd/system/investor-tracker.service > /dev/null <<EOF
[Unit]
Description=Ramp Investor Intro Tracker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/tracker
ExecStart=/usr/bin/python3 /var/www/tracker/server.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 4. Start service
sudo systemctl daemon-reload
sudo systemctl enable investor-tracker
sudo systemctl start investor-tracker

# 5. Setup nginx reverse proxy
sudo tee /etc/nginx/sites-available/tracker > /dev/null <<'EOF'
server {
    listen 80;
    server_name process.sypniewicz.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 6. Setup SSL with Let's Encrypt
sudo certbot --nginx -d process.sypniewicz.com
```

### Option 2: Deploy to Fly.io (5 minutes, free tier)

```bash
cd /Users/szymonsypniewicz/Documents/code/tracker

# Create Dockerfile
cat > Dockerfile <<'EOF'
FROM python:3.9-slim
WORKDIR /app
COPY investor-intro-links.html server.py ./
CMD ["python3", "server.py"]
EXPOSE 8080
EOF

# Create fly.toml
cat > fly.toml <<'EOF'
app = "ramp-investor-tracker"
primary_region = "iad"

[build]

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
EOF

# Deploy
fly launch --no-deploy
fly deploy
fly apps open
```

Then point process.sypniewicz.com DNS to the Fly.io app.

### Option 3: Deploy to Vercel (Simplest, 2 minutes)

```bash
cd /Users/szymonsypniewicz/Documents/code/tracker

# Install Vercel CLI
npm install -g vercel

# Create simple Node.js server
cat > index.js <<'EOF'
const http = require('http');
const fs = require('fs');
const auth = require('basic-auth');

const html = fs.readFileSync('investor-intro-links.html', 'utf8');

http.createServer((req, res) => {
  const credentials = auth(req);

  if (!credentials || credentials.name !== 'ramp' || credentials.pass !== 'ramp2026') {
    res.writeHead(401, {
      'WWW-Authenticate': 'Basic realm="Ramp Investor Intros"'
    });
    res.end('Authentication required');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}).listen(process.env.PORT || 3000);
EOF

# Create package.json
cat > package.json <<'EOF'
{
  "name": "investor-tracker",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "basic-auth": "^2.0.1"
  },
  "scripts": {
    "start": "node index.js"
  }
}
EOF

# Deploy
vercel --prod

# Add custom domain
vercel domains add process.sypniewicz.com
```

## Change Password

Edit `server.py` and change:
```python
PASSWORD = "your-new-password"
USERNAME = "your-username"  # optional
```

## Security Note

Basic auth over HTTPS is secure for this use case. For production, consider:
- Using environment variables for credentials
- Adding rate limiting
- Logging access attempts
