# Ramp Investor Intro Tracker

Password-protected page for tracking warm intro opportunities.

## Credentials

- **Username:** `ramp`
- **Password:** `ramp2026` (change in `server.py`)

## Deploy to Coolify

1. **Option A: Deploy from Git**
   - Push this directory to a GitHub repo
   - In Coolify: New Resource → Git Repository
   - Point to your repo
   - Coolify will auto-detect the Dockerfile
   - Set domain: `process.sypniewicz.com`
   - Deploy!

2. **Option B: Deploy via Coolify CLI**
   ```bash
   cd /Users/szymonsypniewicz/Documents/tracker

   # Initialize git if not already
   git init
   git add .
   git commit -m "Initial commit: investor intro tracker"

   # Push to your git remote (GitHub/GitLab)
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **In Coolify Dashboard:**
   - Go to your Coolify instance
   - Click "New Resource" → "Application"
   - Select "Public Repository" or "Private Repository"
   - Enter the Git URL
   - Coolify auto-detects Dockerfile
   - Set **Port**: `8080`
   - Set **Domain**: `process.sypniewicz.com`
   - Click Deploy

## Change Password

Edit `server.py`:
```python
PASSWORD = "your-new-password"
USERNAME = "your-username"
```

Then redeploy in Coolify.

## Local Testing

```bash
python3 server.py
# Visit http://localhost:8080
```

Or with Docker:
```bash
docker build -t investor-tracker .
docker run -p 8080:8080 investor-tracker
# Visit http://localhost:8080
```
