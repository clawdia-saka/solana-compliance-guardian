#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Colosseum Compliance Guardian - Test Suite Runner  ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

FAILED=0
PASSED=0

# Function to run test
run_test() {
    local name="$1"
    local cmd="$2"
    local dir="$3"
    
    echo -e "${BLUE}▶ Running: ${name}${NC}"
    echo -e "${YELLOW}  Command: ${cmd}${NC}"
    echo -e "${YELLOW}  Directory: ${dir}${NC}"
    echo ""
    
    if cd "$dir" && eval "$cmd"; then
        echo -e "${GREEN}✅ ${name} PASSED${NC}"
        echo ""
        ((PASSED++))
    else
        echo -e "${RED}❌ ${name} FAILED${NC}"
        echo ""
        ((FAILED++))
    fi
    
    cd - > /dev/null
}

# Test 1: Torii API
echo -e "${CYAN}═══ TEST 1: Torii API Unit Tests ═══${NC}"
echo ""

# Start Torii API in background
echo -e "${YELLOW}Starting Torii API on port 3000...${NC}"
cd torii-api
npm start > /tmp/torii-api.log 2>&1 &
TORII_PID=$!
cd ..

# Wait for service to be ready
echo "Waiting for Torii API to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Torii API is ready${NC}"
        break
    fi
    sleep 1
done

# Run Torii API tests
run_test "Torii API Tests" "npm test" "torii-api"

# Test 2: Solana Fetcher
echo -e "${CYAN}═══ TEST 2: Solana Fetcher Tests ═══${NC}"
echo ""
run_test "Solana Fetcher Tests" "npm test" "solana-fetcher"

# Test 3: Agent Auditor
echo -e "${CYAN}═══ TEST 3: Agent Auditor Tests ═══${NC}"
echo ""

# Create a minimal test runner for agent-auditor
cat > agent-auditor/run-test.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
npx tsx test.ts
EOF
chmod +x agent-auditor/run-test.sh

run_test "Agent Auditor Tests" "./run-test.sh" "agent-auditor"

# Test 4: Integration Test (if we have time)
echo -e "${CYAN}═══ TEST 4: Integration Flow Test ═══${NC}"
echo ""

# Create simple integration test
cat > integration-test.mjs << 'EOF'
#!/usr/bin/env node
import fetch from 'node:fetch';

const BASE_URL = 'http://localhost:3000';

async function test() {
  console.log('Testing integration flow...');
  
  // Test 1: Health check
  const health = await fetch(`${BASE_URL}/health`);
  if (!health.ok) throw new Error('Health check failed');
  console.log('✅ Health check passed');
  
  // Test 2: Token classification
  const classifyRes = await fetch(`${BASE_URL}/api/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'Governance token for DAO voting'
    })
  });
  
  if (!classifyRes.ok) throw new Error('Classification failed');
  const result = await classifyRes.json();
  
  if (!result.data || !result.data.classification) {
    throw new Error('Invalid response structure');
  }
  
  console.log('✅ Classification test passed');
  console.log(`   Classification: ${result.data.classification}`);
  console.log(`   Risk: ${result.data.riskLevel}`);
  
  // Test 3: Performance test (5 iterations)
  console.log('\nPerformance test (5 iterations)...');
  const times = [];
  
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    await fetch(`${BASE_URL}/api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Test token' })
    });
    times.push(Date.now() - start);
  }
  
  const avg = times.reduce((a, b) => a + b) / times.length;
  console.log(`✅ Average response time: ${avg.toFixed(0)}ms`);
  console.log(`   Target: <2000ms - ${avg < 2000 ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  return avg < 2000;
}

test()
  .then(passed => {
    console.log('\n✅ Integration tests completed successfully');
    process.exit(passed ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Integration test failed:', err.message);
    process.exit(1);
  });
EOF

run_test "Integration Flow Test" "node integration-test.mjs" "."

# Cleanup
echo -e "${YELLOW}Cleaning up...${NC}"
kill $TORII_PID 2>/dev/null || true

# Summary
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Test Summary${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Total Tests: $((PASSED + FAILED))"
echo -e "  ${GREEN}Passed: ${PASSED}${NC}"
echo -e "  ${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    exit 1
fi
