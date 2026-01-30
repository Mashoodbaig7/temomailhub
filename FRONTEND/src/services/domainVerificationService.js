// Domain Verification Service
// Import domainAPI for fetching verified domains from backend
import { domainAPI, customDomainAPI } from './api';

class DomainVerificationService {
  constructor() {
    this.verifiedDomains = JSON.parse(localStorage.getItem('verifiedDomains')) || [];
    this.pendingVerifications = JSON.parse(localStorage.getItem('pendingVerifications')) || [];
  }

  // Simulate MX record verification
  async verifyMXRecords(domain) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate verification process
        const isVerified = Math.random() > 0.3; // 70% success rate
        const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        if (isVerified) {
          const verifiedDomain = {
            id: verificationId,
            domain: domain,
            status: 'verified',
            verifiedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          };

          this.verifiedDomains.push(verifiedDomain);
          this.saveToStorage();
          resolve(verifiedDomain);
        } else {
          const pendingVerification = {
            id: verificationId,
            domain: domain,
            status: 'pending',
            addedAt: new Date().toISOString(),
            attempts: 1
          };

          this.pendingVerifications.push(pendingVerification);
          this.saveToStorage();
          resolve(pendingVerification);
        }
      }, 1500); // Simulate network delay
    });
  }

  // Check verification status
  checkVerificationStatus(domain) {
    const verified = this.verifiedDomains.find(d => d.domain === domain);
    if (verified) return { ...verified, isVerified: true };

    const pending = this.pendingVerifications.find(d => d.domain === domain);
    if (pending) return { ...pending, isVerified: false };

    return null;
  }

  // Get all verified domains
  getVerifiedDomains() {
    return this.verifiedDomains;
  }

  // NEW: Fetch verified domains from backend API (for Home page)
  // This method fetches ONLY verified domains from the database
  async getVerifiedDomainsFromAPI() {
    try {
      const token = localStorage.getItem('authToken');

      // Only fetch if user is logged in
      if (!token) {
        return [];
      }

      const response = await domainAPI.getAll();
      const customDomainsResponse = await customDomainAPI.getAll();

      const allVerifiedDomains = [];

      // Add verified MX domains
      if (response.success && response.data) {
        // Filter to return ONLY verified domains (isVerified === true)
        const verifiedDomains = response.data
          .filter(domain => domain.isVerified === true)
          .map(domain => ({
            id: domain._id,
            domain: domain.domainName,
            status: 'verified',
            verifiedAt: domain.verifiedAt || domain.lastVerificationAttempt,
            expiresAt: domain.expiresAt, // Include expiration date
            createdAt: domain.createdAt,
            mxStatus: domain.mxVerificationStatus,
            txtStatus: domain.txtVerificationStatus,
            type: 'mx' // Mark as MX domain
          }));

        allVerifiedDomains.push(...verifiedDomains);
      }

      // Add verified Cloudflare domains
      if (customDomainsResponse.success && customDomainsResponse.data) {
        const verifiedCloudflare = customDomainsResponse.data
          .filter(domain => domain.status === 'Active' && domain.emailRoutingEnabled)
          .map(domain => ({
            id: domain._id,
            domain: domain.domainName,
            status: 'verified',
            verifiedAt: domain.updatedAt,
            createdAt: domain.createdAt,
            type: 'cloudflare' // Mark as Cloudflare domain
          }));

        allVerifiedDomains.push(...verifiedCloudflare);
      }

      return allVerifiedDomains;
    } catch (error) {
      console.error('Failed to fetch verified domains from API:', error);
      return [];
    }
  }

  // Get all domains (verified + pending)
  getAllDomains() {
    return {
      verified: this.verifiedDomains,
      pending: this.pendingVerifications
    };
  }

  // Remove a domain
  removeDomain(domain) {
    this.verifiedDomains = this.verifiedDomains.filter(d => d.domain !== domain);
    this.pendingVerifications = this.pendingVerifications.filter(d => d.domain !== domain);
    this.saveToStorage();
  }

  // Retry verification for pending domains
  async retryVerification(domainId) {
    const pending = this.pendingVerifications.find(d => d.id === domainId);
    if (!pending) return null;

    return this.verifyMXRecords(pending.domain);
  }

  // Save to localStorage
  saveToStorage() {
    localStorage.setItem('verifiedDomains', JSON.stringify(this.verifiedDomains));
    localStorage.setItem('pendingVerifications', JSON.stringify(this.pendingVerifications));
  }

  // Clear all domains
  clearAll() {
    this.verifiedDomains = [];
    this.pendingVerifications = [];
    this.saveToStorage();
  }
}

export default new DomainVerificationService();