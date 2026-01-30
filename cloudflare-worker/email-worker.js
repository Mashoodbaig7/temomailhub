/**
 * Cloudflare Email Worker
 * 
 * This worker receives emails via Cloudflare Email Routing and forwards them
 * to your backend API for storage and display.
 * 
 * Setup Instructions:
 * 1. Go to Cloudflare Dashboard → Email Routing
 * 2. Add your domain and verify DNS records
 * 3. Create a catch-all rule: "*@yourdomain.com" → Send to Worker
 * 4. Deploy this worker via Wrangler or Dashboard
 * 5. Set the BACKEND_API_URL and WEBHOOK_SECRET as environment variables
 * 
 * Environment Variables Required:
 * - BACKEND_API_URL: Your backend URL (e.g., https://api.temp-mailhub.com)
 * - WEBHOOK_SECRET: Shared secret to authenticate requests from worker to backend
 */

export default {
  async email(message, env, ctx) {
    try {
      // Extract email data
      const emailData = await parseEmail(message, env);

      // Forward to backend API
      await forwardToBackend(emailData, env);

      console.log(`Email processed: ${message.to} from ${message.from}`);
    } catch (error) {
      console.error('Email processing error:', error);
      // Don't throw - we want to accept the email even if processing fails
      // The email will be lost but won't bounce
    }
  }
};

/**
 * Parse incoming email message
 */
async function parseEmail(message, env) {
  const rawEmail = await new Response(message.raw).text();

  // Extract recipient (the temp email address)
  const recipient = message.to;

  // Extract sender
  const sender = message.from;

  // Extract subject
  const subject = message.headers.get('subject') || 'No Subject';

  // Get email body (text and HTML)
  let textBody = '';
  let htmlBody = '';

  try {
    // Try to get text version
    const textReader = message.raw.pipeThrough(new TextDecoderStream()).getReader();
    const textChunks = [];
    while (true) {
      const { done, value } = await textReader.read();
      if (done) break;
      textChunks.push(value);
    }
    textBody = textChunks.join('');

    // Extract HTML if present (simplified - in production use proper MIME parser)
    const htmlMatch = textBody.match(/<html[\s\S]*?<\/html>/i);
    if (htmlMatch) {
      htmlBody = htmlMatch[0];
    }
  } catch (e) {
    console.error('Body parsing error:', e);
    textBody = 'Error parsing email body';
  }

  // Process attachments
  const attachments = [];
  const maxAttachmentSize = 10 * 1024 * 1024; // 10 MB max (Premium plan limit)

  if (message.attachments && message.attachments.length > 0) {
    for (const attachment of message.attachments) {
      try {
        // Get attachment data
        const attachmentData = await attachment.arrayBuffer();
        const size = attachmentData.byteLength;

        // Skip if too large
        if (size > maxAttachmentSize) {
          console.log(`Attachment too large: ${attachment.filename} (${size} bytes)`);
          continue;
        }

        // Convert to base64 for transmission
        const base64Data = arrayBufferToBase64(attachmentData);

        attachments.push({
          filename: sanitizeFilename(attachment.filename || 'unnamed'),
          contentType: attachment.contentType || 'application/octet-stream',
          size: size,
          data: base64Data
        });
      } catch (e) {
        console.error(`Attachment processing error: ${attachment.filename}`, e);
      }
    }
  }

  // Get email headers for spam detection
  const receivedTime = new Date().toISOString();

  return {
    to: recipient,
    from: sanitizeEmail(sender),
    subject: sanitizeText(subject),
    textBody: sanitizeText(textBody),
    htmlBody: htmlBody, // Keep HTML for display but backend should sanitize it
    attachments: attachments,
    receivedAt: receivedTime,
    headers: {
      messageId: message.headers.get('message-id'),
      inReplyTo: message.headers.get('in-reply-to'),
      references: message.headers.get('references')
    }
  };
}

/**
 * Forward email data to backend API
 */
async function forwardToBackend(emailData, env) {
  const backendUrl = env.BACKEND_API_URL || 'http://localhost:8080';
  const webhookSecret = env.WEBHOOK_SECRET || 'your-secret-key';

  const response = await fetch(`${backendUrl}/api/webhook/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': webhookSecret,
      'User-Agent': 'Cloudflare-Email-Worker/1.0'
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Sanitize email address to prevent injection
 */
function sanitizeEmail(email) {
  if (!email) return 'unknown@unknown.com';
  // Remove any potentially dangerous characters
  return email.replace(/[<>;"'\\]/g, '').trim().toLowerCase();
}

/**
 * Sanitize text content
 */
function sanitizeText(text) {
  if (!text) return '';
  // Basic sanitization - remove null bytes and control characters
  return text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename) {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[\/\\?%*:|"<>]/g, '-')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
