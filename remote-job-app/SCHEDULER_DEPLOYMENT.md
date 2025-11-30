# Job Sync Scheduler - Deployment Guide

This guide shows you how to run the automated job sync scheduler in different environments.

## Overview

The scheduler automatically runs:
1. **Cleanup** - Remove 404 companies (every sync)
2. **Discovery** - Find new companies (every 4th sync = daily)
3. **Sync** - Fetch jobs from all sources (every 6 hours)

## Quick Start (Development)

### Run Once
```bash
# Run full sync once (cleanup + sync)
npm run full-sync

# Run complete maintenance (cleanup + discovery + sync)
npm run greenhouse:maintain && npm run sync-jobs
```

### Start Scheduler
```bash
npm run scheduler
```

This starts the scheduler with default settings:
- Runs every 6 hours
- Cleanup every sync
- Discovery every 4th sync (daily)
- Logs to `src/lib/.scheduler-logs/scheduler.log`

Press `Ctrl+C` to stop.

---

## Configuration

Control scheduler behavior with environment variables:

```bash
# Custom schedule (cron format)
SYNC_SCHEDULE="0 */3 * * *" npm run scheduler  # Every 3 hours

# Run discovery every N syncs
DISCOVERY_FREQUENCY=2 npm run scheduler  # Every 2nd sync = every 12 hours

# Disable automatic cleanup
ALWAYS_CLEANUP=false npm run scheduler

# Run immediately on start
RUN_ON_START=true npm run scheduler
```

### Cron Schedule Examples

```bash
"0 */6 * * *"    # Every 6 hours
"0 */3 * * *"    # Every 3 hours
"0 */12 * * *"   # Every 12 hours (twice daily)
"0 0 * * *"      # Once daily at midnight
"0 0,12 * * *"   # Twice daily (midnight and noon)
"0 8,14,20 * * *" # Three times daily (8am, 2pm, 8pm)
```

---

## Deployment Options

### Option 1: PM2 (Recommended for Servers)

PM2 keeps the scheduler running and auto-restarts on crashes.

**Install PM2:**
```bash
npm install -g pm2
```

**Start scheduler:**
```bash
pm2 start npm --name "job-scheduler" -- run scheduler
```

**With environment variables:**
```bash
pm2 start npm --name "job-scheduler" -- run scheduler \
  --env SYNC_SCHEDULE="0 */6 * * *" \
  --env DISCOVERY_FREQUENCY=4 \
  --env RUN_ON_START=true
```

**Useful PM2 commands:**
```bash
pm2 list                    # List all processes
pm2 logs job-scheduler      # View logs
pm2 stop job-scheduler      # Stop scheduler
pm2 restart job-scheduler   # Restart scheduler
pm2 delete job-scheduler    # Remove from PM2

# Auto-start on system boot
pm2 startup
pm2 save
```

---

### Option 2: systemd (Linux Servers)

Create a systemd service for automatic startup and management.

**Create service file:** `/etc/systemd/system/job-scheduler.service`

```ini
[Unit]
Description=Remote Job Manager - Job Sync Scheduler
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/remote-job-manager/remote-job-app
Environment="NODE_ENV=production"
Environment="SYNC_SCHEDULE=0 */6 * * *"
Environment="DISCOVERY_FREQUENCY=4"
Environment="RUN_ON_START=true"
ExecStart=/usr/bin/npm run scheduler
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/job-scheduler.log
StandardError=append:/var/log/job-scheduler-error.log

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable job-scheduler
sudo systemctl start job-scheduler
```

**Manage service:**
```bash
sudo systemctl status job-scheduler   # Check status
sudo systemctl stop job-scheduler     # Stop
sudo systemctl restart job-scheduler  # Restart
journalctl -u job-scheduler -f        # View logs
```

---

### Option 3: Docker (Containerized)

**Create Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Set default environment variables
ENV SYNC_SCHEDULE="0 */6 * * *"
ENV DISCOVERY_FREQUENCY=4
ENV RUN_ON_START=true

