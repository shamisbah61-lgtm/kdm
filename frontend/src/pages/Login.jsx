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
    <div className="container min-h-[85vh] flex items-center justify-center py-20 animate-fade-in relative">
      <div className="w-full max-w-lg bg-white border border-[#EAEAEA] rounded-3xl p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.04)] relative z-10">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1D1D1F] mb-3 tracking-tight">Welcome to KDM</h1>
          <p className="text-[17px] text-[#86868B] font-medium">Access your premium automotive portal.</p>
        </div>

        <div className="flex border-b border-[#F5F5F7] mb-8">
          <button
            className={`flex-1 flex items-center justify-center gap-2 bg-transparent border-none text-[14px] font-semibold py-4 cursor-pointer transition-all duration-300 relative ${isLogin ? 'text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
          >
            <LogIn size={18} /> Sign In
            {isLogin && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#1D1D1F]"></div>}
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 bg-transparent border-none text-[14px] font-semibold py-4 cursor-pointer transition-all duration-300 relative ${!isLogin ? 'text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
          >
            <UserPlus size={18} /> Register
            {!isLogin && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#1D1D1F]"></div>}
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
              <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Email Address</label>
              <input
                type="email"
                className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Password</label>
              <input
                type="password"
                className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex justify-end -mt-1">
              <a href="#" className="text-[13px] font-semibold text-[#86868B] hover:text-[#1D1D1F] transition-colors no-underline">Forgot Password?</a>
            </div>
            <button type="submit" className="w-full bg-[#1D1D1F] hover:bg-[#333333] text-white py-4 rounded-full text-[15px] font-semibold transition-all active:scale-95 mt-2">
              Sign In to Account
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="animate-fade-in flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">First Name</label>
                <input
                  type="text"
                  className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Last Name</label>
                <input
                  type="text"
                  className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Email Address</label>
              <input
                type="email"
                className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Phone Number</label>
              <input
                type="tel"
                className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Password</label>
                <input
                  type="password"
                  className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#1D1D1F] hover:bg-[#333333] text-white py-4 rounded-full text-[15px] font-semibold transition-all active:scale-95 mt-2">
              Create Account
            </button>
            <p className="text-center text-[12px] text-[#86868B] mt-2">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
