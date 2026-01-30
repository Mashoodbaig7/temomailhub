import jwt from 'jsonwebtoken';

const tokenVerification = (req, res, next) => {
  // Skip token verification for OPTIONS (CORS preflight) requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ [CORS Preflight] Skipping token verification for ${req.method} ${req.path}`);
    return next();
  }

  try {
    // Try to get token from multiple sources
    // 1. Authorization header (Bearer token)
    let token = null;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // 2. Signed cookies (fallback)
    if (!token && req.signedCookies && req.signedCookies.token) {
      token = req.signedCookies.token;
    }
    
    // 3. Regular cookies (second fallback)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    console.log(`[Token Verification] ${token ? '✅ Token found' : '❌ No token'} for ${req.method} ${req.path}`);

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      // Support both 'id' (user) and 'userId' (admin) fields
      const userId = decoded.userId || decoded.id;
      req.user = { userId, email: decoded.email };
      console.log(`[Token Verified] User: ${decoded.email}, ID: ${userId}`);
      return next();
    } else {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error(`[Token Error] ${error.message}`);
    if (error.name === "TokenExpiredError") {
      res.clearCookie('token');
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Token verification failed", error: error.message });
  }
};

// Named export for new routes
export const verifyToken = tokenVerification;

// Optional token verification - doesn't reject if token is missing, just populates req.user if token exists
export const optionalVerifyToken = (req, res, next) => {
  try {
    // Try to get token from multiple sources
    let token = null;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token && req.signedCookies && req.signedCookies.token) {
      token = req.signedCookies.token;
    }
    
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token, just continue without setting req.user
    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      req.user = { userId: decoded.id, email: decoded.email };
    } else {
      req.user = null;
    }
    
    return next();
  } catch (error) {
    // If token verification fails, just continue without user (don't reject)
    req.user = null;
    return next();
  }
};

// Default export for backward compatibility
export default tokenVerification;