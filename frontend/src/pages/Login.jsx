import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="container min-h-[85vh] flex items-center justify-center py-20 pt-10 animate-fade-in relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <div className="w-full max-w-lg bg-gradient-to-b from-[var(--bg-card)] to-[var(--alt-bg)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] p-8 md:p-12 shadow-2xl relative z-10 backdrop-blur-xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[var(--color-text-bright)] mb-2 tracking-tight">Welcome to KDM</h1>
          <p className="text-[var(--color-text-muted)] font-medium">Access your premium automotive portal.</p>
        </div>

        <div className="flex border-b border-[var(--border-color)] mb-8">
          <button
            className={`flex-1 flex items-center justify-center gap-2 bg-transparent border-none text-[15px] font-bold uppercase tracking-wider py-4 cursor-pointer transition-all duration-300 relative ${isLogin ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)]'}`}
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
          >
            <LogIn size={18} /> Sign In
            {isLogin && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--color-primary)]"></div>}
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 bg-transparent border-none text-[15px] font-bold uppercase tracking-wider py-4 cursor-pointer transition-all duration-300 relative ${!isLogin ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)]'}`}
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
          >
            <UserPlus size={18} /> Register
            {!isLogin && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--color-primary)]"></div>}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm font-medium flex items-start gap-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="m-0">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-3 rounded-lg mb-6 text-sm font-medium flex items-start gap-2">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <p className="m-0">{success}</p>
          </div>
        )}

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="animate-fade-in flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                className="form-input bg-[var(--bg-main)] border-2 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                className="form-input bg-[var(--bg-main)] border-2 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex justify-end -mt-2">
              <a href="#" className="text-xs font-semibold text-[var(--color-text-dim)] hover:text-[var(--color-primary)] transition-colors no-underline">Forgot Password?</a>
            </div>
            <button type="submit" className="btn btn-primary w-full mt-2">
              Sign In to Account
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="animate-fade-in flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">First Name</label>
                <input
                  type="text"
                  className="form-input bg-[var(--bg-main)] border-2 font-medium"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Last Name</label>
                <input
                  type="text"
                  className="form-input bg-[var(--bg-main)] border-2 font-medium"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                className="form-input bg-[var(--bg-main)] border-2 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Phone Number</label>
              <input
                type="tel"
                className="form-input bg-[var(--bg-main)] border-2 font-medium"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Password</label>
                <input
                  type="password"
                  className="form-input bg-[var(--bg-main)] border-2 font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="form-input bg-[var(--bg-main)] border-2 font-medium"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2">
              Create Account
            </button>
            <p className="text-center text-xs text-[var(--color-text-dim)] mt-2">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
