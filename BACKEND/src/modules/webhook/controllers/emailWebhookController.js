import { simpleParser } from 'mailparser';
import ReceivedEmail from '../../../models/ReceivedEmailModel.js';
import TempEmail from '../../../models/TempEmailModel.js';
import CustomDomain from '../../../models/CustomDomainModel.js';
import { uploadFileToCloudinary } from '../../../config/cloudinary.js';
import { ENV } from '../../../constants/index.js';

/**
 * Plan Limits Configuration
 * Note: Anonymous and Free users can receive ONLY 1 email per generated temp email
 * - No FIFO rule applies - if inbox has 1 email, new emails are rejected
 * - User must delete the existing email to receive a new one
 */
const PLAN_LIMITS = {
    Anonymous: {
        maxEmails: 1,           // Can receive only 1 email (no FIFO)
        maxAttachmentSize: 0,   // No attachments support
        isPrivate: false,       // Public inbox
        allowOverwrite: false   // Do NOT overwrite existing emails (no FIFO)
    },
    Free: {
        maxEmails: 1,           // Can receive only 1 email (no FIFO)
        maxAttachmentSize: 0,   // No attachments support
        isPrivate: false,       // Public inbox
        allowOverwrite: false   // Do NOT overwrite existing emails (no FIFO)
    },
    Standard: {
        maxEmails: 20,
        maxAttachmentSize: 1 * 1024 * 1024,  // 1 MB
        isPrivate: true,
        allowOverwrite: true    // FIFO rule applies
    },
    Premium: {
        maxEmails: 100,
        maxAttachmentSize: 10 * 1024 * 1024, // 10 MB
        isPrivate: true,
        allowOverwrite: true    // FIFO rule applies
    }
};

/**
 * Webhook endpoint to receive emails from Cloudflare Worker
 */
