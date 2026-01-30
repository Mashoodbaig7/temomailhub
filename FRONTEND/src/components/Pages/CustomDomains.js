import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customDomainAPI } from '../../services/api';
import './PagesCss/CustomDomains.css';

const CustomDomains = () => {
    const navigate = useNavigate();
    const [domains, setDomains] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [domainInput, setDomainInput] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [verifyingDomains, setVerifyingDomains] = useState({});
    const [expandedInstructions, setExpandedInstructions] = useState({});

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error('Please login to manage custom domains');
            navigate('/sign');
            return;
        }
        fetchDomains();
    }, [navigate]);

    // Fetch all custom domains
    const fetchDomains = async () => {
        try {
            setIsLoading(true);
            const response = await customDomainAPI.getAll();
            if (response.success) {
                setDomains(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching domains:', error);
            toast.error(error.response?.data?.message || 'Failed to load domains');
        } finally {
            setIsLoading(false);
        }
    };

    // Add new domain
    const handleAddDomain = async (e) => {
        e.preventDefault();
        
        // Validate domain
        const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
        if (!domainInput.trim()) {
            toast.error('Please enter a domain name');
            return;
        }
        if (!domainRegex.test(domainInput.toLowerCase())) {
            toast.error('Please enter a valid domain name (e.g., example.com)');
            return;
        }

        try {
            setIsAdding(true);
            const response = await customDomainAPI.add(domainInput.toLowerCase());
            
            if (response.success) {
                toast.success('Domain added successfully! Please update your nameservers.');
                setDomainInput('');
                fetchDomains();
                
                // Auto-expand instructions for the new domain
                setTimeout(() => {
                    setExpandedInstructions(prev => ({
                        ...prev,
                        [response.data.domainId]: true
                    }));
                }, 500);
            }
        } catch (error) {
            console.error('Error adding domain:', error);
            toast.error(error.response?.data?.message || 'Failed to add domain');
        } finally {
            setIsAdding(false);
        }
    };

    // Verify domain
    const handleVerifyDomain = async (domainId, domainName) => {
        try {
            setVerifyingDomains(prev => ({ ...prev, [domainId]: true }));
            const response = await customDomainAPI.verify(domainId);
            
            if (response.success) {
                toast.success(`🎉 ${domainName} is now active and ready to receive emails!`);
                fetchDomains();
            } else {
                // Show detailed error message
                toast.warning(response.message || 'Domain verification pending');
                
                // If there are instructions, expand them
                if (response.instructions) {
                    setExpandedInstructions(prev => ({
                        ...prev,
                        [domainId]: true
                    }));
                }
            }
        } catch (error) {
            console.error('Error verifying domain:', error);
            const errorMsg = error.response?.data?.message || 'Verification failed';
            toast.error(errorMsg);
        } finally {
            setVerifyingDomains(prev => ({ ...prev, [domainId]: false }));
        }
    };

    // Delete domain
    const handleDeleteDomain = async (domainId, domainName) => {
        if (!window.confirm(`Are you sure you want to delete ${domainName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await customDomainAPI.delete(domainId);
            if (response.success) {
                toast.success(`Domain ${domainName} deleted successfully`);
                fetchDomains();
            }
        } catch (error) {
            console.error('Error deleting domain:', error);
            toast.error(error.response?.data?.message || 'Failed to delete domain');
        }
    };

    // Toggle instructions visibility
    const toggleInstructions = (domainId) => {
        setExpandedInstructions(prev => ({
            ...prev,
            [domainId]: !prev[domainId]
        }));
    };

    // Copy nameserver to clipboard
    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { className: 'status-pending', icon: '⏳', text: 'Pending DNS' },
            'Active': { className: 'status-active', icon: '✅', text: 'Active' },
            'Failed': { className: 'status-failed', icon: '❌', text: 'Failed' },
            'Suspended': { className: 'status-suspended', icon: '⚠️', text: 'Suspended' }
        };
        
        const config = statusConfig[status] || statusConfig['Pending'];
        return (
            <span className={`status-badge ${config.className}`}>
                {config.icon} {config.text}
            </span>
        );
    };

    return (
        <div className="custom-domains-container">
            <div className="custom-domains-header">
                <h1>Custom Domains</h1>
                <p className="subtitle">Add your own domain to receive emails through our system</p>
            </div>

            {/* Add Domain Form */}
            <div className="add-domain-section">
                <form onSubmit={handleAddDomain} className="add-domain-form">
                    <div className="input-group">
                        <input
                            type="text"
                            value={domainInput}
                            onChange={(e) => setDomainInput(e.target.value)}
                            placeholder="Enter your domain (e.g., mycustom.com)"
                            className="domain-input"
                            disabled={isAdding}
                        />
                        <button 
                            type="submit" 
                            className="add-domain-btn"
                            disabled={isAdding}
                        >
                            {isAdding ? '⏳ Adding...' : '➕ Add Domain'}
                        </button>
                    </div>
                </form>
                <p className="help-text">
                    💡 You must own this domain and have access to update its nameservers
                </p>
            </div>

            {/* Domains List */}
            <div className="domains-list-section">
                <h2>Your Domains ({domains.length})</h2>
                
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading domains...</p>
                    </div>
                ) : domains.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📧</div>
                        <h3>No Custom Domains Yet</h3>
                        <p>Add your first custom domain to start receiving emails on your own domain</p>
                    </div>
                ) : (
                    <div className="domains-grid">
                        {domains.map((domain) => (
                            <div key={domain._id} className="domain-card">
                                <div className="domain-card-header">
                                    <div className="domain-info">
                                        <h3 className="domain-name">
                                            {domain.domainName}
                                        </h3>
                                        {getStatusBadge(domain.status)}
                                    </div>
                                    <div className="domain-actions">
                                        {domain.status === 'Pending' && (
                                            <button
                                                onClick={() => handleVerifyDomain(domain._id, domain.domainName)}
                                                className="btn-verify"
                                                disabled={verifyingDomains[domain._id]}
                                            >
                                                {verifyingDomains[domain._id] ? '⏳' : '🔍'} Verify
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteDomain(domain._id, domain.domainName)}
                                            className="btn-delete"
                                            title="Delete domain"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="domain-card-body">
                                    {/* Domain Details */}
                                    <div className="domain-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Email Routing:</span>
                                            <span className={`detail-value ${domain.emailRoutingEnabled ? 'text-success' : 'text-muted'}`}>
                                                {domain.emailRoutingEnabled ? '✅ Enabled' : '⏳ Not Configured'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Added:</span>
                                            <span className="detail-value">
                                                {new Date(domain.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {domain.activatedAt && (
                                            <div className="detail-item">
                                                <span className="detail-label">Activated:</span>
                                                <span className="detail-value text-success">
                                                    {new Date(domain.activatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nameservers Section (for Pending domains) */}
                                    {domain.status === 'Pending' && domain.nameservers && domain.nameservers.length > 0 && (
                                        <div className="nameservers-section">
                                            <button 
                                                className="toggle-instructions-btn"
                                                onClick={() => toggleInstructions(domain._id)}
                                            >
                                                {expandedInstructions[domain._id] ? '▼' : '▶'} 
                                                Setup Instructions
                                            </button>
                                            
                                            {expandedInstructions[domain._id] && (
                                                <div className="instructions-content">
                                                    <div className="step-section">
                                                        <h4>📋 Step 1: Update Nameservers</h4>
                                                        <p>Copy these nameservers and update them at your domain registrar:</p>
                                                        <div className="nameservers-list">
                                                            {domain.nameservers.map((ns, index) => (
                                                                <div key={index} className="nameserver-item">
                                                                    <code>{ns}</code>
                                                                    <button
                                                                        onClick={() => copyToClipboard(ns, 'Nameserver')}
                                                                        className="btn-copy"
                                                                        title="Copy to clipboard"
                                                                    >
                                                                        📋
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="step-section">
                                                        <h4>🔧 Step 2: How to Update</h4>
                                                        <ol className="instructions-list">
                                                            <li>Log in to your domain registrar (GoDaddy, Namecheap, etc.)</li>
                                                            <li>Find DNS/Nameserver settings</li>
                                                            <li>Switch to "Custom Nameservers"</li>
                                                            <li>Delete existing nameservers</li>
                                                            <li>Add the Cloudflare nameservers above</li>
                                                            <li>Save changes</li>
                                                        </ol>
                                                    </div>

                                                    <div className="step-section">
                                                        <h4>⏰ Step 3: Wait & Verify</h4>
                                                        <p>DNS propagation typically takes 15-30 minutes. Once updated, click the "Verify" button above.</p>
                                                        <p className="help-text">
                                                            Check propagation status at: <a href="https://www.whatsmydns.net" target="_blank" rel="noopener noreferrer">whatsmydns.net</a>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Active Status Message */}
                                    {domain.status === 'Active' && (
                                        <div className="success-message">
                                            <p>
                                                🎉 <strong>Your domain is active!</strong><br/>
                                                All emails sent to <code>*@{domain.domainName}</code> will be received in your inbox.
                                            </p>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {domain.status === 'Failed' && domain.lastError && (
                                        <div className="error-message">
                                            <p><strong>⚠️ Configuration Failed:</strong></p>
                                            <p className="error-text">{domain.lastError}</p>
                                            <button
                                                onClick={() => handleVerifyDomain(domain._id, domain.domainName)}
                                                className="btn-retry"
                                            >
                                                🔄 Retry Verification
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="info-section">
                <h3>📚 How It Works</h3>
                <div className="info-grid">
                    <div className="info-card">
                        <div className="info-icon">1️⃣</div>
                        <h4>Add Domain</h4>
                        <p>Enter your domain name to get started</p>
                    </div>
                    <div className="info-card">
                        <div className="info-icon">2️⃣</div>
                        <h4>Update DNS</h4>
                        <p>Change nameservers at your registrar</p>
                    </div>
                    <div className="info-card">
                        <div className="info-icon">3️⃣</div>
                        <h4>Verify</h4>
                        <p>Wait for DNS propagation and verify</p>
                    </div>
                    <div className="info-card">
                        <div className="info-icon">4️⃣</div>
                        <h4>Receive Emails</h4>
                        <p>Start receiving emails on your domain!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomDomains;