CMD ["npm", "run", "scheduler"]
```

**Build and run:**
```bash
docker build -t job-scheduler .
docker run -d \
  --name job-scheduler \
  --restart unless-stopped \
  -v $(pwd)/sqlite.db:/app/sqlite.db \
  -e SYNC_SCHEDULE="0 */6 * * *" \
  job-scheduler
```

---

### Option 4: GitHub Actions (Cloud)

Run the scheduler on GitHub's free runners.

**Create:** `.github/workflows/job-sync-scheduler.yml`

```yaml
name: Job Sync Scheduler

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'remote-job-app/package-lock.json'
      
      - name: Install dependencies
        working-directory: remote-job-app
        run: npm ci
      
      - name: Run cleanup
        working-directory: remote-job-app
        run: npm run greenhouse:cleanup
      
      - name: Run discovery (daily)
        working-directory: remote-job-app
        # Only run discovery once per day
        if: github.event.schedule == '0 0 * * *' || github.event_name == 'workflow_dispatch'
        run: npm run greenhouse:discover
      
      - name: Sync jobs
        working-directory: remote-job-app
        run: npm run sync-jobs
      
      - name: Commit updated database
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add remote-job-app/sqlite.db remote-job-app/src/lib/job-sources/greenhouse-companies.json
          git commit -m "🤖 Auto-sync: $(date +'%Y-%m-%d %H:%M')" || echo "No changes"
          git push
```

**Benefits:**
- ✅ Free (GitHub Actions included with repo)
- ✅ No server required
- ✅ Automatic commits to repo
- ✅ Manual trigger available

**Limitations:**
- ⚠️ Database stored in repo (not ideal for large DBs)
- ⚠️ Requires pushing DB to git

---

### Option 5: Cron (Simple Linux)

Use traditional cron for simple scheduling.

**Edit crontab:**
```bash
crontab -e
```

**Add line:**
```bash
0 */6 * * * cd /path/to/remote-job-app && npm run full-sync >> /var/log/job-sync.log 2>&1
```

**For complete workflow (with discovery):**
```bash
# Run cleanup + sync every 6 hours
0 */6 * * * cd /path/to/remote-job-app && npm run full-sync >> /var/log/job-sync.log 2>&1

# Run discovery once daily at 3 AM
0 3 * * * cd /path/to/remote-job-app && npm run greenhouse:discover >> /var/log/job-discovery.log 2>&1
```

---

## Monitoring

### View Logs

**Scheduler logs:**
```bash
tail -f src/lib/.scheduler-logs/scheduler.log
```

**PM2 logs:**
```bash
pm2 logs job-scheduler
```

**systemd logs:**
```bash
journalctl -u job-scheduler -f
```

### Check Database

```bash
# View job counts
npm run db:studio

# Or use sqlite directly
sqlite3 sqlite.db "SELECT COUNT(*) FROM JobListing;"
sqlite3 sqlite.db "SELECT sourceName, COUNT(*) FROM JobListing GROUP BY sourceName;"
```

---

## Troubleshooting

### Scheduler not running
```bash
# Check if process exists
ps aux | grep scheduler

# PM2 - check status
pm2 status

# systemd - check status
sudo systemctl status job-scheduler
```

### Too many API requests
Increase delay in scripts or reduce frequency:
```bash
# Run every 12 hours instead of 6
SYNC_SCHEDULE="0 */12 * * *" npm run scheduler
```

### Database locked
Ensure only one sync runs at a time. The scheduler handles this automatically.

### Out of disk space
Clean old logs and backups:
```bash
# Remove old backups (keep last 10)
cd src/lib/job-sources/.backups
ls -t | tail -n +11 | xargs rm

# Truncate logs
> src/lib/.scheduler-logs/scheduler.log
```

---

## Recommended Setup

For a production server:

1. **Use PM2** for process management
2. **Set schedule to every 6 hours**
3. **Discovery every 4th sync** (daily)
4. **Enable auto-start** on system boot
5. **Set up log rotation**
6. **Monitor disk usage**

```bash
# Complete production setup
npm install -g pm2
pm2 start npm --name "job-scheduler" -- run scheduler
pm2 save
pm2 startup
```

That's it! Your job sync will run automatically every 6 hours with cleanup and periodic discovery.
