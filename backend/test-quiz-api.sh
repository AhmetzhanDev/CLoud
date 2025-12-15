#!/bin/bash

# Test Quiz API endpoints
BASE_URL="http://localhost:3000/api"

echo "=== Testing Quiz API ==="
echo ""

# First, we need an article ID. Let's get the first article
echo "1. Getting articles..."
ARTICLES_RESPONSE=$(curl -s "$BASE_URL/articles?limit=1")
ARTICLE_ID=$(echo $ARTICLES_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ARTICLE_ID" ]; then
  echo "❌ No articles found. Please upload an article first."
  exit 1
fi

echo "✓ Found article: $ARTICLE_ID"
echo ""

# Test 1: Generate quiz
echo "2. Generating quiz for article..."
QUIZ_RESPONSE=$(curl -s -X POST "$BASE_URL/quiz/generate" \
  -H "Content-Type: application/json" \
  -d "{
    \"articleId\": \"$ARTICLE_ID\",
    \"questionCount\": 5
  }")

echo "$QUIZ_RESPONSE" | jq '.'
QUIZ_ID=$(echo $QUIZ_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$QUIZ_ID" ]; then
  echo "❌ Failed to generate quiz"
  exit 1
fi

echo "✓ Quiz generated: $QUIZ_ID"
echo ""

# Test 2: Submit quiz answers
echo "3. Submitting quiz answers..."
USER_ID="test-user-123"

# Extract first question ID for testing
QUESTION_ID=$(echo $QUIZ_RESPONSE | grep -o '"id":"[^"]*"' | sed -n '2p' | cut -d'"' -f4)

SUBMIT_RESPONSE=$(curl -s -X POST "$BASE_URL/quiz/submit" \
  -H "Content-Type: application/json" \
  -d "{
    \"quizId\": \"$QUIZ_ID\",
    \"userId\": \"$USER_ID\",
    \"answers\": [
      {
        \"questionId\": \"$QUESTION_ID\",
        \"userAnswer\": \"test answer\"
      }
    ]
  }")

echo "$SUBMIT_RESPONSE" | jq '.'
echo "✓ Quiz submitted"
echo ""

# Test 3: Get user results
echo "4. Getting user results..."
RESULTS_RESPONSE=$(curl -s "$BASE_URL/quiz/results/$USER_ID")
echo "$RESULTS_RESPONSE" | jq '.'
echo "✓ Results retrieved"
echo ""

# Test 4: Get quiz explanations
echo "5. Getting quiz explanations..."
EXPLANATIONS_RESPONSE=$(curl -s "$BASE_URL/quiz/$QUIZ_ID/explanations")
echo "$EXPLANATIONS_RESPONSE" | jq '.'
echo "✓ Explanations retrieved"
echo ""

echo "=== All Quiz API tests completed ==="
