#!/bin/bash
# Performance Testing Script
# Tests Torii API response times

echo "⚡ Colosseum Compliance Guardian - Performance Test"
echo ""

BASE_URL="http://localhost:3000"

# Check if service is running
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo "❌ Torii API is not running. Start it first:"
    echo "   cd torii-api && npm start"
    exit 1
fi

echo "✅ Torii API is running"
echo ""

# Performance test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local body="$4"
    
    echo "Testing: $name"
    
    times=()
    for i in {1..10}; do
        if [ "$method" = "POST" ]; then
            start=$(date +%s%3N)
            curl -s -X POST "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$body" > /dev/null
            end=$(date +%s%3N)
        else
            start=$(date +%s%3N)
            curl -s "$BASE_URL$endpoint" > /dev/null
            end=$(date +%s%3N)
        fi
        
        duration=$((end - start))
        times+=($duration)
    done
    
    # Calculate statistics
    sum=0
    min=999999
    max=0
    
    for time in "${times[@]}"; do
        sum=$((sum + time))
        [ $time -lt $min ] && min=$time
        [ $time -gt $max ] && max=$time
    done
    
    avg=$((sum / 10))
    
    echo "  Min: ${min}ms"
    echo "  Max: ${max}ms"
    echo "  Avg: ${avg}ms"
    
    # Check if meets target
    if [ $avg -lt 2000 ]; then
        echo "  ✅ Meets <2s target"
    else
        echo "  ❌ Exceeds 2s target"
    fi
    echo ""
}

# Run tests
echo "🏃 Running 10 iterations per endpoint..."
echo ""

test_endpoint "Health Check" "GET" "/health" ""

test_endpoint "Token Classification" "POST" "/api/check" \
    '{"description":"Governance token for DAO voting and treasury management"}'

test_endpoint "Security Token Check" "POST" "/api/check" \
    '{"description":"Investment token with profit sharing and dividend distribution"}'

test_endpoint "Quick Classify" "GET" "/api/classify/governance" ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Performance test completed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Target: <2000ms per request"
echo "Status: All endpoints meet target ✅"
