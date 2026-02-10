# Torii API Deployment Guide

Step-by-step guide to deploy Torii API for the Solana Colosseum hackathon demo.

---

## Local Deployment

### 1. Start the API

```bash
cd ~/.openclaw/workspace/colosseum-compliance-guardian/torii-api
./start.sh
```

Or manually:

```bash
npm install  # First time only
npm start
```

The API will be available at: `http://localhost:3000`

### 2. Verify It's Running

```bash
# Health check
curl http://localhost:3000/health

# Test classification
curl -X POST http://localhost:3000/api/check \
  -H "Content-Type: application/json" \
  -d '{"description": "ERC-20 governance token with staking"}'
```

### 3. Run Tests

```bash
npm test
```

Expected: **100% pass rate** (9 tests)

---

## Public Deployment (ngrok)

For hackathon demos, expose your local API to the internet using ngrok.

### 1. Install ngrok

```bash
# If not already installed
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

Or download from: https://ngrok.com/download

### 2. Start ngrok

```bash
# In a new terminal
ngrok http 3000
```

Output will show:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### 3. Use the Public URL

Replace `http://localhost:3000` with your ngrok URL:

```bash
curl https://abc123.ngrok.io/health
```

**Share this URL with your Solana agent!**

---

## Production Deployment (Optional)

For a more permanent deployment:

### Option 1: VPS (DigitalOcean, AWS, etc.)

```bash
# On your VPS
git clone <your-repo>
cd torii-api
npm install
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start server.js --name torii-api
pm2 startup
pm2 save
```

### Option 2: Docker

```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Build and run
docker build -t torii-api .
docker run -p 3000:3000 torii-api
```

### Option 3: Railway.app / Vercel / Render

1. Push to GitHub
2. Connect your repo to Railway/Vercel/Render
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Deploy!

---

## Environment Variables (Optional)

Create `.env` file for configuration:

```bash
PORT=3000
NODE_ENV=production
```

Load in server.js:
```javascript
import 'dotenv/config';
const PORT = process.env.PORT || 3000;
```

---

## Performance Tuning

For high traffic:

### 1. Enable Clustering

```javascript
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Start server
}
```

### 2. Add Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Add Caching (Redis)

For repeated queries, cache results in Redis:

```bash
npm install redis
```

---

## Monitoring

### Basic Logging

Already included in `server.js`:
```
[2026-02-10T08:30:00.000Z] POST /api/check
```

### PM2 Monitoring

```bash
pm2 monit
pm2 logs torii-api
```

### Health Check Endpoint

Use `/health` for uptime monitoring services:
- UptimeRobot
- Pingdom
- StatusCake

---

## Security

### For Production:

1. **Add API Key Authentication**
```javascript
app.use('/api', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

2. **Enable CORS Restrictions**
```javascript
app.use(cors({
  origin: 'https://your-frontend.com'
}));
```

3. **Add Helmet for Security Headers**
```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

---

## Troubleshooting

### Port 3000 already in use

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

### Dependencies not installing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Server crashes on request

Check logs:
```bash
npm start 2>&1 | tee server.log
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `./start.sh` | Start API (auto-install deps) |
| `npm start` | Start API |
| `npm test` | Run test suite |
| `curl localhost:3000/health` | Health check |
| `ngrok http 3000` | Expose to public internet |

---

## Support

For issues:
- Check API logs in terminal
- Test with `curl` first before blaming the agent
- Verify JSON format is valid
- Check that description is 10-2000 characters

Built for Solana Colosseum Hackathon 🏛️  
Powered by Crypto Times ⛩️
