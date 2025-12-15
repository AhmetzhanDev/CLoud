#!/bin/bash

echo "Testing Search API Endpoints"
echo "=============================="
echo ""

# Test arXiv search
echo "1. Testing arXiv search..."
curl -s "http://localhost:3000/api/search/arxiv?query=quantum+computing&maxResults=2" | jq '.' || echo "Failed"
echo ""

# Test Semantic Scholar search
echo "2. Testing Semantic Scholar search..."
curl -s "http://localhost:3000/api/search/semantic-scholar?query=machine+learning&limit=2" | jq '.' || echo "Failed"
echo ""

# Test unified search
echo "3. Testing unified search with filtering..."
curl -s "http://localhost:3000/api/search?query=artificial+intelligence&limit=5&sources=arxiv,semantic-scholar&sortBy=date" | jq '.' || echo "Failed"
echo ""

# Test import endpoint (example payload)
echo "4. Testing import endpoint..."
curl -s -X POST "http://localhost:3000/api/search/import" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "arxiv",
    "sourceId": "2301.00001",
    "title": "Test Article",
    "authors": ["Test Author"],
    "abstract": "This is a test abstract",
    "pdfUrl": "https://arxiv.org/pdf/2301.00001.pdf"
  }' | jq '.' || echo "Failed"
echo ""

echo "=============================="
echo "Tests completed!"
