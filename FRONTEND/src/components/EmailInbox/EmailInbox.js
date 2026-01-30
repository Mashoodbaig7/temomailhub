import React, { useState, useEffect } from 'react';
import './EmailInbox.css';
import { getReceivedEmails, markEmailAsRead, deleteReceivedEmail } from '../../services/emailInboxApi';
import { emailAPI } from '../../services/api';

const EmailInbox = ({ emailAddress, userPlan, onEmailChange, onEmailCountChange }) => {
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [planLimits, setPlanLimits] = useState(null);
    const [attachmentStorage, setAttachmentStorage] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Dropdown states
    const [generatedEmails, setGeneratedEmails] = useState([]);
    const [currentEmailAddress, setCurrentEmailAddress] = useState(emailAddress);
    const [showDropdown, setShowDropdown] = useState(false);

    // Auto-refresh interval (30 seconds)
    const REFRESH_INTERVAL = 30000;

    // Load all generated emails for dropdown
    useEffect(() => {
        loadGeneratedEmails();
        
        // Refresh generated emails list every 10 seconds to detect expired emails
        const emailCheckInterval = setInterval(() => {
            loadGeneratedEmails();
        }, 10000); // 10 seconds
        
        return () => clearInterval(emailCheckInterval);
    }, []);

    // Load emails when emailAddress or currentEmailAddress changes
    useEffect(() => {
        if (currentEmailAddress) {
            loadEmails();

            // Set up auto-refresh
            const interval = setInterval(() => {
                loadEmails(true);
            }, REFRESH_INTERVAL);

            return () => clearInterval(interval);
        }
    }, [currentEmailAddress]);

    // Update currentEmailAddress when prop changes (auto-select new email)
    useEffect(() => {
        if (emailAddress && emailAddress !== currentEmailAddress) {
            setCurrentEmailAddress(emailAddress);
            // Refresh the dropdown list when new email is generated
            loadGeneratedEmails();
            if (onEmailChange) {
                onEmailChange(emailAddress);
            }
        }
    }, [emailAddress]);

    const loadGeneratedEmails = async () => {
        try {
            const sid = localStorage.getItem('sessionId') || 'anonymous';
            const response = await emailAPI.getActiveEmails(sid);

            if (response.success && response.data) {
                const activeEmails = response.data;
                setGeneratedEmails(activeEmails);
                
                // Notify parent component about email count
                if (onEmailCountChange) {
                    onEmailCountChange(activeEmails.length);
                }
                
                // Check if current email is still in the active list
                const currentEmailStillActive = activeEmails.find(e => e.emailAddress === currentEmailAddress);
                
                if (currentEmailAddress && !currentEmailStillActive) {
                    // Current email has expired, switch to another or clear
                    if (activeEmails.length > 0) {
                        const nextEmail = activeEmails[0].emailAddress;
                        console.log(`Current email expired, switching to: ${nextEmail}`);
                        setCurrentEmailAddress(nextEmail);
                        setEmails([]);
                        setPlanLimits(null);
                        setAttachmentStorage(null);
                        if (onEmailChange) {
                            onEmailChange(nextEmail);
                        }
                    } else {
                        // No active emails left, clear everything
                        console.log('All emails expired, clearing inbox');
                        setCurrentEmailAddress(null);
                        setEmails([]);
                        setPlanLimits(null);
                        setAttachmentStorage(null);
                    }
                }
                
                return activeEmails;
            }
        } catch (err) {
            console.error('Failed to load generated emails:', err);
        }
    };

    const loadEmails = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError(null);
            const response = await getReceivedEmails(currentEmailAddress);

            if (response.success) {
                setEmails(response.data.emails || []);
                setPlanLimits(response.data.planLimits);
                setAttachmentStorage(response.data.attachmentStorage);
            } else {
                // Handle expired email case
                if (response.expired || response.message?.includes('expired')) {
                    handleExpiredEmail();
                } else {
                    setError(response.message || 'Failed to load emails');
                }
            }
        } catch (err) {
            // Handle 410 Gone status (expired) - don't log to console
            if (err.response?.status === 410) {
                handleExpiredEmail();
            } else {
                console.error('Load emails error:', err);
                setError(err.message || 'Failed to load emails');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleExpiredEmail = async () => {
        // Immediately clear current email display
        setEmails([]);
        setPlanLimits(null);
        setAttachmentStorage(null);
        setError(null);

        // Refresh the generated emails list from server
        const updatedEmails = await loadGeneratedEmails();
        
        // The loadGeneratedEmails function already handles switching to another email
        // If no emails returned, the component will hide itself on next render
    };

    const handleEmailSelect = (email) => {
        setCurrentEmailAddress(email.emailAddress);
        setShowDropdown(false);
        setSelectedEmail(null); // Reset selected email when switching inboxes
        if (onEmailChange) {
            onEmailChange(email.emailAddress);
        }
    };

    const handleEmailClick = async (email) => {
        setSelectedEmail(email);

        // Mark as read if not already
        if (!email.isRead) {
            try {
                await markEmailAsRead(email._id);
                setEmails(prev => prev.map(e =>
                    e._id === email._id ? { ...e, isRead: true } : e
                ));
            } catch (err) {
                console.error('Mark as read error:', err);
            }
        }
    };

    const handleDeleteEmail = async (emailId, event) => {
        event.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this email?')) {
            return;
        }

        try {
            await deleteReceivedEmail(emailId);
            setEmails(prev => prev.filter(e => e._id !== emailId));
            if (selectedEmail && selectedEmail._id === emailId) {
                setSelectedEmail(null);
            }
        } catch (err) {
            console.error('Delete email error:', err);
            alert('Failed to delete email');
        }
    };

    const handleRefresh = () => {
        loadEmails(false);
    };

    const handleBackToList = () => {
        setSelectedEmail(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Hide inbox completely if no valid emails exist (all expired)
    if (generatedEmails.length === 0 && !loading) {
        return null;
    }

    // If current email is not in the generated emails list, it has expired
    if (currentEmailAddress && generatedEmails.length > 0 && !generatedEmails.find(e => e.emailAddress === currentEmailAddress)) {
        // Don't render until we've switched to a valid email
        return (
            <div className="inbox-loading">
                <div className="spinner"></div>
                <p>Switching to active email...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="inbox-loading">
                <div className="spinner"></div>
                <p>Loading inbox...</p>
            </div>
        );
    }

    // Show error only for non-expiration errors
    if (error) {
        return (
            <div className="inbox-error">
                <p className="error-message">{error}</p>
                <button onClick={handleRefresh} className="btn-retry">Try Again</button>
            </div>
        );
    }

    // Show storage info based on plan
    const showStorageInfo = () => {
        if (!planLimits) return null;

        if (planLimits.maxEmails === 0) {
            return (
                <div className="storage-info free-plan">
                    <i className="fas fa-info-circle"></i>
                    <p>
                        <strong>{userPlan || 'Free'} Plan:</strong> Emails are not stored.
                        Upgrade to Standard or Premium for email storage and attachments.
                    </p>
                </div>
            );
        }

        return (
            <div className="storage-info">
                <div className="storage-stats">
                    <span className="storage-count">
                        {emails.length} / {planLimits.maxEmails} emails
                    </span>
                    {attachmentStorage && (
                        <span className="storage-attachment">
                            Attachments: {attachmentStorage.usedMB} MB / {attachmentStorage.limitMB} MB ({attachmentStorage.percentage}%)
                        </span>
                    )}
                    {planLimits.isPrivate && (
                        <span className="storage-private">
                            <i className="fas fa-lock"></i> Private
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="email-inbox">
            {/* Email List View */}
            {!selectedEmail ? (
                <div className="inbox-list">
                    <div className="inbox-header">
                        <div className="inbox-header-left">
                            <h3>Inbox</h3>
                            {generatedEmails.length > 1 && (
                                <div className="email-selector">
                                    <button
                                        className="email-dropdown-toggle"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                    >
                                        <span className="selected-email">{currentEmailAddress}</span>
                                        <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
                                    </button>
                                    {showDropdown && (
                                        <div className="email-dropdown-menu">
                                            {generatedEmails.map((email) => (
                                                <div
                                                    key={email._id}
                                                    className={`email-dropdown-item ${email.emailAddress === currentEmailAddress ? 'active' : ''}`}
                                                    onClick={() => handleEmailSelect(email)}
                                                >
                                                    <span className="dropdown-email-text">{email.emailAddress}</span>
                                                    <span className="dropdown-email-plan">{email.userPlan}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleRefresh}
                            className={`btn-refresh ${refreshing ? 'refreshing' : ''}`}
                            disabled={refreshing}
                        >
                            <i className="fas fa-sync-alt"></i>
                            {refreshing ? ' Refreshing...' : ' Refresh'}
                        </button>
                    </div>

                    {showStorageInfo()}

                    {emails.length === 0 ? (
                        <div className="inbox-empty">
                            <i className="fas fa-inbox"></i>
                            <h4>No emails yet</h4>
                            <p>Send an email to <strong>{currentEmailAddress}</strong> to test it out!</p>
                            <p className="empty-note">Emails will appear here automatically (refreshes every 30s)</p>
                        </div>
                    ) : (
                        <div className="email-list">
                            {emails.map(email => (
                                <div
                                    key={email._id}
                                    className={`email-item ${!email.isRead ? 'unread' : ''}`}
                                    onClick={() => handleEmailClick(email)}
                                >
                                    <div className="email-item-header">
                                        <span className="email-from">{email.from}</span>
                                        <span className="email-date">{formatDate(email.receivedAt)}</span>
                                    </div>
                                    <div className="email-subject">
                                        {!email.isRead && <span className="unread-dot"></span>}
                                        {email.subject}
                                    </div>
                                    <div className="email-preview">
                                        {email.textBody.substring(0, 100)}...
                                    </div>
                                    <div className="email-meta">
                                        {email.attachments && email.attachments.length > 0 && (
                                            <span className="has-attachments">
                                                <i className="fas fa-paperclip"></i> {email.attachments.length}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        className="btn-delete-email"
                                        onClick={(e) => handleDeleteEmail(email._id, e)}
                                        title="Delete email"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Email Detail View */
                <div className="inbox-detail">
                    <div className="detail-header">
                        <button onClick={handleBackToList} className="btn-back">
                            <i className="fas fa-arrow-left"></i> Back to Inbox
                        </button>
                        <button
                            className="btn-delete"
                            onClick={(e) => {
                                handleDeleteEmail(selectedEmail._id, e);
                                handleBackToList();
                            }}
                        >
                            <i className="fas fa-trash"></i> Delete
                        </button>
                    </div>

                    <div className="detail-content">
                        <h2 className="detail-subject">{selectedEmail.subject}</h2>

                        <div className="detail-meta">
                            <div className="meta-row">
                                <span className="meta-label">From:</span>
                                <span className="meta-value">{selectedEmail.from}</span>
                            </div>
                            <div className="meta-row">
                                <span className="meta-label">To:</span>
                                <span className="meta-value">{selectedEmail.to}</span>
                            </div>
                            <div className="meta-row">
                                <span className="meta-label">Date:</span>
                                <span className="meta-value">
                                    {new Date(selectedEmail.receivedAt).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                            <div className="detail-attachments">
                                <h4>Attachments ({selectedEmail.attachments.length})</h4>
                                <div className="attachments-list">
                                    {selectedEmail.attachments.map((att, index) => (
                                        <a
                                            key={index}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="attachment-item"
                                        >
                                            <i className="fas fa-file"></i>
                                            <div className="attachment-info">
                                                <span className="attachment-name">{att.filename}</span>
                                                <span className="attachment-size">{formatFileSize(att.size)}</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="detail-body">
                            {selectedEmail.htmlBody ? (
                                <iframe
                                    srcDoc={selectedEmail.htmlBody}
                                    title="Email content"
                                    sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                                    className="email-html-frame"
                                />
                            ) : (
                                <pre className="email-text">{selectedEmail.textBody}</pre>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailInbox;
