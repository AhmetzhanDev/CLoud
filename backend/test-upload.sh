#!/bin/bash

# Test the article upload endpoint

echo "Testing article upload API..."
echo ""

# Test 1: Upload without file (should fail)
echo "Test 1: Upload without file (should return 400)"
curl -X POST http://localhost:3000/api/articles/upload \
  -H "Content-Type: multipart/form-data" \
  2>/dev/null | head -5
echo ""
echo ""

# Test 2: Get all articles (should be empty initially)
echo "Test 2: Get all articles"
curl -s http://localhost:3000/api/articles | head -5
echo ""
echo ""

# Test 3: Upload from URL (invalid URL should fail)
echo "Test 3: Upload from invalid URL (should return 400)"
curl -X POST http://localhost:3000/api/articles/url \
  -H "Content-Type: application/json" \
  -d '{"url": "not-a-valid-url"}' \
  2>/dev/null | head -5
echo ""
echo ""

# Test 4: Get article by non-existent ID (should return 404)
echo "Test 4: Get non-existent article (should return 404)"
curl -s http://localhost:3000/api/articles/test-id | head -5
echo ""
echo ""

echo "✅ Basic API tests completed!"
