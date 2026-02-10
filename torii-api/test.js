/**
 * Torii API Test Script
 * Tests all endpoints
 */

const BASE_URL = 'http://localhost:3000';

// Test cases
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    endpoint: '/health',
    expected: { status: 'ok' }
  },
  {
    name: 'High Risk Security Token',
    method: 'POST',
    endpoint: '/api/check',
    body: {
      description: 'ERC-20 governance token with fee distribution to stakers, buyback program, and revenue sharing from protocol profits'
    },
    expected: { riskLevel: 'HIGH' }  // Risk score varies, but should be HIGH
  },
  {
    name: 'Governance Token (Medium Risk)',
    method: 'POST',
    endpoint: '/api/check',
    body: {
      description: 'Governance token allowing holders to vote on protocol parameters and treasury allocations'
    },
    expected: { classification: 'UTILITY TOKEN' }
  },
  {
    name: 'NFT Classification',
    method: 'POST',
    endpoint: '/api/check',
    body: {
      description: 'ERC-721 NFT collectible with unique artwork and metadata'
    },
    expected: { classification: 'NFT', riskLevel: 'LOW' }
  },
  {
    name: 'Payment Token',
    method: 'POST',
    endpoint: '/api/check',
    body: {
      description: 'Digital currency for peer-to-peer payments and remittance transfers'
    },
    expected: { classification: 'CRYPTO ASSET' }
  },
  {
    name: 'Quick Classify - Governance',
    method: 'GET',
    endpoint: '/api/classify/governance',
    expected: { risk: 'MEDIUM' }
  },
  {
    name: 'Quick Classify - Security',
    method: 'GET',
    endpoint: '/api/classify/security',
    expected: { risk: 'HIGH' }
  },
  {
    name: 'Invalid Type (Should Fail)',
    method: 'GET',
    endpoint: '/api/classify/invalid',
    shouldFail: true
  },
  {
    name: 'Missing Description (Should Fail)',
    method: 'POST',
    endpoint: '/api/check',
    body: {},
    shouldFail: true
  }
];

// Helper function to make requests
async function makeRequest(test) {
  const { method, endpoint, body } = test;
  const url = `${BASE_URL}${endpoint}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  return { status: response.status, data };
}

// Run tests
async function runTests() {
  console.log('⛩️  Torii API Test Suite\n');
  console.log('Testing server at:', BASE_URL);
  console.log('═'.repeat(60));
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const startTime = Date.now();
      const { status, data } = await makeRequest(test);
      const duration = Date.now() - startTime;

      // Check if test should fail
      if (test.shouldFail) {
        if (status >= 400) {
          console.log(`✅ ${test.name}`);
          console.log(`   Status: ${status} (expected failure)`);
          console.log(`   Time: ${duration}ms\n`);
          passed++;
        } else {
          console.log(`❌ ${test.name}`);
          console.log(`   Expected failure but got ${status}\n`);
          failed++;
        }
        continue;
      }

      // Check success
      if (status !== 200) {
        console.log(`❌ ${test.name}`);
        console.log(`   Status: ${status}`);
        console.log(`   Error: ${data.error || 'Unknown error'}\n`);
        failed++;
        continue;
      }

      // Validate expected fields
      let valid = true;
      const result = data.data || data;

      for (const [key, value] of Object.entries(test.expected || {})) {
        if (typeof value === 'number') {
          // For risk scores, allow some tolerance
          if (key === 'riskScore' && Math.abs(result[key] - value) <= 10) {
            continue;
          }
        }
        if (result[key] !== value && !result[key]?.includes?.(value)) {
          valid = false;
          console.log(`❌ ${test.name}`);
          console.log(`   Expected ${key}: ${value}`);
          console.log(`   Got ${key}: ${result[key]}\n`);
          failed++;
          break;
        }
      }

      if (valid) {
        console.log(`✅ ${test.name}`);
        if (result.classification) {
          console.log(`   Classification: ${result.classification}`);
          console.log(`   Risk Score: ${result.riskScore || 'N/A'}`);
          console.log(`   Confidence: ${result.confidence || 'N/A'}`);
        }
        console.log(`   Time: ${duration}ms\n`);
        passed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    }
  }

  // Summary
  console.log('═'.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`✅ Success rate: ${((passed / tests.length) * 100).toFixed(1)}%\n`);

  process.exit(failed > 0 ? 1 : 0);
}

// Run
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