export const receiveEmailWebhook = async (req, res) => {
    try {
        // Verify webhook secret (supports both x-api-key and x-webhook-secret)
        const apiKey = req.headers['x-api-key'] || req.headers['x-webhook-secret'];
        const expectedSecret = ENV.EMAIL_WEBHOOK_SECRET || ENV.WEBHOOK_SECRET;

        if (!apiKey || apiKey !== expectedSecret) {
            console.error('Invalid webhook secret/API key');
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const emailData = req.body;

        // Check if raw email string is provided
        let parsedEmail;
        if (emailData.raw) {
            console.log('Parsing raw email string with mailparser...');
            try {
                parsedEmail = await simpleParser(emailData.raw);

                // Extract parsed data
                emailData.from = emailData.from || parsedEmail.from?.text || parsedEmail.from?.value?.[0]?.address;
                emailData.to = emailData.to || parsedEmail.to?.text || parsedEmail.to?.value?.[0]?.address;
                emailData.subject = emailData.subject || parsedEmail.subject || 'No Subject';
                emailData.textBody = emailData.textBody || parsedEmail.text || '';
                emailData.htmlBody = emailData.htmlBody || parsedEmail.html || '';

                // Extract headers
                emailData.headers = emailData.headers || {
                    messageId: parsedEmail.messageId,
                    inReplyTo: parsedEmail.inReplyTo,
                    references: parsedEmail.references
                };

                // Process attachments from parsed email
                if (parsedEmail.attachments && parsedEmail.attachments.length > 0) {
                    emailData.attachments = emailData.attachments || [];
                    for (const attachment of parsedEmail.attachments) {
                        emailData.attachments.push({
                            filename: attachment.filename,
                            contentType: attachment.contentType,
                            size: attachment.size,
                            data: attachment.content.toString('base64')
                        });
                    }
                }
            } catch (parseError) {
                console.error('Failed to parse raw email:', parseError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to parse raw email',
                    error: parseError.message
                });
            }
        }

        // Validate required fields
        if (!emailData.to || !emailData.from) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: to, from'
            });
        }

        console.log(`Webhook received email: ${emailData.to} from ${emailData.from}`);

        // === STEP 4: DYNAMIC DOMAIN SUPPORT ===
        // Extract domain from recipient email address
        const recipientEmail = emailData.to.toLowerCase();
        const recipientDomain = recipientEmail.split('@')[1];
        
        console.log(`Extracted domain from recipient: ${recipientDomain}`);
        
        // First, try to find a custom domain match
        let customDomain = null;
        let tempEmail = null;
        let userId = null;
        
        try {
            customDomain = await CustomDomain.findOne({
                domainName: recipientDomain,
                status: 'Active',
                emailRoutingEnabled: true
            });
            
            if (customDomain) {
                console.log(`✓ Custom domain found: ${customDomain.domainName} (Owner: ${customDomain.userId})`);
                userId = customDomain.userId;
                
                // For custom domains, we'll create a virtual temp email entry or handle differently
                // We still need to associate with a temp email for storage
                // Option 1: Find/create a temp email for this user on this custom domain
                tempEmail = await TempEmail.findOne({
                    emailAddress: recipientEmail,
                    isActive: true
                });
                
                // If no temp email exists for this specific address, create one
                if (!tempEmail) {
                    console.log(`Creating temp email entry for custom domain: ${recipientEmail}`);
                    tempEmail = await TempEmail.create({
                        emailAddress: recipientEmail,
                        userId: customDomain.userId,
                        userPlan: 'Premium', // Custom domain users get premium features
                        isActive: true,
                        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                        isCustomDomain: true,
                        customDomainId: customDomain._id
                    });
                    console.log(`✓ Temp email created for custom domain: ${tempEmail._id}`);
                }
            }
        } catch (customDomainError) {
            console.error('Error checking custom domain:', customDomainError);
        }
        
        // If no custom domain match, fall back to standard temp email lookup
        if (!customDomain) {
            console.log('No custom domain match, checking standard temp emails...');
            tempEmail = await TempEmail.findOne({
                emailAddress: recipientEmail,
                isActive: true
            });
        }

        if (!tempEmail) {
            console.error(`Temp email not found and no custom domain match: ${emailData.to}`);
            return res.status(404).json({
                success: false,
                message: 'Email address not found or inactive'
            });
        }
        
        console.log(`✓ Using temp email: ${tempEmail.emailAddress} (Plan: ${tempEmail.userPlan})`);
        
        // If we found the email via custom domain, emit socket event to the domain owner
        if (customDomain && userId) {
            // Emit socket event to the custom domain owner
            // This will be handled by your existing socket.io implementation
            console.log(`Custom domain email - should emit to userId: ${userId}`);
        }

        // Check plan limits
        const planLimits = PLAN_LIMITS[tempEmail.userPlan] || PLAN_LIMITS.Free;

        // Process attachments based on plan (TOTAL LIMIT PER INBOX)
        const processedAttachments = [];
        if (emailData.attachments && emailData.attachments.length > 0) {
            if (planLimits.maxAttachmentSize === 0) {
                console.log(`Plan ${tempEmail.userPlan} does not support attachments - skipping all attachments`);
            } else {
                // Calculate total attachment storage already used for this inbox
                const existingEmails = await ReceivedEmail.find({ tempEmailId: tempEmail._id });
                let totalUsedStorage = 0;

                for (const email of existingEmails) {
                    if (email.attachments && email.attachments.length > 0) {
                        totalUsedStorage += email.attachments.reduce((sum, att) => sum + att.size, 0);
                    }
                }

                // Calculate TOTAL size of ALL attachments in this incoming email
                const totalAttachmentsSize = emailData.attachments.reduce((sum, att) => sum + att.size, 0);

                console.log(`Attachment storage used: ${(totalUsedStorage / (1024 * 1024)).toFixed(2)} MB / ${(planLimits.maxAttachmentSize / (1024 * 1024)).toFixed(2)} MB`);
                console.log(`Incoming email attachments total size: ${(totalAttachmentsSize / (1024 * 1024)).toFixed(2)} MB`);

                // Check if ALL attachments combined would exceed the limit
                if (totalUsedStorage + totalAttachmentsSize > planLimits.maxAttachmentSize) {
                    console.log(`⚠️  All attachments skipped - total size (${(totalAttachmentsSize / (1024 * 1024)).toFixed(2)} MB) would exceed inbox limit`);
                    console.log(`   Current usage: ${(totalUsedStorage / (1024 * 1024)).toFixed(2)} MB, Limit: ${(planLimits.maxAttachmentSize / (1024 * 1024)).toFixed(2)} MB`);
                    // Don't process any attachments - email will be saved without attachments
                } else {
                    // All attachments fit within limit - upload ALL of them
                    console.log(`✓ All attachments fit within limit - uploading ${emailData.attachments.length} file(s)`);

                    for (const attachment of emailData.attachments) {
                        try {
                            // Convert base64 back to buffer
                            const buffer = Buffer.from(attachment.data, 'base64');

                            // Upload to Cloudinary
                            const uploadResult = await uploadFileToCloudinary(buffer, attachment.filename);

                            processedAttachments.push({
                                filename: attachment.filename,
                                contentType: attachment.contentType,
                                size: attachment.size,
                                url: uploadResult.secure_url,
                                publicId: uploadResult.public_id
                            });

                            console.log(`Attachment uploaded: ${attachment.filename} (${(attachment.size / 1024).toFixed(2)} KB)`);
                        } catch (uploadError) {
                            console.error(`Failed to upload attachment: ${attachment.filename}`, uploadError);
                        }
                    }
                }
            }
        }
        const currentEmailCount = await ReceivedEmail.countDocuments({
            tempEmailId: tempEmail._id
        });

        if (currentEmailCount >= planLimits.maxEmails) {
            // Check if FIFO rule applies to this plan
            if (planLimits.allowOverwrite) {
                // FIFO rule: Delete oldest email to make room for new one
                const oldestEmail = await ReceivedEmail.findOne({
                    tempEmailId: tempEmail._id
                }).sort({ receivedAt: 1 });

                if (oldestEmail) {
                    // Delete attachments from Cloudinary
                    if (oldestEmail.attachments && oldestEmail.attachments.length > 0) {
                        const { deleteFileFromCloudinary } = await import('../../../config/cloudinary.js');
                        for (const att of oldestEmail.attachments) {
                            try {
                                await deleteFileFromCloudinary(att.publicId);
                            } catch (delError) {
                                console.error(`Failed to delete attachment: ${att.publicId}`, delError);
                            }
                        }
                    }

                    await ReceivedEmail.deleteOne({ _id: oldestEmail._id });
                    console.log(`Deleted oldest email due to inbox full (FIFO)`);
                }
            } else {
                // No FIFO rule: Reject new email
                console.log(`Plan ${tempEmail.userPlan} inbox is full (${currentEmailCount}/${planLimits.maxEmails}) - rejecting new email`);
                return res.status(200).json({
                    success: false,
                    message: `Inbox full. ${tempEmail.userPlan} users can only receive ${planLimits.maxEmails} email at a time. Please delete existing email to receive new ones.`,
                    reason: 'INBOX_FULL_NO_FIFO'
                });
            }
        }

        // Sanitize HTML body (basic sanitization - use a proper library in production)
        const sanitizedHtmlBody = sanitizeHtml(emailData.htmlBody || '');

        // Create new received email
        const receivedEmail = await ReceivedEmail.create({
            tempEmailId: tempEmail._id,
            to: emailData.to.toLowerCase(),
            from: emailData.from,
            subject: emailData.subject || 'No Subject',
            textBody: emailData.textBody || '',
            htmlBody: sanitizedHtmlBody,
            attachments: processedAttachments,
            headers: emailData.headers || {},
            receivedAt: emailData.receivedAt ? new Date(emailData.receivedAt) : new Date(),
            isRead: false,
            userPlan: tempEmail.userPlan
        });

        console.log(`Email stored successfully: ${receivedEmail._id}`);

        res.status(201).json({
            success: true,
            message: 'Email received and stored successfully',
            data: {
                emailId: receivedEmail._id,
                to: receivedEmail.to,
                from: receivedEmail.from,
                subject: receivedEmail.subject,
                receivedAt: receivedEmail.receivedAt
            }
        });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process email',
            error: error.message
        });
    }
};

