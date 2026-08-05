import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    const payload = {
      email,
      password,
      password_confirm: passwordConfirm,
      first_name: firstName,
      last_name: lastName,
      phone,
    };

    const res = await register(payload);
    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="container auth-page animate-fade-in">
      <div className="auth-card">
        <div className="auth-toggle-headers">
          <button
            className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
          >
            Register
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="auth-form animate-fade-in">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary auth-submit-btn" style={{ color: '#000' }}>
              Sign In
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="auth-form animate-fade-in">
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" style={{ color: '#000' }}>
              Create Account
            </button>
          </form>
        )}
      </div>

      <style>{`
        .auth-page {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 0;
          min-height: calc(100vh - 200px);
        }
        .auth-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: var(--glass-shadow);
        }
        .auth-toggle-headers {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 30px;
        }
        .auth-toggle-btn {
          flex: 1;
          background: none;
          border: none;
          color: var(--color-text-dim);
          font-family: var(--font-heading);
          font-size: 20px;
          font-weight: 600;
          padding: 12px 0;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .auth-toggle-btn.active {
          color: var(--color-primary);
          border-bottom: 2px solid var(--color-primary);
        }
        .form-group-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .auth-submit-btn {
          width: 100%;
          height: 46px;
          margin-top: 10px;
        }
        .error-banner {
          background: rgba(219, 68, 55, 0.15);
          border: 1px solid var(--color-error);
          color: var(--color-error);
          padding: 12px;
          border-radius: var(--border-radius-md);
          margin-bottom: 20px;
          font-size: 13px;
        }
        .success-banner {
          background: rgba(82, 164, 71, 0.15);
          border: 1px solid var(--color-success);
          color: var(--color-success);
          padding: 12px;
          border-radius: var(--border-radius-md);
          margin-bottom: 20px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
