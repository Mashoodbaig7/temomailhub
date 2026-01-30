import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAuthAPI } from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('admin@demo.com');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            console.log('🔐 Attempting admin login with email:', email);
            const data = await adminAuthAPI.login(email, password);
            console.log('📊 Login Response:', data);

            if (data.token) {
                console.log('✅ Admin login successful');
                
                // Store auth token and admin info
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('adminRole', data.user.role);
                localStorage.setItem('adminName', data.user.name);
                localStorage.setItem('adminEmail', data.user.email);
                localStorage.setItem('adminUserId', data.user.userId);
                localStorage.setItem('adminPermissions', JSON.stringify(data.user.permissions));
                localStorage.setItem('isAdminAuthenticated', 'true');

                toast.success('✅ Login successful!');
                
                // Redirect to admin dashboard
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 500);
            } else {
                console.error('❌ Login failed:', data.message);
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            toast.error(error.message || 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-form-wrapper">
                <div className="login-header">
                    <h1>🔐 Admin Login</h1>
                    <p>Enter your admin credentials to access the dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Admin Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={loading}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? '🔄 Logging in...' : '✅ Login'}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="demo-credentials">
                        Demo Account:<br/>
                        📧 admin@demo.com<br/>
                        🔑 admin123
                    </p>
                </div>
            </div>

            <style jsx>{`
                .admin-login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .login-form-wrapper {
                    background: white;
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    width: 100%;
                    max-width: 400px;
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .login-header h1 {
                    color: #1e3a8a;
                    font-size: 28px;
                    margin-bottom: 10px;
                }

                .login-header p {
                    color: #666;
                    font-size: 14px;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    color: #333;
                    font-weight: 600;
                    font-size: 14px;
                }

                .form-group input {
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.3s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #1e3a8a;
                    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
                }

                .form-group input:disabled {
                    background-color: #f5f5f5;
                    cursor: not-allowed;
                }

                .login-btn {
                    padding: 12px;
                    background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin-top: 10px;
                }

                .login-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(30, 58, 138, 0.3);
                }

                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .login-footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                    text-align: center;
                }

                .demo-credentials {
                    color: #666;
                    font-size: 13px;
                    line-height: 1.6;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;