/**
 * Get received emails for a temp email address
 */
export const getReceivedEmails = async (req, res) => {
    try {
        const { emailAddress } = req.params;
        const userId = req.user?.userId || null;
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'anonymous';

        console.log(`[GET EMAILS] Request for: ${emailAddress}`);
        console.log(`[GET EMAILS] userId from req.user:`, userId);
        console.log(`[GET EMAILS] sessionId from header:`, sessionId);

        // Find temp email
        const tempEmail = await TempEmail.findOne({
            emailAddress: emailAddress.toLowerCase(),
            isActive: true
        });

        if (!tempEmail) {
            console.log(`[GET EMAILS] Temp email not found: ${emailAddress}`);
            return res.status(404).json({
                success: false,
                message: 'Temp email not found'
            });
        }

        // Check if temp email has expired
        const now = new Date();
        if (tempEmail.expiresAt && tempEmail.expiresAt < now) {
            console.log(`[GET EMAILS] Temp email expired: ${emailAddress}`);
            return res.status(410).json({
                success: false,
                message: 'This temporary email has expired',
                expired: true,
                expiresAt: tempEmail.expiresAt
            });
        }

        console.log(`[GET EMAILS] TempEmail found - Plan: ${tempEmail.userPlan}, userId: ${tempEmail.userId}, sessionId: ${tempEmail.sessionId}`);

        // Check ownership for private inboxes
        const planLimits = PLAN_LIMITS[tempEmail.userPlan] || PLAN_LIMITS.Free;
        if (planLimits.isPrivate) {
            // Check if user owns this inbox via userId OR sessionId
            const userIdMatch = userId && tempEmail.userId && tempEmail.userId.toString() === userId;
            const sessionIdMatch = tempEmail.sessionId && tempEmail.sessionId === sessionId;

            console.log(`[GET EMAILS] Private inbox check - userIdMatch: ${userIdMatch}, sessionIdMatch: ${sessionIdMatch}`);

            const isOwner = userIdMatch || sessionIdMatch;

            if (!isOwner) {
                console.log('[GET EMAILS] Access denied - Details:');
                console.log('  - Request userId:', userId);
                console.log('  - TempEmail userId:', tempEmail.userId);
                console.log('  - Request sessionId:', sessionId);
                console.log('  - TempEmail sessionId:', tempEmail.sessionId);
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: This inbox is private'
                });
            }

            console.log(`[GET EMAILS] Access granted for ${emailAddress}`);
        }

        // Get received emails
        const emails = await ReceivedEmail.find({
            tempEmailId: tempEmail._id
        })
            .sort({ receivedAt: -1 })
            .select('-__v')
            .lean();

        // Calculate total attachment storage used
        let totalAttachmentSize = 0;
        for (const email of emails) {
            if (email.attachments && email.attachments.length > 0) {
                totalAttachmentSize += email.attachments.reduce((sum, att) => sum + att.size, 0);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                emailAddress: tempEmail.emailAddress,
                userPlan: tempEmail.userPlan,
                planLimits: planLimits,
                attachmentStorage: {
                    used: totalAttachmentSize,
                    usedMB: (totalAttachmentSize / (1024 * 1024)).toFixed(2),
                    limit: planLimits.maxAttachmentSize,
                    limitMB: (planLimits.maxAttachmentSize / (1024 * 1024)).toFixed(2),
                    percentage: planLimits.maxAttachmentSize > 0
                        ? ((totalAttachmentSize / planLimits.maxAttachmentSize) * 100).toFixed(1)
                        : 0
                },
                emails: emails
            }
        });

    } catch (error) {
        console.error('Get received emails error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get emails',
            error: error.message
        });
    }
};

