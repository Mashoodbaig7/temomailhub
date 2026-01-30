# Email Webhook Testing Script for Windows PowerShell
# Make sure to set EMAIL_WEBHOOK_SECRET in your .env file

# Configuration
$BACKEND_URL = "http://localhost:8080"
$API_KEY = "your_secret_here"  # Change this to match your EMAIL_WEBHOOK_SECRET

Write-Host "🧪 Testing Email Webhook Endpoint" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Raw Email String
Write-Host "Test 1: Sending raw email string..." -ForegroundColor Yellow
$body1 = @{
    from = "test@example.com"
    to = "user123@your-domain.com"
    raw = "From: test@example.com`r`nTo: user123@your-domain.com`r`nSubject: Test Email from Raw String`r`nContent-Type: text/plain`r`n`r`nThis is a test email sent as a raw string.`r`nIt should be parsed by mailparser.`r`n"
} | ConvertTo-Json

$headers1 = @{
    "Content-Type" = "application/json"
    "x-api-key" = $API_KEY
}

try {
    $response1 = Invoke-RestMethod -Uri "$BACKEND_URL/api/webhook/email" -Method Post -Headers $headers1 -Body $body1
    Write-Host "Response:" -ForegroundColor Green
    $response1 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 2: Pre-parsed Email Data
Write-Host "Test 2: Sending pre-parsed email data..." -ForegroundColor Yellow
$body2 = @{
    from = "sender@example.com"
    to = "user123@your-domain.com"
    subject = "Pre-parsed Test Email"
    textBody = "This is the plain text body of the email."
    htmlBody = "<p>This is the <strong>HTML</strong> body of the email.</p>"
    headers = @{
        messageId = "<test-message-123@example.com>"
        inReplyTo = $null
        references = $null
    }
    receivedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
} | ConvertTo-Json

$headers2 = @{
    "Content-Type" = "application/json"
    "x-api-key" = $API_KEY
}

try {
    $response2 = Invoke-RestMethod -Uri "$BACKEND_URL/api/webhook/email" -Method Post -Headers $headers2 -Body $body2
    Write-Host "Response:" -ForegroundColor Green
    $response2 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 3: Invalid API Key (Should fail with 401)
Write-Host "Test 3: Testing invalid API key (should return 401)..." -ForegroundColor Yellow
$body3 = @{
    from = "test@example.com"
    to = "user123@your-domain.com"
    subject = "This should fail"
} | ConvertTo-Json

$headers3 = @{
    "Content-Type" = "application/json"
    "x-api-key" = "invalid_key"
}

try {
    $response3 = Invoke-RestMethod -Uri "$BACKEND_URL/api/webhook/email" -Method Post -Headers $headers3 -Body $body3
    Write-Host "Response:" -ForegroundColor Green
    $response3 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Expected Error (401 Unauthorized):" -ForegroundColor Green
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Testing complete!" -ForegroundColor Green
