/**
 * Torii API Server
 * REST API wrapper for Japan Crypto Compliance Checker
 */

import express from 'express';
import cors from 'cors';
import { ToriiEngine } from './torii-engine.js';

const app = express();
const PORT = process.env.PORT || 3000;
const engine = new ToriiEngine();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Torii API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: '⛩️  Torii - Japan Crypto Compliance API',
    version: '1.0.0',
    endpoints: {
      'POST /api/check': 'Analyze token description and classify',
      'GET /api/classify/:type': 'Quick classification by token type',
      'GET /health': 'Health check'
    },
    documentation: '/api/docs'
  });
});

/**
 * POST /api/check
 * Analyze token description and return classification
 * 
 * Body: { "description": "token description text" }
 * Returns: { classification, riskScore, risks, required, ... }
 */
app.post('/api/check', (req, res) => {
  try {
    const { description } = req.body;

    // Validation
    if (!description || typeof description !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid "description" field',
        example: { description: 'ERC-20 governance token with fee distribution' }
      });
    }

    if (description.length < 10) {
      return res.status(400).json({
        error: 'Description too short (minimum 10 characters)',
        provided: description.length
      });
    }

    if (description.length > 2000) {
      return res.status(400).json({
        error: 'Description too long (maximum 2000 characters)',
        provided: description.length
      });
    }

    // Process
    const startTime = Date.now();
    const result = engine.classify(description);
    const processingTime = Date.now() - startTime;

    // Response
    res.json({
      success: true,
      data: result,
      meta: {
        processingTimeMs: processingTime,
        descriptionLength: description.length
      }
    });
  } catch (error) {
    console.error('Error in /api/check:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/classify/:type
 * Quick classification by token type
 * 
 * Params: type (utility|governance|security|payment|nft)
 * Returns: { type, registration, risk, action, confidence }
 */
app.get('/api/classify/:type', (req, res) => {
  try {
    const { type } = req.params;

    const result = engine.quickClassify(type);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.message.includes('Unknown type')) {
      return res.status(400).json({
        error: error.message,
        validTypes: ['utility', 'governance', 'security', 'payment', 'nft']
      });
    }

    console.error('Error in /api/classify:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/docs
 * API documentation
 */
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Torii API Documentation',
    version: '1.0.0',
    baseUrl: `http://localhost:${PORT}`,
    endpoints: [
      {
        method: 'POST',
        path: '/api/check',
        description: 'Analyze token description and return compliance classification',
        requestBody: {
          description: 'string (10-2000 characters) - Token description'
        },
        responseFields: {
          classification: 'Token classification type',
          classificationJP: 'Japanese classification name',
          riskScore: 'Risk score (0-100)',
          riskLevel: 'HIGH|MEDIUM|LOW',
          required: 'Required registration/license',
          governingLaw: 'Applicable Japanese law',
          risks: 'Array of detected risk factors',
          confidence: 'Confidence score (0-1)',
          timestamp: 'ISO 8601 timestamp',
          disclaimer: 'Legal disclaimer',
          futureConsideration: 'Upcoming regulatory changes'
        },
        example: {
          request: {
            description: 'ERC-20 governance token for DeFi protocol, holders receive 2% of trading fees'
          },
          response: {
            success: true,
            data: {
              classification: 'HIGH RISK - Possible Security',
              riskScore: 40,
              riskLevel: 'HIGH',
              required: 'Legal consultation before Japan launch',
              risks: ['⚠️  Profit/revenue distribution detected', 'ℹ️  Governance rights'],
              confidence: 0.80
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/api/classify/:type',
        description: 'Quick classification lookup by token type',
        parameters: {
          type: 'utility|governance|security|payment|nft'
        },
        responseFields: {
          type: 'Token type classification',
          registration: 'Registration requirements',
          risk: 'Risk level',
          action: 'Recommended action',
          confidence: 'Confidence score (0-1)',
          timestamp: 'ISO 8601 timestamp'
        },
        example: {
          request: 'GET /api/classify/governance',
          response: {
            success: true,
            data: {
              type: 'GOVERNANCE TOKEN',
              registration: 'Depends on economic rights',
              risk: 'MEDIUM',
              action: 'Review for profit-sharing mechanisms',
              confidence: 0.75
            }
          }
        }
      }
    ],
    notes: [
      'All responses include a "disclaimer" field - this is not legal advice',
      'Response times are typically <100ms',
      'Maximum description length: 2000 characters',
      'Confidence scores indicate classification certainty (higher is more certain)'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    availableEndpoints: ['POST /api/check', 'GET /api/classify/:type', 'GET /health']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`⛩️  Torii API server running on http://localhost:${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});
