import React, { useState } from 'react';
import API from '../../Config/API';
const AdminLogin = () => {
  const [user,SetUser] = useState({
    username:"",
    Password:""
  })
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    setIsLoading(true);
    
    const res = await API.post("/api/admin_auth",user);
    console.log(res.data);
    setTimeout(() => {
      console.log('Admin login attempt:', { email, password, rememberMe });
      setIsLoading(false);
      alert('Admin login successful (demo)');
      
    }, 1500);
    } catch (error) {
        
    }
    
    
    
  };

  return (
    <div className="position-relative min-vh-100 d-flex align-items-center justify-content-center p-3" style={{
      background: 'linear-gradient(135deg, #e8f0fe 0%, #d4e4fc 100%)',
      overflow: 'hidden'
    }}>
      {/* Animated Background Blobs */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="position-absolute rounded-circle" style={{
          width: '400px',
          height: '400px',
          background: '#1976d2',
          opacity: 0.15,
          top: '-150px',
          right: '-100px',
          filter: 'blur(70px)',
          animation: 'float 20s infinite ease-in-out'
        }}></div>
        <div className="position-absolute rounded-circle" style={{
          width: '350px',
          height: '350px',
          background: '#2e7d32',
          opacity: 0.15,
          bottom: '-120px',
          left: '-80px',
          filter: 'blur(70px)',
          animation: 'float 22s infinite ease-in-out reverse'
        }}></div>
        <div className="position-absolute rounded-circle" style={{
          width: '300px',
          height: '300px',
          background: '#ffffff',
          opacity: 0.4,
          top: '40%',
          left: '30%',
          filter: 'blur(60px)',
          animation: 'float 18s infinite ease-in-out'
        }}></div>
      </div>

      {/* Login Card */}
      <div className="card border-0 shadow-lg position-relative" style={{
        maxWidth: '460px',
        width: '100%',
        borderRadius: '2rem',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(2px)',
        zIndex: 1,
        border: '1px solid rgba(46, 125, 50, 0.15)'
      }}>
        <div className="card-body p-4 p-md-5">
          {/* Brand Header */}
          <div className="text-center mb-4">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <div className="d-inline-flex align-items-center justify-content-center p-2 rounded-3" style={{
                background: 'linear-gradient(145deg, #2e7d32, #1b5e20)',
                boxShadow: '0 6px 12px -6px rgba(46, 125, 50, 0.3)'
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2L4 9L16 16L28 9L16 2Z" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1.2"/>
                  <path d="M4 15L16 22L28 15" stroke="#1976D2" strokeWidth="1.5" fill="none"/>
                  <path d="M4 22L16 29L28 22" stroke="#0D47A1" strokeWidth="1.5" fill="none"/>
                  <circle cx="16" cy="16" r="2" fill="white"/>
                </svg>
              </div>
              <span className="fw-bold fs-2" style={{ color: '#0a2540', letterSpacing: '-0.5px' }}>
                Eco<span style={{ color: '#2e7d32' }}>Bridge</span>
              </span>
            </div>
            <span className="badge px-3 py-2 rounded-pill" style={{
              background: '#e9f5eb',
              color: '#2e7d32',
              fontSize: '0.75rem',
              fontWeight: 500
            }}>
              <i className="fas fa-shield-alt me-1"></i> Admin Portal
            </span>
          </div>

          {/* Welcome Section */}
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2" style={{
              background: 'linear-gradient(120deg, #0d47a1, #2e7d32)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Admin Access
            </h2>
            <p className="text-secondary small">Sign in to manage your green future</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary">
                <i className="fas fa-envelope text-success me-2" style={{ color: '#2e7d32' }}></i>
                Email address
              </label>
              <input
                type="text"
                className="form-control py-2 px-3"
                style={{
                  borderRadius: '1rem',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '0.95rem'
                }}
                placeholder="admin@ecobridge.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary">
                <i className="fas fa-lock text-success me-2" style={{ color: '#2e7d32' }}></i>
                Password
              </label>
              <input
                type="password"
                className="form-control py-2 px-3"
                style={{
                  borderRadius: '1rem',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '0.95rem'
                }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberCheck"
                  style={{ accentColor: '#2e7d32', cursor: 'pointer' }}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label small text-secondary" htmlFor="rememberCheck">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-decoration-none small fw-semibold" style={{ color: '#1976d2' }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn w-100 py-2 fw-semibold text-white border-0 mb-3"
              style={{
                background: 'linear-gradient(95deg, #1976d2, #1565c0)',
                borderRadius: '2rem',
                boxShadow: '0 8px 18px -8px rgba(25, 118, 210, 0.4)',
                transition: 'all 0.25s ease'
              }}
              disabled={isLoading}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isLoading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In →'
              )}
            </button>

            <p className="text-center small text-secondary mb-0">
              Don't have an account?{' '}
              <a href="#" className="text-decoration-none fw-semibold" style={{ color: '#2e7d32' }}>
                Create account
              </a>
            </p>
          </form>

          {/* Divider */}
          <div className="position-relative text-center my-4">
            <hr className="text-secondary" style={{ opacity: 0.3 }} />
            <span className="position-absolute top-50 start-50 translate-middle px-3 bg-white small text-secondary" style={{ fontSize: '0.75rem' }}>
              or continue with
            </span>
          </div>

          {/* Social Login */}
          <div className="d-flex gap-3">
            <button className="btn btn-outline-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2" style={{ borderRadius: '2rem', borderColor: '#dee5ed' }}>
              <i className="fab fa-google text-danger"></i>
              <span className="small fw-semibold">Google</span>
            </button>
            <button className="btn btn-outline-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2" style={{ borderRadius: '2rem', borderColor: '#dee5ed' }}>
              <i className="fab fa-microsoft" style={{ color: '#2f73b6' }}></i>
              <span className="small fw-semibold">Microsoft</span>
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-center small text-secondary mt-4 mb-0">
            Protected by <span style={{ color: '#1976d2', fontWeight: 600 }}>blue</span> &{' '}
            <span style={{ color: '#2e7d32', fontWeight: 600 }}>green</span> security
          </p>
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 30px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;