/**
 * Mark email as read
 */
export const markEmailAsRead = async (req, res) => {
    try {
        const { emailId } = req.params;
        const userId = req.user?.userId || null;
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'anonymous';

        const email = await ReceivedEmail.findById(emailId);
        if (!email) {
            return res.status(404).json({
                success: false,
                message: 'Email not found'
            });
        }

        // Get temp email to verify ownership
        const tempEmail = await TempEmail.findById(email.tempEmailId);
        if (!tempEmail) {
            return res.status(404).json({
                success: false,
                message: 'Temp email not found'
            });
        }

        // Check ownership for private inboxes
        const planLimits = PLAN_LIMITS[tempEmail.userPlan] || PLAN_LIMITS.Free;
        if (planLimits.isPrivate) {
            const userIdMatch = userId && tempEmail.userId && tempEmail.userId.toString() === userId;
            const sessionIdMatch = tempEmail.sessionId && tempEmail.sessionId === sessionId;

            const isOwner = userIdMatch || sessionIdMatch;

            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        email.isRead = true;
        await email.save();

        res.status(200).json({
            success: true,
            message: 'Email marked as read'
        });

    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark email as read',
            error: error.message
        });
    }
};

/**
 * Delete received email
 */
export const deleteReceivedEmail = async (req, res) => {
    try {
        const { emailId } = req.params;
        const userId = req.user?.userId || null;
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'anonymous';

        const email = await ReceivedEmail.findById(emailId);
        if (!email) {
            return res.status(404).json({
                success: false,
                message: 'Email not found'
            });
        }

        // Get temp email to verify ownership
        const tempEmail = await TempEmail.findById(email.tempEmailId);
        if (!tempEmail) {
            return res.status(404).json({
                success: false,
                message: 'Temp email not found'
            });
        }

        // Check ownership
        const userIdMatch = userId && tempEmail.userId && tempEmail.userId.toString() === userId;
        const sessionIdMatch = tempEmail.sessionId && tempEmail.sessionId === sessionId;

        const isOwner = userIdMatch || sessionIdMatch;

        if (!isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Delete attachments from Cloudinary
        if (email.attachments && email.attachments.length > 0) {
            const { deleteFileFromCloudinary } = await import('../../../config/cloudinary.js');
            for (const att of email.attachments) {
                try {
                    await deleteFileFromCloudinary(att.publicId);
                } catch (delError) {
                    console.error(`Failed to delete attachment: ${att.publicId}`, delError);
                }
            }
        }

        await ReceivedEmail.deleteOne({ _id: emailId });

        res.status(200).json({
            success: true,
            message: 'Email deleted successfully'
        });

    } catch (error) {
        console.error('Delete email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete email',
            error: error.message
        });
    }
};

/**
 * Basic HTML sanitization (use DOMPurify or similar in production)
 */
function sanitizeHtml(html) {
    if (!html) return '';

    // Remove script tags and event handlers
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');

    return sanitized;
}
