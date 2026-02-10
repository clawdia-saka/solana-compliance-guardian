# Torii API

⛩️ **REST API wrapper for Torii Japan Crypto Compliance Checker**

Convert the Torii bash skill into a callable API service for the Colosseum Compliance Guardian project.

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Run tests (in another terminal)
npm test
```

Server runs at: `http://localhost:3000`

## Features

- ✅ **POST /api/check** - Analyze token descriptions
- ✅ **GET /api/classify/:type** - Quick classification lookup
- ✅ Fast response times (<100ms)
- ✅ Risk scoring (0-100)
- ✅ Confidence scores
- ✅ Japanese regulatory context

## Example Usage

```bash
# Check a token
curl -X POST http://localhost:3000/api/check \
  -H "Content-Type: application/json" \
  -d '{"description": "ERC-20 governance token with staking rewards"}'

# Quick lookup
curl http://localhost:3000/api/classify/governance
```

## Documentation

Full API documentation: [API.md](./API.md)

## Architecture

```
torii-api/
├── server.js          # Express server
├── torii-engine.js    # Core classification logic
├── test.js            # Test suite
├── package.json       # Dependencies
├── API.md            # Full API docs
└── README.md         # This file
```

## For Hackathon Demo

1. Start API locally: `npm start`
2. Expose with ngrok: `ngrok http 3000`
3. Use ngrok URL in Solana agent

## Requirements

- Node.js 18+ (v22.22.0 recommended)
- No external API keys needed
- Runs on tt-i7 (8-core i7, 32GB RAM)

## License

MIT
