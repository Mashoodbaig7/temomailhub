#!/bin/bash
# Email Webhook Testing Script
# Make sure to set EMAIL_WEBHOOK_SECRET in your .env file

# Configuration
BACKEND_URL="http://localhost:8080"
API_KEY="your_secret_here"  # Change this to match your EMAIL_WEBHOOK_SECRET

echo "🧪 Testing Email Webhook Endpoint"
echo "=================================="
echo ""

# Test 1: Raw Email String
echo "Test 1: Sending raw email string..."
curl -X POST "$BACKEND_URL/api/webhook/email" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "from": "test@example.com",
    "to": "user123@your-domain.com",
    "raw": "From: test@example.com\r\nTo: user123@your-domain.com\r\nSubject: Test Email from Raw String\r\nContent-Type: text/plain\r\n\r\nThis is a test email sent as a raw string.\r\nIt should be parsed by mailparser.\r\n"
  }' | json_pp

echo ""
echo "=================================="
echo ""

# Test 2: Pre-parsed Email Data
echo "Test 2: Sending pre-parsed email data..."
curl -X POST "$BACKEND_URL/api/webhook/email" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "from": "sender@example.com",
    "to": "user123@your-domain.com",
    "subject": "Pre-parsed Test Email",
    "textBody": "This is the plain text body of the email.",
    "htmlBody": "<p>This is the <strong>HTML</strong> body of the email.</p>",
    "headers": {
      "messageId": "<test-message-123@example.com>",
      "inReplyTo": null,
      "references": null
    },
    "receivedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }' | json_pp

echo ""
echo "=================================="
echo ""

# Test 3: Invalid API Key (Should fail with 401)
echo "Test 3: Testing invalid API key (should return 401)..."
curl -X POST "$BACKEND_URL/api/webhook/email" \
  -H "Content-Type: application/json" \
  -H "x-api-key: invalid_key" \
  -d '{
    "from": "test@example.com",
    "to": "user123@your-domain.com",
    "subject": "This should fail"
  }' | json_pp

echo ""
echo "=================================="
echo ""
echo "✅ Testing complete!"
